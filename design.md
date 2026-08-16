# Design Document: Advanced Tourism Dashboard

## Overview

The Advanced Tourism Dashboard is a full-stack web application that provides data-driven travel insights through machine learning predictions, environmental data analysis, and interactive visualizations. The system processes historical and real-time environmental data (temperature, humidity, AQI, rainfall, safety metrics) to generate travel suitability scores, eco-scores, safety assessments, and personalized recommendations.

### System Goals

- Provide accurate travel suitability predictions using ML-based scoring algorithms
- Enable side-by-side city comparisons with comprehensive metrics
- Visualize temporal trends through interactive graphs (Travel Score, AQI, Temperature, Rainfall)
- Generate personalized recommendations with reasoning
- Display tourist attractions and optimal travel seasons
- Support data import, validation, caching, and export functionality
- Deliver sub-second response times for optimal user experience

### Technology Stack

**Backend:**
- Flask 3.x (Python web framework)
- Pandas (data processing and aggregation)
- Scikit-learn (ML model implementation)
- Redis (caching layer)
- Python 3.10+

**Frontend:**
- HTML5/CSS3/JavaScript (ES6+)
- Chart.js 4.x (visualization library)
- Fetch API (HTTP client)
- Responsive CSS Grid/Flexbox

**Data Layer:**
- CSV files (primary data storage)
- Redis cache (performance optimization)
- JSON (API data format)

**External APIs:**
- Open-Meteo API (weather data)
- OpenWeatherMap API (air quality data)

## Architecture

### High-Level Architecture

The system follows a three-tier architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Dashboard UI │  │ Visualization│  │ Comparison   │      │
│  │              │  │ Components   │  │ Interface    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    REST API (JSON)
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Flask API    │  │ ML Scoring   │  │ Recommendation│     │
│  │ Endpoints    │  │ Engine       │  │ Engine        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Data         │  │ Aggregation  │  │ Cache         │     │
│  │ Validator    │  │ Service      │  │ Manager       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ CSV Storage  │  │ Redis Cache  │  │ External APIs│      │
│  │              │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Frontend Layer:**
- Render interactive dashboard interface
- Handle user interactions (city selection, comparison, preferences)
- Visualize data using Chart.js
- Make API requests and handle responses
- Provide responsive layout for various screen sizes

**Backend Layer:**
- Expose REST API endpoints
- Execute ML scoring algorithms
- Perform data aggregation and processing
- Validate input data
- Generate recommendations
- Manage caching strategy
- Handle error logging

**Data Layer:**
- Store environmental data in CSV format
- Cache frequently accessed data in Redis
- Fetch real-time data from external APIs
- Persist tourist attraction information

## Components and Interfaces

### 1. ML Scoring Engine

The ML Scoring Engine calculates travel suitability scores using weighted environmental factors.

**Algorithm Design:**

```python
# Travel Score Formula (0-100 scale)
travel_score = (
    0.40 * temperature_score +  # Optimal temperature: 20-28°C
    0.30 * air_quality_score +  # Lower PM2.5 is better
    0.20 * precipitation_score + # Lower rainfall is better
    0.10 * comfort_score        # Temperature range comfort
)

# Temperature Score (normalized)
temp_optimal = 25  # Celsius
temp_score = max(0, 1 - abs(temp_max - temp_optimal) / temp_optimal) * 100

# Air Quality Score (inverse of pollution)
aqi_max = 200  # Threshold for hazardous
air_quality_score = max(0, 1 - pm25 / aqi_max) * 100

# Precipitation Score (inverse of rainfall)
precip_max = 50  # mm threshold
precipitation_score = max(0, 1 - precipitation_sum / precip_max) * 100

# Comfort Score (minimum temperature adequacy)
comfort_score = (temp_min / 25) * 100
```

**Eco Score Formula:**

```python
# Eco Score (0-100 scale)
eco_score = (
    0.60 * air_quality_component +  # AQI impact
    0.25 * temperature_component +   # Temperature deviation
    0.15 * humidity_component        # Humidity comfort
)

# Hard constraint: AQI > 200 caps eco_score at 30
if aqi > 200:
    eco_score = min(eco_score, 30)
```

**Interface:**

```python
class MLScoringEngine:
    def calculate_travel_score(
        self,
        temp_max: float,
        temp_min: float,
        pm25: float,
        precipitation: float
    ) -> float:
        """Calculate travel suitability score (0-100)"""
        pass
    
    def calculate_eco_score(
        self,
        aqi: float,
        temp_max: float,
        temp_min: float,
        humidity: float
    ) -> float:
        """Calculate environmental quality score (0-100)"""
        pass
    
    def classify_safety_level(self, safety_score: float) -> str:
        """Classify safety: Safe (>70), Moderate (40-70), Unsafe (<40)"""
        pass
    
    def classify_pollution_level(self, aqi: float) -> str:
        """Classify pollution: Good (0-50), Moderate (51-100),
        Unhealthy (101-200), Hazardous (>200)"""
        pass
```

