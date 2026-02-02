#!/usr/bin/env python3
"""
Extended Backend API Testing for Football Challenge App
Tests additional endpoints: Friends System, Players Database, User Management
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://football-quiz-37.preview.emergentagent.com/api"

class ExtendedAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        print()
    
    def setup_authenticated_user(self):
        """Create and authenticate a test user"""
        print("🔧 Setting up authenticated user...")
        
        # Register a test user
        test_data = {
            "email": "apitest@example.com",
            "password": "Test123!",
            "name": "API Test User",
            "username": "apitest456",
            "age": 30,
            "gender": "female",
            "language": "en"
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/register",
                json=test_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.user_id = data["user_id"]
                self.session_token = data["session_token"]
                print(f"✅ Test user created: {self.user_id}")
                return True
            else:
                print(f"❌ Failed to create test user: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Exception creating test user: {str(e)}")
            return False
    
    def test_players_database(self):
        """Test Players Database API"""
        print("🔍 Testing Players Database...")
        
        try:
            # Test get all players
            response = self.session.get(f"{BACKEND_URL}/players")
            
            if response.status_code == 200:
                players = response.json()
                if isinstance(players, list) and len(players) > 0:
                    self.log_test("Get All Players", True, f"Retrieved {len(players)} players")
                else:
                    self.log_test("Get All Players", False, f"No players found or invalid format: {players}")
                    return False
            else:
                self.log_test("Get All Players", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            # Test get random player
            response = self.session.get(f"{BACKEND_URL}/players/random")
            
            if response.status_code == 200:
                player = response.json()
                if "player_id" in player and "name" in player:
                    self.log_test("Get Random Player", True, f"Retrieved player: {player['name']}")
                    return True
                else:
                    self.log_test("Get Random Player", False, f"Invalid player format: {player}")
                    return False
            else:
                self.log_test("Get Random Player", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Players Database", False, f"Exception: {str(e)}")
            return False
    
    def test_user_management(self):
        """Test User Management API"""
        print("🔍 Testing User Management...")
        
        if not self.session_token:
            self.log_test("User Management", False, "No session token available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.session_token}",
            "Content-Type": "application/json"
        }
        
        try:
            # Test get profile
            response = self.session.get(f"{BACKEND_URL}/users/profile", headers=headers)
            
            if response.status_code == 200:
                profile = response.json()
                if "user_id" in profile and "email" in profile:
                    self.log_test("Get User Profile", True, f"Profile retrieved for: {profile['email']}")
                else:
                    self.log_test("Get User Profile", False, f"Invalid profile format: {profile}")
                    return False
            else:
                self.log_test("Get User Profile", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            # Test update profile
            update_data = {
                "avatar": "🏆",
                "location": "Istanbul"
            }
            
            response = self.session.put(
                f"{BACKEND_URL}/users/profile",
                json=update_data,
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                if "message" in result:
                    self.log_test("Update User Profile", True, f"Profile updated: {result['message']}")
                else:
                    self.log_test("Update User Profile", False, f"Invalid response: {result}")
                    return False
            else:
                self.log_test("Update User Profile", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            # Test language update
            response = self.session.put(
                f"{BACKEND_URL}/users/language?language=en",
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                self.log_test("Update Language", True, f"Language updated: {result}")
                return True
            else:
                self.log_test("Update Language", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Management", False, f"Exception: {str(e)}")
            return False
    
    def test_friends_system(self):
        """Test Friends System API"""
        print("🔍 Testing Friends System...")
        
        if not self.session_token:
            self.log_test("Friends System", False, "No session token available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.session_token}",
            "Content-Type": "application/json"
        }
        
        try:
            # Test get friends list (should be empty initially)
            response = self.session.get(f"{BACKEND_URL}/friends", headers=headers)
            
            if response.status_code == 200:
                friends = response.json()
                if isinstance(friends, list):
                    self.log_test("Get Friends List", True, f"Friends list retrieved: {len(friends)} friends")
                else:
                    self.log_test("Get Friends List", False, f"Invalid friends format: {friends}")
                    return False
            else:
                self.log_test("Get Friends List", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            # Test get friend requests (should be empty initially)
            response = self.session.get(f"{BACKEND_URL}/friends/requests", headers=headers)
            
            if response.status_code == 200:
                requests_list = response.json()
                if isinstance(requests_list, list):
                    self.log_test("Get Friend Requests", True, f"Friend requests retrieved: {len(requests_list)} requests")
                    return True
                else:
                    self.log_test("Get Friend Requests", False, f"Invalid requests format: {requests_list}")
                    return False
            else:
                self.log_test("Get Friend Requests", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Friends System", False, f"Exception: {str(e)}")
            return False
    
    def test_leaderboard(self):
        """Test Leaderboard API"""
        print("🔍 Testing Leaderboard...")
        
        try:
            # Test global leaderboard
            response = self.session.get(f"{BACKEND_URL}/leaderboard/global")
            
            if response.status_code == 200:
                leaderboard = response.json()
                if isinstance(leaderboard, list):
                    self.log_test("Global Leaderboard", True, f"Leaderboard retrieved: {len(leaderboard)} users")
                    return True
                else:
                    self.log_test("Global Leaderboard", False, f"Invalid leaderboard format: {leaderboard}")
                    return False
            else:
                self.log_test("Global Leaderboard", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Leaderboard", False, f"Exception: {str(e)}")
            return False
    
    def run_extended_tests(self):
        """Run all extended API tests"""
        print("=" * 60)
        print("🚀 STARTING EXTENDED BACKEND API TESTS")
        print("=" * 60)
        print(f"Backend URL: {BACKEND_URL}")
        print()
        
        # Setup
        if not self.setup_authenticated_user():
            print("❌ Failed to setup test user - aborting tests")
            return False
        
        # Test sequence
        tests_passed = 0
        total_tests = 4
        
        # 1. Test Players Database
        if self.test_players_database():
            tests_passed += 1
        
        # 2. Test User Management
        if self.test_user_management():
            tests_passed += 1
        
        # 3. Test Friends System
        if self.test_friends_system():
            tests_passed += 1
        
        # 4. Test Leaderboard
        if self.test_leaderboard():
            tests_passed += 1
        
        # Summary
        print("=" * 60)
        print("📊 EXTENDED TEST SUMMARY")
        print("=" * 60)
        print(f"Tests Passed: {tests_passed}/{total_tests}")
        print(f"Success Rate: {(tests_passed/total_tests)*100:.1f}%")
        print()
        
        # Detailed results
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}")
            if result["details"]:
                print(f"   {result['details']}")
        
        print()
        if tests_passed == total_tests:
            print("🎉 ALL EXTENDED TESTS PASSED!")
            return True
        else:
            print("⚠️  SOME TESTS FAILED - CHECK DETAILS ABOVE")
            return False

def main():
    """Main test execution"""
    tester = ExtendedAPITester()
    success = tester.run_extended_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()