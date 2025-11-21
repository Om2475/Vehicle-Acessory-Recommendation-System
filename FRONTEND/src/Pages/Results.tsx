import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Star, Loader2, Heart, Sparkles, Award, CheckCircle2, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Navbar from '../components/navbar';
import AccessoryDetailModal from '../components/AccessoryDetailModal';
import { getSectionedRecommendations, formatPrice, formatScore, getQualityBadgeColor, getSentimentBadgeColor, type UserProfile, type AccessoryRecommendation } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { useWishlist } from '../context/WishlistContext';
import { toast as sonnerToast } from 'sonner';

interface ResultsProps {
  user: any;
}

export default function Results({ user }: ResultsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [loading, setLoading] = useState(true);
  const [exactMatchRecommendations, setExactMatchRecommendations] = useState<AccessoryRecommendation[]>([]);
  const [compatibleRecommendations, setCompatibleRecommendations] = useState<AccessoryRecommendation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<AccessoryRecommendation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleWishlist = (item: AccessoryRecommendation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist(item.accessory_id)) {
      removeFromWishlist(item.accessory_id);
      sonnerToast.success('Removed from wishlist');
    } else {
      addToWishlist(item);
      sonnerToast.success('Added to wishlist!');
    }
  };

  const handleViewDetails = (accessory: AccessoryRecommendation) => {
    setSelectedAccessory(accessory);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedAccessory(null), 300);
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const profileData = sessionStorage.getItem('userProfile');
        if (!profileData) {
          toast({
            title: "No profile found",
            description: "Please fill out the recommendation form first.",
            variant: "destructive",
          });
          navigate('/finder');
          return;
        }

        const profile: UserProfile = JSON.parse(profileData);
        setUserProfile(profile);

        const response = await getSectionedRecommendations(profile, 6, 6);
        
        if (response.success) {
          setExactMatchRecommendations(response.sections.exact_match.recommendations);
          setCompatibleRecommendations(response.sections.compatible.recommendations);
        } else {
          throw new Error('Failed to get recommendations');
        }
      } catch (error: any) {
        console.error('Error fetching recommendations:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to get recommendations. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [navigate, toast]);

  const handleBackToForm = () => {
    navigate('/finder');
  };

  const totalRecommendations = exactMatchRecommendations.length + compatibleRecommendations.length;

  // Recommendation Card Component
  const RecommendationCard = ({ 
    item, 
    index, 
    sectionType 
  }: { 
    item: AccessoryRecommendation; 
    index: number; 
    sectionType: 'exact' | 'compatible';
  }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              #{index + 1}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => handleToggleWishlist(item, e)}
            >
              <Heart 
                className={`h-4 w-4 ${isInWishlist(item.accessory_id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              />
            </Button>
          </div>
          <div className="flex flex-col items-end gap-1">
            {sectionType === 'exact' && (
              <Badge className="bg-green-600 text-white text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                EXACT MATCH
              </Badge>
            )}
            {sectionType === 'compatible' && (
              <Badge className="bg-blue-600 text-white text-xs">
                <Globe className="w-3 h-3 mr-1" />
                COMPATIBLE
              </Badge>
            )}
            <Badge className={`${getQualityBadgeColor(item.quality_score)} text-white text-xs`}>
              <Star className="w-3 h-3 mr-1" />
              {formatScore(item.quality_score)}
            </Badge>
            <Badge className={`${getSentimentBadgeColor(item.sentiment_score)} text-white text-xs`}>
              <Heart className="w-3 h-3 mr-1" />
              {formatScore(item.sentiment_score)}
            </Badge>
          </div>
        </div>
        
        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {item.accessory_name}
        </CardTitle>
        
        <div className="flex items-center gap-1 mt-2">
          <Award className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            {formatScore(item.final_score)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {item.compatibility_note && (
          <div className={`${sectionType === 'exact' ? 'bg-green-50 border-2 border-green-300' : 'bg-blue-50 border-2 border-blue-300'} rounded-lg p-3`}>
            <p className={`text-xs leading-relaxed ${sectionType === 'exact' ? 'text-green-700 font-medium' : 'text-blue-700'}`}>
              {item.compatibility_note}
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <span className="text-3xl font-bold text-primary">
            {formatPrice(item.price)}
          </span>
          
          <div className="text-sm text-muted-foreground">
            <p><strong>Brand:</strong> {item.car_brand}</p>
            <p><strong>Model:</strong> {item.car_model}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>

        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            variant="outline"
            onClick={() => handleViewDetails(item)}
          >
            <Package className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button 
            className="flex-1" 
            variant="default"
            onClick={() => navigate('/buy', { state: { accessory: item } })}
          >
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <Navbar user={user} />
        <div className="pt-24 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Finding Your Perfect Accessories...</h2>
                <p className="text-muted-foreground">
                  Our AI is analyzing 1,269 accessories with 47 features each
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <Navbar user={user} />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToForm}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Form
            </Button>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Personalized for {userProfile?.car_brand} {userProfile?.car_model || 'Owner'}
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold font-['Space_Grotesk']">
                Your TOP Recommendations
              </h1>
              
              <p className="text-lg text-muted-foreground">
                Personalized based on your car, budget, and preferences
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          {userProfile && (
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">{totalRecommendations}</div>
                  <p className="text-sm text-muted-foreground">Total Recommendations</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(userProfile.budget_min)} - {formatPrice(userProfile.budget_max)}
                  </div>
                  <p className="text-sm text-muted-foreground">Your Budget</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">
                    {exactMatchRecommendations.length > 0 ? formatScore(exactMatchRecommendations[0].final_score) : '-'}
                  </div>
                  <p className="text-sm text-muted-foreground">Top Match Score</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SECTION 1: Exact Match Accessories */}
          {exactMatchRecommendations.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6 bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-green-700">
                    Accessories for Your {userProfile?.car_brand} {userProfile?.car_model}
                  </h2>
                  <p className="text-sm text-green-600 mt-1">
                    ✅ These accessories are specifically designed for your car
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exactMatchRecommendations.map((item, index) => (
                  <RecommendationCard 
                    key={item.accessory_id} 
                    item={item} 
                    index={index} 
                    sectionType="exact" 
                  />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: Compatible/Universal Accessories */}
          {compatibleRecommendations.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <Globe className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-blue-700">
                    Other Compatible/Universal Accessories
                  </h2>
                  <p className="text-sm text-blue-600 mt-1">
                    🌐 These accessories are cross-compatible or universal fit
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {compatibleRecommendations.map((item, index) => (
                  <RecommendationCard 
                    key={item.accessory_id} 
                    item={item} 
                    index={index} 
                    sectionType="compatible" 
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {totalRecommendations === 0 && (
            <Card className="text-center p-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Recommendations Found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your budget range or quality threshold
              </p>
              <Button onClick={handleBackToForm}>
                Adjust Preferences
              </Button>
            </Card>
          )}

          {/* Call to Action */}
          {totalRecommendations > 0 && (
            <div className="mt-12 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-green-600 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                These recommendations are personalized just for you!
              </div>
              <div className="flex justify-center">
                <Button size="lg" onClick={handleBackToForm}>
                  Try Different Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AccessoryDetailModal
        accessory={selectedAccessory}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
