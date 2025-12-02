"""
📊 DATABASE VIEWER - View all tables in SQLite database
For Faculty Presentation
"""

import sqlite3
import pandas as pd
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent / 'vehicle_accessories.db'

def print_header(title):
    """Print formatted header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def view_all_tables():
    """Display all tables and their record counts"""
    print_header("🗄️ DATABASE OVERVIEW")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    
    print(f"\n📁 Database: {DB_PATH}")
    print(f"📊 Total Tables: {len(tables)}\n")
    
    table_info = []
    for table in tables:
        table_name = table[0]
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        table_info.append((table_name, count))
    
    # Display as formatted table
    print(f"{'TABLE NAME':<30} {'RECORDS':>15}")
    print("-" * 50)
    for name, count in table_info:
        print(f"{name:<30} {count:>15,}")
    
    conn.close()
    return table_info

def view_table(table_name, limit=10):
    """View specific table with formatted output"""
    print_header(f"📋 TABLE: {table_name.upper()}")
    
    conn = sqlite3.connect(DB_PATH)
    
    try:
        # Get total count
        cursor = conn.cursor()
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        total = cursor.fetchone()[0]
        
        # Get data
        df = pd.read_sql_query(f"SELECT * FROM {table_name} LIMIT {limit}", conn)
        
        print(f"\nTotal Records: {total:,}")
        print(f"Showing: {len(df)} records\n")
        
        if len(df) > 0:
            # Configure pandas display
            pd.set_option('display.max_columns', None)
            pd.set_option('display.width', None)
            pd.set_option('display.max_colwidth', 50)
            
            print(df.to_string(index=False))
        else:
            print("⚠️  No records found")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

def view_users():
    """View users table (hide password hash)"""
    print_header("👥 USERS TABLE")
    
    conn = sqlite3.connect(DB_PATH)
    
    try:
        query = """
        SELECT 
            user_id,
            email,
            full_name,
            phone,
            created_at,
            last_login,
            is_active
        FROM users
        ORDER BY created_at DESC
        """
        
        df = pd.read_sql_query(query, conn)
        
        print(f"\nTotal Users: {len(df):,}\n")
        
        if len(df) > 0:
            print(df.to_string(index=False))
        else:
            print("⚠️  No users registered yet")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

def view_cart_items():
    """View cart items with user and product details"""
    print_header("🛒 CART ITEMS")
    
    conn = sqlite3.connect(DB_PATH)
    
    try:
        query = """
        SELECT 
            c.cart_id,
            u.email,
            u.full_name,
            a.accessory_name,
            a.car_brand,
            a.car_model,
            a.price,
            c.quantity,
            (a.price * c.quantity) as subtotal,
            c.added_at
        FROM cart_items c
        JOIN users u ON c.user_id = u.user_id
        JOIN accessories a ON c.accessory_id = a.accessory_id
        ORDER BY c.added_at DESC
        """
        
        df = pd.read_sql_query(query, conn)
        
        print(f"\nTotal Cart Items: {len(df):,}\n")
        
        if len(df) > 0:
            print(df.to_string(index=False))
            print(f"\n💰 Total Cart Value: ₹{df['subtotal'].sum():,.2f}")
        else:
            print("⚠️  No items in cart")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

def view_wishlist():
    """View wishlist items with user and product details"""
    print_header("❤️ WISHLIST")
    
    conn = sqlite3.connect(DB_PATH)
    
    try:
        query = """
        SELECT 
            w.wishlist_id,
            u.email,
            u.full_name,
            a.accessory_name,
            a.car_brand,
            a.car_model,
            a.price,
            a.sentiment_label,
            w.added_at
        FROM wishlist w
        JOIN users u ON w.user_id = u.user_id
        JOIN accessories a ON w.accessory_id = a.accessory_id
        ORDER BY w.added_at DESC
        """
        
        df = pd.read_sql_query(query, conn)
        
        print(f"\nTotal Wishlist Items: {len(df):,}\n")
        
        if len(df) > 0:
            print(df.to_string(index=False))
        else:
            print("⚠️  No items in wishlist")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

def view_orders():
    """View orders with details"""
    print_header("📦 ORDERS")
    
    conn = sqlite3.connect(DB_PATH)
    
    try:
        query = """
        SELECT 
            o.order_id,
            o.order_number,
            u.email,
            u.full_name,
            o.total_amount,
            o.payment_method,
            o.payment_status,
            o.order_status,
            o.city,
            o.state,
            o.order_date
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        ORDER BY o.order_date DESC
        """
        
        df = pd.read_sql_query(query, conn)
        
        print(f"\nTotal Orders: {len(df):,}\n")
        
        if len(df) > 0:
            print(df.to_string(index=False))
            print(f"\n💰 Total Revenue: ₹{df['total_amount'].sum():,.2f}")
        else:
            print("⚠️  No orders placed yet")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

def view_order_items():
    """View items in orders"""
    print_header("📋 ORDER ITEMS")
    
    conn = sqlite3.connect(DB_PATH)
    
    try:
        query = """
        SELECT 
            oi.order_item_id,
            o.order_number,
            u.email,
            oi.accessory_name,
            oi.quantity,
            oi.price,
            (oi.quantity * oi.price) as subtotal
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        JOIN users u ON o.user_id = u.user_id
        ORDER BY o.order_date DESC
        LIMIT 20
        """
        
        df = pd.read_sql_query(query, conn)
        
        print(f"\nShowing Recent Order Items (Latest 20)\n")
        
        if len(df) > 0:
            print(df.to_string(index=False))
        else:
            print("⚠️  No order items found")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

def view_statistics():
    """Display database statistics"""
    print_header("📊 DATABASE STATISTICS")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Users stats
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        
        # Accessories stats
        cursor.execute("SELECT COUNT(*), AVG(price), MIN(price), MAX(price) FROM accessories")
        acc_stats = cursor.fetchone()
        
        # Cart stats
        cursor.execute("SELECT COUNT(*), COUNT(DISTINCT user_id) FROM cart_items")
        cart_stats = cursor.fetchone()
        
        # Wishlist stats
        cursor.execute("SELECT COUNT(*), COUNT(DISTINCT user_id) FROM wishlist")
        wish_stats = cursor.fetchone()
        
        # Orders stats
        cursor.execute("SELECT COUNT(*), SUM(total_amount) FROM orders")
        order_stats = cursor.fetchone()
        
        print("\n👥 USER STATISTICS:")
        print(f"   Total Registered Users: {total_users:,}")
        print(f"   Users with Cart Items: {cart_stats[1]:,}")
        print(f"   Users with Wishlist: {wish_stats[1]:,}")
        
        print("\n🛍️ PRODUCT STATISTICS:")
        print(f"   Total Accessories: {acc_stats[0]:,}")
        print(f"   Average Price: ₹{acc_stats[1]:,.2f}")
        print(f"   Price Range: ₹{acc_stats[2]:,.2f} - ₹{acc_stats[3]:,.2f}")
        
        print("\n🛒 CART STATISTICS:")
        print(f"   Total Cart Items: {cart_stats[0]:,}")
        print(f"   Active Users: {cart_stats[1]:,}")
        
        print("\n❤️ WISHLIST STATISTICS:")
        print(f"   Total Wishlist Items: {wish_stats[0]:,}")
        print(f"   Active Users: {wish_stats[1]:,}")
        
        print("\n📦 ORDER STATISTICS:")
        print(f"   Total Orders: {order_stats[0]:,}")
        print(f"   Total Revenue: ₹{order_stats[1]:,.2f}" if order_stats[1] else "   Total Revenue: ₹0.00")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

def export_to_excel():
    """Export all tables to Excel file"""
    print_header("📤 EXPORT TO EXCEL")
    
    output_file = Path(__file__).parent / f'database_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
    
    conn = sqlite3.connect(DB_PATH)
    
    try:
        # Get all table names
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = [t[0] for t in cursor.fetchall()]
        
        # Create Excel writer
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            for table in tables:
                df = pd.read_sql_query(f"SELECT * FROM {table}", conn)
                
                # Shorten table name if needed for Excel sheet name limit (31 chars)
                sheet_name = table[:31]
                df.to_excel(writer, sheet_name=sheet_name, index=False)
                print(f"✅ Exported: {table} ({len(df)} records)")
        
        print(f"\n✅ Export complete!")
        print(f"📁 File: {output_file}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

def interactive_menu():
    """Interactive menu for database viewing"""
    while True:
        print("\n" + "=" * 80)
        print("🗄️  VEHICLE ACCESSORIES DATABASE VIEWER")
        print("=" * 80)
        print("\n📊 Choose an option:")
        print("\n  1. View All Tables Overview")
        print("  2. View Users")
        print("  3. View Cart Items")
        print("  4. View Wishlist")
        print("  5. View Orders")
        print("  6. View Order Items")
        print("  7. View Accessories (sample)")
        print("  8. View Statistics")
        print("  9. Export All to Excel")
        print("  0. Exit")
        
        choice = input("\n👉 Enter choice (0-9): ").strip()
        
        if choice == '1':
            view_all_tables()
        elif choice == '2':
            view_users()
        elif choice == '3':
            view_cart_items()
        elif choice == '4':
            view_wishlist()
        elif choice == '5':
            view_orders()
        elif choice == '6':
            view_order_items()
        elif choice == '7':
            view_table('accessories', limit=20)
        elif choice == '8':
            view_statistics()
        elif choice == '9':
            export_to_excel()
        elif choice == '0':
            print("\n👋 Goodbye!")
            break
        else:
            print("\n❌ Invalid choice. Please try again.")
        
        input("\n⏸️  Press Enter to continue...")

def main():
    """Main function"""
    if not DB_PATH.exists():
        print(f"❌ Database not found: {DB_PATH}")
        print("🔧 Run 'python database.py' first to create the database")
        return
    
    # Show quick overview
    view_all_tables()
    view_statistics()
    
    # Ask if user wants interactive mode
    print("\n" + "=" * 80)
    choice = input("\n🔍 View detailed data? (y/n): ").strip().lower()
    
    if choice == 'y':
        interactive_menu()
    else:
        print("\n✅ To view detailed data later, run: python view_database.py")

if __name__ == '__main__':
    main()
