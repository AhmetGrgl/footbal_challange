"""
Ortak Oyun Sistemleri - ELO, Lig, Seri Bonusları
"""

# Lig Seviyeleri ve ELO Aralıkları
LEAGUES = {
    "bronze": {
        "name": "Bronz",
        "name_en": "Bronze", 
        "icon": "🥉",
        "color": "#CD7F32",
        "min_elo": 0,
        "max_elo": 999,
        "rewards": {"coins_per_win": 10, "xp_per_win": 25}
    },
    "silver": {
        "name": "Gümüş",
        "name_en": "Silver",
        "icon": "🥈", 
        "color": "#C0C0C0",
        "min_elo": 1000,
        "max_elo": 1499,
        "rewards": {"coins_per_win": 15, "xp_per_win": 35}
    },
    "gold": {
        "name": "Altın",
        "name_en": "Gold",
        "icon": "🥇",
        "color": "#FFD700",
        "min_elo": 1500,
        "max_elo": 1999,
        "rewards": {"coins_per_win": 25, "xp_per_win": 50}
    },
    "elite": {
        "name": "Elit",
        "name_en": "Elite",
        "icon": "💎",
        "color": "#00BFFF",
        "min_elo": 2000,
        "max_elo": 2499,
        "rewards": {"coins_per_win": 40, "xp_per_win": 75}
    },
    "legend": {
        "name": "Efsane",
        "name_en": "Legend",
        "icon": "👑",
        "color": "#9D4EDD",
        "min_elo": 2500,
        "max_elo": 9999,
        "rewards": {"coins_per_win": 60, "xp_per_win": 100}
    }
}

# Seri Bonusları
STREAK_BONUSES = {
    3: {
        "name": "Üçlü Seri",
        "icon": "🔥",
        "bonus_coins": 20,
        "bonus_xp": 30,
        "multiplier": 1.5
    },
    5: {
        "name": "Beşli Seri",
        "icon": "⚡",
        "bonus_coins": 50,
        "bonus_xp": 75,
        "multiplier": 2.0,
        "badge": "streak_5"
    },
    7: {
        "name": "Yedili Seri",
        "icon": "💫",
        "bonus_coins": 100,
        "bonus_xp": 150,
        "multiplier": 2.5,
        "badge": "streak_7"
    },
    10: {
        "name": "Onlu Seri",
        "icon": "🌟",
        "bonus_coins": 200,
        "bonus_xp": 300,
        "multiplier": 3.0,
        "badge": "streak_master"
    }
}

# Rozetler
BADGES = {
    "streak_5": {"name": "Seri Avcısı", "icon": "⚡", "description": "5 maç üst üste kazan"},
    "streak_7": {"name": "Durdurulamaz", "icon": "💫", "description": "7 maç üst üste kazan"},
    "streak_master": {"name": "Seri Ustası", "icon": "🌟", "description": "10 maç üst üste kazan"},
    "first_win": {"name": "İlk Zafer", "icon": "🏆", "description": "İlk maçını kazan"},
    "century": {"name": "Yüzlük", "icon": "💯", "description": "100 maç oyna"},
    "legend_rank": {"name": "Efsane", "icon": "👑", "description": "Efsane ligine ulaş"},
    "speed_demon": {"name": "Hız Şeytanı", "icon": "⚡", "description": "3 saniyede doğru cevap ver"},
    "perfect_game": {"name": "Mükemmel Oyun", "icon": "✨", "description": "Hiç hata yapmadan kazan"},
    "combo_master": {"name": "Kombo Ustası", "icon": "🔥", "description": "10x kombo yap"},
}

# Oyun Modları
GAME_MODES = {
    "career_path": {
        "name": "Kariyer Yolu",
        "icon": "🛤️",
        "description": "Kulüplere bakarak futbolcuyu tahmin et",
        "elo_gain": 25,
        "elo_loss": 15
    },
    "letter_hunt": {
        "name": "Harf Avı",
        "icon": "🔤",
        "description": "Harflerden futbolcu adını bul",
        "elo_gain": 20,
        "elo_loss": 12
    },
    "team_connection": {
        "name": "Takım Bağlantısı",
        "icon": "🔗",
        "description": "İki takımda da oynayan futbolcuyu bul",
        "elo_gain": 30,
        "elo_loss": 18
    },
    "football_grid": {
        "name": "Futbol Tablosu",
        "icon": "⬜",
        "description": "Tic-tac-toe futbol versiyonu",
        "elo_gain": 25,
        "elo_loss": 15
    },
    "hidden_player": {
        "name": "Gizli Oyuncu",
        "icon": "🕵️",
        "description": "Silüetten futbolcuyu tahmin et",
        "elo_gain": 25,
        "elo_loss": 15
    },
    "value_guess": {
        "name": "Değer Tahmini",
        "icon": "💰",
        "description": "Futbolcunun piyasa değerini tahmin et",
        "elo_gain": 20,
        "elo_loss": 12
    }
}

def get_league_for_elo(elo: int) -> dict:
    """ELO puanına göre lig bilgisini döndür"""
    for league_id, league in LEAGUES.items():
        if league["min_elo"] <= elo <= league["max_elo"]:
            return {"id": league_id, **league}
    return {"id": "bronze", **LEAGUES["bronze"]}

def calculate_elo_change(winner_elo: int, loser_elo: int, k_factor: int = 32) -> tuple:
    """ELO değişimini hesapla"""
    expected_winner = 1 / (1 + 10 ** ((loser_elo - winner_elo) / 400))
    expected_loser = 1 - expected_winner
    
    winner_change = round(k_factor * (1 - expected_winner))
    loser_change = round(k_factor * (0 - expected_loser))
    
    return winner_change, loser_change

def get_streak_bonus(streak: int) -> dict:
    """Seri bonusunu al"""
    bonus = None
    for streak_count, streak_bonus in sorted(STREAK_BONUSES.items(), reverse=True):
        if streak >= streak_count:
            bonus = {"streak_count": streak_count, **streak_bonus}
            break
    return bonus

def calculate_game_rewards(
    won: bool,
    elo: int,
    streak: int,
    time_bonus: float = 1.0,
    perfect_game: bool = False
) -> dict:
    """Oyun sonrası ödülleri hesapla"""
    league = get_league_for_elo(elo)
    base_rewards = league["rewards"]
    
    if won:
        coins = base_rewards["coins_per_win"]
        xp = base_rewards["xp_per_win"]
        
        # Seri bonusu
        streak_bonus = get_streak_bonus(streak)
        if streak_bonus:
            coins += streak_bonus["bonus_coins"]
            xp += streak_bonus["bonus_xp"]
            coins = int(coins * streak_bonus["multiplier"])
            xp = int(xp * streak_bonus["multiplier"])
        
        # Zaman bonusu
        coins = int(coins * time_bonus)
        xp = int(xp * time_bonus)
        
        # Mükemmel oyun bonusu
        if perfect_game:
            coins = int(coins * 1.5)
            xp = int(xp * 1.5)
        
        return {
            "coins": coins,
            "xp": xp,
            "streak_bonus": streak_bonus,
            "league": league
        }
    else:
        return {
            "coins": 5,  # Kaybetse bile az coin
            "xp": 10,
            "streak_bonus": None,
            "league": league
        }
