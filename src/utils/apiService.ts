import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";

const API_BASE_URL = "http://localhost:8080";

// Interfaces baseadas nos DTOs da API Go
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  location: string;
  date: string; // ISO string
  description: string;
  organizer_id: string;
  attendees: string[]; // array de user IDs
  created_at: string; // ISO string
  category: string;
  limit: number;
}

export interface EventWithAttendees {
  id: string;
  name: string;
  location: string;
  date: string;
  description: string;
  organizer_id: string;
  attendees: User[];
  created_at: string;
  category: string;
  limit: number;
}

export interface CreateEventData {
  name: string;
  location: string;
  date: string; // ISO string
  description: string;
  category: string;
  limit: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface CheckAuthResponse {
  userID: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

class ApiService {
  private readonly axiosInstance: AxiosInstance;

  constructor(baseUrl: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Para incluir cookies
    });

    // Interceptor para logar requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log("Request config:", {
          url: config.url,
          method: config.method,
          headers: config.headers,
          data: config.data,
        });
        return config;
      },
      (error) => {
        console.error("Request error:", error);
        return Promise.reject(new Error(error.message ?? "Request failed"));
      }
    );

    // Interceptor para tratar erros globalmente
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error("API Error:", error.response?.data ?? error.message);
        return Promise.reject(
          new Error(error.response?.data?.error ?? error.message)
        );
      }
    );
  }

  // Auth endpoints
  async login(loginData: LoginData): Promise<LoginResponse> {
    const response = await this.axiosInstance.post("/auth/login", loginData);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.axiosInstance.get("/auth/logout");
  }

  async validateAuth(): Promise<CheckAuthResponse | null> {
    try {
      const response = await this.axiosInstance.get("/auth/check");
      return response.data;
    } catch (error) {
      console.error("Auth validation failed:", error);
      return null;
    }
  }

  // User endpoints
  async getCurrentUser(): Promise<User | null> {
    try {
      const authCheck = await this.validateAuth();
      if (!authCheck?.userID) {
        return null;
      }

      const response = await this.axiosInstance.get(
        `/users/${authCheck.userID}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const response = await this.axiosInstance.post("/users/", userData);
    return response.data;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.axiosInstance.get("/users/");
    return response.data;
  }

  // Event endpoints
  async getAllEvents(): Promise<Event[]> {
    const response = await this.axiosInstance.get("/events/");
    return response.data;
  }

  async getEventById(eventId: string): Promise<Event> {
    const response = await this.axiosInstance.get(`/events/${eventId}`);
    return response.data;
  }

  async createEvent(eventData: CreateEventData): Promise<Event> {
    console.log("Creating event with data:", eventData);
    console.log("Request headers:", this.axiosInstance.defaults.headers);

    const response = await this.axiosInstance.post("/events/", eventData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  async getEventsByUser(): Promise<Event[]> {
    const response = await this.axiosInstance.get("/events/registered");
    return response.data;
  }

  async getEventsByOrganizer(): Promise<Event[]> {
    const response = await this.axiosInstance.get("/events/organizer");
    return response.data;
  }

  async getEventsByCategory(category: string): Promise<Event[]> {
    const response = await this.axiosInstance.get("/events/category", {
      params: { category },
    });
    return response.data;
  }

  async searchEvents(term: string): Promise<Event[]> {
    const response = await this.axiosInstance.get("/events/search", {
      params: { term },
    });
    return response.data;
  }

  async registerToEvent(eventId: string): Promise<string[]> {
    const response = await this.axiosInstance.post(
      `/events/${eventId}/register`
    );
    return response.data;
  }

  async getEventWithAttendees(eventId: string): Promise<EventWithAttendees> {
    const response = await this.axiosInstance.get(
      `/events/${eventId}/organizer`
    );
    return response.data;
  }
}

export const apiService = new ApiService();
