import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const { user } = useAuth();
  const { logout } = useAuth();
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };
    
  return (
    <div className="flex h-screen bg-[#0f0e0b] text-slate-100 font-display">

      {/* Sidebar */}
      <aside className="w-72 border-r border-[#1f1d18] bg-[#14120e] hidden lg:flex flex-col">

        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-[#1f1d18]">
          <div className="size-10 bg-red-600 rounded-xl flex items-center justify-center text-black font-bold shadow-md">
            ⚔
          </div>
          <h2 className="text-xl font-bold tracking-wide uppercase">
            Aegis Finder
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">

          {["dashboard", "teams", "players"].map((route) => (
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

        {/* Optional Footer */}
        <div className="p-6 border-t border-[#1f1d18] text-xs text-slate-500">
          © 2026 Aegis Finder
        </div>

      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-[#1f1d18] bg-[#14120e]">

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Welcome back
            </p>
            <p className="text-lg font-semibold">
              {user?.username}
            </p>
          </div>

          <div className="flex items-center gap-4">
            
            <div className="size-10 bg-[#1f1d18] rounded-xl flex items-center justify-center border border-[#2a2720]">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <button onClick={handleLogout}>Logout</button>
          </div>

        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-10 bg-[#0f0e0b]">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default MainLayout;
