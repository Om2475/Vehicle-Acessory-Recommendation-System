import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, DollarSign, Package, ArrowRight, Sparkles, Heart, Zap, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Navbar from '../components/navbar';
import { getBrands, getModelsByBrand, validateUserProfile, type UserProfile } from '../lib/api';
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data from API
  const [brands, setBrands] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch brands on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandsData = await getBrands();
        setBrands(brandsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load brands. Please refresh the page.",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, [toast]);

  // Fetch models when brand changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!carBrand) {
        setAvailableModels([]);
        setCarModel('');
        return;
      }

      setLoadingModels(true);
      try {
        const models = await getModelsByBrand(carBrand);
        setAvailableModels(models);
        // Reset car model when brand changes
        setCarModel('');
      } catch (error) {
        console.error('Error fetching models:', error);
        toast({
          title: "Error",
          description: `Failed to load models for ${carBrand}. Please try again.`,
          variant: "destructive",
        });
        setAvailableModels([]);
      } finally {
        setLoadingModels(false);
      }
    };
    fetchModels();
  }, [carBrand, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build user profile - use default values for quality and sentiment
      const userProfile: any = {
        car_brand: carBrand,
        car_model: carModel.trim(), // Now required
        budget_min: parseInt(budgetMin),
        budget_max: parseInt(budgetMax),
        quality_threshold: 0, // Default: no minimum threshold
        sentiment_preference: 'any', // Default: accept all sentiments
        // Accept all emotions by default
        emotion_preference: ['Happy', 'Satisfied', 'Neutral', 'Frustrated', 'Disappointed'],
      };

      // Only add optional fields if they have values
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
                    <Select 
                      value={carModel} 
                      onValueChange={setCarModel} 
                      required
                      disabled={!carBrand || loadingModels}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={
                          !carBrand 
                            ? "First select a brand" 
                            : loadingModels 
                            ? "Loading models..." 
                            : "Select your car model"
                        } />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {availableModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {carBrand 
                        ? `${availableModels.length} model(s) available for ${carBrand}` 
                        : 'Select a brand first to see available models'}
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
                    <div className="space-y-2">
                      <Label htmlFor="searchQuery">Search Keywords (Optional)</Label>
                      <Input
                        id="searchQuery"
                        type="text"
                        placeholder="e.g., leather, waterproof, LED..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter keywords to find accessories with specific features or materials
                      </p>
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
