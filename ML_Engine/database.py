"""
🗄️ DATABASE SCHEMA & SETUP
SQLite database for Vehicle Accessories Recommendation System
"""

import sqlite3
import pandas as pd
from pathlib import Path
import sys

# Database file path
DB_PATH = Path(__file__).parent / 'vehicle_accessories.db'

def create_database():
    """Create all database tables with proper schema"""
    print("🔄 Creating database schema...")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON")
    
    # ==================== TABLE 1: ACCESSORIES ====================
    # Main product catalog with ML features
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS accessories (
            accessory_id TEXT PRIMARY KEY,
            car_brand TEXT NOT NULL,
            car_model TEXT NOT NULL,
            accessory_name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            compatible_cars TEXT,
            reviews TEXT,
            category TEXT,
            
            -- Sentiment Analysis Fields
            sentiment_score REAL,
            sentiment_label TEXT,
            sentiment_vader REAL,
            sentiment_polarity REAL,
            sentiment_subjectivity REAL,
            sentiment_strength REAL,
            
            -- Quality Scores
            quality_score REAL,
            overall_quality_score REAL,
            
            -- Aspect Scores (normalized)
            aspect_quality_score REAL,
            aspect_quality_mentions INTEGER,
            aspect_durability_score REAL,
            aspect_durability_mentions INTEGER,
            aspect_installation_score REAL,
            aspect_installation_mentions INTEGER,
            aspect_design_score REAL,
            aspect_design_mentions INTEGER,
            aspect_compatibility_score REAL,
            aspect_compatibility_mentions INTEGER,
            aspect_value_score REAL,
            aspect_value_mentions INTEGER,
            aspect_comfort_score REAL,
            aspect_comfort_mentions INTEGER,
            aspect_performance_score REAL,
            aspect_performance_mentions INTEGER,
            
            -- Emotions
            dominant_emotion TEXT,
            emotion_happy REAL,
            emotion_satisfied REAL,
            emotion_disappointed REAL,
            emotion_angry REAL,
            emotion_neutral REAL,
            
            -- Additional Fields
            key_phrases TEXT,
            key_strengths TEXT,
            key_weaknesses TEXT,
            recommendation_explanation TEXT,
            
            -- Normalized fields for search
            brand_normalized TEXT,
            
            -- Metadata
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Indexes for fast queries
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_car_brand ON accessories(car_brand)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_car_model ON accessories(car_model)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_price ON accessories(price)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_sentiment ON accessories(sentiment_score)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_quality ON accessories(quality_score)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_category ON accessories(category)')
    
    print("✅ Created 'accessories' table with indexes")
    
    # ==================== TABLE 2: USERS ====================
    # User accounts for authentication
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            is_active INTEGER DEFAULT 1
        )
    ''')
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_email ON users(email)')
    print("✅ Created 'users' table")
    
    # ==================== TABLE 3: CART_ITEMS ====================
    # Shopping cart items (per user)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cart_items (
            cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            accessory_id TEXT NOT NULL,
            quantity INTEGER DEFAULT 1,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (accessory_id) REFERENCES accessories(accessory_id) ON DELETE CASCADE,
            UNIQUE(user_id, accessory_id)
        )
    ''')
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id)')
    print("✅ Created 'cart_items' table")
    
    # ==================== TABLE 4: WISHLIST ====================
    # Wishlist items (per user)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wishlist (
            wishlist_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            accessory_id TEXT NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (accessory_id) REFERENCES accessories(accessory_id) ON DELETE CASCADE,
            UNIQUE(user_id, accessory_id)
        )
    ''')
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id)')
    print("✅ Created 'wishlist' table")
    
    # ==================== TABLE 5: ORDERS ====================
    # Customer orders
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            delivery_charge REAL DEFAULT 0,
            
            -- Delivery Information
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            pincode TEXT NOT NULL,
            
            -- Payment Information
            payment_method TEXT NOT NULL,
            payment_status TEXT DEFAULT 'pending',
            
            -- Order Status
            order_status TEXT DEFAULT 'pending',
            
            -- Timestamps
            order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
    ''')
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_order_user ON orders(user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_order_number ON orders(order_number)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_order_date ON orders(order_date)')
    print("✅ Created 'orders' table")
    
    # ==================== TABLE 6: ORDER_ITEMS ====================
    # Items in each order
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            accessory_id TEXT NOT NULL,
            accessory_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
            FOREIGN KEY (accessory_id) REFERENCES accessories(accessory_id)
        )
    ''')
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)')
    print("✅ Created 'order_items' table")
    
    # ==================== TABLE 7: USER_PROFILES (Optional) ====================
    # Store user preferences for personalization
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_profiles (
            profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            default_car_brand TEXT,
            default_car_model TEXT,
            default_budget_min REAL,
            default_budget_max REAL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
    ''')
    
    print("✅ Created 'user_profiles' table")
    
    conn.commit()
    conn.close()
    
    print("\n✅ Database schema created successfully!")
    print(f"📁 Database location: {DB_PATH}")
    print("\n📊 Tables created:")
    print("   1. accessories - Product catalog (1,269 items)")
    print("   2. users - User accounts")
    print("   3. cart_items - Shopping cart")
    print("   4. wishlist - Saved items")
    print("   5. orders - Order tracking")
    print("   6. order_items - Order details")
    print("   7. user_profiles - User preferences")


