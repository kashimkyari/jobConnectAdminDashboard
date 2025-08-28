export enum UserRole {
  WORKER = "worker",
  EMPLOYER = "employer",
  ADMIN = "admin",
}

export enum JobStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  DISPUTED = "disputed",
}

export enum ContentType {
  MESSAGE = "message",
  JOB = "job",
  REVIEW = "review",
  PROFILE = "profile",
}

export interface User {
  id: number;
  email: string;
  phone?: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  avatar_url?: string;
  reputation_score: number;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  budget: number;
  location?: string;
  location_type: string;
  status: JobStatus;
  employer_id: number;
  created_at: string;
  updated_at: string;
  is_high_value: boolean;
  escrow_required: boolean;
  commission_rate: number;
  completed_at?: string;
}

export interface Dispute {
  id: number;
  job_id: number;
  employer_id: number;
  worker_id: number;
  reason: string;
  status: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
}

export interface ModeratedContent {
  id: number;
  content_type: ContentType;
  content_id: number;
  content_preview: string;
  reporter_id?: number;
  reporter_name?: string;
  reason: string;
  status: string;
  created_at: string;
  moderated_at?: string;
  moderator_id?: number;
  moderator_name?: string;
  action_taken?: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  users?: T[];
  jobs?: T[];
  disputes?: T[];
  content?: T[];
  items?: T[];
  badges?: T[];
}

export interface DashboardStats {
  total_users: number;
  new_users_today: number;
  active_users_last_7_days: number;
  active_jobs: number;
  completed_jobs: number;
  total_disputes: number;
  open_disputes: number;
  pending_verifications: number;
  platform_earnings: number;
  platform_earnings_last_7_days: number;
  user_growth_rate: number;
  job_completion_rate: number;
}

export interface DailyGrowth {
  date: string;
  count: number;
}

export interface UserGrowth {
  daily_growth: DailyGrowth[];
}

export interface JobsMetrics {
  completion_rate: number;
}

export interface PaymentsMetrics {
  total_volume: number;
  transaction_count: number;
}

export interface EngagementMetrics {
  message_count: number;
  review_count: number;
}

export interface PlatformMetrics {
  user_growth: UserGrowth;
  jobs: JobsMetrics;
  payments: PaymentsMetrics;
  engagement: EngagementMetrics;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  job_id: number;
  reviewer_id: number;
  reviewee_id: number;
  created_at: string;
  updated_at: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  reviewee_name: string;
  reviewee_avatar?: string;
  job_title: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<string, number>;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  criteria: string;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  awarded_at: string;
}

export interface RecentActivity {
  id: number;
  type: "user_registered" | "job_created" | "job_completed";
  message: string;
  timestamp: string;
}

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  created_at: string;
  user_id: number;
}
