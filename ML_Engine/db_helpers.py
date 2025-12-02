"""
🛠️ DATABASE HELPER FUNCTIONS
CRUD operations for cart, wishlist, orders, and accessories
"""

import sqlite3
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from datetime import datetime

# Database path
DB_PATH = Path(__file__).parent / 'vehicle_accessories.db'


# ==================== HELPER FUNCTIONS ====================

def get_db_connection():
    """Get database connection with row factory"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def dict_from_row(row) -> Dict:
    """Convert sqlite3.Row to dictionary"""
    return dict(row) if row else None


# ==================== CART OPERATIONS ====================

class CartDB:
    """Database operations for shopping cart"""
    
    @staticmethod
    def get_cart_items(user_id: int) -> List[Dict]:
        """Get all cart items for a user with accessory details"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT 
                    c.cart_id,
                    c.quantity,
                    c.added_at,
                    a.*
                FROM cart_items c
                JOIN accessories a ON c.accessory_id = a.accessory_id
                WHERE c.user_id = ?
                ORDER BY c.added_at DESC
            ''', (user_id,))
            
            items = [dict(row) for row in cursor.fetchall()]
            return items
            
        finally:
            conn.close()
    
    @staticmethod
    def add_to_cart(user_id: int, accessory_id: str, quantity: int = 1) -> Dict:
        """Add item to cart or update quantity if exists"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Check if item already in cart
            cursor.execute('''
                SELECT cart_id, quantity
                FROM cart_items
                WHERE user_id = ? AND accessory_id = ?
            ''', (user_id, accessory_id))
            
            existing = cursor.fetchone()
            
            if existing:
                # Update quantity
                new_quantity = existing['quantity'] + quantity
                cursor.execute('''
                    UPDATE cart_items
                    SET quantity = ?
                    WHERE cart_id = ?
                ''', (new_quantity, existing['cart_id']))
                message = 'Cart updated'
            else:
                # Insert new item
                cursor.execute('''
                    INSERT INTO cart_items (user_id, accessory_id, quantity)
                    VALUES (?, ?, ?)
                ''', (user_id, accessory_id, quantity))
                message = 'Item added to cart'
            
            conn.commit()
            return {'success': True, 'message': message}
            
        except Exception as e:
            return {'success': False, 'message': str(e)}
        finally:
            conn.close()
    
    @staticmethod
    def update_cart_quantity(user_id: int, accessory_id: str, quantity: int) -> Dict:
        """Update quantity of cart item"""
        if quantity <= 0:
            return CartDB.remove_from_cart(user_id, accessory_id)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                UPDATE cart_items
                SET quantity = ?
                WHERE user_id = ? AND accessory_id = ?
            ''', (quantity, user_id, accessory_id))
            
            conn.commit()
            
            if cursor.rowcount > 0:
                return {'success': True, 'message': 'Quantity updated'}
            else:
                return {'success': False, 'message': 'Item not found in cart'}
                
        finally:
            conn.close()
    
    @staticmethod
    def remove_from_cart(user_id: int, accessory_id: str) -> Dict:
        """Remove item from cart"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                DELETE FROM cart_items
                WHERE user_id = ? AND accessory_id = ?
            ''', (user_id, accessory_id))
            
            conn.commit()
            
            if cursor.rowcount > 0:
                return {'success': True, 'message': 'Item removed from cart'}
            else:
                return {'success': False, 'message': 'Item not found in cart'}
                
        finally:
            conn.close()
    
    @staticmethod
    def clear_cart(user_id: int) -> Dict:
        """Clear all items from user's cart"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('DELETE FROM cart_items WHERE user_id = ?', (user_id,))
            conn.commit()
            
            return {'success': True, 'message': 'Cart cleared'}
            
        finally:
            conn.close()
    
    @staticmethod
    def get_cart_count(user_id: int) -> int:
        """Get total number of items in cart"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT COALESCE(SUM(quantity), 0) as total
                FROM cart_items
                WHERE user_id = ?
            ''', (user_id,))
            
            result = cursor.fetchone()
            return result['total']
            
        finally:
            conn.close()
    
    @staticmethod
    def get_cart_total(user_id: int) -> float:
        """Get total price of items in cart"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT COALESCE(SUM(c.quantity * a.price), 0) as total
                FROM cart_items c
                JOIN accessories a ON c.accessory_id = a.accessory_id
                WHERE c.user_id = ?
            ''', (user_id,))
            
            result = cursor.fetchone()
            return result['total']
            
        finally:
            conn.close()


# ==================== WISHLIST OPERATIONS ====================

class WishlistDB:
    """Database operations for wishlist"""
    
    @staticmethod
    def get_wishlist_items(user_id: int) -> List[Dict]:
        """Get all wishlist items for a user with accessory details"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT 
                    w.wishlist_id,
                    w.added_at,
                    a.*
                FROM wishlist w
                JOIN accessories a ON w.accessory_id = a.accessory_id
                WHERE w.user_id = ?
                ORDER BY w.added_at DESC
            ''', (user_id,))
            
            items = [dict(row) for row in cursor.fetchall()]
            return items
            
        finally:
            conn.close()
    
    @staticmethod
    def add_to_wishlist(user_id: int, accessory_id: str) -> Dict:
        """Add item to wishlist"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO wishlist (user_id, accessory_id)
                VALUES (?, ?)
            ''', (user_id, accessory_id))
            
            conn.commit()
            return {'success': True, 'message': 'Item added to wishlist'}
            
        except sqlite3.IntegrityError:
            return {'success': False, 'message': 'Item already in wishlist'}
        except Exception as e:
            return {'success': False, 'message': str(e)}
        finally:
            conn.close()
    
    @staticmethod
    def remove_from_wishlist(user_id: int, accessory_id: str) -> Dict:
        """Remove item from wishlist"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                DELETE FROM wishlist
                WHERE user_id = ? AND accessory_id = ?
            ''', (user_id, accessory_id))
            
            conn.commit()
            
            if cursor.rowcount > 0:
                return {'success': True, 'message': 'Item removed from wishlist'}
            else:
                return {'success': False, 'message': 'Item not found in wishlist'}
                
        finally:
            conn.close()
    
    @staticmethod
    def is_in_wishlist(user_id: int, accessory_id: str) -> bool:
        """Check if item is in wishlist"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT 1 FROM wishlist
                WHERE user_id = ? AND accessory_id = ?
            ''', (user_id, accessory_id))
            
            return cursor.fetchone() is not None
            
        finally:
            conn.close()
    
    @staticmethod
    def clear_wishlist(user_id: int) -> Dict:
        """Clear all items from user's wishlist"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('DELETE FROM wishlist WHERE user_id = ?', (user_id,))
            conn.commit()
            
            return {'success': True, 'message': 'Wishlist cleared'}
            
        finally:
            conn.close()
    
    @staticmethod
    def get_wishlist_count(user_id: int) -> int:
        """Get number of items in wishlist"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT COUNT(*) as count
                FROM wishlist
                WHERE user_id = ?
            ''', (user_id,))
            
            result = cursor.fetchone()
            return result['count']
            
        finally:
            conn.close()


# ==================== ORDER OPERATIONS ====================

class OrderDB:
    """Database operations for orders"""
    
    @staticmethod
    def create_order(
        user_id: int,
        cart_items: List[Dict],
        total_amount: float,
        delivery_charge: float,
        delivery_info: Dict,
        payment_method: str
    ) -> Dict:
        """
        Create a new order from cart items
        
        Args:
            user_id: User ID
            cart_items: List of items with accessory_id, quantity, price
            total_amount: Total order amount
            delivery_charge: Delivery charge
            delivery_info: Dict with full_name, email, phone, address, city, state, pincode
            payment_method: Payment method (card/upi/cod)
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Generate order number
            order_number = f"ORD-{int(datetime.now().timestamp())}"
            
            # Insert order
            cursor.execute('''
                INSERT INTO orders (
                    order_number, user_id, total_amount, delivery_charge,
                    full_name, email, phone, address, city, state, pincode,
                    payment_method, payment_status, order_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                order_number, user_id, total_amount, delivery_charge,
                delivery_info['full_name'],
                delivery_info['email'],
                delivery_info['phone'],
                delivery_info['address'],
                delivery_info['city'],
                delivery_info['state'],
                delivery_info['pincode'],
                payment_method,
                'pending',
                'pending'
            ))
            
            order_id = cursor.lastrowid
            
            # Insert order items
            for item in cart_items:
                cursor.execute('''
                    INSERT INTO order_items (
                        order_id, accessory_id, accessory_name, quantity, price
                    ) VALUES (?, ?, ?, ?, ?)
                ''', (
                    order_id,
                    item['accessory_id'],
                    item.get('accessory_name', ''),
                    item['quantity'],
                    item['price']
                ))
            
            # Clear cart
            cursor.execute('DELETE FROM cart_items WHERE user_id = ?', (user_id,))
            
            conn.commit()
            
            return {
                'success': True,
                'order_id': order_id,
                'order_number': order_number,
                'message': 'Order created successfully'
            }
            
        except Exception as e:
            conn.rollback()
            return {'success': False, 'message': f'Order creation failed: {str(e)}'}
        finally:
            conn.close()
    
    @staticmethod
    def get_order_by_number(order_number: str) -> Optional[Dict]:
        """Get order details by order number"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT * FROM orders
                WHERE order_number = ?
            ''', (order_number,))
            
            order = cursor.fetchone()
            if not order:
                return None
            
            order_dict = dict(order)
            
            # Get order items
            cursor.execute('''
                SELECT * FROM order_items
                WHERE order_id = ?
            ''', (order_dict['order_id'],))
            
            order_dict['items'] = [dict(row) for row in cursor.fetchall()]
            
            return order_dict
            
        finally:
            conn.close()
    
    @staticmethod
    def get_user_orders(user_id: int) -> List[Dict]:
        """Get all orders for a user"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT * FROM orders
                WHERE user_id = ?
                ORDER BY order_date DESC
            ''', (user_id,))
            
            orders = [dict(row) for row in cursor.fetchall()]
            
            # Get items for each order
            for order in orders:
                cursor.execute('''
                    SELECT * FROM order_items
                    WHERE order_id = ?
                ''', (order['order_id'],))
                
                order['items'] = [dict(row) for row in cursor.fetchall()]
            
            return orders
            
        finally:
            conn.close()


# ==================== ACCESSORY OPERATIONS ====================

class AccessoryDB:
    """Database operations for accessories"""
    
    @staticmethod
    def get_accessory_by_id(accessory_id: str) -> Optional[Dict]:
        """Get accessory by ID"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT * FROM accessories WHERE accessory_id = ?', (accessory_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
            
        finally:
            conn.close()
    
    @staticmethod
    def search_accessories(
        brand: str = None,
        model: str = None,
        min_price: float = None,
        max_price: float = None,
        sentiment: str = None,
        limit: int = 100
    ) -> List[Dict]:
        """Search accessories with filters"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            query = 'SELECT * FROM accessories WHERE 1=1'
            params = []
            
            if brand:
                query += ' AND car_brand = ?'
                params.append(brand)
            
            if model:
                query += ' AND car_model = ?'
                params.append(model)
            
            if min_price is not None:
                query += ' AND price >= ?'
                params.append(min_price)
            
            if max_price is not None:
                query += ' AND price <= ?'
                params.append(max_price)
            
            if sentiment:
                query += ' AND sentiment_label = ?'
                params.append(sentiment)
            
            query += f' LIMIT {limit}'
            
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
            
        finally:
            conn.close()
    
    @staticmethod
    def get_all_brands() -> List[str]:
        """Get all unique car brands"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT DISTINCT car_brand FROM accessories ORDER BY car_brand')
            return [row['car_brand'] for row in cursor.fetchall()]
            
        finally:
            conn.close()
    
    @staticmethod
    def get_models_by_brand(brand: str) -> List[str]:
        """Get all models for a specific brand"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT DISTINCT car_model 
                FROM accessories 
                WHERE car_brand = ?
                ORDER BY car_model
            ''', (brand,))
            return [row['car_model'] for row in cursor.fetchall()]
            
        finally:
            conn.close()


# ==================== TESTING ====================

def test_db_operations():
    """Test database operations"""
    print("=" * 60)
    print("🧪 TESTING DATABASE OPERATIONS")
    print("=" * 60)
    
    # You need a test user_id for this (create via auth.py first)
    test_user_id = 1  # Assuming user_id 1 exists
    
    # Test Cart
    print("\n1️⃣ Testing Cart Operations...")
    result = CartDB.add_to_cart(test_user_id, "1", 2)
    print(f"   Add to cart: {result}")
    
    items = CartDB.get_cart_items(test_user_id)
    print(f"   Cart items: {len(items)} items")
    
    # Test Wishlist
    print("\n2️⃣ Testing Wishlist Operations...")
    result = WishlistDB.add_to_wishlist(test_user_id, "2")
    print(f"   Add to wishlist: {result}")
    
    items = WishlistDB.get_wishlist_items(test_user_id)
    print(f"   Wishlist items: {len(items)} items")
    
    print("\n✅ Database operations working!")


if __name__ == '__main__':
    test_db_operations()
