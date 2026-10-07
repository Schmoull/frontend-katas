import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ActivityDetail from "./pages/ActivityDetail";
import ActivityForm from "./pages/ActivityForm";
import MyActivities from "./pages/MyActivities";
import Profile from "./pages/Profile";
import ProtectedRoute from "./routes/ProtectedRoute";

// key : remonte le formulaire quand on passe d'une activité à une autre
function EditActivity() {
  const { id } = useParams();
  return <ActivityForm key={id} />;
}

export default function App() {
  return (
    <Routes>
      {/* Routes publiques : le catalogue est lisible sans compte */}
      <Route path="/" element={<Catalog />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes protégées */}
      <Route
        path="/activites/nouvelle"
        element={
          <ProtectedRoute>
            <ActivityForm key="new" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activites/:id/modifier"
        element={
          <ProtectedRoute>
            <EditActivity />
          </ProtectedRoute>
        }
      />
      <Route path="/activites/:id" element={<ActivityDetail />} />
      <Route
        path="/mes-activites"
        element={
          <ProtectedRoute>
            <MyActivities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profil"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