def load_accessories_from_csv():
    """Load accessories data from CSV into database"""
    print("\n🔄 Loading accessories from CSV...")
    
    # Path to CSV file
    csv_path = Path(__file__).parent.parent / 'Dataset' / 'processed' / 'accessories_with_advanced_sentiment.csv'
    
    if not csv_path.exists():
        print(f"❌ CSV file not found: {csv_path}")
        return False
    
    # Read CSV
    df = pd.read_csv(csv_path)
    print(f"📄 Loaded {len(df)} accessories from CSV")
    
    # Clean column names - remove spaces and special characters
    df.columns = df.columns.str.strip()
    
    # Map CSV columns to database columns
    column_mapping = {
        'Accessory_ID': 'accessory_id',
        'Car Brand': 'car_brand',
        'Car Model': 'car_model',
        'Accessory Name': 'accessory_name',
        'Accessory Price': 'price',
        'Accessory Description': 'description',
        'Compatible Cars': 'compatible_cars',
        'Top 5 Reviews': 'reviews',
        'Category': 'category',
        'Sentiment_Score': 'sentiment_score',
        'Sentiment_Label': 'sentiment_label',
        'Sentiment_VADER': 'sentiment_vader',
        'Sentiment_Polarity': 'sentiment_polarity',
        'Sentiment_Subjectivity': 'sentiment_subjectivity',
        'Sentiment_Strength': 'sentiment_strength',
        'Overall_Quality_Score': 'overall_quality_score',
        'Aspect_Quality_Score': 'aspect_quality_score',
        'Aspect_Quality_Mentions': 'aspect_quality_mentions',
        'Aspect_Durability_Score': 'aspect_durability_score',
        'Aspect_Durability_Mentions': 'aspect_durability_mentions',
        'Aspect_Installation_Score': 'aspect_installation_score',
        'Aspect_Installation_Mentions': 'aspect_installation_mentions',
        'Aspect_Design_Score': 'aspect_design_score',
        'Aspect_Design_Mentions': 'aspect_design_mentions',
        'Aspect_Compatibility_Score': 'aspect_compatibility_score',
        'Aspect_Compatibility_Mentions': 'aspect_compatibility_mentions',
        'Aspect_Value_Score': 'aspect_value_score',
        'Aspect_Value_Mentions': 'aspect_value_mentions',
        'Aspect_Comfort_Score': 'aspect_comfort_score',
        'Aspect_Comfort_Mentions': 'aspect_comfort_mentions',
        'Aspect_Performance_Score': 'aspect_performance_score',
        'Aspect_Performance_Mentions': 'aspect_performance_mentions',
        'Dominant_Emotion': 'dominant_emotion',
        'Emotion_Happy_Score': 'emotion_happy',
        'Emotion_Satisfied_Score': 'emotion_satisfied',
        'Emotion_Disappointed_Score': 'emotion_disappointed',
        'Emotion_Angry_Score': 'emotion_angry',
        'Emotion_Neutral_Score': 'emotion_neutral',
        'Key_Phrases': 'key_phrases',
        'Key_Strengths': 'key_strengths',
        'Key_Weaknesses': 'key_weaknesses',
        'Recommendation_Explanation': 'recommendation_explanation',
        'Brand_Normalized': 'brand_normalized'
    }
    
    # Rename columns
    df = df.rename(columns=column_mapping)
    
    # Select only columns that exist in both CSV and database
    db_columns = list(column_mapping.values())
    existing_columns = [col for col in db_columns if col in df.columns]
    df_clean = df[existing_columns]
    
    # Fill NaN values
    df_clean = df_clean.fillna('')
    
    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    
    try:
        # Insert data (replace if exists)
        df_clean.to_sql('accessories', conn, if_exists='replace', index=False)
        print(f"✅ Loaded {len(df_clean)} accessories into database")
        
        # Verify
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM accessories")
        count = cursor.fetchone()[0]
        print(f"✅ Verified: {count} accessories in database")
        
        return True
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return False
    finally:
        conn.close()


def verify_database():
    """Verify database structure and content"""
    print("\n🔍 Verifying database...")
    
    if not DB_PATH.exists():
        print(f"❌ Database not found: {DB_PATH}")
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    print(f"✅ Found {len(tables)} tables:")
    
    for table in tables:
        table_name = table[0]
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"   • {table_name}: {count} records")
    
    conn.close()
    return True


def main():
    """Main setup function"""
    print("=" * 60)
    print("🚀 VEHICLE ACCESSORIES DATABASE SETUP")
    print("=" * 60)
    
    # Step 1: Create database schema
    create_database()
    
    # Step 2: Load accessories data
    success = load_accessories_from_csv()
    
    if not success:
        print("\n⚠️  Database created but accessories data not loaded")
        print("   You can load data later using load_accessories_from_csv()")
    
    # Step 3: Verify
    verify_database()
    
    print("\n" + "=" * 60)
    print("✅ DATABASE SETUP COMPLETE!")
    print("=" * 60)
    print(f"\n📁 Database file: {DB_PATH}")
    print("🔐 Ready for user authentication, cart, wishlist, and orders!")
    print("\n🎯 Next steps:")
    print("   1. Run auth.py to test authentication")
    print("   2. Update api.py to use database")
    print("   3. Update frontend to connect to new APIs")


if __name__ == '__main__':
    main()
