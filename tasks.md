# Implementation Plan: Advanced Tourism Dashboard

## Overview

This plan implements a full-stack tourism dashboard with ML-based scoring, interactive visualizations, city comparisons, and personalized recommendations. The backend uses Flask, Pandas, and Scikit-learn for data processing and ML algorithms. The frontend uses vanilla JavaScript with Chart.js for visualizations. Redis provides caching for performance optimization.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create backend directory structure (models, services, api, utils)
  - Create frontend directory structure (js, css, assets)
  - Set up Python virtual environment
  - Install backend dependencies: Flask 3.x, Pandas, Scikit-learn, Redis, pytest, Hypothesis
  - Install frontend dependencies: Chart.js 4.x, Jest, fast-check
  - Configure pytest and Jest testing frameworks
  - _Requirements: 7.1, 18.1_

- [x] 2. Implement ML Scoring Engine
  - [x] 2.1 Create MLScoringEngine class with travel score calculation
    - Implement calculate_travel_score method with weighted formula (40% temperature, 30% air quality, 20% precipitation, 10% comfort)
    - Apply temperature scoring (optimal: 25°C)
    - Apply air quality scoring (inverse of PM2.5)
    - Apply precipitation scoring (inverse of rainfall)
    - Apply comfort scoring (minimum temperature adequacy)
    - Return score rounded to 1 decimal place
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.4_
  
  - [x]* 2.2 Write property test for travel score range
    - **Property 1: ML model output range**
    - **Validates: Requirements 1.3, 2.1**
  
  - [x]* 2.3 Write property test for travel score input sensitivity
    - **Property 2: Travel score input sensitivity**
    - **Validates: Requirements 2.2**
  
  - [x]* 2.4 Write property test for travel score precision
    - **Property 4: Travel score precision**
    - **Validates: Requirements 2.4**

- [x] 3. Implement Eco Score calculation
  - [x] 3.1 Add calculate_eco_score method to MLScoringEngine
    - Implement weighted formula (60% air quality, 25% temperature, 15% humidity)
    - Apply AQI constraint: cap score at 30 when AQI > 200
    - Normalize to 0-100 scale
    - Return score rounded to 1 decimal place
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x]* 3.2 Write property test for eco score range
    - **Property 5: Eco score range**
    - **Validates: Requirements 3.4**
  
  - [x]* 3.3 Write property test for eco score AQI constraint
    - **Property 6: Eco score AQI constraint**
    - **Validates: Requirements 3.5**

- [x] 4. Implement classification methods
  - [x] 4.1 Add classify_safety_level method to MLScoringEngine
    - Implement three-tier classification: Safe (>70), Moderate (40-70), Unsafe (<40)
    - Return string classification
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 4.2 Add classify_pollution_level method to MLScoringEngine
    - Implement four-tier classification: Good (0-50), Moderate (51-100), Unhealthy (101-200), Hazardous (>200)
    - Return string classification
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x]* 4.3 Write property test for safety level classification
    - **Property 7: Safety level classification**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
  
  - [x]* 4.4 Write property test for pollution level classification
    - **Property 8: Pollution level classification**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [x] 5. Implement Data Validator
  - [x] 5.1 Create DataValidator class with validation rules
    - Define validation rules for temperature (-50 to 60°C)
    - Define validation rules for humidity (0-100%)
    - Define validation rules for AQI (non-negative)
    - Define validation rules for rainfall (non-negative)
    - Define validation rules for safety_score (0-100)
    - Define validation rules for date format (YYYY-MM-DD)
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_
  
  - [x] 5.2 Implement validate_environmental_data method
    - Check all fields against validation rules
    - Return tuple (is_valid, error_message)
    - Generate descriptive error messages for violations
    - _Requirements: 7.6, 7.7, 19.7_
  
  - [x] 5.3 Implement validate_csv_structure method
    - Check for required columns: city, date, temp_max, temp_min, humidity, aqi, rainfall, safety_score
    - Return tuple (is_valid, error_message)
    - _Requirements: 21.2, 21.3_
  
  - [x] 5.4 Implement sanitize_input method
    - Convert and sanitize input values by field type
    - Handle type conversions safely
    - _Requirements: 7.6_
  
  - [ ]* 5.5 Write property test for data validation rules
    - **Property 11: Data validation rules**
    - **Validates: Requirements 7.3, 7.4, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6**
  
  - [ ]* 5.6 Write property test for missing data error handling
    - **Property 3: Missing data error handling**
    - **Validates: Requirements 2.3, 7.7**
  
  - [ ]* 5.7 Write property test for CSV header validation
    - **Property 27: CSV header validation**
    - **Validates: Requirements 21.3**

