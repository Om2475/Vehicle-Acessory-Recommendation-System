import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  // No authentication, so no user or loading state needed

  return (
    <WishlistProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/finder" element={<RecommendationFinder user={null} />} />
            <Route path="/results" element={<Results user={null} />} />
            <Route path="/buy" element={<BuyPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage user={null} />} />
            <Route path="/checkout" element={<CheckoutPage user={null} />} />
            <Route path="/order-success" element={<OrderSuccessPage user={null} />} />
          </Routes>
        </Router>
      </CartProvider>
    </WishlistProvider>
  );
}

export default App;
