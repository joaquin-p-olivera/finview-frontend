import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import ReviewPage from "./pages/ReviewPage";
import TransactionsPage from "./pages/TransactionsPage";
import CategoriesPage from "./pages/CategoriesPage";
import ReportsPage from "./pages/ReportsPage";
import PurchaseDashboardPage from "./pages/purchase/PurchaseDashboardPage";
import PurchaseCartPage from "./pages/purchase/PurchaseCartPage";
import PurchaseListsPage from "./pages/purchase/PurchaseListsPage";
import PurchaseListDetailPage from "./pages/purchase/PurchaseListDetailPage";
import PurchaseCategoriesPage from "./pages/purchase/PurchaseCategoriesPage";
import PurchaseStatsPage from "./pages/purchase/PurchaseStatsPage";
import PurchaseStoresPage from "./pages/purchase/PurchaseStoresPage";
import { useAuthStore } from "./store/authStore";
import { fetchMe } from "./api/auth";

function App() {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchMe()
        .then(setUser)
        .catch((err) => {
          // Only an invalid or expired token ends the session; a network
          // hiccup or a slow cold start shouldn't send the user to the login.
          if (err.response?.status === 401) {
            useAuthStore.getState().logout();
          }
        });
    }
  }, [isAuthenticated, user, setUser]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/onboarding"
          element={isAuthenticated ? <OnboardingPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/transactions"
          element={isAuthenticated ? <TransactionsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/categories"
          element={isAuthenticated ? <CategoriesPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/reports"
          element={isAuthenticated ? <ReportsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/upload"
          element={isAuthenticated ? <UploadPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/review/:id"
          element={isAuthenticated ? <ReviewPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/purchase"
          element={isAuthenticated ? <PurchaseDashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/purchase/cart/:id"
          element={isAuthenticated ? <PurchaseCartPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/purchase/lists"
          element={isAuthenticated ? <PurchaseListsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/purchase/lists/:id"
          element={isAuthenticated ? <PurchaseListDetailPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/purchase/categories"
          element={isAuthenticated ? <PurchaseCategoriesPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/purchase/stores"
          element={isAuthenticated ? <PurchaseStoresPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/purchase/stats"
          element={isAuthenticated ? <PurchaseStatsPage /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
