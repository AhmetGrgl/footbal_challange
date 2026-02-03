"""
Transfermarkt Data Scraper
Scrapes player data from Transfermarkt for football quiz game
"""

import requests
from bs4 import BeautifulSoup
import time
import json
import re
import random
from typing import List, Dict, Optional
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

# Headers to mimic browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}

BASE_URL = "https://www.transfermarkt.com"

# Leagues to scrape with their Transfermarkt URLs
LEAGUES = [
    # Top 5 Leagues
    {"name": "Premier League", "country": "England", "url": "/premier-league/startseite/wettbewerb/GB1", "tier": 1},
    {"name": "La Liga", "country": "Spain", "url": "/laliga/startseite/wettbewerb/ES1", "tier": 1},
    {"name": "Serie A", "country": "Italy", "url": "/serie-a/startseite/wettbewerb/IT1", "tier": 1},
    {"name": "Bundesliga", "country": "Germany", "url": "/bundesliga/startseite/wettbewerb/L1", "tier": 1},
    {"name": "Ligue 1", "country": "France", "url": "/ligue-1/startseite/wettbewerb/FR1", "tier": 1},
    
    # Second Divisions
    {"name": "Championship", "country": "England", "url": "/championship/startseite/wettbewerb/GB2", "tier": 2},
    {"name": "La Liga 2", "country": "Spain", "url": "/laliga2/startseite/wettbewerb/ES2", "tier": 2},
    {"name": "Serie B", "country": "Italy", "url": "/serie-b/startseite/wettbewerb/IT2", "tier": 2},
    {"name": "2. Bundesliga", "country": "Germany", "url": "/2-bundesliga/startseite/wettbewerb/L2", "tier": 2},
    {"name": "Ligue 2", "country": "France", "url": "/ligue-2/startseite/wettbewerb/FR2", "tier": 2},
    
    # Turkey
    {"name": "Super Lig", "country": "Turkey", "url": "/super-lig/startseite/wettbewerb/TR1", "tier": 1},
    {"name": "1. Lig", "country": "Turkey", "url": "/1-lig/startseite/wettbewerb/TR2", "tier": 2},
    
    # Other European Leagues
    {"name": "Primeira Liga", "country": "Portugal", "url": "/primeira-liga/startseite/wettbewerb/PO1", "tier": 1},
    {"name": "Eredivisie", "country": "Netherlands", "url": "/eredivisie/startseite/wettbewerb/NL1", "tier": 1},
    {"name": "Belgian Pro League", "country": "Belgium", "url": "/jupiler-pro-league/startseite/wettbewerb/BE1", "tier": 1},
    {"name": "Scottish Premiership", "country": "Scotland", "url": "/scottish-premiership/startseite/wettbewerb/SC1", "tier": 1},
    {"name": "Russian Premier League", "country": "Russia", "url": "/premier-liga/startseite/wettbewerb/RU1", "tier": 1},
    {"name": "Ukrainian Premier League", "country": "Ukraine", "url": "/premier-liga/startseite/wettbewerb/UKR1", "tier": 1},
    {"name": "Greek Super League", "country": "Greece", "url": "/super-league-1/startseite/wettbewerb/GR1", "tier": 1},
    {"name": "Austrian Bundesliga", "country": "Austria", "url": "/bundesliga/startseite/wettbewerb/A1", "tier": 1},
    {"name": "Swiss Super League", "country": "Switzerland", "url": "/super-league/startseite/wettbewerb/C1", "tier": 1},
    {"name": "Danish Superliga", "country": "Denmark", "url": "/superligaen/startseite/wettbewerb/DK1", "tier": 1},
    {"name": "Norwegian Eliteserien", "country": "Norway", "url": "/eliteserien/startseite/wettbewerb/NO1", "tier": 1},
    {"name": "Swedish Allsvenskan", "country": "Sweden", "url": "/allsvenskan/startseite/wettbewerb/SE1", "tier": 1},
    {"name": "Czech First League", "country": "Czech Republic", "url": "/fortuna-liga/startseite/wettbewerb/TS1", "tier": 1},
    {"name": "Croatian First League", "country": "Croatia", "url": "/1-hnl/startseite/wettbewerb/KR1", "tier": 1},
    {"name": "Serbian SuperLiga", "country": "Serbia", "url": "/super-liga-srbije/startseite/wettbewerb/SER1", "tier": 1},
    
    # South America
    {"name": "Brasileirao", "country": "Brazil", "url": "/campeonato-brasileiro-serie-a/startseite/wettbewerb/BRA1", "tier": 1},
    {"name": "Argentine Primera", "country": "Argentina", "url": "/liga-profesional-de-futbol/startseite/wettbewerb/AR1N", "tier": 1},
    
    # MLS and Saudi
    {"name": "MLS", "country": "USA", "url": "/major-league-soccer/startseite/wettbewerb/MLS1", "tier": 1},
    {"name": "Saudi Pro League", "country": "Saudi Arabia", "url": "/saudi-pro-league/startseite/wettbewerb/SA1", "tier": 1},
]

