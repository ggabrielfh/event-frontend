import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CreateEventPage from "./pages/CreateEventPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MyEventsPage from "./pages/MyEventsPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event/:id"
          element={
            <ProtectedRoute>
              <EventDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/created"
          element={
            <ProtectedRoute>
              <MyEventsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
