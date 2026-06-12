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
  User,
} from "lucide-react";

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Initialize theme state safely by matching persistent localStorage cache indices
  // const [darkMode, setDarkMode] = useState<boolean>(
  //   () => localStorage.getItem("theme") === "dark"
  // );

  // Synchronize layout class strings on theme changes
  // useEffect(() => {
  //   const rootWindowElement = window.document.documentElement;
  //   if (darkMode) {
  //     rootWindowElement.classList.add("dark");
  //     localStorage.setItem("theme", "dark");
  //   } else {
  //     rootWindowElement.classList.remove("dark");
  //     localStorage.setItem("theme", "light");
  //   }
  // }, [darkMode]);

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
    <div className="flex h-screen w-screen overflow-hidden bg-page-bg font-sans text-text-main antialiased selection:bg-amber-200 transition-colors duration-200">
      
      {/* Sidebar Navigation - Warm Archival Minimalist Layout */}
      <aside className="w-72 bg-card-bg border-r border-border-main flex flex-col justify-between relative z-20 shadow-xs shrink-0 transition-colors duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3.5 py-3 border-b border-border-main mb-6">
            
            {/* Elegant Institutional Identity Icon */}
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-950 text-amber-100 rounded-lg flex items-center justify-center shadow-xs shrink-0">
              <Library size={20} className="stroke-[2.2]" />
            </div>
            
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-text-main leading-tight">LMS</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Librarian Portal</span>
            </div>
          </div>

          {/* Navigation links */}
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
                        ? "bg-page-bg text-text-main font-bold shadow-xs border-l-4 border-border-main rounded-l-none pl-3"
                        : "text-slate-500 dark:text-slate-400 hover:bg-page-bg/50 hover:text-text-main"
                    }`
                  }
                >
                  <IconComponent size={18} className={`stroke-[2.2] shrink-0 ${item.color}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        {/* Sidebar Footer - Spacious Action Deck */}
        <div className="p-5 border-t border-border-main bg-page-bg/30 transition-colors duration-200">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/40 border border-orange-200/60 transition-all cursor-pointer shadow-2xs"
          >
            <LogOut size={16} className="stroke-[2.5]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Structural Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header Frame - High Visibility Layout */}
        <header className="h-22 bg-card-bg border-b border-border-main flex items-center justify-between px-10 shadow-2xs shrink-0 transition-colors duration-200">
          <div>
            <h1 className="text-lg font-bold text-text-main tracking-tight">Librarian Dashboard</h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5">Real-time catalog and circulation auditing pipeline</p>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-1">
                ROLE: <span className="text-text-main font-bold">{user?.role || "LIBRARIAN"}</span>
              </p>
            </div>

            {/* User Profile Avatar Frame */}
            <div className="w-11 h-11 bg-page-bg border border-border-main text-text-main rounded-lg flex items-center justify-center shadow-2xs">
              <User size={18} className="stroke-[2.2]" />
            </div>

            {/* Dark/Light Theme Button Switcher */}
            {/* <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="w-11 h-11 flex items-center justify-center bg-page-bg hover:bg-page-bg/80 text-text-main border border-border-main rounded-lg cursor-pointer transition-all shadow-2xs"
            >
              {darkMode ? (
                <Sun size={18} className="stroke-[2.2] text-amber-500 animate-fade-in" />
              ) : (
                <Moon size={18} className="stroke-[2.2] text-slate-600 animate-fade-in" />
              )}
            </button> */}
            
            
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