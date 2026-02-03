"""
Comprehensive Football Database Generator
Creates a massive database of football players and teams for the quiz game
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import random

load_dotenv(Path(__file__).parent / '.env')

# ============ COMPREHENSIVE TEAM DATABASE ============
TEAMS_DATABASE = {
    # ENGLAND - PREMIER LEAGUE
    "Premier League": {
        "country": "England",
        "teams": [
            "Manchester City", "Arsenal", "Liverpool", "Aston Villa", "Tottenham Hotspur",
            "Chelsea", "Newcastle United", "Manchester United", "West Ham United", "Crystal Palace",
            "Brighton & Hove Albion", "AFC Bournemouth", "Fulham", "Wolverhampton Wanderers",
            "Everton", "Brentford", "Nottingham Forest", "Luton Town", "Burnley", "Sheffield United",
            "Leicester City", "Southampton", "Leeds United", "Ipswich Town"
        ]
    },
    # ENGLAND - CHAMPIONSHIP
    "Championship": {
        "country": "England",
        "teams": [
            "Leicester City", "Ipswich Town", "Leeds United", "Southampton", "West Brom",
            "Norwich City", "Hull City", "Coventry City", "Middlesbrough", "Preston North End",
            "Bristol City", "Cardiff City", "Millwall", "Swansea City", "Watford",
            "Sunderland", "QPR", "Birmingham City", "Stoke City", "Sheffield Wednesday",
            "Blackburn Rovers", "Plymouth Argyle", "Rotherham United", "Huddersfield Town"
        ]
    },
    # SPAIN - LA LIGA
    "La Liga": {
        "country": "Spain",
        "teams": [
            "Real Madrid", "Barcelona", "Atletico Madrid", "Girona", "Athletic Bilbao",
            "Real Sociedad", "Real Betis", "Villarreal", "Valencia", "Getafe",
            "Osasuna", "Sevilla", "Celta Vigo", "Rayo Vallecano", "Mallorca",
            "Las Palmas", "Cadiz", "Alaves", "Granada", "Almeria"
        ]
    },
    # SPAIN - SEGUNDA DIVISION
    "Segunda Division": {
        "country": "Spain",
        "teams": [
            "Eibar", "Valladolid", "Espanyol", "Oviedo", "Sporting Gijon",
            "Racing Santander", "Levante", "Leganes", "Huesca", "Elche",
            "Burgos", "Tenerife", "Cartagena", "Zaragoza", "Albacete",
            "Racing Ferrol", "Mirandes", "Villarreal B", "Andorra", "Alcorcon"
        ]
    },
    # GERMANY - BUNDESLIGA
    "Bundesliga": {
        "country": "Germany",
        "teams": [
            "Bayern Munich", "Bayer Leverkusen", "VfB Stuttgart", "RB Leipzig", "Borussia Dortmund",
            "Eintracht Frankfurt", "Hoffenheim", "Werder Bremen", "Freiburg", "Augsburg",
            "Wolfsburg", "Mainz 05", "Borussia Monchengladbach", "Union Berlin", "Bochum",
            "Heidenheim", "Cologne", "Darmstadt"
        ]
    },
    # GERMANY - 2. BUNDESLIGA
    "2. Bundesliga": {
        "country": "Germany",
        "teams": [
            "St. Pauli", "Holstein Kiel", "Fortuna Dusseldorf", "Hamburger SV", "Hannover 96",
            "Paderborn", "Hertha Berlin", "Karlsruher SC", "Nuremberg", "Kaiserslautern",
            "Greuther Furth", "Elversberg", "Schalke 04", "Magdeburg", "Rostock",
            "Braunschweig", "Wiesbaden", "Osnabruck"
        ]
    },
    # ITALY - SERIE A
    "Serie A": {
        "country": "Italy",
        "teams": [
            "Inter Milan", "AC Milan", "Juventus", "Atalanta", "Bologna",
            "Roma", "Lazio", "Fiorentina", "Torino", "Napoli",
            "Monza", "Genoa", "Lecce", "Udinese", "Cagliari",
            "Empoli", "Parma", "Como", "Verona", "Venezia",
            "Sassuolo", "Salernitana", "Frosinone"
        ]
    },
    # ITALY - SERIE B
    "Serie B": {
        "country": "Italy",
        "teams": [
            "Parma", "Como", "Venezia", "Cremonese", "Catanzaro",
            "Palermo", "Sampdoria", "Brescia", "Pisa", "Spezia",
            "Modena", "Sudtirol", "Bari", "Cittadella", "Reggiana",
            "Cosenza", "Ascoli", "Ternana", "Feralpisalo", "Lecco"
        ]
    },
    # FRANCE - LIGUE 1
    "Ligue 1": {
        "country": "France",
        "teams": [
            "Paris Saint-Germain", "Monaco", "Brest", "Lille", "Nice",
            "Lyon", "Lens", "Marseille", "Rennes", "Toulouse",
            "Montpellier", "Strasbourg", "Nantes", "Le Havre", "Reims",
            "Metz", "Lorient", "Clermont"
        ]
    },
    # FRANCE - LIGUE 2
    "Ligue 2": {
        "country": "France",
        "teams": [
            "Auxerre", "Angers", "Saint-Etienne", "Paris FC", "Bordeaux",
            "Caen", "Rodez", "Amiens", "Bastia", "Guingamp",
            "Laval", "Grenoble", "Dunkerque", "Pau", "Ajaccio",
            "Troyes", "Valenciennes", "Niort", "Quevilly-Rouen", "Concarneau"
        ]
    },
    # TURKEY - SUPER LIG
    "Super Lig": {
        "country": "Turkey",
        "teams": [
            "Galatasaray", "Fenerbahce", "Trabzonspor", "Besiktas", "Basaksehir",
            "Kasimpasa", "Antalyaspor", "Alanyaspor", "Konyaspor", "Samsunspor",
            "Sivasspor", "Adana Demirspor", "Rizespor", "Gaziantep", "Kayserispor",
            "Hatayspor", "Pendikspor", "Istanbulspor", "Fatih Karagumruk", "Ankaragucu"
        ]
    },
    # TURKEY - 1. LIG
    "TFF 1. Lig": {
        "country": "Turkey",
        "teams": [
            "Eyupspor", "Goztepe", "Sakaryaspor", "Bodrumspor", "Bandirmaspor",
            "Umraniyespor", "Erzurumspor", "Manisa FK", "Boluspor", "Altay",
            "Genclerbirligi", "Tuzlaspor", "Sanliurfaspor", "Kecioren", "Istaanbul"
        ]
    },
    # PORTUGAL - PRIMEIRA LIGA
    "Primeira Liga": {
        "country": "Portugal",
        "teams": [
            "Sporting CP", "Benfica", "Porto", "Braga", "Vitoria Guimaraes",
            "Rio Ave", "Boavista", "Famalicao", "Casa Pia", "Arouca",
            "Estoril", "Vizela", "Gil Vicente", "Chaves", "Portimonense",
            "Moreirense", "Farense", "Santa Clara", "Nacional", "Maritimo"
        ]
    },
    # NETHERLANDS - EREDIVISIE
    "Eredivisie": {
        "country": "Netherlands",
        "teams": [
            "PSV", "Feyenoord", "Ajax", "AZ Alkmaar", "Twente",
            "Utrecht", "Sparta Rotterdam", "Go Ahead Eagles", "Heerenveen", "NEC Nijmegen",
            "Fortuna Sittard", "Heracles", "Almere City", "Waalwijk", "Volendam",
            "PEC Zwolle", "Excelsior", "Vitesse"
        ]
    },
    # BELGIUM - PRO LEAGUE
    "Belgian Pro League": {
        "country": "Belgium",
        "teams": [
            "Club Brugge", "Union St. Gilloise", "Genk", "Antwerp", "Anderlecht",
            "Gent", "Mechelen", "Westerlo", "Charleroi", "OH Leuven",
            "Standard Liege", "Cercle Brugge", "STVV", "Eupen", "Kortrijk",
            "Mouscron", "Beerschot", "Oostende"
        ]
    },
    # SCOTLAND - PREMIERSHIP
    "Scottish Premiership": {
        "country": "Scotland",
        "teams": [
            "Celtic", "Rangers", "Heart of Midlothian", "Kilmarnock", "Aberdeen",
            "Hibernian", "Dundee", "St Mirren", "Motherwell", "Ross County",
            "St Johnstone", "Livingston"
        ]
    },
    # AUSTRIA - BUNDESLIGA
    "Austrian Bundesliga": {
        "country": "Austria",
        "teams": [
            "Red Bull Salzburg", "Sturm Graz", "Rapid Wien", "LASK", "Austria Vienna",
            "Wolfsberger AC", "Hartberg", "Blau-Weiss Linz", "Altach", "Austria Klagenfurt",
            "Tirol", "Admira Wacker"
        ]
    },
    # SWITZERLAND - SUPER LEAGUE
    "Swiss Super League": {
        "country": "Switzerland",
        "teams": [
            "Young Boys", "Servette", "Lugano", "St Gallen", "Basel",
            "Zurich", "Luzern", "Grasshoppers", "Winterthur", "Sion",
            "Lausanne-Sport", "Yverdon"
        ]
    },
    # DENMARK - SUPERLIGA
    "Danish Superliga": {
        "country": "Denmark",
        "teams": [
            "Copenhagen", "Midtjylland", "Nordsjaelland", "Brondby", "Silkeborg",
            "AGF", "Viborg", "Randers", "AaB", "Odense",
            "Lyngby", "Vejle", "Hvidovre"
        ]
    },
    # SWEDEN - ALLSVENSKAN
    "Allsvenskan": {
        "country": "Sweden",
        "teams": [
            "Malmo FF", "Elfsborg", "Hammarby", "AIK", "Hacken",
            "Djurgardens IF", "IFK Goteborg", "IFK Norrkoping", "Mjallby", "Varbergs",
            "Sirius", "Kalmar", "Halmstads", "Vasteras", "Brommapojkarna", "GAIS"
        ]
    },
    # NORWAY - ELITESERIEN
    "Eliteserien": {
        "country": "Norway",
        "teams": [
            "Bodo/Glimt", "Brann", "Molde", "Rosenborg", "Viking",
            "Lillestrom", "Stromsgodset", "Tromso", "Valerenga", "Sandefjord",
            "Odd", "Haugesund", "Sarpsborg 08", "Aalesund", "HamKam", "Stabaek"
        ]
    },
    # CROATIA - HNL
    "Croatian First League": {
        "country": "Croatia",
        "teams": [
            "Dinamo Zagreb", "Hajduk Split", "Rijeka", "Osijek", "Lokomotiva Zagreb",
            "Slaven Belupo", "Gorica", "Istra 1961", "Varazdin", "Sibenik"
        ]
    },
    # SERBIA - SUPERLIGA
    "Serbian SuperLiga": {
        "country": "Serbia",
        "teams": [
            "Red Star Belgrade", "Partizan", "Vojvodina", "TSC Backa Topola", "Cukaricki",
            "Radnicki Nis", "Mladost Lucani", "Spartak Subotica", "Zeleznicar Pancevo"
        ]
    },
    # GREECE - SUPER LEAGUE
    "Greek Super League": {
        "country": "Greece",
        "teams": [
            "Olympiacos", "PAOK", "AEK Athens", "Panathinaikos", "Aris Thessaloniki",
            "OFI Crete", "Volos", "Asteras Tripolis", "Atromitos", "Ionikos",
            "Lamia", "PAS Giannina", "Panserraikos"
        ]
    },
    # CZECH REPUBLIC
    "Czech First League": {
        "country": "Czech Republic",
        "teams": [
            "Sparta Prague", "Slavia Prague", "Viktoria Plzen", "Banik Ostrava", "Mlada Boleslav",
            "Liberec", "Jablonec", "Hradec Kralove", "Bohemians 1905", "Sigma Olomouc",
            "Ceske Budejovice", "Slovacko", "Teplice", "Karvina", "Pardubice"
        ]
    },
    # UKRAINE
    "Ukrainian Premier League": {
        "country": "Ukraine",
        "teams": [
            "Shakhtar Donetsk", "Dynamo Kyiv", "Dnipro-1", "Zorya Luhansk", "Oleksandriya",
            "Vorskla Poltava", "Kryvbas", "Chornomorets Odesa", "Kolos Kovalivka",
            "Metalist 1925", "Rukh Lviv", "Obolon Kyiv", "LNZ Cherkasy"
        ]
    },
    # RUSSIA
    "Russian Premier League": {
        "country": "Russia",
        "teams": [
            "Zenit Saint Petersburg", "Krasnodar", "Dynamo Moscow", "CSKA Moscow", "Spartak Moscow",
            "Lokomotiv Moscow", "Rostov", "Sochi", "Akhmat Grozny", "Rubin Kazan",
            "Krylya Sovetov", "Orenburg", "Nizhny Novgorod", "Fakel Voronezh", "Ural",
            "Pari Nizhny Novgorod", "Baltika Kaliningrad"
        ]
    },
    # BRAZIL - BRASILEIRAO
    "Brasileirao": {
        "country": "Brazil",
        "teams": [
            "Palmeiras", "Gremio", "Atletico Mineiro", "Flamengo", "Botafogo",
            "Fluminense", "Bragantino", "Fortaleza", "Internacional", "Sao Paulo",
            "Athletico Paranaense", "Cruzeiro", "Corinthians", "Cuiaba", "Bahia",
            "Santos", "Vasco da Gama", "Goias", "Coritiba", "America Mineiro"
        ]
    },
    # ARGENTINA
    "Argentine Primera": {
        "country": "Argentina",
        "teams": [
            "River Plate", "Boca Juniors", "Racing Club", "San Lorenzo", "Independiente",
            "Lanus", "Velez Sarsfield", "Estudiantes", "Talleres", "Argentinos Juniors",
            "Huracan", "Defensa y Justicia", "Godoy Cruz", "Banfield", "Newell's Old Boys",
            "Rosario Central", "Union Santa Fe", "Colon", "Gimnasia La Plata"
        ]
    },
    # USA - MLS
    "MLS": {
        "country": "USA",
        "teams": [
            "Inter Miami", "LA Galaxy", "LAFC", "Cincinnati", "Columbus Crew",
            "Philadelphia Union", "Seattle Sounders", "New York Red Bulls", "Atlanta United",
            "Houston Dynamo", "Austin FC", "Orlando City", "Charlotte FC", "New York City FC",
            "Nashville SC", "Real Salt Lake", "Portland Timbers", "St. Louis City",
            "Minnesota United", "Sporting Kansas City", "Vancouver Whitecaps", "Colorado Rapids",
            "Chicago Fire", "DC United", "CF Montreal", "New England Revolution",
            "San Jose Earthquakes", "Toronto FC"
        ]
    },
    # SAUDI ARABIA
    "Saudi Pro League": {
        "country": "Saudi Arabia",
        "teams": [
            "Al-Hilal", "Al-Nassr", "Al-Ittihad", "Al-Ahli", "Al-Shabab",
            "Al-Ettifaq", "Al-Fateh", "Al-Raed", "Al-Taawoun", "Al-Fayha",
            "Al-Wehda", "Al-Khaleej", "Al-Hazem", "Al-Riyadh", "Damac",
            "Al-Akhdoud", "Abha", "Al-Tai"
        ]
    },
    # JAPAN - J1 LEAGUE
    "J1 League": {
        "country": "Japan",
        "teams": [
            "Vissel Kobe", "Yokohama F. Marinos", "Urawa Red Diamonds", "Machida Zelvia",
            "Kashima Antlers", "Sanfrecce Hiroshima", "FC Tokyo", "Cerezo Osaka",
            "Gamba Osaka", "Nagoya Grampus", "Kawasaki Frontale", "Kashiwa Reysol",
            "Albirex Niigata", "Avispa Fukuoka", "Tokyo Verdy", "Jubilo Iwata",
            "Kyoto Sanga", "Sagan Tosu", "Shonan Bellmare", "Consadole Sapporo"
        ]
    },
    # CHINA - SUPER LEAGUE
    "Chinese Super League": {
        "country": "China",
        "teams": [
            "Shanghai Port", "Shandong Taishan", "Shanghai Shenhua", "Beijing Guoan",
            "Chengdu Rongcheng", "Wuhan Three Towns", "Tianjin Jinmen Tiger",
            "Changchun Yatai", "Henan", "Dalian Professional", "Zhejiang",
            "Meizhou Hakka", "Cangzhou Mighty Lions", "Nantong Zhiyun", "Qingdao Hainiu"
        ]
    },
    # MEXICO - LIGA MX
    "Liga MX": {
        "country": "Mexico",
        "teams": [
            "Club America", "Guadalajara", "Cruz Azul", "UNAM Pumas", "Monterrey",
            "Tigres UANL", "Toluca", "Santos Laguna", "Leon", "Pachuca",
            "Necaxa", "Atlas", "Queretaro", "Tijuana", "Puebla",
            "Mazatlan", "San Luis", "Juarez"
        ]
    },
}

# ============ NATIONALITIES WITH FIRST/LAST NAMES ============
NATIONALITIES_DATA = {
    "England": {
        "first_names": ["James", "Oliver", "Harry", "Jack", "George", "Charlie", "Thomas", "William", "Daniel", "Ethan", "Mason", "Riley", "Ben", "Luke", "Joe", "Ryan", "Adam", "Kyle", "Marcus", "Callum", "Conor", "Declan", "Phil", "Cole", "Bukayo", "Trent", "Harvey", "Reiss", "Eddie", "Tammy", "Dominic", "Jadon", "Raheem", "Jordan", "Aaron", "Eric", "Alex", "Nick", "Dean", "Jay", "Curtis"],
        "last_names": ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Taylor", "Walker", "White", "Harris", "Martin", "Thompson", "Garcia", "Jackson", "Robinson", "Clark", "Lewis", "Young", "Hall", "Allen", "Wright", "Hill", "Scott", "Green", "Adams", "Baker", "Nelson", "Carter", "Mitchell", "Parker", "Collins", "Edwards", "Stewart", "Morris", "Murphy", "Cook", "Rogers", "Morgan", "Rice", "Saka", "Foden", "Kane", "Sterling", "Rashford", "Grealish", "Bellingham", "Palmer", "Gordon"]
    },
    "Spain": {
        "first_names": ["Diego", "Pablo", "Carlos", "Sergio", "David", "Daniel", "Alvaro", "Marcos", "Alejandro", "Jordi", "Raul", "Pedro", "Iker", "Cesar", "Nacho", "Jesus", "Ferran", "Gavi", "Pedri", "Ansu", "Nico", "Rodri", "Dani", "Mikel", "Unai", "Yeremi", "Alex", "Bryan", "Pau", "Marc", "Gerard"],
        "last_names": ["Garcia", "Martinez", "Rodriguez", "Lopez", "Hernandez", "Gonzalez", "Perez", "Sanchez", "Ramirez", "Torres", "Flores", "Rivera", "Gomez", "Diaz", "Moreno", "Alvarez", "Romero", "Ruiz", "Jimenez", "Molina", "Ramos", "Alba", "Pique", "Busquets", "Iniesta", "Xavi", "Casillas", "Villa", "Silva", "Costa", "Olmo", "Williams", "Cucurella", "Simon", "Morata"]
    },
    "Germany": {
        "first_names": ["Thomas", "Leon", "Kai", "Joshua", "Niklas", "Antonio", "Leroy", "Serge", "Manuel", "Marc-Andre", "Robin", "Julian", "Florian", "Jamal", "Timo", "Ilkay", "Jonas", "Maximilian", "Benjamin", "Jonathan", "Felix", "Lukas", "Denis", "Kevin", "Patrick", "Marcel", "Nico", "Chris", "Tim"],
        "last_names": ["Muller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Neuer", "Kroos", "Kimmich", "Gundogan", "Havertz", "Sane", "Gnabry", "Musiala", "Wirtz", "Rudiger", "Schlotterbeck", "Fullkrug", "Gross", "Tah", "Werner", "Brandt", "Reus"]
    },
    "France": {
        "first_names": ["Antoine", "Kylian", "Olivier", "Hugo", "Paul", "Karim", "Aurelien", "Eduardo", "Ousmane", "Marcus", "Raphael", "Benjamin", "Dayot", "Lucas", "Theo", "William", "Randal", "Bradley", "Warren", "Moussa", "Adrien", "Kingsley", "Presnel", "Nordi", "Ibrahima", "Jules", "Youssouf", "Matteo", "Christopher"],
        "last_names": ["Dupont", "Martin", "Durand", "Moreau", "Simon", "Laurent", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier", "Morel", "Mbappe", "Griezmann", "Pogba", "Giroud", "Lloris", "Dembele", "Camavinga", "Tchouameni", "Kounde", "Saliba", "Hernandez", "Upamecano", "Rabiot", "Coman", "Kante", "Benzema", "Varane", "Maignan"]
    },
    "Italy": {
        "first_names": ["Marco", "Luca", "Andrea", "Matteo", "Lorenzo", "Federico", "Nicolo", "Sandro", "Alessandro", "Gianluigi", "Giacomo", "Davide", "Bryan", "Gianluca", "Stefano", "Fabio", "Simone", "Domenico", "Ciro", "Jorginho", "Manuel", "Leonardo", "Riccardo", "Wilfried", "Giovanni", "Moise", "Pietro", "Cristiano"],
        "last_names": ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Costa", "Bonucci", "Chiellini", "Verratti", "Donnarumma", "Barella", "Chiesa", "Insigne", "Immobile", "Bastoni", "Dimarco", "Scamacca", "Raspadori", "Locatelli", "Tonali", "Pellegrini", "Zaccagni"]
    },
    "Brazil": {
        "first_names": ["Neymar", "Vinicius", "Rodrygo", "Raphinha", "Gabriel", "Bruno", "Lucas", "Richarlison", "Casemiro", "Marquinhos", "Alisson", "Ederson", "Thiago", "Fabinho", "Fred", "Danilo", "Alex", "Roberto", "Antony", "Endrick", "Savinho", "Martinelli", "Paqueta", "Arthur", "Bremer", "Militao", "Wendell", "Emerson", "Carlos", "Igor"],
        "last_names": ["Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Costa", "Ferreira", "Rodrigues", "Almeida", "Junior", "Nunes", "Vieira", "Ribeiro", "Jesus", "Firmino", "Guimaraes", "Telles", "Sandro", "Augusto"]
    },
    "Argentina": {
        "first_names": ["Lionel", "Angel", "Paulo", "Julian", "Lautaro", "Enzo", "Alexis", "Nicolas", "Emiliano", "Gonzalo", "Leandro", "Rodrigo", "Cristian", "Lisandro", "Alejandro", "Marcos", "German", "Exequiel", "Guido", "Giovanni", "Mauro", "Sergio", "Diego", "Fernando", "Lucas"],
        "last_names": ["Gonzalez", "Rodriguez", "Fernandez", "Lopez", "Martinez", "Garcia", "Perez", "Sanchez", "Romero", "Diaz", "Messi", "Di Maria", "Dybala", "Alvarez", "Aguero", "Paredes", "De Paul", "Otamendi", "Rulli", "Tagliafico", "Molina", "Mac Allister", "Garnacho", "Icardi", "Lautaro"]
    },
    "Portugal": {
        "first_names": ["Cristiano", "Bruno", "Bernardo", "Diogo", "Joao", "Ruben", "Rafael", "Pedro", "Goncalo", "Vitinha", "Nuno", "Andre", "Francisco", "Renato", "Danilo", "Jose", "Otavio", "William", "Ricardo", "Fabio", "Antonio", "Pepe", "Nelson"],
        "last_names": ["Silva", "Santos", "Ferreira", "Pereira", "Costa", "Rodrigues", "Fernandes", "Goncalves", "Martins", "Ronaldo", "Neves", "Dias", "Jota", "Cancelo", "Mendes", "Leao", "Felix", "Ramos", "Carvalho", "Semedo", "Guerreiro", "Sanches", "Palhinha", "Conceicao"]
    },
    "Netherlands": {
        "first_names": ["Virgil", "Frenkie", "Memphis", "Matthijs", "Cody", "Steven", "Daley", "Nathan", "Micky", "Xavi", "Denzel", "Ryan", "Teun", "Jurrien", "Tijjani", "Jeremie", "Ian", "Lutsharel", "Quinten", "Wout", "Luuk", "Davy", "Tim", "Joel", "Tyrell", "Joshua"],
        "last_names": ["de Jong", "van Dijk", "Depay", "de Ligt", "Gakpo", "Bergwijn", "Blind", "Aké", "Wijnaldum", "Dumfries", "Gravenberch", "Koopmeiners", "Timber", "Reijnders", "Frimpong", "Maatsen", "Geertruida", "Weghorst", "Malen", "Simons", "de Vrij"]
    },
    "Belgium": {
        "first_names": ["Kevin", "Romelu", "Thibaut", "Eden", "Axel", "Youri", "Leandro", "Timothy", "Charles", "Amadou", "Orel", "Jeremy", "Yannick", "Thorgan", "Dries", "Jan", "Thomas", "Zeno", "Lois", "Arthur"],
        "last_names": ["De Bruyne", "Lukaku", "Courtois", "Hazard", "Witsel", "Tielemans", "Carrasco", "Castagne", "De Ketelaere", "Onana", "Mangala", "Doku", "Ferreira-Carrasco", "Mertens", "Vertonghen", "Meunier", "Theate", "Debast", "Openda"]
    },
    "Turkey": {
        "first_names": ["Arda", "Hakan", "Kenan", "Cengiz", "Irfan Can", "Ferdi", "Ugurcan", "Altay", "Mert", "Merih", "Orkun", "Yusuf", "Okay", "Enes", "Zeki", "Cenk", "Burak", "Caglar", "Ozan", "Kaan", "Berkan", "Abdulkerim", "Samet", "Baris Alper", "Salih", "Umut"],
        "last_names": ["Guler", "Calhanoglu", "Yildiz", "Under", "Kahveci", "Kadioglu", "Cakir", "Bayindir", "Gunok", "Demiral", "Kokcu", "Yazici", "Yokuslu", "Unal", "Celik", "Tosun", "Yilmaz", "Soyuncu", "Kabak", "Ayhan", "Kutlu", "Bardakci", "Akaydin", "Ozcan", "Muldur", "Bozok"]
    },
    "Croatia": {
        "first_names": ["Luka", "Mateo", "Ivan", "Marcelo", "Ante", "Josip", "Andrej", "Borna", "Mario", "Nikola", "Dejan", "Mislav", "Kristijan", "Bruno", "Josko", "Lovro", "Luka", "Martin"],
        "last_names": ["Modric", "Kovacic", "Perisic", "Brozovic", "Rebic", "Kramaric", "Gvardiol", "Stanisic", "Pasalic", "Sosa", "Livakovic", "Vida", "Lovren", "Vlasic", "Juranovic", "Sutalo", "Majer", "Sucic"]
    },
    "Serbia": {
        "first_names": ["Dusan", "Aleksandar", "Sergej", "Nemanja", "Filip", "Luka", "Nikola", "Stefan", "Strahinja", "Sasa", "Ivan", "Veljko", "Milos"],
        "last_names": ["Vlahovic", "Mitrovic", "Milinkovic-Savic", "Matic", "Kostic", "Jovic", "Milenkovic", "Tadic", "Pavlovic", "Lukic", "Ilic", "Birmancevic", "Gudelj", "Zivkovic"]
    },
    "Poland": {
        "first_names": ["Robert", "Piotr", "Wojciech", "Jakub", "Kamil", "Arkadiusz", "Jan", "Przemyslaw", "Bartosz", "Mateusz", "Sebastian", "Krzysztof", "Szymon", "Nicola"],
        "last_names": ["Lewandowski", "Zielinski", "Szczesny", "Kiwior", "Grosicki", "Milik", "Bednarek", "Frankowski", "Bereszynski", "Cash", "Zurkowski", "Piatek", "Zalewski", "Swiderski"]
    },
    "Denmark": {
        "first_names": ["Christian", "Kasper", "Pierre-Emile", "Mikkel", "Andreas", "Simon", "Martin", "Thomas", "Joachim", "Rasmus", "Jannik", "Alexander", "Viktor", "Jonas", "Morten", "Jacob"],
        "last_names": ["Eriksen", "Schmeichel", "Hojbjerg", "Damsgaard", "Christensen", "Kjaer", "Braithwaite", "Delaney", "Andersen", "Dolberg", "Vestergaard", "Hojlund", "Skov", "Wind", "Kristiansen", "Hjulmand"]
    },
    "Sweden": {
        "first_names": ["Zlatan", "Emil", "Alexander", "Robin", "Dejan", "Victor", "Sebastian", "Marcus", "Albin", "Jesper", "Mattias", "Ludwig", "Viktor", "Anthony", "Jens"],
        "last_names": ["Ibrahimovic", "Forsberg", "Isak", "Olsen", "Kulusevski", "Lindelof", "Larsson", "Danielson", "Ekdal", "Karlstrom", "Svanberg", "Augustinsson", "Gyokeres", "Claesson", "Elanga"]
    },
    "Norway": {
        "first_names": ["Erling", "Martin", "Sander", "Alexander", "Morten", "Kristian", "Fredrik", "Birger", "Stefan", "Joshua", "Antonio", "Leo"],
        "last_names": ["Haaland", "Odegaard", "Berge", "Sorloth", "Thorsby", "Ajer", "Nyland", "Meling", "Strandberg", "King", "Nusa", "Ostigard", "Ryerson", "Bobb"]
    },
    "Switzerland": {
        "first_names": ["Xherdan", "Granit", "Yann", "Manuel", "Ricardo", "Fabian", "Remo", "Breel", "Denis", "Nico", "Silvan", "Edimilson", "Ruben", "Cedric"],
        "last_names": ["Shaqiri", "Xhaka", "Sommer", "Akanji", "Rodriguez", "Schar", "Freuler", "Embolo", "Zakaria", "Elvedi", "Widmer", "Fernandes", "Vargas", "Itten", "Kobel", "Rieder"]
    },
    "Austria": {
        "first_names": ["David", "Marko", "Marcel", "Konrad", "Kevin", "Christoph", "Stefan", "Valentino", "Florian", "Patrick", "Alessandro", "Maximilian"],
        "last_names": ["Alaba", "Arnautovic", "Sabitzer", "Laimer", "Danso", "Baumgartner", "Lainer", "Posch", "Lazaro", "Grillitsch", "Trimmel", "Kalajdzic", "Schlager", "Wober"]
    },
    "Japan": {
        "first_names": ["Takumi", "Takehiro", "Wataru", "Kaoru", "Daichi", "Junya", "Yuki", "Ritsu", "Hidemasa", "Ko", "Maya", "Ao", "Keito", "Ayase", "Koji"],
        "last_names": ["Minamino", "Tomiyasu", "Endo", "Mitoma", "Kamada", "Ito", "Soma", "Doan", "Morita", "Itakura", "Yoshida", "Tanaka", "Nakamura", "Ueda", "Kubo", "Maeda"]
    },
    "South Korea": {
        "first_names": ["Son", "Kim", "Lee", "Hwang", "Jeong", "Cho", "Park", "Jung", "Kwon", "Hong", "Na"],
        "last_names": ["Heung-min", "Min-jae", "Kang-in", "Hee-chan", "Woo-yeong", "Gue-sung", "Ji-sung", "Seung-ho", "Chang-hoon", "Chul", "Sang-ho"]
    },
    "Mexico": {
        "first_names": ["Hirving", "Raul", "Guillermo", "Jesus", "Edson", "Cesar", "Hector", "Diego", "Alexis", "Orbelin", "Luis", "Uriel", "Julian", "Santiago", "Jorge"],
        "last_names": ["Lozano", "Jimenez", "Ochoa", "Corona", "Alvarez", "Montes", "Moreno", "Lainez", "Vega", "Pineda", "Chavez", "Antuna", "Araujo", "Gimenez", "Sanchez"]
    },
    "USA": {
        "first_names": ["Christian", "Weston", "Timothy", "Gio", "Brenden", "Tyler", "Sergino", "Yunus", "Josh", "Jordan", "Matt", "Folarin", "Malik", "Cameron", "Haji", "Johnny"],
        "last_names": ["Pulisic", "McKennie", "Weah", "Reyna", "Aaronson", "Adams", "Dest", "Musah", "Sargent", "Morris", "Turner", "Balogun", "Tillman", "Carter-Vickers", "Wright", "Cardoso"]
    },
    "Canada": {
        "first_names": ["Alphonso", "Jonathan", "Cyle", "Tajon", "Stephen", "Alistair", "Samuel", "Richie", "Ismael", "Maxime", "Derek"],
        "last_names": ["Davies", "David", "Larin", "Buchanan", "Eustaquio", "Johnston", "Piette", "Laryea", "Kone", "Crepeau", "Cornelius"]
    },
    "Senegal": {
        "first_names": ["Sadio", "Kalidou", "Edouard", "Idrissa", "Ismaila", "Pape", "Boulaye", "Abdou", "Cheikhou", "Krepin", "Iliman", "Habib", "Nicolas"],
        "last_names": ["Mane", "Koulibaly", "Mendy", "Gueye", "Sarr", "Gueye", "Dia", "Diallo", "Kouyate", "Diatta", "Ndiaye", "Diallo", "Jackson"]
    },
    "Nigeria": {
        "first_names": ["Victor", "Ademola", "Wilfred", "Alex", "Kelechi", "Samuel", "Calvin", "Joe", "Semi", "Cyriel", "Taiwo", "Zaidu"],
        "last_names": ["Osimhen", "Lookman", "Ndidi", "Iwobi", "Iheanacho", "Chukwueze", "Bassey", "Aribo", "Ajayi", "Dessers", "Awoniyi", "Sanusi"]
    },
    "Morocco": {
        "first_names": ["Achraf", "Hakim", "Sofyan", "Youssef", "Azzedine", "Noussair", "Nayef", "Abdelhamid", "Jawad", "Selim", "Munir", "Ilias"],
        "last_names": ["Hakimi", "Ziyech", "Amrabat", "En-Nesyri", "Ounahi", "Mazraoui", "Aguerd", "Sabiri", "El Yamiq", "Amallah", "El Haddadi", "Chair"]
    },
    "Ghana": {
        "first_names": ["Thomas", "Mohammed", "Jordan", "Inaki", "Antoine", "Daniel", "Kamaldeen", "Tariq", "Abdul", "Jeffrey", "Osman", "Alexander"],
        "last_names": ["Partey", "Kudus", "Ayew", "Williams", "Semenyo", "Amartey", "Sulemana", "Lamptey", "Salis", "Schlupp", "Bukari", "Djiku"]
    },
    "Egypt": {
        "first_names": ["Mohamed", "Omar", "Mahmoud", "Ahmed", "Mostafa", "Trezeguet", "Amr", "Karim", "Ibrahim", "Ramadan"],
        "last_names": ["Salah", "Marmoush", "Hassan", "Hegazy", "Mohamed", "Sobhi", "Elneny", "Hafez", "Adel", "Sobhy"]
    },
    "Cameroon": {
        "first_names": ["Andre", "Vincent", "Eric", "Karl", "Samuel", "Jean", "Martin", "Pierre", "Bryan", "Olivier"],
        "last_names": ["Onana", "Aboubakar", "Choupo-Moting", "Toko Ekambi", "Nlend", "Anguissa", "Hongla", "Kunde", "Mbeumo", "Ntcham"]
    },
    "Ivory Coast": {
        "first_names": ["Nicolas", "Sebastien", "Franck", "Max", "Wilfried", "Serge", "Simon", "Ibrahim", "Seko", "Odilon", "Amad"],
        "last_names": ["Pepe", "Haller", "Kessie", "Gradel", "Zaha", "Aurier", "Deli", "Sangare", "Fofana", "Kossounou", "Diallo"]
    },
    "Algeria": {
        "first_names": ["Riyad", "Ismael", "Said", "Youcef", "Ramy", "Aissa", "Islam", "Hicham", "Adam", "Nabil"],
        "last_names": ["Mahrez", "Bennacer", "Benrahma", "Atal", "Bensebaini", "Mandi", "Slimani", "Boudaoui", "Ounas", "Fekir"]
    },
    "Ukraine": {
        "first_names": ["Oleksandr", "Andriy", "Mykola", "Ruslan", "Viktor", "Artem", "Illya", "Serhiy", "Roman", "Taras"],
        "last_names": ["Zinchenko", "Lunin", "Mudryk", "Malinovsky", "Tsygankov", "Dovbyk", "Zabarnyi", "Mykolenko", "Sydorchuk", "Stepanenko"]
    },
    "Scotland": {
        "first_names": ["Andrew", "Scott", "John", "Callum", "Billy", "Kieran", "Stuart", "Ryan", "Lewis", "Kenny", "James", "Aaron", "Lawrence"],
        "last_names": ["Robertson", "McTominay", "McGinn", "McGregor", "Gilmour", "Tierney", "Armstrong", "Christie", "Ferguson", "McLean", "Forrest", "Hickey", "Shankland"]
    },
    "Wales": {
        "first_names": ["Gareth", "Aaron", "Daniel", "Ben", "Joe", "Harry", "Ethan", "Kieffer", "Brennan", "Connor", "Neco"],
        "last_names": ["Bale", "Ramsey", "James", "Davies", "Allen", "Wilson", "Ampadu", "Moore", "Johnson", "Roberts", "Williams"]
    },
    "Ireland": {
        "first_names": ["Matt", "Shane", "Nathan", "Evan", "Michael", "Adam", "Chiedozie", "Jayson", "Troy", "Andrew", "John"],
        "last_names": ["Doherty", "Duffy", "Collins", "Ferguson", "Obafemi", "Idah", "Molumby", "Parrott", "Omobamidele", "Kelleher", "Egan"]
    },
    "Greece": {
        "first_names": ["Georgios", "Kostas", "Vangelis", "Dimitris", "Anastasios", "Petros", "Sotiris", "Panagiotis", "Christos", "Konstantinos"],
        "last_names": ["Giakoumakis", "Mavropanos", "Pavlidis", "Limnios", "Bakasetas", "Mantalos", "Alexandropoulos", "Tzavellas", "Tzolis", "Fortounis"]
    },
    "Colombia": {
        "first_names": ["Luis", "James", "Juan", "Yerry", "Davinson", "Stefan", "Rafael", "Daniel", "Jhon", "Johan", "Duvan"],
        "last_names": ["Diaz", "Rodriguez", "Cuadrado", "Mina", "Sanchez", "Medina", "Santos Borre", "Munoz", "Arias", "Mojica", "Zapata"]
    },
    "Uruguay": {
        "first_names": ["Federico", "Darwin", "Rodrigo", "Jose", "Mathias", "Nahitan", "Lucas", "Ronald", "Facundo", "Sebastian", "Martin"],
        "last_names": ["Valverde", "Nunez", "Bentancur", "Gimenez", "Olivera", "Nandez", "Torreira", "Araujo", "Pellistri", "Coates", "Caceres"]
    },
    "Chile": {
        "first_names": ["Alexis", "Arturo", "Claudio", "Eduardo", "Charles", "Gary", "Erick", "Diego", "Guillermo", "Mauricio"],
        "last_names": ["Sanchez", "Vidal", "Bravo", "Vargas", "Aranguiz", "Medel", "Pulgar", "Valdes", "Maripan", "Isla"]
    },
    "Ecuador": {
        "first_names": ["Moises", "Pervis", "Piero", "Gonzalo", "Jeremy", "Angelo", "Enner", "Felix", "Romario", "Alan"],
        "last_names": ["Caicedo", "Estupinan", "Hincapie", "Plata", "Sarmiento", "Preciado", "Valencia", "Torres", "Ibarra", "Franco"]
    },
    "Paraguay": {
        "first_names": ["Miguel", "Gustavo", "Omar", "Antonio", "Julio", "Fabian", "Matias", "Braian", "Junior", "Robert"],
        "last_names": ["Almiron", "Gomez", "Alderete", "Sanabria", "Enciso", "Balbuena", "Rojas", "Samudio", "Alonso", "Morales"]
    },
    "Venezuela": {
        "first_names": ["Salomon", "Yangel", "Josef", "Yeferson", "Darwin", "Rolf", "Eduardo", "Jhon", "Cristian", "Eric"],
        "last_names": ["Rondon", "Herrera", "Martinez", "Soteldo", "Machis", "Feltscher", "Bello", "Chancellor", "Casseres", "Ramirez"]
    },
    "Peru": {
        "first_names": ["Gianluca", "Andre", "Renato", "Luis", "Christian", "Pedro", "Edison", "Yoshimar", "Carlos", "Miguel"],
        "last_names": ["Lapadula", "Carrillo", "Tapia", "Advincula", "Cueva", "Gallese", "Flores", "Yotun", "Zambrano", "Trauco"]
    },
    "Australia": {
        "first_names": ["Aaron", "Jackson", "Maty", "Ajdin", "Awer", "Martin", "Mitchell", "Bailey", "Garang", "Cameron"],
        "last_names": ["Mooy", "Irvine", "Ryan", "Hrustic", "Mabil", "Boyle", "Duke", "Wright", "Kuol", "Devlin"]
    },
    "Iran": {
        "first_names": ["Mehdi", "Sardar", "Alireza", "Saman", "Milad", "Morteza", "Shoja", "Saeid", "Omid", "Karim"],
        "last_names": ["Taremi", "Azmoun", "Jahanbakhsh", "Ghoddos", "Mohammadi", "Pouraliganji", "Khalilzadeh", "Ezatolahi", "Nourollahi", "Ansarifard"]
    },
    "Saudi Arabia": {
        "first_names": ["Salem", "Saleh", "Abdullah", "Mohammed", "Firas", "Saud", "Hassan", "Nasser", "Abdulrahman", "Yasser"],
        "last_names": ["Al-Dawsari", "Al-Shehri", "Al-Hamdan", "Al-Burayk", "Al-Amri", "Abdulhamid", "Al-Tambakti", "Al-Hassan", "Ghareeb", "Al-Shahrani"]
    },
    "Qatar": {
        "first_names": ["Akram", "Almoez", "Hassan", "Karim", "Mohammed", "Assim", "Abdulaziz", "Ahmed", "Boualem", "Homam"],
        "last_names": ["Afif", "Ali", "Al-Haydos", "Boudiaf", "Waad", "Madibo", "Hatim", "Alaaeldin", "Khoukhi", "Ahmed"]
    },
    "Tunisia": {
        "first_names": ["Youssef", "Wahbi", "Aissa", "Hannibal", "Mohamed", "Ellyes", "Ali", "Dylan", "Montassar", "Ferjani"],
        "last_names": ["Msakni", "Khazri", "Laidouni", "Mejbri", "Drager", "Skhiri", "Abdi", "Bronn", "Talbi", "Sassi"]
    },
    "Bosnia and Herzegovina": {
        "first_names": ["Edin", "Miralem", "Sead", "Ermedin", "Anel", "Armin", "Kenan", "Ivan", "Armin", "Smail"],
        "last_names": ["Dzeko", "Pjanic", "Kolasinac", "Demirovic", "Ahmedhodzic", "Hodzic", "Kodro", "Basic", "Civic", "Prevljak"]
    },
    "North Macedonia": {
        "first_names": ["Goran", "Enis", "Stefan", "Ezgjan", "Elif", "Aleksandar", "Boban", "Eljif", "Darko", "Milan"],
        "last_names": ["Pandev", "Bardhi", "Ristovski", "Alioski", "Elmas", "Trajkovski", "Nikolov", "Velkovski", "Churlinov", "Ristevski"]
    },
    "Slovenia": {
        "first_names": ["Jan", "Benjamin", "Josip", "Andraz", "Sandi", "Petar", "Jure", "Adam", "Erik", "Miha"],
        "last_names": ["Oblak", "Sesko", "Ilicic", "Sporar", "Lovric", "Stojanovic", "Balkovec", "Gnezda Cerin", "Janza", "Mevlja"]
    },
    "Slovakia": {
        "first_names": ["Milan", "Marek", "Peter", "Ondrej", "Robert", "Juraj", "Lubomir", "Tomas", "Stanislav", "David"],
        "last_names": ["Skriniar", "Hamsik", "Pekarik", "Duda", "Mak", "Kucka", "Lobotka", "Suslov", "Hancko", "Strelec"]
    },
    "Czech Republic": {
        "first_names": ["Tomas", "Patrik", "Vladimir", "Adam", "Jakub", "Lukas", "Antonin", "Michael", "Vaclav", "Alex"],
        "last_names": ["Soucek", "Schick", "Coufal", "Hlozek", "Jankto", "Provod", "Barak", "Krmencik", "Jurecka", "Kral"]
    },
    "Hungary": {
        "first_names": ["Dominik", "Willi", "Peter", "Roland", "Adam", "Loic", "Zsolt", "Daniel", "Attila", "Bendeguz"],
        "last_names": ["Szoboszlai", "Orban", "Gulacsi", "Sallai", "Szalai", "Nego", "Nagy", "Gazdag", "Fiola", "Bolla"]
    },
    "Romania": {
        "first_names": ["Nicolae", "Dennis", "Razvan", "Florinel", "Ianis", "Andrei", "Valentin", "Alexandru", "Radu", "George"],
        "last_names": ["Stanciu", "Man", "Marin", "Coman", "Hagi", "Ratiu", "Mihaila", "Mitrita", "Dragusin", "Puscas"]
    },
    "Bulgaria": {
        "first_names": ["Kiril", "Georgi", "Ivan", "Todor", "Ivaylo", "Dimitar", "Atanas", "Martin", "Daniel", "Valentin"],
        "last_names": ["Despodov", "Kostadinov", "Goranov", "Nedelev", "Chochev", "Iliev", "Minev", "Petkov", "Hristov", "Antov"]
    },
    "Russia": {
        "first_names": ["Aleksandr", "Artem", "Denis", "Fyodor", "Aleksey", "Anton", "Igor", "Daniil", "Roman", "Viktor"],
        "last_names": ["Golovin", "Dzyuba", "Cheryshev", "Smolov", "Miranchuk", "Shunin", "Ionov", "Zobnin", "Kuzyaev", "Zhirkov"]
    },
    "Ivory Coast": {
        "first_names": ["Nicolas", "Sebastien", "Franck", "Max", "Wilfried", "Serge", "Simon", "Ibrahim", "Seko", "Odilon"],
        "last_names": ["Pepe", "Haller", "Kessie", "Gradel", "Zaha", "Aurier", "Deli", "Sangare", "Fofana", "Kossounou"]
    },
    "Georgia": {
        "first_names": ["Khvicha", "Georges", "Giorgi", "Saba", "Otar", "Budu", "Jaba", "Guram", "Luka", "Solomon"],
        "last_names": ["Kvaratskhelia", "Mikautadze", "Mamardashvili", "Lobjanidze", "Kakabadze", "Zivzivadze", "Kankava", "Kashia", "Lochoshvili", "Kiteishvili"]
    },
    "Armenia": {
        "first_names": ["Henrikh", "Sargis", "Hovhannes", "Varazdat", "Arman", "Tigran", "Gevorg", "Norberto", "Eduard", "Lucas"],
        "last_names": ["Mkhitaryan", "Adamyan", "Hambartsumyan", "Haroyan", "Hovhannisyan", "Barseghyan", "Ghazaryan", "Zelarayan", "Spertsyan", "Grigoryan"]
    },
}

# ============ HISTORICAL PLAYERS ============
HISTORICAL_PLAYERS = [
    # Brazilian Legends
    {"name": "Pele", "nationality": "Brazil", "position": "Forward", "teams": [{"team": "Santos", "years": [1956, 1974]}, {"team": "New York Cosmos", "years": [1975, 1977]}]},
    {"name": "Ronaldo Nazario", "nationality": "Brazil", "position": "Forward", "teams": [{"team": "Cruzeiro", "years": [1993, 1994]}, {"team": "PSV", "years": [1994, 1996]}, {"team": "Barcelona", "years": [1996, 1997]}, {"team": "Inter Milan", "years": [1997, 2002]}, {"team": "Real Madrid", "years": [2002, 2007]}, {"team": "AC Milan", "years": [2007, 2008]}, {"team": "Corinthians", "years": [2009, 2011]}]},
    {"name": "Ronaldinho", "nationality": "Brazil", "position": "Midfielder", "teams": [{"team": "Gremio", "years": [1998, 2001]}, {"team": "Paris Saint-Germain", "years": [2001, 2003]}, {"team": "Barcelona", "years": [2003, 2008]}, {"team": "AC Milan", "years": [2008, 2011]}]},
    {"name": "Kaka", "nationality": "Brazil", "position": "Midfielder", "teams": [{"team": "Sao Paulo", "years": [2001, 2003]}, {"team": "AC Milan", "years": [2003, 2009]}, {"team": "Real Madrid", "years": [2009, 2013]}, {"team": "AC Milan", "years": [2013, 2014]}]},
    {"name": "Rivaldo", "nationality": "Brazil", "position": "Midfielder", "teams": [{"team": "Palmeiras", "years": [1994, 1996]}, {"team": "Deportivo La Coruna", "years": [1996, 1997]}, {"team": "Barcelona", "years": [1997, 2002]}, {"team": "AC Milan", "years": [2002, 2004]}]},
    {"name": "Romario", "nationality": "Brazil", "position": "Forward", "teams": [{"team": "Vasco da Gama", "years": [1985, 1988]}, {"team": "PSV", "years": [1988, 1993]}, {"team": "Barcelona", "years": [1993, 1995]}, {"team": "Flamengo", "years": [1995, 1999]}]},
    {"name": "Roberto Carlos", "nationality": "Brazil", "position": "Defender", "teams": [{"team": "Palmeiras", "years": [1993, 1995]}, {"team": "Inter Milan", "years": [1995, 1996]}, {"team": "Real Madrid", "years": [1996, 2007]}, {"team": "Fenerbahce", "years": [2007, 2009]}]},
    {"name": "Cafu", "nationality": "Brazil", "position": "Defender", "teams": [{"team": "Sao Paulo", "years": [1989, 1994]}, {"team": "Real Zaragoza", "years": [1994, 1995]}, {"team": "Palmeiras", "years": [1995, 1997]}, {"team": "Roma", "years": [1997, 2003]}, {"team": "AC Milan", "years": [2003, 2008]}]},
    
    # Argentine Legends
    {"name": "Diego Maradona", "nationality": "Argentina", "position": "Midfielder", "teams": [{"team": "Argentinos Juniors", "years": [1976, 1981]}, {"team": "Boca Juniors", "years": [1981, 1982]}, {"team": "Barcelona", "years": [1982, 1984]}, {"team": "Napoli", "years": [1984, 1991]}, {"team": "Sevilla", "years": [1992, 1993]}, {"team": "Newell's Old Boys", "years": [1993, 1994]}, {"team": "Boca Juniors", "years": [1995, 1997]}]},
    {"name": "Gabriel Batistuta", "nationality": "Argentina", "position": "Forward", "teams": [{"team": "River Plate", "years": [1988, 1991]}, {"team": "Fiorentina", "years": [1991, 2000]}, {"team": "Roma", "years": [2000, 2003]}, {"team": "Inter Milan", "years": [2003, 2003]}]},
    {"name": "Juan Roman Riquelme", "nationality": "Argentina", "position": "Midfielder", "teams": [{"team": "Argentinos Juniors", "years": [1996, 1996]}, {"team": "Boca Juniors", "years": [1996, 2002]}, {"team": "Barcelona", "years": [2002, 2005]}, {"team": "Villarreal", "years": [2003, 2007]}, {"team": "Boca Juniors", "years": [2007, 2014]}]},
    {"name": "Hernan Crespo", "nationality": "Argentina", "position": "Forward", "teams": [{"team": "River Plate", "years": [1993, 1996]}, {"team": "Parma", "years": [1996, 2000]}, {"team": "Lazio", "years": [2000, 2002]}, {"team": "Inter Milan", "years": [2002, 2003]}, {"team": "Chelsea", "years": [2003, 2008]}, {"team": "AC Milan", "years": [2004, 2005]}]},
    {"name": "Javier Zanetti", "nationality": "Argentina", "position": "Defender", "teams": [{"team": "Talleres", "years": [1992, 1993]}, {"team": "Banfield", "years": [1993, 1995]}, {"team": "Inter Milan", "years": [1995, 2014]}]},
    
    # Italian Legends
    {"name": "Paolo Maldini", "nationality": "Italy", "position": "Defender", "teams": [{"team": "AC Milan", "years": [1985, 2009]}]},
    {"name": "Franco Baresi", "nationality": "Italy", "position": "Defender", "teams": [{"team": "AC Milan", "years": [1977, 1997]}]},
    {"name": "Roberto Baggio", "nationality": "Italy", "position": "Forward", "teams": [{"team": "Vicenza", "years": [1982, 1985]}, {"team": "Fiorentina", "years": [1985, 1990]}, {"team": "Juventus", "years": [1990, 1995]}, {"team": "AC Milan", "years": [1995, 1997]}, {"team": "Bologna", "years": [1997, 1998]}, {"team": "Inter Milan", "years": [1998, 2000]}, {"team": "Brescia", "years": [2000, 2004]}]},
    {"name": "Alessandro Del Piero", "nationality": "Italy", "position": "Forward", "teams": [{"team": "Padova", "years": [1991, 1993]}, {"team": "Juventus", "years": [1993, 2012]}, {"team": "Sydney FC", "years": [2012, 2014]}]},
    {"name": "Francesco Totti", "nationality": "Italy", "position": "Forward", "teams": [{"team": "Roma", "years": [1993, 2017]}]},
    {"name": "Andrea Pirlo", "nationality": "Italy", "position": "Midfielder", "teams": [{"team": "Brescia", "years": [1995, 1998]}, {"team": "Inter Milan", "years": [1998, 2001]}, {"team": "AC Milan", "years": [2001, 2011]}, {"team": "Juventus", "years": [2011, 2015]}, {"team": "New York City FC", "years": [2015, 2017]}]},
    {"name": "Gianluigi Buffon", "nationality": "Italy", "position": "Goalkeeper", "teams": [{"team": "Parma", "years": [1995, 2001]}, {"team": "Juventus", "years": [2001, 2018]}, {"team": "Paris Saint-Germain", "years": [2018, 2019]}, {"team": "Juventus", "years": [2019, 2021]}, {"team": "Parma", "years": [2021, 2023]}]},
    {"name": "Fabio Cannavaro", "nationality": "Italy", "position": "Defender", "teams": [{"team": "Napoli", "years": [1992, 1995]}, {"team": "Parma", "years": [1995, 2002]}, {"team": "Inter Milan", "years": [2002, 2004]}, {"team": "Juventus", "years": [2004, 2006]}, {"team": "Real Madrid", "years": [2006, 2009]}]},
    
    # French Legends
    {"name": "Zinedine Zidane", "nationality": "France", "position": "Midfielder", "teams": [{"team": "Cannes", "years": [1988, 1992]}, {"team": "Bordeaux", "years": [1992, 1996]}, {"team": "Juventus", "years": [1996, 2001]}, {"team": "Real Madrid", "years": [2001, 2006]}]},
    {"name": "Thierry Henry", "nationality": "France", "position": "Forward", "teams": [{"team": "Monaco", "years": [1994, 1999]}, {"team": "Juventus", "years": [1999, 1999]}, {"team": "Arsenal", "years": [1999, 2007]}, {"team": "Barcelona", "years": [2007, 2010]}, {"team": "New York Red Bulls", "years": [2010, 2014]}]},
    {"name": "Michel Platini", "nationality": "France", "position": "Midfielder", "teams": [{"team": "Nancy", "years": [1972, 1979]}, {"team": "Saint-Etienne", "years": [1979, 1982]}, {"team": "Juventus", "years": [1982, 1987]}]},
    {"name": "Just Fontaine", "nationality": "France", "position": "Forward", "teams": [{"team": "Nice", "years": [1953, 1956]}, {"team": "Reims", "years": [1956, 1962]}]},
    {"name": "David Trezeguet", "nationality": "France", "position": "Forward", "teams": [{"team": "Monaco", "years": [1995, 2000]}, {"team": "Juventus", "years": [2000, 2010]}]},
    {"name": "Patrick Vieira", "nationality": "France", "position": "Midfielder", "teams": [{"team": "Cannes", "years": [1993, 1995]}, {"team": "AC Milan", "years": [1995, 1996]}, {"team": "Arsenal", "years": [1996, 2005]}, {"team": "Juventus", "years": [2005, 2006]}, {"team": "Inter Milan", "years": [2006, 2010]}, {"team": "Manchester City", "years": [2010, 2011]}]},
    
    # German Legends
    {"name": "Franz Beckenbauer", "nationality": "Germany", "position": "Defender", "teams": [{"team": "Bayern Munich", "years": [1964, 1977]}, {"team": "New York Cosmos", "years": [1977, 1980]}, {"team": "Hamburg", "years": [1980, 1982]}, {"team": "New York Cosmos", "years": [1983, 1983]}]},
    {"name": "Gerd Muller", "nationality": "Germany", "position": "Forward", "teams": [{"team": "Bayern Munich", "years": [1964, 1979]}, {"team": "Fort Lauderdale Strikers", "years": [1979, 1981]}]},
    {"name": "Lothar Matthaus", "nationality": "Germany", "position": "Midfielder", "teams": [{"team": "Borussia Monchengladbach", "years": [1979, 1984]}, {"team": "Bayern Munich", "years": [1984, 1988]}, {"team": "Inter Milan", "years": [1988, 1992]}, {"team": "Bayern Munich", "years": [1992, 2000]}]},
    {"name": "Jurgen Klinsmann", "nationality": "Germany", "position": "Forward", "teams": [{"team": "Stuttgart", "years": [1984, 1989]}, {"team": "Inter Milan", "years": [1989, 1992]}, {"team": "Monaco", "years": [1992, 1994]}, {"team": "Tottenham", "years": [1994, 1995]}, {"team": "Bayern Munich", "years": [1995, 1997]}, {"team": "Sampdoria", "years": [1997, 1998]}, {"team": "Tottenham", "years": [1998, 1998]}]},
    {"name": "Oliver Kahn", "nationality": "Germany", "position": "Goalkeeper", "teams": [{"team": "Karlsruher SC", "years": [1987, 1994]}, {"team": "Bayern Munich", "years": [1994, 2008]}]},
    {"name": "Miroslav Klose", "nationality": "Germany", "position": "Forward", "teams": [{"team": "Kaiserslautern", "years": [1999, 2004]}, {"team": "Werder Bremen", "years": [2004, 2007]}, {"team": "Bayern Munich", "years": [2007, 2011]}, {"team": "Lazio", "years": [2011, 2016]}]},
    {"name": "Philipp Lahm", "nationality": "Germany", "position": "Defender", "teams": [{"team": "Bayern Munich", "years": [2002, 2017]}]},
    {"name": "Michael Ballack", "nationality": "Germany", "position": "Midfielder", "teams": [{"team": "Chemnitzer FC", "years": [1995, 1997]}, {"team": "Kaiserslautern", "years": [1997, 1999]}, {"team": "Bayer Leverkusen", "years": [1999, 2002]}, {"team": "Bayern Munich", "years": [2002, 2006]}, {"team": "Chelsea", "years": [2006, 2010]}, {"team": "Bayer Leverkusen", "years": [2010, 2012]}]},
    {"name": "Bastian Schweinsteiger", "nationality": "Germany", "position": "Midfielder", "teams": [{"team": "Bayern Munich", "years": [2002, 2015]}, {"team": "Manchester United", "years": [2015, 2017]}, {"team": "Chicago Fire", "years": [2017, 2019]}]},
    
    # English Legends
    {"name": "Bobby Charlton", "nationality": "England", "position": "Midfielder", "teams": [{"team": "Manchester United", "years": [1956, 1973]}, {"team": "Preston North End", "years": [1974, 1975]}]},
    {"name": "Bobby Moore", "nationality": "England", "position": "Defender", "teams": [{"team": "West Ham United", "years": [1958, 1974]}, {"team": "Fulham", "years": [1974, 1977]}]},
    {"name": "Gary Lineker", "nationality": "England", "position": "Forward", "teams": [{"team": "Leicester City", "years": [1978, 1985]}, {"team": "Everton", "years": [1985, 1986]}, {"team": "Barcelona", "years": [1986, 1989]}, {"team": "Tottenham", "years": [1989, 1992]}]},
    {"name": "David Beckham", "nationality": "England", "position": "Midfielder", "teams": [{"team": "Manchester United", "years": [1992, 2003]}, {"team": "Real Madrid", "years": [2003, 2007]}, {"team": "LA Galaxy", "years": [2007, 2012]}, {"team": "AC Milan", "years": [2009, 2010]}, {"team": "Paris Saint-Germain", "years": [2013, 2013]}]},
    {"name": "Steven Gerrard", "nationality": "England", "position": "Midfielder", "teams": [{"team": "Liverpool", "years": [1998, 2015]}, {"team": "LA Galaxy", "years": [2015, 2016]}]},
    {"name": "Frank Lampard", "nationality": "England", "position": "Midfielder", "teams": [{"team": "West Ham United", "years": [1995, 2001]}, {"team": "Chelsea", "years": [2001, 2014]}, {"team": "Manchester City", "years": [2014, 2015]}, {"team": "New York City FC", "years": [2015, 2017]}]},
    {"name": "Wayne Rooney", "nationality": "England", "position": "Forward", "teams": [{"team": "Everton", "years": [2002, 2004]}, {"team": "Manchester United", "years": [2004, 2017]}, {"team": "Everton", "years": [2017, 2018]}, {"team": "DC United", "years": [2018, 2019]}, {"team": "Derby County", "years": [2020, 2021]}]},
    {"name": "Alan Shearer", "nationality": "England", "position": "Forward", "teams": [{"team": "Southampton", "years": [1988, 1992]}, {"team": "Blackburn Rovers", "years": [1992, 1996]}, {"team": "Newcastle United", "years": [1996, 2006]}]},
    {"name": "Michael Owen", "nationality": "England", "position": "Forward", "teams": [{"team": "Liverpool", "years": [1996, 2004]}, {"team": "Real Madrid", "years": [2004, 2005]}, {"team": "Newcastle United", "years": [2005, 2009]}, {"team": "Manchester United", "years": [2009, 2012]}, {"team": "Stoke City", "years": [2012, 2013]}]},
    {"name": "Paul Scholes", "nationality": "England", "position": "Midfielder", "teams": [{"team": "Manchester United", "years": [1993, 2013]}]},
    {"name": "Rio Ferdinand", "nationality": "England", "position": "Defender", "teams": [{"team": "West Ham United", "years": [1996, 2000]}, {"team": "Leeds United", "years": [2000, 2002]}, {"team": "Manchester United", "years": [2002, 2014]}, {"team": "QPR", "years": [2014, 2015]}]},
    {"name": "John Terry", "nationality": "England", "position": "Defender", "teams": [{"team": "Chelsea", "years": [1998, 2017]}, {"team": "Aston Villa", "years": [2017, 2018]}]},
    {"name": "Ashley Cole", "nationality": "England", "position": "Defender", "teams": [{"team": "Arsenal", "years": [1999, 2006]}, {"team": "Chelsea", "years": [2006, 2014]}, {"team": "Roma", "years": [2014, 2015]}, {"team": "LA Galaxy", "years": [2016, 2018]}, {"team": "Derby County", "years": [2019, 2019]}]},
    
    # Spanish Legends
    {"name": "Alfredo Di Stefano", "nationality": "Spain", "position": "Forward", "teams": [{"team": "River Plate", "years": [1945, 1949]}, {"team": "Real Madrid", "years": [1953, 1964]}, {"team": "Espanyol", "years": [1964, 1966]}]},
    {"name": "Raul", "nationality": "Spain", "position": "Forward", "teams": [{"team": "Real Madrid", "years": [1994, 2010]}, {"team": "Schalke 04", "years": [2010, 2012]}, {"team": "Al-Sadd", "years": [2012, 2014]}, {"team": "New York Cosmos", "years": [2014, 2015]}]},
    {"name": "Xavi", "nationality": "Spain", "position": "Midfielder", "teams": [{"team": "Barcelona", "years": [1998, 2015]}, {"team": "Al-Sadd", "years": [2015, 2019]}]},
    {"name": "Andres Iniesta", "nationality": "Spain", "position": "Midfielder", "teams": [{"team": "Barcelona", "years": [2002, 2018]}, {"team": "Vissel Kobe", "years": [2018, 2023]}]},
    {"name": "Iker Casillas", "nationality": "Spain", "position": "Goalkeeper", "teams": [{"team": "Real Madrid", "years": [1999, 2015]}, {"team": "Porto", "years": [2015, 2020]}]},
    {"name": "Carles Puyol", "nationality": "Spain", "position": "Defender", "teams": [{"team": "Barcelona", "years": [1999, 2014]}]},
    {"name": "Sergio Busquets", "nationality": "Spain", "position": "Midfielder", "teams": [{"team": "Barcelona", "years": [2008, 2023]}, {"team": "Inter Miami", "years": [2023, 2025]}]},
    {"name": "Gerard Pique", "nationality": "Spain", "position": "Defender", "teams": [{"team": "Manchester United", "years": [2004, 2008]}, {"team": "Barcelona", "years": [2008, 2022]}]},
    {"name": "David Villa", "nationality": "Spain", "position": "Forward", "teams": [{"team": "Sporting Gijon", "years": [2001, 2003]}, {"team": "Real Zaragoza", "years": [2003, 2005]}, {"team": "Valencia", "years": [2005, 2010]}, {"team": "Barcelona", "years": [2010, 2013]}, {"team": "Atletico Madrid", "years": [2013, 2014]}, {"team": "New York City FC", "years": [2014, 2018]}, {"team": "Vissel Kobe", "years": [2019, 2019]}]},
    {"name": "Fernando Torres", "nationality": "Spain", "position": "Forward", "teams": [{"team": "Atletico Madrid", "years": [2001, 2007]}, {"team": "Liverpool", "years": [2007, 2011]}, {"team": "Chelsea", "years": [2011, 2014]}, {"team": "AC Milan", "years": [2014, 2015]}, {"team": "Atletico Madrid", "years": [2015, 2018]}, {"team": "Sagan Tosu", "years": [2018, 2019]}]},
    
    # Dutch Legends
    {"name": "Johan Cruyff", "nationality": "Netherlands", "position": "Forward", "teams": [{"team": "Ajax", "years": [1964, 1973]}, {"team": "Barcelona", "years": [1973, 1978]}, {"team": "LA Aztecs", "years": [1979, 1979]}, {"team": "Washington Diplomats", "years": [1980, 1981]}, {"team": "Levante", "years": [1981, 1981]}, {"team": "Ajax", "years": [1981, 1983]}, {"team": "Feyenoord", "years": [1983, 1984]}]},
    {"name": "Marco van Basten", "nationality": "Netherlands", "position": "Forward", "teams": [{"team": "Ajax", "years": [1981, 1987]}, {"team": "AC Milan", "years": [1987, 1995]}]},
    {"name": "Ruud Gullit", "nationality": "Netherlands", "position": "Midfielder", "teams": [{"team": "Feyenoord", "years": [1982, 1985]}, {"team": "PSV", "years": [1985, 1987]}, {"team": "AC Milan", "years": [1987, 1993]}, {"team": "Sampdoria", "years": [1993, 1994]}, {"team": "AC Milan", "years": [1994, 1995]}, {"team": "Sampdoria", "years": [1995, 1996]}, {"team": "Chelsea", "years": [1996, 1998]}]},
    {"name": "Frank Rijkaard", "nationality": "Netherlands", "position": "Midfielder", "teams": [{"team": "Ajax", "years": [1980, 1988]}, {"team": "Real Zaragoza", "years": [1988, 1988]}, {"team": "AC Milan", "years": [1988, 1993]}, {"team": "Ajax", "years": [1993, 1995]}]},
    {"name": "Dennis Bergkamp", "nationality": "Netherlands", "position": "Forward", "teams": [{"team": "Ajax", "years": [1986, 1993]}, {"team": "Inter Milan", "years": [1993, 1995]}, {"team": "Arsenal", "years": [1995, 2006]}]},
    {"name": "Robin van Persie", "nationality": "Netherlands", "position": "Forward", "teams": [{"team": "Feyenoord", "years": [2001, 2004]}, {"team": "Arsenal", "years": [2004, 2012]}, {"team": "Manchester United", "years": [2012, 2015]}, {"team": "Fenerbahce", "years": [2015, 2018]}, {"team": "Feyenoord", "years": [2018, 2019]}]},
    {"name": "Arjen Robben", "nationality": "Netherlands", "position": "Forward", "teams": [{"team": "Groningen", "years": [2000, 2002]}, {"team": "PSV", "years": [2002, 2004]}, {"team": "Chelsea", "years": [2004, 2007]}, {"team": "Real Madrid", "years": [2007, 2009]}, {"team": "Bayern Munich", "years": [2009, 2019]}]},
    {"name": "Wesley Sneijder", "nationality": "Netherlands", "position": "Midfielder", "teams": [{"team": "Ajax", "years": [2002, 2007]}, {"team": "Real Madrid", "years": [2007, 2009]}, {"team": "Inter Milan", "years": [2009, 2013]}, {"team": "Galatasaray", "years": [2013, 2017]}, {"team": "Nice", "years": [2017, 2018]}]},
    {"name": "Edwin van der Sar", "nationality": "Netherlands", "position": "Goalkeeper", "teams": [{"team": "Ajax", "years": [1990, 1999]}, {"team": "Juventus", "years": [1999, 2001]}, {"team": "Fulham", "years": [2001, 2005]}, {"team": "Manchester United", "years": [2005, 2011]}]},
    
    # Portuguese Legends
    {"name": "Eusebio", "nationality": "Portugal", "position": "Forward", "teams": [{"team": "Benfica", "years": [1960, 1975]}]},
    {"name": "Luis Figo", "nationality": "Portugal", "position": "Midfielder", "teams": [{"team": "Sporting CP", "years": [1989, 1995]}, {"team": "Barcelona", "years": [1995, 2000]}, {"team": "Real Madrid", "years": [2000, 2005]}, {"team": "Inter Milan", "years": [2005, 2009]}]},
    {"name": "Rui Costa", "nationality": "Portugal", "position": "Midfielder", "teams": [{"team": "Benfica", "years": [1990, 1994]}, {"team": "Fiorentina", "years": [1994, 2001]}, {"team": "AC Milan", "years": [2001, 2006]}, {"team": "Benfica", "years": [2006, 2008]}]},
    
    # Other Legends
    {"name": "George Best", "nationality": "Northern Ireland", "position": "Forward", "teams": [{"team": "Manchester United", "years": [1963, 1974]}]},
    {"name": "Lev Yashin", "nationality": "Russia", "position": "Goalkeeper", "teams": [{"team": "Dynamo Moscow", "years": [1950, 1970]}]},
    {"name": "Zlatan Ibrahimovic", "nationality": "Sweden", "position": "Forward", "teams": [{"team": "Malmo", "years": [1999, 2001]}, {"team": "Ajax", "years": [2001, 2004]}, {"team": "Juventus", "years": [2004, 2006]}, {"team": "Inter Milan", "years": [2006, 2009]}, {"team": "Barcelona", "years": [2009, 2011]}, {"team": "AC Milan", "years": [2010, 2012]}, {"team": "Paris Saint-Germain", "years": [2012, 2016]}, {"team": "Manchester United", "years": [2016, 2018]}, {"team": "LA Galaxy", "years": [2018, 2019]}, {"team": "AC Milan", "years": [2020, 2023]}]},
    {"name": "Samuel Eto'o", "nationality": "Cameroon", "position": "Forward", "teams": [{"team": "Real Madrid", "years": [1997, 2000]}, {"team": "Mallorca", "years": [2000, 2004]}, {"team": "Barcelona", "years": [2004, 2009]}, {"team": "Inter Milan", "years": [2009, 2011]}, {"team": "Anzhi Makhachkala", "years": [2011, 2013]}, {"team": "Chelsea", "years": [2013, 2014]}, {"team": "Everton", "years": [2014, 2015]}, {"team": "Antalyaspor", "years": [2015, 2018]}]},
    {"name": "Didier Drogba", "nationality": "Ivory Coast", "position": "Forward", "teams": [{"team": "Le Mans", "years": [2001, 2003]}, {"team": "Guingamp", "years": [2002, 2003]}, {"team": "Marseille", "years": [2003, 2004]}, {"team": "Chelsea", "years": [2004, 2012]}, {"team": "Shanghai Shenhua", "years": [2012, 2012]}, {"team": "Galatasaray", "years": [2013, 2014]}, {"team": "Chelsea", "years": [2014, 2015]}, {"team": "Montreal Impact", "years": [2015, 2016]}]},
    {"name": "George Weah", "nationality": "Liberia", "position": "Forward", "teams": [{"team": "Monaco", "years": [1988, 1992]}, {"team": "Paris Saint-Germain", "years": [1992, 1995]}, {"team": "AC Milan", "years": [1995, 1999]}, {"team": "Chelsea", "years": [2000, 2000]}, {"team": "Manchester City", "years": [2000, 2000]}, {"team": "Marseille", "years": [2000, 2001]}, {"team": "Al-Jazira", "years": [2001, 2003]}]},
    {"name": "Ryan Giggs", "nationality": "Wales", "position": "Midfielder", "teams": [{"team": "Manchester United", "years": [1990, 2014]}]},
    {"name": "Eric Cantona", "nationality": "France", "position": "Forward", "teams": [{"team": "Auxerre", "years": [1983, 1988]}, {"team": "Martigues", "years": [1988, 1989]}, {"team": "Marseille", "years": [1989, 1991]}, {"team": "Bordeaux", "years": [1989, 1989]}, {"team": "Montpellier", "years": [1989, 1991]}, {"team": "Nimes", "years": [1991, 1991]}, {"team": "Leeds United", "years": [1992, 1992]}, {"team": "Manchester United", "years": [1992, 1997]}]},
    {"name": "Peter Schmeichel", "nationality": "Denmark", "position": "Goalkeeper", "teams": [{"team": "Brondby", "years": [1987, 1991]}, {"team": "Manchester United", "years": [1991, 1999]}, {"team": "Sporting CP", "years": [1999, 2001]}, {"team": "Aston Villa", "years": [2001, 2002]}, {"team": "Manchester City", "years": [2002, 2003]}]},
]

# Current top players (manually curated for accuracy)
CURRENT_TOP_PLAYERS = [
    # Already in the database - these are the most important ones
    {"name": "Lionel Messi", "nationality": "Argentina", "position": "Forward", "teams": [{"team": "Barcelona", "years": [2004, 2021]}, {"team": "Paris Saint-Germain", "years": [2021, 2023]}, {"team": "Inter Miami", "years": [2023, 2025]}], "market_values": [{"year": 2024, "value": 35000000}]},
    {"name": "Cristiano Ronaldo", "nationality": "Portugal", "position": "Forward", "teams": [{"team": "Sporting CP", "years": [2002, 2003]}, {"team": "Manchester United", "years": [2003, 2009]}, {"team": "Real Madrid", "years": [2009, 2018]}, {"team": "Juventus", "years": [2018, 2021]}, {"team": "Manchester United", "years": [2021, 2022]}, {"team": "Al-Nassr", "years": [2023, 2025]}], "market_values": [{"year": 2024, "value": 15000000}]},
    {"name": "Neymar", "nationality": "Brazil", "position": "Forward", "teams": [{"team": "Santos", "years": [2009, 2013]}, {"team": "Barcelona", "years": [2013, 2017]}, {"team": "Paris Saint-Germain", "years": [2017, 2023]}, {"team": "Al-Hilal", "years": [2023, 2025]}], "market_values": [{"year": 2024, "value": 30000000}]},
    {"name": "Erling Haaland", "nationality": "Norway", "position": "Forward", "teams": [{"team": "Molde", "years": [2017, 2019]}, {"team": "Red Bull Salzburg", "years": [2019, 2020]}, {"team": "Borussia Dortmund", "years": [2020, 2022]}, {"team": "Manchester City", "years": [2022, 2025]}], "market_values": [{"year": 2024, "value": 200000000}]},
    {"name": "Kylian Mbappe", "nationality": "France", "position": "Forward", "teams": [{"team": "Monaco", "years": [2015, 2017]}, {"team": "Paris Saint-Germain", "years": [2017, 2024]}, {"team": "Real Madrid", "years": [2024, 2025]}], "market_values": [{"year": 2024, "value": 180000000}]},
    {"name": "Vinicius Junior", "nationality": "Brazil", "position": "Forward", "teams": [{"team": "Flamengo", "years": [2017, 2018]}, {"team": "Real Madrid", "years": [2018, 2025]}], "market_values": [{"year": 2024, "value": 200000000}]},
]

def generate_random_player(nationality: str, team: str, position: str, player_id: int):
    """Generate a random player with realistic data"""
    nat_data = NATIONALITIES_DATA.get(nationality, NATIONALITIES_DATA["England"])
    
    first_name = random.choice(nat_data["first_names"])
    last_name = random.choice(nat_data["last_names"])
    name = f"{first_name} {last_name}"
    
    # Generate age (17-38)
    age = random.randint(17, 38)
    birth_year = 2024 - age
    
    # Generate market value based on age and position
    base_value = random.randint(100000, 50000000)
    if position == "Forward":
        base_value = int(base_value * 1.5)
    elif position == "Goalkeeper":
        base_value = int(base_value * 0.7)
    
    # Adjust for age
    if age < 23:
        base_value = int(base_value * 1.3)  # Young players premium
    elif age > 32:
        base_value = int(base_value * 0.5)  # Older players discount
    
    # Career history (generate 1-4 previous teams)
    num_teams = random.randint(1, min(4, (age - 17) // 3 + 1))
    teams_history = []
    current_year = 2024
    
    for i in range(num_teams - 1, -1, -1):
        if i == 0:
            # Current team
            teams_history.append({"team": team, "years": [current_year - random.randint(1, 4), 2025]})
        else:
            # Previous team
            end_year = current_year - random.randint(1, 3)
            start_year = end_year - random.randint(1, 4)
            # Pick a random team from any league
            random_league = random.choice(list(TEAMS_DATABASE.keys()))
            random_team = random.choice(TEAMS_DATABASE[random_league]["teams"])
            teams_history.insert(0, {"team": random_team, "years": [start_year, end_year]})
            current_year = start_year
    
    return {
        "player_id": f"player_{player_id:05d}",
        "name": name,
        "nationality": nationality,
        "position": position,
        "teams": teams_history,
        "market_values": [{"year": 2024, "value": base_value}]
    }

async def generate_comprehensive_database():
    """Generate a comprehensive football database"""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client['test_database']
    
    print("="*60)
    print("GENERATING COMPREHENSIVE FOOTBALL DATABASE")
    print("="*60)
    
    all_players = []
    all_teams = []
    player_id = 1
    seen_names = set()
    
    # Add historical players first
    print("\n📜 Adding historical legends...")
    for player in HISTORICAL_PLAYERS:
        if player["name"] not in seen_names:
            player["player_id"] = f"player_{player_id:05d}"
            if "market_values" not in player:
                player["market_values"] = []
            all_players.append(player)
            seen_names.add(player["name"])
            player_id += 1
    print(f"   Added {len(HISTORICAL_PLAYERS)} legends")
    
    # Add current top players
    print("\n⭐ Adding current top players...")
    for player in CURRENT_TOP_PLAYERS:
        if player["name"] not in seen_names:
            player["player_id"] = f"player_{player_id:05d}"
            all_players.append(player)
            seen_names.add(player["name"])
            player_id += 1
    print(f"   Added {len(CURRENT_TOP_PLAYERS)} top players")
    
    # Generate players for each league and team
    print("\n🏟️ Generating players for all leagues...")
    
    for league_name, league_data in TEAMS_DATABASE.items():
        country = league_data["country"]
        teams = league_data["teams"]
        
        print(f"\n   📊 {league_name} ({country}) - {len(teams)} teams")
        
        for team in teams:
            # Add team to list
            all_teams.append({
                "name": team,
                "league": league_name,
                "country": country
            })
            
            # Generate squad (25-30 players per team)
            squad_size = random.randint(25, 30)
            positions = ["Goalkeeper"] * 3 + ["Defender"] * 9 + ["Midfielder"] * 10 + ["Forward"] * 8
            random.shuffle(positions)
            
            for i, position in enumerate(positions[:squad_size]):
                # 80% chance to be from same country, 20% foreign
                if random.random() < 0.8:
                    nationality = country
                else:
                    nationality = random.choice(list(NATIONALITIES_DATA.keys()))
                
                player = generate_random_player(nationality, team, position, player_id)
                
                # Check for duplicate names
                if player["name"] not in seen_names:
                    all_players.append(player)
                    seen_names.add(player["name"])
                    player_id += 1
        
        print(f"      Generated ~{len(teams) * 27} players")
    
    # Clear existing data
    print("\n🗑️ Clearing existing database...")
    await db.players.delete_many({})
    await db.teams.delete_many({})
    
    # Insert all players
    print(f"\n💾 Inserting {len(all_players)} players...")
    if all_players:
        # Insert in batches of 1000
        batch_size = 1000
        for i in range(0, len(all_players), batch_size):
            batch = all_players[i:i+batch_size]
            await db.players.insert_many(batch)
            print(f"   Inserted batch {i//batch_size + 1}/{(len(all_players)-1)//batch_size + 1}")
    
    # Insert all teams
    print(f"\n💾 Inserting {len(all_teams)} teams...")
    team_docs = []
    for i, team in enumerate(all_teams):
        team_docs.append({
            "team_id": f"team_{i+1:04d}",
            **team
        })
    if team_docs:
        await db.teams.insert_many(team_docs)
    
    # Print statistics
    total_players = await db.players.count_documents({})
    total_teams = await db.teams.count_documents({})
    
    print("\n" + "="*60)
    print("DATABASE GENERATION COMPLETE!")
    print("="*60)
    print(f"Total Players: {total_players}")
    print(f"Total Teams: {total_teams}")
    
    # Count by nationality
    nationalities = await db.players.aggregate([
        {"$group": {"_id": "$nationality", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 25}
    ]).to_list(25)
    
    print("\nTop 25 Nationalities:")
    for i, nat in enumerate(nationalities, 1):
        print(f"  {i:2}. {nat['_id']}: {nat['count']} players")
    
    # Count by position
    positions = await db.players.aggregate([
        {"$group": {"_id": "$position", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]).to_list(10)
    
    print("\nPlayers by Position:")
    for pos in positions:
        print(f"  {pos['_id']}: {pos['count']} players")
    
    # Count by league
    leagues = await db.teams.aggregate([
        {"$group": {"_id": "$league", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]).to_list(50)
    
    print(f"\nLeagues: {len(leagues)}")
    for league in leagues[:10]:
        print(f"  {league['_id']}: {league['count']} teams")
    
    client.close()
    print("\n✅ Database ready for use!")

if __name__ == "__main__":
    asyncio.run(generate_comprehensive_database())
