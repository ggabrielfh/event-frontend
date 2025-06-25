import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import { apiService } from "../utils/apiService";
import type { User } from "../utils/apiService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setIsLoading(true);

      // Primeiro verifica se há dados no localStorage (fallback)
      const localAuth = localStorage.getItem("isLoggedIn");
      const localUser = localStorage.getItem("userEmail");

      // Verifica com a API se o token ainda é válido e pega o userID
      const authCheck = await apiService.validateAuth();

      if (authCheck?.userID) {
        // Se o token é válido, tenta buscar os dados do usuário atual
        const currentUser = await apiService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);

          // Atualiza o localStorage com os dados da API
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userEmail", currentUser.email);
          localStorage.setItem("userId", currentUser.id);
          localStorage.setItem(
            "userName",
            currentUser.name || currentUser.email.split("@")[0]
          );
          localStorage.setItem("userType", "organizer");
        }
      } else if (localAuth === "true" && localUser) {
        // Se não conseguiu validar com a API mas há dados locais, remove eles
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userType");
        setUser(null);
        setIsAuthenticated(false);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);

      // Remove dados locais em caso de erro
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userType");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await apiService.login({ email, password });

      if (response.token) {
        // Depois do login bem-sucedido, busca os dados do usuário
        const currentUser = await apiService.getCurrentUser();

        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);

          // Atualiza o localStorage
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userEmail", currentUser.email);
          localStorage.setItem("userId", currentUser.id);
          localStorage.setItem(
            "userName",
            currentUser.name || currentUser.email.split("@")[0]
          );
          localStorage.setItem("userType", "organizer");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      await apiService.logout();

      // Limpa o estado
      setUser(null);
      setIsAuthenticated(false);

      // Remove dados do localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userType");
    } catch (error) {
      console.error("Logout failed:", error);
      // Mesmo se falhar, limpa o estado local
      setUser(null);
      setIsAuthenticated(false);
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      checkAuth,
    }),
    [user, isAuthenticated, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