### 2. Data Validator

Ensures data integrity before processing or storage.

**Validation Rules:**

```python
VALIDATION_RULES = {
    'temperature': {'min': -50, 'max': 60, 'unit': 'Celsius'},
    'humidity': {'min': 0, 'max': 100, 'unit': 'percent'},
    'aqi': {'min': 0, 'max': None, 'unit': 'index'},
    'rainfall': {'min': 0, 'max': None, 'unit': 'mm'},
    'safety_score': {'min': 0, 'max': 100, 'unit': 'score'},
    'date': {'format': 'YYYY-MM-DD'}
}
```

**Interface:**

```python
class DataValidator:
    def validate_environmental_data(self, data: dict) -> tuple[bool, str]:
        """Validate environmental data fields
        Returns: (is_valid, error_message)"""
        pass
    
    def validate_csv_structure(self, df: pd.DataFrame) -> tuple[bool, str]:
        """Validate CSV file structure and headers"""
        pass
    
    def sanitize_input(self, value: any, field_type: str) -> any:
        """Sanitize and convert input values"""
        pass
```

### 3. Aggregation Service

Computes monthly statistics from daily environmental data.

**Interface:**

```python
class AggregationService:
    def aggregate_monthly(self, city: str, df: pd.DataFrame) -> pd.DataFrame:
        """Compute monthly aggregates for a city
        Returns DataFrame with columns:
        - month (1-12)
        - avg_temp_max, avg_temp_min
        - avg_aqi
        - total_rainfall
        - avg_safety_score
        - avg_travel_score
        """
        pass
    
    def get_best_season(self, monthly_data: pd.DataFrame) -> dict:
        """Identify best month(s) for travel
        Returns: {
            'best_months': [int],
            'score': float,
            'reasoning': str
        }"""
        pass
```

### 4. Recommendation Engine

Generates personalized city recommendations based on user preferences.

**Interface:**

```python
class RecommendationEngine:
    def generate_recommendations(
        self,
        preferences: dict,
        cities_data: pd.DataFrame
    ) -> list[dict]:
        """Generate ranked recommendations
        
        preferences: {
            'temp_range': (min, max),
            'max_aqi': int,
            'min_safety': int
        }
        
        Returns: [{
            'city': str,
            'travel_score': float,
            'reasoning': str
        }]
        """
        pass
    
    def generate_reasoning(
        self,
        city: str,
        metrics: dict
    ) -> str:
        """Generate recommendation message (max 200 chars)"""
        pass
```

### 5. Cache Manager

Manages Redis caching for performance optimization.

**Interface:**

```python
class CacheManager:
    def __init__(self, redis_client, ttl: int = 86400):
        """Initialize with 24-hour TTL"""
        pass
    
    def get_city_data(self, city: str, date: str) -> dict | None:
        """Retrieve cached city data"""
        pass
    
    def set_city_data(self, city: str, date: str, data: dict):
        """Cache city data"""
        pass
    
    def invalidate_cache(self, pattern: str):
        """Invalidate cache entries matching pattern"""
        pass
    
    def is_stale(self, key: str) -> bool:
        """Check if cache entry is older than TTL"""
        pass
```

### 6. Flask API Endpoints

RESTful API for frontend-backend communication.

**Endpoint Specifications:**

```
GET /api/cities
Response: {
    "cities": ["Delhi", "Goa", "Manali", ...]
}

GET /api/city/<city_name>/score?date=YYYY-MM-DD
Response: {
    "city": "Delhi",
    "date": "2024-03-15",
    "travel_score": 78.5,
    "eco_score": 65.2,
    "safety_level": "Safe",
    "pollution_level": "Moderate",
    "metrics": {
        "temp_max": 28.5,
        "temp_min": 18.2,
        "aqi": 85,
        "rainfall": 2.3,
        "safety_score": 75
    }
}

GET /api/city/<city_name>/monthly
Response: {
    "city": "Delhi",
    "monthly_data": [
        {
            "month": 1,
            "avg_temp": 20.5,
            "avg_aqi": 150,
            "total_rainfall": 15.2,
            "avg_travel_score": 65.3
        },
        ...
    ],
    "best_season": {
        "months": [2, 3, 10, 11],
        "score": 82.5
    }
}

POST /api/compare
Request: {
    "cities": ["Delhi", "Goa", "Manali"],
    "date": "2024-03-15"
}
Response: {
    "comparison": [
        {
            "city": "Delhi",
            "travel_score": 78.5,
            "eco_score": 65.2,
            "safety_level": "Safe",
            "pollution_level": "Moderate"
        },
        ...
    ]
}

POST /api/recommendations
Request: {
    "preferences": {
        "temp_range": [20, 30],
        "max_aqi": 100,
        "min_safety": 60
    }
}
Response: {
    "recommendations": [
        {
            "city": "Goa",
            "travel_score": 85.2,
            "reasoning": "Excellent weather (28°C), good air quality (AQI: 45), safe destination"
        },
        ...
    ]
}

GET /api/city/<city_name>/attractions
Response: {
    "city": "Delhi",
    "attractions": [
        {
            "name": "India Gate",
            "description": "War memorial and iconic landmark",
            "image_url": "..."
        },
        ...
    ]
}

POST /api/import/csv
Request: multipart/form-data with CSV file
Response: {
    "status": "success",
    "records_imported": 1500,
    "duplicates_skipped": 23,
    "errors": []
}

GET /api/export/comparison?cities=Delhi,Goa&format=csv
Response: CSV file download

Error Response Format:
{
    "error": "Error message",
    "code": "ERROR_CODE",
    "details": {...}
}
```

