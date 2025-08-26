import { apiRequest } from "./queryClient";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  
}

export interface DashboardStats {
  totalUsers: number;
  activeJobs: number;
  pendingDisputes: number;
  monthlyRevenue: number;
}

export interface Metrics {
  userGrowth: Array<{ month: string; users: number }>;
  jobCompletion: {
    completed: number;
    inProgress: number;
    cancelled: number;
  };
}

export interface PaginatedResponse<T> {
  data?: T[];
  users?: T[];
  jobs?: T[];
  disputes?: T[];
  submissions?: T[];
  content?: T[];
  payments?: T[];
  total: number;
}

export const api = {
  // Auth
  login: async (credentials: { identifier: string; password: string }): Promise<LoginResponse> => {
    const response = await apiRequest("POST", "/api/v1/auth/login", credentials);
    return response.json();
  },

  getMe: async (): Promise<any> => {
    const response = await apiRequest("GET", "/api/v1/users/me");
    return response.json();
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiRequest("POST", "/api/v1/auth/refresh", { refreshToken });
    return response.json();
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiRequest("GET", "/api/v1/admin/dashboard");
    return response.json();
  },

  getMetrics: async (): Promise<Metrics> => {
    const response = await apiRequest("GET", "/api/v1/admin/metrics");
    return response.json();
  },

  // Users
  getUsers: async (page = 1, limit = 10, filters: any = {}): Promise<PaginatedResponse<any>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.role && { role: filters.role }),
      ...(filters.status && { status: filters.status }),
    });
    const response = await apiRequest("GET", `/api/v1/admin/users?${params}`);
    return response.json();
  },

  getUser: async (userId: string): Promise<any> => {
    const response = await apiRequest("GET", `/api/v1/users/${userId}`);
    return response.json();
  },

  verifyUser: async (userId: string): Promise<any> => {
    const response = await apiRequest("PUT", `/api/v1/users/${userId}/verify`);
    return response.json();
  },

  deactivateUser: async (userId: string): Promise<any> => {
    const response = await apiRequest("PUT", `/api/v1/users/${userId}/deactivate`);
    return response.json();
  },

  suspendUser: async (userId: string, data: { duration_days: number; reason: string }): Promise<any> => {
    const response = await apiRequest("POST", `/api/v1/admin/users/${userId}/suspend`, data);
    return response.json();
  },

  // Jobs
  getJobs: async (page = 1, limit = 10, filters: any = {}): Promise<PaginatedResponse<any>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.status && { status: filters.status }),
      ...(filters.hasDispute !== undefined && { hasDispute: filters.hasDispute.toString() }),
    });
    const response = await apiRequest("GET", `/api/v1/admin/jobs?${params}`);
    return response.json();
  },

  getJob: async (jobId: string): Promise<any> => {
    const response = await apiRequest("GET", `/api/v1/jobs/${jobId}`);
    return response.json();
  },

  // Disputes
  getDisputes: async (page = 1, limit = 10): Promise<PaginatedResponse<any>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiRequest("GET", `/api/v1/admin/disputes?${params}`);
    return response.json();
  },

  resolveDispute: async (disputeId: string, resolution: string): Promise<any> => {
    const response = await apiRequest("POST", `/api/v1/admin/disputes/${disputeId}/resolve`, { resolution });
    return response.json();
  },

  // KYC
  getPendingKYC: async (page = 1, limit = 10): Promise<PaginatedResponse<any>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiRequest("GET", `/api/v1/admin/kyc/pending?${params}`);
    return response.json();
  },

  verifyKYC: async (submissionId: string, status: "approved" | "rejected", notes?: string): Promise<any> => {
    const response = await apiRequest("POST", `/api/v1/kyc/${submissionId}/verify`, { status, notes });
    return response.json();
  },

  // Content Moderation
  getFlaggedContent: async (page = 1, limit = 10): Promise<PaginatedResponse<any>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiRequest("GET", `/api/v1/admin/content-moderation?${params}`);
    return response.json();
  },

  moderateContent: async (contentId: string, action: "approved" | "removed"): Promise<any> => {
    const response = await apiRequest("POST", `/api/v1/admin/content-moderation/${contentId}/moderate`, { action });
    return response.json();
  },

  // Payments
  getPaymentHistory: async (page = 1, limit = 10): Promise<PaginatedResponse<any>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiRequest("GET", `/api/v1/payments/history?${params}`);
    return response.json();
  },

  getPaymentReports: async (): Promise<PaginatedResponse<any>> => {
    const response = await apiRequest("GET", "/api/v1/admin/reports/payments");
    return response.json();
  },
};
