import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@lab.local");
  const [password, setPassword] = useState("admin1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid credentials or backend unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Lab Report Blockchain</h1>
        <p className="text-sm text-slate-600">Sign in to continue.</p>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
};
