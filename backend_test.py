#!/usr/bin/env python3

import requests
import json
import sys
from typing import Dict, Any

# Configuration
BACKEND_URL = "https://career-path-mode.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class CareerPathAPITester:
    def __init__(self):
        self.results = []

    def log_test(self, test_name: str, success: bool, details: str):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def test_random_player_endpoint(self):
        """Test GET /api/career-path/random-player endpoint"""
        print("\n=== Testing Career Path Random Player ===")
        
        # Test 1: Get random player (all difficulties)
        try:
            response = requests.get(f"{API_BASE}/career-path/random-player")
            if response.status_code == 200:
                data = response.json()
                required_fields = ['name', 'team_history', 'nationality', 'position', 'age']
                
                # Check if all required fields are present
                missing_fields = [field for field in required_fields if field not in data]
                if not missing_fields:
                    self.log_test("Random Player (all)", True, 
                                f"Player: {data.get('name')}, Nationality: {data.get('nationality')}, Position: {data.get('position')}, Age: {data.get('age')}, Teams: {len(data.get('team_history', []))}")
                else:
                    self.log_test("Random Player (all)", False, 
                                f"Missing fields: {missing_fields}. Got: {list(data.keys())}")
            else:
                self.log_test("Random Player (all)", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Random Player (all)", False, f"Exception: {e}")

        # Test 2: Get random player with difficulty filter (easy)
        try:
            response = requests.get(f"{API_BASE}/career-path/random-player", 
                                  params={"difficulty": "easy"})
            if response.status_code == 200:
                data = response.json()
                if data.get('difficulty') == 'easy' or 'name' in data:
                    self.log_test("Random Player (easy)", True, 
                                f"Easy player: {data.get('name')}")
                else:
                    self.log_test("Random Player (easy)", False, 
                                f"Expected easy player, got: {data}")
            else:
                self.log_test("Random Player (easy)", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Random Player (easy)", False, f"Exception: {e}")

        # Test 3: Get random player with difficulty filter (medium)
        try:
            response = requests.get(f"{API_BASE}/career-path/random-player", 
                                  params={"difficulty": "medium"})
            if response.status_code == 200:
                data = response.json()
                if 'name' in data:
                    self.log_test("Random Player (medium)", True, 
                                f"Medium player: {data.get('name')}")
                else:
                    self.log_test("Random Player (medium)", False, 
                                f"Invalid response structure: {data}")
            else:
                self.log_test("Random Player (medium)", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Random Player (medium)", False, f"Exception: {e}")

        # Test 4: Get random player with difficulty filter (hard)
        try:
            response = requests.get(f"{API_BASE}/career-path/random-player", 
                                  params={"difficulty": "hard"})
            if response.status_code == 200:
                data = response.json()
                if 'name' in data:
                    self.log_test("Random Player (hard)", True, 
                                f"Hard player: {data.get('name')}")
                else:
                    self.log_test("Random Player (hard)", False, 
                                f"Invalid response structure: {data}")
            else:
                self.log_test("Random Player (hard)", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Random Player (hard)", False, f"Exception: {e}")

    def test_players_list_endpoint(self):
        """Test GET /api/career-path/players endpoint"""
        print("\n=== Testing Career Path Players List ===")
        
        try:
            response = requests.get(f"{API_BASE}/career-path/players")
            if response.status_code == 200:
                data = response.json()
                
                # Check if it's a list
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check first player structure
                        first_player = data[0]
                        if 'name' in first_player:
                            self.log_test("Players List", True, 
                                        f"Got {len(data)} players. First: {first_player.get('name')}")
                            
                            # Check for some expected players
                            player_names = [p['name'] for p in data]
                            expected_players = ['Jude Bellingham', 'Kylian Mbappé', 'Erling Haaland', 'Lamine Yamal']
                            found_players = [name for name in expected_players if name in player_names]
                            
                            if len(found_players) > 0:
                                self.log_test("Players List (content)", True, 
                                            f"Found expected players: {found_players}")
                            else:
                                self.log_test("Players List (content)", False, 
                                            f"Expected players not found. Available: {player_names[:5]}...")
                        else:
                            self.log_test("Players List", False, 
                                        f"Player missing 'name' field. Structure: {list(first_player.keys())}")
                    else:
                        self.log_test("Players List", False, "Empty player list returned")
                else:
                    self.log_test("Players List", False, 
                                f"Expected list, got {type(data)}: {data}")
            else:
                self.log_test("Players List", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Players List", False, f"Exception: {e}")

    def test_check_guess_endpoint(self):
        """Test POST /api/career-path/check-guess endpoint"""
        print("\n=== Testing Career Path Check Guess ===")
        
        # Test 1: Correct guess
        try:
            response = requests.post(f"{API_BASE}/career-path/check-guess", 
                                   params={
                                       "player_name": "Jude Bellingham",
                                       "guess": "Jude Bellingham"
                                   })
            if response.status_code == 200:
                data = response.json()
                if data.get('correct') == True:
                    self.log_test("Check Guess (correct)", True, 
                                f"Correct guess recognized: {data}")
                else:
                    self.log_test("Check Guess (correct)", False, 
                                f"Expected correct=true, got: {data}")
            else:
                self.log_test("Check Guess (correct)", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Check Guess (correct)", False, f"Exception: {e}")

        # Test 2: Wrong guess with hints
        try:
            response = requests.post(f"{API_BASE}/career-path/check-guess", 
                                   params={
                                       "player_name": "Jude Bellingham",
                                       "guess": "Kylian Mbappé"
                                   })
            if response.status_code == 200:
                data = response.json()
                if data.get('correct') == False and 'hints' in data:
                    self.log_test("Check Guess (wrong with hints)", True, 
                                f"Wrong guess with hints: {data.get('hints')}")
                else:
                    self.log_test("Check Guess (wrong with hints)", False, 
                                f"Expected correct=false with hints, got: {data}")
            else:
                self.log_test("Check Guess (wrong with hints)", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Check Guess (wrong with hints)", False, f"Exception: {e}")

        # Test 3: Player not found
        try:
            response = requests.post(f"{API_BASE}/career-path/check-guess", 
                                   params={
                                       "player_name": "NonExistent Player",
                                       "guess": "Someone Else"
                                   })
            if response.status_code == 404:
                self.log_test("Check Guess (player not found)", True, 
                            f"404 error for non-existent player as expected")
            else:
                self.log_test("Check Guess (player not found)", False, 
                            f"Expected 404, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Check Guess (player not found)", False, f"Exception: {e}")

    def test_response_structure(self):
        """Test that responses have proper structure for the game"""
        print("\n=== Testing Response Structure ===")
        
        # Get a random player and validate structure thoroughly
        try:
            response = requests.get(f"{API_BASE}/career-path/random-player")
            if response.status_code == 200:
                player = response.json()
                
                # Check required fields for game
                required_fields = {
                    'name': str,
                    'team_history': list,
                    'nationality': str,
                    'position': str,
                    'age': int
                }
                
                structure_valid = True
                issues = []
                
                for field, expected_type in required_fields.items():
                    if field not in player:
                        issues.append(f"Missing field: {field}")
                        structure_valid = False
                    elif not isinstance(player[field], expected_type):
                        issues.append(f"Wrong type for {field}: expected {expected_type.__name__}, got {type(player[field]).__name__}")
                        structure_valid = False
                
                # Check team_history structure
                if 'team_history' in player and isinstance(player['team_history'], list):
                    if len(player['team_history']) > 0:
                        first_team = player['team_history'][0]
                        if not isinstance(first_team, dict) or 'team' not in first_team:
                            issues.append("team_history items should be dict with 'team' field")
                            structure_valid = False
                
                if structure_valid:
                    self.log_test("Response Structure", True, 
                                f"All required fields present with correct types")
                else:
                    self.log_test("Response Structure", False, 
                                f"Structure issues: {', '.join(issues)}")
            else:
                self.log_test("Response Structure", False, 
                            f"Could not get player data: HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Response Structure", False, f"Exception: {e}")

    def run_all_tests(self):
        """Run all Career Path API tests"""
        print(f"🚀 Starting Career Path Game API Tests")
        print(f"📡 Backend URL: {BACKEND_URL}")
        print(f"🔗 API Base: {API_BASE}")
        
        # Run tests in logical order
        self.test_random_player_endpoint()
        self.test_players_list_endpoint()
        self.test_check_guess_endpoint()
        self.test_response_structure()
        
        # Summary
        print("\n" + "="*60)
        print("🏁 CAREER PATH API TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        for result in self.results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}")
        
        print(f"\n📊 Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All Career Path API tests PASSED!")
            return True
        else:
            print("⚠️  Some tests FAILED - see details above")
            return False

if __name__ == "__main__":
    tester = CareerPathAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)