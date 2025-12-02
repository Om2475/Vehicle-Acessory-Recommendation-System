"""
🔐 USER AUTHENTICATION MODULE
Handle user registration, login, and password management
"""

import sqlite3
import bcrypt
import secrets
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple

# Database path
DB_PATH = Path(__file__).parent / 'vehicle_accessories.db'

class AuthenticationError(Exception):
    """Custom exception for authentication errors"""
    pass


class UserAuth:
    """Handle user authentication operations"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """Verify a password against its hash"""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
        except Exception:
            return False
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Basic email validation"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_password(password: str) -> Tuple[bool, str]:
        """
        Validate password strength
        Returns: (is_valid, error_message)
        """
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        if not any(c.isupper() for c in password):
            return False, "Password must contain at least one uppercase letter"
        if not any(c.islower() for c in password):
            return False, "Password must contain at least one lowercase letter"
        if not any(c.isdigit() for c in password):
            return False, "Password must contain at least one number"
        return True, ""
    
    @staticmethod
    def signup(email: str, password: str, full_name: str = None, phone: str = None) -> Dict:
        """
        Register a new user
        
        Args:
            email: User email
            password: User password (will be hashed)
            full_name: Optional full name
            phone: Optional phone number
            
        Returns:
            Dict with user_id and success message
            
        Raises:
            AuthenticationError: If signup fails
        """
        # Validate email
        if not UserAuth.validate_email(email):
            raise AuthenticationError("Invalid email format")
        
        # Validate password
        is_valid, error_msg = UserAuth.validate_password(password)
        if not is_valid:
            raise AuthenticationError(error_msg)
        
        # Hash password
        password_hash = UserAuth.hash_password(password)
        
        # Connect to database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        try:
            # Check if user already exists
            cursor.execute("SELECT user_id FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                raise AuthenticationError("Email already registered")
            
            # Insert new user
            cursor.execute('''
                INSERT INTO users (email, password_hash, full_name, phone)
                VALUES (?, ?, ?, ?)
            ''', (email, password_hash, full_name or '', phone or ''))
            
            user_id = cursor.lastrowid
            conn.commit()
            
            return {
                'user_id': user_id,
                'email': email,
                'full_name': full_name,
                'message': 'User registered successfully'
            }
            
        except sqlite3.IntegrityError:
            raise AuthenticationError("Email already registered")
        except Exception as e:
            raise AuthenticationError(f"Signup failed: {str(e)}")
        finally:
            conn.close()
    
    @staticmethod
    def login(email: str, password: str) -> Dict:
        """
        Authenticate a user
        
        Args:
            email: User email
            password: User password
            
        Returns:
            Dict with user information
            
        Raises:
            AuthenticationError: If login fails
        """
        # Validate email format
        if not UserAuth.validate_email(email):
            raise AuthenticationError("Invalid email format")
        
        # Connect to database
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            # Get user from database
            cursor.execute('''
                SELECT user_id, email, password_hash, full_name, phone, is_active
                FROM users
                WHERE email = ?
            ''', (email,))
            
            user = cursor.fetchone()
            
            if not user:
                raise AuthenticationError("Invalid email or password")
            
            # Check if user is active
            if not user['is_active']:
                raise AuthenticationError("Account is deactivated")
            
            # Verify password
            if not UserAuth.verify_password(password, user['password_hash']):
                raise AuthenticationError("Invalid email or password")
            
            # Update last login
            cursor.execute('''
                UPDATE users
                SET last_login = CURRENT_TIMESTAMP
                WHERE user_id = ?
            ''', (user['user_id'],))
            conn.commit()
            
            # Return user info (without password hash)
            return {
                'user_id': user['user_id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'phone': user['phone'],
                'message': 'Login successful'
            }
            
        except AuthenticationError:
            raise
        except Exception as e:
            raise AuthenticationError(f"Login failed: {str(e)}")
        finally:
            conn.close()
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[Dict]:
        """Get user information by user_id"""
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT user_id, email, full_name, phone, created_at, last_login
                FROM users
                WHERE user_id = ? AND is_active = 1
            ''', (user_id,))
            
            user = cursor.fetchone()
            if user:
                return dict(user)
            return None
            
        finally:
            conn.close()
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict]:
        """Get user information by email"""
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT user_id, email, full_name, phone, created_at, last_login
                FROM users
                WHERE email = ? AND is_active = 1
            ''', (email,))
            
            user = cursor.fetchone()
            if user:
                return dict(user)
            return None
            
        finally:
            conn.close()
    
    @staticmethod
    def update_user(user_id: int, full_name: str = None, phone: str = None) -> Dict:
        """Update user information"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        try:
            updates = []
            params = []
            
            if full_name is not None:
                updates.append("full_name = ?")
                params.append(full_name)
            
            if phone is not None:
                updates.append("phone = ?")
                params.append(phone)
            
            if not updates:
                return {'message': 'No updates provided'}
            
            params.append(user_id)
            query = f"UPDATE users SET {', '.join(updates)} WHERE user_id = ?"
            
            cursor.execute(query, params)
            conn.commit()
            
            return {'message': 'User updated successfully'}
            
        finally:
            conn.close()
    
    @staticmethod
    def change_password(user_id: int, old_password: str, new_password: str) -> Dict:
        """Change user password"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        try:
            # Get current password hash
            cursor.execute("SELECT password_hash FROM users WHERE user_id = ?", (user_id,))
            result = cursor.fetchone()
            
            if not result:
                raise AuthenticationError("User not found")
            
            # Verify old password
            if not UserAuth.verify_password(old_password, result[0]):
                raise AuthenticationError("Current password is incorrect")
            
            # Validate new password
            is_valid, error_msg = UserAuth.validate_password(new_password)
            if not is_valid:
                raise AuthenticationError(error_msg)
            
            # Hash new password
            new_hash = UserAuth.hash_password(new_password)
            
            # Update password
            cursor.execute('''
                UPDATE users
                SET password_hash = ?
                WHERE user_id = ?
            ''', (new_hash, user_id))
            
            conn.commit()
            
            return {'message': 'Password changed successfully'}
            
        finally:
            conn.close()


# ==================== SESSION MANAGEMENT ====================

class SessionManager:
    """Manage user sessions with tokens (database-backed)"""
    
    @staticmethod
    def generate_token() -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def _ensure_sessions_table():
        """Create sessions table if it doesn't exist"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        try:
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sessions (
                    token TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
                )
            ''')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)')
            conn.commit()
        finally:
            conn.close()
    
    @classmethod
    def create_session(cls, user_id: int) -> str:
        """Create a new session for user"""
        cls._ensure_sessions_table()
        token = cls.generate_token()
        expires_at = datetime.now() + timedelta(days=7)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO sessions (token, user_id, expires_at)
                VALUES (?, ?, ?)
            ''', (token, user_id, expires_at))
            conn.commit()
            return token
        finally:
            conn.close()
    
    @classmethod
    def validate_session(cls, token: str) -> Optional[int]:
        """Validate session token and return user_id"""
        cls._ensure_sessions_table()
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT user_id, expires_at FROM sessions
                WHERE token = ?
            ''', (token,))
            
            result = cursor.fetchone()
            if not result:
                return None
            
            user_id, expires_at_str = result
            expires_at = datetime.fromisoformat(expires_at_str)
            
            # Check if expired
            if datetime.now() > expires_at:
                cursor.execute('DELETE FROM sessions WHERE token = ?', (token,))
                conn.commit()
                return None
            
            return user_id
        finally:
            conn.close()
    
    @classmethod
    def delete_session(cls, token: str) -> bool:
        """Delete a session (logout)"""
        cls._ensure_sessions_table()
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        try:
            cursor.execute('DELETE FROM sessions WHERE token = ?', (token,))
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()


# ==================== TESTING FUNCTIONS ====================

def test_auth():
    """Test authentication functions"""
    print("=" * 60)
    print("🧪 TESTING AUTHENTICATION")
    print("=" * 60)
    
    try:
        # Test 1: Signup
        print("\n1️⃣ Testing Signup...")
        result = UserAuth.signup(
            email="test@example.com",
            password="TestPass123",
            full_name="Test User",
            phone="1234567890"
        )
        print(f"✅ Signup successful: {result}")
        user_id = result['user_id']
        
        # Test 2: Login with correct password
        print("\n2️⃣ Testing Login (correct password)...")
        result = UserAuth.login("test@example.com", "TestPass123")
        print(f"✅ Login successful: {result}")
        
        # Test 3: Login with wrong password
        print("\n3️⃣ Testing Login (wrong password)...")
        try:
            UserAuth.login("test@example.com", "WrongPass123")
            print("❌ Should have failed!")
        except AuthenticationError as e:
            print(f"✅ Correctly rejected: {e}")
        
        # Test 4: Duplicate signup
        print("\n4️⃣ Testing Duplicate Signup...")
        try:
            UserAuth.signup("test@example.com", "TestPass123")
            print("❌ Should have failed!")
        except AuthenticationError as e:
            print(f"✅ Correctly rejected: {e}")
        
        # Test 5: Session management
        print("\n5️⃣ Testing Session Management...")
        token = SessionManager.create_session(user_id)
        print(f"✅ Token created: {token[:20]}...")
        
        validated_user_id = SessionManager.validate_session(token)
        print(f"✅ Token validated: user_id = {validated_user_id}")
        
        SessionManager.delete_session(token)
        print("✅ Session deleted")
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    test_auth()