def parse_market_value(value_str: str) -> Optional[int]:
    """Parse market value string to integer"""
    if not value_str or value_str == '-' or value_str == 'N/A':
        return None
    
    value_str = value_str.strip().replace('€', '').replace(',', '.')
    
    multiplier = 1
    if 'm' in value_str.lower():
        multiplier = 1000000
        value_str = value_str.lower().replace('m', '')
    elif 'k' in value_str.lower() or 'th' in value_str.lower():
        multiplier = 1000
        value_str = value_str.lower().replace('k', '').replace('th', '')
    elif 'bn' in value_str.lower():
        multiplier = 1000000000
        value_str = value_str.lower().replace('bn', '')
    
    try:
        return int(float(value_str.strip()) * multiplier)
    except:
        return None

def get_teams_from_league(league_url: str, session: requests.Session) -> List[Dict]:
    """Get all teams from a league page"""
    teams = []
    
    try:
        url = f"{BASE_URL}{league_url}"
        response = session.get(url, headers=HEADERS, timeout=30)
        
        if response.status_code != 200:
            print(f"  Failed to get league page: {response.status_code}")
            return teams
        
        soup = BeautifulSoup(response.text, 'lxml')
        
        # Find team table
        team_rows = soup.select('table.items tbody tr')
        
        for row in team_rows:
            try:
                team_link = row.select_one('td.hauptlink a')
                if team_link:
                    team_name = team_link.text.strip()
                    team_url = team_link.get('href', '')
                    
                    if team_name and team_url:
                        teams.append({
                            'name': team_name,
                            'url': team_url
                        })
            except Exception as e:
                continue
        
    except Exception as e:
        print(f"  Error getting teams: {e}")
    
    return teams

def get_players_from_team(team_url: str, team_name: str, league_name: str, country: str, session: requests.Session) -> List[Dict]:
    """Get all players from a team page"""
    players = []
    
    try:
        # Convert to squad page URL
        squad_url = team_url.replace('/startseite/', '/kader/')
        url = f"{BASE_URL}{squad_url}"
        
        response = session.get(url, headers=HEADERS, timeout=30)
        
        if response.status_code != 200:
            print(f"    Failed to get team page: {response.status_code}")
            return players
        
        soup = BeautifulSoup(response.text, 'lxml')
        
        # Find player rows
        player_rows = soup.select('table.items tbody tr.odd, table.items tbody tr.even')
        
        for row in player_rows:
            try:
                # Get player name
                name_cell = row.select_one('td.hauptlink a')
                if not name_cell:
                    continue
                
                player_name = name_cell.text.strip()
                player_url = name_cell.get('href', '')
                
                # Get position
                position_cell = row.select('td.posrela table tr')
                position = "Unknown"
                if len(position_cell) > 1:
                    pos_text = position_cell[-1].text.strip()
                    if pos_text:
                        position = pos_text
                
                # Get nationality
                nationality_img = row.select_one('td.zentriert img.flaggenrahmen')
                nationality = country  # Default to league country
                if nationality_img:
                    nat_title = nationality_img.get('title', '')
                    if nat_title:
                        nationality = nat_title
                
                # Get market value
                value_cell = row.select_one('td.rechts.hauptlink')
                market_value = None
                if value_cell:
                    market_value = parse_market_value(value_cell.text.strip())
                
                # Get age/birth year
                age_cell = row.select('td.zentriert')
                birth_year = None
                for cell in age_cell:
                    text = cell.text.strip()
                    if '(' in text and ')' in text:
                        try:
                            age = int(text.split('(')[1].split(')')[0])
                            birth_year = 2024 - age
                        except:
                            pass
                
                if player_name:
                    player = {
                        'name': player_name,
                        'current_team': team_name,
                        'league': league_name,
                        'position': map_position(position),
                        'nationality': nationality,
                        'market_value': market_value,
                        'birth_year': birth_year,
                        'url': player_url
                    }
                    players.append(player)
                    
            except Exception as e:
                continue
        
    except Exception as e:
        print(f"    Error getting players: {e}")
    
    return players

