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
        "rank": "Bronze"
    })
    friends: List[str] = Field(default_factory=list)
    profile_completed: bool = False

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
    logger.info(f"Register attempt for: {data.email}")
    
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check username uniqueness
    if data.username:
        username_exists = await db.users.find_one({"username": data.username}, {"_id": 0})
        if username_exists:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(data.password)
    
    new_user = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "username": data.username,
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
        {"_id": 0, "user_id": 1, "username": 1, "avatar": 1, "stats": 1, "location": 1}
    ).sort("stats.points", -1).limit(limit).to_list(limit)
    
    return users

@api_router.get("/leaderboard/location")
async def get_location_leaderboard(location: str, limit: int = 100):
    """Get location-based leaderboard"""
    users = await db.users.find(
        {"location": location},
        {"_id": 0, "user_id": 1, "username": 1, "avatar": 1, "stats": 1}
    ).sort("stats.points", -1).limit(limit).to_list(limit)
    
    return users

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

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")
    await sio.emit('connected', {'sid': sid}, to=sid)

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")
    for mode in matchmaking_queue:
        if sid in matchmaking_queue[mode]:
            matchmaking_queue[mode].remove(sid)

@sio.event
async def join_matchmaking(sid, data):
    """Join matchmaking queue"""
    game_mode = data.get('game_mode')
    user_id = data.get('user_id')
    
    if not game_mode or not user_id:
        await sio.emit('error', {'message': 'Invalid data'}, to=sid)
        return
    
    logger.info(f"User {user_id} joining {game_mode} matchmaking")
    
    if game_mode not in matchmaking_queue:
        matchmaking_queue[game_mode] = []
    
    matchmaking_queue[game_mode].append({'sid': sid, 'user_id': user_id})
    
    if len(matchmaking_queue[game_mode]) >= 2:
        player1 = matchmaking_queue[game_mode].pop(0)
        player2 = matchmaking_queue[game_mode].pop(0)
        
        room_id = f"game_{uuid.uuid4().hex[:12]}"
        await sio.enter_room(player1['sid'], room_id)
        await sio.enter_room(player2['sid'], room_id)
        
        await sio.emit('match_found', {
            'room_id': room_id,
            'opponent': player2['user_id']
        }, to=player1['sid'])
        
        await sio.emit('match_found', {
            'room_id': room_id,
            'opponent': player1['user_id']
        }, to=player2['sid'])
        
        logger.info(f"Match created: {room_id}")
    else:
        await sio.emit('searching', {'position': len(matchmaking_queue[game_mode])}, to=sid)

@sio.event
async def leave_matchmaking(sid, data):
    """Leave matchmaking queue"""
    game_mode = data.get('game_mode')
    if game_mode and game_mode in matchmaking_queue:
        matchmaking_queue[game_mode] = [
            p for p in matchmaking_queue[game_mode] if p['sid'] != sid
        ]
    await sio.emit('left_queue', {}, to=sid)

# Include router
app.include_router(api_router)

# Mount Socket.IO
socket_app = socketio.ASGIApp(sio, app)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:socket_app", host="0.0.0.0", port=8001, reload=True)
