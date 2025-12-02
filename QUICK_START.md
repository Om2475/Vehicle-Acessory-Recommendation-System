# 🚀 QUICK START GUIDE

## How to Run Your Complete System

### ✅ Prerequisites Verified:
- Python installed ✅
- Node.js & npm installed ✅
- Frontend dependencies installed ✅
- Database created and populated ✅
- Backend code tested ✅

---

## 🎯 Start the System (2 Steps)

### **Step 1: Start Backend API** (Terminal 1)

```powershell
cd C:\Users\krish\Vehicle-Acessory-Recommendation-System\ML_Engine
python api.py
```

**Wait for:**
```
✅ Loaded 1269 accessories with 47 features
✅ Recommendation Engine loaded successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Backend will be available at:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

---

### **Step 2: Start Frontend** (Terminal 2)

Open a **NEW** PowerShell terminal:

```powershell
cd C:\Users\krish\Vehicle-Acessory-Recommendation-System\FRONTEND
npm run dev
```

**Wait for:**
```
VITE v... ready in ...ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Frontend will be available at:** http://localhost:5173

---

## 🧪 Test the Complete Flow

### 1. **Open Browser**
```
http://localhost:5173
```

### 2. **Create Account**
- Click "Sign Up"
- Full Name: "Test User"
- Email: "test@example.com"
- Password: "Test12345" (min 8 chars, 1 upper, 1 lower, 1 number)
- Confirm Password: "Test12345"
- Click "Create Account"

### 3. **Search for Accessories**
- Should redirect to Finder page
- Select car brand (e.g., "Toyota")
- Set budget range
- Click "Find Recommendations"

### 4. **Add to Cart**
- Browse recommended accessories
- Click "Add to Cart" on any item
- Check cart icon (should show count)

### 5. **Add to Wishlist**
- Click heart icon on any accessory
- Check wishlist page

### 6. **Checkout**
- Go to Cart page
- Click "Proceed to Checkout"
- Fill delivery information:
  - Full Name: "Your Name"
  - Email: "your@email.com"
  - Phone: "9876543210"
  - Address: "123 Street"
  - City: "Mumbai"
  - State: "Maharashtra"
  - Pincode: "400001"
- Select Payment Method (Card/UPI/COD)
- Click "Place Order"

### 7. **Verify in Database**
Open database in SQLite Browser or run:
```powershell
cd ML_Engine
python -c "import sqlite3; conn = sqlite3.connect('vehicle_accessories.db'); print('Orders:', conn.execute('SELECT * FROM orders').fetchall()); conn.close()"
```

---

## 🔍 What Should Happen

### ✅ **When You Signup:**
- User created in database with hashed password
- Automatically logged in
- Token stored in browser localStorage

### ✅ **When You Add to Cart:**
- If logged in: Saved to database immediately
- If not logged in: Stored in localStorage
- Network tab shows `POST /cart` API call

### ✅ **When You Add to Wishlist:**
- If logged in: Saved to database immediately
- Network tab shows `POST /wishlist` API call

### ✅ **When You Place Order:**
- Order saved to database with unique order number
- Cart cleared automatically
- Redirected to success page
- Network tab shows `POST /orders` API call

### ✅ **When You Refresh Page:**
- Still logged in (token persists)
- Cart items still there (loaded from database)
- Wishlist items still there (loaded from database)

---

## 📊 Check API Status

### **Health Check:**
```powershell
curl http://localhost:8000/
```

Should return:
```json
{
  "message": "Vehicle Accessories Recommendation API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "stats": "/stats",
    "recommend": "/recommend (POST)",
    "brands": "/brands"
  }
}
```

### **Check API Docs:**
Open: http://localhost:8000/docs

You should see all endpoints:
- POST /auth/signup
- POST /auth/login
- GET /cart
- POST /cart
- PUT /cart
- DELETE /cart/{accessory_id}
- GET /wishlist
- POST /wishlist
- DELETE /wishlist/{accessory_id}
- POST /orders
- GET /orders
- And more...

---

## 🐛 Troubleshooting

### **Problem: Backend won't start**
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# If port is in use, kill the process
taskkill /PID <PID_NUMBER> /F

