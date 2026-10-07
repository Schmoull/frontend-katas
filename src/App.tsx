import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ActivityDetail from "./pages/ActivityDetail";
import ActivityForm from "./pages/ActivityForm";
import MyActivities from "./pages/MyActivities";
import Favorites from "./pages/Favorites";
import AdminUsers from "./pages/AdminUsers";
import ArchivedActivities from "./pages/ArchivedActivities";
import AdminReferenceData from "./pages/AdminReferenceData";
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
      <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
      {/* Atteinte via le lien de l'email, qui ouvre une session de récupération */}
      <Route path="/nouveau-mot-de-passe" element={<ResetPassword />} />

      {/* Routes protégées (rôle minimum : voir lib/permissions.ts) */}
      <Route
        path="/activites/nouvelle"
        element={
          <ProtectedRoute minRole="contributeur">
            <ActivityForm key="new" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activites/:id/modifier"
        element={
          // Le formulaire vérifie ensuite les droits sur cette activité
          <ProtectedRoute minRole="contributeur">
            <EditActivity />
          </ProtectedRoute>
        }
      />
      <Route path="/activites/:id" element={<ActivityDetail />} />
      <Route
        path="/mes-activites"
        element={
          <ProtectedRoute minRole="contributeur">
            <MyActivities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favoris"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />
      <Route
        path="/archives"
        element={
          <ProtectedRoute minRole="moderateur">
            <ArchivedActivities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/referentiel"
        element={
          <ProtectedRoute minRole="administrateur">
            <AdminReferenceData />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/utilisateurs"
        element={
          <ProtectedRoute minRole="administrateur">
            <AdminUsers />
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