### 7. Frontend Components

**Dashboard Component:**
- City selector dropdown
- Score display cards (Travel Score, Eco Score, Safety, Pollution)
- Best season indicator
- Tourist attractions carousel

**Visualization Component:**
- Chart.js integration
- Four graph types: Travel Score, AQI, Temperature, Rainfall
- Interactive tooltips on hover
- Responsive canvas sizing

**Comparison Component:**
- Multi-city selector (2-5 cities)
- Comparison table with aligned columns
- Visual indicators (color coding)
- Export buttons (CSV, PDF)

**Recommendation Component:**
- Preference input form (temperature, AQI, safety)
- Recommendation cards with reasoning
- Ranking display

## Data Models

### Environmental Data Schema

```python
{
    "city": str,              # City name
    "date": str,              # ISO format: YYYY-MM-DD
    "temp_max": float,        # Celsius, range: -50 to 60
    "temp_min": float,        # Celsius, range: -50 to 60
    "humidity": float,        # Percent, range: 0 to 100
    "aqi": int,               # Air Quality Index, >= 0
    "pm25": float,            # PM2.5 concentration
    "rainfall": float,        # Millimeters, >= 0
    "safety_score": float     # Score, range: 0 to 100
}
```

### Monthly Aggregate Schema

```python
{
    "city": str,
    "month": int,             # 1-12
    "avg_temp_max": float,
    "avg_temp_min": float,
    "avg_humidity": float,
    "avg_aqi": float,
    "total_rainfall": float,
    "avg_safety_score": float,
    "avg_travel_score": float,
    "avg_eco_score": float
}
```

### Tourist Attraction Schema

```python
{
    "city": str,
    "attractions": [
        {
            "name": str,
            "description": str,      # Max 200 chars
            "category": str,         # Historical, Natural, Cultural, etc.
            "image_url": str | None,
            "rating": float | None   # 0-5 scale
        }
    ]
}
```

### User Preferences Schema

```python
{
    "temp_range": tuple[float, float],  # (min, max) in Celsius
    "max_aqi": int,                     # Maximum acceptable AQI
    "min_safety": int,                  # Minimum safety score (0-100)
    "avoid_rain": bool                  # Prefer low rainfall
}
```

### Cache Key Schema

```
city_data:{city}:{date}           # Daily city data
monthly_data:{city}                # Monthly aggregates
attractions:{city}                 # Tourist attractions
comparison:{city1}_{city2}_{date}  # Comparison results
```


## Data Flow

### Request Flow Diagram

```
User Action → Frontend → API Request → Backend Processing → Data Layer → Response

Example: City Score Request
1. User selects "Delhi" from dropdown
2. Frontend: GET /api/city/Delhi/score?date=2024-03-15
3. Backend: Check cache
   - Cache hit: Return cached data (< 100ms)
   - Cache miss: Continue to step 4
4. Backend: Load CSV data, filter by city and date
5. Backend: Calculate scores using ML Scoring Engine
6. Backend: Store in cache with 24h TTL
7. Backend: Return JSON response
8. Frontend: Update UI with scores and visualizations
```

### Data Processing Pipeline

```
CSV Import → Validation → Transformation → Aggregation → Caching → API Response

1. CSV Import:
   - Parse CSV file using pandas
   - Validate structure (headers, data types)
   - Check for duplicates

2. Validation:
   - Apply validation rules
   - Reject invalid records
   - Log errors with timestamps

3. Transformation:
   - Convert date strings to datetime
   - Normalize numeric values
   - Calculate derived fields

4. Aggregation:
   - Group by city and month
   - Compute averages and totals
   - Calculate travel scores

5. Caching:
   - Store in Redis with TTL
   - Generate cache keys
   - Set expiration policies

6. API Response:
   - Format as JSON
   - Include metadata
   - Return with appropriate HTTP status
```

### Visualization Data Flow

