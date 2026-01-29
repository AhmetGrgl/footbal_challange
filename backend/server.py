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
db = client[os.environ['DB_NAME']]

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
    picture: Optional[str] = None
    language: str = "tr"
    created_at: datetime
    stats: dict = Field(default_factory=lambda: {"wins": 0, "losses": 0, "total_games": 0})
    friends: List[str] = Field(default_factory=list)

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
    language: str = "tr"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Player(BaseModel):
    player_id: str
    name: str
    teams: List[dict]  # [{"team": "Real Madrid", "years": [2020, 2021]}]
    market_values: List[dict]  # [{"year": 2020, "value": 50000000}]
    nationality: str
    position: str

class FriendRequest(BaseModel):
    request_id: str
    sender_id: str
    receiver_id: str
    status: str  # pending, accepted, rejected
    created_at: datetime

# ============ AUTH UTILS ============

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token in cookie or Authorization header"""
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    if not session_token:
        return None
    
    # Find session
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session:
        return None
    
    # Check expiry (timezone-aware)
    expires_at = session["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        await db.user_sessions.delete_one({"session_token": session_token})
        return None
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    return User(**user_doc)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# ============ AUTH ROUTES ============

@api_router.post("/auth/session")
async def process_session_id(
    x_session_id: str = Header(..., alias="X-Session-ID"),
    response: Response = None
):
    """Exchange session_id for user data and session_token"""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": x_session_id}
            )
            resp.raise_for_status()
            user_data = resp.json()
        
        session_data = SessionDataResponse(**user_data)
        
        # Check if user exists
        existing_user = await db.users.find_one(
            {"email": session_data.email},
            {"_id": 0}
        )
        
        if not existing_user:
            # Create new user
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            new_user = {
                "user_id": user_id,
                "email": session_data.email,
                "name": session_data.name,
                "picture": session_data.picture,
                "language": "tr",
                "created_at": datetime.now(timezone.utc),
                "stats": {"wins": 0, "losses": 0, "total_games": 0},
                "friends": []
            }
            await db.users.insert_one(new_user)
            user_id_to_use = user_id
        else:
            user_id_to_use = existing_user["user_id"]
        
        # Create session
        await db.user_sessions.insert_one({
            "user_id": user_id_to_use,
            "session_token": session_data.session_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "created_at": datetime.now(timezone.utc)
        })
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_data.session_token,
            httponly=True,
            secure=False,  # Set to True in production
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
    # Check if user exists
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(data.password)
    
    new_user = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "picture": None,
        "language": data.language,
        "password_hash": hashed_pw,
        "created_at": datetime.now(timezone.utc),
        "stats": {"wins": 0, "losses": 0, "total_games": 0},
        "friends": []
    }
    await db.users.insert_one(new_user)
    
    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
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

@api_router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    """Login with email/password"""
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7*24*60*60,
        path="/"
    )
    
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

# ============ USER ROUTES ============

@api_router.get("/users/profile")
async def get_profile(request: Request):
    """Get user profile with stats"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.put("/users/language")
async def update_language(request: Request, language: str):
    """Update user language preference"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"language": language}}
    )
    return {"message": "Language updated"}

# ============ PLAYERS ROUTES ============

@api_router.get("/players")
async def get_players(limit: int = 100):
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
    
    if not user.friends:
        return []
    
    friends = await db.users.find(
        {"user_id": {"$in": user.friends}},
        {"_id": 0, "user_id": 1, "name": 1, "picture": 1, "stats": 1}
    ).to_list(100)
    return friends

@api_router.post("/friends/request/{receiver_id}")
async def send_friend_request(receiver_id: str, request: Request):
    """Send friend request"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if already friends
    if receiver_id in user.friends:
        raise HTTPException(status_code=400, detail="Already friends")
    
    # Check if request already exists
    existing = await db.friend_requests.find_one({
        "sender_id": user.user_id,
        "receiver_id": receiver_id,
        "status": "pending"
    })
    if existing:
        raise HTTPException(status_code=400, detail="Request already sent")
    
    request_id = f"req_{uuid.uuid4().hex[:12]}"
    await db.friend_requests.insert_one({
        "request_id": request_id,
        "sender_id": user.user_id,
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
        {"receiver_id": user.user_id, "status": "pending"},
        {"_id": 0}
    ).to_list(100)
    
    # Get sender info
    for req in requests:
        sender = await db.users.find_one(
            {"user_id": req["sender_id"]},
            {"_id": 0, "user_id": 1, "name": 1, "picture": 1}
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
    if not friend_req or friend_req["receiver_id"] != user.user_id:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Update request status
    await db.friend_requests.update_one(
        {"request_id": request_id},
        {"$set": {"status": "accepted"}}
    )
    
    # Add to friends list
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$addToSet": {"friends": friend_req["sender_id"]}}
    )
    await db.users.update_one(
        {"user_id": friend_req["sender_id"]},
        {"$addToSet": {"friends": user.user_id}}
    )
    
    return {"message": "Friend request accepted"}

# ============ SOCKET.IO HANDLERS ============

# Matchmaking queue
matchmaking_queue = {}

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")
    await sio.emit('connected', {'sid': sid}, to=sid)

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")
    # Remove from queues
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
    
    # Initialize queue if not exists
    if game_mode not in matchmaking_queue:
        matchmaking_queue[game_mode] = []
    
    # Add to queue
    matchmaking_queue[game_mode].append({'sid': sid, 'user_id': user_id})
    
    # Check if we can match
    if len(matchmaking_queue[game_mode]) >= 2:
        # Match first two players
        player1 = matchmaking_queue[game_mode].pop(0)
        player2 = matchmaking_queue[game_mode].pop(0)
        
        # Create game room
        room_id = f"game_{uuid.uuid4().hex[:12]}"
        await sio.enter_room(player1['sid'], room_id)
        await sio.enter_room(player2['sid'], room_id)
        
        # Notify players
        await sio.emit('match_found', {
            'room_id': room_id,
            'opponent': player2['user_id']
        }, to=player1['sid'])
        
        await sio.emit('match_found', {
            'room_id': room_id,
            'opponent': player1['user_id']
        }, to=player2['sid'])
        
        logger.info(f"Match created: {room_id} - {player1['user_id']} vs {player2['user_id']}")
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
