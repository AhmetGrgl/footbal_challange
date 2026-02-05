from fastapi import FastAPI, APIRouter, Depends, HTTPException, Header, Response, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import socketio
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Socket.IO setup
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ MODELS ============

class User(BaseModel):
    user_id: str
    email: str
    name: str
    username: str = ""
    age: Optional[int] = None
    gender: Optional[str] = None
    picture: Optional[str] = None
    avatar: str = "⚽"
    language: str = "tr"
    location: Optional[str] = None
    created_at: datetime
    stats: dict = Field(default_factory=lambda: {
        "wins": 0, 
        "losses": 0, 
        "total_games": 0,
        "points": 0,
        "xp": 0,
        "level": 1,
        "rank": "Bronze",
        "win_streak": 0,
        "best_streak": 0
    })
    friends: List[str] = Field(default_factory=list)
    profile_completed: bool = False
    # Joker sistemi
    jokers: dict = Field(default_factory=lambda: {
        "time_extend": 3,  # +5 saniye
        "eliminate_two": 3,  # 2 şık sil
        "reveal_letter": 3,  # Harf aç
        "skip_question": 2   # Soru değiştir
    })
    # Ekonomi
    coins: int = 100
    gems: int = 10
    # Günlük görevler
    daily_tasks: dict = Field(default_factory=dict)
    daily_login_streak: int = 0
    last_login_date: Optional[str] = None

class GameRoom(BaseModel):
    room_id: str
    game_mode: str
    players: List[dict]
    questions: List[dict] = []
    current_question: int = 0
    scores: dict = {}
    status: str = "waiting"  # waiting, playing, finished
    created_at: datetime
    question_start_time: Optional[datetime] = None
    round_answers: dict = {}  # Oyuncuların cevapları

class DailyTask(BaseModel):
    task_id: str
    description: str
    target: int
    current: int = 0
    reward_coins: int
    reward_xp: int
    completed: bool = False

class SessionDataResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str]
    session_token: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    username: str
    age: Optional[int] = None
    gender: Optional[str] = None
    language: str = "tr"

class CompleteProfileRequest(BaseModel):
    username: str
    age: int
    gender: str
    avatar: str = "⚽"
    location: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    username: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    avatar: Optional[str] = None
    location: Optional[str] = None

class Player(BaseModel):
    player_id: str
    name: str
    teams: List[dict]
    market_values: List[dict]
    nationality: str
    position: str

class FriendRequest(BaseModel):
    request_id: str
    sender_id: str
    receiver_id: str
    status: str
    created_at: datetime

# ============ AUTH UTILS ============