```
Backend Aggregation → JSON API → Frontend Fetch → Chart.js Rendering

1. Backend prepares monthly data:
   monthly_data = [
       {"month": 1, "travel_score": 65.3, "aqi": 150, ...},
       ...
   ]

2. Frontend fetches data:
   const response = await fetch(`/api/city/${city}/monthly`);
   const data = await response.json();

3. Chart.js renders:
   new Chart(ctx, {
       type: 'line',
       data: {
           labels: data.monthly_data.map(d => monthNames[d.month]),
           datasets: [{
               label: 'Travel Score',
               data: data.monthly_data.map(d => d.avg_travel_score)
           }]
       }
   });
```

## Implementation Details

### ML Scoring Engine Implementation

```python
class MLScoringEngine:
    # Weight constants
    TRAVEL_WEIGHTS = {
        'temperature': 0.40,
        'air_quality': 0.30,
        'precipitation': 0.20,
        'comfort': 0.10
    }
    
    ECO_WEIGHTS = {
        'air_quality': 0.60,
        'temperature': 0.25,
        'humidity': 0.15
    }
    
    # Optimal values
    OPTIMAL_TEMP = 25  # Celsius
    OPTIMAL_HUMIDITY = 50  # Percent
    AQI_THRESHOLD = 200
    PRECIP_THRESHOLD = 50  # mm
    
    def calculate_travel_score(self, temp_max, temp_min, pm25, precipitation):
        # Temperature component (optimal: 25°C)
        temp_score = max(0, 1 - abs(temp_max - self.OPTIMAL_TEMP) / self.OPTIMAL_TEMP)
        
        # Air quality component (lower is better)
        air_score = max(0, 1 - pm25 / self.AQI_THRESHOLD)
        
        # Precipitation component (lower is better)
        precip_score = max(0, 1 - precipitation / self.PRECIP_THRESHOLD)
        
        # Comfort component (adequate minimum temperature)
        comfort_score = min(1, temp_min / 25)
        
        # Weighted combination
        travel_score = (
            self.TRAVEL_WEIGHTS['temperature'] * temp_score +
            self.TRAVEL_WEIGHTS['air_quality'] * air_score +
            self.TRAVEL_WEIGHTS['precipitation'] * precip_score +
            self.TRAVEL_WEIGHTS['comfort'] * comfort_score
        ) * 100
        
        return round(travel_score, 1)
    
    def calculate_eco_score(self, aqi, temp_max, temp_min, humidity):
        # Air quality component
        air_component = max(0, 1 - aqi / self.AQI_THRESHOLD) * 100
        
        # Temperature component (deviation from optimal)
        avg_temp = (temp_max + temp_min) / 2
        temp_component = max(0, 1 - abs(avg_temp - self.OPTIMAL_TEMP) / 30) * 100
        
        # Humidity component (deviation from optimal)
        humidity_component = max(0, 1 - abs(humidity - self.OPTIMAL_HUMIDITY) / 50) * 100
        
        # Weighted combination
        eco_score = (
            self.ECO_WEIGHTS['air_quality'] * air_component +
            self.ECO_WEIGHTS['temperature'] * temp_component +
            self.ECO_WEIGHTS['humidity'] * humidity_component
        )
        
        # Hard constraint: AQI > 200 caps score at 30
        if aqi > 200:
            eco_score = min(eco_score, 30)
        
        return round(eco_score, 1)
    
    def classify_safety_level(self, safety_score):
        if safety_score > 70:
            return "Safe"
        elif safety_score >= 40:
            return "Moderate"
        else:
            return "Unsafe"
    
    def classify_pollution_level(self, aqi):
        if aqi <= 50:
            return "Good"
        elif aqi <= 100:
            return "Moderate"
        elif aqi <= 200:
            return "Unhealthy"
        else:
            return "Hazardous"
```

### Data Validation Implementation

```python
class DataValidator:
    VALIDATION_RULES = {
        'temperature': {'min': -50, 'max': 60},
        'humidity': {'min': 0, 'max': 100},
        'aqi': {'min': 0, 'max': None},
        'rainfall': {'min': 0, 'max': None},
        'safety_score': {'min': 0, 'max': 100}
    }
    
    def validate_environmental_data(self, data):
        errors = []
        
        # Validate temperature
        if 'temp_max' in data:
            if not self._in_range(data['temp_max'], 'temperature'):
                errors.append(f"Temperature {data['temp_max']} outside valid range")
        
        # Validate humidity
        if 'humidity' in data:
            if not self._in_range(data['humidity'], 'humidity'):
                errors.append(f"Humidity {data['humidity']} outside valid range")
        
        # Validate AQI
        if 'aqi' in data:
            if data['aqi'] < 0:
                errors.append(f"AQI cannot be negative: {data['aqi']}")
        
        # Validate rainfall
        if 'rainfall' in data:
            if data['rainfall'] < 0:
                errors.append(f"Rainfall cannot be negative: {data['rainfall']}")
        
        # Validate safety score
        if 'safety_score' in data:
            if not self._in_range(data['safety_score'], 'safety_score'):
                errors.append(f"Safety score {data['safety_score']} outside valid range")
        
        # Validate date format
        if 'date' in data:
            try:
                datetime.strptime(data['date'], '%Y-%m-%d')
            except ValueError:
                errors.append(f"Invalid date format: {data['date']}")
        
        if errors:
            return False, "; ".join(errors)
        return True, ""
    
    def _in_range(self, value, field):
        rules = self.VALIDATION_RULES[field]
        if rules['min'] is not None and value < rules['min']:
            return False
        if rules['max'] is not None and value > rules['max']:
            return False
        return True
    
    def validate_csv_structure(self, df):
        required_columns = ['city', 'date', 'temp_max', 'temp_min', 
                          'humidity', 'aqi', 'rainfall', 'safety_score']
        
        missing = set(required_columns) - set(df.columns)
        if missing:
            return False, f"Missing required columns: {missing}"
        
        return True, ""
```

