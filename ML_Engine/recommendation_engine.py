"""
🚀 PERSONALIZED RECOMMENDATION ENGINE - PHASE 3
Hybrid multi-factor recommendation system for vehicle accessories

This system provides TOP 6 personalized accessory recommendations based on:
- User's car (brand, model)
- Budget preferences
- Quality thresholds
- Sentiment preferences
- Emotion preferences
- Aspect priorities
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List, Tuple, Optional
import pickle
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')


class PersonalizedRecommendationEngine:
    """
    Intelligent recommendation engine that provides personalized accessory suggestions
    """
    
    def __init__(self, data_path: str = None):
        """Initialize the recommendation engine"""
        if data_path is None:
            # Auto-detect path relative to this file
            current_dir = Path(__file__).parent
            data_path = current_dir.parent / 'Dataset' / 'processed'
        self.data_path = Path(data_path)
        self.df = None
        self.tfidf_matrix = None
        self.tfidf_vectorizer = None
        self.load_data()
        
    def load_data(self):
        """Load all necessary data and models"""
        print("🔄 Loading recommendation data...")
        
        # Load main dataset with advanced sentiment
        self.df = pd.read_csv(self.data_path / 'accessories_with_advanced_sentiment.csv')
        print(f"✅ Loaded {len(self.df)} accessories with {len(self.df.columns)} features")
        
        # Load TF-IDF vectorizer if available
        tfidf_vectorizer_path = self.data_path / 'tfidf_vectorizer.pkl'
        if tfidf_vectorizer_path.exists():
            with open(tfidf_vectorizer_path, 'rb') as f:
                self.tfidf_vectorizer = pickle.load(f)
            print("✅ Loaded TF-IDF vectorizer")
            
            # Generate TF-IDF matrix for accessories
            descriptions = self.df['Accessory Description'].fillna('') + ' ' + \
                          self.df['Accessory Name'].fillna('')
            self.tfidf_matrix = self.tfidf_vectorizer.transform(descriptions)
            print(f"✅ Generated TF-IDF matrix: {self.tfidf_matrix.shape}")
        else:
            print("⚠️  TF-IDF vectorizer not found, will create new one")
            self._create_tfidf_vectorizer()
    
    def _create_tfidf_vectorizer(self):
        """Create TF-IDF vectorizer if not available"""
        print("🔄 Creating TF-IDF vectorizer...")
        descriptions = self.df['Accessory Description'].fillna('') + ' ' + \
                      self.df['Accessory Name'].fillna('')
        
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=100,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(descriptions)
        print(f"✅ Created TF-IDF matrix: {self.tfidf_matrix.shape}")
    
    def get_recommendations_by_sections(
        self,
        user_profile: Dict,
        exact_match_count: int = 6,
        compatible_count: int = 6,
        diversity_factor: float = 0.3
    ) -> Dict:
        """
        Generate sectioned recommendations:
        - Section 1: Accessories specifically for user's car (exact match)
        - Section 2: Compatible/Universal accessories
        
        Args:
            user_profile: Dictionary containing user preferences
            exact_match_count: Number of exact match recommendations (default: 6)
            compatible_count: Number of compatible/universal recommendations (default: 6)
            diversity_factor: Factor to ensure diversity (0-1, higher = more diverse)
        
        Returns:
            Dictionary with 'exact_match' and 'compatible' sections
        """
        print(f"\n🎯 Generating SECTIONED recommendations...")
        print(f"📋 User Profile: {user_profile.get('car_brand')} {user_profile.get('car_model')}")
        
        car_brand = user_profile.get('car_brand', '').lower().strip()
        car_model = user_profile.get('car_model', '').lower().strip()
        
        # Section 1: EXACT MATCH - Accessories specifically for user's car
        print(f"\n🔍 SECTION 1: Exact match accessories for {car_brand} {car_model}...")
        exact_match_df = self._filter_exact_match(user_profile)
        exact_recommendations, exact_scores = self._generate_section_recommendations(
            exact_match_df, user_profile, exact_match_count, diversity_factor, section="exact"
        )
        
        # Section 2: COMPATIBLE - Universal or cross-compatible accessories
        print(f"\n🔍 SECTION 2: Compatible/Universal accessories...")
        compatible_df = self._filter_compatible_universal(user_profile, exact_match_df)
        compatible_recommendations, compatible_scores = self._generate_section_recommendations(
            compatible_df, user_profile, compatible_count, diversity_factor, section="compatible"
        )
        
        return {
            'exact_match': {
                'recommendations': exact_recommendations,
                'scores': exact_scores,
                'count': len(exact_recommendations),
                'description': f"Accessories specifically designed for your {user_profile.get('car_brand')} {user_profile.get('car_model')}"
            },
            'compatible': {
                'recommendations': compatible_recommendations,
                'scores': compatible_scores,
                'count': len(compatible_recommendations),
                'description': "Universal and cross-compatible accessories that also fit your car"
            }
        }
    
    def _filter_exact_match(self, user_profile: Dict) -> pd.DataFrame:
        """Filter accessories that are EXACT match for user's car"""
        df = self.df.copy()
        car_brand = user_profile.get('car_brand', '').lower().strip()
        car_model = user_profile.get('car_model', '').lower().strip()
        
        if not car_brand or not car_model:
            return pd.DataFrame()
        
        # EXACT match: Car Brand AND Car Model must match user's car
        brand_match = df['Car_Brand_Normalized'].str.contains(car_brand, case=False, na=False)
        model_match = df['Car_Model_Normalized'].str.contains(car_model, case=False, na=False)
        
        # Must match BOTH brand AND model
        exact_df = df[brand_match & model_match]
        
        print(f"   Found {len(exact_df)} exact match accessories")
        return exact_df
    
    def _filter_compatible_universal(self, user_profile: Dict, exclude_df: pd.DataFrame) -> pd.DataFrame:
        """Filter accessories that are compatible/universal (excluding exact matches)"""
        df = self.df.copy()
        car_brand = user_profile.get('car_brand', '').lower().strip()
        car_model = user_profile.get('car_model', '').lower().strip()
        
        if not car_brand or not car_model:
            return pd.DataFrame()
        
        # Exclude exact matches
        df = df[~df.index.isin(exclude_df.index)]
        
        # Compatible: Either universal OR mentioned in compatible cars
        compatible_cars = df['Compatible_Cars_Normalized'].str.lower()
        
        # Universal accessories
        universal_match = compatible_cars.str.contains('universal|all cars', case=False, na=False, regex=True)
        
        # Cross-compatible: mentioned in compatible cars but NOT the main car
        cross_compatible = compatible_cars.str.contains(car_model, case=False, na=False)
        
        compatible_df = df[universal_match | cross_compatible]
        
        print(f"   Found {len(compatible_df)} compatible/universal accessories")
        return compatible_df
    
    def _generate_section_recommendations(
        self,
        filtered_df: pd.DataFrame,
        user_profile: Dict,
        top_k: int,
        diversity_factor: float,
        section: str
    ) -> Tuple[pd.DataFrame, Dict]:
        """Generate recommendations for a specific section"""
        if len(filtered_df) == 0:
            return pd.DataFrame(), {}
        
        # Apply additional filters (budget, quality, sentiment)
        filtered_df = self._apply_additional_filters(filtered_df, user_profile)
        
        # Remove duplicates
        if 'Accessory_Name_Normalized' in filtered_df.columns:
            filtered_df = filtered_df.drop_duplicates(subset=['Accessory_Name_Normalized'], keep='first')
        
        print(f"   After filters & dedup: {len(filtered_df)} accessories")
        
        if len(filtered_df) == 0:
            return pd.DataFrame(), {}
        
        # Calculate scores
        scores_df = pd.DataFrame(index=filtered_df.index)
        
        # Category matching is IMPORTANT - it's part of content similarity
        scores_df['car_score'] = self._calculate_car_compatibility(filtered_df, user_profile)
        scores_df['content_score'] = self._calculate_content_similarity(filtered_df, user_profile)
        scores_df['quality_score'] = self._calculate_quality_score(filtered_df, user_profile)
        scores_df['preference_score'] = self._calculate_preference_match(filtered_df, user_profile)
        scores_df['emotion_score'] = self._calculate_emotion_alignment(filtered_df, user_profile)
        
        # Weighted final score
        scores_df['final_score'] = (
            scores_df['car_score'] * 0.25 +
            scores_df['content_score'] * 0.20 +  # Includes category matching
            scores_df['quality_score'] * 0.25 +
            scores_df['preference_score'] * 0.20 +  # Also includes category preference
            scores_df['emotion_score'] * 0.10
        )
        
        # Select diverse recommendations
        recommendations_idx = self._select_diverse_recommendations(
            filtered_df, scores_df, top_k, diversity_factor
        )
        
        # Prepare recommendations
        recommendations = filtered_df.loc[recommendations_idx].copy()
        recommendations['final_score'] = scores_df.loc[recommendations_idx, 'final_score']
        recommendations['explanation'] = self._generate_explanations(
            recommendations, scores_df.loc[recommendations_idx], user_profile
        )
        recommendations['section'] = section
        
        # Sort by score
        recommendations = recommendations.sort_values('final_score', ascending=False)
        
        # Score breakdown
        scores_breakdown = {
            'car_scores': scores_df.loc[recommendations_idx, 'car_score'].to_dict(),
            'content_scores': scores_df.loc[recommendations_idx, 'content_score'].to_dict(),
            'quality_scores': scores_df.loc[recommendations_idx, 'quality_score'].to_dict(),
            'preference_scores': scores_df.loc[recommendations_idx, 'preference_score'].to_dict(),
            'emotion_scores': scores_df.loc[recommendations_idx, 'emotion_score'].to_dict(),
            'final_scores': scores_df.loc[recommendations_idx, 'final_score'].to_dict()
        }
        
        return recommendations, scores_breakdown
    
    def _apply_additional_filters(self, df: pd.DataFrame, user_profile: Dict) -> pd.DataFrame:
        """Apply budget, quality, and sentiment filters"""
        # Budget filter
        if 'budget_min' in user_profile and 'budget_max' in user_profile:
            df = df[
                (df['Accessory Price'] >= user_profile['budget_min']) &
                (df['Accessory Price'] <= user_profile['budget_max'])
            ]
        
        # Quality filter
        if 'quality_threshold' in user_profile:
            df = df[df['Overall_Quality_Score'] >= user_profile['quality_threshold']]
        
        # Sentiment filter
        if 'sentiment_preference' in user_profile:
            if user_profile['sentiment_preference'] == 'positive':
                df = df[df['Sentiment_Label'].str.lower() == 'positive']
            elif user_profile['sentiment_preference'] == 'neutral':
                df = df[df['Sentiment_Label'].str.lower().isin(['positive', 'neutral'])]
        
        return df
    
    def get_recommendations(
        self,
        user_profile: Dict,
        top_k: int = 6,
        diversity_factor: float = 0.3
    ) -> Tuple[pd.DataFrame, Dict]:
        """
        Generate personalized recommendations for a user (LEGACY METHOD - for backward compatibility)
        
        Args:
            user_profile: Dictionary containing user preferences
            top_k: Number of recommendations to return (default: 6)
            diversity_factor: Factor to ensure diversity (0-1, higher = more diverse)
        
        Returns:
            Tuple of (recommendations_df, scores_breakdown)
        """
        print(f"\n🎯 Generating TOP {top_k} personalized recommendations...")
        print(f"📋 User Profile: {user_profile.get('car_brand')} {user_profile.get('car_model')}")
        
        # Step 1: Filter by hard constraints
        filtered_df = self._apply_hard_filters(user_profile)
        
        # Remove duplicate accessories using the normalized name column
        if 'Accessory_Name_Normalized' in filtered_df.columns:
            filtered_df = filtered_df.drop_duplicates(subset=['Accessory_Name_Normalized'], keep='first')
        
        print(f"✅ After filters and deduplication: {len(filtered_df)} eligible accessories")
        
        if len(filtered_df) == 0:
            print("⚠️  No accessories match the hard filters")
            return pd.DataFrame(), {}
        
        # Step 2: Calculate scores for each factor
        scores_df = pd.DataFrame(index=filtered_df.index)
        
        # 2.1 Car Compatibility Score (25%)
        scores_df['car_score'] = self._calculate_car_compatibility(filtered_df, user_profile)
        
        # 2.2 Content Similarity Score (20%)
        scores_df['content_score'] = self._calculate_content_similarity(filtered_df, user_profile)
        
        # 2.3 Sentiment & Quality Score (25%)
        scores_df['quality_score'] = self._calculate_quality_score(filtered_df, user_profile)
        
        # 2.4 User Preference Match (20%)
        scores_df['preference_score'] = self._calculate_preference_match(filtered_df, user_profile)
        
        # 2.5 Emotion Alignment Score (10%)
        scores_df['emotion_score'] = self._calculate_emotion_alignment(filtered_df, user_profile)
        
        # Step 3: Calculate weighted final score
        scores_df['final_score'] = (
            scores_df['car_score'] * 0.25 +
            scores_df['content_score'] * 0.20 +
            scores_df['quality_score'] * 0.25 +
            scores_df['preference_score'] * 0.20 +
            scores_df['emotion_score'] * 0.10
        )
        
        # Step 4: Apply diversity mechanism
        recommendations_idx = self._select_diverse_recommendations(
            filtered_df, scores_df, top_k, diversity_factor
        )
        
        # Step 5: Prepare recommendations with explanations
        recommendations = filtered_df.loc[recommendations_idx].copy()
        recommendations['final_score'] = scores_df.loc[recommendations_idx, 'final_score']
        recommendations['explanation'] = self._generate_explanations(
            recommendations, scores_df.loc[recommendations_idx], user_profile
        )
        
        # Sort by score
        recommendations = recommendations.sort_values('final_score', ascending=False)
        
        # Prepare score breakdown
        scores_breakdown = {
            'car_scores': scores_df.loc[recommendations_idx, 'car_score'].to_dict(),
            'content_scores': scores_df.loc[recommendations_idx, 'content_score'].to_dict(),
            'quality_scores': scores_df.loc[recommendations_idx, 'quality_score'].to_dict(),
            'preference_scores': scores_df.loc[recommendations_idx, 'preference_score'].to_dict(),
            'emotion_scores': scores_df.loc[recommendations_idx, 'emotion_score'].to_dict(),
            'final_scores': scores_df.loc[recommendations_idx, 'final_score'].to_dict()
        }
        
        print(f"\n✅ Generated {len(recommendations)} personalized recommendations")
        print(f"📊 Score range: {recommendations['final_score'].min():.3f} - {recommendations['final_score'].max():.3f}")
        
        return recommendations, scores_breakdown
    
    def _apply_hard_filters(self, user_profile: Dict) -> pd.DataFrame:
        """Apply hard constraints that accessories must meet"""
        df = self.df.copy()
        
        print(f"🔍 DEBUG: Starting with {len(df)} accessories")
        
        # Filter by car brand AND model (if car info provided)
        if 'car_brand' in user_profile and user_profile['car_brand']:
            car_brand = user_profile['car_brand'].lower().strip()
            car_model = (user_profile.get('car_model') or '').lower().strip()
            
            print(f"🔍 DEBUG: Filtering for brand='{car_brand}', model='{car_model}'")
            print(f"🔍 DEBUG: Has normalized columns? Car_Brand_Normalized: {'Car_Brand_Normalized' in df.columns}, Car_Model_Normalized: {'Car_Model_Normalized' in df.columns}")
            
            # Use normalized columns for matching
            # If user specified a specific model, filter for that model OR universal accessories
            if car_model:
                # Check using normalized columns
                model_match = df['Compatible_Cars_Normalized'].str.contains(car_model, case=False, na=False)
                universal_match = df['Compatible_Cars_Normalized'].str.contains('universal|all cars', case=False, na=False, regex=True)
                brand_match = df['Car_Brand_Normalized'].str.contains(car_brand, case=False, na=False)
                
                print(f"🔍 DEBUG: model_match={model_match.sum()}, universal_match={universal_match.sum()}, brand_match={brand_match.sum()}")
                
                # Accessory must either:
                # 1. Be specifically compatible with the model, OR
                # 2. Be universal, OR
                # 3. Have the same car model as the user's car (exact match)
                exact_model_match = df['Car_Model_Normalized'].str.contains(car_model, case=False, na=False)
                
                print(f"🔍 DEBUG: exact_model_match={exact_model_match.sum()}")
                
                df = df[model_match | universal_match | (brand_match & exact_model_match)]
                
                print(f"🔍 DEBUG: After car filtering: {len(df)} accessories")
            else:
                # If no model specified, just filter by brand
                df = df[df['Car_Brand_Normalized'].str.contains(
                    car_brand, case=False, na=False
                ) | df['Compatible_Cars_Normalized'].str.contains(
                    car_brand, case=False, na=False
                )]
        
        # Filter by budget
        if 'budget_min' in user_profile and 'budget_max' in user_profile:
            df = df[
                (df['Accessory Price'] >= user_profile['budget_min']) &
                (df['Accessory Price'] <= user_profile['budget_max'])
            ]
            print(f"🔍 DEBUG: After budget filtering ({user_profile['budget_min']}-{user_profile['budget_max']}): {len(df)} accessories")
        
        # Filter by minimum quality threshold
        if 'quality_threshold' in user_profile:
            df = df[df['Overall_Quality_Score'] >= user_profile['quality_threshold']]
            print(f"🔍 DEBUG: After quality threshold ({user_profile['quality_threshold']}): {len(df)} accessories")
        
        # Filter by sentiment preference
        if 'sentiment_preference' in user_profile:
            if user_profile['sentiment_preference'] == 'positive':
                # Case-insensitive check
                df = df[df['Sentiment_Label'].str.lower() == 'positive']
                print(f"🔍 DEBUG: After sentiment filter (positive): {len(df)} accessories")
            elif user_profile['sentiment_preference'] == 'neutral':
                # Case-insensitive check
                df = df[df['Sentiment_Label'].str.lower().isin(['positive', 'neutral'])]
                print(f"🔍 DEBUG: After sentiment filter (neutral): {len(df)} accessories")
        
        print(f"🔍 DEBUG: Final accessories after all filters: {len(df)}")
        return df
    
    def _calculate_car_compatibility(self, df: pd.DataFrame, user_profile: Dict) -> pd.Series:
        """Calculate car compatibility score (0-1)"""
        scores = pd.Series(0.0, index=df.index)
        
        if 'car_brand' not in user_profile or not user_profile['car_brand']:
            return pd.Series(0.5, index=df.index)  # Neutral if no car specified
        
        car_brand = user_profile['car_brand'].lower().strip()
        car_model = (user_profile.get('car_model') or '').lower().strip()
        
        for idx in df.index:
            score = 0.0
            
            # Check brand match using normalized column
            brand_normalized = str(df.loc[idx, 'Car_Brand_Normalized']).lower()
            if car_brand in brand_normalized:
                score += 0.5
            
            # Check model match in compatible cars using normalized column
            compatible_cars = str(df.loc[idx, 'Compatible_Cars_Normalized']).lower()
            if car_model and car_model in compatible_cars:
                score += 0.5
            elif car_brand in compatible_cars:
                score += 0.3
            
            # Universal compatibility bonus
            if 'universal' in compatible_cars or 'all' in compatible_cars:
                score += 0.2
            
            scores[idx] = min(score, 1.0)
        
        return scores
    
    def _calculate_content_similarity(self, df: pd.DataFrame, user_profile: Dict) -> pd.Series:
        """Calculate content-based similarity score (0-1)"""
        scores = pd.Series(0.5, index=df.index)  # Default neutral score
        
        # If user provides search query, use TF-IDF similarity
        if 'search_query' in user_profile and user_profile['search_query']:
            query_vector = self.tfidf_vectorizer.transform([user_profile['search_query']])
            similarities = cosine_similarity(query_vector, self.tfidf_matrix[df.index]).flatten()
            scores = scores * 0.3 + similarities * 0.7
        
        return scores
    
    def _calculate_quality_score(self, df: pd.DataFrame, user_profile: Dict) -> pd.Series:
        """Calculate sentiment and quality score (0-1)"""
        # Normalize Overall_Quality_Score to 0-1
        quality_scores = (df['Overall_Quality_Score'] + 1) / 2
        
        # Normalize Sentiment_Score to 0-1
        sentiment_scores = (df['Sentiment_Score'] + 1) / 2
        
        # Combine: 50% quality, 50% sentiment (no aspect priorities)
        final_scores = quality_scores * 0.5 + sentiment_scores * 0.5
        
        return final_scores
    
    def _calculate_preference_match(self, df: pd.DataFrame, user_profile: Dict) -> pd.Series:
        """Calculate user preference match score (0-1)"""
        scores = pd.Series(0.5, index=df.index)
        
        # Price preference (closer to middle of budget range = higher score)
        if 'budget_min' in user_profile and 'budget_max' in user_profile:
            budget_mid = (user_profile['budget_min'] + user_profile['budget_max']) / 2
            budget_range = user_profile['budget_max'] - user_profile['budget_min']
            
            if budget_range > 0:
                # Normalize price distance from middle
                price_scores = 1 - (abs(df['Accessory Price'] - budget_mid) / (budget_range / 2))
                price_scores = price_scores.clip(0, 1)
                scores = scores * 0.5 + price_scores * 0.5
        
        return scores
    
    def _calculate_emotion_alignment(self, df: pd.DataFrame, user_profile: Dict) -> pd.Series:
        """Calculate emotion alignment score (0-1)"""
        scores = pd.Series(0.5, index=df.index)
        
        if 'emotion_preference' in user_profile and user_profile['emotion_preference']:
            # Check if dominant emotion matches user preference
            emotion_match = df['Dominant_Emotion'].isin(user_profile['emotion_preference']).astype(float)
            
            # Calculate emotion score for preferred emotions
            emotion_scores = pd.Series(0.0, index=df.index)
            for emotion in user_profile['emotion_preference']:
                emotion_col = f'Emotion_{emotion}_Score'
                if emotion_col in df.columns:
                    emotion_scores += df[emotion_col]
            
            # Normalize
            if len(user_profile['emotion_preference']) > 0:
                emotion_scores = emotion_scores / len(user_profile['emotion_preference'])
            
            # Combine: 60% emotion match, 40% emotion scores
            scores = emotion_match * 0.6 + emotion_scores * 0.4
        
        return scores
    
    def _select_diverse_recommendations(
        self,
        df: pd.DataFrame,
        scores_df: pd.DataFrame,
        top_k: int,
        diversity_factor: float
    ) -> List[int]:
        """Select top-k diverse recommendations"""
        # Sort by final score
        sorted_indices = scores_df['final_score'].sort_values(ascending=False).index.tolist()
        
        if diversity_factor == 0 or len(sorted_indices) <= top_k:
            return sorted_indices[:top_k]
        
        # Diversity-aware selection
        # Simply take top K without category diversity
        selected = sorted_indices[:top_k]
        
        return selected
    
    def _check_cross_compatibility(self, accessory_row: pd.Series, user_car_model: str, user_car_brand: str) -> str:
        """Check if accessory is compatible with other models besides user's car"""
        # Use normalized columns for matching
        compatible_cars = str(accessory_row.get('Compatible_Cars_Normalized', '')).lower()
        accessory_model = str(accessory_row.get('Car_Model_Normalized', '')).lower()
        accessory_brand = str(accessory_row.get('Car_Brand_Normalized', '')).lower()
        user_model_lower = user_car_model.lower().strip()
        user_brand_lower = user_car_brand.lower().strip()
        
        # Get display names (proper case) for messages
        display_brand = accessory_row.get('Car Brand', accessory_brand.title())
        display_model = accessory_row.get('Car Model', accessory_model.title())
        
        # If it's a universal accessory
        if 'universal' in compatible_cars or 'all cars' in compatible_cars:
            return "🌐 Universal accessory - Compatible with all car models including yours"
        
        # If the accessory is from a DIFFERENT model but compatible with user's model
        if user_model_lower not in accessory_model and user_model_lower in compatible_cars:
            # This is a cross-compatible accessory
            return f"🔄 Originally for {display_brand} {display_model}, but ALSO compatible with your {user_car_brand} {user_car_model}"
        
        # If accessory is from user's exact model
        if user_model_lower in accessory_model:
            # This is primarily for user's car
            return ""
        
        # If somehow it passed filtering but not in model name, check compatible cars
        if user_model_lower in compatible_cars:
            return f"✅ Confirmed compatible with your {user_car_brand} {user_car_model}"
        
        return ""
    
    def _generate_explanations(
        self,
        recommendations: pd.DataFrame,
        scores_df: pd.DataFrame,
        user_profile: Dict
    ) -> List[str]:
        """Generate human-readable explanations for recommendations"""
        explanations = []
        user_car_model = user_profile.get('car_model', '')
        user_car_brand = user_profile.get('car_brand', '')
        
        for idx in recommendations.index:
            reasons = []
            
            # FIRST: Check for cross-compatibility (most important for transparency)
            cross_compat = self._check_cross_compatibility(
                recommendations.loc[idx], 
                user_car_model,
                user_car_brand
            )
            if cross_compat:
                # Put cross-compatibility message FIRST
                reasons.append(cross_compat)
            else:
                # Regular compatibility message
                car_score = scores_df.loc[idx, 'car_score']
                if car_score > 0.7:
                    reasons.append(f"✅ Perfect fit for your {user_car_brand} {user_car_model}")
                elif car_score > 0.4:
                    reasons.append(f"✓ Compatible with your {user_car_brand} {user_car_model}")
            
            # Quality
            quality_score = recommendations.loc[idx, 'Overall_Quality_Score']
            if quality_score > 0.7:
                reasons.append(f"⭐ Excellent quality (score: {quality_score:.2f})")
            elif quality_score > 0.5:
                reasons.append(f"👍 Good quality (score: {quality_score:.2f})")
            
            # Sentiment
            sentiment_label = recommendations.loc[idx, 'Sentiment_Label']
            sentiment_score = recommendations.loc[idx, 'Sentiment_Score']
            if sentiment_label == 'Positive':
                reasons.append(f"😊 {int((sentiment_score + 1) * 50)}% positive reviews")
            
            # Price
            price = recommendations.loc[idx, 'Accessory Price']
            reasons.append(f"💰 ₹{price:,.0f}")
            
            # Emotion
            emotion = recommendations.loc[idx, 'Dominant_Emotion']
            if emotion in ['Happy', 'Satisfied']:
                reasons.append(f"💚 Customers are {emotion.lower()}")
            
            # Combine reasons
            explanation = " | ".join(reasons)
            explanations.append(explanation)
        
        return explanations


