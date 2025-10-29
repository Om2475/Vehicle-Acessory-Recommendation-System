// ============================================================================
// API Integration Layer for Personalized Recommendation Engine
// Connects React Frontend to FastAPI Backend (ML_Engine/api.py)
// ============================================================================

const API_BASE_URL = 'http://localhost:8000';

// ==================== TYPE DEFINITIONS ====================

export interface AspectPriorities {
  Quality?: number;
  Durability?: number;
  Installation?: number;
  Design?: number;
  Compatibility?: number;
  Value?: number;
  Comfort?: number;
  Performance?: number;
}

export interface UserProfile {
  car_brand: string;
  car_model?: string;
  budget_min: number;
  budget_max: number;
  preferred_categories?: string[];
  quality_threshold?: number;
  sentiment_preference?: 'positive' | 'neutral' | 'negative' | 'any';
  emotion_preference?: string[] | string; // Backend expects array
  aspect_priorities?: AspectPriorities;
  search_query?: string;
}

export interface AccessoryRecommendation {
  accessory_id: string;
  accessory_name: string;
  car_brand: string;
  car_model: string;
  price: number;
  category: string;
  description: string;
  sentiment_score: number;
  sentiment_label: string;
  quality_score: number;
  dominant_emotion: string;
  final_score: number;
  explanation: string;
  compatible_cars: string;
  is_cross_compatible?: boolean;
  compatibility_note?: string;
  top_reviews?: string;
  key_strengths?: string;
  key_weaknesses?: string;
}

export interface RecommendationResponse {
  success: boolean;
  count: number;
  recommendations: AccessoryRecommendation[];
  score_breakdown?: {
    car_compatibility: number;
    content_similarity: number;
    quality_score: number;
    preference_match: number;
    emotion_alignment: number;
  };
  error?: string;
}

export interface RecommendationRequest {
  user_profile: UserProfile;
  top_n?: number;
}

export interface ApiStats {
  total_accessories: number;
  total_brands: number;
  total_categories: number;
  price_range: {
    min: number;
    max: number;
    mean: number;
  };
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  quality_stats: {
    mean: number;
    min: number;
    max: number;
  };
}

export interface BrandInfo {
  brand: string;
  accessory_count: number;
  avg_price: number;
  avg_sentiment: number;
  avg_quality: number;
}

export interface CategoryInfo {
  category: string;
  accessory_count: number;
  avg_price: number;
  avg_sentiment: number;
  avg_quality: number;
}

// ==================== API FUNCTIONS ====================

/**
 * Get recommendations based on user profile
 */
export async function getRecommendations(
  userProfile: UserProfile,
  topN: number = 6
): Promise<RecommendationResponse> {
  try {
    // Ensure emotion_preference is an array
    const emotionPref = Array.isArray(userProfile.emotion_preference) 
      ? userProfile.emotion_preference 
      : (typeof userProfile.emotion_preference === 'string' 
          ? [userProfile.emotion_preference] 
          : ['Happy', 'Satisfied']);

    const transformedProfile = {
      car_brand: userProfile.car_brand,
      car_model: userProfile.car_model || null,
      budget_min: userProfile.budget_min,
      budget_max: userProfile.budget_max,
      preferred_categories: userProfile.preferred_categories || [],
      quality_threshold: userProfile.quality_threshold ?? 0.3,
      sentiment_preference: userProfile.sentiment_preference || 'positive',
      emotion_preference: emotionPref,
      aspect_priorities: userProfile.aspect_priorities || null,
      search_query: userProfile.search_query || null,
    };

    console.log('Sending request:', transformedProfile);

    const response = await fetch(`${API_BASE_URL}/recommend?top_k=${topN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedProfile),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Received response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}

/**
 * Get overall system statistics
 */
export async function getStats(): Promise<ApiStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

/**
 * Get available brands
 */
export async function getBrands(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.brands;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
}

/**
 * Get available categories
 */
export async function getCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Get brand details
 */
export async function getBrandDetails(): Promise<BrandInfo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/brand-details`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.brands;
  } catch (error) {
    console.error('Error fetching brand details:', error);
    throw error;
  }
}

/**
 * Get category details
 */
export async function getCategoryDetails(): Promise<CategoryInfo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/category-details`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Error fetching category details:', error);
    throw error;
  }
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format price to Indian Rupees
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Get sentiment label and color
 */
export function getSentimentLabel(score: number): { label: string; color: string } {
  if (score >= 0.6) {
    return { label: 'Positive', color: 'text-green-600' };
  } else if (score >= 0.4) {
    return { label: 'Neutral', color: 'text-yellow-600' };
  } else {
    return { label: 'Negative', color: 'text-red-600' };
  }
}

/**
 * Get quality label and color
 */
export function getQualityLabel(score: number): { label: string; color: string } {
  if (score >= 0.8) {
    return { label: 'Excellent', color: 'text-green-600' };
  } else if (score >= 0.6) {
    return { label: 'Good', color: 'text-blue-600' };
  } else if (score >= 0.4) {
    return { label: 'Average', color: 'text-yellow-600' };
  } else {
    return { label: 'Below Average', color: 'text-red-600' };
  }
}

/**
 * Get quality badge color based on score
 */
export function getQualityBadgeColor(score: number): string {
  if (score >= 0.7) return 'bg-green-500';
  if (score >= 0.5) return 'bg-yellow-500';
  if (score >= 0.3) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Get sentiment badge color based on score
 */
export function getSentimentBadgeColor(score: number): string {
  if (score >= 0.5) return 'bg-green-500';
  if (score >= 0) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Format score as percentage
 */
export function formatScore(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

/**
 * Get default aspect priorities (all equal weight)
 */
export function getDefaultAspectPriorities(): AspectPriorities {
  return {
    Quality: 0.5,
    Durability: 0.5,
    Installation: 0.5,
    Design: 0.5,
    Compatibility: 0.5,
    Value: 0.5,
    Comfort: 0.5,
    Performance: 0.5,
  };
}

/**
 * Validate user profile
 */
export function validateUserProfile(profile: UserProfile): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!profile.car_brand || profile.car_brand.trim() === '') {
    errors.push('Car brand is required');
  }

  if (!profile.budget_min || profile.budget_min < 0) {
    errors.push('Minimum budget must be a positive number');
  }

  if (!profile.budget_max || profile.budget_max <= 0) {
    errors.push('Maximum budget must be greater than 0');
  }

  if (profile.budget_min && profile.budget_max && profile.budget_min > profile.budget_max) {
    errors.push('Minimum budget cannot be greater than maximum budget');
  }

  if (profile.quality_threshold && (profile.quality_threshold < 0 || profile.quality_threshold > 1)) {
    errors.push('Quality threshold must be between 0 and 1');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  getRecommendations,
  getStats,
  getBrands,
  getCategories,
  getBrandDetails,
  getCategoryDetails,
  healthCheck,
  formatPrice,
  getSentimentLabel,
  getQualityLabel,
  validateUserProfile,
  getQualityBadgeColor,
  getSentimentBadgeColor,
  formatScore,
  getDefaultAspectPriorities,
};