async def get_current_user(request: Request) -> Optional[dict]:
    """Get current user from session token in cookie or Authorization header"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    if not session_token:
        logger.info("No session token found")
        return None
    
    logger.info(f"Looking up session: {session_token[:20]}...")
    
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session:
        logger.info("Session not found in database")
        return None
    
    expires_at = session["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        await db.user_sessions.delete_one({"session_token": session_token})
        logger.info("Session expired")
        return None
    
    user_doc = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        logger.info("User not found")
        return None
    
    logger.info(f"Found user: {user_doc.get('email')}")
    return user_doc

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def calculate_rank(points: int) -> str:
    """Calculate rank based on points"""
    if points >= 1000:
        return "Diamond"
    elif points >= 500:
        return "Gold"
    elif points >= 200:
        return "Silver"
    else:
        return "Bronze"

# ============ AUTH ROUTES ============

@api_router.post("/auth/session")
async def process_session_id(
    x_session_id: str = Header(..., alias="X-Session-ID"),
    response: Response = None
):
    """Exchange session_id for user data and session_token"""
    try:
        logger.info(f"Processing session_id: {x_session_id[:20]}...")
        async with httpx.AsyncClient() as http_client:
            resp = await http_client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": x_session_id}
            )
            resp.raise_for_status()
            user_data = resp.json()
        
        session_data = SessionDataResponse(**user_data)
        logger.info(f"Got session data for: {session_data.email}")
        
        # Check if user exists
        existing_user = await db.users.find_one(
            {"email": session_data.email},
            {"_id": 0}
        )
        
        if not existing_user:
            # Create new user - needs to complete profile
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            new_user = {
                "user_id": user_id,
                "email": session_data.email,
                "name": session_data.name,
                "username": "",
                "picture": session_data.picture,
                "avatar": "⚽",
                "age": None,
                "gender": None,
                "location": None,
                "language": "tr",
                "created_at": datetime.now(timezone.utc),
                "stats": {"wins": 0, "losses": 0, "total_games": 0, "points": 0, "rank": "Bronze"},
                "friends": [],
                "profile_completed": False
            }
            await db.users.insert_one(new_user)
            user_id_to_use = user_id
            logger.info(f"Created new user: {user_id}")
        else:
            user_id_to_use = existing_user["user_id"]
            logger.info(f"Found existing user: {user_id_to_use}")
        
        # Create session
        await db.user_sessions.insert_one({
            "user_id": user_id_to_use,
            "session_token": session_data.session_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "created_at": datetime.now(timezone.utc)
        })
        
        response.set_cookie(
            key="session_token",
            value=session_data.session_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=7*24*60*60,
            path="/"
        )
        
        return session_data
    
    except httpx.HTTPError as e:
        logger.error(f"Failed to exchange session_id: {e}")
        raise HTTPException(status_code=400, detail="Invalid session_id")

@api_router.post("/auth/register")
async def register(data: RegisterRequest, response: Response):
    """Register with email/password"""
    import re
    logger.info(f"Register attempt for: {data.email}")
    
    # Validate username format
    if not data.username or len(data.username) < 3 or len(data.username) > 20:
        raise HTTPException(status_code=400, detail="Kullanıcı adı 3-20 karakter olmalı")
    
    if not re.match(r'^[a-zA-Z0-9]+$', data.username):
        raise HTTPException(status_code=400, detail="Kullanıcı adı sadece harf ve rakam içerebilir")
    
    # Validate password
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Şifre en az 6 karakter olmalı")
    
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı")
    
    # Check username uniqueness (case-insensitive)
    username_lower = data.username.lower()
    username_exists = await db.users.find_one({"username": username_lower}, {"_id": 0})
    if username_exists:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten alınmış")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(data.password)
    
    new_user = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "username": username_lower,
        "picture": None,
        "avatar": "⚽",
        "age": data.age,
        "gender": data.gender,
        "location": None,
        "language": data.language,
        "password_hash": hashed_pw,
        "created_at": datetime.now(timezone.utc),
        "stats": {"wins": 0, "losses": 0, "total_games": 0, "points": 0, "rank": "Bronze"},
        "friends": [],
        "profile_completed": True
    }
    await db.users.insert_one(new_user)
    logger.info(f"Created user: {user_id}")
    
    session_token = f"session_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7*24*60*60,
        path="/"
    )
    
    return {"user_id": user_id, "session_token": session_token}

@api_router.post("/auth/complete-profile")
async def complete_profile(data: CompleteProfileRequest, request: Request):
    """Complete profile after Google OAuth"""
    logger.info(f"Complete profile request: {data.username}")
    
    user = await get_current_user(request)
    if not user:
        logger.error("Not authenticated - no user found")
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    logger.info(f"Completing profile for user: {user.get('user_id')}")
    
    # Check username uniqueness
    if data.username:
        username_exists = await db.users.find_one(
            {"username": data.username, "user_id": {"$ne": user["user_id"]}}, 
            {"_id": 0}
        )
        if username_exists:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    result = await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "username": data.username,
            "age": data.age,
            "gender": data.gender,
            "avatar": data.avatar,
            "location": data.location,
            "profile_completed": True
        }}
    )
    
    logger.info(f"Profile update result: modified={result.modified_count}")
    return {"message": "Profile completed", "success": True}

@api_router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    """Login with email/password"""
    logger.info(f"Login attempt for: {data.email}")
    
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    session_token = f"session_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7*24*60*60,
        path="/"
    )
    
    logger.info(f"Login successful for: {user['user_id']}")
    return {"user_id": user["user_id"], "session_token": session_token}

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie("session_token")
    return {"message": "Logged out"}

@api_router.get("/auth/check-username")
async def check_username(username: str):
    """Check if username is available and valid"""
    # Validate username format: alphanumeric only, 3-20 chars
    import re
    if not username or len(username) < 3 or len(username) > 20:
        return {"available": False, "error": "Kullanıcı adı 3-20 karakter olmalı"}
    
    if not re.match(r'^[a-zA-Z0-9]+$', username):
        return {"available": False, "error": "Kullanıcı adı sadece harf ve rakam içerebilir"}
    
    existing = await db.users.find_one({"username": username.lower()}, {"_id": 0})
    if existing:
        return {"available": False, "error": "Bu kullanıcı adı zaten alınmış"}
    
    return {"available": True}

@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    """Send password reset email (simulated)"""
    logger.info(f"Forgot password request for: {data.email}")
    
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    
    # Always return success to prevent email enumeration
    # In production, send actual email here
    if user:
        # Generate reset token
        reset_token = f"reset_{uuid.uuid4().hex}"
        await db.password_resets.insert_one({
            "email": data.email,
            "token": reset_token,
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
            "used": False
        })
        logger.info(f"Password reset token created for: {data.email}")
        # In production: send email with reset link
    
    return {"message": "Şifre sıfırlama bağlantısı gönderildi"}

@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    """Reset password with token"""
    logger.info(f"Reset password attempt with token: {data.token[:20]}...")
    
    reset_record = await db.password_resets.find_one({
        "token": data.token,
        "used": False
    })
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Geçersiz veya süresi dolmuş token")
    
    expires_at = reset_record["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token süresi dolmuş")
    
    # Validate new password
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Şifre en az 6 karakter olmalı")
    
    # Update password
    hashed_pw = hash_password(data.new_password)
    await db.users.update_one(
        {"email": reset_record["email"]},
        {"$set": {"password_hash": hashed_pw}}
    )
    
    # Mark token as used
    await db.password_resets.update_one(
        {"token": data.token},
        {"$set": {"used": True}}
    )
    
    logger.info(f"Password reset successful for: {reset_record['email']}")
    return {"message": "Şifre başarıyla değiştirildi"}

# ============ USER ROUTES ============

@api_router.get("/users/profile")
async def get_profile(request: Request):
    """Get user profile with stats"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.put("/users/profile")
async def update_profile(data: UpdateProfileRequest, request: Request):
    """Update user profile"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    update_data = {}
    if data.username:
        existing = await db.users.find_one(
            {"username": data.username, "user_id": {"$ne": user["user_id"]}},
            {"_id": 0}
        )
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        update_data["username"] = data.username
    
    if data.age is not None:
        update_data["age"] = data.age
    if data.gender:
        update_data["gender"] = data.gender
    if data.avatar:
        update_data["avatar"] = data.avatar
    if data.location:
        update_data["location"] = data.location
    
    if update_data:
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": update_data}
        )
    
    return {"message": "Profile updated"}

@api_router.put("/users/language")
async def update_language(request: Request, language: str):
    """Update user language preference"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"language": language}}
    )
    return {"message": "Language updated"}

@api_router.get("/users/search")
async def search_users(username: str, request: Request):
    """Search users by username"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    users = await db.users.find(
        {"username": {"$regex": username, "$options": "i"}, "user_id": {"$ne": user["user_id"]}},
        {"_id": 0, "user_id": 1, "username": 1, "name": 1, "avatar": 1, "stats": 1}
    ).limit(20).to_list(20)
    
    return users

# ============ LEADERBOARD ROUTES ============

@api_router.get("/leaderboard/global")
async def get_global_leaderboard(limit: int = 100):
    """Get global leaderboard"""
    users = await db.users.find(
        {},
        {"_id": 0, "user_id": 1, "username": 1, "name": 1, "avatar": 1, "stats": 1, "location": 1}
    ).sort("stats.points", -1).limit(limit).to_list(limit)
    
    for i, user in enumerate(users):
        user['rank_position'] = i + 1
    
    return users

@api_router.get("/leaderboard/daily")
async def get_daily_leaderboard(limit: int = 100):
    """Get daily leaderboard"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Günlük skor tablosu
    daily_scores = await db.daily_scores.find(
        {"date": today},
        {"_id": 0}
    ).sort("points", -1).limit(limit).to_list(limit)
    
    # Kullanıcı bilgilerini ekle
    for i, score in enumerate(daily_scores):
        user = await db.users.find_one(
            {"user_id": score.get("user_id")},
            {"_id": 0, "username": 1, "name": 1, "avatar": 1}
        )
        if user:
            score.update(user)
        score['rank_position'] = i + 1
    
    return daily_scores