### Caching Strategy

```python
class CacheManager:
    def __init__(self, redis_client, ttl=86400):
        self.redis = redis_client
        self.ttl = ttl  # 24 hours default
    
    def get_city_data(self, city, date):
        key = f"city_data:{city}:{date}"
        data = self.redis.get(key)
        if data:
            return json.loads(data)
        return None
    
    def set_city_data(self, city, date, data):
        key = f"city_data:{city}:{date}"
        self.redis.setex(key, self.ttl, json.dumps(data))
    
    def get_monthly_data(self, city):
        key = f"monthly_data:{city}"
        data = self.redis.get(key)
        if data:
            return json.loads(data)
        return None
    
    def set_monthly_data(self, city, data):
        key = f"monthly_data:{city}"
        self.redis.setex(key, self.ttl, json.dumps(data))
    
    def invalidate_cache(self, pattern):
        keys = self.redis.keys(pattern)
        if keys:
            self.redis.delete(*keys)
    
    def is_stale(self, key):
        ttl = self.redis.ttl(key)
        return ttl <= 0
```

### Recommendation Engine Implementation

```python
class RecommendationEngine:
    def __init__(self, scoring_engine):
        self.scoring_engine = scoring_engine
    
    def generate_recommendations(self, preferences, cities_data):
        # Filter cities based on preferences
        filtered = cities_data.copy()
        
        if 'temp_range' in preferences:
            min_temp, max_temp = preferences['temp_range']
            filtered = filtered[
                (filtered['temp_max'] >= min_temp) & 
                (filtered['temp_max'] <= max_temp)
            ]
        
        if 'max_aqi' in preferences:
            filtered = filtered[filtered['aqi'] <= preferences['max_aqi']]
        
        if 'min_safety' in preferences:
            filtered = filtered[filtered['safety_score'] >= preferences['min_safety']]
        
        if filtered.empty:
            return []
        
        # Calculate travel scores
        recommendations = []
        for _, row in filtered.iterrows():
            score = self.scoring_engine.calculate_travel_score(
                row['temp_max'], row['temp_min'], 
                row['pm25'], row['rainfall']
            )
            reasoning = self.generate_reasoning(row['city'], row.to_dict())
            recommendations.append({
                'city': row['city'],
                'travel_score': score,
                'reasoning': reasoning
            })
        
        # Sort by score descending
        recommendations.sort(key=lambda x: x['travel_score'], reverse=True)
        return recommendations
    
    def generate_reasoning(self, city, metrics):
        reasons = []
        
        # Temperature reasoning
        if 20 <= metrics['temp_max'] <= 30:
            reasons.append(f"pleasant weather ({metrics['temp_max']:.1f}°C)")
        
        # Air quality reasoning
        pollution = self.scoring_engine.classify_pollution_level(metrics['aqi'])
        if pollution in ['Good', 'Moderate']:
            reasons.append(f"{pollution.lower()} air quality")
        
        # Safety reasoning
        safety = self.scoring_engine.classify_safety_level(metrics['safety_score'])
        if safety == 'Safe':
            reasons.append("safe destination")
        
        # Rainfall reasoning
        if metrics['rainfall'] < 10:
            reasons.append("minimal rainfall")
        
        reasoning = f"{city}: " + ", ".join(reasons[:3])
        return reasoning[:200]  # Max 200 chars
```

### Frontend Visualization Implementation

```javascript
// Chart.js configuration for Travel Score visualization
class TravelScoreChart {
    constructor(canvasId) {
        this.ctx = document.getElementById(canvasId).getContext('2d');
        this.chart = null;
    }
    
    async render(city) {
        const response = await fetch(`/api/city/${city}/monthly`);
        const data = await response.json();
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const chartData = {
            labels: data.monthly_data.map(d => monthNames[d.month - 1]),
            datasets: [{
                label: 'Travel Score',
                data: data.monthly_data.map(d => d.avg_travel_score),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4
            }]
        };
        
        const config = {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `${city} - Monthly Travel Score`
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `Score: ${context.parsed.y.toFixed(1)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Travel Score'
                        }
                    }
                }
            }
        };
        
        if (this.chart) {
            this.chart.destroy();
        }
        this.chart = new Chart(this.ctx, config);
    }
}

