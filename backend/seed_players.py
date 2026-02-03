"""
Comprehensive Football Players Database Seeder
Includes players from:
- Premier League (England)
- La Liga (Spain)
- Serie A (Italy)
- Bundesliga (Germany)
- Ligue 1 (France)
- Süper Lig (Turkey)
- Primeira Liga (Portugal)
- Eredivisie (Netherlands)
- Other popular leagues and legendary players
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

# Comprehensive player database
PLAYERS = [
    # ============ PREMIER LEAGUE ============
    # Manchester City
    {"name": "Erling Haaland", "teams": [{"team": "Molde", "years": [2017, 2019]}, {"team": "Red Bull Salzburg", "years": [2019, 2020]}, {"team": "Borussia Dortmund", "years": [2020, 2022]}, {"team": "Manchester City", "years": [2022, 2025]}], "nationality": "Norway", "position": "Forward", "market_values": [{"year": 2023, "value": 180000000}, {"year": 2024, "value": 200000000}]},
    {"name": "Kevin De Bruyne", "teams": [{"team": "Genk", "years": [2008, 2012]}, {"team": "Chelsea", "years": [2012, 2014]}, {"team": "Wolfsburg", "years": [2014, 2015]}, {"team": "Manchester City", "years": [2015, 2025]}], "nationality": "Belgium", "position": "Midfielder", "market_values": [{"year": 2023, "value": 80000000}, {"year": 2024, "value": 70000000}]},
    {"name": "Phil Foden", "teams": [{"team": "Manchester City", "years": [2017, 2025]}], "nationality": "England", "position": "Midfielder", "market_values": [{"year": 2023, "value": 110000000}, {"year": 2024, "value": 150000000}]},
    {"name": "Bernardo Silva", "teams": [{"team": "Benfica", "years": [2013, 2015]}, {"team": "Monaco", "years": [2015, 2017]}, {"team": "Manchester City", "years": [2017, 2025]}], "nationality": "Portugal", "position": "Midfielder", "market_values": [{"year": 2023, "value": 80000000}]},
    {"name": "Rodri", "teams": [{"team": "Villarreal", "years": [2015, 2018]}, {"team": "Atletico Madrid", "years": [2018, 2019]}, {"team": "Manchester City", "years": [2019, 2025]}], "nationality": "Spain", "position": "Midfielder", "market_values": [{"year": 2023, "value": 90000000}, {"year": 2024, "value": 120000000}]},
    {"name": "Ruben Dias", "teams": [{"team": "Benfica", "years": [2017, 2020]}, {"team": "Manchester City", "years": [2020, 2025]}], "nationality": "Portugal", "position": "Defender", "market_values": [{"year": 2023, "value": 75000000}]},
    {"name": "John Stones", "teams": [{"team": "Barnsley", "years": [2011, 2013]}, {"team": "Everton", "years": [2013, 2016]}, {"team": "Manchester City", "years": [2016, 2025]}], "nationality": "England", "position": "Defender", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Jack Grealish", "teams": [{"team": "Aston Villa", "years": [2012, 2021]}, {"team": "Manchester City", "years": [2021, 2025]}], "nationality": "England", "position": "Midfielder", "market_values": [{"year": 2023, "value": 70000000}]},
    {"name": "Ederson", "teams": [{"team": "Benfica", "years": [2015, 2017]}, {"team": "Manchester City", "years": [2017, 2025]}], "nationality": "Brazil", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 40000000}]},
    {"name": "Kyle Walker", "teams": [{"team": "Tottenham", "years": [2009, 2017]}, {"team": "Manchester City", "years": [2017, 2025]}], "nationality": "England", "position": "Defender", "market_values": [{"year": 2023, "value": 20000000}]},
    
    # Liverpool
    {"name": "Mohamed Salah", "teams": [{"team": "Basel", "years": [2012, 2014]}, {"team": "Chelsea", "years": [2014, 2016]}, {"team": "Fiorentina", "years": [2015, 2015]}, {"team": "Roma", "years": [2015, 2017]}, {"team": "Liverpool", "years": [2017, 2025]}], "nationality": "Egypt", "position": "Forward", "market_values": [{"year": 2023, "value": 80000000}, {"year": 2024, "value": 70000000}]},
    {"name": "Virgil van Dijk", "teams": [{"team": "Groningen", "years": [2010, 2013]}, {"team": "Celtic", "years": [2013, 2015]}, {"team": "Southampton", "years": [2015, 2018]}, {"team": "Liverpool", "years": [2018, 2025]}], "nationality": "Netherlands", "position": "Defender", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Trent Alexander-Arnold", "teams": [{"team": "Liverpool", "years": [2016, 2025]}], "nationality": "England", "position": "Defender", "market_values": [{"year": 2023, "value": 70000000}]},
    {"name": "Darwin Nunez", "teams": [{"team": "Penarol", "years": [2017, 2019]}, {"team": "Almeria", "years": [2019, 2020]}, {"team": "Benfica", "years": [2020, 2022]}, {"team": "Liverpool", "years": [2022, 2025]}], "nationality": "Uruguay", "position": "Forward", "market_values": [{"year": 2023, "value": 70000000}]},
    {"name": "Alisson Becker", "teams": [{"team": "Internacional", "years": [2013, 2016]}, {"team": "Roma", "years": [2016, 2018]}, {"team": "Liverpool", "years": [2018, 2025]}], "nationality": "Brazil", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 40000000}]},
    {"name": "Diogo Jota", "teams": [{"team": "Porto", "years": [2016, 2017]}, {"team": "Wolverhampton", "years": [2017, 2020]}, {"team": "Liverpool", "years": [2020, 2025]}], "nationality": "Portugal", "position": "Forward", "market_values": [{"year": 2023, "value": 50000000}]},
    {"name": "Luis Diaz", "teams": [{"team": "Junior", "years": [2017, 2019]}, {"team": "Porto", "years": [2019, 2022]}, {"team": "Liverpool", "years": [2022, 2025]}], "nationality": "Colombia", "position": "Forward", "market_values": [{"year": 2023, "value": 60000000}]},
    {"name": "Cody Gakpo", "teams": [{"team": "PSV", "years": [2018, 2023]}, {"team": "Liverpool", "years": [2023, 2025]}], "nationality": "Netherlands", "position": "Forward", "market_values": [{"year": 2023, "value": 50000000}]},
    {"name": "Andy Robertson", "teams": [{"team": "Queen's Park", "years": [2012, 2013]}, {"team": "Dundee United", "years": [2013, 2014]}, {"team": "Hull City", "years": [2014, 2017]}, {"team": "Liverpool", "years": [2017, 2025]}], "nationality": "Scotland", "position": "Defender", "market_values": [{"year": 2023, "value": 30000000}]},
    
    # Arsenal
    {"name": "Bukayo Saka", "teams": [{"team": "Arsenal", "years": [2018, 2025]}], "nationality": "England", "position": "Forward", "market_values": [{"year": 2023, "value": 120000000}, {"year": 2024, "value": 140000000}]},
    {"name": "Martin Odegaard", "teams": [{"team": "Stromsgodset", "years": [2014, 2015]}, {"team": "Real Madrid", "years": [2015, 2021]}, {"team": "Real Sociedad", "years": [2019, 2020]}, {"team": "Arsenal", "years": [2021, 2025]}], "nationality": "Norway", "position": "Midfielder", "market_values": [{"year": 2023, "value": 100000000}]},
    {"name": "Declan Rice", "teams": [{"team": "West Ham", "years": [2017, 2023]}, {"team": "Arsenal", "years": [2023, 2025]}], "nationality": "England", "position": "Midfielder", "market_values": [{"year": 2023, "value": 110000000}]},
    {"name": "Gabriel Jesus", "teams": [{"team": "Palmeiras", "years": [2015, 2017]}, {"team": "Manchester City", "years": [2017, 2022]}, {"team": "Arsenal", "years": [2022, 2025]}], "nationality": "Brazil", "position": "Forward", "market_values": [{"year": 2023, "value": 65000000}]},
    {"name": "Gabriel Martinelli", "teams": [{"team": "Ituano", "years": [2017, 2019]}, {"team": "Arsenal", "years": [2019, 2025]}], "nationality": "Brazil", "position": "Forward", "market_values": [{"year": 2023, "value": 80000000}]},
    {"name": "William Saliba", "teams": [{"team": "Saint-Etienne", "years": [2018, 2019]}, {"team": "Arsenal", "years": [2019, 2025]}], "nationality": "France", "position": "Defender", "market_values": [{"year": 2023, "value": 80000000}]},
    {"name": "Ben White", "teams": [{"team": "Brighton", "years": [2016, 2021]}, {"team": "Arsenal", "years": [2021, 2025]}], "nationality": "England", "position": "Defender", "market_values": [{"year": 2023, "value": 55000000}]},
    {"name": "Aaron Ramsdale", "teams": [{"team": "Bournemouth", "years": [2017, 2020]}, {"team": "Sheffield United", "years": [2020, 2021]}, {"team": "Arsenal", "years": [2021, 2025]}], "nationality": "England", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 35000000}]},
    {"name": "Kai Havertz", "teams": [{"team": "Bayer Leverkusen", "years": [2016, 2020]}, {"team": "Chelsea", "years": [2020, 2023]}, {"team": "Arsenal", "years": [2023, 2025]}], "nationality": "Germany", "position": "Forward", "market_values": [{"year": 2023, "value": 65000000}]},
    {"name": "Leandro Trossard", "teams": [{"team": "Genk", "years": [2016, 2019]}, {"team": "Brighton", "years": [2019, 2023]}, {"team": "Arsenal", "years": [2023, 2025]}], "nationality": "Belgium", "position": "Forward", "market_values": [{"year": 2023, "value": 40000000}]},
    
    # Manchester United
    {"name": "Marcus Rashford", "teams": [{"team": "Manchester United", "years": [2015, 2025]}], "nationality": "England", "position": "Forward", "market_values": [{"year": 2023, "value": 80000000}, {"year": 2024, "value": 65000000}]},
    {"name": "Bruno Fernandes", "teams": [{"team": "Novara", "years": [2012, 2013]}, {"team": "Udinese", "years": [2013, 2017]}, {"team": "Sampdoria", "years": [2016, 2017]}, {"team": "Sporting CP", "years": [2017, 2020]}, {"team": "Manchester United", "years": [2020, 2025]}], "nationality": "Portugal", "position": "Midfielder", "market_values": [{"year": 2023, "value": 75000000}]},
    {"name": "Casemiro", "teams": [{"team": "Sao Paulo", "years": [2010, 2013]}, {"team": "Real Madrid", "years": [2013, 2022]}, {"team": "Porto", "years": [2014, 2015]}, {"team": "Manchester United", "years": [2022, 2025]}], "nationality": "Brazil", "position": "Midfielder", "market_values": [{"year": 2023, "value": 30000000}]},
    {"name": "Rasmus Hojlund", "teams": [{"team": "Copenhagen", "years": [2020, 2022]}, {"team": "Sturm Graz", "years": [2022, 2022]}, {"team": "Atalanta", "years": [2022, 2023]}, {"team": "Manchester United", "years": [2023, 2025]}], "nationality": "Denmark", "position": "Forward", "market_values": [{"year": 2023, "value": 70000000}]},
    {"name": "Alejandro Garnacho", "teams": [{"team": "Manchester United", "years": [2020, 2025]}], "nationality": "Argentina", "position": "Forward", "market_values": [{"year": 2023, "value": 50000000}, {"year": 2024, "value": 70000000}]},
    {"name": "Lisandro Martinez", "teams": [{"team": "Newell's Old Boys", "years": [2017, 2019]}, {"team": "Defensa y Justicia", "years": [2017, 2019]}, {"team": "Ajax", "years": [2019, 2022]}, {"team": "Manchester United", "years": [2022, 2025]}], "nationality": "Argentina", "position": "Defender", "market_values": [{"year": 2023, "value": 55000000}]},
    {"name": "Antony", "teams": [{"team": "Sao Paulo", "years": [2018, 2020]}, {"team": "Ajax", "years": [2020, 2022]}, {"team": "Manchester United", "years": [2022, 2025]}], "nationality": "Brazil", "position": "Forward", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Andre Onana", "teams": [{"team": "Barcelona", "years": [2015, 2015]}, {"team": "Ajax", "years": [2015, 2022]}, {"team": "Inter Milan", "years": [2022, 2023]}, {"team": "Manchester United", "years": [2023, 2025]}], "nationality": "Cameroon", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Kobbie Mainoo", "teams": [{"team": "Manchester United", "years": [2023, 2025]}], "nationality": "England", "position": "Midfielder", "market_values": [{"year": 2024, "value": 60000000}]},
    
    # Chelsea
    {"name": "Cole Palmer", "teams": [{"team": "Manchester City", "years": [2020, 2023]}, {"team": "Chelsea", "years": [2023, 2025]}], "nationality": "England", "position": "Midfielder", "market_values": [{"year": 2024, "value": 80000000}]},
    {"name": "Enzo Fernandez", "teams": [{"team": "River Plate", "years": [2019, 2022]}, {"team": "Benfica", "years": [2022, 2023]}, {"team": "Chelsea", "years": [2023, 2025]}], "nationality": "Argentina", "position": "Midfielder", "market_values": [{"year": 2023, "value": 100000000}]},
    {"name": "Nicolas Jackson", "teams": [{"team": "Villarreal", "years": [2021, 2023]}, {"team": "Chelsea", "years": [2023, 2025]}], "nationality": "Senegal", "position": "Forward", "market_values": [{"year": 2023, "value": 50000000}]},
    {"name": "Moises Caicedo", "teams": [{"team": "Independiente del Valle", "years": [2019, 2021]}, {"team": "Brighton", "years": [2021, 2023]}, {"team": "Chelsea", "years": [2023, 2025]}], "nationality": "Ecuador", "position": "Midfielder", "market_values": [{"year": 2023, "value": 90000000}]},
    {"name": "Reece James", "teams": [{"team": "Chelsea", "years": [2018, 2025]}], "nationality": "England", "position": "Defender", "market_values": [{"year": 2023, "value": 55000000}]},
    {"name": "Raheem Sterling", "teams": [{"team": "Liverpool", "years": [2010, 2015]}, {"team": "Manchester City", "years": [2015, 2022]}, {"team": "Chelsea", "years": [2022, 2025]}], "nationality": "England", "position": "Forward", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Thiago Silva", "teams": [{"team": "Fluminense", "years": [2006, 2009]}, {"team": "AC Milan", "years": [2009, 2012]}, {"team": "Paris Saint-Germain", "years": [2012, 2020]}, {"team": "Chelsea", "years": [2020, 2025]}], "nationality": "Brazil", "position": "Defender", "market_values": [{"year": 2023, "value": 3000000}]},
    {"name": "Noni Madueke", "teams": [{"team": "Tottenham", "years": [2015, 2018]}, {"team": "PSV", "years": [2018, 2023]}, {"team": "Chelsea", "years": [2023, 2025]}], "nationality": "England", "position": "Forward", "market_values": [{"year": 2023, "value": 40000000}]},
    
    # Tottenham
    {"name": "Son Heung-min", "teams": [{"team": "Hamburg", "years": [2010, 2013]}, {"team": "Bayer Leverkusen", "years": [2013, 2015]}, {"team": "Tottenham", "years": [2015, 2025]}], "nationality": "South Korea", "position": "Forward", "market_values": [{"year": 2023, "value": 60000000}]},
    {"name": "James Maddison", "teams": [{"team": "Coventry City", "years": [2014, 2016]}, {"team": "Norwich City", "years": [2016, 2018]}, {"team": "Leicester City", "years": [2018, 2023]}, {"team": "Tottenham", "years": [2023, 2025]}], "nationality": "England", "position": "Midfielder", "market_values": [{"year": 2023, "value": 55000000}]},
    {"name": "Cristian Romero", "teams": [{"team": "Belgrano", "years": [2016, 2018]}, {"team": "Genoa", "years": [2018, 2019]}, {"team": "Juventus", "years": [2019, 2021]}, {"team": "Atalanta", "years": [2020, 2021]}, {"team": "Tottenham", "years": [2021, 2025]}], "nationality": "Argentina", "position": "Defender", "market_values": [{"year": 2023, "value": 60000000}]},
    {"name": "Richarlison", "teams": [{"team": "Fluminense", "years": [2015, 2017]}, {"team": "Watford", "years": [2017, 2018]}, {"team": "Everton", "years": [2018, 2022]}, {"team": "Tottenham", "years": [2022, 2025]}], "nationality": "Brazil", "position": "Forward", "market_values": [{"year": 2023, "value": 50000000}]},
    {"name": "Dejan Kulusevski", "teams": [{"team": "Atalanta", "years": [2019, 2020]}, {"team": "Parma", "years": [2019, 2020]}, {"team": "Juventus", "years": [2020, 2022]}, {"team": "Tottenham", "years": [2022, 2025]}], "nationality": "Sweden", "position": "Forward", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Micky van de Ven", "teams": [{"team": "Volendam", "years": [2020, 2021]}, {"team": "Wolfsburg", "years": [2021, 2023]}, {"team": "Tottenham", "years": [2023, 2025]}], "nationality": "Netherlands", "position": "Defender", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Guglielmo Vicario", "teams": [{"team": "Empoli", "years": [2021, 2023]}, {"team": "Tottenham", "years": [2023, 2025]}], "nationality": "Italy", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 35000000}]},
    
    # Other Premier League
    {"name": "Ollie Watkins", "teams": [{"team": "Exeter City", "years": [2014, 2017]}, {"team": "Brentford", "years": [2017, 2020]}, {"team": "Aston Villa", "years": [2020, 2025]}], "nationality": "England", "position": "Forward", "market_values": [{"year": 2023, "value": 55000000}]},
    {"name": "Eberechi Eze", "teams": [{"team": "QPR", "years": [2016, 2020]}, {"team": "Crystal Palace", "years": [2020, 2025]}], "nationality": "England", "position": "Midfielder", "market_values": [{"year": 2023, "value": 55000000}]},
    {"name": "Michael Olise", "teams": [{"team": "Reading", "years": [2019, 2021]}, {"team": "Crystal Palace", "years": [2021, 2024]}, {"team": "Bayern Munich", "years": [2024, 2025]}], "nationality": "France", "position": "Midfielder", "market_values": [{"year": 2023, "value": 50000000}]},
    {"name": "Jarrod Bowen", "teams": [{"team": "Hull City", "years": [2014, 2020]}, {"team": "West Ham", "years": [2020, 2025]}], "nationality": "England", "position": "Forward", "market_values": [{"year": 2023, "value": 50000000}]},
    {"name": "Mohammed Kudus", "teams": [{"team": "Nordsjaelland", "years": [2018, 2020]}, {"team": "Ajax", "years": [2020, 2023]}, {"team": "West Ham", "years": [2023, 2025]}], "nationality": "Ghana", "position": "Midfielder", "market_values": [{"year": 2023, "value": 50000000}]},
    {"name": "Alexander Isak", "teams": [{"team": "AIK", "years": [2016, 2017]}, {"team": "Borussia Dortmund", "years": [2017, 2019]}, {"team": "Willem II", "years": [2019, 2019]}, {"team": "Real Sociedad", "years": [2019, 2022]}, {"team": "Newcastle", "years": [2022, 2025]}], "nationality": "Sweden", "position": "Forward", "market_values": [{"year": 2023, "value": 80000000}]},
    {"name": "Bruno Guimaraes", "teams": [{"team": "Athletico Paranaense", "years": [2017, 2020]}, {"team": "Lyon", "years": [2020, 2022]}, {"team": "Newcastle", "years": [2022, 2025]}], "nationality": "Brazil", "position": "Midfielder", "market_values": [{"year": 2023, "value": 80000000}]},
    {"name": "Sandro Tonali", "teams": [{"team": "Brescia", "years": [2017, 2020]}, {"team": "AC Milan", "years": [2020, 2023]}, {"team": "Newcastle", "years": [2023, 2025]}], "nationality": "Italy", "position": "Midfielder", "market_values": [{"year": 2023, "value": 55000000}]},
    {"name": "Dominik Szoboszlai", "teams": [{"team": "Red Bull Salzburg", "years": [2018, 2020]}, {"team": "RB Leipzig", "years": [2020, 2023]}, {"team": "Liverpool", "years": [2023, 2025]}], "nationality": "Hungary", "position": "Midfielder", "market_values": [{"year": 2023, "value": 65000000}]},
    {"name": "Alexis Mac Allister", "teams": [{"team": "Argentinos Juniors", "years": [2016, 2019]}, {"team": "Brighton", "years": [2019, 2023]}, {"team": "Liverpool", "years": [2023, 2025]}], "nationality": "Argentina", "position": "Midfielder", "market_values": [{"year": 2023, "value": 60000000}]},
    {"name": "Joao Pedro", "teams": [{"team": "Fluminense", "years": [2017, 2020]}, {"team": "Watford", "years": [2020, 2022]}, {"team": "Brighton", "years": [2022, 2025]}], "nationality": "Brazil", "position": "Forward", "market_values": [{"year": 2023, "value": 50000000}]},
    {"name": "Kaoru Mitoma", "teams": [{"team": "Kawasaki Frontale", "years": [2020, 2021]}, {"team": "Brighton", "years": [2021, 2025]}], "nationality": "Japan", "position": "Midfielder", "market_values": [{"year": 2023, "value": 55000000}]},
    
    # ============ LA LIGA ============
    # Real Madrid
    {"name": "Jude Bellingham", "teams": [{"team": "Birmingham City", "years": [2019, 2020]}, {"team": "Borussia Dortmund", "years": [2020, 2023]}, {"team": "Real Madrid", "years": [2023, 2025]}], "nationality": "England", "position": "Midfielder", "market_values": [{"year": 2023, "value": 180000000}]},
    {"name": "Vinicius Junior", "teams": [{"team": "Flamengo", "years": [2017, 2018]}, {"team": "Real Madrid", "years": [2018, 2025]}], "nationality": "Brazil", "position": "Forward", "market_values": [{"year": 2023, "value": 150000000}, {"year": 2024, "value": 200000000}]},
    {"name": "Kylian Mbappe", "teams": [{"team": "Monaco", "years": [2015, 2017]}, {"team": "Paris Saint-Germain", "years": [2017, 2024]}, {"team": "Real Madrid", "years": [2024, 2025]}], "nationality": "France", "position": "Forward", "market_values": [{"year": 2023, "value": 180000000}, {"year": 2024, "value": 180000000}]},
    {"name": "Federico Valverde", "teams": [{"team": "Penarol", "years": [2015, 2016]}, {"team": "Real Madrid", "years": [2016, 2025]}], "nationality": "Uruguay", "position": "Midfielder", "market_values": [{"year": 2023, "value": 120000000}]},
    {"name": "Toni Kroos", "teams": [{"team": "Bayern Munich", "years": [2007, 2014]}, {"team": "Real Madrid", "years": [2014, 2024]}], "nationality": "Germany", "position": "Midfielder", "market_values": [{"year": 2023, "value": 20000000}]},
    {"name": "Luka Modric", "teams": [{"team": "Dinamo Zagreb", "years": [2003, 2008]}, {"team": "Tottenham", "years": [2008, 2012]}, {"team": "Real Madrid", "years": [2012, 2025]}], "nationality": "Croatia", "position": "Midfielder", "market_values": [{"year": 2023, "value": 10000000}]},
    {"name": "Antonio Rudiger", "teams": [{"team": "Stuttgart", "years": [2011, 2015]}, {"team": "Roma", "years": [2015, 2017]}, {"team": "Chelsea", "years": [2017, 2022]}, {"team": "Real Madrid", "years": [2022, 2025]}], "nationality": "Germany", "position": "Defender", "market_values": [{"year": 2023, "value": 35000000}]},
    {"name": "David Alaba", "teams": [{"team": "Bayern Munich", "years": [2009, 2021]}, {"team": "Real Madrid", "years": [2021, 2025]}], "nationality": "Austria", "position": "Defender", "market_values": [{"year": 2023, "value": 25000000}]},
    {"name": "Thibaut Courtois", "teams": [{"team": "Genk", "years": [2009, 2011]}, {"team": "Atletico Madrid", "years": [2011, 2014]}, {"team": "Chelsea", "years": [2014, 2018]}, {"team": "Real Madrid", "years": [2018, 2025]}], "nationality": "Belgium", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 30000000}]},
    {"name": "Eduardo Camavinga", "teams": [{"team": "Rennes", "years": [2018, 2021]}, {"team": "Real Madrid", "years": [2021, 2025]}], "nationality": "France", "position": "Midfielder", "market_values": [{"year": 2023, "value": 80000000}]},
    {"name": "Aurelien Tchouameni", "teams": [{"team": "Bordeaux", "years": [2018, 2020]}, {"team": "Monaco", "years": [2020, 2022]}, {"team": "Real Madrid", "years": [2022, 2025]}], "nationality": "France", "position": "Midfielder", "market_values": [{"year": 2023, "value": 80000000}]},
    {"name": "Rodrygo", "teams": [{"team": "Santos", "years": [2017, 2019]}, {"team": "Real Madrid", "years": [2019, 2025]}], "nationality": "Brazil", "position": "Forward", "market_values": [{"year": 2023, "value": 100000000}]},
    {"name": "Arda Guler", "teams": [{"team": "Fenerbahce", "years": [2021, 2023]}, {"team": "Real Madrid", "years": [2023, 2025]}], "nationality": "Turkey", "position": "Midfielder", "market_values": [{"year": 2023, "value": 35000000}, {"year": 2024, "value": 55000000}]},
    {"name": "Endrick", "teams": [{"team": "Palmeiras", "years": [2022, 2024]}, {"team": "Real Madrid", "years": [2024, 2025]}], "nationality": "Brazil", "position": "Forward", "market_values": [{"year": 2024, "value": 60000000}]},
    
    # Barcelona
    {"name": "Lamine Yamal", "teams": [{"team": "Barcelona", "years": [2023, 2025]}], "nationality": "Spain", "position": "Forward", "market_values": [{"year": 2024, "value": 150000000}]},
    {"name": "Pedri", "teams": [{"team": "Las Palmas", "years": [2018, 2020]}, {"team": "Barcelona", "years": [2020, 2025]}], "nationality": "Spain", "position": "Midfielder", "market_values": [{"year": 2023, "value": 100000000}]},
    {"name": "Gavi", "teams": [{"team": "Barcelona", "years": [2021, 2025]}], "nationality": "Spain", "position": "Midfielder", "market_values": [{"year": 2023, "value": 90000000}]},
    {"name": "Raphinha", "teams": [{"team": "Sporting CP", "years": [2018, 2019]}, {"team": "Rennes", "years": [2019, 2020]}, {"team": "Leeds United", "years": [2020, 2022]}, {"team": "Barcelona", "years": [2022, 2025]}], "nationality": "Brazil", "position": "Forward", "market_values": [{"year": 2023, "value": 60000000}]},
    {"name": "Robert Lewandowski", "teams": [{"team": "Znicz Pruszkow", "years": [2006, 2008]}, {"team": "Lech Poznan", "years": [2008, 2010]}, {"team": "Borussia Dortmund", "years": [2010, 2014]}, {"team": "Bayern Munich", "years": [2014, 2022]}, {"team": "Barcelona", "years": [2022, 2025]}], "nationality": "Poland", "position": "Forward", "market_values": [{"year": 2023, "value": 30000000}]},
    {"name": "Frenkie de Jong", "teams": [{"team": "Willem II", "years": [2015, 2016]}, {"team": "Ajax", "years": [2016, 2019]}, {"team": "Barcelona", "years": [2019, 2025]}], "nationality": "Netherlands", "position": "Midfielder", "market_values": [{"year": 2023, "value": 60000000}]},
    {"name": "Ronald Araujo", "teams": [{"team": "Boston River", "years": [2018, 2018]}, {"team": "Barcelona", "years": [2018, 2025]}], "nationality": "Uruguay", "position": "Defender", "market_values": [{"year": 2023, "value": 70000000}]},
    {"name": "Jules Kounde", "teams": [{"team": "Bordeaux", "years": [2018, 2019]}, {"team": "Sevilla", "years": [2019, 2022]}, {"team": "Barcelona", "years": [2022, 2025]}], "nationality": "France", "position": "Defender", "market_values": [{"year": 2023, "value": 60000000}]},
    {"name": "Marc-Andre ter Stegen", "teams": [{"team": "Borussia Monchengladbach", "years": [2011, 2014]}, {"team": "Barcelona", "years": [2014, 2025]}], "nationality": "Germany", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 25000000}]},
    {"name": "Joao Cancelo", "teams": [{"team": "Benfica", "years": [2014, 2015]}, {"team": "Valencia", "years": [2015, 2017]}, {"team": "Inter Milan", "years": [2017, 2018]}, {"team": "Juventus", "years": [2018, 2019]}, {"team": "Manchester City", "years": [2019, 2023]}, {"team": "Bayern Munich", "years": [2023, 2023]}, {"team": "Barcelona", "years": [2023, 2025]}], "nationality": "Portugal", "position": "Defender", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Ferran Torres", "teams": [{"team": "Valencia", "years": [2017, 2020]}, {"team": "Manchester City", "years": [2020, 2022]}, {"team": "Barcelona", "years": [2022, 2025]}], "nationality": "Spain", "position": "Forward", "market_values": [{"year": 2023, "value": 35000000}]},
    {"name": "Pau Cubarsi", "teams": [{"team": "Barcelona", "years": [2023, 2025]}], "nationality": "Spain", "position": "Defender", "market_values": [{"year": 2024, "value": 60000000}]},
    {"name": "Dani Olmo", "teams": [{"team": "Barcelona", "years": [2007, 2014]}, {"team": "Dinamo Zagreb", "years": [2014, 2020]}, {"team": "RB Leipzig", "years": [2020, 2024]}, {"team": "Barcelona", "years": [2024, 2025]}], "nationality": "Spain", "position": "Midfielder", "market_values": [{"year": 2024, "value": 60000000}]},
    
    # Atletico Madrid
    {"name": "Antoine Griezmann", "teams": [{"team": "Real Sociedad", "years": [2009, 2014]}, {"team": "Atletico Madrid", "years": [2014, 2019]}, {"team": "Barcelona", "years": [2019, 2021]}, {"team": "Atletico Madrid", "years": [2021, 2025]}], "nationality": "France", "position": "Forward", "market_values": [{"year": 2023, "value": 30000000}]},
    {"name": "Alvaro Morata", "teams": [{"team": "Real Madrid", "years": [2010, 2014]}, {"team": "Juventus", "years": [2014, 2016]}, {"team": "Real Madrid", "years": [2016, 2017]}, {"team": "Chelsea", "years": [2017, 2019]}, {"team": "Atletico Madrid", "years": [2019, 2022]}, {"team": "Juventus", "years": [2020, 2022]}, {"team": "Atletico Madrid", "years": [2022, 2024]}, {"team": "AC Milan", "years": [2024, 2025]}], "nationality": "Spain", "position": "Forward", "market_values": [{"year": 2023, "value": 25000000}]},
    {"name": "Jan Oblak", "teams": [{"team": "Benfica", "years": [2010, 2014]}, {"team": "Atletico Madrid", "years": [2014, 2025]}], "nationality": "Slovenia", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 30000000}]},
    {"name": "Koke", "teams": [{"team": "Atletico Madrid", "years": [2009, 2025]}], "nationality": "Spain", "position": "Midfielder", "market_values": [{"year": 2023, "value": 10000000}]},
    {"name": "Jose Maria Gimenez", "teams": [{"team": "Danubio", "years": [2011, 2013]}, {"team": "Atletico Madrid", "years": [2013, 2025]}], "nationality": "Uruguay", "position": "Defender", "market_values": [{"year": 2023, "value": 30000000}]},
    {"name": "Marcos Llorente", "teams": [{"team": "Real Madrid", "years": [2015, 2019]}, {"team": "Alaves", "years": [2017, 2018]}, {"team": "Atletico Madrid", "years": [2019, 2025]}], "nationality": "Spain", "position": "Midfielder", "market_values": [{"year": 2023, "value": 30000000}]},
    {"name": "Julian Alvarez", "teams": [{"team": "River Plate", "years": [2018, 2022]}, {"team": "Manchester City", "years": [2022, 2024]}, {"team": "Atletico Madrid", "years": [2024, 2025]}], "nationality": "Argentina", "position": "Forward", "market_values": [{"year": 2024, "value": 90000000}]},
    
    # Other La Liga
    {"name": "Mikel Merino", "teams": [{"team": "Osasuna", "years": [2015, 2016]}, {"team": "Borussia Dortmund", "years": [2016, 2017]}, {"team": "Newcastle", "years": [2017, 2018]}, {"team": "Real Sociedad", "years": [2018, 2024]}, {"team": "Arsenal", "years": [2024, 2025]}], "nationality": "Spain", "position": "Midfielder", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Nico Williams", "teams": [{"team": "Athletic Bilbao", "years": [2021, 2025]}], "nationality": "Spain", "position": "Forward", "market_values": [{"year": 2024, "value": 70000000}]},
    {"name": "Inaki Williams", "teams": [{"team": "Athletic Bilbao", "years": [2014, 2025]}], "nationality": "Ghana", "position": "Forward", "market_values": [{"year": 2023, "value": 25000000}]},
    {"name": "Unai Simon", "teams": [{"team": "Athletic Bilbao", "years": [2018, 2025]}], "nationality": "Spain", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 35000000}]},
    {"name": "Yeremy Pino", "teams": [{"team": "Villarreal", "years": [2020, 2025]}], "nationality": "Spain", "position": "Forward", "market_values": [{"year": 2023, "value": 50000000}]},
    {"name": "Youssef En-Nesyri", "teams": [{"team": "Malaga", "years": [2015, 2018]}, {"team": "Leganes", "years": [2018, 2020]}, {"team": "Sevilla", "years": [2020, 2024]}, {"team": "Fenerbahce", "years": [2024, 2025]}], "nationality": "Morocco", "position": "Forward", "market_values": [{"year": 2023, "value": 30000000}]},
    
    # ============ SERIE A ============
    # Inter Milan
    {"name": "Lautaro Martinez", "teams": [{"team": "Racing Club", "years": [2015, 2018]}, {"team": "Inter Milan", "years": [2018, 2025]}], "nationality": "Argentina", "position": "Forward", "market_values": [{"year": 2023, "value": 100000000}]},
    {"name": "Marcus Thuram", "teams": [{"team": "Sochaux", "years": [2016, 2017]}, {"team": "Guingamp", "years": [2017, 2019]}, {"team": "Borussia Monchengladbach", "years": [2019, 2023]}, {"team": "Inter Milan", "years": [2023, 2025]}], "nationality": "France", "position": "Forward", "market_values": [{"year": 2023, "value": 55000000}]},
    {"name": "Nicolo Barella", "teams": [{"team": "Cagliari", "years": [2015, 2019]}, {"team": "Inter Milan", "years": [2019, 2025]}], "nationality": "Italy", "position": "Midfielder", "market_values": [{"year": 2023, "value": 80000000}]},
    {"name": "Hakan Calhanoglu", "teams": [{"team": "Karlsruher", "years": [2011, 2013]}, {"team": "Hamburg", "years": [2013, 2014]}, {"team": "Bayer Leverkusen", "years": [2014, 2017]}, {"team": "AC Milan", "years": [2017, 2021]}, {"team": "Inter Milan", "years": [2021, 2025]}], "nationality": "Turkey", "position": "Midfielder", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Alessandro Bastoni", "teams": [{"team": "Inter Milan", "years": [2017, 2025]}], "nationality": "Italy", "position": "Defender", "market_values": [{"year": 2023, "value": 70000000}]},
    {"name": "Federico Dimarco", "teams": [{"team": "Inter Milan", "years": [2015, 2025]}], "nationality": "Italy", "position": "Defender", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Yann Sommer", "teams": [{"team": "Basel", "years": [2009, 2014]}, {"team": "Borussia Monchengladbach", "years": [2014, 2023]}, {"team": "Bayern Munich", "years": [2023, 2023]}, {"team": "Inter Milan", "years": [2023, 2025]}], "nationality": "Switzerland", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 5000000}]},
    {"name": "Henrikh Mkhitaryan", "teams": [{"team": "Shakhtar Donetsk", "years": [2010, 2013]}, {"team": "Borussia Dortmund", "years": [2013, 2016]}, {"team": "Manchester United", "years": [2016, 2018]}, {"team": "Arsenal", "years": [2018, 2019]}, {"team": "Roma", "years": [2019, 2022]}, {"team": "Inter Milan", "years": [2022, 2025]}], "nationality": "Armenia", "position": "Midfielder", "market_values": [{"year": 2023, "value": 8000000}]},
    
    # AC Milan
    {"name": "Rafael Leao", "teams": [{"team": "Sporting CP", "years": [2017, 2018]}, {"team": "Lille", "years": [2018, 2019]}, {"team": "AC Milan", "years": [2019, 2025]}], "nationality": "Portugal", "position": "Forward", "market_values": [{"year": 2023, "value": 100000000}]},
    {"name": "Christian Pulisic", "teams": [{"team": "Borussia Dortmund", "years": [2015, 2019]}, {"team": "Chelsea", "years": [2019, 2023]}, {"team": "AC Milan", "years": [2023, 2025]}], "nationality": "USA", "position": "Forward", "market_values": [{"year": 2023, "value": 40000000}]},
    {"name": "Theo Hernandez", "teams": [{"team": "Atletico Madrid", "years": [2016, 2017]}, {"team": "Real Madrid", "years": [2017, 2019]}, {"team": "AC Milan", "years": [2019, 2025]}], "nationality": "France", "position": "Defender", "market_values": [{"year": 2023, "value": 55000000}]},
    {"name": "Mike Maignan", "teams": [{"team": "Paris Saint-Germain", "years": [2013, 2015]}, {"team": "Lille", "years": [2015, 2021]}, {"team": "AC Milan", "years": [2021, 2025]}], "nationality": "France", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 35000000}]},
    {"name": "Tijjani Reijnders", "teams": [{"team": "AZ Alkmaar", "years": [2019, 2023]}, {"team": "AC Milan", "years": [2023, 2025]}], "nationality": "Netherlands", "position": "Midfielder", "market_values": [{"year": 2023, "value": 35000000}]},
    {"name": "Fikayo Tomori", "teams": [{"team": "Chelsea", "years": [2016, 2021]}, {"team": "Derby County", "years": [2018, 2019]}, {"team": "AC Milan", "years": [2021, 2025]}], "nationality": "England", "position": "Defender", "market_values": [{"year": 2023, "value": 40000000}]},
    
    # Juventus
    {"name": "Dusan Vlahovic", "teams": [{"team": "Partizan", "years": [2016, 2018]}, {"team": "Fiorentina", "years": [2018, 2022]}, {"team": "Juventus", "years": [2022, 2025]}], "nationality": "Serbia", "position": "Forward", "market_values": [{"year": 2023, "value": 80000000}]},
    {"name": "Federico Chiesa", "teams": [{"team": "Fiorentina", "years": [2016, 2020]}, {"team": "Juventus", "years": [2020, 2024]}, {"team": "Liverpool", "years": [2024, 2025]}], "nationality": "Italy", "position": "Forward", "market_values": [{"year": 2023, "value": 55000000}]},
    {"name": "Kenan Yildiz", "teams": [{"team": "Bayern Munich", "years": [2019, 2022]}, {"team": "Juventus", "years": [2022, 2025]}], "nationality": "Turkey", "position": "Forward", "market_values": [{"year": 2024, "value": 50000000}]},
    {"name": "Gleison Bremer", "teams": [{"team": "Atletico Mineiro", "years": [2017, 2018]}, {"team": "Torino", "years": [2018, 2022]}, {"team": "Juventus", "years": [2022, 2025]}], "nationality": "Brazil", "position": "Defender", "market_values": [{"year": 2023, "value": 50000000}]},
    {"name": "Wojciech Szczesny", "teams": [{"team": "Arsenal", "years": [2009, 2017]}, {"team": "Roma", "years": [2015, 2017]}, {"team": "Juventus", "years": [2017, 2024]}, {"team": "Barcelona", "years": [2024, 2025]}], "nationality": "Poland", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 10000000}]},
    {"name": "Andrea Cambiaso", "teams": [{"team": "Genoa", "years": [2019, 2021]}, {"team": "Bologna", "years": [2021, 2022]}, {"team": "Juventus", "years": [2022, 2025]}], "nationality": "Italy", "position": "Defender", "market_values": [{"year": 2023, "value": 35000000}]},
    {"name": "Teun Koopmeiners", "teams": [{"team": "AZ Alkmaar", "years": [2018, 2021]}, {"team": "Atalanta", "years": [2021, 2024]}, {"team": "Juventus", "years": [2024, 2025]}], "nationality": "Netherlands", "position": "Midfielder", "market_values": [{"year": 2024, "value": 55000000}]},
    {"name": "Timothy Weah", "teams": [{"team": "Paris Saint-Germain", "years": [2017, 2019]}, {"team": "Celtic", "years": [2019, 2019]}, {"team": "Lille", "years": [2019, 2023]}, {"team": "Juventus", "years": [2023, 2025]}], "nationality": "USA", "position": "Forward", "market_values": [{"year": 2023, "value": 18000000}]},
    
    # Napoli
    {"name": "Khvicha Kvaratskhelia", "teams": [{"team": "Dinamo Tbilisi", "years": [2017, 2019]}, {"team": "Rubin Kazan", "years": [2019, 2022]}, {"team": "Dinamo Batumi", "years": [2022, 2022]}, {"team": "Napoli", "years": [2022, 2025]}], "nationality": "Georgia", "position": "Forward", "market_values": [{"year": 2023, "value": 85000000}]},
    {"name": "Victor Osimhen", "teams": [{"team": "Wolfsburg", "years": [2017, 2018]}, {"team": "Charleroi", "years": [2018, 2019]}, {"team": "Lille", "years": [2019, 2020]}, {"team": "Napoli", "years": [2020, 2025]}], "nationality": "Nigeria", "position": "Forward", "market_values": [{"year": 2023, "value": 110000000}]},
    {"name": "Giovanni Di Lorenzo", "teams": [{"team": "Empoli", "years": [2017, 2019]}, {"team": "Napoli", "years": [2019, 2025]}], "nationality": "Italy", "position": "Defender", "market_values": [{"year": 2023, "value": 35000000}]},
    {"name": "Stanislav Lobotka", "teams": [{"team": "Nordsjaelland", "years": [2014, 2017]}, {"team": "Celta Vigo", "years": [2017, 2020]}, {"team": "Napoli", "years": [2020, 2025]}], "nationality": "Slovakia", "position": "Midfielder", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Frank Anguissa", "teams": [{"team": "Reims", "years": [2015, 2018]}, {"team": "Marseille", "years": [2018, 2018]}, {"team": "Villarreal", "years": [2018, 2019]}, {"team": "Fulham", "years": [2018, 2022]}, {"team": "Napoli", "years": [2022, 2025]}], "nationality": "Cameroon", "position": "Midfielder", "market_values": [{"year": 2023, "value": 35000000}]},
    
    # Other Serie A
    {"name": "Ademola Lookman", "teams": [{"team": "Charlton", "years": [2015, 2017]}, {"team": "Everton", "years": [2017, 2019]}, {"team": "RB Leipzig", "years": [2019, 2020]}, {"team": "Fulham", "years": [2020, 2022]}, {"team": "Leicester City", "years": [2021, 2022]}, {"team": "Atalanta", "years": [2022, 2025]}], "nationality": "Nigeria", "position": "Forward", "market_values": [{"year": 2023, "value": 55000000}]},
    {"name": "Gianluca Scamacca", "teams": [{"team": "Sassuolo", "years": [2017, 2022]}, {"team": "West Ham", "years": [2022, 2023]}, {"team": "Atalanta", "years": [2023, 2025]}], "nationality": "Italy", "position": "Forward", "market_values": [{"year": 2023, "value": 35000000}]},
    {"name": "Riccardo Calafiori", "teams": [{"team": "Roma", "years": [2018, 2022]}, {"team": "Basel", "years": [2022, 2023]}, {"team": "Bologna", "years": [2023, 2024]}, {"team": "Arsenal", "years": [2024, 2025]}], "nationality": "Italy", "position": "Defender", "market_values": [{"year": 2024, "value": 50000000}]},
    {"name": "Paulo Dybala", "teams": [{"team": "Instituto", "years": [2011, 2012]}, {"team": "Palermo", "years": [2012, 2015]}, {"team": "Juventus", "years": [2015, 2022]}, {"team": "Roma", "years": [2022, 2025]}], "nationality": "Argentina", "position": "Forward", "market_values": [{"year": 2023, "value": 30000000}]},
    {"name": "Artem Dovbyk", "teams": [{"team": "Dnipro-1", "years": [2019, 2023]}, {"team": "Girona", "years": [2023, 2024]}, {"team": "Roma", "years": [2024, 2025]}], "nationality": "Ukraine", "position": "Forward", "market_values": [{"year": 2024, "value": 40000000}]},
    {"name": "Mattia Zaccagni", "teams": [{"team": "Hellas Verona", "years": [2018, 2021]}, {"team": "Lazio", "years": [2021, 2025]}], "nationality": "Italy", "position": "Midfielder", "market_values": [{"year": 2023, "value": 25000000}]},
    
    # ============ BUNDESLIGA ============
    # Bayern Munich
    {"name": "Harry Kane", "teams": [{"team": "Tottenham", "years": [2011, 2023]}, {"team": "Bayern Munich", "years": [2023, 2025]}], "nationality": "England", "position": "Forward", "market_values": [{"year": 2023, "value": 100000000}]},
    {"name": "Jamal Musiala", "teams": [{"team": "Chelsea", "years": [2016, 2019]}, {"team": "Bayern Munich", "years": [2019, 2025]}], "nationality": "Germany", "position": "Midfielder", "market_values": [{"year": 2023, "value": 110000000}, {"year": 2024, "value": 130000000}]},
    {"name": "Florian Wirtz", "teams": [{"team": "Bayer Leverkusen", "years": [2020, 2025]}], "nationality": "Germany", "position": "Midfielder", "market_values": [{"year": 2023, "value": 100000000}, {"year": 2024, "value": 150000000}]},
    {"name": "Leroy Sane", "teams": [{"team": "Schalke 04", "years": [2014, 2016]}, {"team": "Manchester City", "years": [2016, 2020]}, {"team": "Bayern Munich", "years": [2020, 2025]}], "nationality": "Germany", "position": "Forward", "market_values": [{"year": 2023, "value": 60000000}]},
    {"name": "Serge Gnabry", "teams": [{"team": "Arsenal", "years": [2012, 2016]}, {"team": "Werder Bremen", "years": [2016, 2017]}, {"team": "Bayern Munich", "years": [2017, 2025]}], "nationality": "Germany", "position": "Forward", "market_values": [{"year": 2023, "value": 55000000}]},
    {"name": "Joshua Kimmich", "teams": [{"team": "RB Leipzig", "years": [2013, 2015]}, {"team": "Bayern Munich", "years": [2015, 2025]}], "nationality": "Germany", "position": "Midfielder", "market_values": [{"year": 2023, "value": 70000000}]},
    {"name": "Alphonso Davies", "teams": [{"team": "Vancouver Whitecaps", "years": [2016, 2018]}, {"team": "Bayern Munich", "years": [2018, 2025]}], "nationality": "Canada", "position": "Defender", "market_values": [{"year": 2023, "value": 70000000}]},
    {"name": "Kim Min-jae", "teams": [{"team": "Jeonbuk Hyundai", "years": [2017, 2019]}, {"team": "Beijing Guoan", "years": [2019, 2021]}, {"team": "Fenerbahce", "years": [2021, 2022]}, {"team": "Napoli", "years": [2022, 2023]}, {"team": "Bayern Munich", "years": [2023, 2025]}], "nationality": "South Korea", "position": "Defender", "market_values": [{"year": 2023, "value": 65000000}]},
    {"name": "Manuel Neuer", "teams": [{"team": "Schalke 04", "years": [2004, 2011]}, {"team": "Bayern Munich", "years": [2011, 2025]}], "nationality": "Germany", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 8000000}]},
    {"name": "Thomas Muller", "teams": [{"team": "Bayern Munich", "years": [2008, 2025]}], "nationality": "Germany", "position": "Forward", "market_values": [{"year": 2023, "value": 15000000}]},
    {"name": "Matthijs de Ligt", "teams": [{"team": "Ajax", "years": [2016, 2019]}, {"team": "Juventus", "years": [2019, 2022]}, {"team": "Bayern Munich", "years": [2022, 2025]}], "nationality": "Netherlands", "position": "Defender", "market_values": [{"year": 2023, "value": 55000000}]},
    {"name": "Leon Goretzka", "teams": [{"team": "Bochum", "years": [2012, 2013]}, {"team": "Schalke 04", "years": [2013, 2018]}, {"team": "Bayern Munich", "years": [2018, 2025]}], "nationality": "Germany", "position": "Midfielder", "market_values": [{"year": 2023, "value": 45000000}]},
    
    # Bayer Leverkusen
    {"name": "Xabi Alonso", "teams": [{"team": "Real Sociedad", "years": [1999, 2004]}, {"team": "Liverpool", "years": [2004, 2009]}, {"team": "Real Madrid", "years": [2009, 2014]}, {"team": "Bayern Munich", "years": [2014, 2017]}], "nationality": "Spain", "position": "Midfielder", "market_values": [{"year": 2015, "value": 15000000}]},
    {"name": "Granit Xhaka", "teams": [{"team": "Basel", "years": [2010, 2012]}, {"team": "Borussia Monchengladbach", "years": [2012, 2016]}, {"team": "Arsenal", "years": [2016, 2023]}, {"team": "Bayer Leverkusen", "years": [2023, 2025]}], "nationality": "Switzerland", "position": "Midfielder", "market_values": [{"year": 2023, "value": 35000000}]},
    {"name": "Victor Boniface", "teams": [{"team": "Union St. Gilloise", "years": [2022, 2023]}, {"team": "Bayer Leverkusen", "years": [2023, 2025]}], "nationality": "Nigeria", "position": "Forward", "market_values": [{"year": 2024, "value": 45000000}]},
    {"name": "Jeremie Frimpong", "teams": [{"team": "Manchester City", "years": [2019, 2020]}, {"team": "Celtic", "years": [2019, 2021]}, {"team": "Bayer Leverkusen", "years": [2021, 2025]}], "nationality": "Netherlands", "position": "Defender", "market_values": [{"year": 2024, "value": 45000000}]},
    {"name": "Jonathan Tah", "teams": [{"team": "Hamburg", "years": [2013, 2015]}, {"team": "Bayer Leverkusen", "years": [2015, 2025]}], "nationality": "Germany", "position": "Defender", "market_values": [{"year": 2024, "value": 30000000}]},
    {"name": "Exequiel Palacios", "teams": [{"team": "River Plate", "years": [2015, 2020]}, {"team": "Bayer Leverkusen", "years": [2020, 2025]}], "nationality": "Argentina", "position": "Midfielder", "market_values": [{"year": 2023, "value": 30000000}]},
    
    # Borussia Dortmund
    {"name": "Marco Reus", "teams": [{"team": "Rot Weiss Ahlen", "years": [2006, 2009]}, {"team": "Borussia Monchengladbach", "years": [2009, 2012]}, {"team": "Borussia Dortmund", "years": [2012, 2024]}, {"team": "LA Galaxy", "years": [2024, 2025]}], "nationality": "Germany", "position": "Midfielder", "market_values": [{"year": 2023, "value": 10000000}]},
    {"name": "Julian Brandt", "teams": [{"team": "Bayer Leverkusen", "years": [2014, 2019]}, {"team": "Borussia Dortmund", "years": [2019, 2025]}], "nationality": "Germany", "position": "Midfielder", "market_values": [{"year": 2023, "value": 35000000}]},
    {"name": "Karim Adeyemi", "teams": [{"team": "Red Bull Salzburg", "years": [2018, 2022]}, {"team": "Borussia Dortmund", "years": [2022, 2025]}], "nationality": "Germany", "position": "Forward", "market_values": [{"year": 2023, "value": 35000000}]},
    {"name": "Gregor Kobel", "teams": [{"team": "Hoffenheim", "years": [2017, 2019]}, {"team": "Augsburg", "years": [2019, 2019]}, {"team": "Stuttgart", "years": [2019, 2021]}, {"team": "Borussia Dortmund", "years": [2021, 2025]}], "nationality": "Switzerland", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 40000000}]},
    {"name": "Mats Hummels", "teams": [{"team": "Bayern Munich", "years": [2007, 2008]}, {"team": "Borussia Dortmund", "years": [2008, 2016]}, {"team": "Bayern Munich", "years": [2016, 2019]}, {"team": "Borussia Dortmund", "years": [2019, 2024]}, {"team": "Roma", "years": [2024, 2025]}], "nationality": "Germany", "position": "Defender", "market_values": [{"year": 2023, "value": 3000000}]},
    {"name": "Niclas Fullkrug", "teams": [{"team": "Werder Bremen", "years": [2016, 2019]}, {"team": "Hannover 96", "years": [2019, 2020]}, {"team": "Werder Bremen", "years": [2020, 2023]}, {"team": "Borussia Dortmund", "years": [2023, 2024]}, {"team": "West Ham", "years": [2024, 2025]}], "nationality": "Germany", "position": "Forward", "market_values": [{"year": 2023, "value": 25000000}]},
    {"name": "Jamie Gittens", "teams": [{"team": "Manchester City", "years": [2020, 2020]}, {"team": "Borussia Dortmund", "years": [2020, 2025]}], "nationality": "England", "position": "Forward", "market_values": [{"year": 2024, "value": 35000000}]},
    
    # RB Leipzig
    {"name": "Xavi Simons", "teams": [{"team": "Barcelona", "years": [2016, 2019]}, {"team": "Paris Saint-Germain", "years": [2019, 2022]}, {"team": "PSV", "years": [2022, 2023]}, {"team": "RB Leipzig", "years": [2023, 2025]}], "nationality": "Netherlands", "position": "Midfielder", "market_values": [{"year": 2024, "value": 70000000}]},
    {"name": "Benjamin Sesko", "teams": [{"team": "Red Bull Salzburg", "years": [2019, 2023]}, {"team": "RB Leipzig", "years": [2023, 2025]}], "nationality": "Slovenia", "position": "Forward", "market_values": [{"year": 2024, "value": 50000000}]},
    {"name": "David Raum", "teams": [{"team": "Hoffenheim", "years": [2021, 2022]}, {"team": "RB Leipzig", "years": [2022, 2025]}], "nationality": "Germany", "position": "Defender", "market_values": [{"year": 2023, "value": 30000000}]},
    {"name": "Lois Openda", "teams": [{"team": "Club Brugge", "years": [2018, 2021]}, {"team": "Vitesse", "years": [2020, 2021]}, {"team": "Lens", "years": [2021, 2023]}, {"team": "RB Leipzig", "years": [2023, 2025]}], "nationality": "Belgium", "position": "Forward", "market_values": [{"year": 2024, "value": 50000000}]},
    
    # Other Bundesliga
    {"name": "Deniz Undav", "teams": [{"team": "Meppen", "years": [2019, 2021]}, {"team": "Union St. Gilloise", "years": [2021, 2023]}, {"team": "Brighton", "years": [2023, 2024]}, {"team": "Stuttgart", "years": [2024, 2025]}], "nationality": "Germany", "position": "Forward", "market_values": [{"year": 2024, "value": 30000000}]},
    {"name": "Serhou Guirassy", "teams": [{"team": "Auxerre", "years": [2013, 2016]}, {"team": "Cologne", "years": [2016, 2017]}, {"team": "Amiens", "years": [2017, 2019]}, {"team": "Rennes", "years": [2019, 2021]}, {"team": "Stuttgart", "years": [2021, 2024]}, {"team": "Borussia Dortmund", "years": [2024, 2025]}], "nationality": "Guinea", "position": "Forward", "market_values": [{"year": 2024, "value": 50000000}]},
    {"name": "Chris Fuhrich", "teams": [{"team": "Borussia Dortmund", "years": [2017, 2019]}, {"team": "Paderborn", "years": [2019, 2021]}, {"team": "Stuttgart", "years": [2021, 2025]}], "nationality": "Germany", "position": "Forward", "market_values": [{"year": 2024, "value": 25000000}]},
    {"name": "Omar Marmoush", "teams": [{"team": "Wolfsburg", "years": [2017, 2022]}, {"team": "Stuttgart", "years": [2021, 2022]}, {"team": "Eintracht Frankfurt", "years": [2023, 2025]}], "nationality": "Egypt", "position": "Forward", "market_values": [{"year": 2024, "value": 45000000}]},
    {"name": "Hugo Ekitike", "teams": [{"team": "Reims", "years": [2019, 2022]}, {"team": "Paris Saint-Germain", "years": [2022, 2024]}, {"team": "Eintracht Frankfurt", "years": [2023, 2025]}], "nationality": "France", "position": "Forward", "market_values": [{"year": 2024, "value": 25000000}]},
    
    # ============ LIGUE 1 ============
    # Paris Saint-Germain
    {"name": "Ousmane Dembele", "teams": [{"team": "Rennes", "years": [2015, 2016]}, {"team": "Borussia Dortmund", "years": [2016, 2017]}, {"team": "Barcelona", "years": [2017, 2023]}, {"team": "Paris Saint-Germain", "years": [2023, 2025]}], "nationality": "France", "position": "Forward", "market_values": [{"year": 2023, "value": 70000000}]},
    {"name": "Goncalo Ramos", "teams": [{"team": "Benfica", "years": [2020, 2023]}, {"team": "Paris Saint-Germain", "years": [2023, 2025]}], "nationality": "Portugal", "position": "Forward", "market_values": [{"year": 2023, "value": 50000000}]},
    {"name": "Marquinhos", "teams": [{"team": "Corinthians", "years": [2012, 2013]}, {"team": "Roma", "years": [2013, 2013]}, {"team": "Paris Saint-Germain", "years": [2013, 2025]}], "nationality": "Brazil", "position": "Defender", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Achraf Hakimi", "teams": [{"team": "Real Madrid", "years": [2016, 2020]}, {"team": "Borussia Dortmund", "years": [2018, 2020]}, {"team": "Inter Milan", "years": [2020, 2021]}, {"team": "Paris Saint-Germain", "years": [2021, 2025]}], "nationality": "Morocco", "position": "Defender", "market_values": [{"year": 2023, "value": 60000000}]},
    {"name": "Vitinha", "teams": [{"team": "Porto", "years": [2020, 2022]}, {"team": "Wolverhampton", "years": [2021, 2021]}, {"team": "Paris Saint-Germain", "years": [2022, 2025]}], "nationality": "Portugal", "position": "Midfielder", "market_values": [{"year": 2023, "value": 60000000}]},
    {"name": "Warren Zaire-Emery", "teams": [{"team": "Paris Saint-Germain", "years": [2022, 2025]}], "nationality": "France", "position": "Midfielder", "market_values": [{"year": 2024, "value": 60000000}]},
    {"name": "Gianluigi Donnarumma", "teams": [{"team": "AC Milan", "years": [2015, 2021]}, {"team": "Paris Saint-Germain", "years": [2021, 2025]}], "nationality": "Italy", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 40000000}]},
    {"name": "Randal Kolo Muani", "teams": [{"team": "Nantes", "years": [2018, 2022]}, {"team": "Eintracht Frankfurt", "years": [2022, 2023]}, {"team": "Paris Saint-Germain", "years": [2023, 2025]}], "nationality": "France", "position": "Forward", "market_values": [{"year": 2023, "value": 60000000}]},
    {"name": "Bradley Barcola", "teams": [{"team": "Lyon", "years": [2021, 2023]}, {"team": "Paris Saint-Germain", "years": [2023, 2025]}], "nationality": "France", "position": "Forward", "market_values": [{"year": 2024, "value": 60000000}]},
    {"name": "Joao Neves", "teams": [{"team": "Benfica", "years": [2022, 2024]}, {"team": "Paris Saint-Germain", "years": [2024, 2025]}], "nationality": "Portugal", "position": "Midfielder", "market_values": [{"year": 2024, "value": 70000000}]},
    
    # Other Ligue 1
    {"name": "Jonathan David", "teams": [{"team": "Gent", "years": [2018, 2020]}, {"team": "Lille", "years": [2020, 2025]}], "nationality": "Canada", "position": "Forward", "market_values": [{"year": 2023, "value": 55000000}]},
    {"name": "Pierre-Emerick Aubameyang", "teams": [{"team": "AC Milan", "years": [2007, 2011]}, {"team": "Saint-Etienne", "years": [2011, 2013]}, {"team": "Borussia Dortmund", "years": [2013, 2018]}, {"team": "Arsenal", "years": [2018, 2022]}, {"team": "Barcelona", "years": [2022, 2022]}, {"team": "Chelsea", "years": [2022, 2023]}, {"team": "Marseille", "years": [2023, 2024]}, {"team": "Al-Qadsiah", "years": [2024, 2025]}], "nationality": "Gabon", "position": "Forward", "market_values": [{"year": 2023, "value": 10000000}]},
    {"name": "Rayan Cherki", "teams": [{"team": "Lyon", "years": [2019, 2025]}], "nationality": "France", "position": "Midfielder", "market_values": [{"year": 2024, "value": 30000000}]},
    {"name": "Mohamed-Ali Cho", "teams": [{"team": "Angers", "years": [2020, 2022]}, {"team": "Real Sociedad", "years": [2022, 2024]}, {"team": "Nice", "years": [2024, 2025]}], "nationality": "France", "position": "Forward", "market_values": [{"year": 2023, "value": 25000000}]},
    {"name": "Elye Wahi", "teams": [{"team": "Montpellier", "years": [2020, 2023]}, {"team": "Lens", "years": [2023, 2024]}, {"team": "Marseille", "years": [2024, 2025]}], "nationality": "France", "position": "Forward", "market_values": [{"year": 2024, "value": 30000000}]},
    {"name": "Desire Doue", "teams": [{"team": "Rennes", "years": [2022, 2024]}, {"team": "Paris Saint-Germain", "years": [2024, 2025]}], "nationality": "France", "position": "Midfielder", "market_values": [{"year": 2024, "value": 45000000}]},
    
    # ============ TURKEY - SUPER LIG ============
    {"name": "Arda Guler", "teams": [{"team": "Fenerbahce", "years": [2021, 2023]}, {"team": "Real Madrid", "years": [2023, 2025]}], "nationality": "Turkey", "position": "Midfielder", "market_values": [{"year": 2023, "value": 35000000}]},
    {"name": "Kenan Yildiz", "teams": [{"team": "Bayern Munich", "years": [2019, 2022]}, {"team": "Juventus", "years": [2022, 2025]}], "nationality": "Turkey", "position": "Forward", "market_values": [{"year": 2024, "value": 50000000}]},
    {"name": "Hakan Calhanoglu", "teams": [{"team": "Karlsruher", "years": [2011, 2013]}, {"team": "Hamburg", "years": [2013, 2014]}, {"team": "Bayer Leverkusen", "years": [2014, 2017]}, {"team": "AC Milan", "years": [2017, 2021]}, {"team": "Inter Milan", "years": [2021, 2025]}], "nationality": "Turkey", "position": "Midfielder", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Cengiz Under", "teams": [{"team": "Basaksehir", "years": [2016, 2017]}, {"team": "Roma", "years": [2017, 2021]}, {"team": "Leicester City", "years": [2020, 2021]}, {"team": "Marseille", "years": [2021, 2022]}, {"team": "Fenerbahce", "years": [2022, 2025]}], "nationality": "Turkey", "position": "Forward", "market_values": [{"year": 2023, "value": 10000000}]},
    {"name": "Irfan Can Kahveci", "teams": [{"team": "Genclerbirligi", "years": [2015, 2018]}, {"team": "Basaksehir", "years": [2018, 2021]}, {"team": "Fenerbahce", "years": [2021, 2025]}], "nationality": "Turkey", "position": "Midfielder", "market_values": [{"year": 2023, "value": 10000000}]},
    {"name": "Ferdi Kadioglu", "teams": [{"team": "NEC Nijmegen", "years": [2018, 2021]}, {"team": "Fenerbahce", "years": [2021, 2024]}, {"team": "Brighton", "years": [2024, 2025]}], "nationality": "Turkey", "position": "Defender", "market_values": [{"year": 2024, "value": 30000000}]},
    {"name": "Ugurcan Cakir", "teams": [{"team": "Trabzonspor", "years": [2016, 2025]}], "nationality": "Turkey", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 18000000}]},
    {"name": "Altay Bayindir", "teams": [{"team": "Ankaragucu", "years": [2018, 2019]}, {"team": "Fenerbahce", "years": [2019, 2023]}, {"team": "Manchester United", "years": [2023, 2025]}], "nationality": "Turkey", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 10000000}]},
    {"name": "Mert Gunok", "teams": [{"team": "Besiktas", "years": [2021, 2025]}], "nationality": "Turkey", "position": "Goalkeeper", "market_values": [{"year": 2023, "value": 3000000}]},
    {"name": "Merih Demiral", "teams": [{"team": "Sporting CP", "years": [2017, 2018]}, {"team": "Sassuolo", "years": [2018, 2019]}, {"team": "Juventus", "years": [2019, 2021]}, {"team": "Atalanta", "years": [2021, 2024]}, {"team": "Al-Ahli", "years": [2024, 2025]}], "nationality": "Turkey", "position": "Defender", "market_values": [{"year": 2023, "value": 20000000}]},
    {"name": "Orkun Kokcu", "teams": [{"team": "Feyenoord", "years": [2018, 2023]}, {"team": "Benfica", "years": [2023, 2025]}], "nationality": "Turkey", "position": "Midfielder", "market_values": [{"year": 2023, "value": 35000000}]},
    {"name": "Mauro Icardi", "teams": [{"team": "Sampdoria", "years": [2011, 2013]}, {"team": "Inter Milan", "years": [2013, 2020]}, {"team": "Paris Saint-Germain", "years": [2019, 2022]}, {"team": "Galatasaray", "years": [2022, 2025]}], "nationality": "Argentina", "position": "Forward", "market_values": [{"year": 2023, "value": 10000000}]},
    {"name": "Fred", "teams": [{"team": "Internacional", "years": [2013, 2016]}, {"team": "Shakhtar Donetsk", "years": [2016, 2018]}, {"team": "Manchester United", "years": [2018, 2023]}, {"team": "Fenerbahce", "years": [2023, 2025]}], "nationality": "Brazil", "position": "Midfielder", "market_values": [{"year": 2023, "value": 10000000}]},
    {"name": "Victor Osimhen", "teams": [{"team": "Wolfsburg", "years": [2017, 2018]}, {"team": "Charleroi", "years": [2018, 2019]}, {"team": "Lille", "years": [2019, 2020]}, {"team": "Napoli", "years": [2020, 2024]}, {"team": "Galatasaray", "years": [2024, 2025]}], "nationality": "Nigeria", "position": "Forward", "market_values": [{"year": 2024, "value": 75000000}]},
    {"name": "Baris Alper Yilmaz", "teams": [{"team": "Galatasaray", "years": [2021, 2025]}], "nationality": "Turkey", "position": "Forward", "market_values": [{"year": 2024, "value": 18000000}]},
    {"name": "Edin Dzeko", "teams": [{"team": "Teplice", "years": [2005, 2007]}, {"team": "Wolfsburg", "years": [2007, 2011]}, {"team": "Manchester City", "years": [2011, 2015]}, {"team": "Roma", "years": [2015, 2021]}, {"team": "Inter Milan", "years": [2021, 2023]}, {"team": "Fenerbahce", "years": [2023, 2025]}], "nationality": "Bosnia and Herzegovina", "position": "Forward", "market_values": [{"year": 2023, "value": 5000000}]},
    
    # ============ PORTUGAL - PRIMEIRA LIGA ============
    {"name": "Gyokeres Viktor", "teams": [{"team": "Brighton", "years": [2018, 2021]}, {"team": "Coventry City", "years": [2021, 2023]}, {"team": "Sporting CP", "years": [2023, 2025]}], "nationality": "Sweden", "position": "Forward", "market_values": [{"year": 2024, "value": 70000000}]},
    {"name": "Ruben Neves", "teams": [{"team": "Porto", "years": [2014, 2017]}, {"team": "Wolverhampton", "years": [2017, 2023]}, {"team": "Al-Hilal", "years": [2023, 2025]}], "nationality": "Portugal", "position": "Midfielder", "market_values": [{"year": 2023, "value": 50000000}]},
    {"name": "Pepe", "teams": [{"team": "Maritimo", "years": [2002, 2004]}, {"team": "Porto", "years": [2004, 2007]}, {"team": "Real Madrid", "years": [2007, 2017]}, {"team": "Besiktas", "years": [2017, 2019]}, {"team": "Porto", "years": [2019, 2024]}], "nationality": "Portugal", "position": "Defender", "market_values": [{"year": 2023, "value": 1000000}]},
    {"name": "Ruben Amorim", "teams": [{"team": "Benfica", "years": [2003, 2008]}, {"team": "Belenenses", "years": [2008, 2012]}, {"team": "Benfica", "years": [2012, 2017]}, {"team": "Casa Pia", "years": [2018, 2019]}], "nationality": "Portugal", "position": "Midfielder", "market_values": [{"year": 2015, "value": 5000000}]},
    
    # ============ NETHERLANDS - EREDIVISIE ============
    {"name": "Memphis Depay", "teams": [{"team": "PSV", "years": [2011, 2015]}, {"team": "Manchester United", "years": [2015, 2017]}, {"team": "Lyon", "years": [2017, 2021]}, {"team": "Barcelona", "years": [2021, 2023]}, {"team": "Atletico Madrid", "years": [2023, 2024]}, {"team": "Corinthians", "years": [2024, 2025]}], "nationality": "Netherlands", "position": "Forward", "market_values": [{"year": 2023, "value": 15000000}]},
    {"name": "Lutsharel Geertruida", "teams": [{"team": "Feyenoord", "years": [2019, 2025]}], "nationality": "Netherlands", "position": "Defender", "market_values": [{"year": 2024, "value": 30000000}]},
    {"name": "Quinten Timber", "teams": [{"team": "Ajax", "years": [2020, 2023]}, {"team": "Feyenoord", "years": [2023, 2025]}], "nationality": "Netherlands", "position": "Midfielder", "market_values": [{"year": 2024, "value": 20000000}]},
    {"name": "Jurrien Timber", "teams": [{"team": "Ajax", "years": [2020, 2023]}, {"team": "Arsenal", "years": [2023, 2025]}], "nationality": "Netherlands", "position": "Defender", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Ryan Gravenberch", "teams": [{"team": "Ajax", "years": [2018, 2022]}, {"team": "Bayern Munich", "years": [2022, 2023]}, {"team": "Liverpool", "years": [2023, 2025]}], "nationality": "Netherlands", "position": "Midfielder", "market_values": [{"year": 2023, "value": 35000000}]},
    
    # ============ LEGENDS & ICONS ============
    {"name": "Lionel Messi", "teams": [{"team": "Barcelona", "years": [2004, 2021]}, {"team": "Paris Saint-Germain", "years": [2021, 2023]}, {"team": "Inter Miami", "years": [2023, 2025]}], "nationality": "Argentina", "position": "Forward", "market_values": [{"year": 2023, "value": 45000000}]},
    {"name": "Cristiano Ronaldo", "teams": [{"team": "Sporting CP", "years": [2002, 2003]}, {"team": "Manchester United", "years": [2003, 2009]}, {"team": "Real Madrid", "years": [2009, 2018]}, {"team": "Juventus", "years": [2018, 2021]}, {"team": "Manchester United", "years": [2021, 2022]}, {"team": "Al-Nassr", "years": [2023, 2025]}], "nationality": "Portugal", "position": "Forward", "market_values": [{"year": 2023, "value": 20000000}]},
    {"name": "Neymar", "teams": [{"team": "Santos", "years": [2009, 2013]}, {"team": "Barcelona", "years": [2013, 2017]}, {"team": "Paris Saint-Germain", "years": [2017, 2023]}, {"team": "Al-Hilal", "years": [2023, 2025]}], "nationality": "Brazil", "position": "Forward", "market_values": [{"year": 2023, "value": 40000000}]},
    {"name": "Sergio Ramos", "teams": [{"team": "Sevilla", "years": [2003, 2005]}, {"team": "Real Madrid", "years": [2005, 2021]}, {"team": "Paris Saint-Germain", "years": [2021, 2023]}, {"team": "Sevilla", "years": [2023, 2024]}], "nationality": "Spain", "position": "Defender", "market_values": [{"year": 2023, "value": 3000000}]},
    {"name": "Karim Benzema", "teams": [{"team": "Lyon", "years": [2005, 2009]}, {"team": "Real Madrid", "years": [2009, 2023]}, {"team": "Al-Ittihad", "years": [2023, 2025]}], "nationality": "France", "position": "Forward", "market_values": [{"year": 2023, "value": 15000000}]},
    {"name": "Luka Modric", "teams": [{"team": "Dinamo Zagreb", "years": [2003, 2008]}, {"team": "Tottenham", "years": [2008, 2012]}, {"team": "Real Madrid", "years": [2012, 2025]}], "nationality": "Croatia", "position": "Midfielder", "market_values": [{"year": 2023, "value": 10000000}]},
    {"name": "N'Golo Kante", "teams": [{"team": "Boulogne", "years": [2012, 2013]}, {"team": "Caen", "years": [2013, 2015]}, {"team": "Leicester City", "years": [2015, 2016]}, {"team": "Chelsea", "years": [2016, 2023]}, {"team": "Al-Ittihad", "years": [2023, 2025]}], "nationality": "France", "position": "Midfielder", "market_values": [{"year": 2023, "value": 20000000}]},
    {"name": "Sadio Mane", "teams": [{"team": "Metz", "years": [2011, 2012]}, {"team": "Red Bull Salzburg", "years": [2012, 2014]}, {"team": "Southampton", "years": [2014, 2016]}, {"team": "Liverpool", "years": [2016, 2022]}, {"team": "Bayern Munich", "years": [2022, 2023]}, {"team": "Al-Nassr", "years": [2023, 2025]}], "nationality": "Senegal", "position": "Forward", "market_values": [{"year": 2023, "value": 15000000}]},
    {"name": "Eden Hazard", "teams": [{"team": "Lille", "years": [2007, 2012]}, {"team": "Chelsea", "years": [2012, 2019]}, {"team": "Real Madrid", "years": [2019, 2023]}], "nationality": "Belgium", "position": "Forward", "market_values": [{"year": 2023, "value": 5000000}]},
    {"name": "Sergio Busquets", "teams": [{"team": "Barcelona", "years": [2008, 2023]}, {"team": "Inter Miami", "years": [2023, 2025]}], "nationality": "Spain", "position": "Midfielder", "market_values": [{"year": 2023, "value": 3000000}]},
    {"name": "Gerard Pique", "teams": [{"team": "Manchester United", "years": [2004, 2008]}, {"team": "Barcelona", "years": [2008, 2022]}], "nationality": "Spain", "position": "Defender", "market_values": [{"year": 2022, "value": 5000000}]},
    {"name": "Andres Iniesta", "teams": [{"team": "Barcelona", "years": [2002, 2018]}, {"team": "Vissel Kobe", "years": [2018, 2023]}], "nationality": "Spain", "position": "Midfielder", "market_values": [{"year": 2018, "value": 35000000}]},
    {"name": "Xavi Hernandez", "teams": [{"team": "Barcelona", "years": [1998, 2015]}, {"team": "Al-Sadd", "years": [2015, 2019]}], "nationality": "Spain", "position": "Midfielder", "market_values": [{"year": 2015, "value": 10000000}]},
    {"name": "Zlatan Ibrahimovic", "teams": [{"team": "Malmo", "years": [1999, 2001]}, {"team": "Ajax", "years": [2001, 2004]}, {"team": "Juventus", "years": [2004, 2006]}, {"team": "Inter Milan", "years": [2006, 2009]}, {"team": "Barcelona", "years": [2009, 2011]}, {"team": "AC Milan", "years": [2010, 2012]}, {"team": "Paris Saint-Germain", "years": [2012, 2016]}, {"team": "Manchester United", "years": [2016, 2018]}, {"team": "LA Galaxy", "years": [2018, 2019]}, {"team": "AC Milan", "years": [2020, 2023]}], "nationality": "Sweden", "position": "Forward", "market_values": [{"year": 2023, "value": 2000000}]},
    {"name": "David Beckham", "teams": [{"team": "Manchester United", "years": [1992, 2003]}, {"team": "Real Madrid", "years": [2003, 2007]}, {"team": "LA Galaxy", "years": [2007, 2012]}, {"team": "AC Milan", "years": [2009, 2010]}, {"team": "Paris Saint-Germain", "years": [2013, 2013]}], "nationality": "England", "position": "Midfielder", "market_values": [{"year": 2007, "value": 25000000}]},
    {"name": "Wayne Rooney", "teams": [{"team": "Everton", "years": [2002, 2004]}, {"team": "Manchester United", "years": [2004, 2017]}, {"team": "Everton", "years": [2017, 2018]}, {"team": "DC United", "years": [2018, 2019]}, {"team": "Derby County", "years": [2020, 2021]}], "nationality": "England", "position": "Forward", "market_values": [{"year": 2015, "value": 40000000}]},
    {"name": "Steven Gerrard", "teams": [{"team": "Liverpool", "years": [1998, 2015]}, {"team": "LA Galaxy", "years": [2015, 2016]}], "nationality": "England", "position": "Midfielder", "market_values": [{"year": 2010, "value": 40000000}]},
    {"name": "Frank Lampard", "teams": [{"team": "West Ham", "years": [1995, 2001]}, {"team": "Chelsea", "years": [2001, 2014]}, {"team": "Manchester City", "years": [2014, 2015]}, {"team": "New York City FC", "years": [2015, 2017]}], "nationality": "England", "position": "Midfielder", "market_values": [{"year": 2010, "value": 35000000}]},
    {"name": "Ronaldinho", "teams": [{"team": "Gremio", "years": [1998, 2001]}, {"team": "Paris Saint-Germain", "years": [2001, 2003]}, {"team": "Barcelona", "years": [2003, 2008]}, {"team": "AC Milan", "years": [2008, 2011]}, {"team": "Flamengo", "years": [2011, 2012]}, {"team": "Atletico Mineiro", "years": [2012, 2014]}], "nationality": "Brazil", "position": "Midfielder", "market_values": [{"year": 2006, "value": 80000000}]},
    {"name": "Kaka", "teams": [{"team": "Sao Paulo", "years": [2001, 2003]}, {"team": "AC Milan", "years": [2003, 2009]}, {"team": "Real Madrid", "years": [2009, 2013]}, {"team": "AC Milan", "years": [2013, 2014]}, {"team": "Orlando City", "years": [2014, 2017]}], "nationality": "Brazil", "position": "Midfielder", "market_values": [{"year": 2009, "value": 65000000}]},
    {"name": "Thierry Henry", "teams": [{"team": "Monaco", "years": [1994, 1999]}, {"team": "Juventus", "years": [1999, 1999]}, {"team": "Arsenal", "years": [1999, 2007]}, {"team": "Barcelona", "years": [2007, 2010]}, {"team": "New York Red Bulls", "years": [2010, 2014]}, {"team": "Arsenal", "years": [2012, 2012]}], "nationality": "France", "position": "Forward", "market_values": [{"year": 2006, "value": 50000000}]},
    {"name": "Paolo Maldini", "teams": [{"team": "AC Milan", "years": [1985, 2009]}], "nationality": "Italy", "position": "Defender", "market_values": [{"year": 2000, "value": 30000000}]},
    {"name": "Alessandro Del Piero", "teams": [{"team": "Juventus", "years": [1993, 2012]}, {"team": "Sydney FC", "years": [2012, 2014]}, {"team": "Delhi Dynamos", "years": [2014, 2015]}], "nationality": "Italy", "position": "Forward", "market_values": [{"year": 2005, "value": 35000000}]},
    {"name": "Francesco Totti", "teams": [{"team": "Roma", "years": [1993, 2017]}], "nationality": "Italy", "position": "Forward", "market_values": [{"year": 2007, "value": 45000000}]},
    {"name": "Andrea Pirlo", "teams": [{"team": "Brescia", "years": [1995, 1998]}, {"team": "Inter Milan", "years": [1998, 2001]}, {"team": "Brescia", "years": [1999, 2001]}, {"team": "AC Milan", "years": [2001, 2011]}, {"team": "Juventus", "years": [2011, 2015]}, {"team": "New York City FC", "years": [2015, 2017]}], "nationality": "Italy", "position": "Midfielder", "market_values": [{"year": 2010, "value": 30000000}]},
    {"name": "Gianluigi Buffon", "teams": [{"team": "Parma", "years": [1995, 2001]}, {"team": "Juventus", "years": [2001, 2018]}, {"team": "Paris Saint-Germain", "years": [2018, 2019]}, {"team": "Juventus", "years": [2019, 2021]}, {"team": "Parma", "years": [2021, 2023]}], "nationality": "Italy", "position": "Goalkeeper", "market_values": [{"year": 2010, "value": 25000000}]},
    {"name": "Didier Drogba", "teams": [{"team": "Le Mans", "years": [2001, 2003]}, {"team": "Guingamp", "years": [2002, 2003]}, {"team": "Marseille", "years": [2003, 2004]}, {"team": "Chelsea", "years": [2004, 2012]}, {"team": "Shanghai Shenhua", "years": [2012, 2012]}, {"team": "Galatasaray", "years": [2013, 2014]}, {"team": "Chelsea", "years": [2014, 2015]}, {"team": "Montreal Impact", "years": [2015, 2016]}, {"team": "Phoenix Rising", "years": [2017, 2018]}], "nationality": "Ivory Coast", "position": "Forward", "market_values": [{"year": 2010, "value": 35000000}]},
    {"name": "Samuel Eto'o", "teams": [{"team": "Real Madrid", "years": [1997, 2000]}, {"team": "Mallorca", "years": [2000, 2004]}, {"team": "Barcelona", "years": [2004, 2009]}, {"team": "Inter Milan", "years": [2009, 2011]}, {"team": "Anzhi Makhachkala", "years": [2011, 2013]}, {"team": "Chelsea", "years": [2013, 2014]}, {"team": "Everton", "years": [2014, 2015]}, {"team": "Sampdoria", "years": [2015, 2015]}, {"team": "Antalyaspor", "years": [2015, 2018]}], "nationality": "Cameroon", "position": "Forward", "market_values": [{"year": 2009, "value": 50000000}]},
]

async def seed_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client['test_database']
    
    # Clear existing players
    await db.players.delete_many({})
    print("Cleared existing players...")
    
    # Add player_id to each player
    players_with_ids = []
    for i, player in enumerate(PLAYERS):
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
    print(f"\nTotal players in database: {total}")
    
    # Count by nationality
    nationalities = await db.players.aggregate([
        {"$group": {"_id": "$nationality", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 15}
    ]).to_list(15)
    
    print("\nTop nationalities:")
    for nat in nationalities:
        print(f"  {nat['_id']}: {nat['count']} players")
    
    # Count by teams (unique teams)
    all_teams = set()
    async for player in db.players.find():
        for team in player.get('teams', []):
            all_teams.add(team['team'])
    print(f"\nUnique teams represented: {len(all_teams)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
