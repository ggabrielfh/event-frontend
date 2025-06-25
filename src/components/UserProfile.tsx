import React from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuthActions } from "../hooks/useAuthActions";

const UserProfile: React.FC = () => {
  const { user, handleLogout } = useAuthActions();

  if (!user) {
    return null;
  }

  const userInitials = user.name
    ? user.name.substring(0, 2).toUpperCase()
    : user.email.split("@")[0].substring(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>{userInitials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.name || user.email}</span>
        <span className="text-xs text-gray-500">
          Membro desde {new Date(user.created_at).toLocaleDateString("pt-BR")}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="ml-2"
      >
        Sair
      </Button>
    </div>
  );
};

export default UserProfile;