@api_router.get("/leaderboard/weekly")
async def get_weekly_leaderboard(limit: int = 100):
    """Get weekly leaderboard"""
    from datetime import timedelta
    week_start = (datetime.now(timezone.utc) - timedelta(days=datetime.now(timezone.utc).weekday())).strftime("%Y-%m-%d")
    
    weekly_scores = await db.weekly_scores.find(
        {"week_start": week_start},
        {"_id": 0}
    ).sort("points", -1).limit(limit).to_list(limit)
    
    for i, score in enumerate(weekly_scores):
        user = await db.users.find_one(
            {"user_id": score.get("user_id")},
            {"_id": 0, "username": 1, "name": 1, "avatar": 1}
        )
        if user:
            score.update(user)
        score['rank_position'] = i + 1
    
    return weekly_scores

@api_router.get("/leaderboard/friends")
async def get_friends_leaderboard(request: Request):
    """Get friends leaderboard"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    friend_ids = user.get("friends", []) + [user["user_id"]]
    
    friends = await db.users.find(
        {"user_id": {"$in": friend_ids}},
        {"_id": 0, "user_id": 1, "username": 1, "name": 1, "avatar": 1, "stats": 1}
    ).sort("stats.points", -1).to_list(100)
    
    for i, friend in enumerate(friends):
        friend['rank_position'] = i + 1
        friend['is_me'] = friend['user_id'] == user['user_id']
    
    return friends

@api_router.get("/leaderboard/location")
async def get_location_leaderboard(location: str, limit: int = 100):
    """Get location-based leaderboard"""
    users = await db.users.find(
        {"location": location},
        {"_id": 0, "user_id": 1, "username": 1, "avatar": 1, "stats": 1}
    ).sort("stats.points", -1).limit(limit).to_list(limit)
    
    for i, user in enumerate(users):
        user['rank_position'] = i + 1
    
    return users

# ============ DAILY TASKS ============

DAILY_TASKS_TEMPLATE = [
    {"task_id": "play_3_games", "description": "3 oyun oyna", "target": 3, "reward_coins": 50, "reward_xp": 30},
    {"task_id": "win_2_games", "description": "2 oyun kazan", "target": 2, "reward_coins": 80, "reward_xp": 50},
    {"task_id": "correct_10", "description": "10 doğru cevap ver", "target": 10, "reward_coins": 40, "reward_xp": 25},
    {"task_id": "use_joker", "description": "1 joker kullan", "target": 1, "reward_coins": 20, "reward_xp": 15},
    {"task_id": "play_friend", "description": "Arkadaşınla 1 oyun oyna", "target": 1, "reward_coins": 60, "reward_xp": 40},
]

@api_router.get("/daily-tasks")
async def get_daily_tasks(request: Request):
    """Get user's daily tasks"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Bugünün görevlerini kontrol et
    user_tasks = await db.daily_tasks.find_one({
        "user_id": user["user_id"],
        "date": today
    })
    
    if not user_tasks:
        # Yeni günlük görevler oluştur
        import random
        selected_tasks = random.sample(DAILY_TASKS_TEMPLATE, min(3, len(DAILY_TASKS_TEMPLATE)))
        tasks = []
        for task in selected_tasks:
            tasks.append({
                **task,
                "current": 0,
                "completed": False,
                "claimed": False
            })
        
        user_tasks = {
            "user_id": user["user_id"],
            "date": today,
            "tasks": tasks
        }
        await db.daily_tasks.insert_one(user_tasks)
    
    return user_tasks.get("tasks", [])

@api_router.post("/daily-tasks/{task_id}/claim")
async def claim_daily_task_reward(task_id: str, request: Request):
    """Claim reward for completed daily task"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    user_tasks = await db.daily_tasks.find_one({
        "user_id": user["user_id"],
        "date": today
    })
    
    if not user_tasks:
        raise HTTPException(status_code=404, detail="Görevler bulunamadı")
    
    task = next((t for t in user_tasks["tasks"] if t["task_id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Görev bulunamadı")
    
    if not task["completed"]:
        raise HTTPException(status_code=400, detail="Görev henüz tamamlanmadı")
    
    if task["claimed"]:
        raise HTTPException(status_code=400, detail="Ödül zaten alındı")
    
    # Ödülü ver
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$inc": {
            "coins": task["reward_coins"],
            "stats.xp": task["reward_xp"]
        }}
    )
    
    # Görevi claimed olarak işaretle
    await db.daily_tasks.update_one(
        {"user_id": user["user_id"], "date": today, "tasks.task_id": task_id},
        {"$set": {"tasks.$.claimed": True}}
    )
    
    return {"message": "Ödül alındı!", "coins": task["reward_coins"], "xp": task["reward_xp"]}

@api_router.post("/daily-login")
async def daily_login_reward(request: Request):
    """Claim daily login reward"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    last_login = user.get("last_login_date")
    current_streak = user.get("daily_login_streak", 0)
    
    if last_login == today:
        return {"message": "Bugün zaten giriş yaptınız", "streak": current_streak, "already_claimed": True}
    
    # Streak kontrolü
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    if last_login == yesterday:
        new_streak = current_streak + 1
    else:
        new_streak = 1
    
    # Streak bonusu
    base_reward = 10
    streak_bonus = min(new_streak * 5, 50)  # Max 50 bonus
    total_coins = base_reward + streak_bonus
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {
            "$set": {
                "last_login_date": today,
                "daily_login_streak": new_streak
            },
            "$inc": {"coins": total_coins}
        }
    )
    
    return {
        "message": "Günlük giriş ödülü!",
        "streak": new_streak,
        "coins_earned": total_coins,
        "streak_bonus": streak_bonus
    }

# ============ JOKER SHOP ============

@api_router.get("/shop/jokers")
async def get_joker_shop():
    """Get joker shop items"""
    return [
        {"id": "time_extend", "name": "+5 Saniye", "price_coins": 50, "description": "Süreye 5 saniye ekle"},
        {"id": "eliminate_two", "name": "2 Şık Sil", "price_coins": 75, "description": "2 yanlış şıkkı sil"},
        {"id": "reveal_letter", "name": "Harf Aç", "price_coins": 60, "description": "Bir harf göster"},
        {"id": "skip_question", "name": "Soru Geç", "price_coins": 100, "description": "Soruyu atla"},
    ]

