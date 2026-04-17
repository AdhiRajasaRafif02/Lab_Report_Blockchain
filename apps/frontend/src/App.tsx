import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { UploadPage } from "./pages/UploadPage";
import { VerifyPage } from "./pages/VerifyPage";
import { AdminPage } from "./pages/AdminPage";
import { DocumentDetailPage } from "./pages/DocumentDetailPage";
import { DocumentsListPage } from "./pages/DocumentsListPage";

export const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentsListPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
