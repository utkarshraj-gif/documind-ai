import {
  AuthResponse,
  User,
  DocumentItem,
  DocumentDetail,
  DocumentAnalysis,
  ChatMessage,
  ChatHistory,
  DashboardStats,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("proofline_token");
}

export function setStoredToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("proofline_token", token);
  }
}

export function clearStoredToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("proofline_token");
    localStorage.removeItem("proofline_user");
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (token && !headers["Authorization" as keyof typeof headers]) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  // Set default JSON Content-Type only if not FormData
  if (!(options.body instanceof FormData) && !headers["Content-Type" as keyof typeof headers]) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err: any) {
    throw new ApiError(
      "Unable to connect to the Proofline server. Please ensure the backend is running.",
      0,
      err
    );
  }

  if (res.status === 204) {
    return {} as T;
  }

  let data: any = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      clearStoredToken();
    }
    const errorMessage = data?.detail || data?.message || "An unexpected error occurred.";
    throw new ApiError(errorMessage, res.status, data);
  }

  return data as T;
}

// ==========================================
// AUTH API
// ==========================================
export const authApi = {
  signup: async (payload: { name: string; email: string; password: string; confirm_password: string }): Promise<AuthResponse> => {
    const res = await request<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setStoredToken(res.access_token);
    if (typeof window !== "undefined") {
      localStorage.setItem("proofline_user", JSON.stringify(res.user));
    }
    return res;
  },

  login: async (payload: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setStoredToken(res.access_token);
    if (typeof window !== "undefined") {
      localStorage.setItem("proofline_user", JSON.stringify(res.user));
    }
    return res;
  },

  getMe: async (): Promise<User> => {
    return request<User>("/api/auth/me", { method: "GET" });
  },

  updateProfile: async (payload: { name: string }): Promise<User> => {
    const user = await request<User>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("proofline_user", JSON.stringify(user));
    }
    return user;
  },

  logout: () => {
    clearStoredToken();
  },
};

// ==========================================
// DOCUMENT API
// ==========================================
export const documentApi = {
  upload: async (file: File): Promise<DocumentDetail> => {
    const formData = new FormData();
    formData.append("file", file);

    return request<DocumentDetail>("/api/documents/upload", {
      method: "POST",
      body: formData,
    });
  },

  list: async (params?: { search?: string; sort?: "asc" | "desc"; status_filter?: string }): Promise<{ documents: DocumentItem[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.status_filter) query.set("status_filter", params.status_filter);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<{ documents: DocumentItem[]; total: number }>(`/api/documents${qs}`, {
      method: "GET",
    });
  },

  get: async (id: string): Promise<DocumentDetail> => {
    return request<DocumentDetail>(`/api/documents/${id}`, { method: "GET" });
  },

  delete: async (id: string): Promise<void> => {
    return request<void>(`/api/documents/${id}`, { method: "DELETE" });
  },

  getFileUrl: (id: string): string => {
    const token = getStoredToken();
    return `${API_BASE_URL}/api/documents/${id}/file?token=${token || ""}`;
  },
};

// ==========================================
// ANALYSIS API
// ==========================================
export const analysisApi = {
  analyze: async (documentId: string): Promise<DocumentAnalysis> => {
    return request<DocumentAnalysis>(`/api/documents/${documentId}/analyze`, {
      method: "POST",
    });
  },

  regenerateSummary: async (documentId: string): Promise<DocumentAnalysis> => {
    return request<DocumentAnalysis>(`/api/documents/${documentId}/summary`, {
      method: "POST",
    });
  },
};

// ==========================================
// CHAT API
// ==========================================
export const chatApi = {
  ask: async (documentId: string, question: string): Promise<ChatMessage> => {
    return request<ChatMessage>(`/api/documents/${documentId}/chat`, {
      method: "POST",
      body: JSON.stringify({ question }),
    });
  },

  getHistory: async (documentId: string): Promise<ChatHistory> => {
    return request<ChatHistory>(`/api/documents/${documentId}/chat`, {
      method: "GET",
    });
  },
};

// ==========================================
// DASHBOARD API
// ==========================================
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    return request<DashboardStats>("/api/dashboard/stats", { method: "GET" });
  },
};
