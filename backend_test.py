#!/usr/bin/env python3

import requests
import json
import sys
from typing import Dict, Any

# Configuration
BACKEND_URL = "https://career-path-mode.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class AuthAPITester:
    def __init__(self):
        self.session_token = None
        self.test_user_email = "test123@example.com"
        self.test_user_password = "password123"
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

    def test_check_username_availability(self):
        """Test username availability check endpoint"""
        print("\n=== Testing Username Availability Check ===")
        
        # Test 1: Check unused username
        try:
            response = requests.get(f"{API_BASE}/auth/check-username", 
                                  params={"username": "uniqueuser123"})
            if response.status_code == 200:
                data = response.json()
                if data.get("available") == True:
                    self.log_test("Username Check (unused)", True, 
                                f"Response: {data}")
                else:
                    self.log_test("Username Check (unused)", False, 
                                f"Expected available=true, got: {data}")
            else:
                self.log_test("Username Check (unused)", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Username Check (unused)", False, f"Exception: {e}")

        # Test 2: Check invalid username (special chars)
        try:
            response = requests.get(f"{API_BASE}/auth/check-username", 
                                  params={"username": "test_user!"})
            if response.status_code == 200:
                data = response.json()
                if data.get("available") == False and "rakam" in data.get("error", ""):
                    self.log_test("Username Check (special chars)", True, 
                                f"Turkish error message: {data}")
                else:
                    self.log_test("Username Check (special chars)", False, 
                                f"Expected Turkish error for special chars, got: {data}")
            else:
                self.log_test("Username Check (special chars)", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Username Check (special chars)", False, f"Exception: {e}")

    def test_user_registration(self):
        """Test user registration endpoint"""
        print("\n=== Testing User Registration ===")
        
        # Test 1: Valid registration
        try:
            registration_data = {
                "email": self.test_user_email,
                "password": self.test_user_password,
                "name": "John Doe",
                "username": "johndoe123",
                "age": 25,
                "gender": "male",
                "language": "tr"
            }
            response = requests.post(f"{API_BASE}/auth/register", 
                                   json=registration_data)
            if response.status_code == 200:
                data = response.json()
                if "user_id" in data and "session_token" in data:
                    self.session_token = data["session_token"]
                    self.log_test("User Registration (valid)", True, 
                                f"User created: {data['user_id']}")
                else:
                    self.log_test("User Registration (valid)", False, 
                                f"Missing user_id or session_token: {data}")
            else:
                self.log_test("User Registration (valid)", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("User Registration (valid)", False, f"Exception: {e}")

        # Test 2: Invalid username with special characters
        try:
            invalid_data = {
                "email": "test124@example.com",
                "password": "password123",
                "name": "Test",
                "username": "test_user!",
                "age": 25,
                "gender": "male",
                "language": "tr"
            }
            response = requests.post(f"{API_BASE}/auth/register", 
                                   json=invalid_data)
            if response.status_code == 400:
                error_text = response.text
                if "rakam" in error_text:
                    self.log_test("Registration (invalid username)", True, 
                                f"Turkish error for special chars: {error_text}")
                else:
                    self.log_test("Registration (invalid username)", False, 
                                f"Expected Turkish error for special chars, got: {error_text}")
            else:
                self.log_test("Registration (invalid username)", False, 
                            f"Expected 400 error, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Registration (invalid username)", False, f"Exception: {e}")

        # Test 3: Short password
        try:
            short_password_data = {
                "email": "test125@example.com",
                "password": "123",
                "name": "Test",
                "username": "testuser125",
                "age": 25,
                "gender": "male",
                "language": "tr"
            }
            response = requests.post(f"{API_BASE}/auth/register", 
                                   json=short_password_data)
            if response.status_code == 400:
                error_text = response.text
                if "6 karakter" in error_text:
                    self.log_test("Registration (short password)", True, 
                                f"Turkish error for short password: {error_text}")
                else:
                    self.log_test("Registration (short password)", False, 
                                f"Expected Turkish error for short password, got: {error_text}")
            else:
                self.log_test("Registration (short password)", False, 
                            f"Expected 400 error, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Registration (short password)", False, f"Exception: {e}")

    def test_forgot_password(self):
        """Test forgot password endpoint"""
        print("\n=== Testing Forgot Password ===")
        
        try:
            forgot_data = {"email": "test@test.com"}
            response = requests.post(f"{API_BASE}/auth/forgot-password", 
                                   json=forgot_data)
            if response.status_code == 200:
                data = response.json()
                if "gönderildi" in data.get("message", ""):
                    self.log_test("Forgot Password", True, 
                                f"Turkish success message: {data}")
                else:
                    self.log_test("Forgot Password", False, 
                                f"Expected Turkish success message, got: {data}")
            else:
                self.log_test("Forgot Password", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Forgot Password", False, f"Exception: {e}")

    def test_user_login(self):
        """Test user login endpoint"""
        print("\n=== Testing User Login ===")
        
        # Test 1: Try login with our registered user
        try:
            login_data = {
                "email": self.test_user_email,
                "password": self.test_user_password
            }
            response = requests.post(f"{API_BASE}/auth/login", 
                                   json=login_data)
            if response.status_code == 200:
                data = response.json()
                if "user_id" in data and "session_token" in data:
                    self.session_token = data["session_token"]
                    self.log_test("User Login (valid)", True, 
                                f"Login successful, got session token")
                else:
                    self.log_test("User Login (valid)", False, 
                                f"Missing user_id or session_token: {data}")
            else:
                self.log_test("User Login (valid)", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("User Login (valid)", False, f"Exception: {e}")

        # Test 2: Wrong password
        try:
            wrong_login_data = {
                "email": self.test_user_email,
                "password": "wrongpassword"
            }
            response = requests.post(f"{API_BASE}/auth/login", 
                                   json=wrong_login_data)
            if response.status_code == 401:
                self.log_test("User Login (wrong password)", True, 
                            f"401 Unauthorized as expected: {response.text}")
            else:
                self.log_test("User Login (wrong password)", False, 
                            f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("User Login (wrong password)", False, f"Exception: {e}")

    def test_get_current_user(self):
        """Test get current user endpoint"""
        print("\n=== Testing Get Current User ===")
        
        # Test 1: With valid Bearer token
        if self.session_token:
            try:
                headers = {"Authorization": f"Bearer {self.session_token}"}
                response = requests.get(f"{API_BASE}/auth/me", headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    if "user_id" in data and "email" in data:
                        self.log_test("Get Current User (with token)", True, 
                                    f"User data retrieved: {data.get('email')}")
                    else:
                        self.log_test("Get Current User (with token)", False, 
                                    f"Missing user fields: {data}")
                else:
                    self.log_test("Get Current User (with token)", False, 
                                f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test("Get Current User (with token)", False, f"Exception: {e}")
        else:
            self.log_test("Get Current User (with token)", False, 
                        "No session token available")

        # Test 2: Without token
        try:
            response = requests.get(f"{API_BASE}/auth/me")
            if response.status_code == 401:
                self.log_test("Get Current User (no token)", True, 
                            "401 Unauthorized as expected")
            else:
                self.log_test("Get Current User (no token)", False, 
                            f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Current User (no token)", False, f"Exception: {e}")

    def test_user_logout(self):
        """Test user logout endpoint"""
        print("\n=== Testing User Logout ===")
        
        if self.session_token:
            try:
                headers = {"Authorization": f"Bearer {self.session_token}"}
                response = requests.post(f"{API_BASE}/auth/logout", headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    if "Logged out" in data.get("message", ""):
                        self.log_test("User Logout", True, 
                                    f"Logout successful: {data}")
                    else:
                        self.log_test("User Logout", False, 
                                    f"Unexpected response: {data}")
                else:
                    self.log_test("User Logout", False, 
                                f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test("User Logout", False, f"Exception: {e}")
        else:
            self.log_test("User Logout", False, "No session token available")

    def test_check_used_username(self):
        """Test checking username that's already taken"""
        print("\n=== Testing Used Username Check ===")
        
        # Check the username we just registered
        try:
            response = requests.get(f"{API_BASE}/auth/check-username", 
                                  params={"username": "johndoe123"})
            if response.status_code == 200:
                data = response.json()
                if data.get("available") == False and "alınmış" in data.get("error", ""):
                    self.log_test("Username Check (used)", True, 
                                f"Turkish error for taken username: {data}")
                else:
                    self.log_test("Username Check (used)", False, 
                                f"Expected available=false with Turkish error, got: {data}")
            else:
                self.log_test("Username Check (used)", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Username Check (used)", False, f"Exception: {e}")

    def run_all_tests(self):
        """Run all authentication tests"""
        print(f"🚀 Starting Football Challenge Authentication API Tests")
        print(f"📡 Backend URL: {BACKEND_URL}")
        print(f"🔗 API Base: {API_BASE}")
        
        # Run tests in logical order
        self.test_check_username_availability()
        self.test_user_registration()
        self.test_check_used_username()
        self.test_forgot_password()
        self.test_user_login()
        self.test_get_current_user()
        self.test_user_logout()
        
        # Summary
        print("\n" + "="*60)
        print("🏁 TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        for result in self.results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}")
        
        print(f"\n📊 Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All authentication tests PASSED!")
            return True
        else:
            print("⚠️  Some tests FAILED - see details above")
            return False

if __name__ == "__main__":
    tester = AuthAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)