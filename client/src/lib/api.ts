import { apiRequest } from "./queryClient";
import {
  DashboardStats,
  Dispute,
  Job,
  ModeratedContent,
  PaginatedResponse,
  PlatformMetrics,
  Review,
  User,
  UserRole,
  Badge,
  UserBadge,
  RecentActivity,
} from "@/types";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const api = {
  // Auth
  login: async (credentials: {
    identifier: string;
    password: string;
  }): Promise<LoginResponse> => {
    const response = await apiRequest("POST", "/auth/login", credentials);
    return response.json();
  },

  getMe: async (): Promise<User> => {
    const response = await apiRequest("GET", "/users/me");
    return response.json();
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiRequest("POST", "/auth/refresh", {
      refreshToken,
    });
    return response.json();
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiRequest("GET", "/admin/dashboard");
    return response.json();
  },

  getPlatformMetrics: async (
    startDate: string,
    endDate: string
  ): Promise<PlatformMetrics> => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    const response = await apiRequest("GET", `/admin/metrics?${params}`);
    return response.json();
  },

  // Users
  getUsers: async (
    page = 1,
    limit = 10,
    filters: {
      role?: UserRole;
      is_verified?: boolean;
      is_active?: boolean;
      search?: string;
    } = {}
  ): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams({
      skip: ((page - 1) * limit).toString(),
      limit: limit.toString(),
    });
    if (filters.role) params.append("role", filters.role);
    if (filters.is_verified !== undefined)
      params.append("is_verified", String(filters.is_verified));
    if (filters.is_active !== undefined)
      params.append("is_active", String(filters.is_active));
    if (filters.search) params.append("search", filters.search);

    const response = await apiRequest("GET", `/admin/users?${params}`);
    return response.json();
  },

  suspendUser: async (
    userId: number,
    data: { duration_days: number; reason: string }
  ): Promise<{ status: string }> => {
    const response = await apiRequest(
      "POST",
      `/admin/users/${userId}/suspend`,
      data
    );
    return response.json();
  },

  // Jobs
  getJobs: async (
    page = 1,
    limit = 10,
    filters: { status?: string; has_dispute?: boolean; search?: string } = {}
  ): Promise<PaginatedResponse<Job>> => {
    const params = new URLSearchParams({
      skip: ((page - 1) * limit).toString(),
      limit: limit.toString(),
    });
    if (filters.status) params.append("status", filters.status);
    if (filters.has_dispute !== undefined)
      params.append("has_dispute", String(filters.has_dispute));
    if (filters.search) params.append("search", filters.search);

    const response = await apiRequest("GET", `/admin/jobs?${params}`);
    return response.json();
  },

  // Disputes
  getDisputes: async (
    page = 1,
    limit = 10,
    filters: { status?: string } = {}
  ): Promise<PaginatedResponse<Dispute>> => {
    const params = new URLSearchParams({
      skip: ((page - 1) * limit).toString(),
      limit: limit.toString(),
    });
    if (filters.status) params.append("status", filters.status);
    const response = await apiRequest("GET", `/admin/disputes?${params}`);
    return response.json();
  },

  resolveDispute: async (
    disputeId: number,
    resolution: string
  ): Promise<{ status: string }> => {
    const response = await apiRequest(
      "POST",
      `/admin/disputes/${disputeId}/resolve`,
      { resolution }
    );
    return response.json();
  },

  // KYC
  getPendingKYC: async (
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams({
      skip: ((page - 1) * limit).toString(),
      limit: limit.toString(),
    });
    const response = await apiRequest("GET", `/admin/kyc/pending?${params}`);
    return response.json();
  },

  verifyKYC: async (
    userId: number,
    status: "approved" | "rejected",
    notes?: string
  ): Promise<any> => {
    const response = await apiRequest(
      "POST",
      `/admin/kyc/${userId}/verify`,
      { status, notes }
    );
    return response.json();
  },

  // Content Moderation
  getFlaggedContent: async (
    page = 1,
    limit = 10,
    filters: { content_type?: string; status?: string } = {}
  ): Promise<PaginatedResponse<ModeratedContent>> => {
    const params = new URLSearchParams({
      skip: ((page - 1) * limit).toString(),
      limit: limit.toString(),
    });
    if (filters.content_type)
      params.append("content_type", filters.content_type);
    if (filters.status) params.append("status", filters.status);

    const response = await apiRequest(
      "GET",
      `/admin/content-moderation?${params}`
    );
    return response.json();
  },

  moderateContent: async (
    contentId: number,
    action: string,
    reason: string
  ): Promise<{ status: string }> => {
    const response = await apiRequest(
      "POST",
      `/admin/content-moderation/${contentId}/moderate`,
      { action, reason }
    );
    return response.json();
  },

  // Other Admin Endpoints
  getStatsOverview: async (): Promise<any> => {
    const response = await apiRequest("GET", "/admin/stats/overview");
    return response.json();
  },

  getActiveDisputes: async (): Promise<any[]> => {
    const response = await apiRequest("GET", "/admin/disputes/active");
    return response.json();
  },

  getPaymentReports: async (): Promise<any[]> => {
    const response = await apiRequest("GET", "/admin/reports/payments");
    return response.json();
  },

  getPendingModeration: async (): Promise<any[]> => {
    const response = await apiRequest("GET", "/admin/moderation/pending");
    return response.json();
  },

  // Reviews
  getReviews: async (
    page = 1,
    limit = 10,
    filters: {
      user_id?: number;
      job_id?: number;
      search?: string;
    } = {}
  ): Promise<PaginatedResponse<Review>> => {
    const params = new URLSearchParams({
      skip: ((page - 1) * limit).toString(),
      limit: limit.toString(),
    });
    if (filters.user_id) params.append("user_id", String(filters.user_id));
    if (filters.job_id) params.append("job_id", String(filters.job_id));
    if (filters.search) params.append("search", filters.search);

    const response = await apiRequest("GET", `/admin/reviews?${params}`);
    return response.json();
  },

  deleteReview: async (reviewId: number): Promise<{ status: string }> => {
    const response = await apiRequest(
      "DELETE",
      `/admin/reviews/${reviewId}`
    );
    return response.json();
  },

  // Badges
  getBadges: async (
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Badge>> => {
    const params = new URLSearchParams({
      skip: ((page - 1) * limit).toString(),
      limit: limit.toString(),
    });
    const response = await apiRequest("GET", `/admin/badges?${params}`);
    return response.json();
  },

  createBadge: async (
    badgeData: Omit<Badge, "id" | "created_at" | "updated_at">
  ): Promise<Badge> => {
    const response = await apiRequest("POST", "/admin/badges", badgeData);
    return response.json();
  },

  awardBadge: async (
    badgeId: number,
    userId: number
  ): Promise<UserBadge> => {
    const response = await apiRequest(
      "POST",
      `/admin/badges/${badgeId}/award/${userId}`
    );
    return response.json();
  },

  getRecentActivity: async (): Promise<RecentActivity[]> => {
    // Mocked data since the endpoint doesn't exist yet
    return Promise.resolve([
      {
        id: 1,
        type: "user_registered",
        message: "John Doe just registered.",
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        type: "job_created",
        message: "Jane Smith created a new job: 'Frontend Developer'",
        timestamp: new Date(
          new Date().getTime() - 5 * 60 * 1000
        ).toISOString(),
      },
      {
        id: 3,
        type: "job_completed",
        message: "Job 'Backend Developer' has been completed.",
        timestamp: new Date(
          new Date().getTime() - 15 * 60 * 1000
        ).toISOString(),
      },
      {
        id: 4,
        type: "user_registered",
        message: "Alice Johnson just registered.",
        timestamp: new Date(
          new Date().getTime() - 30 * 60 * 1000
        ).toISOString(),
      },
    ]);
  },
};