// AQI Chart with color coding
class AQIChart {
    constructor(canvasId) {
        this.ctx = document.getElementById(canvasId).getContext('2d');
        this.chart = null;
    }
    
    getColorForAQI(aqi) {
        if (aqi <= 50) return 'rgb(0, 228, 0)';      // Good - Green
        if (aqi <= 100) return 'rgb(255, 255, 0)';   // Moderate - Yellow
        if (aqi <= 200) return 'rgb(255, 126, 0)';   // Unhealthy - Orange
        return 'rgb(255, 0, 0)';                      // Hazardous - Red
    }
    
    async render(city) {
        const response = await fetch(`/api/city/${city}/monthly`);
        const data = await response.json();
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const chartData = {
            labels: data.monthly_data.map(d => monthNames[d.month - 1]),
            datasets: [{
                label: 'AQI',
                data: data.monthly_data.map(d => d.avg_aqi),
                backgroundColor: data.monthly_data.map(d => this.getColorForAQI(d.avg_aqi)),
                borderColor: 'rgb(0, 0, 0)',
                borderWidth: 1
            }]
        };
        
        const config = {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `${city} - Monthly Air Quality Index`
                    },
                    legend: {
                        display: true,
                        labels: {
                            generateLabels: () => [
                                {text: 'Good (0-50)', fillStyle: 'rgb(0, 228, 0)'},
                                {text: 'Moderate (51-100)', fillStyle: 'rgb(255, 255, 0)'},
                                {text: 'Unhealthy (101-200)', fillStyle: 'rgb(255, 126, 0)'},
                                {text: 'Hazardous (>200)', fillStyle: 'rgb(255, 0, 0)'}
                            ]
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const aqi = context.parsed.y;
                                let level = 'Good';
                                if (aqi > 200) level = 'Hazardous';
                                else if (aqi > 100) level = 'Unhealthy';
                                else if (aqi > 50) level = 'Moderate';
                                return `AQI: ${aqi.toFixed(0)} (${level})`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'AQI Value'
                        }
                    }
                }
            }
        };
        
        if (this.chart) {
            this.chart.destroy();
        }
        this.chart = new Chart(this.ctx, config);
    }
}

// City Comparison Component
class CityComparison {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }
    
    async compare(cities) {
        if (cities.length < 2 || cities.length > 5) {
            alert('Please select 2-5 cities for comparison');
            return;
        }
        
        const response = await fetch('/api/compare', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                cities: cities,
                date: new Date().toISOString().split('T')[0]
            })
        });
        
        const data = await response.json();
        this.renderTable(data.comparison);
    }
    
    renderTable(comparison) {
        let html = `
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>City</th>
                        <th>Travel Score</th>
                        <th>Eco Score</th>
                        <th>Safety Level</th>
                        <th>Pollution Level</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        comparison.forEach(city => {
            const safetyClass = this.getSafetyClass(city.safety_level);
            const pollutionClass = this.getPollutionClass(city.pollution_level);
            
            html += `
                <tr>
                    <td><strong>${city.city}</strong></td>
                    <td>${city.travel_score}</td>
                    <td>${city.eco_score}</td>
                    <td class="${safetyClass}">${city.safety_level}</td>
                    <td class="${pollutionClass}">${city.pollution_level}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        this.container.innerHTML = html;
    }
    
    getSafetyClass(level) {
        const classes = {
            'Safe': 'safety-safe',
            'Moderate': 'safety-moderate',
            'Unsafe': 'safety-unsafe'
        };
        return classes[level] || '';
    }
    
    getPollutionClass(level) {
        const classes = {
            'Good': 'pollution-good',
            'Moderate': 'pollution-moderate',
            'Unhealthy': 'pollution-unhealthy',
            'Hazardous': 'pollution-hazardous'
        };
        return classes[level] || '';
    }
}
```


## Error Handling

### Error Categories

**Validation Errors (HTTP 400):**
- Invalid temperature range (-50 to 60°C)
- Invalid humidity range (0-100%)
- Negative AQI values
- Negative rainfall values
- Invalid safety score range (0-100)
- Invalid date format (must be YYYY-MM-DD)
- Missing required fields
- Invalid CSV structure

**Not Found Errors (HTTP 404):**
- City not found in database
- No data available for specified date
- Endpoint does not exist

**Server Errors (HTTP 500):**
- ML model calculation failure
- Database connection failure
- Cache service unavailable
- External API timeout
- File system errors during CSV import/export

### Error Response Format

```json
{
    "error": "Descriptive error message",
    "code": "ERROR_CODE",
    "details": {
        "field": "temperature",
        "value": 75,
        "constraint": "Must be between -50 and 60"
    },
    "timestamp": "2024-03-15T10:30:00Z"
}
```

### Error Handling Strategy

**Backend:**
- Validate all inputs before processing
- Use try-catch blocks around external API calls
- Log all errors with severity levels (INFO, WARNING, ERROR, CRITICAL)
- Return descriptive error messages to frontend
- Implement circuit breaker for external API failures
- Graceful degradation when cache is unavailable

**Frontend:**
- Display user-friendly error messages
- Provide retry mechanisms for transient failures
- Show loading states during API calls
- Validate user input before submission
- Handle network errors gracefully

### Logging Strategy

```python
# Log format
{
    "timestamp": "2024-03-15T10:30:00Z",
    "level": "ERROR",
    "component": "DataValidator",
    "message": "Temperature validation failed",
    "details": {
        "city": "Delhi",
        "value": 75,
        "constraint": "[-50, 60]"
    },
    "user_id": "optional",
    "request_id": "uuid"
}
```

**Log Levels:**
- INFO: Successful operations, data imports
- WARNING: Duplicate records, cache misses
- ERROR: Validation failures, API errors
- CRITICAL: System failures, database unavailable

## Testing Strategy

### Dual Testing Approach

The system requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests:**
- Specific examples demonstrating correct behavior
- Edge cases (boundary values, empty inputs)
- Error conditions (invalid data, missing fields)
- Integration points between components
- API endpoint responses

**Property-Based Tests:**
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Minimum 100 iterations per property test
- Each test references its design document property

### Testing Tools

**Backend:**
- pytest (unit testing framework)
- Hypothesis (property-based testing library)
- pytest-cov (code coverage)
- pytest-mock (mocking)

**Frontend:**
- Jest (unit testing framework)
- fast-check (property-based testing library)
- Testing Library (component testing)

### Property-Based Testing Configuration

Each property test must:
1. Run minimum 100 iterations
2. Include a comment tag: `# Feature: advanced-tourism-dashboard, Property {number}: {property_text}`
3. Generate random valid inputs using Hypothesis strategies
4. Assert the property holds for all generated inputs

