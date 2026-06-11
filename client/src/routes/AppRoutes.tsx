import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicGuard } from "./PublicGuard";
import { ProtectedGuard } from "./ProtectedGuard";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { Dashboard } from "../pages/Dashboard";
import { Login } from "../features/auth/pages/Login";
import { MembersPage } from "../features/members/pages/MembersPage";
import { BooksPage } from "../features/books/pages/BooksPage";
import { TransactionsPage } from "../features/issues/pages/TransactionsPage";
import { FinesPage } from "../features/fines/pages/FinesPage";
import { ReturnedBooks } from "../features/returnedbooks/pages/ReturnedBooks";
import { ManageCategories } from "../features/categories/pages/ManageCategories";

// Admin Module Component Import Declarations
import { AdminLayout } from "../features/admin/components/AdminLayout";
import { AdminPanel } from "../features/admin/pages/AdminPanel";
import { ManageUsers } from "../features/admin/components/ManageUsers";
import { ManageLibrarians } from "../features/admin/components/ManageLibrarians";
import { ManagePlan } from "../features/membershipPlans/pages/ManagePlan";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Open Public Domain Boundaries */}
        <Route element={<PublicGuard />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Shielded Secure Corporate Environment Boundary */}
        <Route element={<ProtectedGuard />}>
          
          {/* 1. Librarian Operations Workspace Subsystem Layout Group */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<MembersPage />} />
             <Route path="/plans" element={<ManagePlan />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/categories" element={<ManageCategories />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/fines" element={<FinesPage />} />
            <Route path="/returnedbooks" element={<ReturnedBooks />} />
          </Route>

          {/* 2. Isolated High-Clearance Admin Subsystem Layout Group */}
          {/* Using clear absolute path routing mappings to avoid ambiguity */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminPanel />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/librarians" element={<ManageLibrarians />} />
          </Route>

        </Route>

        {/* 💡 FIXED: General Catch-All Global Redirection directs straight to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};