- [x] 6. Checkpoint - Ensure core validation and scoring tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Aggregation Service
  - [x] 7.1 Create AggregationService class
    - Implement aggregate_monthly method
    - Group daily data by city and month
    - Compute average temp_max, temp_min, humidity, AQI, safety_score
    - Compute total rainfall
    - Compute average travel_score and eco_score
    - Return DataFrame with monthly aggregates
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [x] 7.2 Implement get_best_season method
    - Identify month(s) with highest average travel score
    - Handle ties (within 5 points) by including all optimal months
    - Return dict with best_months, score, and reasoning
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ]* 7.3 Write property test for monthly aggregation correctness
    - **Property 12: Monthly aggregation correctness**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.5**
  
  - [ ]* 7.4 Write property test for best season selection
    - **Property 14: Best season selection**
    - **Validates: Requirements 13.2**
  
  - [ ]* 7.5 Write property test for best season tie handling
    - **Property 15: Best season tie handling**
    - **Validates: Requirements 13.5**

- [x] 8. Implement Cache Manager
  - [x] 8.1 Create CacheManager class with Redis integration
    - Initialize with Redis client and TTL (default 24 hours)
    - Implement get_city_data method
    - Implement set_city_data method
    - Implement get_monthly_data method
    - Implement set_monthly_data method
    - Implement invalidate_cache method with pattern matching
    - Implement is_stale method to check TTL
    - _Requirements: 23.1, 23.2, 23.3_
  
  - [ ]* 8.2 Write unit tests for cache operations
    - Test cache hit and miss scenarios
    - Test TTL expiration
    - Test cache invalidation
    - _Requirements: 23.1, 23.2, 23.3_

- [x] 9. Implement Recommendation Engine
  - [x] 9.1 Create RecommendationEngine class
    - Implement generate_recommendations method
    - Filter cities by temperature range preference
    - Filter cities by max AQI preference
    - Filter cities by min safety preference
    - Calculate travel scores for filtered cities
    - Sort recommendations by score descending
    - Return list of recommendation dicts
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_
  
  - [x] 9.2 Implement generate_reasoning method
    - Generate reasoning based on weather conditions
    - Generate reasoning based on pollution levels
    - Generate reasoning based on safety assessment
    - Limit message to 200 characters
    - Use positive language for favorable conditions
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_
  
  - [ ]* 9.3 Write property test for recommendation filtering
    - **Property 18: Recommendation filtering**
    - **Validates: Requirements 15.3**
  
  - [ ]* 9.4 Write property test for recommendation ranking
    - **Property 19: Recommendation ranking**
    - **Validates: Requirements 15.4**
  
  - [ ]* 9.5 Write property test for recommendation minimum result
    - **Property 20: Recommendation minimum result**
    - **Validates: Requirements 15.5**
  
  - [ ]* 9.6 Write property test for no match message
    - **Property 21: No match message**
    - **Validates: Requirements 15.6**
  
  - [ ]* 9.7 Write property test for recommendation message presence
    - **Property 22: Recommendation message presence**
    - **Validates: Requirements 16.1**
  
  - [ ]* 9.8 Write property test for recommendation message length
    - **Property 23: Recommendation message length**
    - **Validates: Requirements 16.5**