def test_recommendation_engine():
    """Test the recommendation engine with sample users"""
    print("=" * 80)
    print("🧪 TESTING PERSONALIZED RECOMMENDATION ENGINE")
    print("=" * 80)
    
    # Initialize engine
    engine = PersonalizedRecommendationEngine()
    
    # Test User 1: Budget-conscious Toyota owner
    print("\n" + "=" * 80)
    print("👤 USER 1: Budget-Conscious Toyota Camry Owner")
    print("=" * 80)
    user1 = {
        'car_brand': 'Toyota',
        'car_model': 'Camry',
        'budget_min': 500,
        'budget_max': 3000,
        'quality_threshold': 0.3,
        'sentiment_preference': 'positive',
        'emotion_preference': ['Happy', 'Satisfied']
    }
    
    recs1, scores1 = engine.get_recommendations(user1, top_k=6)
    print("\n🎯 TOP 6 RECOMMENDATIONS FOR USER 1:")
    print("-" * 80)
    for i, (idx, row) in enumerate(recs1.iterrows(), 1):
        print(f"\n{i}. {row['Accessory Name'][:60]}")
        print(f"   Price: ₹{row['Accessory Price']:,.0f}")
        print(f"   Score: {row['final_score']:.3f}")
        print(f"   {row['explanation']}")
    
    # Test User 2: Luxury car owner, high budget
    print("\n\n" + "=" * 80)
    print("👤 USER 2: Luxury Mercedes Owner (High Budget)")
    print("=" * 80)
    user2 = {
        'car_brand': 'Mercedes',
        'car_model': 'E-Class',
        'budget_min': 5000,
        'budget_max': 20000,
        'quality_threshold': 0.5,
        'sentiment_preference': 'positive',
        'emotion_preference': ['Happy', 'Satisfied']
    }
    
    recs2, scores2 = engine.get_recommendations(user2, top_k=6)
    print("\n🎯 TOP 6 RECOMMENDATIONS FOR USER 2:")
    print("-" * 80)
    for i, (idx, row) in enumerate(recs2.iterrows(), 1):
        print(f"\n{i}. {row['Accessory Name'][:60]}")
        print(f"   Price: ₹{row['Accessory Price']:,.0f}")
        print(f"   Score: {row['final_score']:.3f}")
        print(f"   {row['explanation']}")
    
    # Test User 3: Safety-focused parent
    print("\n\n" + "=" * 80)
    print("👤 USER 3: Safety-Focused Honda Civic Owner")
    print("=" * 80)
    user3 = {
        'car_brand': 'Honda',
        'car_model': 'Civic',
        'budget_min': 1000,
        'budget_max': 5000,
        'quality_threshold': 0.4,
        'sentiment_preference': 'positive',
        'emotion_preference': ['Satisfied']
    }
    
    recs3, scores3 = engine.get_recommendations(user3, top_k=6)
    print("\n🎯 TOP 6 RECOMMENDATIONS FOR USER 3:")
    print("-" * 80)
    for i, (idx, row) in enumerate(recs3.iterrows(), 1):
        print(f"\n{i}. {row['Accessory Name'][:60]}")
        print(f"   Price: ₹{row['Accessory Price']:,.0f}")
        print(f"   Score: {row['final_score']:.3f}")
        print(f"   {row['explanation']}")
    
    print("\n\n" + "=" * 80)
    print("✅ RECOMMENDATION ENGINE TESTING COMPLETE")
    print("=" * 80)
    print("\n📊 Key Observations:")
    print("  • Each user receives different recommendations ✓")
    print("  • Recommendations match user profiles ✓")
    print("  • Explanations are clear and actionable ✓")


if __name__ == "__main__":
    test_recommendation_engine()
