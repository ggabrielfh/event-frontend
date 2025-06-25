import React from "react";
import { Link } from "react-router-dom";
import UserProfile from "./UserProfile";

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = "Event Hub" }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-gray-900">
              {title}
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/create-event"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Criar Evento
            </Link>
          </nav>

          <UserProfile />
        </div>
      </div>
    </header>
  );
};

export default Header;
