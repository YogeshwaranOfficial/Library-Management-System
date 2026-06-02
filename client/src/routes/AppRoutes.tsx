import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicGuard } from "./PublicGuard";
import { ProtectedGuard } from "./ProtectedGuard";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { Dashboard } from "../pages/Dashboard";
import { Login } from "../features/auth/pages/Login";
import { MembersPage } from "../features/members/pages/MembersPage";
import { BooksPage } from "../features/books/pages/BooksPage";

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
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<MembersPage/>} />
            <Route path="/books" element={<BooksPage/>} />
            <Route path="/transactions" element={<div className="p-6 bg-white rounded-xl border border-gray-200">Lending Transactions Registry View Container</div>} />
            <Route path="/fines" element={<div className="p-6 bg-white rounded-xl border border-gray-200">Automated Fines & Billing Panel Audit Container</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};