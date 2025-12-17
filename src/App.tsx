import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CreateCamp from "./pages/CreateCamp";
import Camp from "./pages/Camp";
import CampDetails from "./pages/CampDetails";
import Profile from "./pages/Profile";
import CampDashboard from "./pages/CampDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import CampObjectives from "./pages/CampObjectives";
import CampFilRouge from "./pages/CampFilRouge";
import CampPlanning from "./pages/CampPlanning";
import CampActivites from "./pages/CampActivites";
import CampSettings from "./pages/CampSettings";
import Register from "./pages/Register";

export default function App() {
  return (
    <Routes>
      {/* Si on arrive sur la racine, on redirige */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Route publique */}
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* Routes protégées */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-camp"
        element={
          <ProtectedRoute>
            <CreateCamp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/camp/:id"
        element={
          <ProtectedRoute>
            <Camp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/camp/:id/details"
        element={
          <ProtectedRoute>
            <CampDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/camp/:id/dashboard"
        element={
          <ProtectedRoute>
            <CampDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/camp/:id/objectifs"
        element={
          <ProtectedRoute>
            <CampObjectives />
          </ProtectedRoute>
        }
      />
      <Route
        path="/camp/:id/fil-rouge"
        element={
          <ProtectedRoute>
            <CampFilRouge />
          </ProtectedRoute>
        }
      />
      <Route
        path="/camp/:id/planning"
        element={
          <ProtectedRoute>
            <CampPlanning />
          </ProtectedRoute>
        }
      />
      <Route
        path="/camp/:id/activites"
        element={
          <ProtectedRoute>
            <CampActivites />
          </ProtectedRoute>
        }
      />
      <Route
        path="/camp/:id/parametres"
        element={
          <ProtectedRoute>
            <CampSettings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