@api_router.post("/shop/buy-joker/{joker_id}")
async def buy_joker(joker_id: str, request: Request):
    """Buy a joker from shop"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    prices = {
        "time_extend": 50,
        "eliminate_two": 75,
        "reveal_letter": 60,
        "skip_question": 100
    }
    
    if joker_id not in prices:
        raise HTTPException(status_code=404, detail="Joker bulunamadı")
    
    price = prices[joker_id]
    
    if user.get("coins", 0) < price:
        raise HTTPException(status_code=400, detail="Yetersiz coin")
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {
            "$inc": {
                "coins": -price,
                f"jokers.{joker_id}": 1
            }
        }
    )
    
    return {"message": "Joker satın alındı!", "joker": joker_id}

# ============ USER STATS ============

@api_router.get("/user/stats")
async def get_user_stats(request: Request):
    """Get detailed user statistics"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    stats = user.get("stats", {})
    
    # Lig bilgisi
    points = stats.get("points", 0)
    current_league = stats.get("rank", "Bronze")
    
    # Sonraki lig için gerekli puan
    league_order = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Legend"]
    current_idx = league_order.index(current_league) if current_league in league_order else 0
    
    next_league = league_order[current_idx + 1] if current_idx < len(league_order) - 1 else None
    points_for_next = None
    if next_league:
        league_thresholds = {"Silver": 1000, "Gold": 2500, "Platinum": 5000, "Diamond": 10000, "Legend": 20000}
        points_for_next = league_thresholds.get(next_league, 0) - points
    
    return {
        "stats": stats,
        "coins": user.get("coins", 0),
        "gems": user.get("gems", 0),
        "jokers": user.get("jokers", {}),
        "current_league": current_league,
        "next_league": next_league,
        "points_for_next_league": points_for_next,
        "daily_login_streak": user.get("daily_login_streak", 0)
    }

# ============ GAME STATS UPDATE ============

@api_router.post("/game/finish")
async def finish_game(game_mode: str, won: bool, request: Request):
    """Update user stats after game"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    points_change = 10 if won else -3
    current_points = user.get("stats", {}).get("points", 0)
    new_points = max(0, current_points + points_change)
    new_rank = calculate_rank(new_points)
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {
            "$inc": {
                "stats.total_games": 1,
                "stats.wins" if won else "stats.losses": 1,
                "stats.points": points_change
            },
            "$set": {"stats.rank": new_rank}
        }
    )
    
    return {"points": new_points, "rank": new_rank}

# ============ PLAYERS ROUTES ============

@api_router.get("/players")
async def get_players(limit: int = 200):
    """Get all players"""
    players = await db.players.find({}, {"_id": 0}).limit(limit).to_list(limit)
    return players

@api_router.get("/players/random")
async def get_random_player():
    """Get random player"""
    pipeline = [{"$sample": {"size": 1}}]
    result = await db.players.aggregate(pipeline).to_list(1)
    if result:
        result[0].pop("_id", None)
        return result[0]
    raise HTTPException(status_code=404, detail="No players found")

# ============ CAREER PATH GAME ROUTES ============

from popular_players import POPULAR_PLAYERS
import random

@api_router.get("/career-path/random-player")
async def get_career_path_player(difficulty: str = "all"):
    """Get a random popular player for Career Path game"""
    if difficulty == "all":
        players = POPULAR_PLAYERS
    else:
        players = [p for p in POPULAR_PLAYERS if p.get("difficulty") == difficulty]
    
    if not players:
        players = POPULAR_PLAYERS
    
    player = random.choice(players)
    return player

@api_router.get("/career-path/players")
async def get_all_career_path_players():
    """Get all player names for autocomplete"""
    return [{"name": p["name"], "difficulty": p.get("difficulty", "medium")} for p in POPULAR_PLAYERS]

@api_router.post("/career-path/check-guess")
async def check_career_path_guess(player_name: str, guess: str):
    """Check if guess is correct and provide hints"""
    # Oyuncuyu bul
    player = next((p for p in POPULAR_PLAYERS if p["name"].lower() == player_name.lower()), None)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Doğru mu?
    is_correct = guess.lower().strip() == player["name"].lower()
    
    # Yanlışsa ipucu ver
    hints = []
    if not is_correct:
        # Aynı ülkeden mi?
        guessed_player = next((p for p in POPULAR_PLAYERS if p["name"].lower() == guess.lower().strip()), None)
        if guessed_player:
            if guessed_player["nationality"] == player["nationality"]:
                hints.append(f"✅ Doğru ülke! ({player['nationality']})")
            else:
                hints.append(f"❌ Yanlış ülke")
            
            if guessed_player["position"] == player["position"]:
                hints.append(f"✅ Doğru pozisyon! ({player['position']})")
            else:
                hints.append(f"❌ Yanlış pozisyon")
            
            # Aynı takımda oynadılar mı?
            guessed_teams = set([t["team"] for t in guessed_player.get("team_history", [])])
            player_teams = set([t["team"] for t in player.get("team_history", [])])
            common_teams = guessed_teams.intersection(player_teams)
            if common_teams:
                hints.append(f"🔗 Ortak takım: {list(common_teams)[0]}")
    
    return {
        "correct": is_correct,
        "hints": hints,
        "player_name": player["name"] if is_correct else None
    }

# ============ CAREER PATH LEADERBOARD ============

class CareerPathScoreSubmit(BaseModel):
    score: int
    correct_guesses: int
    total_games: int
    best_streak: int

@api_router.post("/career-path/submit-score")
async def submit_career_path_score(score_data: CareerPathScoreSubmit, request: Request):
    """Submit career path game score"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Kullanıcının kariyer yolu skorunu güncelle
    career_stats = user.get("career_path_stats", {
        "high_score": 0,
        "total_score": 0,
        "games_played": 0,
        "correct_guesses": 0,
        "best_streak": 0
    })
    
    # En yüksek skor kontrolü
    is_new_high_score = score_data.score > career_stats.get("high_score", 0)
    
    # İstatistikleri güncelle
    career_stats["total_score"] = career_stats.get("total_score", 0) + score_data.score
    career_stats["games_played"] = career_stats.get("games_played", 0) + score_data.total_games
    career_stats["correct_guesses"] = career_stats.get("correct_guesses", 0) + score_data.correct_guesses
    
    if is_new_high_score:
        career_stats["high_score"] = score_data.score
    
    if score_data.best_streak > career_stats.get("best_streak", 0):
        career_stats["best_streak"] = score_data.best_streak
    
    # Veritabanını güncelle
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"career_path_stats": career_stats}}
    )
    
    # Coin ekle (her 100 puan için 1 coin)
    coins_earned = score_data.score // 100
    if coins_earned > 0:
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$inc": {"coins": coins_earned}}
        )
    
    return {
        "message": "Score submitted",
        "is_new_high_score": is_new_high_score,
        "high_score": career_stats["high_score"],
        "coins_earned": coins_earned,
        "stats": career_stats
    }

