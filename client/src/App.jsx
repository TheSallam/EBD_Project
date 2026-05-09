import { Routes, Route, Navigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FarmerDashboardPage from "./pages/FarmerDashboardPage";
import BuyerMarketplacePage from "./pages/BuyerMarketplacePage";
import AdminVerificationPage from "./pages/AdminVerificationPage";
import TransactionsPage from "./pages/TransactionsPage";
import { useAuthUser, isLoggedIn } from "./lib/auth";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

// IMPORT BOTH LOGOS
import logoLight from "./assets/logo-light.png";
import logoDark from "./assets/logo-dark.png";

function App() {
  const user = useAuthUser();
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const RequireAuth = ({ children, role }) => {
    if (!isLoggedIn()) return <Navigate to="/login" replace />;
    if (role && user?.role !== role) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <div className="min-h-screen text-foreground bg-background transition-colors duration-300">
      
      {/* Dark Mode Background */}
      <div className="hidden dark:block pointer-events-none fixed inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(16,185,129,0.16),transparent),radial-gradient(50%_40%_at_90%_20%,rgba(94,234,212,0.1),transparent)]" />
      
      {/* Light Mode Background */}
      <div className="block dark:hidden pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-100/40 via-background to-background" />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          
          {/* LOGO SWITCHER */}
          <Link to="/" className="flex items-center gap-3 group hover:opacity-90 transition-all">
            <div className="relative">
              
              {/* LOGO 1: Visible in LIGHT MODE 
                 Uses custom class 'logo-light-mode' defined in index.css
              */}
              <img 
                src={logoLight} 
                alt="Agriflow" 
                className="logo-light-mode h-10 w-10 object-cover rounded-xl shadow-lg shadow-emerald-500/20" 
              />

              {/* LOGO 2: Visible in DARK MODE 
                 Uses custom class 'logo-dark-mode' defined in index.css
              */}
              <img 
                src={logoDark} 
                alt="Agriflow" 
                className="logo-dark-mode h-10 w-10 object-cover rounded-xl shadow-lg shadow-emerald-500/20" 
              />
              
            </div>
            
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary/90 font-bold group-hover:text-primary transition-colors">
                Agriflow
              </p>
              <p className="text-xs text-muted-foreground">Transparent trade</p>
            </div>
          </Link>

          <Navbar />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12 relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/farmer" element={<RequireAuth role="farmer"><FarmerDashboardPage /></RequireAuth>} />
          <Route path="/market" element={<BuyerMarketplacePage />} />
          <Route path="/admin/verification" element={<RequireAuth role="admin"><AdminVerificationPage /></RequireAuth>} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;