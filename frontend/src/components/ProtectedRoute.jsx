import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready)
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center text-cyan-glow font-mono">
        Memuat...
      </div>
    );
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}
