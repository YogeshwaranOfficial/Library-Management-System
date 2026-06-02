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
    { name: "Transactions (Borrow/Return)", path: "/transactions", icon: "🔄" },
    { name: "Fines & Payments", path: "/fines", icon: "💳" },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f3f4f6]">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div className="p-4">
          <div className="flex items-center gap-2 px-2 py-3 border-b border-gray-100 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">L</div>
            <span className="font-semibold text-lg text-gray-800 tracking-tight">LMS Admin</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Structural Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Frame */}
        <header className="h-16 bg-brand-primary text-white flex items-center justify-between px-6 shadow-sm">
          <div>
            <h1 className="text-lg font-bold tracking-wide">Library Management System - Dashboard</h1>
            <p className="text-xs text-blue-100">Internship Capstone Project - Day 7: Reports & Metrics</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
           <div className="text-right">
              <p className="font-medium text-white">Logged in as: {user?.email}</p>
              <p className="text-xs text-blue-200 italic">Role: {user?.role || "LIBRARIAN"}</p>
            </div>
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center border border-blue-400">
              🎓
            </div>
          </div>
        </header>

        {/* Content View Injection Portal */}
        <main className="flex-1 overflow-y-auto p-6">
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