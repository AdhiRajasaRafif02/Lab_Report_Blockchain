import { Link, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { UploadPage } from "./pages/UploadPage";
import { VerifyPage } from "./pages/VerifyPage";
import { AdminPage } from "./pages/AdminPage";
import { DocumentDetailPage } from "./pages/DocumentDetailPage";

export const App = () => {
  return (
    <div className="min-h-screen text-slate-900">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl gap-4 p-4 text-sm">
          <Link to="/">Dashboard</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/verify">Verify</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/login" className="ml-auto">
            Login
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl p-4">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
        </Routes>
      </main>
    </div>
  );
};