@api_router.get("/career-path/leaderboard")
async def get_career_path_leaderboard(limit: int = 50):
    """Get career path leaderboard"""
    # En yüksek skorlara göre sırala
    users = await db.users.find(
        {"career_path_stats.high_score": {"$gt": 0}},
        {
            "_id": 0, 
            "user_id": 1, 
            "username": 1, 
            "avatar": 1,
            "career_path_stats": 1
        }
    ).sort("career_path_stats.high_score", -1).limit(limit).to_list(limit)
    
    leaderboard = []
    for i, user in enumerate(users):
        stats = user.get("career_path_stats", {})
        leaderboard.append({
            "rank": i + 1,
            "user_id": user.get("user_id"),
            "username": user.get("username", "Anonim"),
            "avatar": user.get("avatar", "⚽"),
            "high_score": stats.get("high_score", 0),
            "games_played": stats.get("games_played", 0),
            "correct_guesses": stats.get("correct_guesses", 0),
            "best_streak": stats.get("best_streak", 0)
        })
    
    return leaderboard

@api_router.get("/career-path/my-stats")
async def get_my_career_path_stats(request: Request):
    """Get current user's career path stats"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    stats = user.get("career_path_stats", {
        "high_score": 0,
        "total_score": 0,
        "games_played": 0,
        "correct_guesses": 0,
        "best_streak": 0
    })
    
    # Kullanıcının sıralamasını bul
    rank = await db.users.count_documents({
        "career_path_stats.high_score": {"$gt": stats.get("high_score", 0)}
    }) + 1
    
    return {
        "stats": stats,
        "rank": rank,
        "coins": user.get("coins", 0)
    }

# ============ FRIENDS ROUTES ============

@api_router.get("/friends")
async def get_friends(request: Request):
    """Get user's friends list"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    friends_list = user.get("friends", [])
    if not friends_list:
        return []
    
    friends = await db.users.find(
        {"user_id": {"$in": friends_list}},
        {"_id": 0, "user_id": 1, "username": 1, "name": 1, "avatar": 1, "stats": 1}
    ).to_list(100)
    return friends

@api_router.post("/friends/request/{receiver_id}")
async def send_friend_request(receiver_id: str, request: Request):
    """Send friend request"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    friends_list = user.get("friends", [])
    if receiver_id in friends_list:
        raise HTTPException(status_code=400, detail="Already friends")
    
    existing = await db.friend_requests.find_one({
        "sender_id": user["user_id"],
        "receiver_id": receiver_id,
        "status": "pending"
    })
    if existing:
        raise HTTPException(status_code=400, detail="Request already sent")
    
    request_id = f"req_{uuid.uuid4().hex[:12]}"
    await db.friend_requests.insert_one({
        "request_id": request_id,
        "sender_id": user["user_id"],
        "receiver_id": receiver_id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Friend request sent"}

@api_router.get("/friends/requests")
async def get_friend_requests(request: Request):
    """Get pending friend requests"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    requests = await db.friend_requests.find(
        {"receiver_id": user["user_id"], "status": "pending"},
        {"_id": 0}
    ).to_list(100)
    
    for req in requests:
        sender = await db.users.find_one(
            {"user_id": req["sender_id"]},
            {"_id": 0, "user_id": 1, "username": 1, "name": 1, "avatar": 1}
        )
        req["sender"] = sender
    
    return requests

