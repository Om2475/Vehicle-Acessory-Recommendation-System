import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  CheckCircle2,
  Package,
  Home,
  ShoppingBag,
  Truck,
  Download,
  Mail,
} from 'lucide-react';
import Navbar from '../components/navbar';

interface OrderSuccessPageProps {
  user: any;
}

const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state || {
    orderNumber: 'ORD-000000',
    totalAmount: 0,
    itemCount: 0,
    deliveryAddress: 'N/A',
  };

  const handleDownloadInvoice = () => {
    // Simulate download
    alert('Invoice download will be implemented in production');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 animate-bounce shadow-2xl">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Order Placed Successfully! 🎉
            </h1>
            <p className="text-xl text-gray-600">
              Thank you for your purchase. Your order is being processed.
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="p-8 mb-6 shadow-xl border-2 border-green-100">
            <div className="space-y-6">
              {/* Order Number */}
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-2xl font-bold text-green-600">{orderData.orderNumber}</p>
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-gray-600">Items Ordered</p>
                  <p className="text-xl font-bold">{orderData.itemCount}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm text-gray-600">Delivery in</p>
                  <p className="text-xl font-bold">3-5 Days</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">₹{orderData.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Delivery Address
                </p>
                <p className="text-gray-700">{orderData.deliveryAddress}</p>
              </div>

              {/* Next Steps */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-900 mb-3">📦 What's Next?</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Order confirmation email sent to your registered email address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Your items will be packed and shipped within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Track your order status via email notifications</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleDownloadInvoice}
              variant="outline"
              className="h-14 border-2 hover:bg-blue-50"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Invoice
            </Button>
            <Button
              onClick={() => navigate('/finder')}
              variant="outline"
              className="h-14 border-2 hover:bg-red-50"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Continue Shopping
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="h-14 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </div>

          {/* Support Info */}
          <Card className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-dashed">
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-1">Need Help?</p>
                <p className="text-sm text-gray-600">
                  If you have any questions about your order, please contact our customer support at{' '}
                  <a href="mailto:support@modmatch.com" className="text-blue-600 hover:underline">
                    support@modmatch.com
                  </a>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