Example:
```python
from hypothesis import given, strategies as st

# Feature: advanced-tourism-dashboard, Property 1: ML model output range
@given(
    temp_max=st.floats(min_value=-50, max_value=60),
    temp_min=st.floats(min_value=-50, max_value=60),
    pm25=st.floats(min_value=0, max_value=500),
    precipitation=st.floats(min_value=0, max_value=200)
)
@settings(max_examples=100)
def test_travel_score_range(temp_max, temp_min, pm25, precipitation):
    score = ml_engine.calculate_travel_score(temp_max, temp_min, pm25, precipitation)
    assert 0 <= score <= 100
```

### Test Coverage Goals

- Backend: 85% code coverage
- Frontend: 75% code coverage
- All API endpoints tested
- All validation rules tested
- All scoring algorithms tested
- All error conditions tested

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:
- Properties 3.2 and 3.3 (AQI and temperature/humidity affecting eco score) are subsumed by Property 3.1 (eco score combines air quality and weather metrics)
- Properties 4.2, 4.3, and 4.4 (specific safety level classifications) can be combined into a single comprehensive property
- Properties 5.2, 5.3, 5.4, and 5.5 (specific pollution level classifications) can be combined into a single comprehensive property
- Properties 8.2, 8.3, 8.4, and 8.5 (specific monthly aggregations) can be combined into a single property about aggregation correctness
- Properties 9.2, 10.2, 11.2, and 12.2 (12-month data requirements) are all the same constraint and can be combined
- Properties 16.2, 16.3, and 16.4 (reasoning components) are subsumed by Property 16.1 (messages include reasoning)
- Properties 19.1-19.6 (specific validation rules) can be combined into a comprehensive validation property

### Property 1: ML Model Output Range

*For any* valid environmental data (temperature, humidity, PM2.5, precipitation), the ML model's travel suitability score output shall be in the range [0, 100].

**Validates: Requirements 1.3, 2.1**

### Property 2: Travel Score Input Sensitivity

