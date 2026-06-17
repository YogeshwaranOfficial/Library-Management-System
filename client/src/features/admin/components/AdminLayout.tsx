import React, { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { motion } from "framer-motion";

// Lucide Icons matching your clean, balanced stroke layouts
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  LogOut,
  Library,
  User,
  Menu
} from "lucide-react";

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // State engine managing navigation sidebar width expansion configuration
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  
  // Track if the scroll container is at the absolute top position (scrollTop === 0)
  const [isAtAbsoluteTop, setIsAtAbsoluteTop] = useState<boolean>(true);
  
  const mainScrollContainerRef = useRef<HTMLDivElement>(null);

  // Pure scroll engine tracking absolute position offsets across all pages
  const handleContainerScroll = useCallback(() => {
    if (!mainScrollContainerRef.current) return;
    const currentScrollTop = mainScrollContainerRef.current.scrollTop;
    
    // Header vanishes completely if you scroll away from the top
    setIsAtAbsoluteTop(currentScrollTop === 0);
  }, []);

  // Handle immediate viewport layout reset on route change and bind listener
  useEffect(() => {
    const container = mainScrollContainerRef.current;
    
    if (container) {
      container.scrollTop = 0;
      setIsAtAbsoluteTop(true);
      container.addEventListener("scroll", handleContainerScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleContainerScroll);
      }
    };
  }, [location.pathname, handleContainerScroll]);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Admin Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Manage Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Manage Librarians",
      path: "/admin/librarians",
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#F7FAFC] font-sans text-[#2D3748] antialiased selection:bg-[#2B6CB0]/10 select-none">
      
      {/* Main Structural Application Framework Split */}
      <div className="flex flex-1 w-full h-full overflow-hidden relative">
        
        {/* Persistent Left Icon/Expanded Navigation Sidebar Shell — Re-themed background layout */}
        <motion.aside
          animate={{ width: sidebarExpanded ? 288 : 80 }}
          transition={{ type: "spring", damping: 28, stiffness: 240 }}
          className="h-full bg-[#4b6993] border-r border-white/10 shadow-lg flex flex-col justify-between p-4 text-white shrink-0 z-50"
        >
          <div className="flex flex-col h-full overflow-hidden">
            
            {/* Upper Navigation Menu Trigger Action Row */}
            <div className="h-16 flex items-center justify-start mb-4 border-b border-white/10 shrink-0">
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="w-11 h-11 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={sidebarExpanded ? "Collapse Sidebar Menu" : "Expand Sidebar Menu"}
              >
                <Menu size={20} className="stroke-[2.5]" />
              </button>
              {sidebarExpanded && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-black tracking-[0.2em] uppercase text-white/90 pl-3 "
                >
                  Admin Panel
                </motion.span>
              )}
            </div>

            {/* Navigation Routing Links */}
            <nav className="space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg text-sm font-medium tracking-wide transition-all duration-150 h-12 overflow-hidden ${
                        isActive
                          ? "bg-white text-[#4b6993] font-bold shadow-md" // Precise color scheme inversion layout matrix
                          : "text-white/80 hover:bg-white/10 hover:text-white"
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
          <div className="pt-4 border-t border-white/10 shrink-0 overflow-hidden">
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-transparent transition-all cursor-pointer shadow-sm uppercase tracking-wider h-11 w-full"
              title="Logout Account"
            >
              <div className="w-11 h-full flex items-center justify-center shrink-0">
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
          className="flex-1 overflow-y-auto bg-white relative"
        >
          {/* Institutional Top Application Header Bar — Clean visibility-locked fading component */}
        <motion.header 
  animate={{ 
    opacity: isAtAbsoluteTop ? 1 : 0,
    pointerEvents: isAtAbsoluteTop ? "auto" : "none",
    // Tracks the sidebar width exactly by converting it into padding space
    paddingLeft: sidebarExpanded ? 288 + 24 : 80 + 24 
  }}
  // Blends independent opacity transitions with structural spring physics
  transition={{ 
    type: "spring", 
    damping: 28, 
    stiffness: 240,
    opacity: { duration: 0.2, ease: "linear" } 
  }}
  className="fixed top-0 left-0 right-0 h-20 flex items-center shadow-md justify-between pr-6 z-40 select-none bg-transparent border-transparent text-[#2D3748]"
>
            
            {/* Core Navigation Brand Info Content Block */}
            <div className="flex items-center gap-3.5 select-none ">
              <div className="w-10 h-10 bg-[#4b6993]/10 rounded-lg flex items-center justify-center border border-[#4b6993]/10">
                <Library size={18} className="stroke-[2.2] text-[#4b6993]" />
              </div>

              <div className="flex flex-col text-left">
                <span className="font-black text-base tracking-tight leading-tight text-[#4b6993]">
                  LMS
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest  text-slate-400">
                  Admin Portal
                </span>
              </div>
            </div>

            {/* User Identity Matrix */}
            <div className="flex items-center gap-5">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-extrabold tracking-widest uppercase  text-slate-500">
                  ROLE: <span className="font-black text-slate-900">{user?.role || "ADMIN"}</span>
                </p>
              </div>

              <div className="w-10 h-10 border border-slate-200 bg-slate-50 text-slate-700 rounded-lg flex items-center justify-center shadow-3xs">
                <User size={16} className="stroke-[2.5]" />
              </div>
            </div>
          </motion.header>

          {/* Subview Inner Page Outlet Frame Layer */}
          <div className="w-full pt-20">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};