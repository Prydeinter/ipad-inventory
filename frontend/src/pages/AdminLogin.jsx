import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../lib/api";
import { Brand } from "../components/Brand";

export default function AdminLogin() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Selamat datang, Admin");
      nav("/admin");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Login gagal");
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-glow/50";

  return (
    <div className="min-h-screen grid-bg flex flex-col relative">
      <div className="absolute inset-0 bg-navy-hero/55" />
      <nav className="relative max-w-5xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <Brand variant="white" />
        <Link to="/" className="text-sm text-white/70 hover:text-cyan-glow flex items-center gap-1" data-testid="login-back">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
      </nav>
      <div className="relative flex-1 flex items-center justify-center px-6 pb-16">
        <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-fade-up" data-testid="admin-login-form">
          <div className="h-14 w-14 rounded-xl bg-navy/10 flex items-center justify-center mb-5">
            <Lock className="h-7 w-7 text-navy" />
          </div>
          <span className="overline text-slate-400">Area Terbatas</span>
          <h1 className="text-2xl font-heading font-bold text-navy mt-1">Login Administrator</h1>
          <p className="text-sm text-slate-500 mt-2">Kelola iPad, kode akses, dan pakta.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <input data-testid="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="admin@aaiibs.sch.id" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Password</label>
              <input data-testid="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" required />
            </div>
          </div>

          <button data-testid="login-submit" disabled={loading} className="mt-6 w-full bg-navy text-white font-semibold py-3.5 rounded-xl hover:bg-navy-light transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Masuk"}
          </button>
          <p className="mt-4 text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Koneksi aman, akses hanya untuk pengelola.
          </p>
        </form>
      </div>
    </div>
  );
}