@api_router.post("/friends/accept/{request_id}")
async def accept_friend_request(request_id: str, request: Request):
    """Accept friend request"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    friend_req = await db.friend_requests.find_one({"request_id": request_id})
    if not friend_req or friend_req["receiver_id"] != user["user_id"]:
        raise HTTPException(status_code=404, detail="Request not found")
    
    await db.friend_requests.update_one(
        {"request_id": request_id},
        {"$set": {"status": "accepted"}}
    )
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$addToSet": {"friends": friend_req["sender_id"]}}
    )
    await db.users.update_one(
        {"user_id": friend_req["sender_id"]},
        {"$addToSet": {"friends": user["user_id"]}}
    )
    
    return {"message": "Friend request accepted"}

# ============ SOCKET.IO HANDLERS ============

matchmaking_queue = {}
active_games = {}  # room_id -> GameRoom data
private_rooms = {}  # room_code -> room_id

# Lig sistemleri
LEAGUES = {
    "Bronze": {"min_points": 0, "max_points": 999, "icon": "🥉"},
    "Silver": {"min_points": 1000, "max_points": 2499, "icon": "🥈"},
    "Gold": {"min_points": 2500, "max_points": 4999, "icon": "🥇"},
    "Platinum": {"min_points": 5000, "max_points": 9999, "icon": "💎"},
    "Diamond": {"min_points": 10000, "max_points": 19999, "icon": "💠"},
    "Legend": {"min_points": 20000, "max_points": float('inf'), "icon": "🏆"}
}

def get_league_from_points(points: int) -> str:
    for league, data in LEAGUES.items():
        if data["min_points"] <= points <= data["max_points"]:
            return league
    return "Bronze"

def calculate_xp_for_level(level: int) -> int:
    return level * 100 + (level - 1) * 50

async def generate_questions(game_mode: str, count: int = 10) -> List[dict]:
    """Generate questions based on game mode"""
    questions = []
    
    # Oyuncu havuzunu al
    players = await db.players.find({}).to_list(500)
    
    if game_mode == "mystery-player":
        # Gizli Oyuncu modu - ipuçları ile tahmin
        import random
        random.shuffle(players)
        for player in players[:count]:
            teams = player.get("team_history", [])
            hints = []
            if teams:
                hints.append(f"Oynadığı takımlardan biri: {teams[0].get('team', 'Bilinmiyor')}")
            if len(teams) > 1:
                hints.append(f"Başka bir takım: {teams[1].get('team', 'Bilinmiyor')}")
            
            # Yanlış şıklar için diğer oyuncuları seç
            wrong_answers = random.sample([p["name"] for p in players if p["name"] != player["name"]], 3)
            options = wrong_answers + [player["name"]]
            random.shuffle(options)
            
            questions.append({
                "question_id": f"q_{uuid.uuid4().hex[:8]}",
                "type": "mystery-player",
                "hints": hints,
                "correct_answer": player["name"],
                "options": options,
                "player_data": player
            })
    
    elif game_mode == "value-guess":
        # Değer Tahmini modu
        import random
        random.shuffle(players)
        for player in players[:count]:
            market_values = player.get("market_values", [])
            if market_values:
                value = market_values[-1].get("value", "10M €")
            else:
                value = "10M €"
            
            # Değer seçenekleri oluştur
            base_value = 10  # Milyon
            options = [f"{base_value}M €", f"{base_value*2}M €", f"{base_value*5}M €", f"{base_value*10}M €"]
            if value not in options:
                options[0] = value
            random.shuffle(options)
            
            questions.append({
                "question_id": f"q_{uuid.uuid4().hex[:8]}",
                "type": "value-guess",
                "player_name": player["name"],
                "correct_answer": value,
                "options": options
            })
    
    elif game_mode == "career-path":
        # Kariyer Yolu - hangi takımlarda oynadı
        import random
        random.shuffle(players)
        for player in players[:count]:
            teams = player.get("team_history", [])
            if len(teams) >= 2:
                correct_teams = [t.get("team", "") for t in teams[:3]]
                all_teams = list(set([t.get("team", "") for p in players for t in p.get("team_history", [])]))
                wrong_teams = random.sample([t for t in all_teams if t not in correct_teams], 3)
                
                options = wrong_teams + [correct_teams[0]]
                random.shuffle(options)
                
                questions.append({
                    "question_id": f"q_{uuid.uuid4().hex[:8]}",
                    "type": "career-path",
                    "player_name": player["name"],
                    "question": f"{player['name']} hangi takımda oynadı?",
                    "correct_answer": correct_teams[0],
                    "options": options
                })
    
    elif game_mode == "letter-hunt":
        # Harf Avı - harflerden oyuncu bul
        import random
        random.shuffle(players)
        for player in players[:count]:
            name = player["name"]
            hidden_name = ""
            revealed_indices = random.sample(range(len(name)), min(3, len(name)))
            for i, char in enumerate(name):
                if i in revealed_indices or char == " ":
                    hidden_name += char
                else:
                    hidden_name += "_"
            
            wrong_answers = random.sample([p["name"] for p in players if p["name"] != name], 3)
            options = wrong_answers + [name]
            random.shuffle(options)
            
            questions.append({
                "question_id": f"q_{uuid.uuid4().hex[:8]}",
                "type": "letter-hunt",
                "hidden_name": hidden_name,
                "correct_answer": name,
                "options": options
            })
    
    else:
        # Varsayılan mod
        import random
        random.shuffle(players)
        for player in players[:count]:
            wrong_answers = random.sample([p["name"] for p in players if p["name"] != player["name"]], 3)
            options = wrong_answers + [player["name"]]
            random.shuffle(options)
            
            questions.append({
                "question_id": f"q_{uuid.uuid4().hex[:8]}",
                "type": "general",
                "question": f"Bu oyuncunun adı nedir?",
                "correct_answer": player["name"],
                "options": options
            })
    
    return questions

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")
    await sio.emit('connected', {'sid': sid}, to=sid)

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")
    # Remove from matchmaking
    for mode in matchmaking_queue:
        matchmaking_queue[mode] = [p for p in matchmaking_queue[mode] if p['sid'] != sid]
    
    # Handle disconnection in active games
    for room_id, game in list(active_games.items()):
        for player in game.get('players', []):
            if player.get('sid') == sid:
                # Oyuncu disconnected - rakibe bildir
                await sio.emit('opponent_disconnected', {
                    'room_id': room_id,
                    'wait_time': 30  # 30 saniye bekle
                }, room=room_id)
                player['disconnected'] = True
                player['disconnect_time'] = datetime.now(timezone.utc)
                break

@sio.event
async def join_matchmaking(sid, data):
    """Join matchmaking queue for quick match"""
    game_mode = data.get('game_mode')
    user_id = data.get('user_id')
    username = data.get('username', 'Player')
    
    if not game_mode or not user_id:
        await sio.emit('error', {'message': 'Invalid data'}, to=sid)
        return
    
    logger.info(f"User {user_id} joining {game_mode} matchmaking")
    
    if game_mode not in matchmaking_queue:
        matchmaking_queue[game_mode] = []
    
    # Check if already in queue
    for p in matchmaking_queue[game_mode]:
        if p['user_id'] == user_id:
            await sio.emit('already_in_queue', {}, to=sid)
            return
    
    matchmaking_queue[game_mode].append({
        'sid': sid, 
        'user_id': user_id,
        'username': username,
        'joined_at': datetime.now(timezone.utc)
    })
    
    # Eşleşme var mı kontrol et
    if len(matchmaking_queue[game_mode]) >= 2:
        player1 = matchmaking_queue[game_mode].pop(0)
        player2 = matchmaking_queue[game_mode].pop(0)
        
        room_id = f"game_{uuid.uuid4().hex[:12]}"
        
        # Soruları oluştur
        questions = await generate_questions(game_mode, 10)
        
        # Oyun odasını oluştur
        active_games[room_id] = {
            'room_id': room_id,
            'game_mode': game_mode,
            'players': [
                {'sid': player1['sid'], 'user_id': player1['user_id'], 'username': player1['username'], 'score': 0, 'combo': 0},
                {'sid': player2['sid'], 'user_id': player2['user_id'], 'username': player2['username'], 'score': 0, 'combo': 0}
            ],
            'questions': questions,
            'current_question': 0,
            'status': 'starting',
            'created_at': datetime.now(timezone.utc),
            'round_answers': {}
        }
        
        await sio.enter_room(player1['sid'], room_id)
        await sio.enter_room(player2['sid'], room_id)
        
        # Her iki oyuncuya da eşleşme bilgisi gönder
        await sio.emit('match_found', {
            'room_id': room_id,
            'opponent': {'user_id': player2['user_id'], 'username': player2['username']},
            'game_mode': game_mode,
            'total_questions': len(questions)
        }, to=player1['sid'])
        
        await sio.emit('match_found', {
            'room_id': room_id,
            'opponent': {'user_id': player1['user_id'], 'username': player1['username']},
            'game_mode': game_mode,
            'total_questions': len(questions)
        }, to=player2['sid'])
        
        logger.info(f"Match created: {room_id} between {player1['username']} and {player2['username']}")
        
        # 3 saniye sonra oyunu başlat
        import asyncio
        await asyncio.sleep(3)
        await start_game_round(room_id)
    else:
        await sio.emit('searching', {
            'position': len(matchmaking_queue[game_mode]),
            'estimated_wait': '~30 saniye'
        }, to=sid)

@sio.event
async def leave_matchmaking(sid, data):
    """Leave matchmaking queue"""
    game_mode = data.get('game_mode')
    if game_mode and game_mode in matchmaking_queue:
        matchmaking_queue[game_mode] = [
            p for p in matchmaking_queue[game_mode] if p['sid'] != sid
        ]
    await sio.emit('left_queue', {}, to=sid)

@sio.event
async def create_private_room(sid, data):
    """Create a private room for friend match"""
    user_id = data.get('user_id')
    username = data.get('username', 'Player')
    game_mode = data.get('game_mode')
    
    import random
    import string
    room_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    room_id = f"private_{uuid.uuid4().hex[:12]}"
    
    private_rooms[room_code] = {
        'room_id': room_id,
        'host': {'sid': sid, 'user_id': user_id, 'username': username},
        'game_mode': game_mode,
        'created_at': datetime.now(timezone.utc)
    }
    
    await sio.enter_room(sid, room_id)
    
    await sio.emit('room_created', {
        'room_code': room_code,
        'room_id': room_id
    }, to=sid)

@sio.event
async def join_private_room(sid, data):
    """Join a private room with code"""
    room_code = data.get('room_code', '').upper()
    user_id = data.get('user_id')
    username = data.get('username', 'Player')
    
    if room_code not in private_rooms:
        await sio.emit('error', {'message': 'Oda bulunamadı'}, to=sid)
        return
    
    room_data = private_rooms[room_code]
    room_id = room_data['room_id']
    host = room_data['host']
    game_mode = room_data['game_mode']
    
    # Soruları oluştur
    questions = await generate_questions(game_mode, 10)
    
    # Oyun odasını oluştur
    active_games[room_id] = {
        'room_id': room_id,
        'game_mode': game_mode,
        'players': [
            {'sid': host['sid'], 'user_id': host['user_id'], 'username': host['username'], 'score': 0, 'combo': 0},
            {'sid': sid, 'user_id': user_id, 'username': username, 'score': 0, 'combo': 0}
        ],
        'questions': questions,
        'current_question': 0,
        'status': 'starting',
        'created_at': datetime.now(timezone.utc),
        'round_answers': {}
    }
    
    await sio.enter_room(sid, room_id)
    
    # Her iki oyuncuya da bilgi gönder
    await sio.emit('match_found', {
        'room_id': room_id,
        'opponent': {'user_id': user_id, 'username': username},
        'game_mode': game_mode,
        'total_questions': len(questions)
    }, to=host['sid'])
    
    await sio.emit('match_found', {
        'room_id': room_id,
        'opponent': {'user_id': host['user_id'], 'username': host['username']},
        'game_mode': game_mode,
        'total_questions': len(questions)
    }, to=sid)
    
    # Oda kodunu sil
    del private_rooms[room_code]
    
    # 3 saniye sonra oyunu başlat
    import asyncio
    await asyncio.sleep(3)
    await start_game_round(room_id)

async def start_game_round(room_id: str):
    """Start a new round/question"""
    if room_id not in active_games:
        return
    
    game = active_games[room_id]
    
    if game['current_question'] >= len(game['questions']):
        # Oyun bitti
        await end_game(room_id)
        return
    
    question = game['questions'][game['current_question']]
    game['status'] = 'playing'
    game['question_start_time'] = datetime.now(timezone.utc)
    game['round_answers'] = {}
    
    # Soruyu gönder (cevabı gizle)
    question_data = {k: v for k, v in question.items() if k != 'correct_answer'}
    question_data['question_number'] = game['current_question'] + 1
    question_data['total_questions'] = len(game['questions'])
    question_data['time_limit'] = 15  # 15 saniye
    
    await sio.emit('new_question', question_data, room=room_id)
    
    # 15 saniye sonra süre doldu kontrolü
    import asyncio
    await asyncio.sleep(15)
    await check_round_timeout(room_id, game['current_question'])

async def check_round_timeout(room_id: str, question_index: int):
    """Check if round timed out and move to next question"""
    if room_id not in active_games:
        return
    
    game = active_games[room_id]
    
    # Hala aynı soruda mıyız?
    if game['current_question'] != question_index:
        return
    
    # Cevap vermeyenlere yanlış say
    question = game['questions'][question_index]
    for player in game['players']:
        if player['user_id'] not in game['round_answers']:
            game['round_answers'][player['user_id']] = {
                'answer': None,
                'time_taken': 15,
                'correct': False
            }
            player['combo'] = 0  # Combo kırıldı
    
    # Sonuçları gönder
    await send_round_results(room_id)

@sio.event
async def submit_answer(sid, data):
    """Player submits an answer"""
    room_id = data.get('room_id')
    answer = data.get('answer')
    user_id = data.get('user_id')
    
    if room_id not in active_games:
        await sio.emit('error', {'message': 'Oyun bulunamadı'}, to=sid)
        return
    
    game = active_games[room_id]
    question = game['questions'][game['current_question']]
    
    # Süreyi hesapla
    time_taken = (datetime.now(timezone.utc) - game['question_start_time']).total_seconds()
    is_correct = answer == question['correct_answer']
    
    # Puanı hesapla
    base_points = 100 if is_correct else 0
    speed_bonus = max(0, int((15 - time_taken) * 10)) if is_correct else 0
    
    # Combo sistemi
    player = next((p for p in game['players'] if p['user_id'] == user_id), None)
    if player:
        if is_correct:
            player['combo'] += 1
            combo_multiplier = min(player['combo'], 5)  # Max 5x combo
        else:
            player['combo'] = 0
            combo_multiplier = 1
        
        total_points = (base_points + speed_bonus) * combo_multiplier
        player['score'] += total_points
        
        game['round_answers'][user_id] = {
            'answer': answer,
            'time_taken': time_taken,
            'correct': is_correct,
            'points': total_points,
            'combo': player['combo'],
            'speed_bonus': speed_bonus
        }
    
    # Tüm oyuncular cevap verdiyse
    if len(game['round_answers']) >= len(game['players']):
        await send_round_results(room_id)

async def send_round_results(room_id: str):
    """Send round results to all players"""
    if room_id not in active_games:
        return
    
    game = active_games[room_id]
    question = game['questions'][game['current_question']]
    
    results = {
        'correct_answer': question['correct_answer'],
        'player_results': [],
        'scores': {}
    }
    
    for player in game['players']:
        answer_data = game['round_answers'].get(player['user_id'], {})
        results['player_results'].append({
            'user_id': player['user_id'],
            'username': player['username'],
            'correct': answer_data.get('correct', False),
            'time_taken': answer_data.get('time_taken', 15),
            'points': answer_data.get('points', 0),
            'combo': answer_data.get('combo', 0)
        })
        results['scores'][player['user_id']] = player['score']
    
    await sio.emit('round_results', results, room=room_id)
    
    # Sonraki soruya geç
    game['current_question'] += 1
    
    import asyncio
    await asyncio.sleep(3)  # 3 saniye sonuçları göster
    await start_game_round(room_id)

async def end_game(room_id: str):
    """End the game and calculate final results"""
    if room_id not in active_games:
        return
    
    game = active_games[room_id]
    game['status'] = 'finished'
    
    # Kazananı belirle
    sorted_players = sorted(game['players'], key=lambda p: p['score'], reverse=True)
    winner = sorted_players[0] if sorted_players[0]['score'] > sorted_players[1]['score'] else None
    is_draw = sorted_players[0]['score'] == sorted_players[1]['score']
    
    # XP ve ödüller
    winner_xp = 50
    loser_xp = 20
    winner_coins = 30
    loser_coins = 10
    
    results = {
        'game_over': True,
        'is_draw': is_draw,
        'winner': winner['user_id'] if winner else None,
        'final_scores': {p['user_id']: p['score'] for p in game['players']},
        'rewards': {}
    }
    
    for player in game['players']:
        is_winner = winner and player['user_id'] == winner['user_id']
        xp_earned = winner_xp if is_winner else loser_xp
        coins_earned = winner_coins if is_winner else loser_coins
        
        if is_draw:
            xp_earned = 35
            coins_earned = 20
        
        results['rewards'][player['user_id']] = {
            'xp': xp_earned,
            'coins': coins_earned,
            'is_winner': is_winner
        }
        
        # Veritabanını güncelle
        update_data = {
            "$inc": {
                "stats.total_games": 1,
                "stats.points": player['score'],
                "stats.xp": xp_earned,
                "coins": coins_earned
            }
        }
        
        if is_winner:
            update_data["$inc"]["stats.wins"] = 1
            update_data["$inc"]["stats.win_streak"] = 1
        elif not is_draw:
            update_data["$inc"]["stats.losses"] = 1
            update_data["$set"] = {"stats.win_streak": 0}
        
        await db.users.update_one({"user_id": player['user_id']}, update_data)
        
        # Lig güncelle
        user = await db.users.find_one({"user_id": player['user_id']})
        if user:
            new_points = user.get("stats", {}).get("points", 0)
            new_league = get_league_from_points(new_points)
            await db.users.update_one(
                {"user_id": player['user_id']},
                {"$set": {"stats.rank": new_league}}
            )
    
    await sio.emit('game_over', results, room=room_id)
    
    # Odayı temizle
    del active_games[room_id]

@sio.event
async def use_joker(sid, data):
    """Use a joker during the game"""
    room_id = data.get('room_id')
    user_id = data.get('user_id')
    joker_type = data.get('joker_type')
    
    if room_id not in active_games:
        await sio.emit('error', {'message': 'Oyun bulunamadı'}, to=sid)
        return
    
    # Joker kontrolü
    user = await db.users.find_one({"user_id": user_id})
    if not user or user.get("jokers", {}).get(joker_type, 0) <= 0:
        await sio.emit('error', {'message': 'Joker yok'}, to=sid)
        return
    
    # Jokeri kullan
    await db.users.update_one(
        {"user_id": user_id},
        {"$inc": {f"jokers.{joker_type}": -1}}
    )
    
    game = active_games[room_id]
    question = game['questions'][game['current_question']]
    
    result = {'joker_type': joker_type, 'success': True}
    
    if joker_type == 'time_extend':
        result['extra_time'] = 5
    elif joker_type == 'eliminate_two':
        # 2 yanlış şıkkı sil
        import random
        wrong_options = [o for o in question['options'] if o != question['correct_answer']]
        eliminated = random.sample(wrong_options, min(2, len(wrong_options)))
        result['eliminated_options'] = eliminated
    elif joker_type == 'reveal_letter':
        # Bir harf aç
        correct = question['correct_answer']
        hidden_indices = [i for i, c in enumerate(correct) if c != ' ']
        if hidden_indices:
            import random
            reveal_idx = random.choice(hidden_indices)
            result['revealed_letter'] = {'index': reveal_idx, 'letter': correct[reveal_idx]}
    elif joker_type == 'skip_question':
        # Soruyu geç
        game['current_question'] += 1
        result['skipped'] = True
    
    await sio.emit('joker_used', result, to=sid)

@sio.event
async def request_rematch(sid, data):
    """Request a rematch after game ends"""
    room_id = data.get('room_id')
    user_id = data.get('user_id')
    
    await sio.emit('rematch_requested', {
        'from_user': user_id
    }, room=room_id)

@sio.event  
async def accept_rematch(sid, data):
    """Accept rematch request"""
    room_id = data.get('room_id')
    game_mode = data.get('game_mode')
    
    # Yeni oyun başlat
    # Bu basitleştirilmiş versiyon - gerçek implementasyonda eski oyuncuları alıp yeni oda oluşturmalı
    await sio.emit('rematch_accepted', {
        'message': 'Yeni oyun başlıyor...'
    }, room=room_id)

@sio.event
async def send_emote(sid, data):
    """Send emote to opponent"""
    room_id = data.get('room_id')
    emote = data.get('emote')
    user_id = data.get('user_id')
    
    await sio.emit('emote_received', {
        'from_user': user_id,
        'emote': emote
    }, room=room_id)

# CORS middleware must be added BEFORE routes
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include router
app.include_router(api_router)

# Mount Socket.IO
socket_app = socketio.ASGIApp(sio, app)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:socket_app", host="0.0.0.0", port=8001, reload=True)
