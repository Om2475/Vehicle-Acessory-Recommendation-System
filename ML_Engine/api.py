"""
🚀 RECOMMENDATION ENGINE API - FastAPI Backend
RESTful API for personalized accessory recommendations
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import uvicorn
from recommendation_engine import PersonalizedRecommendationEngine
import pandas as pd

# Initialize FastAPI app
app = FastAPI(
    title="Vehicle Accessories Recommendation API",
    description="Personalized recommendation engine for vehicle accessories",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize recommendation engine
rec_engine = None


# Pydantic models for API
class UserProfile(BaseModel):
    car_brand: str = Field(..., description="User's car brand (e.g., 'Toyota', 'Honda')")
    car_model: Optional[str] = Field(None, description="User's car model (e.g., 'Camry', 'Civic')")
    budget_min: float = Field(..., ge=0, description="Minimum budget in rupees")
    budget_max: float = Field(..., gt=0, description="Maximum budget in rupees")
    quality_threshold: float = Field(
        default=0.3,
        ge=-1,
        le=1,
        description="Minimum quality score threshold (-1 to 1)"
    )
    sentiment_preference: str = Field(
        default="positive",
        description="Sentiment preference: 'positive', 'neutral', or 'any'"
    )
    emotion_preference: List[str] = Field(
        default=["Happy", "Satisfied"],
        description="Preferred emotions (e.g., ['Happy', 'Satisfied'])"
    )
    search_query: Optional[str] = Field(
        default=None,
        description="Optional search query for content-based filtering"
    )


class AccessoryRecommendation(BaseModel):
    accessory_id: str
    accessory_name: str
    car_brand: str
    car_model: str
    price: float
    description: str
    sentiment_score: float
    sentiment_label: str
    quality_score: float
    dominant_emotion: str
    final_score: float
    explanation: str
    compatible_cars: str
    is_cross_compatible: bool = Field(
        default=False,
        description="True if accessory is from a different model but compatible with user's car"
    )
    compatibility_note: str = Field(
        default="",
        description="Additional compatibility information"
    )
    top_reviews: str = Field(
        default="",
        description="Top 5 customer reviews"
    )
    key_strengths: str = Field(
        default="",
        description="Key strengths identified from reviews"
    )
    key_weaknesses: str = Field(
        default="",
        description="Key weaknesses identified from reviews"
    )


class RecommendationResponse(BaseModel):
    success: bool
    count: int
    recommendations: List[AccessoryRecommendation]
    score_breakdown: Optional[Dict] = None


# API Endpoints

@app.on_event("startup")
async def startup_event():
    """Initialize recommendation engine on startup"""
    global rec_engine
    print("🚀 Starting Recommendation Engine API...")
    rec_engine = PersonalizedRecommendationEngine()
    print("✅ Recommendation Engine loaded successfully")


@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Vehicle Accessories Recommendation API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "stats": "/stats",
            "recommend": "/recommend (POST)",
            "brands": "/brands"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    if rec_engine is None:
        raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
    
    return {
        "status": "healthy",
        "engine_loaded": rec_engine is not None,
        "total_accessories": len(rec_engine.df) if rec_engine else 0
    }


@app.get("/stats")
async def get_stats():
    """Get dataset statistics"""
    if rec_engine is None:
        raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
    
    df = rec_engine.df
    
    return {
        "total_accessories": len(df),
        "total_brands": df['Car Brand'].nunique(),
        "price_range": {
            "min": float(df['Accessory Price'].min()),
            "max": float(df['Accessory Price'].max()),
            "mean": float(df['Accessory Price'].mean())
        },
        "sentiment_distribution": df['Sentiment_Label'].value_counts().to_dict(),
        "quality_stats": {
            "mean": float(df['Overall_Quality_Score'].mean()),
            "min": float(df['Overall_Quality_Score'].min()),
            "max": float(df['Overall_Quality_Score'].max())
        }
    }


@app.get("/brands")
async def get_brands():
    """Get list of all available car brands"""
    if rec_engine is None:
        raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
    
    brands = sorted(rec_engine.df['Car Brand'].unique().tolist())
    return {
        "brands": brands,
        "count": len(brands)
    }


@app.get("/brands/{brand}/models")
async def get_models_by_brand(brand: str):
    """Get list of car models available for a specific brand"""
    if rec_engine is None:
        raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
    
    # Filter accessories by brand (case-insensitive)
    brand_accessories = rec_engine.df[
        rec_engine.df['Car Brand'].str.lower() == brand.lower()
    ]
    
    if len(brand_accessories) == 0:
        raise HTTPException(status_code=404, detail=f"No accessories found for brand: {brand}")
    
    # Get unique models for this brand
    models = sorted(brand_accessories['Car Model'].unique().tolist())
    
    return {
        "brand": brand,
        "models": models,
        "count": len(models),
        "accessory_count": len(brand_accessories)
    }


@app.get("/brands-with-models")
async def get_brands_with_models():
    """Get all brands with their available models"""
    if rec_engine is None:
        raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
    
    df = rec_engine.df
    
    # Group by brand and get models
    brands_data = {}
    for brand in sorted(df['Car Brand'].unique()):
        brand_df = df[df['Car Brand'] == brand]
        models = sorted(brand_df['Car Model'].unique().tolist())
        brands_data[brand] = {
            "models": models,
            "model_count": len(models),
            "accessory_count": len(brand_df)
        }
    
    return {
        "brands": brands_data,
        "total_brands": len(brands_data)
    }


@app.post("/recommend/sectioned")
async def get_sectioned_recommendations(
    user_profile: UserProfile,
    exact_match_count: int = 6,
    compatible_count: int = 6
):
    """
    Get sectioned accessory recommendations
    
    **NEW ENDPOINT:** Returns recommendations in two sections:
    1. **Exact Match**: Accessories specifically designed for your car (brand + model match)
    2. **Compatible/Universal**: Accessories that are cross-compatible or universal
    
    This provides better organization and transparency about which accessories are 
    specifically for your car vs. compatible alternatives.
    
    Parameters:
    - user_profile: User preferences and requirements
    - exact_match_count: Number of exact match recommendations (default: 6)
    - compatible_count: Number of compatible/universal recommendations (default: 6)
    
    Returns:
    - Sectioned recommendations with clear labeling
    """
    if rec_engine is None:
        raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
    
    # Validate counts
    if exact_match_count < 1 or exact_match_count > 20:
        raise HTTPException(status_code=400, detail="exact_match_count must be between 1 and 20")
    if compatible_count < 1 or compatible_count > 20:
        raise HTTPException(status_code=400, detail="compatible_count must be between 1 and 20")
    
    # Validate budget
    if user_profile.budget_min >= user_profile.budget_max:
        raise HTTPException(status_code=400, detail="budget_min must be less than budget_max")
    
    # Convert Pydantic model to dict
    user_dict = user_profile.dict()
    
    try:
        # Get sectioned recommendations
        sections = rec_engine.get_recommendations_by_sections(
            user_dict,
            exact_match_count=exact_match_count,
            compatible_count=compatible_count,
            diversity_factor=0.3
        )
        
        # Format exact match recommendations
        exact_match_list = []
        for idx, row in sections['exact_match']['recommendations'].iterrows():
            exact_match_list.append(AccessoryRecommendation(
                accessory_id=str(row['Accessory_ID']),
                accessory_name=str(row['Accessory Name']),
                car_brand=str(row['Car Brand']),
                car_model=str(row['Car Model']),
                price=float(row['Accessory Price']),
                description=str(row['Accessory Description']),
                sentiment_score=float(row['Sentiment_Score']),
                sentiment_label=str(row['Sentiment_Label']),
                quality_score=float(row['Overall_Quality_Score']),
                dominant_emotion=str(row['Dominant_Emotion']),
                final_score=float(row['final_score']),
                explanation=str(row['explanation']),
                compatible_cars=str(row['Compatible Cars']),
                is_cross_compatible=False,
                compatibility_note=f"✅ Designed specifically for your {user_dict.get('car_brand')} {user_dict.get('car_model')}",
                top_reviews=str(row.get('Top 5 Reviews', '')),
                key_strengths=str(row.get('Key_Strengths', 'N/A')),
                key_weaknesses=str(row.get('Key_Weaknesses', 'N/A'))
            ))
        
        # Format compatible recommendations
        compatible_list = []
        user_car_model = user_dict.get('car_model', '').lower()
        user_car_brand = user_dict.get('car_brand', '')
        
        for idx, row in sections['compatible']['recommendations'].iterrows():
            accessory_model = str(row['Car Model']).lower()
            accessory_brand = str(row['Car Brand'])
            compatible_cars = str(row['Compatible Cars']).lower()
            
            # Determine compatibility type
            if 'universal' in compatible_cars or 'all cars' in compatible_cars:
                compatibility_note = f"🌐 Universal accessory - Fits multiple car models including your {user_car_brand} {user_dict.get('car_model', '')}"
            else:
                compatibility_note = f"🔄 Originally for {accessory_brand} {row['Car Model']}, but also compatible with your {user_car_brand} {user_dict.get('car_model', '')}"
            
            compatible_list.append(AccessoryRecommendation(
                accessory_id=str(row['Accessory_ID']),
                accessory_name=str(row['Accessory Name']),
                car_brand=str(row['Car Brand']),
                car_model=str(row['Car Model']),
                price=float(row['Accessory Price']),
                description=str(row['Accessory Description']),
                sentiment_score=float(row['Sentiment_Score']),
                sentiment_label=str(row['Sentiment_Label']),
                quality_score=float(row['Overall_Quality_Score']),
                dominant_emotion=str(row['Dominant_Emotion']),
                final_score=float(row['final_score']),
                explanation=str(row['explanation']),
                compatible_cars=str(row['Compatible Cars']),
                is_cross_compatible=True,
                compatibility_note=compatibility_note,
                top_reviews=str(row.get('Top 5 Reviews', '')),
                key_strengths=str(row.get('Key_Strengths', 'N/A')),
                key_weaknesses=str(row.get('Key_Weaknesses', 'N/A'))
            ))
        
        return {
            "success": True,
            "sections": {
                "exact_match": {
                    "title": f"Accessories for Your {user_dict.get('car_brand')} {user_dict.get('car_model')}",
                    "description": sections['exact_match']['description'],
                    "count": sections['exact_match']['count'],
                    "recommendations": exact_match_list,
                    "score_breakdown": sections['exact_match']['scores']
                },
                "compatible": {
                    "title": "Compatible & Universal Accessories",
                    "description": sections['compatible']['description'],
                    "count": sections['compatible']['count'],
                    "recommendations": compatible_list,
                    "score_breakdown": sections['compatible']['scores']
                }
            },
            "total_recommendations": sections['exact_match']['count'] + sections['compatible']['count']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating sectioned recommendations: {str(e)}")


@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(user_profile: UserProfile, top_k: int = 6):
    """
    Get personalized accessory recommendations (LEGACY ENDPOINT)
    
    **NOTE:** Consider using /recommend/sectioned for better organization.
    This endpoint returns a mixed list of recommendations.
    
    Parameters:
    - user_profile: User preferences and requirements
    - top_k: Number of recommendations to return (default: 6)
    
    Returns:
    - List of top-K personalized recommendations with explanations
    """
    if rec_engine is None:
        raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
    
    # Validate top_k
    if top_k < 1 or top_k > 50:
        raise HTTPException(status_code=400, detail="top_k must be between 1 and 50")
    
    # Validate budget
    if user_profile.budget_min >= user_profile.budget_max:
        raise HTTPException(status_code=400, detail="budget_min must be less than budget_max")
    
    # Convert Pydantic model to dict
    user_dict = user_profile.dict()
    
    try:
        # Get recommendations
        recommendations_df, scores = rec_engine.get_recommendations(
            user_dict,
            top_k=top_k,
            diversity_factor=0.3
        )
        
        if len(recommendations_df) == 0:
            return RecommendationResponse(
                success=False,
                count=0,
                recommendations=[],
                score_breakdown=None
            )
        
        # Format recommendations
        recs_list = []
        user_car_model = user_dict.get('car_model', '').lower()
        user_car_brand = user_dict.get('car_brand', '')
        
        for idx, row in recommendations_df.iterrows():
            # Check if this is cross-compatible
            accessory_model = str(row['Car Model']).lower()
            accessory_brand = str(row['Car Brand'])
            compatible_cars = str(row['Compatible Cars']).lower()
            
            is_cross_compatible = False
            compatibility_note = ""
            
            # If accessory is from a different model but compatible with user's car
            if user_car_model and user_car_model not in accessory_model:
                if user_car_model in compatible_cars:
                    is_cross_compatible = True
                    compatibility_note = f"⚠️ NOTE: This accessory is originally designed for {accessory_brand} {row['Car Model']}, but it is ALSO COMPATIBLE with your {user_car_brand} {user_dict.get('car_model', '')}. You can safely use this accessory!"
                elif 'universal' in compatible_cars or 'all cars' in compatible_cars:
                    is_cross_compatible = True
                    compatibility_note = f"✅ Universal accessory - Designed to fit multiple car models including your {user_car_brand} {user_dict.get('car_model', '')}"
            
            recs_list.append(AccessoryRecommendation(
                accessory_id=str(row['Accessory_ID']),
                accessory_name=str(row['Accessory Name']),
                car_brand=str(row['Car Brand']),
                car_model=str(row['Car Model']),
                price=float(row['Accessory Price']),
                description=str(row['Accessory Description']),  # Full description
                sentiment_score=float(row['Sentiment_Score']),
                sentiment_label=str(row['Sentiment_Label']),
                quality_score=float(row['Overall_Quality_Score']),
                dominant_emotion=str(row['Dominant_Emotion']),
                final_score=float(row['final_score']),
                explanation=str(row['explanation']),
                compatible_cars=str(row['Compatible Cars']),
                is_cross_compatible=is_cross_compatible,
                compatibility_note=compatibility_note,
                top_reviews=str(row.get('Top 5 Reviews', '')),
                key_strengths=str(row.get('Key_Strengths', 'N/A')),
                key_weaknesses=str(row.get('Key_Weaknesses', 'N/A'))
            ))
        
        return RecommendationResponse(
            success=True,
            count=len(recs_list),
            recommendations=recs_list,
            score_breakdown=scores
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


@app.get("/recommend/demo")
async def demo_recommendations():
    """Get demo recommendations for sample users"""
    if rec_engine is None:
        raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
    
    # Sample user profile
    demo_user = {
        'car_brand': 'Toyota',
        'car_model': 'Camry',
        'budget_min': 500,
        'budget_max': 3000,
        'quality_threshold': 0.3,
        'sentiment_preference': 'positive',
        'emotion_preference': ['Happy', 'Satisfied']
    }
    
    recommendations_df, scores = rec_engine.get_recommendations(demo_user, top_k=6)
    
    recs_list = []
    for idx, row in recommendations_df.iterrows():
        recs_list.append({
            "accessory_name": row['Accessory Name'],
            "price": f"₹{row['Accessory Price']:,.0f}",
            "score": f"{row['final_score']:.3f}",
            "explanation": row['explanation']
        })
    
    return {
        "demo_user": demo_user,
        "recommendations": recs_list
    }


if __name__ == "__main__":
    print("🚀 Starting Recommendation Engine API Server...")
    print("📝 API Documentation: http://localhost:8000/docs")
    print("🔍 Interactive API: http://localhost:8000/redoc")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
