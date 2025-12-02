import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import LandingPage from './Pages/LandingPage';
import SignIn from './Pages/SignIn';
import SignUp from './Pages/SignUp';
import RecommendationFinder from './Pages/RecommendationFinder';
import Results from './Pages/Results';
import BuyPage from './Pages/BuyPage';
import CartPage from './Pages/CartPage';
import WishlistPage from './Pages/WishlistPage';
import CheckoutPage from './Pages/CheckoutPage';
import OrderSuccessPage from './Pages/OrderSuccessPage';

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/finder" element={<RecommendationFinder user={user} />} />
      <Route path="/results" element={<Results user={user} />} />
      <Route path="/buy" element={<BuyPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/wishlist" element={<WishlistPage user={user} />} />
      <Route path="/checkout" element={<CheckoutPage user={user} />} />
      <Route path="/order-success" element={<OrderSuccessPage user={user} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <AppRoutes />
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
