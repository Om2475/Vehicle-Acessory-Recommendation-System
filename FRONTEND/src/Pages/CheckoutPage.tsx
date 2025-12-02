import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import {
  CreditCard,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
  Package,
  ChevronLeft,
  Wallet,
  Building,
} from 'lucide-react';
import Navbar from '../components/navbar';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry'
];

const majorCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai',
  'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna',
  'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad',
  'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad'
];

// City to State mapping
const cityToState: { [key: string]: string } = {
  'Mumbai': 'Maharashtra', 'Pune': 'Maharashtra', 'Nagpur': 'Maharashtra', 'Thane': 'Maharashtra', 'Nashik': 'Maharashtra', 'Aurangabad': 'Maharashtra',
  'Delhi': 'Delhi',
  'Bangalore': 'Karnataka',
  'Hyderabad': 'Telangana',
  'Ahmedabad': 'Gujarat', 'Surat': 'Gujarat', 'Vadodara': 'Gujarat', 'Rajkot': 'Gujarat',
  'Chennai': 'Tamil Nadu',
  'Kolkata': 'West Bengal',
  'Jaipur': 'Rajasthan',
  'Lucknow': 'Uttar Pradesh', 'Kanpur': 'Uttar Pradesh', 'Ghaziabad': 'Uttar Pradesh', 'Agra': 'Uttar Pradesh', 'Meerut': 'Uttar Pradesh', 'Varanasi': 'Uttar Pradesh', 'Faridabad': 'Uttar Pradesh',
  'Indore': 'Madhya Pradesh', 'Bhopal': 'Madhya Pradesh',
  'Visakhapatnam': 'Andhra Pradesh', 'Patna': 'Bihar',
  'Ludhiana': 'Punjab',
  'Srinagar': 'Jammu and Kashmir',
  'Dhanbad': 'Jharkhand'
};

// Pincode ranges to state/city mapping (simplified)
const getPincodeInfo = (pincode: string): { city: string; state: string } | null => {
  const pin = parseInt(pincode);
  if (isNaN(pin) || pincode.length !== 6) return null;

  // Maharashtra
  if ((pin >= 400000 && pin <= 445000)) {
    if (pin >= 400000 && pin <= 400100) return { city: 'Mumbai', state: 'Maharashtra' };
    if (pin >= 411000 && pin <= 412000) return { city: 'Pune', state: 'Maharashtra' };
    if (pin >= 440000 && pin <= 441000) return { city: 'Nagpur', state: 'Maharashtra' };
    return { city: '', state: 'Maharashtra' };
  }
  // Delhi
  if (pin >= 110000 && pin <= 110100) return { city: 'Delhi', state: 'Delhi' };
  // Karnataka
  if (pin >= 560000 && pin <= 560100) return { city: 'Bangalore', state: 'Karnataka' };
  // Telangana
  if (pin >= 500000 && pin <= 509000) return { city: 'Hyderabad', state: 'Telangana' };
  // Gujarat
  if (pin >= 380000 && pin <= 389000) {
    if (pin >= 380000 && pin <= 380100) return { city: 'Ahmedabad', state: 'Gujarat' };
    if (pin >= 395000 && pin <= 395100) return { city: 'Surat', state: 'Gujarat' };
    return { city: '', state: 'Gujarat' };
  }
  // Tamil Nadu
  if (pin >= 600000 && pin <= 643000) {
    if (pin >= 600000 && pin <= 600100) return { city: 'Chennai', state: 'Tamil Nadu' };
    return { city: '', state: 'Tamil Nadu' };
  }
  // West Bengal
  if (pin >= 700000 && pin <= 743000) return { city: 'Kolkata', state: 'West Bengal' };
  // Rajasthan
  if (pin >= 302000 && pin <= 302100) return { city: 'Jaipur', state: 'Rajasthan' };
  // Uttar Pradesh
  if (pin >= 201000 && pin <= 285000) {
    if (pin >= 226000 && pin <= 226100) return { city: 'Lucknow', state: 'Uttar Pradesh' };
    if (pin >= 208000 && pin <= 208100) return { city: 'Kanpur', state: 'Uttar Pradesh' };
    return { city: '', state: 'Uttar Pradesh' };
  }
  // Madhya Pradesh
  if (pin >= 452000 && pin <= 452100) return { city: 'Indore', state: 'Madhya Pradesh' };
  if (pin >= 462000 && pin <= 462100) return { city: 'Bhopal', state: 'Madhya Pradesh' };
  
  return null;
};

