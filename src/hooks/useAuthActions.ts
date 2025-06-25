import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuthActions = () => {
  const { logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Mesmo com erro, redireciona para login
      navigate("/login");
    }
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return false;
    }
    return true;
  };

  return {
    user,
    isAuthenticated,
    handleLogout,
    requireAuth,
  };
};