*For any* environmental data, changing temperature, PM2.5, or precipitation values shall result in a different travel score (unless the change doesn't affect the weighted calculation).

**Validates: Requirements 2.2**

### Property 3: Missing Data Error Handling

*For any* environmental data with missing required fields (temperature, PM2.5, precipitation), the system shall return an error indicating which fields are missing.

**Validates: Requirements 2.3, 7.7**

### Property 4: Travel Score Precision

*For any* calculated travel score, the output shall have exactly one decimal place of precision.

**Validates: Requirements 2.4**

### Property 5: Eco Score Range

*For any* valid environmental data (AQI, temperature, humidity), the eco score shall be in the range [0, 100].

**Validates: Requirements 3.4**

### Property 6: Eco Score AQI Constraint

*For any* environmental data where AQI exceeds 200, the eco score shall not exceed 30.

**Validates: Requirements 3.5**

### Property 7: Safety Level Classification

*For any* safety score value, the system shall classify it as exactly one of: "Safe" (score > 70), "Moderate" (40 ≤ score ≤ 70), or "Unsafe" (score < 40).

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 8: Pollution Level Classification

*For any* AQI value, the system shall classify it as exactly one of: "Good" (0-50), "Moderate" (51-100), "Unhealthy" (101-200), or "Hazardous" (>200).

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 9: Comparison Output Completeness

*For any* city comparison request, each city in the response shall include travel_score, eco_score, safety_level, and pollution_level fields.

**Validates: Requirements 6.3**

### Property 10: Environmental Data Schema

*For any* stored environmental data record, it shall contain all required fields: city, date, temperature, humidity, AQI, rainfall, and safety_score.

**Validates: Requirements 7.1**

### Property 11: Data Validation Rules

*For any* environmental data where temperature is outside [-50, 60], humidity is outside [0, 100], AQI is negative, rainfall is negative, safety_score is outside [0, 100], or date format is invalid, the system shall reject the data with a descriptive error.

**Validates: Requirements 7.3, 7.4, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6**

### Property 12: Monthly Aggregation Correctness

*For any* city's daily environmental data, the monthly aggregates shall correctly compute: average temperature (mean of daily temps), average AQI (mean of daily AQI), total rainfall (sum of daily rainfall), and average safety score (mean of daily scores).

**Validates: Requirements 8.2, 8.3, 8.4, 8.5**

### Property 13: Visualization Data Completeness

*For any* city with historical data, the monthly visualization data shall contain at least 12 months of data points.

**Validates: Requirements 9.2, 10.2, 11.2, 12.2**

### Property 14: Best Season Selection

*For any* city's monthly data, the identified best season shall be the month(s) with the highest average travel score.

**Validates: Requirements 13.2**

### Property 15: Best Season Tie Handling

*For any* city's monthly data where multiple months have travel scores within 5 points of the maximum, all such months shall be included in the best season list.

**Validates: Requirements 13.5**

### Property 16: Tourist Attraction Minimum Count

*For any* city, the system shall return at least 3 tourist attraction entries.

**Validates: Requirements 14.2**

### Property 17: Tourist Attraction Structure

*For any* tourist attraction entry, it shall include both a name field and a description field.

**Validates: Requirements 14.3**

### Property 18: Recommendation Filtering

*For any* user preferences (temperature range, max AQI, min safety), the recommendation engine shall return only cities that satisfy all specified criteria.

**Validates: Requirements 15.3**

### Property 19: Recommendation Ranking

*For any* list of recommendations, they shall be ordered by travel score in descending order.

**Validates: Requirements 15.4**

### Property 20: Recommendation Minimum Result

*For any* user preferences where at least one city matches the criteria, the recommendation engine shall return at least 1 recommendation.

**Validates: Requirements 15.5**

### Property 21: No Match Message

*For any* user preferences where no cities match the criteria, the recommendation engine shall return a message indicating no matches were found.

**Validates: Requirements 15.6**

### Property 22: Recommendation Message Presence

*For any* recommendation, it shall include a reasoning message.

**Validates: Requirements 16.1**

### Property 23: Recommendation Message Length

*For any* recommendation message, its length shall not exceed 200 characters.

**Validates: Requirements 16.5**

### Property 24: API JSON Response Format

*For any* successful API response, the content shall be valid JSON format.

**Validates: Requirements 18.6**

### Property 25: API Error Codes

*For any* invalid API request (malformed data, missing parameters, invalid city), the system shall return an appropriate HTTP error code (400 for bad request, 404 for not found, 500 for server error).

**Validates: Requirements 18.7**

### Property 26: CSV Parsing Success

*For any* valid CSV file with correct headers and data types, the system shall successfully parse and import the data.

**Validates: Requirements 21.1**

### Property 27: CSV Header Validation

*For any* CSV file with headers that do not match the expected format (city, date, temp_max, temp_min, humidity, aqi, rainfall, safety_score), the system shall return a descriptive error.

**Validates: Requirements 21.3**

### Property 28: Duplicate Record Handling

*For any* CSV import containing duplicate records (same city and date), the system shall skip the duplicate entries and import only unique records.

**Validates: Requirements 21.5**

### Property 29: API Error Messages

*For any* failed API request, the response shall include a descriptive error message.

**Validates: Requirements 22.2**

### Property 30: Export Data Completeness

*For any* comparison export, the exported file shall include all metrics displayed in the comparison (travel_score, eco_score, safety_level, pollution_level for each city).

**Validates: Requirements 24.5**

### Property 31: CSV Export Format

*For any* export to CSV format, the output shall be a valid CSV file with proper headers and comma-separated values.

**Validates: Requirements 24.2**

### Property 32: Feature Extraction Completeness

*For any* environmental data provided to the feature extractor, the output shall contain all required features: temperature, humidity, AQI, rainfall, and safety_score.

**Validates: Requirements 1.2**

