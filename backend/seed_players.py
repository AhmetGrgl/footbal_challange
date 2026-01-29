import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Sample famous football players data
PLAYERS_DATA = [
    {
        "player_id": "messi",
        "name": "Lionel Messi",
        "teams": [
            {"team": "Barcelona", "years": list(range(2004, 2021))},
            {"team": "PSG", "years": [2021, 2022, 2023]},
            {"team": "Inter Miami", "years": [2023, 2024, 2025]}
        ],
        "market_values": [
            {"year": 2012, "value": 150000000},
            {"year": 2015, "value": 180000000},
            {"year": 2018, "value": 180000000},
            {"year": 2021, "value": 80000000},
            {"year": 2023, "value": 35000000}
        ],
        "nationality": "Argentina",
        "position": "Forward"
    },
    {
        "player_id": "ronaldo",
        "name": "Cristiano Ronaldo",
        "teams": [
            {"team": "Manchester United", "years": list(range(2003, 2009))},
            {"team": "Real Madrid", "years": list(range(2009, 2018))},
            {"team": "Juventus", "years": [2018, 2019, 2020, 2021]},
            {"team": "Manchester United", "years": [2021, 2022]},
            {"team": "Al Nassr", "years": [2023, 2024, 2025]}
        ],
        "market_values": [
            {"year": 2012, "value": 120000000},
            {"year": 2015, "value": 120000000},
            {"year": 2018, "value": 100000000},
            {"year": 2021, "value": 45000000},
            {"year": 2023, "value": 20000000}
        ],
        "nationality": "Portugal",
        "position": "Forward"
    },
    {
        "player_id": "arda_guler",
        "name": "Arda Güler",
        "teams": [
            {"team": "Fenerbahce", "years": [2021, 2022, 2023]},
            {"team": "Real Madrid", "years": [2023, 2024, 2025]}
        ],
        "market_values": [
            {"year": 2022, "value": 5000000},
            {"year": 2023, "value": 25000000},
            {"year": 2024, "value": 30000000}
        ],
        "nationality": "Turkey",
        "position": "Midfielder"
    },
    {
        "player_id": "haaland",
        "name": "Erling Haaland",
        "teams": [
            {"team": "Red Bull Salzburg", "years": [2019]},
            {"team": "Borussia Dortmund", "years": [2020, 2021, 2022]},
            {"team": "Manchester City", "years": [2022, 2023, 2024, 2025]}
        ],
        "market_values": [
            {"year": 2020, "value": 40000000},
            {"year": 2022, "value": 150000000},
            {"year": 2024, "value": 180000000}
        ],
        "nationality": "Norway",
        "position": "Forward"
    },
    {
        "player_id": "mbappe",
        "name": "Kylian Mbappe",
        "teams": [
            {"team": "Monaco", "years": [2016, 2017]},
            {"team": "PSG", "years": list(range(2017, 2024))},
            {"team": "Real Madrid", "years": [2024, 2025]}
        ],
        "market_values": [
            {"year": 2018, "value": 180000000},
            {"year": 2021, "value": 160000000},
            {"year": 2023, "value": 180000000}
        ],
        "nationality": "France",
        "position": "Forward"
    },
    {
        "player_id": "neymar",
        "name": "Neymar Jr",
        "teams": [
            {"team": "Santos", "years": list(range(2009, 2013))},
            {"team": "Barcelona", "years": list(range(2013, 2017))},
            {"team": "PSG", "years": list(range(2017, 2023))},
            {"team": "Al Hilal", "years": [2023, 2024, 2025]}
        ],
        "market_values": [
            {"year": 2015, "value": 120000000},
            {"year": 2018, "value": 180000000},
            {"year": 2021, "value": 100000000},
            {"year": 2023, "value": 60000000}
        ],
        "nationality": "Brazil",
        "position": "Forward"
    },
    {
        "player_id": "benzema",
        "name": "Karim Benzema",
        "teams": [
            {"team": "Lyon", "years": list(range(2005, 2009))},
            {"team": "Real Madrid", "years": list(range(2009, 2023))},
            {"team": "Al Ittihad", "years": [2023, 2024, 2025]}
        ],
        "market_values": [
            {"year": 2012, "value": 40000000},
            {"year": 2018, "value": 60000000},
            {"year": 2022, "value": 35000000}
        ],
        "nationality": "France",
        "position": "Forward"
    },
    {
        "player_id": "salah",
        "name": "Mohamed Salah",
        "teams": [
            {"team": "Basel", "years": [2012, 2013, 2014]},
            {"team": "Chelsea", "years": [2014, 2015]},
            {"team": "Fiorentina", "years": [2015, 2016]},
            {"team": "Roma", "years": [2016, 2017]},
            {"team": "Liverpool", "years": list(range(2017, 2026))}
        ],
        "market_values": [
            {"year": 2018, "value": 150000000},
            {"year": 2021, "value": 110000000},
            {"year": 2024, "value": 65000000}
        ],
        "nationality": "Egypt",
        "position": "Forward"
    },
    {
        "player_id": "debruyne",
        "name": "Kevin De Bruyne",
        "teams": [
            {"team": "Genk", "years": [2009, 2010, 2011, 2012]},
            {"team": "Chelsea", "years": [2012, 2013]},
            {"team": "Werder Bremen", "years": [2013, 2014]},
            {"team": "Wolfsburg", "years": [2014, 2015]},
            {"team": "Manchester City", "years": list(range(2015, 2026))}
        ],
        "market_values": [
            {"year": 2018, "value": 150000000},
            {"year": 2021, "value": 100000000},
            {"year": 2024, "value": 70000000}
        ],
        "nationality": "Belgium",
        "position": "Midfielder"
    },
    {
        "player_id": "vinicius",
        "name": "Vinicius Junior",
        "teams": [
            {"team": "Flamengo", "years": [2017, 2018]},
            {"team": "Real Madrid", "years": list(range(2018, 2026))}
        ],
        "market_values": [
            {"year": 2020, "value": 50000000},
            {"year": 2022, "value": 100000000},
            {"year": 2024, "value": 150000000}
        ],
        "nationality": "Brazil",
        "position": "Forward"
    }
]

async def seed_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Clear existing players
    await db.players.delete_many({})
    
    # Insert players
    await db.players.insert_many(PLAYERS_DATA)
    
    print(f"✅ Seeded {len(PLAYERS_DATA)} players to database")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
