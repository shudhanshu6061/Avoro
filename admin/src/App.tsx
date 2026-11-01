import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import ProductForm from '@/pages/ProductForm';
import Orders from '@/pages/Orders';
import Articles from '@/pages/Articles';
import ArticleForm from '@/pages/ArticleForm';
import Discounts from '@/pages/Discounts';
import Customers from '@/pages/Customers';
import Reviews from '@/pages/Reviews';
import Settings from '@/pages/Settings';
import SeoManager from '@/pages/SeoManager';
import Subscribers from '@/pages/Subscribers';
import Messages from '@/pages/Messages';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="subscribers" element={<Subscribers />} />
        <Route path="messages" element={<Messages />} />
        <Route path="reviews" element={<Reviews />} />

        <Route path="articles" element={<Articles />} />
        <Route path="articles/:id" element={<ArticleForm />} />
        <Route path="discounts" element={<Discounts />} />
        <Route path="seo" element={<SeoManager />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