- [x] 10. Checkpoint - Ensure backend services tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [-] 11. Implement Flask API endpoints
  - [x] 11.1 Create Flask app with error handling and logging
    - Set up Flask application factory
    - Configure CORS for frontend access
    - Set up error handlers for 400, 404, 500
    - Configure logging with timestamps and severity levels
    - _Requirements: 18.7, 22.1, 22.2, 22.5, 22.6_
  
  - [x] 11.2 Implement GET /api/cities endpoint
    - Return list of available cities
    - Return JSON response
    - _Requirements: 17.2, 18.6_
  
  - [x] 11.3 Implement GET /api/city/<city_name>/score endpoint
    - Accept city_name and date query parameter
    - Check cache first
    - Load CSV data and filter by city and date
    - Calculate travel_score and eco_score using MLScoringEngine
    - Classify safety_level and pollution_level
    - Store result in cache
    - Return JSON with all metrics
    - Handle missing data with 404 error
    - _Requirements: 1.5, 18.1, 18.6, 18.7, 23.1, 23.2_
  
  - [x] 11.4 Implement GET /api/city/<city_name>/monthly endpoint
    - Accept city_name parameter
    - Check cache first
    - Load CSV data and aggregate monthly using AggregationService
    - Calculate best_season using get_best_season
    - Store result in cache
    - Return JSON with monthly_data and best_season
    - _Requirements: 18.2, 18.6, 23.1_
  
  - [x] 11.5 Implement POST /api/compare endpoint
    - Accept JSON body with cities array (2-5 cities) and date
    - Validate city count (2-5)
    - Retrieve score data for each city
    - Return JSON with comparison array
    - Complete within 1 second
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 18.3, 18.6_
  
  - [x] 11.6 Implement POST /api/recommendations endpoint
    - Accept JSON body with preferences (temp_range, max_aqi, min_safety)
    - Load all cities data
    - Generate recommendations using RecommendationEngine
    - Return JSON with recommendations array
    - _Requirements: 15.1, 15.2, 18.4, 18.6_
  
  - [x] 11.7 Implement GET /api/city/<city_name>/attractions endpoint
    - Accept city_name parameter
    - Load tourist attraction data for city
    - Return JSON with attractions array (minimum 3 entries)
    - Each attraction includes name, description, category, image_url, rating
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 18.5, 18.6_
  
  - [ ] 11.8 Implement POST /api/import/csv endpoint
    - Accept multipart/form-data with CSV file
    - Validate CSV structure using DataValidator
    - Parse CSV using Pandas
    - Validate each record
    - Skip duplicate records (same city and date)
    - Log import progress and errors
    - Return JSON with status, records_imported, duplicates_skipped, errors
    - Process at least 1000 records per second
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 22.3, 22.4_
  
  - [ ] 11.9 Implement GET /api/export/comparison endpoint
    - Accept query parameters: cities (comma-separated), format (csv or pdf)
    - Retrieve comparison data
    - Generate CSV or PDF file
    - Return file download within 3 seconds
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_
  
  - [ ]* 11.10 Write property test for API JSON response format
    - **Property 24: API JSON response format**
    - **Validates: Requirements 18.6**
  
  - [ ]* 11.11 Write property test for API error codes
    - **Property 25: API error codes**
    - **Validates: Requirements 18.7**
  
  - [ ]* 11.12 Write property test for API error messages
    - **Property 29: API error messages**
    - **Validates: Requirements 22.2**
  
  - [ ]* 11.13 Write property test for comparison output completeness
    - **Property 9: Comparison output completeness**
    - **Validates: Requirements 6.3**
  
  - [ ]* 11.14 Write property test for environmental data schema
    - **Property 10: Environmental data schema**
    - **Validates: Requirements 7.1**
  
  - [ ]* 11.15 Write property test for CSV parsing success
    - **Property 26: CSV parsing success**
    - **Validates: Requirements 21.1**
  
  - [ ]* 11.16 Write property test for duplicate record handling
    - **Property 28: Duplicate record handling**
    - **Validates: Requirements 21.5**
  
  - [ ]* 11.17 Write property test for export data completeness
    - **Property 30: Export data completeness**
    - **Validates: Requirements 24.5**
  
  - [ ]* 11.18 Write property test for CSV export format
    - **Property 31: CSV export format**
    - **Validates: Requirements 24.2**
  
  - [ ]* 11.19 Write property test for feature extraction completeness
    - **Property 32: Feature extraction completeness**
    - **Validates: Requirements 1.2**

