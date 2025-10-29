import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, DollarSign, Package, ArrowRight, Sparkles, Heart, Zap, Shield, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import Navbar from '../components/navbar';
import { getBrands, getCategories, validateUserProfile, getDefaultAspectPriorities, type UserProfile, type AspectPriorities } from '../lib/api';
import { useToast } from '../hooks/use-toast';

interface RecommendationFinderProps {
  user: any;
}

export default function RecommendationFinder({ user }: RecommendationFinderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [budgetMin, setBudgetMin] = useState('500');
  const [budgetMax, setBudgetMax] = useState('10000');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [qualityThreshold, setQualityThreshold] = useState(0.3);
  const [sentimentPreference, setSentimentPreference] = useState<'positive' | 'neutral' | 'negative' | 'any'>('positive');
  const [emotionPreference, setEmotionPreference] = useState<'Happy' | 'Satisfied' | 'Neutral' | 'Frustrated' | 'Disappointed' | 'any'>('any');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aspectPriorities, setAspectPriorities] = useState<AspectPriorities>(getDefaultAspectPriorities());
  const [searchQuery, setSearchQuery] = useState('');

  // Data from API
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch brands and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsData, categoriesData] = await Promise.all([
          getBrands(),
          getCategories()
        ]);
        setBrands(brandsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load brands and categories. Please refresh the page.",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, [toast]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAspectPriorityChange = (aspect: keyof AspectPriorities, value: number) => {
    setAspectPriorities(prev => ({
      ...prev,
      [aspect]: value / 100, // Convert slider value (0-100) to 0-1
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build user profile - remove undefined values
      const userProfile: any = {
        car_brand: carBrand,
        car_model: carModel.trim(), // Now required
        budget_min: parseInt(budgetMin),
        budget_max: parseInt(budgetMax),
        preferred_categories: selectedCategories.length > 0 ? selectedCategories : [],
        quality_threshold: qualityThreshold,
        sentiment_preference: sentimentPreference,
        // Convert emotion_preference to array for backend
        emotion_preference: emotionPreference === 'any' 
          ? ['Happy', 'Satisfied', 'Neutral', 'Frustrated', 'Disappointed'] 
          : [emotionPreference],
      };

      // Only add optional fields if they have values
      if (showAdvanced && aspectPriorities) {
        userProfile.aspect_priorities = aspectPriorities;
      }
      
      if (searchQuery && searchQuery.trim()) {
        userProfile.search_query = searchQuery.trim();
      }

      // Validate profile
      const validation = validateUserProfile(userProfile);
      if (!validation.valid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Store in session storage and navigate
      sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
      navigate('/results');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <Navbar user={user} />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Personalization
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold font-['Space_Grotesk'] mb-4">
              Find Your Perfect Accessories
            </h1>
            <p className="text-lg text-muted-foreground">
              Answer a few questions and get TOP personalized recommendations
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Vehicle Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Vehicle Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="carBrand">Car Brand *</Label>
                    <Select value={carBrand} onValueChange={setCarBrand} required>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select your car brand" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {brands.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carModel">Car Model *</Label>
                    <Input
                      id="carModel"
                      type="text"
                      placeholder="e.g., Camry, Civic, Q3, Nexon, etc."
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      className="h-12"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Specify your car model for accurate recommendations
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Budget Range
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Minimum Budget (₹) *</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      min="100"
                      step="100"
                      placeholder="500"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Maximum Budget (₹) *</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      min="100"
                      step="100"
                      placeholder="10000"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Price range: ₹{parseInt(budgetMin || '0').toLocaleString('en-IN')} - ₹{parseInt(budgetMax || '0').toLocaleString('en-IN')}
                </p>
              </div>

              {/* Categories */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Preferred Categories
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select categories you're interested in (leave empty for all)
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <Label
                        htmlFor={category}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality & Sentiment */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Quality & Sentiment Preferences
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="qualityThreshold">
                      Minimum Quality Threshold: {(qualityThreshold * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      id="qualityThreshold"
                      min={0}
                      max={100}
                      step={5}
                      value={[qualityThreshold * 100]}
                      onValueChange={([value]) => setQualityThreshold(value / 100)}
                      className="py-4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Only show accessories with quality score above this threshold
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sentimentPreference">Sentiment Preference</Label>
                      <Select value={sentimentPreference} onValueChange={(value: any) => setSentimentPreference(value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="positive">Positive reviews only</SelectItem>
                          <SelectItem value="neutral">Neutral reviews</SelectItem>
                          <SelectItem value="negative">Show all (including negative)</SelectItem>
                          <SelectItem value="any">Any sentiment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emotionPreference">Emotion Preference</Label>
                      <Select value={emotionPreference} onValueChange={(value: any) => setEmotionPreference(value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any emotion</SelectItem>
                          <SelectItem value="Happy">😊 Happy</SelectItem>
                          <SelectItem value="Satisfied">✅ Satisfied</SelectItem>
                          <SelectItem value="Neutral">😐 Neutral</SelectItem>
                          <SelectItem value="Frustrated">😤 Frustrated</SelectItem>
                          <SelectItem value="Disappointed">😞 Disappointed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full h-12"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </Button>

                {showAdvanced && (
                  <div className="space-y-6 p-6 bg-secondary/20 rounded-lg border border-border">
                    <h3 className="font-semibold">Aspect Priorities</h3>
                    <p className="text-sm text-muted-foreground">
                      Adjust importance of different aspects (0% = not important, 100% = very important)
                    </p>
                    
                    {Object.keys(aspectPriorities).map((aspect) => (
                      <div key={aspect} className="space-y-2">
                        <Label>
                          {aspect}: {((aspectPriorities[aspect as keyof AspectPriorities] || 0) * 100).toFixed(0)}%
                        </Label>
                        <Slider
                          min={0}
                          max={100}
                          step={10}
                          value={[(aspectPriorities[aspect as keyof AspectPriorities] || 0) * 100]}
                          onValueChange={([value]) => handleAspectPriorityChange(aspect as keyof AspectPriorities, value)}
                        />
                      </div>
                    ))}

                    <div className="space-y-2 pt-4">
                      <Label htmlFor="searchQuery">Search Keywords (Optional)</Label>
                      <Input
                        id="searchQuery"
                        type="text"
                        placeholder="e.g., leather, waterproof, LED..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-semibold"
                disabled={loading || !carBrand || !carModel || !budgetMin || !budgetMax}
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Get My Personalized Recommendations
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Advanced sentiment analysis & emotion detection
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Personalized</h3>
              <p className="text-sm text-muted-foreground">
                Each user gets unique recommendations
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Fast & Accurate</h3>
              <p className="text-sm text-muted-foreground">
                Get TOP best matches in under 300ms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
