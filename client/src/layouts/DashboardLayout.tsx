import { useState, useEffect, useRef } from "react";
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
  Menu,
} from "lucide-react";

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State engine managing navigation flyout and dashboard scroll adjustments
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  
  const mainScrollContainerRef = useRef<HTMLDivElement>(null);

  // Layout Rule: Transparent header states apply only at zero-scroll offset on the primary dashboard
  const isDashboardPage = location.pathname === "/dashboard" || location.pathname === "/";

  // Watch scroll container progression to toggle header canvas states dynamically
  useEffect(() => {
    const scrollEl = mainScrollContainerRef.current;
    if (!scrollEl) return;

    const handleScrollUpdate = () => {
      if (scrollEl.scrollTop > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    scrollEl.addEventListener("scroll", handleScrollUpdate);
    return () => scrollEl.removeEventListener("scroll", handleScrollUpdate);
  }, [location.pathname]);

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

  // Configure operational header styling based on page context and scroll threshold
  const getHeaderStyles = () => {
    if (isDashboardPage) {
      return isScrolled
        ? "fixed top-0 left-0 right-0 bg-[#1A365D] border-b border-[#E2E8F0]/10 shadow-sm text-white"
        : "absolute top-0 left-0 right-0 bg-transparent border-b border-transparent text-white";
    }
    return "relative bg-[#1A365D] border-b border-[#E2E8F0]/10 shadow-sm text-white";
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#F7FAFC] font-sans text-[#2D3748] antialiased selection:bg-[#2B6CB0]/10 relative">
      
      {/* Institutional Top Application Header Bar */}
      <header className={`h-20 w-full flex items-center justify-between px-8 z-40 transition-all duration-300 select-none ${getHeaderStyles()}`}>
        
        {/* Core Navigation Cluster */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-2xs bg-white/10 hover:bg-white/20 border-white/10 text-white"
            title="Toggle System Directory"
          >
            <Menu size={18} className="stroke-[2.2]" />
          </button>

          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight leading-tight text-white">
              LMS
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider mt-0.5 font-sans text-[#D69E2E]">
              Library Management System
            </span>
          </div>
        </div>

        {/* User Identity Matrix */}
        <div className="flex items-center gap-5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold tracking-wide uppercase text-white/80">
              ROLE: <span className="text-[#D69E2E] font-bold">{user?.role || "LIBRARIAN"}</span>
            </p>
          </div>

          <div className="w-11 h-11 border border-white/10 bg-white/10 text-white rounded-lg flex items-center justify-center shadow-2xs">
            <User size={18} className="stroke-[2.2]" />
          </div>
        </div>
      </header>

      {/* Slideout Shell Menu System */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Structural Backdrop Dimmer Mask */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-[#1A365D]/30 backdrop-blur-xs z-40 cursor-pointer"
            />

            {/* Main Full-Height Left Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="absolute left-0 top-0 bottom-0 h-screen w-80 bg-[#1A365D] border-r border-[#E2E8F0]/10 shadow-2xl z-50 p-6 flex flex-col justify-between text-white"
            >
              <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
                
                {/* Drawer Branding Header Section */}
                <div className="flex items-center gap-3 pb-5 border-b border-white/10 mb-5 shrink-0">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                    <Library size={18} className="stroke-[2.2] text-[#D69E2E]" />
                  </div>
                  <span className="font-bold text-sm tracking-tight text-white">System Directory</span>
                </div>

                {/* Navigation Routing Links: Anchored on Navy with clean Accent Gold active lines */}
                <nav className="space-y-1 flex-1">
                  {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-4 px-4 py-3.5 rounded-md text-sm font-medium tracking-wide transition-all duration-150 ${
                            isActive
                              ? "bg-white/10 text-white font-bold border-l-4 border-[#D69E2E] rounded-l-none pl-3 shadow-2xs"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                          }`
                        }
                      >
                        <IconComponent size={18} className="stroke-[2.2] shrink-0" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              {/* Action Area Drawer Footer with crisp institutional action styling */}
              <div className="pt-4 border-t border-white/10 bg-[#1A365D] shrink-0">
                <button
                  onClick={() => { setMenuOpen(false); handleSignOut(); }}
                  className="flex w-full items-center justify-center gap-2 px-4 py-3.5 rounded-lg text-xs font-bold text-white bg-[#2B6CB0] hover:bg-[#2B6CB0]/90 border border-transparent transition-all cursor-pointer shadow-sm uppercase tracking-wider"
                >
                  <LogOut size={14} className="stroke-[2.5]" />
                  <span>Logout Account</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Document / Workspace Framework Interface Content Slot */}
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
  );
};