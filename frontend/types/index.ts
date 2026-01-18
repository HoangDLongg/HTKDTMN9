/**
 * TypeScript type definitions for the application
 * Based on Django backend models
 */

// ============================================================================
// Core Types (Users, Roles)
// ============================================================================

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface User {
  id: number;
  username: string;
  full_name?: string;
  email?: string;
  phone?: string;
  password_hash?: string;
  role?: number;
  role_details?: Role;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

// ============================================================================
// Location Types
// ============================================================================

export interface Province {
  province_id: number;
  province_code: string;
  province_name: string;
}

export interface District {
  district_id: number;
  district_code: string;
  district_name: string;
  province: number;
  province_details?: Province;
}

export interface Ward {
  id: number;
  code: string;
  name: string;
  district?: number;
  district_details?: District;
}

// ============================================================================
// Crop Types
// ============================================================================

export interface Crop {
  id: number;
  code: string;
  name: string;
  scientific_name?: string;
  category?: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TechnicalProcess {
  process_id: number;
  crop: number;
  crop_details?: Crop;
  process_name: string;
  description?: string;
  total_duration_days?: number;
  created_at: string;
}

export interface ProcessStage {
  stage_id: number;
  process: number;
  process_details?: TechnicalProcess;
  stage_name: string;
  stage_order: number;
  duration_days?: number;
  description?: string;
}

export interface StageTask {
  task_id: number;
  stage: number;
  stage_details?: ProcessStage;
  task_name: string;
  task_order: number;
  day_after_start?: number;
  description?: string;
  estimated_hours?: number;
}

// ============================================================================
// Farm Types
// ============================================================================

export interface Cooperative {
  coop_id: number;
  coop_name: string;
  address?: string;
  province?: number;
  province_details?: Province;
  district?: number;
  district_details?: District;
  ward?: number;
  ward_details?: Ward;
  contact_person?: string;
  phone_number?: string;
  email?: string;
  created_at: string;
}

export interface Farmer {
  id: number;
  user?: number;
  user_details?: User;
  farmer_code: string;
  cooperative?: number;
  cooperative_details?: Cooperative;
  address?: string;
  ward?: number;
  ward_details?: Ward;
  id_card?: string;
  bank_account?: string;
  bank_name?: string;
  created_at?: string;
}

export interface Farm {
  id: number;
  farmer: number;
  farmer_details?: Farmer;
  name: string;
  area_hectare?: number;
  location_lat?: number;
  location_lng?: number;
  ward?: number;
  ward_details?: Ward;
  soil_type?: string;
  water_source?: string;
  notes?: string;
  created_at?: string;
}

// ============================================================================
// Season Types
// ============================================================================

export interface Season {
  id: number;
  season_code: string;
  farm: number;
  farm_name?: string;
  farm_details?: Farm;
  crop: number;
  crop_name?: string;
  crop_details?: Crop;
  process?: number;
  process_details?: TechnicalProcess;
  start_date: string;
  expected_harvest_date?: string;
  actual_harvest_date?: string;
  area_planted?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'failed';
  expected_yield?: string;
  actual_yield?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface DailyTask {
  id: number;
  season: number;
  season_details?: Season;
  stage_task?: number;
  stage_task_details?: StageTask;
  task_name: string;
  description?: string;
  due_date: string;
  is_completed?: boolean;
  completed_at?: string;
  completed_by?: number;
  completed_by_details?: User;
  notes?: string;
  created_at?: string;
}

export interface FarmingLog {
  id: number;
  season: number;
  season_details?: Season;
  daily_task?: number;
  daily_task_details?: DailyTask;
  log_date: string;
  activity_type?: string;
  description?: string;
  materials_used?: string;
  quantity_used?: string;
  cost?: string;
  weather_condition?: string;
  images?: string;
  logged_by?: number;
  logged_by_details?: User;
  created_at?: string;
  logged_by?: number;
  logged_by_details?: User;
  created_at: string;
}

// ============================================================================
// Market Types
// ============================================================================

export interface PriceSource {
  id: number;
  name: string;
  source_type?: string;
  url?: string;
  is_active?: boolean;
}

export interface MarketPrice {
  id: number;
  crop?: number;
  crop_details?: Crop;
  price_date: string;
  price_min?: string;
  price_max?: string;
  price_avg?: string;
  market_location?: string;
  source?: number;
  source_details?: PriceSource;
  notes?: string;
  created_at?: string;
}

export interface DemandForecast {
  id: number;
  crop?: number;
  crop_details?: Crop;
  forecast_date: string;
  forecast_for_month: string;
  predicted_demand?: string;
  predicted_price?: string;
  confidence_score?: string;
  model_version?: string;
  created_at?: string;
}

export interface PlantingRecommendation {
  id: number;
  cooperative?: number;
  cooperative_details?: Cooperative;
  crop?: number;
  crop_name?: string;
  crop_details?: Crop;
  recommended_area?: string;
  recommended_start_date?: string;
  expected_price?: string;
  reason?: string;
  priority_level?: number;
  status?: string;
  created_at?: string;
}

export interface SeasonRegistration {
  id: number;
  recommendation: number;
  recommendation_details?: PlantingRecommendation;
  farmer: number;
  farmer_details?: Farmer;
  farmer_name?: string;
  farm: number;
  farm_details?: Farm;
  farm_name?: string;
  farm_area?: string;
  area_registered: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  approved_by?: number;
  approved_by_details?: User;
  approved_at?: string;
  season?: number;
  season_details?: Season;
  crop_name?: string;
  crop_id?: number;
  expected_price?: string;
  recommended_start_date?: string;
}
  crop_details?: Crop;
  forecast_date: string;
  forecast_month: string;
  predicted_demand_kg?: number;
  predicted_price_per_kg?: number;
  confidence_score?: number;
  model_version?: string;
  created_at: string;
}

export interface PlantingRecommendation {
  recommendation_id: number;
  crop: number;
  crop_details?: Crop;
  province?: number;
  province_details?: Province;
  district?: number;
  district_details?: District;
  recommended_month: string;
  reason?: string;
  expected_profit_per_hectare?: number;
  created_at: string;
}

// ============================================================================
// Chatbot Types
// ============================================================================

export interface ChatLog {
  log_id: number;
  user?: number;
  user_details?: User;
  message: string;
  response?: string;
  intent?: string;
  confidence_score?: number;
  created_at: string;
}

export interface Faq {
  faq_id: number;
  question: string;
  answer: string;
  category?: string;
  created_at: string;
}

export interface Alert {
  alert_id: number;
  alert_type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  target_user?: number;
  target_user_details?: User;
  created_at: string;
  is_read: boolean;
}

export interface Notification {
  notification_id: number;
  user: number;
  user_details?: User;
  notification_type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SeasonProgress {
  season: Season;
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  days_elapsed: number;
  days_remaining: number;
  current_stage?: ProcessStage;
}

export interface PriceTrend {
  crop: Crop;
  prices: Array<{
    date: string;
    price: number;
    source: string;
  }>;
  average_price: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  change_percentage: number;
}

export interface MarketComparison {
  crop: Crop;
  date: string;
  markets: Array<{
    source: PriceSource;
    price: number;
  }>;
  highest_price: number;
  lowest_price: number;
  average_price: number;
}
