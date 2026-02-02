#!/usr/bin/env python3
"""
Backend API Testing for Football Challenge App
Tests authentication flow and user management endpoints
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://football-quiz-37.preview.emergentagent.com/api"

class FootballChallengeAPITester:
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
    
    def test_register_endpoint(self):
        """Test POST /api/auth/register"""
        print("🔍 Testing Registration Endpoint...")
        
        test_data = {
            "email": "testuser@example.com",
            "password": "Test123!",
            "name": "Test User",
            "username": "testuser123",
            "age": 25,
            "gender": "male",
            "language": "tr"
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/register",
                json=test_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if "user_id" in data and "session_token" in data:
                    self.user_id = data["user_id"]
                    self.session_token = data["session_token"]
                    self.log_test("Register Endpoint", True, f"User created with ID: {self.user_id}")
                    return True
                else:
                    self.log_test("Register Endpoint", False, f"Missing required fields in response: {data}")
                    return False
            else:
                self.log_test("Register Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Register Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_login_endpoint(self):
        """Test POST /api/auth/login"""
        print("🔍 Testing Login Endpoint...")
        
        login_data = {
            "email": "testuser@example.com",
            "password": "Test123!"
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if "user_id" in data and "session_token" in data:
                    # Update session token from login
                    self.session_token = data["session_token"]
                    self.log_test("Login Endpoint", True, f"Login successful for user: {data['user_id']}")
                    return True
                else:
                    self.log_test("Login Endpoint", False, f"Missing required fields in response: {data}")
                    return False
            else:
                self.log_test("Login Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Login Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_get_current_user(self):
        """Test GET /api/auth/me"""
        print("🔍 Testing Get Current User Endpoint...")
        
        if not self.session_token:
            self.log_test("Get Current User", False, "No session token available")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.session_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{BACKEND_URL}/auth/me",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                if "user_id" in data and "profile_completed" in data:
                    profile_status = data.get("profile_completed", False)
                    self.log_test("Get Current User", True, f"User data retrieved, profile_completed: {profile_status}")
                    return True
                else:
                    self.log_test("Get Current User", False, f"Missing required fields in response: {data}")
                    return False
            else:
                self.log_test("Get Current User", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Current User", False, f"Exception: {str(e)}")
            return False
    
    def test_complete_profile_endpoint(self):
        """Test POST /api/auth/complete-profile - CRITICAL TEST"""
        print("🔍 Testing Complete Profile Endpoint (CRITICAL)...")
        
        if not self.session_token:
            self.log_test("Complete Profile Endpoint", False, "No session token available")
            return False
        
        profile_data = {
            "username": "newusername123",
            "age": 28,
            "gender": "male",
            "avatar": "⚽"
        }
        
        try:
            headers = {
                "Authorization": f"Bearer {self.session_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/auth/complete-profile",
                json=profile_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data["success"]:
                    self.log_test("Complete Profile Endpoint", True, f"Profile completed successfully: {data}")
                    return True
                else:
                    self.log_test("Complete Profile Endpoint", False, f"Success field missing or false: {data}")
                    return False
            else:
                self.log_test("Complete Profile Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Complete Profile Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_authentication_flow(self):
        """Test complete authentication flow"""
        print("=" * 60)
        print("🚀 STARTING FOOTBALL CHALLENGE AUTHENTICATION TESTS")
        print("=" * 60)
        print(f"Backend URL: {BACKEND_URL}")
        print()
        
        # Test sequence
        tests_passed = 0
        total_tests = 4
        
        # 1. Test Registration
        if self.test_register_endpoint():
            tests_passed += 1
        
        # 2. Test Login
        if self.test_login_endpoint():
            tests_passed += 1
        
        # 3. Test Get Current User
        if self.test_get_current_user():
            tests_passed += 1
        
        # 4. Test Complete Profile (CRITICAL)
        if self.test_complete_profile_endpoint():
            tests_passed += 1
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
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
            print("🎉 ALL AUTHENTICATION TESTS PASSED!")
            return True
        else:
            print("⚠️  SOME TESTS FAILED - CHECK DETAILS ABOVE")
            return False

def main():
    """Main test execution"""
    tester = FootballChallengeAPITester()
    success = tester.test_authentication_flow()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()