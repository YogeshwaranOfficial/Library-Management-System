import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { motion } from "framer-motion";

// Lucide Icons with balanced stroke weight for clean, institutional clarity
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
  const location = useLocation();
  
  // State engine managing navigation side bar width expansion configuration
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  
  const mainScrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle immediate viewport layout reset on route change
  useEffect(() => {
    if (mainScrollContainerRef.current) {
      mainScrollContainerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Manage Members", path: "/members", icon: Users },
    { name: "Manage Plans", path: "/plans", icon: CreditCard },
    { name: "Manage Books", path: "/books", icon: BookOpen },
    { name: "Manage Categories", path: "/categories", icon: Tags },
    { name: "Borrow & Return Desk", path: "/transactions", icon: RefreshCw },
    { name: "Returned Books", path: "/returnedbooks", icon: BookCheck },
    { name: "Fines & Payments", path: "/fines", icon: Receipt },
  ];

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#F7FAFC] font-sans text-[#2D3748] antialiased selection:bg-[#2B6CB0]/10 select-none">
      
      {/* Institutional Top Application Header Bar - Always visible, persistent foundation layout */}
      <header className="h-20 w-full flex items-center justify-between px-5 bg-[#4b6993] border-b border-white/10 shadow-sm text-white shrink-0 z-40">
        
        {/* Core Navigation Brand Click Area */}
        <div 
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="flex items-center gap-4 cursor-pointer group select-none"
          title={sidebarExpanded ? "Collapse Navigation Menu" : "Expand Navigation Menu"}
        >
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 group-hover:bg-white/15 transition-all duration-150">
            <Library size={20} className="stroke-[2.2] text-[#ffffff]" />
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight leading-tight text-white flex items-center gap-2">
              LMS
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider font-sans text-white/70">
              Library Management System
            </span>
          </div>
        </div>

        {/* User Identity Matrix */}
        <div className="flex items-center gap-5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold tracking-wide uppercase text-white/80">
              ROLE: <span className="text-white font-bold">{user?.role || "LIBRARIAN"}</span>
            </p>
          </div>

          <div className="w-11 h-11 border border-white/10 bg-white/10 text-white rounded-lg flex items-center justify-center shadow-2xs">
            <User size={18} className="stroke-[2.2]" />
          </div>
        </div>
      </header>

      {/* Main Structural Application Framework Split */}
      <div className="flex flex-1 w-full h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Persistent Left Icon/Expanded Navigation Sidebar Tracking Shell */}
        <motion.aside
          animate={{ width: sidebarExpanded ? 288 : 80 }}
          transition={{ type: "spring", damping: 28, stiffness: 240 }}
          className="h-full bg-[#1A365D] border-r border-white/10 shadow-md flex flex-col justify-between p-4 text-white shrink-0 z-30"
        >
          <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar">
            {/* Navigation Routing Links */}
            <nav className="space-y-1.5 flex-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg text-sm font-medium tracking-wide transition-all duration-150 h-12 overflow-hidden ${
                        isActive
                          ? "bg-white/10 text-white font-bold border-l-4 border-[#D69E2E] rounded-l-none shadow-2xs"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    {/* Centered box icon wrapper to protect collapse alignments */}
                    <div className="w-11 h-full flex items-center justify-center shrink-0">
                      <IconComponent size={18} className="stroke-[2.2]" />
                    </div>
                    {sidebarExpanded && (
                      <motion.span 
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="truncate pl-1 pr-4"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Action Area Sidebar Footer */}
          <div className="pt-4 border-t border-white/10 bg-[#1A365D] shrink-0 overflow-hidden">
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center rounded-lg text-xs font-bold text-white bg-[#4b6993] hover:bg-[#2B6CB0]/90 border border-transparent transition-all cursor-pointer shadow-sm uppercase tracking-wider h-11 w-full"
              title="Logout Account"
            >
              <div className="w-11 flex items-center justify-center shrink-0">
                <LogOut size={14} className="stroke-[2.5]" />
              </div>
              {sidebarExpanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate pr-4"
                >
                  Logout
                </motion.span>
              )}
            </button>
          </div>
        </motion.aside>

        {/* Workspace Canvas Container Block */}
        <main 
          ref={mainScrollContainerRef}
          className="flex-1 overflow-y-auto bg-transparent relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full w-full"
          >
            <Outlet />
          </motion.div>
        </main>

      </div>
    </div>
  );
};