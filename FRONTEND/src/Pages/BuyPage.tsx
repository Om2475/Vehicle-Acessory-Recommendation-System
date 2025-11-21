import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AccessoryRecommendation } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Shield,
  RefreshCcw,
  ChevronLeft,
  Plus,
  Minus,
  Check,
  Package,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

const BuyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const accessory = location.state?.accessory as AccessoryRecommendation;

  const [quantity, setQuantity] = useState(1);
  const isWishlisted = accessory ? isInWishlist(accessory.accessory_id) : false;

  if (!accessory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(accessory);
    }
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(accessory.accessory_id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(accessory);
      toast.success('Added to wishlist!');
    }
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Calculate quality percentage
  const qualityPercentage = Math.round(accessory.quality_score * 100);

  // Determine sentiment color
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-green-500';
      case 'neutral':
        return 'bg-yellow-500';
      case 'negative':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:to-gray-800">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Product Image & Info */}
          <div className="space-y-6">
            {/* Main Product Card */}
            <Card className="p-8 bg-white dark:bg-gray-800 shadow-lg">
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center mb-6">
                <Package className="h-32 w-32 text-gray-400" />
              </div>

              {/* Product Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  {accessory.final_score.toFixed(1)}% Match
                </Badge>
                <Badge className={getSentimentColor(accessory.sentiment_label)}>
                  {accessory.sentiment_label}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {accessory.dominant_emotion}
                </Badge>
                {qualityPercentage >= 70 && (
                  <Badge className="bg-green-500 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    High Quality
                  </Badge>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-3xl font-bold mb-2">{accessory.accessory_name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {accessory.car_brand} - {accessory.car_model}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                  ₹{accessory.price.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              <Separator className="my-6" />

              {/* Product Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {accessory.description || 'Premium quality accessory designed for your vehicle.'}
                </p>
              </div>

              {/* Compatibility */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Compatibility</h3>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Compatible with {accessory.car_brand} {accessory.car_model}
                  </span>
                </div>
              </div>
            </Card>

            {/* Quality & Sentiment Details */}
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Product Insights</h3>
              
              <div className="space-y-4">
                {/* Quality Score */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Quality Score</span>
                    <span className="text-sm font-bold">{qualityPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                      style={{ width: `${qualityPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Sentiment Analysis */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Customer Sentiment</span>
                    <Badge className={getSentimentColor(accessory.sentiment_label)}>
                      {accessory.sentiment_label}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Based on customer reviews and ratings
                  </p>
                </div>

                {/* Match Explanation */}
                {accessory.explanation && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <TrendingUp className="h-4 w-4 inline mr-2 text-blue-500" />
                      {accessory.explanation}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Purchase Options */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg sticky top-6">
              <h2 className="text-2xl font-bold mb-6">Purchase Options</h2>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={incrementQuantity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Total Price */}
              <div className="mb-6 p-4 bg-red-50 dark:bg-gray-700 rounded-lg border border-red-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Price:</span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                    ₹{(accessory.price * quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleBuyNow}
                  className="w-full h-12 text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Buy Now
                </Button>
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="w-full h-12 text-lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleWishlist}
                  variant="outline"
                  className="w-full h-12 text-lg"
                >
                  <Heart
                    className={`mr-2 h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </Button>
              </div>

              <Separator className="my-6" />

              {/* Benefits */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-green-500" />
                  <span>Free delivery on orders above ₹500</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span>1 Year Warranty included</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RefreshCcw className="h-5 w-5 text-purple-500" />
                  <span>7 Days Return Policy</span>
                </div>
              </div>
            </Card>

            {/* Product Details Card */}
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Product Specifications</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 dark:text-gray-400">Product ID</span>
                  <span className="font-medium">{accessory.accessory_id}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 dark:text-gray-400">Brand</span>
                  <span className="font-medium">{accessory.car_brand}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 dark:text-gray-400">Model</span>
                  <span className="font-medium">{accessory.car_model}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 dark:text-gray-400">Price</span>
                  <span className="font-medium">₹{accessory.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Quality Rating</span>
                  <span className="font-medium">{qualityPercentage}%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
