import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { motion } from "framer-motion";

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Manage Members", path: "/members", icon: "👥" },
    { name: "Manage Books", path: "/books", icon: "📚" },
    { name: "Manage Categories", path: "/categories", icon: "💳" },
    { name: "Borrow & Return Desk", path: "/transactions", icon: "🔄" },
    { name: "Returned Books", path: "/returnedbooks", icon: "💳" },
    { name: "Fines & Payments", path: "/fines", icon: "💳" },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas-dominant font-sans text-slate-secondary">
      {/* Sidebar Navigation - Styled with 30% Secondary Slate & Subtle Cream Borders */}
      <aside className="w-64 bg-white border-r border-slate-light/10 flex flex-col justify-between">
        <div className="p-4">
          <div className="flex items-center gap-2 px-2 py-3 border-b border-slate-light/10 mb-4">
            {/* Logo Badge utilizing 10% Sage Green Accent */}
            <div className="w-8 h-8 bg-sage-primary rounded-lg flex items-center justify-center text-white font-bold font-sans">
              L
            </div>
            <span className="font-bold text-lg text-slate-secondary tracking-tight">LMS</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-sage-primary/10 text-sage-primary"
                      : "text-slate-light hover:bg-canvas-dominant hover:text-slate-secondary"
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        
        {/* Sidebar Footer - Styled with Canonical Utility Crimson */}
        <div className="p-4 border-t border-slate-light/10">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-utility-crimson hover:bg-utility-crimson/10 transition-colors cursor-pointer"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Structural Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Frame Redesigned to be Crisp Premium White to align with the Canvas */}
        <header className="h-18 bg-white flex items-center justify-between px-6 border-b border-slate-light/10 shadow-xs">
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-secondary">Dashboard</h1>
            <p className="text-xs text-slate-light font-medium">Library Management System</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="font-bold text-slate-secondary font-data">Logged in as: {user?.email}</p>
              <p className="text-[11px] text-sage-primary font-bold tracking-wide uppercase mt-0.5">Role: {user?.role || "LIBRARIAN"}</p>
            </div>
            <div className="w-9 h-9 bg-canvas-dominant text-slate-secondary rounded-full flex items-center justify-center border border-slate-light/10 text-sm shadow-xs">
              🎓
            </div>
          </div>
        </header>

        {/* Content View Injection Portal with Canvas Styling */}
        <main className="flex-1 overflow-y-auto p-6 bg-canvas-dominant">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};