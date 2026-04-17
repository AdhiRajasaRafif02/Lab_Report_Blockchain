import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navItem = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`;

export const Layout = () => {
  const { user, logout, hasRole } = useAuth();

  const links = [
    { to: "/", label: "Dashboard", allow: true },
    { to: "/upload", label: "Upload", allow: hasRole(["admin", "lab_staff"]) },
    { to: "/documents", label: "Documents", allow: true },
    { to: "/verify", label: "Verify", allow: true },
    { to: "/admin", label: "Admin", allow: hasRole(["admin", "lab_staff"]) }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-sm font-semibold text-slate-900">
            Lab Report Blockchain
          </Link>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-800">{user?.fullName}</p>
            <p className="text-xs uppercase text-slate-500">{user?.role}</p>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-4 p-4 md:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border bg-white p-3">
          <nav className="flex flex-col gap-1">
            {links
              .filter((x) => x.allow)
              .map((x) => (
                <NavLink key={x.to} to={x.to} className={navItem}>
                  {x.label}
                </NavLink>
              ))}
            <button onClick={logout} className="mt-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">
              Logout
            </button>
          </nav>
        </aside>
        <main className="space-y-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
