"""
MEGA Football Players Database Seeder - Final
Combines all parts and seeds the database
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load all parts
from mega_seed_part1 import PLAYERS_PART1
from mega_seed_part2 import PLAYERS_PART2
from mega_seed_part3 import PLAYERS_PART3
from mega_seed_part4 import PLAYERS_PART4
from mega_seed_part5 import PLAYERS_PART5

load_dotenv(Path(__file__).parent / '.env')

async def seed_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client['test_database']
    
    # Combine all players
    ALL_PLAYERS = PLAYERS_PART1 + PLAYERS_PART2 + PLAYERS_PART3 + PLAYERS_PART4 + PLAYERS_PART5
    
    print(f"Total players to insert: {len(ALL_PLAYERS)}")
    
    # Clear existing players
    await db.players.delete_many({})
    print("Cleared existing players...")
    
    # Remove duplicates by name
    seen_names = set()
    unique_players = []
    for player in ALL_PLAYERS:
        if player["name"] not in seen_names:
            seen_names.add(player["name"])
            unique_players.append(player)
    
    print(f"Unique players after deduplication: {len(unique_players)}")
    
    # Add player_id to each player
    players_with_ids = []
    for i, player in enumerate(unique_players):
        player_data = {
            "player_id": f"player_{i+1:04d}",
            **player
        }
        players_with_ids.append(player_data)
    
    # Insert all players
    result = await db.players.insert_many(players_with_ids)
    print(f"Successfully inserted {len(result.inserted_ids)} players!")
    
    # Show stats
    total = await db.players.count_documents({})
    print(f"\n{'='*50}")
    print(f"TOTAL PLAYERS IN DATABASE: {total}")
    print(f"{'='*50}")
    
    # Count by nationality
    nationalities = await db.players.aggregate([
        {"$group": {"_id": "$nationality", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 25}
    ]).to_list(25)
    
    print("\nTop 25 nationalities:")
    for i, nat in enumerate(nationalities, 1):
        print(f"  {i:2}. {nat['_id']}: {nat['count']} players")
    
    # Count by teams (unique teams)
    all_teams = set()
    async for player in db.players.find():
        for team in player.get('teams', []):
            all_teams.add(team['team'])
    print(f"\nUnique teams represented: {len(all_teams)}")
    
    # Count by position
    positions = await db.players.aggregate([
        {"$group": {"_id": "$position", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]).to_list(10)
    
    print("\nPlayers by position:")
    for pos in positions:
        print(f"  {pos['_id']}: {pos['count']} players")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
