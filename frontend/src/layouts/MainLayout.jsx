import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const { user, logout } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  const routes = ["dashboard", "teams", "players"];

  return (
    <div className="flex h-screen bg-[#0f0e0b] text-slate-100 font-display">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 border-r border-[#1f1d18] bg-[#14120e] flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-[#1f1d18]">
          <div className="size-10 bg-red-600 rounded-xl flex items-center justify-center text-black font-bold shadow-md">
            ⚔
          </div>
          <h2 className="text-xl font-bold tracking-wide uppercase">
            Aegis Finder
          </h2>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {routes.map((route) => (
            <NavLink
              key={route}
              to={`/${route}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-red-600/10 text-red-500 font-semibold border border-red-600/20"
                    : "text-slate-400 hover:bg-[#1f1d18] hover:text-white"
                }`
              }
            >
              {route.charAt(0).toUpperCase() + route.slice(1)}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-[#1f1d18] text-xs text-slate-500">
          © 2026 Aegis Finder
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="min-h-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 lg:px-10 py-4 border-b border-[#1f1d18] bg-[#14120e]">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Welcome back
            </p>
            <p className="text-lg font-semibold">{user?.username}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="size-10 bg-[#1f1d18] rounded-xl flex items-center justify-center border border-[#2a2720]">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <button
              className="text-red-500 hover:underline"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Mobile Nav */}
        <nav className="lg:hidden flex overflow-x-auto gap-2 px-4 py-3 border-b border-[#1f1d18] bg-[#14120e]">
          {routes.map((route) => (
            <NavLink
              key={route}
              to={`/${route}`}
              className={({ isActive }) =>
                `whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-red-600/10 text-red-500 font-semibold border border-red-600/20"
                    : "text-slate-400 hover:bg-[#1f1d18] hover:text-white"
                }`
              }
            >
              {route.charAt(0).toUpperCase() + route.slice(1)}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-[#0f0e0b]">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;