import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicDashboard from "./pages/PublicDashboard";
import PaktaEntry from "./pages/PaktaEntry";
import PaktaView from "./pages/PaktaView";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-center" richColors />
          <Routes>
            <Route path="/" element={<PublicDashboard />} />
            <Route path="/pakta" element={<PaktaEntry />} />
            <Route path="/pakta/:id" element={<PaktaView />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
