import { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";

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
  ChevronUp
} from "lucide-react";

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State engine managing navigation side bar hover-expansion configurations
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  
  // Track if the scroll container is at the absolute top (scrollTop === 0)
  const [isAtAbsoluteTop, setIsAtAbsoluteTop] = useState<boolean>(true);
  
  const mainScrollContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  // Check if current page is the explicit main operational dashboard view
  const isDashboardPage = location.pathname === "/dashboard";

  // Pure scroll engine tracking baseline depth coordinates
  const handleContainerScroll = useCallback(() => {
    if (!mainScrollContainerRef.current) return;
    const currentScrollTop = mainScrollContainerRef.current.scrollTop;
    setIsAtAbsoluteTop(currentScrollTop === 0);
  }, []);

  // Action dispatcher that smoothly resets viewport back to coordinate 0
  const scrollToTop = () => {
    if (mainScrollContainerRef.current) {
      mainScrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  // Handle intersection triggers and layout resets on route redirects
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

  // Clean up timers when the component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Handler triggered when mouse enters the left sidebar interactive zone
  const handleMouseEnterSidebar = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setSidebarExpanded(true);
  };

  // Handler triggered when mouse leaves the sidebar area — sets the 5-second slide-away countdown
  const handleMouseLeaveSidebar = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setSidebarExpanded(false);
    }, 10); 
  };

  const handleSignOut = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#F8FAFC] font-sans text-[#2D3748] antialiased selection:bg-[#2B6CB0]/10 select-none">
      
      {/* Invisible Left Edge Trigger Strip: Hovering here slides out the menu instantly */}
      <div 
        className="fixed left-0 top-0 h-full w-3 z-50 bg-transparent"
        onMouseEnter={handleMouseEnterSidebar}
      />

      {/* Main Structural Layout Split Shell Container */}
      <div className="flex flex-1 w-full h-full overflow-hidden relative">
        
        {/* Dynamic Slide-out Left Sidebar Menu — Moves from 0px to 288px and pushes content dynamically */}
        <motion.aside
          animate={{ 
            width: sidebarExpanded ? 288 : 0,
            padding: sidebarExpanded ? 16 : 0,
            opacity: sidebarExpanded ? 1 : 0
          }}
          transition={{ type: "spring", damping: 30, stiffness: 250 }}
          onMouseEnter={handleMouseEnterSidebar}
          onMouseLeave={handleMouseLeaveSidebar}
          className="h-full bg-[#4b6993] border-r border-white/10 shadow-2xl flex flex-col justify-between text-white shrink-0 z-40 overflow-hidden"
        >
          <div className="flex flex-col h-full overflow-hidden">
            
            {/* Dedicated Sidebar Upper Decorative Header Block */}
            <div className="h-16 flex items-center justify-start mb-4 border-b border-white/10 shrink-0">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-white/10 border border-white/10">
                <Library size={20} className="stroke-[2.2] text-white" />
              </div>
              <motion.span 
                animate={{ opacity: sidebarExpanded ? 1 : 0 }}
                className="text-xs font-black tracking-[0.2em] uppercase text-white/90 pl-3 font-mono truncate"
              >
                Menu
              </motion.span>
            </div>

            {/* Sidebar Main Nav Options */}
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
                          ? "bg-white text-[#4b6993] font-bold shadow-md"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    <div className="w-11 h-full flex items-center justify-center shrink-0">
                      <IconComponent size={18} className="stroke-[2.2]" />
                    </div>
                    <span className="truncate pl-1 pr-4">
                      {item.name}
                    </span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-white/10 shrink-0 overflow-hidden">
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-transparent transition-all cursor-pointer shadow-sm uppercase tracking-wider h-11 w-full"
              title="Logout Account"
            >
              <div className="w-11 h-full flex items-center justify-center shrink-0">
                <LogOut size={14} className="stroke-[2.5]" />
              </div>
              <span className="truncate pr-4">
                Logout
              </span>
            </button>
          </div>
        </motion.aside>

        {/* Workspace Canvas Layer Container */}
        <main 
          ref={mainScrollContainerRef}
          className="flex-1 overflow-y-auto bg-transparent relative"
        >
          {/* Top Navbar — Automatically shifts its padding-left value to match the incoming sidebar width perfectly */}
          <motion.header 
            animate={{ 
              opacity: isAtAbsoluteTop ? 1 : 0,
              pointerEvents: isAtAbsoluteTop ? "auto" : "none",
              paddingLeft: sidebarExpanded ? 288 + 24 : 24
            }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 250,
              opacity: { duration: 0.2, ease: "linear" }
            }}
            className={`fixed top-0 left-0 right-0 h-20 flex items-center justify-between pr-6 z-30 select-none
              ${isDashboardPage 
                ? "bg-transparent border-transparent text-white drop-shadow-xs" 
                : "bg-[#4b6993] border-b border-slate-200/80 shadow-xs text-slate-900 backdrop-blur-md"
              }`}
          >
            {/* Pure Informational Brand Block */}
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                isDashboardPage 
                  ? "bg-white/10 border-white/10" 
                  : "border-white/10 bg-white/10"
              }`}>
                <Library size={18} className={`stroke-[2.2] ${isDashboardPage ? "text-white" : "text-white"}`} />
              </div>

              <div className="flex flex-col text-left">
                <span className={`font-black text-base tracking-tight leading-tight transition-colors ${isDashboardPage ? "text-white" : "text-white"}`}>
                  LMS
                </span>
                <span className={`text-[10px] font-extrabold uppercase tracking-widest transition-colors ${isDashboardPage ? "text-white/60" : "text-white/60"}`}>
                  Central Intelligence Matrix
                </span>
              </div>
            </div>

            {/* User Identity Matrix */}
            <div className="flex items-center gap-5">
              <div className="text-right hidden sm:block">
                <p className={`text-[10px] font-extrabold tracking-widest uppercase transition-colors ${isDashboardPage ? "text-slate-300" : "text-slate-300"}`}>
                  ROLE: <span className={`font-black ${isDashboardPage ? "text-white" : "text-white"}`}>{user?.role || "LIBRARIAN"}</span>
                </p>
              </div>

              <div className={`w-10 h-10 border rounded-lg flex items-center justify-center shadow-3xs transition-all ${
                isDashboardPage 
                  ? "border-white/10 bg-white/10 text-white" 
                  : "border-white/10 bg-white/10 text-white"
              }`}>
                <User size={16} className="stroke-[2.5]" />
              </div>
            </div>
          </motion.header>

          {/* Page content wrapper wrapper */}
          <div className={`w-full ${isDashboardPage ? "pt-0" : "pt-20"}`}>
            <Outlet />
          </div>

          {/* Interactive Dynamic Scroll to Top Action Button Module (Works across all views!) */}
          <AnimatePresence>
            {!isAtAbsoluteTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 w-12 h-12 rounded-xl bg-[#4b6993] hover:bg-[#3c5578] text-white flex items-center justify-center shadow-lg cursor-pointer border border-white/10 z-50 transition-colors"
                title="Scroll back to top"
              >
                <ChevronUp size={22} className="stroke-[2.5]" />
              </motion.button>
            )}
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
};