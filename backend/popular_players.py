"""
Popular Football Players for Career Path Game
5 büyük lig + Türkiye Süper Lig + Efsaneler
"""

from players_data.premier_league import PREMIER_LEAGUE_PLAYERS
from players_data.la_liga import LA_LIGA_PLAYERS
from players_data.serie_a import SERIE_A_PLAYERS
from players_data.bundesliga import BUNDESLIGA_PLAYERS
from players_data.ligue_1 import LIGUE_1_PLAYERS
from players_data.super_lig import SUPER_LIG_PLAYERS
from players_data.legends import LEGENDS_PLAYERS

# Tüm oyuncuları birleştir
POPULAR_PLAYERS = (
    PREMIER_LEAGUE_PLAYERS + 
    LA_LIGA_PLAYERS + 
    SERIE_A_PLAYERS + 
    BUNDESLIGA_PLAYERS + 
    LIGUE_1_PLAYERS + 
    SUPER_LIG_PLAYERS +
    LEGENDS_PLAYERS
)

# Toplam oyuncu sayısı yazdır (debug için)
print(f"Toplam oyuncu sayısı: {len(POPULAR_PLAYERS)}")