- [ ] 12. Checkpoint - Ensure all backend API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement frontend dashboard HTML structure
  - [x] 13.1 Create index.html with responsive layout
    - Add city selector dropdown
    - Add score display cards (Travel Score, Eco Score, Safety, Pollution)
    - Add best season indicator section
    - Add canvas elements for 4 charts (Travel Score, AQI, Temperature, Rainfall)
    - Add city comparison section with multi-select
    - Add recommendation section with preference form
    - Add tourist attractions carousel
    - Add export buttons
    - Use semantic HTML5 elements
    - _Requirements: 17.1, 17.4, 20.1, 20.6_
  
  - [x] 13.2 Create responsive CSS styles
    - Implement responsive grid layout (320px to 1920px)
    - Style score cards with visual indicators
    - Style comparison table with color coding
    - Style recommendation cards
    - Implement consistent color scheme
    - Add hover effects and transitions
    - _Requirements: 20.2, 20.4, 20.5_

- [x] 14. Implement frontend JavaScript API client
  - [x] 14.1 Create api.js module with fetch wrappers
    - Implement getCities function
    - Implement getCityScore function
    - Implement getCityMonthly function
    - Implement compareCities function
    - Implement getRecommendations function
    - Implement getCityAttractions function
    - Implement importCSV function
    - Implement exportComparison function
    - Add error handling for all API calls
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [ ]* 14.2 Write unit tests for API client
    - Test successful API calls
    - Test error handling
    - Test request formatting
    - _Requirements: 18.6, 18.7_

- [x] 15. Implement Chart.js visualizations
  - [x] 15.1 Create TravelScoreChart class
    - Implement render method with line chart
    - Fetch monthly data from API
    - Configure Chart.js with labels, datasets, and options
    - Add hover tooltips showing exact values
    - Add axis labels and title
    - Render within 500ms of receiving data
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 23.4_
  
  - [x] 15.2 Create AQIChart class
    - Implement render method with bar chart
    - Fetch monthly data from API
    - Apply color coding: Green (0-50), Yellow (51-100), Orange (101-200), Red (>200)
    - Add legend explaining color codes
    - Add hover tooltips showing AQI value and level
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 15.3 Create TemperatureChart class
    - Implement render method with line chart
    - Fetch monthly data from API
    - Display temperature in Celsius
    - Add hover tooltips showing exact temperature
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 15.4 Create RainfallChart class
    - Implement render method with bar chart
    - Fetch monthly data from API
    - Display rainfall in millimeters
    - Add hover tooltips showing exact rainfall amount
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ]* 15.5 Write property test for visualization data completeness
    - **Property 13: Visualization data completeness**
    - **Validates: Requirements 9.2, 10.2, 11.2, 12.2**