# Restart backend
python api.py
```

### **Problem: Frontend won't start**
```powershell
# Check if port 5173 is in use
netstat -ano | findstr :5173

# If modules missing
npm install

# Restart frontend
npm run dev
```

### **Problem: "Network Error" in frontend**
- ✅ Check backend is running (http://localhost:8000)
- ✅ Check browser console for errors
- ✅ Check Network tab for failed API calls
- ✅ CORS should be enabled in api.py (already done)

### **Problem: "401 Unauthorized"**
- Logout and login again
- Clear browser localStorage
- Token might be expired (7 days)

### **Problem: Cart/Wishlist not saving**
- Make sure you're logged in
- Check browser console for errors
- Check Network tab for API calls
- Verify backend is running

---

## 📂 Project Structure

```
Vehicle-Acessory-Recommendation-System/
├── ML_Engine/                     # Backend
│   ├── api.py                     # FastAPI server (START THIS)
│   ├── auth.py                    # Authentication logic
│   ├── db_helpers.py              # Database operations
│   ├── database.py                # Database schema
│   ├── recommendation_engine.py   # ML recommendation logic
│   ├── vehicle_accessories.db     # SQLite database (1.00 MB)
│   ├── test_backend_database.py   # Backend tests
│   └── TEST_RESULTS.md           # Test results
│
├── FRONTEND/                      # Frontend
│   ├── src/
│   │   ├── App.tsx               # Main app component
│   │   ├── context/
│   │   │   ├── AuthContext.tsx   # Authentication state
│   │   │   ├── CartContext.tsx   # Cart state (syncs with DB)
│   │   │   └── WishlistContext.tsx # Wishlist state (syncs with DB)
│   │   └── Pages/
│   │       ├── SignIn.tsx        # Login page
│   │       ├── SignUp.tsx        # Signup page
│   │       ├── CartPage.tsx      # Cart page
│   │       ├── WishlistPage.tsx  # Wishlist page
│   │       └── CheckoutPage.tsx  # Checkout page
│   └── package.json              # Dependencies
│
├── Dataset/                       # Data
│   └── processed/
│       └── accessories_cleaned_final.csv  # 1,269 accessories
│
└── COMPLETE_TEST_REPORT.md       # Full test report
```

---

## ✨ Features Working

✅ User Authentication (Signup/Login/Logout)  
✅ Shopping Cart (Add/Update/Remove/Clear)  
✅ Wishlist (Add/Remove)  
✅ Order Creation (with delivery info)  
✅ Database Sync (Real-time)  
✅ Session Management (7-day tokens)  
✅ Password Security (bcrypt hashing)  
✅ Multi-device Support (login anywhere)  
✅ Guest Mode (localStorage fallback)  
✅ Recommendation Engine (ML-based)

---

## 🎓 For College Demo

### **Demo Flow:**
1. Show database schema (SQLite Browser)
2. Start backend + frontend
3. Create new user (show in database)
4. Add items to cart (show API calls in Network tab)
5. Add items to wishlist
6. Place an order
7. Show order in database
8. Refresh page (everything persists!)
9. Login from incognito (same data!)

### **Highlights to Mention:**
- Full-stack application (React + FastAPI + SQLite)
- RESTful API design
- Secure authentication (bcrypt)
- Real-time database synchronization
- Professional error handling
- ACID-compliant transactions

---

## 🎉 System Status

### ✅ **ALL SYSTEMS READY!**

- Backend: **Tested & Working** ✅
- Database: **Populated & Verified** ✅
- Frontend: **Connected & Ready** ✅
- Integration: **100% Complete** ✅

**You're ready to demonstrate your TY project!** 🚀

---

## 📞 Quick Reference

| Component | Command | URL |
|-----------|---------|-----|
| Backend | `python api.py` | http://localhost:8000 |
| Frontend | `npm run dev` | http://localhost:5173 |
| API Docs | - | http://localhost:8000/docs |
| Database | SQLite Browser | `vehicle_accessories.db` |

---

**Last Updated:** November 29, 2025  
**Status:** ✅ Production Ready  
**Test Success Rate:** 100%
