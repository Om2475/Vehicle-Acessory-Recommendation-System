import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, DollarSign, Star, Loader2, Heart, Sparkles, TrendingUp, Award, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import Navbar from '../components/navbar';
import AccessoryDetailModal from '../components/AccessoryDetailModal';
import { getRecommendations, formatPrice, formatScore, getQualityBadgeColor, getSentimentBadgeColor, type UserProfile, type AccessoryRecommendation, type RecommendationResponse } from '../lib/api';
import { useToast } from '../hooks/use-toast';

interface ResultsProps {
  user: any;
}

export default function Results({ user }: ResultsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<AccessoryRecommendation[]>([]);
  const [scoreBreakdown, setScoreBreakdown] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<AccessoryRecommendation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (accessory: AccessoryRecommendation) => {
    setSelectedAccessory(accessory);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedAccessory(null), 300); // Wait for animation
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Get user profile from session storage
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
        console.log('Loaded profile from session storage:', profile);
        setUserProfile(profile);

        // Get recommendations from API
        const response: RecommendationResponse = await getRecommendations(profile, 6);
        console.log('Got response:', response);
        
        if (response.success && response.recommendations) {
          setRecommendations(response.recommendations);
          setScoreBreakdown(response.score_breakdown);
        } else {
          throw new Error(response.error || 'Failed to get recommendations');
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
                  Our AI is analyzing 1,739 accessories with 43 features each
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
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">{recommendations.length}</div>
                  <p className="text-sm text-muted-foreground">Recommendations</p>
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
                    {recommendations.length > 0 ? formatScore(recommendations[0].final_score) : '-'}
                  </div>
                  <p className="text-sm text-muted-foreground">Top Match Score</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">
                    {userProfile.preferred_categories?.length || 'All'}
                  </div>
                  <p className="text-sm text-muted-foreground">Categories Selected</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recommendations Grid */}
          {recommendations.length === 0 ? (
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
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((item, index) => (
                <Card key={item.accessory_id} className="group hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div className="flex flex-col items-end gap-1">
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
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          {formatScore(item.final_score)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Cross-Compatibility Badge - SHOW FIRST AND PROMINENTLY */}
                    {item.is_cross_compatible && item.compatibility_note && (
                      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 flex items-start gap-3 shadow-sm">
                        <div className="flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-amber-800 mb-1">CROSS-MODEL COMPATIBILITY</p>
                          <p className="text-xs text-amber-700 leading-relaxed line-clamp-2">
                            {item.compatibility_note}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold text-primary">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Brand:</strong> {item.car_brand}</p>
                        <p><strong>Model:</strong> {item.car_model}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>

                    <Button 
                      className="w-full" 
                      variant="default"
                      onClick={() => handleViewDetails(item)}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      View Full Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Score Breakdown - Shown AFTER all accessories */}
          {scoreBreakdown && (
            <Card className="mt-12 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Personalization Score Breakdown
                </CardTitle>
                <CardDescription>
                  How we calculated your personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{formatScore(scoreBreakdown.car_compatibility)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Car Match</p>
                    <p className="text-xs text-muted-foreground">(25% weight)</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{formatScore(scoreBreakdown.content_similarity)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Content Similarity</p>
                    <p className="text-xs text-muted-foreground">(20% weight)</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{formatScore(scoreBreakdown.quality_score)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Quality & Sentiment</p>
                    <p className="text-xs text-muted-foreground">(25% weight)</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{formatScore(scoreBreakdown.preference_match)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Preference Match</p>
                    <p className="text-xs text-muted-foreground">(20% weight)</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{formatScore(scoreBreakdown.emotion_alignment)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Emotion Alignment</p>
                    <p className="text-xs text-muted-foreground">(10% weight)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          {recommendations.length > 0 && (
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
