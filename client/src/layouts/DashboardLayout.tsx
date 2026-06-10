import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { motion } from "framer-motion";

// Lucide Icons with balanced stroke weight for high legibility
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BookOpen, 
  Tags, 
  RefreshCw, 
  BookCheck, 
  Receipt, 
  LogOut, 
  Library,
  User 
} from "lucide-react";

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, color: "text-blue-600" },
    { name: "Manage Members", path: "/members", icon: Users, color: "text-teal-600" },
    { name: "Manage Plans", path: "/plans", icon: CreditCard, color: "text-indigo-600" },
    { name: "Manage Books", path: "/books", icon: BookOpen, color: "text-amber-700" },
    { name: "Manage Categories", path: "/categories", icon: Tags, color: "text-purple-600" },
    { name: "Borrow & Return Desk", path: "/transactions", icon: RefreshCw, color: "text-emerald-600" },
    { name: "Returned Books", path: "/returnedbooks", icon: BookCheck, color: "text-sky-600" },
    { name: "Fines & Payments", path: "/fines", icon: Receipt, color: "text-orange-600" },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-amber-50/40 font-sans text-slate-800 antialiased selection:bg-amber-200">
      
      {/* Sidebar Navigation - Warm Archival Minimalist Layout (Expanded Accessibility width) */}
      <aside className="w-72 bg-white border-r border-amber-100 flex flex-col justify-between relative z-20 shadow-xs shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3.5 py-3 border-b border-slate-100 mb-6">
            
            {/* Elegant Institutional Identity Icon */}
            <div className="w-10 h-10 bg-slate-900 text-amber-100 rounded-lg flex items-center justify-center shadow-xs shrink-0">
              <Library size={20} className="stroke-[2.2]" />
            </div>
            
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 leading-tight">LMS CORE ENGINE</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">System Administrator</span>
            </div>
          </div>

          {/* Navigation links optimized with comfortable text sizes and wide tapping targets */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-150 ${
                      isActive
                        ? "bg-slate-100 text-slate-950 font-bold shadow-xs border-l-4 border-slate-900 rounded-l-none pl-3"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`
                  }
                >
                  {/* Distinct category icon colors remain crisp and highly visible */}
                  <IconComponent size={18} className={`stroke-[2.2] shrink-0 ${item.color}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        {/* Sidebar Footer - Spacious Action Deck */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200/60 transition-all cursor-pointer shadow-2xs"
          >
            <LogOut size={16} className="stroke-[2.5]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Structural Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header Frame - High Visibility Layout */}
        <header className="h-22 bg-white border-b border-amber-100 flex items-center justify-between px-10 shadow-2xs shrink-0">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">System Feed Ledger</h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5">Real-time catalog and circulation auditing pipeline</p>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-sm text-slate-700 bg-slate-50 border border-slate-200/60 px-3.5 py-1.5 rounded-md shadow-2xs inline-block">
                {user?.email || "librarian@institution.org"}
              </p>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-1">
                Access Level: <span className="text-slate-600 font-bold">{user?.role || "LIBRARIAN"}</span>
              </p>
            </div>
            
            {/* User Profile Avatar Frame */}
            <div className="w-11 h-11 bg-slate-50 border border-slate-200/60 text-slate-700 rounded-lg flex items-center justify-center shadow-2xs">
              <User size={18} className="stroke-[2.2]" />
            </div>
          </div>
        </header>

        {/* Content View Injection Portal */}
        <main className="flex-1 overflow-y-auto p-10 bg-transparent">
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};