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
            <Route path="/transactions" element={<TransactionsPage/>} />
            <Route path="/fines" element={<FinesPage/>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};