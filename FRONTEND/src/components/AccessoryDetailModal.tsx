import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star, Heart, Award, TrendingUp, MessageCircle, ThumbsUp, ThumbsDown, X, Package } from 'lucide-react';
import { formatPrice, formatScore, getQualityBadgeColor, getSentimentBadgeColor, type AccessoryRecommendation } from '../lib/api';

interface AccessoryDetailModalProps {
  accessory: AccessoryRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessoryDetailModal({ accessory, isOpen, onClose }: AccessoryDetailModalProps) {
  if (!accessory) return null;

  // Parse reviews
  const parseReviews = (reviewsText: string) => {
    if (!reviewsText || reviewsText === 'No customer reviews' || reviewsText === 'No reviews') {
      return [];
    }

    // Try to parse if it's a stringified list
    try {
      const parsed = JSON.parse(reviewsText.replace(/'/g, '"'));
      return Array.isArray(parsed) ? parsed : [reviewsText];
    } catch {
      // Split by pipe or newline
      return reviewsText.split(/\||[\r\n]+/).filter(r => r.trim() && !r.includes('No reviews'));
    }
  };

  const reviews = parseReviews(accessory.top_reviews || '');
  const hasReviews = reviews.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <DialogTitle className="text-2xl font-bold mb-2">
                {accessory.accessory_name}
              </DialogTitle>
              <DialogDescription className="text-base">
                {accessory.car_brand} {accessory.car_model} • {accessory.category}
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Price & Score Section */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
            <div>
              <div className="text-3xl font-bold text-primary">
                {formatPrice(accessory.price)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Match Score: <span className="font-semibold text-primary">{formatScore(accessory.final_score)}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Badge className={`${getQualityBadgeColor(accessory.quality_score)} text-white`}>
                <Star className="w-4 h-4 mr-1" />
                Quality: {formatScore(accessory.quality_score)}
              </Badge>
              <Badge className={`${getSentimentBadgeColor(accessory.sentiment_score)} text-white`}>
                <Heart className="w-4 h-4 mr-1" />
                Sentiment: {formatScore(accessory.sentiment_score)}
              </Badge>
            </div>
          </div>

          {/* Cross-Compatibility Warning */}
          {accessory.is_cross_compatible && accessory.compatibility_note && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800 mb-1">CROSS-MODEL COMPATIBILITY</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  {accessory.compatibility_note}
                </p>
              </div>
            </div>
          )}

          {/* Full Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Product Description
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {accessory.description}
            </p>
          </div>

          {/* Why This Recommendation */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
              <Award className="w-5 h-5" />
              Why We Recommend This
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {accessory.explanation}
            </p>
          </div>

          {/* Key Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-green-800">
                <ThumbsUp className="w-4 h-4" />
                Key Strengths
              </h3>
              {accessory.key_strengths && accessory.key_strengths !== 'N/A' ? (
                <ul className="text-sm text-green-700 space-y-1.5">
                  {accessory.key_strengths.split(',').map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{strength.trim()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-green-600">Overall positive feedback</p>
              )}
            </div>

            {/* Weaknesses */}
            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-red-800">
                <ThumbsDown className="w-4 h-4" />
                Areas to Consider
              </h3>
              {accessory.key_weaknesses && accessory.key_weaknesses !== 'N/A' ? (
                <ul className="text-sm text-red-700 space-y-1.5">
                  {accessory.key_weaknesses.split(',').map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">!</span>
                      <span>{weakness.trim()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-red-600">No significant issues reported</p>
              )}
            </div>
          </div>

          {/* Customer Reviews */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Customer Reviews
            </h3>
            {hasReviews ? (
              <div className="space-y-3">
                {reviews.slice(0, 5).map((review, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <p className="text-sm text-gray-700 leading-relaxed">{review.trim()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No customer reviews available yet</p>
              </div>
            )}
          </div>

          {/* Compatibility Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-base font-semibold mb-2 text-blue-900">Compatible With:</h3>
            <p className="text-sm text-blue-700">{accessory.compatible_cars}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button className="flex-1" size="lg">
              <Package className="w-4 h-4 mr-2" />
              Buy Now
            </Button>
            <Button variant="outline" size="lg" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