def map_position(position: str) -> str:
    """Map detailed positions to simple categories"""
    position = position.lower()
    
    if any(x in position for x in ['keeper', 'goalkeeper', 'gk', 'torwart']):
        return 'Goalkeeper'
    elif any(x in position for x in ['back', 'defender', 'centre-back', 'left-back', 'right-back', 'verteidiger']):
        return 'Defender'
    elif any(x in position for x in ['midfield', 'midfielder', 'mittelfeld', 'defensive midfield', 'central midfield', 'attacking midfield']):
        return 'Midfielder'
    elif any(x in position for x in ['forward', 'striker', 'winger', 'centre-forward', 'stürmer', 'attack']):
        return 'Forward'
    else:
        return 'Midfielder'  # Default

def scrape_all_leagues():
    """Main function to scrape all leagues"""
    session = requests.Session()
    all_players = []
    all_teams = set()
    
    print("="*60)
    print("TRANSFERMARKT DATA SCRAPER")
    print("="*60)
    
    for league in LEAGUES:
        print(f"\n📊 Scraping {league['name']} ({league['country']})...")
        
        teams = get_teams_from_league(league['url'], session)
        print(f"   Found {len(teams)} teams")
        
        league_players = []
        
        for i, team in enumerate(teams):
            print(f"   [{i+1}/{len(teams)}] {team['name']}...", end=" ")
            
            all_teams.add(team['name'])
            
            players = get_players_from_team(
                team['url'], 
                team['name'], 
                league['name'],
                league['country'],
                session
            )
            
            print(f"{len(players)} players")
            league_players.extend(players)
            
            # Rate limiting - be nice to the server
            time.sleep(random.uniform(1, 2))
        
        all_players.extend(league_players)
        print(f"   ✅ Total from {league['name']}: {len(league_players)} players")
        
        # Longer pause between leagues
        time.sleep(random.uniform(2, 4))
    
    print("\n" + "="*60)
    print(f"SCRAPING COMPLETE!")
    print(f"Total Players: {len(all_players)}")
    print(f"Total Teams: {len(all_teams)}")
    print("="*60)
    
    return all_players, list(all_teams)

async def save_to_database(players: List[Dict], teams: List[str]):
    """Save scraped data to MongoDB"""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client['test_database']
    
    # Clear existing data
    await db.players.delete_many({})
    await db.teams.delete_many({})
    
    # Deduplicate players by name
    seen_names = set()
    unique_players = []
    for player in players:
        if player['name'] not in seen_names:
            seen_names.add(player['name'])
            unique_players.append(player)
    
    # Prepare player documents
    player_docs = []
    for i, player in enumerate(unique_players):
        doc = {
            "player_id": f"player_{i+1:05d}",
            "name": player['name'],
            "nationality": player['nationality'],
            "position": player['position'],
            "teams": [{
                "team": player['current_team'],
                "years": [2024, 2025]
            }],
            "market_values": []
        }
        
        if player.get('market_value'):
            doc["market_values"].append({
                "year": 2024,
                "value": player['market_value']
            })
        
        player_docs.append(doc)
    
    # Insert players
    if player_docs:
        await db.players.insert_many(player_docs)
        print(f"Inserted {len(player_docs)} players")
    
    # Insert teams
    team_docs = [{"name": team, "team_id": f"team_{i+1:04d}"} for i, team in enumerate(teams)]
    if team_docs:
        await db.teams.insert_many(team_docs)
        print(f"Inserted {len(team_docs)} teams")
    
    # Print statistics
    total = await db.players.count_documents({})
    print(f"\nTotal players in database: {total}")
    
    nationalities = await db.players.aggregate([
        {"$group": {"_id": "$nationality", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 20}
    ]).to_list(20)
    
    print("\nTop 20 nationalities:")
    for nat in nationalities:
        print(f"  {nat['_id']}: {nat['count']}")
    
    client.close()

if __name__ == "__main__":
    # Run scraper
    players, teams = scrape_all_leagues()
    
    # Save to database
    asyncio.run(save_to_database(players, teams))