interface CheckoutPageProps {
  user: any;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const deliveryCharge = getCartTotal() < 500 ? 50 : 0;
  const totalAmount = getCartTotal() + deliveryCharge;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Auto-fill state/city based on pincode
    if (name === 'pincode' && value.length === 6) {
      const pincodeInfo = getPincodeInfo(value);
      if (pincodeInfo) {
        setFormData(prev => ({
          ...prev,
          pincode: value,
          state: pincodeInfo.state,
          city: pincodeInfo.city || prev.city,
        }));
        if (pincodeInfo.city) {
          toast.success(`Auto-filled: ${pincodeInfo.city}, ${pincodeInfo.state}`);
        } else {
          toast.success(`Auto-filled state: ${pincodeInfo.state}`);
        }
      }
    }
  };

  // Handle city selection - auto-fill state
  const handleCityChange = (city: string) => {
    const state = cityToState[city] || '';
    setFormData({
      ...formData,
      city,
      state,
    });
    if (state) {
      toast.success(`Auto-filled state: ${state}`);
    }
  };

  // Handle state selection
  const handleStateChange = (state: string) => {
    setFormData({
      ...formData,
      state,
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (paymentMethod === 'card') {
      if (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCvv) {
        toast.error('Please fill in all card details');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      // Place order via API
      const response = await fetch('http://localhost:8000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          delivery_info: {
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          payment_method: paymentMethod,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear cart (will also clear on server)
        clearCart();
        
        // Show success message
        toast.success('Order Placed Successfully! 🎉', {
          duration: 3000,
        });
        
        // Redirect to finder page after 2 seconds
        setTimeout(() => {
          navigate('/finder');
        }, 2000);
      } else {
        toast.error(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Navbar user={user} />
        <div className="container mx-auto px-4 py-24">
          <Card className="p-12 text-center">
            <Package className="h-24 w-24 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some items to proceed to checkout</p>
            <Button onClick={() => navigate('/finder')} className="bg-gradient-to-r from-red-600 to-orange-600">
              Start Shopping
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-24">
        <Button variant="ghost" onClick={() => navigate('/cart')} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-red-500" />
                Delivery Information
              </h2>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Street address, apartment, suite, etc."
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={handleCityChange}
                    >
                      <SelectTrigger id="city">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        {majorCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={handleStateChange}
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      placeholder="400001"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>
                </div>
              </form>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-red-500" />
                Payment Method
              </h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Credit/Debit Card</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Wallet className="h-5 w-5 text-red-500" />
                      <span className="font-medium">UPI Payment</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Building className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Cash on Delivery</span>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {paymentMethod === 'card' && (
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      maxLength={19}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name *</Label>
                    <Input
                      id="cardName"
                      name="cardName"
                      placeholder="John Doe"
                      value={formData.cardName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">Expiry Date *</Label>
                      <Input
                        id="cardExpiry"
                        name="cardExpiry"
                        placeholder="MM/YY"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvv">CVV *</Label>
                      <Input
                        id="cardCvv"
                        name="cardCvv"
                        type="password"
                        placeholder="123"
                        value={formData.cardCvv}
                        onChange={handleInputChange}
                        maxLength={3}
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.accessory_id} className="flex gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded flex items-center justify-center flex-shrink-0">
                      <Package className="h-8 w-8 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.accessory_name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-red-600">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Pricing */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-semibold">
                    {deliveryCharge === 0 ? (
                      <span className="text-green-500">FREE</span>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-red-600">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full h-12 text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Place Order
                  </>
                )}
              </Button>

              {/* Benefits */}
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck className="h-4 w-4 text-green-500" />
                  <span>Free delivery on orders above ₹500</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span>Secure payment processing</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
