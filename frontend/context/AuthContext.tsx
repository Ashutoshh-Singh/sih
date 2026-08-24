"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { apiService } from "../services/api";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  switchPersona: (targetRole: UserRole) => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const DEFAULT_OFFICER: User = {
  id: 1,
  username: "officer.mospi",
  email: "rajesh.sharma@mospi.gov.in",
  full_name: "Dr. Rajesh Sharma",
  role: "STATISTICAL_OFFICER",
  designation: "Senior Statistical Officer (MoSPI)",
  department: "Price Statistics Division (PSD)",
  is_active: true,
  avatar_initials: "RS",
  last_login: new Date().toISOString(),
  permissions: [
    "VIEW_INDEX_METRICS",
    "EXPLORE_ROUTES",
    "AUDIT_LIVE_FARES",
    "TRIAGE_ANOMALIES",
    "EXPORT_STATISTICAL_BRIEF",
    "VIEW_QUALITY_SCORES",
    "RUN_BASKET_SIMULATION",
  ],
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_OFFICER,
  role: "STATISTICAL_OFFICER",
  token: "mospi_sec_demo_session",
  isLoading: false,
  hasPermission: () => true,
  switchPersona: async () => {},
  login: async () => true,
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEFAULT_OFFICER);
  const [token, setToken] = useState<string | null>("mospi_sec_demo_session");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrent = async () => {
    try {
      const storedRole = typeof window !== "undefined" ? localStorage.getItem("mospi_user_role") : null;
      const currentUser = await apiService.getCurrentUser(storedRole || undefined);
      setUser(currentUser);
    } catch (err) {
      console.warn("Using default officer persona:", err);
      setUser(DEFAULT_OFFICER);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === "SYSTEM_ADMIN" || user.permissions.includes("ALL_PERMISSIONS")) return true;
    return user.permissions.includes(permission);
  };

  const switchPersona = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const res = await apiService.switchDemoUser(targetRole);
      setUser(res.user);
      setToken(res.access_token);
      if (typeof window !== "undefined") {
        localStorage.setItem("mospi_user_role", targetRole);
        localStorage.setItem("mospi_access_token", res.access_token);
      }
    } catch (err) {
      console.warn("Failed backend switch, falling back locally:", err);
      // Fallback local switch
      const localUsers: Record<UserRole, User> = {
        STATISTICAL_OFFICER: DEFAULT_OFFICER,
        ECONOMIC_ADVISOR: {
          id: 2,
          username: "advisor.economic",
          email: "arvind.subramanian@mospi.gov.in",
          full_name: "Dr. Arvind Subramanian",
          role: "ECONOMIC_ADVISOR",
          designation: "Chief Economic Advisor & Director",
          department: "National Accounts & Macro Modeling Division",
          is_active: true,
          avatar_initials: "AS",
          permissions: [
            "VIEW_INDEX_METRICS",
            "EXPLORE_ROUTES",
            "RUN_CPI_SIMULATION",
            "RUN_SCENARIO_EXPERIMENTS",
            "APPROVE_MONTHLY_INDEX_RELEASE",
            "EXPORT_EXECUTIVE_BRIEF",
            "SIGN_OFF_CPI_INTEGRATION",
          ],
        },
        DATA_ENGINEER: {
          id: 3,
          username: "engineer.data",
          email: "priya.venkat@mospi.gov.in",
          full_name: "Priya Venkat",
          role: "DATA_ENGINEER",
          designation: "Lead Data Pipeline Architect",
          department: "DGCA Data Interface & Ingestion Team",
          is_active: true,
          avatar_initials: "PV",
          permissions: [
            "VIEW_INDEX_METRICS",
            "MONITOR_DATA_INGESTION",
            "TRIGGER_COLLECTION_JOBS",
            "CALIBRATE_SOURCE_ADAPTERS",
            "INSPECT_RAW_PAYLOADS",
            "RECALCULATE_QUALITY_METRICS",
          ],
        },
        SYSTEM_ADMIN: {
          id: 4,
          username: "admin.system",
          email: "amitabh.kant@mospi.gov.in",
          full_name: "Amitabh Kant",
          role: "SYSTEM_ADMIN",
          designation: "Principal System Administrator",
          department: "Statistical IT Infrastructure & Security Cell",
          is_active: true,
          avatar_initials: "AK",
          permissions: [
            "ALL_PERMISSIONS",
            "VIEW_INDEX_METRICS",
            "MANAGE_USERS_AND_ROLES",
            "AUDIT_SECURITY_LOGS",
            "CONFIGURE_SYSTEM_PARAMETERS",
          ],
        },
      };

      const fallbackUser = localUsers[targetRole] || DEFAULT_OFFICER;
      setUser(fallbackUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("mospi_user_role", targetRole);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await apiService.login(username, password);
      setUser(res.user);
      setToken(res.access_token);
      if (typeof window !== "undefined") {
        localStorage.setItem("mospi_user_role", res.user.role);
        localStorage.setItem("mospi_access_token", res.access_token);
      }
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("mospi_user_role");
      localStorage.removeItem("mospi_access_token");
    }
  };

  const refreshUser = async () => {
    await fetchCurrent();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: (user?.role || "STATISTICAL_OFFICER") as UserRole,
        token,
        isLoading,
        hasPermission,
        switchPersona,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