- [x] 16. Implement city comparison component
  - [x] 16.1 Create CityComparison class
    - Implement compare method accepting 2-5 cities
    - Validate city count
    - Fetch comparison data from API
    - Render comparison table with aligned columns
    - Apply color coding for safety and pollution levels
    - Complete within 1 second
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 16.2 Implement renderTable method
    - Generate HTML table with headers
    - Populate rows with city data
    - Apply CSS classes for visual indicators
    - _Requirements: 6.4, 20.5_
  
  - [ ]* 16.3 Write unit tests for comparison component
    - Test table rendering
    - Test color coding
    - Test validation
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 17. Implement recommendation component
  - [x] 17.1 Create RecommendationComponent class
    - Implement getRecommendations method
    - Collect user preferences from form
    - Fetch recommendations from API
    - Render recommendation cards with reasoning
    - Display ranking
    - Handle no matches scenario
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_
  
  - [x] 17.2 Implement renderRecommendations method
    - Generate HTML cards for each recommendation
    - Display city name, travel score, and reasoning
    - Apply visual ranking indicators
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_
  
  - [ ]* 17.3 Write unit tests for recommendation component
    - Test preference collection
    - Test card rendering
    - Test no matches message
    - _Requirements: 15.5, 15.6_

- [x] 18. Implement dashboard controller
  - [x] 18.1 Create DashboardController class
    - Initialize all chart components
    - Initialize comparison component
    - Initialize recommendation component
    - Implement city selection handler
    - Implement data loading with loading states
    - Load initial data within 2 seconds
    - Provide immediate visual feedback on interactions
    - _Requirements: 17.1, 17.3, 20.1, 20.3, 20.4_
  
  - [x] 18.2 Implement updateDashboard method
    - Fetch city score data
    - Update score display cards
    - Fetch monthly data
    - Update best season indicator
    - Render all 4 charts
    - Fetch and display tourist attractions
    - _Requirements: 13.1, 13.3, 13.4, 14.1, 14.5_
  
  - [x] 18.3 Add keyboard navigation support
    - Implement keyboard handlers for city selection
    - Add focus management
    - _Requirements: 17.5_
  
  - [ ]* 18.4 Write unit tests for dashboard controller
    - Test initialization
    - Test city selection
    - Test data loading
    - _Requirements: 17.3, 20.3_

- [ ] 19. Checkpoint - Ensure frontend components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Implement tourist attractions display
  - [x] 20.1 Create TouristAttractions class
    - Implement render method
    - Fetch attractions from API
    - Display minimum 3 attractions per city
    - Show name, description, category, image, rating
    - Implement carousel or grid layout
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [ ]* 20.2 Write property test for tourist attraction minimum count
    - **Property 16: Tourist attraction minimum count**
    - **Validates: Requirements 14.2**
  
  - [ ]* 20.3 Write property test for tourist attraction structure
    - **Property 17: Tourist attraction structure**
    - **Validates: Requirements 14.3**

- [ ] 21. Implement CSV import/export UI
  - [ ] 21.1 Create file upload component
    - Add file input for CSV upload
    - Implement upload handler
    - Show progress feedback for large files (>10000 records)
    - Display import results (records imported, duplicates skipped, errors)
    - _Requirements: 21.1, 21.4, 21.5, 21.6_
  
  - [ ] 21.2 Create export component
    - Add export buttons for CSV and PDF
    - Implement export handlers
    - Trigger file download
    - Show loading state during export (max 3 seconds)
    - _Requirements: 24.1, 24.2, 24.3, 24.4_
  
  - [ ]* 21.3 Write unit tests for import/export UI
    - Test file upload
    - Test progress display
    - Test export triggers
    - _Requirements: 21.6, 24.4_

- [ ] 22. Set up Redis cache and data migration
  - [ ] 22.1 Configure Redis connection
    - Set up Redis client with connection pooling
    - Configure TTL to 24 hours
    - Add connection error handling
    - _Requirements: 23.1, 23.3_
  
  - [ ] 22.2 Create data migration script
    - Load existing CSV data (weather_aqi_data.csv)
    - Validate data using DataValidator
    - Import into system
    - Pre-populate cache with frequently accessed cities
    - _Requirements: 7.1, 21.1_
  
  - [ ]* 22.3 Write unit tests for Redis operations
    - Test connection handling
    - Test cache operations
    - Test TTL behavior
    - _Requirements: 23.1, 23.2, 23.3_

