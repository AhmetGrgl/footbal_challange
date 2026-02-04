"""
Popular Football Players for Career Path Game
Sadece 5 büyük lig + Türkiye'den yıldız oyuncular
"""

POPULAR_PLAYERS = [
    # ============ REAL MADRID ============
    {
        "name": "Jude Bellingham",
        "team_history": [
            {"team": "Birmingham City", "years": "2019-2020", "logo": "🔵"},
            {"team": "Borussia Dortmund", "years": "2020-2023", "logo": "🟡"},
            {"team": "Real Madrid", "years": "2023-", "logo": "⚪"}
        ],
        "nationality": "İngiltere",
        "position": "Orta Saha",
        "age": 21,
        "current_team": "Real Madrid",
        "difficulty": "easy"
    },
    {
        "name": "Vinícius Júnior",
        "team_history": [
            {"team": "Flamengo", "years": "2017-2018", "logo": "🔴"},
            {"team": "Real Madrid", "years": "2018-", "logo": "⚪"}
        ],
        "nationality": "Brezilya",
        "position": "Sol Kanat",
        "age": 24,
        "current_team": "Real Madrid",
        "difficulty": "easy"
    },
    {
        "name": "Kylian Mbappé",
        "team_history": [
            {"team": "Monaco", "years": "2015-2017", "logo": "🔴"},
            {"team": "Paris Saint-Germain", "years": "2017-2024", "logo": "🔵"},
            {"team": "Real Madrid", "years": "2024-", "logo": "⚪"}
        ],
        "nationality": "Fransa",
        "position": "Forvet",
        "age": 25,
        "current_team": "Real Madrid",
        "difficulty": "easy"
    },
    {
        "name": "Luka Modrić",
        "team_history": [
            {"team": "Dinamo Zagreb", "years": "2003-2008", "logo": "🔵"},
            {"team": "Tottenham", "years": "2008-2012", "logo": "⚪"},
            {"team": "Real Madrid", "years": "2012-", "logo": "⚪"}
        ],
        "nationality": "Hırvatistan",
        "position": "Orta Saha",
        "age": 39,
        "current_team": "Real Madrid",
        "difficulty": "medium"
    },
    {
        "name": "Thibaut Courtois",
        "team_history": [
            {"team": "Genk", "years": "2009-2011", "logo": "🔵"},
            {"team": "Atlético Madrid", "years": "2011-2014", "logo": "🔴"},
            {"team": "Chelsea", "years": "2014-2018", "logo": "🔵"},
            {"team": "Real Madrid", "years": "2018-", "logo": "⚪"}
        ],
        "nationality": "Belçika",
        "position": "Kaleci",
        "age": 32,
        "current_team": "Real Madrid",
        "difficulty": "medium"
    },
    {
        "name": "Arda Güler",
        "team_history": [
            {"team": "Fenerbahçe", "years": "2021-2023", "logo": "🟡"},
            {"team": "Real Madrid", "years": "2023-", "logo": "⚪"}
        ],
        "nationality": "Türkiye",
        "position": "Orta Saha",
        "age": 19,
        "current_team": "Real Madrid",
        "difficulty": "easy"
    },
    
    # ============ BARCELONA ============
    {
        "name": "Lamine Yamal",
        "team_history": [
            {"team": "Barcelona", "years": "2023-", "logo": "🔵"}
        ],
        "nationality": "İspanya",
        "position": "Sağ Kanat",
        "age": 17,
        "current_team": "Barcelona",
        "difficulty": "easy"
    },
    {
        "name": "Robert Lewandowski",
        "team_history": [
            {"team": "Lech Poznań", "years": "2008-2010", "logo": "🔵"},
            {"team": "Borussia Dortmund", "years": "2010-2014", "logo": "🟡"},
            {"team": "Bayern Münih", "years": "2014-2022", "logo": "🔴"},
            {"team": "Barcelona", "years": "2022-", "logo": "🔵"}
        ],
        "nationality": "Polonya",
        "position": "Forvet",
        "age": 36,
        "current_team": "Barcelona",
        "difficulty": "easy"
    },
    {
        "name": "Pedri",
        "team_history": [
            {"team": "Las Palmas", "years": "2018-2020", "logo": "🟡"},
            {"team": "Barcelona", "years": "2020-", "logo": "🔵"}
        ],
        "nationality": "İspanya",
        "position": "Orta Saha",
        "age": 21,
        "current_team": "Barcelona",
        "difficulty": "easy"
    },
    {
        "name": "Frenkie de Jong",
        "team_history": [
            {"team": "Willem II", "years": "2015-2016", "logo": "🔴"},
            {"team": "Ajax", "years": "2016-2019", "logo": "⚪"},
            {"team": "Barcelona", "years": "2019-", "logo": "🔵"}
        ],
        "nationality": "Hollanda",
        "position": "Orta Saha",
        "age": 27,
        "current_team": "Barcelona",
        "difficulty": "medium"
    },
    
    # ============ MANCHESTER CITY ============
    {
        "name": "Erling Haaland",
        "team_history": [
            {"team": "Molde", "years": "2017-2019", "logo": "🔵"},
            {"team": "Red Bull Salzburg", "years": "2019-2020", "logo": "🔴"},
            {"team": "Borussia Dortmund", "years": "2020-2022", "logo": "🟡"},
            {"team": "Manchester City", "years": "2022-", "logo": "🔵"}
        ],
        "nationality": "Norveç",
        "position": "Forvet",
        "age": 24,
        "current_team": "Manchester City",
        "difficulty": "easy"
    },
    {
        "name": "Kevin De Bruyne",
        "team_history": [
            {"team": "Genk", "years": "2008-2012", "logo": "🔵"},
            {"team": "Chelsea", "years": "2012-2014", "logo": "🔵"},
            {"team": "Wolfsburg", "years": "2014-2015", "logo": "🟢"},
            {"team": "Manchester City", "years": "2015-", "logo": "🔵"}
        ],
        "nationality": "Belçika",
        "position": "Orta Saha",
        "age": 33,
        "current_team": "Manchester City",
        "difficulty": "easy"
    },
    {
        "name": "Phil Foden",
        "team_history": [
            {"team": "Manchester City", "years": "2017-", "logo": "🔵"}
        ],
        "nationality": "İngiltere",
        "position": "Orta Saha",
        "age": 24,
        "current_team": "Manchester City",
        "difficulty": "easy"
    },
    {
        "name": "Rodri",
        "team_history": [
            {"team": "Villarreal", "years": "2015-2018", "logo": "🟡"},
            {"team": "Atlético Madrid", "years": "2018-2019", "logo": "🔴"},
            {"team": "Manchester City", "years": "2019-", "logo": "🔵"}
        ],
        "nationality": "İspanya",
        "position": "Defansif Orta Saha",
        "age": 28,
        "current_team": "Manchester City",
        "difficulty": "medium"
    },
    
    # ============ LIVERPOOL ============
    {
        "name": "Mohamed Salah",
        "team_history": [
            {"team": "Basel", "years": "2012-2014", "logo": "🔴"},
            {"team": "Chelsea", "years": "2014-2016", "logo": "🔵"},
            {"team": "Fiorentina", "years": "2015 (Kiralık)", "logo": "🟣"},
            {"team": "Roma", "years": "2015-2017", "logo": "🟡"},
            {"team": "Liverpool", "years": "2017-", "logo": "🔴"}
        ],
        "nationality": "Mısır",
        "position": "Sağ Kanat",
        "age": 32,
        "current_team": "Liverpool",
        "difficulty": "easy"
    },
    {
        "name": "Virgil van Dijk",
        "team_history": [
            {"team": "Groningen", "years": "2010-2013", "logo": "🟢"},
            {"team": "Celtic", "years": "2013-2015", "logo": "🟢"},
            {"team": "Southampton", "years": "2015-2018", "logo": "🔴"},
            {"team": "Liverpool", "years": "2018-", "logo": "🔴"}
        ],
        "nationality": "Hollanda",
        "position": "Stoper",
        "age": 33,
        "current_team": "Liverpool",
        "difficulty": "easy"
    },
    {
        "name": "Trent Alexander-Arnold",
        "team_history": [
            {"team": "Liverpool", "years": "2016-", "logo": "🔴"}
        ],
        "nationality": "İngiltere",
        "position": "Sağ Bek",
        "age": 26,
        "current_team": "Liverpool",
        "difficulty": "easy"
    },
    
    # ============ ARSENAL ============
    {
        "name": "Bukayo Saka",
        "team_history": [
            {"team": "Arsenal", "years": "2018-", "logo": "🔴"}
        ],
        "nationality": "İngiltere",
        "position": "Sağ Kanat",
        "age": 23,
        "current_team": "Arsenal",
        "difficulty": "easy"
    },
    {
        "name": "Martin Ødegaard",
        "team_history": [
            {"team": "Strømsgodset", "years": "2014-2015", "logo": "🔵"},
            {"team": "Real Madrid", "years": "2015-2021", "logo": "⚪"},
            {"team": "Heerenveen", "years": "2017 (Kiralık)", "logo": "🔵"},
            {"team": "Vitesse", "years": "2018-2019 (Kiralık)", "logo": "🟡"},
            {"team": "Real Sociedad", "years": "2019-2020 (Kiralık)", "logo": "🔵"},
            {"team": "Arsenal", "years": "2021-", "logo": "🔴"}
        ],
        "nationality": "Norveç",
        "position": "Orta Saha",
        "age": 25,
        "current_team": "Arsenal",
        "difficulty": "medium"
    },
    {
        "name": "Declan Rice",
        "team_history": [
            {"team": "West Ham", "years": "2017-2023", "logo": "🟣"},
            {"team": "Arsenal", "years": "2023-", "logo": "🔴"}
        ],
        "nationality": "İngiltere",
        "position": "Defansif Orta Saha",
        "age": 25,
        "current_team": "Arsenal",
        "difficulty": "easy"
    },
    {
        "name": "William Saliba",
        "team_history": [
            {"team": "Saint-Étienne", "years": "2018-2019", "logo": "🟢"},
            {"team": "Arsenal", "years": "2019-", "logo": "🔴"},
            {"team": "Nice", "years": "2020-2021 (Kiralık)", "logo": "🔴"},
            {"team": "Marsilya", "years": "2021-2022 (Kiralık)", "logo": "🔵"}
        ],
        "nationality": "Fransa",
        "position": "Stoper",
        "age": 23,
        "current_team": "Arsenal",
        "difficulty": "medium"
    },
    
    # ============ BAYERN MÜNİH ============
    {
        "name": "Harry Kane",
        "team_history": [
            {"team": "Tottenham", "years": "2011-2023", "logo": "⚪"},
            {"team": "Leyton Orient", "years": "2011 (Kiralık)", "logo": "🔴"},
            {"team": "Millwall", "years": "2012 (Kiralık)", "logo": "🔵"},
            {"team": "Norwich", "years": "2012-2013 (Kiralık)", "logo": "🟡"},
            {"team": "Leicester", "years": "2013 (Kiralık)", "logo": "🔵"},
            {"team": "Bayern Münih", "years": "2023-", "logo": "🔴"}
        ],
        "nationality": "İngiltere",
        "position": "Forvet",
        "age": 31,
        "current_team": "Bayern Münih",
        "difficulty": "easy"
    },
    {
        "name": "Jamal Musiala",
        "team_history": [
            {"team": "Chelsea", "years": "2016-2019", "logo": "🔵"},
            {"team": "Bayern Münih", "years": "2019-", "logo": "🔴"}
        ],
        "nationality": "Almanya",
        "position": "Orta Saha",
        "age": 21,
        "current_team": "Bayern Münih",
        "difficulty": "easy"
    },
    {
        "name": "Joshua Kimmich",
        "team_history": [
            {"team": "RB Leipzig", "years": "2013-2015", "logo": "🔴"},
            {"team": "Bayern Münih", "years": "2015-", "logo": "🔴"}
        ],
        "nationality": "Almanya",
        "position": "Defansif Orta Saha",
        "age": 29,
        "current_team": "Bayern Münih",
        "difficulty": "medium"
    },
    {
        "name": "Manuel Neuer",
        "team_history": [
            {"team": "Schalke 04", "years": "2004-2011", "logo": "🔵"},
            {"team": "Bayern Münih", "years": "2011-", "logo": "🔴"}
        ],
        "nationality": "Almanya",
        "position": "Kaleci",
        "age": 38,
        "current_team": "Bayern Münih",
        "difficulty": "easy"
    },
    {
        "name": "Thomas Müller",
        "team_history": [
            {"team": "Bayern Münih", "years": "2008-", "logo": "🔴"}
        ],
        "nationality": "Almanya",
        "position": "İkinci Forvet",
        "age": 35,
        "current_team": "Bayern Münih",
        "difficulty": "easy"
    },
    
    # ============ PSG ============
    {
        "name": "Ousmane Dembélé",
        "team_history": [
            {"team": "Rennes", "years": "2015-2016", "logo": "🔴"},
            {"team": "Borussia Dortmund", "years": "2016-2017", "logo": "🟡"},
            {"team": "Barcelona", "years": "2017-2023", "logo": "🔵"},
            {"team": "Paris Saint-Germain", "years": "2023-", "logo": "🔵"}
        ],
        "nationality": "Fransa",
        "position": "Sağ Kanat",
        "age": 27,
        "current_team": "Paris Saint-Germain",
        "difficulty": "medium"
    },
    {
        "name": "Achraf Hakimi",
        "team_history": [
            {"team": "Real Madrid", "years": "2016-2020", "logo": "⚪"},
            {"team": "Borussia Dortmund", "years": "2018-2020 (Kiralık)", "logo": "🟡"},
            {"team": "Inter", "years": "2020-2021", "logo": "🔵"},
            {"team": "Paris Saint-Germain", "years": "2021-", "logo": "🔵"}
        ],
        "nationality": "Fas",
        "position": "Sağ Bek",
        "age": 25,
        "current_team": "Paris Saint-Germain",
        "difficulty": "medium"
    },
    {
        "name": "Gianluigi Donnarumma",
        "team_history": [
            {"team": "AC Milan", "years": "2015-2021", "logo": "🔴"},
            {"team": "Paris Saint-Germain", "years": "2021-", "logo": "🔵"}
        ],
        "nationality": "İtalya",
        "position": "Kaleci",
        "age": 25,
        "current_team": "Paris Saint-Germain",
        "difficulty": "easy"
    },
    
    # ============ INTER ============
    {
        "name": "Lautaro Martínez",
        "team_history": [
            {"team": "Racing Club", "years": "2015-2018", "logo": "🔵"},
            {"team": "Inter", "years": "2018-", "logo": "🔵"}
        ],
        "nationality": "Arjantin",
        "position": "Forvet",
        "age": 27,
        "current_team": "Inter",
        "difficulty": "easy"
    },
    {
        "name": "Hakan Çalhanoğlu",
        "team_history": [
            {"team": "Karlsruher SC", "years": "2011-2013", "logo": "🔵"},
            {"team": "Hamburg", "years": "2013-2014", "logo": "🔵"},
            {"team": "Bayer Leverkusen", "years": "2014-2017", "logo": "🔴"},
            {"team": "AC Milan", "years": "2017-2021", "logo": "🔴"},
            {"team": "Inter", "years": "2021-", "logo": "🔵"}
        ],
        "nationality": "Türkiye",
        "position": "Orta Saha",
        "age": 30,
        "current_team": "Inter",
        "difficulty": "easy"
    },
    {
        "name": "Nicolò Barella",
        "team_history": [
            {"team": "Cagliari", "years": "2015-2019", "logo": "🔴"},
            {"team": "Inter", "years": "2019-", "logo": "🔵"}
        ],
        "nationality": "İtalya",
        "position": "Orta Saha",
        "age": 27,
        "current_team": "Inter",
        "difficulty": "medium"
    },
    
    # ============ AC MILAN ============
    {
        "name": "Rafael Leão",
        "team_history": [
            {"team": "Sporting CP", "years": "2017-2018", "logo": "🟢"},
            {"team": "Lille", "years": "2018-2019", "logo": "🔴"},
            {"team": "AC Milan", "years": "2019-", "logo": "🔴"}
        ],
        "nationality": "Portekiz",
        "position": "Sol Kanat",
        "age": 25,
        "current_team": "AC Milan",
        "difficulty": "easy"
    },
    {
        "name": "Theo Hernández",
        "team_history": [
            {"team": "Atlético Madrid", "years": "2016-2017", "logo": "🔴"},
            {"team": "Real Madrid", "years": "2017-2019", "logo": "⚪"},
            {"team": "Real Sociedad", "years": "2017-2018 (Kiralık)", "logo": "🔵"},
            {"team": "AC Milan", "years": "2019-", "logo": "🔴"}
        ],
        "nationality": "Fransa",
        "position": "Sol Bek",
        "age": 27,
        "current_team": "AC Milan",
        "difficulty": "medium"
    },
    
    # ============ JUVENTUS ============
    {
        "name": "Dušan Vlahović",
        "team_history": [
            {"team": "Partizan", "years": "2016-2018", "logo": "⚫"},
            {"team": "Fiorentina", "years": "2018-2022", "logo": "🟣"},
            {"team": "Juventus", "years": "2022-", "logo": "⚫"}
        ],
        "nationality": "Sırbistan",
        "position": "Forvet",
        "age": 24,
        "current_team": "Juventus",
        "difficulty": "easy"
    },
    {
        "name": "Kenan Yıldız",
        "team_history": [
            {"team": "Bayern Münih", "years": "2019-2022", "logo": "🔴"},
            {"team": "Juventus", "years": "2022-", "logo": "⚫"}
        ],
        "nationality": "Türkiye",
        "position": "Sol Kanat",
        "age": 19,
        "current_team": "Juventus",
        "difficulty": "easy"
    },
    
    # ============ NAPOLI ============
    {
        "name": "Khvicha Kvaratskhelia",
        "team_history": [
            {"team": "Dinamo Tiflis", "years": "2017-2019", "logo": "🔵"},
            {"team": "Rubin Kazan", "years": "2019-2022", "logo": "🟢"},
            {"team": "Dinamo Batumi", "years": "2022 (Kiralık)", "logo": "🔵"},
            {"team": "Napoli", "years": "2022-", "logo": "🔵"}
        ],
        "nationality": "Gürcistan",
        "position": "Sol Kanat",
        "age": 23,
        "current_team": "Napoli",
        "difficulty": "medium"
    },
    {
        "name": "Victor Osimhen",
        "team_history": [
            {"team": "Wolfsburg", "years": "2017-2018", "logo": "🟢"},
            {"team": "Charleroi", "years": "2018-2019", "logo": "⚫"},
            {"team": "Lille", "years": "2019-2020", "logo": "🔴"},
            {"team": "Napoli", "years": "2020-2024", "logo": "🔵"},
            {"team": "Galatasaray", "years": "2024- (Kiralık)", "logo": "🟡"}
        ],
        "nationality": "Nijerya",
        "position": "Forvet",
        "age": 25,
        "current_team": "Galatasaray",
        "difficulty": "easy"
    },
    
    # ============ TOTTENHAM ============
    {
        "name": "Son Heung-min",
        "team_history": [
            {"team": "Hamburg", "years": "2010-2013", "logo": "🔵"},
            {"team": "Bayer Leverkusen", "years": "2013-2015", "logo": "🔴"},
            {"team": "Tottenham", "years": "2015-", "logo": "⚪"}
        ],
        "nationality": "Güney Kore",
        "position": "Sol Kanat",
        "age": 32,
        "current_team": "Tottenham",
        "difficulty": "easy"
    },
    {
        "name": "James Maddison",
        "team_history": [
            {"team": "Coventry", "years": "2014-2016", "logo": "🔵"},
            {"team": "Norwich", "years": "2016-2018", "logo": "🟡"},
            {"team": "Leicester", "years": "2018-2023", "logo": "🔵"},
            {"team": "Tottenham", "years": "2023-", "logo": "⚪"}
        ],
        "nationality": "İngiltere",
        "position": "Orta Saha",
        "age": 27,
        "current_team": "Tottenham",
        "difficulty": "medium"
    },
    
    # ============ CHELSEA ============
    {
        "name": "Cole Palmer",
        "team_history": [
            {"team": "Manchester City", "years": "2020-2023", "logo": "🔵"},
            {"team": "Chelsea", "years": "2023-", "logo": "🔵"}
        ],
        "nationality": "İngiltere",
        "position": "Orta Saha",
        "age": 22,
        "current_team": "Chelsea",
        "difficulty": "easy"
    },
    {
        "name": "Enzo Fernández",
        "team_history": [
            {"team": "River Plate", "years": "2019-2022", "logo": "🔴"},
            {"team": "Benfica", "years": "2022-2023", "logo": "🔴"},
            {"team": "Chelsea", "years": "2023-", "logo": "🔵"}
        ],
        "nationality": "Arjantin",
        "position": "Orta Saha",
        "age": 23,
        "current_team": "Chelsea",
        "difficulty": "easy"
    },
    
    # ============ MANCHESTER UNITED ============
    {
        "name": "Marcus Rashford",
        "team_history": [
            {"team": "Manchester United", "years": "2015-", "logo": "🔴"}
        ],
        "nationality": "İngiltere",
        "position": "Sol Kanat",
        "age": 27,
        "current_team": "Manchester United",
        "difficulty": "easy"
    },
    {
        "name": "Bruno Fernandes",
        "team_history": [
            {"team": "Novara", "years": "2012-2013", "logo": "🔵"},
            {"team": "Udinese", "years": "2013-2017", "logo": "⚫"},
            {"team": "Sampdoria", "years": "2016-2017 (Kiralık)", "logo": "🔵"},
            {"team": "Sporting CP", "years": "2017-2020", "logo": "🟢"},
            {"team": "Manchester United", "years": "2020-", "logo": "🔴"}
        ],
        "nationality": "Portekiz",
        "position": "Orta Saha",
        "age": 29,
        "current_team": "Manchester United",
        "difficulty": "easy"
    },
    {
        "name": "Casemiro",
        "team_history": [
            {"team": "São Paulo", "years": "2010-2013", "logo": "🔴"},
            {"team": "Real Madrid", "years": "2013-2022", "logo": "⚪"},
            {"team": "Porto", "years": "2014-2015 (Kiralık)", "logo": "🔵"},
            {"team": "Manchester United", "years": "2022-", "logo": "🔴"}
        ],
        "nationality": "Brezilya",
        "position": "Defansif Orta Saha",
        "age": 32,
        "current_team": "Manchester United",
        "difficulty": "medium"
    },
    
    # ============ BAYER LEVERKUSEN ============
    {
        "name": "Florian Wirtz",
        "team_history": [
            {"team": "1. FC Köln", "years": "2016-2020", "logo": "🔴"},
            {"team": "Bayer Leverkusen", "years": "2020-", "logo": "🔴"}
        ],
        "nationality": "Almanya",
        "position": "Orta Saha",
        "age": 21,
        "current_team": "Bayer Leverkusen",
        "difficulty": "easy"
    },
    {
        "name": "Granit Xhaka",
        "team_history": [
            {"team": "Basel", "years": "2010-2012", "logo": "🔴"},
            {"team": "Borussia M'gladbach", "years": "2012-2016", "logo": "🟢"},
            {"team": "Arsenal", "years": "2016-2023", "logo": "🔴"},
            {"team": "Bayer Leverkusen", "years": "2023-", "logo": "🔴"}
        ],
        "nationality": "İsviçre",
        "position": "Orta Saha",
        "age": 31,
        "current_team": "Bayer Leverkusen",
        "difficulty": "medium"
    },
    
    # ============ ATLÉTİCO MADRİD ============
    {
        "name": "Antoine Griezmann",
        "team_history": [
            {"team": "Real Sociedad", "years": "2009-2014", "logo": "🔵"},
            {"team": "Atlético Madrid", "years": "2014-2019", "logo": "🔴"},
            {"team": "Barcelona", "years": "2019-2021", "logo": "🔵"},
            {"team": "Atlético Madrid", "years": "2021-", "logo": "🔴"}
        ],
        "nationality": "Fransa",
        "position": "İkinci Forvet",
        "age": 33,
        "current_team": "Atlético Madrid",
        "difficulty": "easy"
    },
    {
        "name": "Julián Álvarez",
        "team_history": [
            {"team": "River Plate", "years": "2018-2022", "logo": "🔴"},
            {"team": "Manchester City", "years": "2022-2024", "logo": "🔵"},
            {"team": "Atlético Madrid", "years": "2024-", "logo": "🔴"}
        ],
        "nationality": "Arjantin",
        "position": "Forvet",
        "age": 24,
        "current_team": "Atlético Madrid",
        "difficulty": "easy"
    },
    {
        "name": "Jan Oblak",
        "team_history": [
            {"team": "Benfica", "years": "2010-2014", "logo": "🔴"},
            {"team": "Atlético Madrid", "years": "2014-", "logo": "🔴"}
        ],
        "nationality": "Slovenya",
        "position": "Kaleci",
        "age": 31,
        "current_team": "Atlético Madrid",
        "difficulty": "easy"
    },
    
    # ============ BORUSSIA DORTMUND ============
    {
        "name": "Serhou Guirassy",
        "team_history": [
            {"team": "Auxerre", "years": "2013-2016", "logo": "⚪"},
            {"team": "Köln", "years": "2016-2017", "logo": "🔴"},
            {"team": "Amiens", "years": "2017-2019", "logo": "⚫"},
            {"team": "Rennes", "years": "2019-2021", "logo": "🔴"},
            {"team": "Stuttgart", "years": "2021-2024", "logo": "⚪"},
            {"team": "Borussia Dortmund", "years": "2024-", "logo": "🟡"}
        ],
        "nationality": "Gine",
        "position": "Forvet",
        "age": 28,
        "current_team": "Borussia Dortmund",
        "difficulty": "hard"
    },
    
    # ============ EFSANELER ============
    {
        "name": "Lionel Messi",
        "team_history": [
            {"team": "Barcelona", "years": "2004-2021", "logo": "🔵"},
            {"team": "Paris Saint-Germain", "years": "2021-2023", "logo": "🔵"},
            {"team": "Inter Miami", "years": "2023-", "logo": "🩷"}
        ],
        "nationality": "Arjantin",
        "position": "Forvet",
        "age": 37,
        "current_team": "Inter Miami",
        "difficulty": "easy"
    },
    {
        "name": "Cristiano Ronaldo",
        "team_history": [
            {"team": "Sporting CP", "years": "2002-2003", "logo": "🟢"},
            {"team": "Manchester United", "years": "2003-2009", "logo": "🔴"},
            {"team": "Real Madrid", "years": "2009-2018", "logo": "⚪"},
            {"team": "Juventus", "years": "2018-2021", "logo": "⚫"},
            {"team": "Manchester United", "years": "2021-2022", "logo": "🔴"},
            {"team": "Al-Nassr", "years": "2023-", "logo": "🟡"}
        ],
        "nationality": "Portekiz",
        "position": "Forvet",
        "age": 39,
        "current_team": "Al-Nassr",
        "difficulty": "easy"
    },
    {
        "name": "Neymar",
        "team_history": [
            {"team": "Santos", "years": "2009-2013", "logo": "⚫"},
            {"team": "Barcelona", "years": "2013-2017", "logo": "🔵"},
            {"team": "Paris Saint-Germain", "years": "2017-2023", "logo": "🔵"},
            {"team": "Al-Hilal", "years": "2023-", "logo": "🔵"}
        ],
        "nationality": "Brezilya",
        "position": "Sol Kanat",
        "age": 32,
        "current_team": "Al-Hilal",
        "difficulty": "easy"
    },
    
    # ============ TÜRKİYE SÜPER LİG ============
    {
        "name": "Mauro Icardi",
        "team_history": [
            {"team": "Sampdoria", "years": "2011-2013", "logo": "🔵"},
            {"team": "Inter", "years": "2013-2020", "logo": "🔵"},
            {"team": "Paris Saint-Germain", "years": "2019-2022", "logo": "🔵"},
            {"team": "Galatasaray", "years": "2022-", "logo": "🟡"}
        ],
        "nationality": "Arjantin",
        "position": "Forvet",
        "age": 31,
        "current_team": "Galatasaray",
        "difficulty": "easy"
    },
    {
        "name": "Fred",
        "team_history": [
            {"team": "Internacional", "years": "2013-2016", "logo": "🔴"},
            {"team": "Shakhtar Donetsk", "years": "2016-2018", "logo": "🟠"},
            {"team": "Manchester United", "years": "2018-2023", "logo": "🔴"},
            {"team": "Fenerbahçe", "years": "2023-", "logo": "🟡"}
        ],
        "nationality": "Brezilya",
        "position": "Orta Saha",
        "age": 31,
        "current_team": "Fenerbahçe",
        "difficulty": "easy"
    },
    {
        "name": "Cengiz Ünder",
        "team_history": [
            {"team": "Altınordu", "years": "2014-2016", "logo": "🔴"},
            {"team": "Başakşehir", "years": "2016-2017", "logo": "🟠"},
            {"team": "Roma", "years": "2017-2021", "logo": "🟡"},
            {"team": "Leicester", "years": "2020-2021 (Kiralık)", "logo": "🔵"},
            {"team": "Marsilya", "years": "2021-2022", "logo": "🔵"},
            {"team": "Fenerbahçe", "years": "2022-", "logo": "🟡"}
        ],
        "nationality": "Türkiye",
        "position": "Sağ Kanat",
        "age": 27,
        "current_team": "Fenerbahçe",
        "difficulty": "medium"
    },
    {
        "name": "Edin Džeko",
        "team_history": [
            {"team": "Teplice", "years": "2005-2007", "logo": "🟡"},
            {"team": "Wolfsburg", "years": "2007-2011", "logo": "🟢"},
            {"team": "Manchester City", "years": "2011-2015", "logo": "🔵"},
            {"team": "Roma", "years": "2015-2021", "logo": "🟡"},
            {"team": "Inter", "years": "2021-2023", "logo": "🔵"},
            {"team": "Fenerbahçe", "years": "2023-", "logo": "🟡"}
        ],
        "nationality": "Bosna Hersek",
        "position": "Forvet",
        "age": 38,
        "current_team": "Fenerbahçe",
        "difficulty": "easy"
    },
    {
        "name": "Ferdi Kadıoğlu",
        "team_history": [
            {"team": "NEC Nijmegen", "years": "2018-2021", "logo": "🔴"},
            {"team": "Fenerbahçe", "years": "2021-2024", "logo": "🟡"},
            {"team": "Brighton", "years": "2024-", "logo": "🔵"}
        ],
        "nationality": "Türkiye",
        "position": "Sol Bek",
        "age": 24,
        "current_team": "Brighton",
        "difficulty": "medium"
    },
    {
        "name": "Barış Alper Yılmaz",
        "team_history": [
            {"team": "Galatasaray", "years": "2021-", "logo": "🟡"}
        ],
        "nationality": "Türkiye",
        "position": "Sağ Kanat",
        "age": 24,
        "current_team": "Galatasaray",
        "difficulty": "medium"
    },
    {
        "name": "Orkun Kökçü",
        "team_history": [
            {"team": "Feyenoord", "years": "2018-2023", "logo": "🔴"},
            {"team": "Benfica", "years": "2023-", "logo": "🔴"}
        ],
        "nationality": "Türkiye",
        "position": "Orta Saha",
        "age": 23,
        "current_team": "Benfica",
        "difficulty": "medium"
    },
    {
        "name": "Merih Demiral",
        "team_history": [
            {"team": "Sporting CP", "years": "2017-2018", "logo": "🟢"},
            {"team": "Sassuolo", "years": "2018-2019", "logo": "🟢"},
            {"team": "Juventus", "years": "2019-2021", "logo": "⚫"},
            {"team": "Atalanta", "years": "2021-2024", "logo": "🔵"},
            {"team": "Al-Ahli", "years": "2024-", "logo": "🟢"}
        ],
        "nationality": "Türkiye",
        "position": "Stoper",
        "age": 26,
        "current_team": "Al-Ahli",
        "difficulty": "medium"
    }
]
