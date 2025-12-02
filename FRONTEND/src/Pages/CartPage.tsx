import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import Navbar from '../components/navbar';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ChevronLeft,
  Package,
  CreditCard,
  Truck,
  ShoppingBag,
} from 'lucide-react';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems = [], removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } = useCart();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is already empty!');
      return;
    }
    clearCart();
    toast.success('Cart cleared successfully!');
  };

  const handleRemoveItem = (accessoryId: string, name: string) => {
    removeFromCart(accessoryId);
    toast.success(`${name} removed from cart`);
  };

  const deliveryCharge = getCartTotal() < 500 ? 50 : 0;
  const totalAmount = getCartTotal() + deliveryCharge;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <ShoppingCart className="h-8 w-8" />
                Shopping Cart
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            {cartItems.length > 0 && (
              <Button variant="destructive" onClick={handleClearCart}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
            )}
          </div>
        </div>

        {/* Empty Cart */}
        {cartItems.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add some accessories to get started!
            </p>
            <Button onClick={() => navigate('/finder')}>
              Find Accessories
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.accessory_id} className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{item.accessory_name}</h3>
                          {(item.car_brand || item.car_model) && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.car_brand} {item.car_model && `- ${item.car_model}`}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.accessory_id, item.accessory_name)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.sentiment_label && (
                          <Badge variant="outline">{item.sentiment_label}</Badge>
                        )}
                        {item.dominant_emotion && (
                          <Badge variant="outline" className="capitalize">
                            {item.dominant_emotion}
                          </Badge>
                        )}
                        {item.final_score && (
                          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                            {item.final_score.toFixed(1)}% Match
                          </Badge>
                        )}
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.accessory_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-lg font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.accessory_id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            ₹{item.price.toLocaleString()} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-6">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                {/* Summary Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-semibold">₹{getCartTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Charges</span>
                    <span className="font-semibold">
                      {deliveryCharge === 0 ? (
                        <span className="text-green-500">FREE</span>
                      ) : (
                        `₹${deliveryCharge}`
                      )}
                    </span>
                  </div>
                  {deliveryCharge > 0 && (
                    <p className="text-xs text-gray-500">
                      Add ₹{(500 - getCartTotal()).toLocaleString()} more for free delivery
                    </p>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-red-600 dark:text-red-400">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full h-12 text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 mb-4"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Checkout
                </Button>

                <Separator className="my-4" />

                {/* Benefits */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Free delivery on orders above ₹500</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Package className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <span>Secure packaging guaranteed</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