- [ ] 23. Implement error handling and logging
  - [ ] 23.1 Set up Python logging configuration
    - Configure log format with timestamps and severity levels
    - Set up file handlers for different log levels
    - Configure console output for development
    - _Requirements: 22.5_
  
  - [ ] 23.2 Add error logging to all components
    - Log ML model errors with input parameters
    - Log data validation failures
    - Log API request failures
    - Log successful data imports with record counts
    - _Requirements: 22.1, 22.2, 22.3, 22.4_
  
  - [ ] 23.3 Implement frontend error handling
    - Add try-catch blocks around API calls
    - Display user-friendly error messages
    - Implement retry mechanisms for transient failures
    - Show loading states during API calls
    - _Requirements: 20.4, 22.2_
  
  - [ ] 23.4 Add admin alerts for critical errors
    - Implement alert mechanism for critical errors
    - Configure alert thresholds
    - _Requirements: 22.6_

- [ ] 24. Checkpoint - Ensure error handling and logging work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 25. Performance optimization and testing
  - [ ] 25.1 Optimize cache strategy
    - Implement cache warming for popular cities
    - Add cache hit/miss metrics
    - Verify cache returns data within 100ms
    - _Requirements: 23.1, 23.2_
  
  - [ ] 25.2 Optimize API response times
    - Verify ML predictions return within 500ms
    - Verify city selection loads data within 1 second
    - Verify comparison completes within 1 second
    - _Requirements: 1.5, 17.3, 6.5_
  
  - [ ] 25.3 Optimize visualization rendering
    - Verify charts render within 500ms of receiving data
    - Implement lazy loading for off-screen charts
    - _Requirements: 23.4_
  
  - [ ] 25.4 Load testing
    - Test system with 100 concurrent users
    - Verify no performance degradation
    - Identify and fix bottlenecks
    - _Requirements: 23.5_
  
  - [ ]* 25.5 Write performance tests
    - Test cache response times
    - Test API response times
    - Test visualization rendering times
    - _Requirements: 1.5, 23.2, 23.4_

- [ ] 26. Integration testing
  - [ ] 26.1 Test end-to-end city score flow
    - Select city from dropdown
    - Verify score calculation
    - Verify visualization rendering
    - Verify best season display
    - _Requirements: 17.1, 17.3, 2.1, 9.1, 13.1_
  
  - [ ] 26.2 Test city comparison flow
    - Select 2-5 cities
    - Verify comparison table rendering
    - Verify color coding
    - Test export functionality
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 24.1_
  
  - [ ] 26.3 Test recommendation flow
    - Input user preferences
    - Verify filtering logic
    - Verify ranking
    - Verify reasoning messages
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 16.1_
  
  - [ ] 26.4 Test CSV import flow
    - Upload CSV file
    - Verify validation
    - Verify duplicate handling
    - Verify import results display
    - _Requirements: 21.1, 21.2, 21.3, 21.5_
  
  - [ ]* 26.5 Write integration tests
    - Test complete user workflows
    - Test error scenarios
    - Test edge cases
    - _Requirements: 20.1, 20.3_

- [ ] 27. Final checkpoint - Ensure all tests pass and system is functional
  - Run all unit tests (backend and frontend)
  - Run all property-based tests (32 properties)
  - Run all integration tests
  - Verify code coverage meets goals (85% backend, 75% frontend)
  - Test responsive design on multiple screen sizes
  - Test all API endpoints
  - Verify all visualizations render correctly
  - Test error handling scenarios
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation throughout implementation
- Backend uses Python 3.10+, Flask 3.x, Pandas, Scikit-learn, Redis
- Frontend uses vanilla JavaScript ES6+, Chart.js 4.x
- Testing uses pytest + Hypothesis (backend), Jest + fast-check (frontend)
- All 32 correctness properties from the design document are covered by property-based tests
