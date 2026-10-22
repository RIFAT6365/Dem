/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RestaurantProvider } from './context/RestaurantContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AccountLayout } from './pages/account/AccountLayout';

// Guards
import { AdminRoute } from './components/auth/AdminRoute';
import { CustomerRoute } from './components/auth/CustomerRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { MenuPage } from './pages/public/MenuPage';
import { CategoryPage } from './pages/public/CategoryPage';
import { ProductDetailPage } from './pages/public/ProductDetailPage';
import { AboutPage } from './pages/public/AboutPage';
import { GalleryPage } from './pages/public/GalleryPage';
import { ReviewsPage } from './pages/public/ReviewsPage';
import { ContactPage } from './pages/public/ContactPage';
import { ReservationsPage } from './pages/public/ReservationsPage';
import { OnlineOrderPage } from './pages/public/OnlineOrderPage';
import { CartPage } from './pages/public/CartPage';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { OrderConfirmationPage } from './pages/public/OrderConfirmationPage';
import { TrackOrderPage } from './pages/public/TrackOrderPage';
import { OffersPage } from './pages/public/OffersPage';
import { FAQPage } from './pages/public/FAQPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { TermsPage } from './pages/public/TermsPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Authentication Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Customer Account Pages
import { AccountOverviewPage } from './pages/account/AccountOverviewPage';
import { AccountProfilePage } from './pages/account/AccountProfilePage';
import { AccountAddressesPage } from './pages/account/AccountAddressesPage';
import { AccountOrdersPage } from './pages/account/AccountOrdersPage';
import { AccountOrderDetailPage } from './pages/account/AccountOrderDetailPage';
import { AccountReservationsPage } from './pages/account/AccountReservationsPage';
import { AccountSecurityPage } from './pages/account/AccountSecurityPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminReservationsPage } from './pages/admin/AdminReservationsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminOffersPage } from './pages/admin/AdminOffersPage';
import { AdminContentPage } from './pages/admin/AdminContentPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminNavigationPage } from './pages/admin/AdminNavigationPage';
import { AdminActivityPage } from './pages/admin/AdminActivityPage';
import { AdminGoogleDrivePage } from './pages/admin/AdminGoogleDrivePage';

const getBasename = () => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/Dem')) {
    return '/Dem';
  }
  return '/';
};

export default function App() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <BrowserRouter basename={getBasename()}>
          <Routes>
            {/* Public Routes with Public Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/menu/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="/order" element={<OnlineOrderPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
              <Route path="/track-order" element={<TrackOrderPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected Customer Account Hub */}
              <Route
                path="/account"
                element={
                  <CustomerRoute>
                    <AccountLayout />
                  </CustomerRoute>
                }
              >
                <Route index element={<AccountOverviewPage />} />
                <Route path="profile" element={<AccountProfilePage />} />
                <Route path="addresses" element={<AccountAddressesPage />} />
                <Route path="orders" element={<AccountOrdersPage />} />
                <Route path="orders/:id" element={<AccountOrderDetailPage />} />
                <Route path="reservations" element={<AccountReservationsPage />} />
                <Route path="security" element={<AccountSecurityPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Login Route (Outside AdminRoute guard) */}
            <Route path="/admin/login" element={<LoginPage isAdminLogin />} />

            {/* Admin Routes with Admin Layout and AdminRoute Guard */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/:id/edit" element={<AdminProductFormPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="reservations" element={<AdminReservationsPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="offers" element={<AdminOffersPage />} />
              <Route path="content" element={<AdminContentPage />} />
              <Route path="gallery" element={<AdminGalleryPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="drive" element={<AdminGoogleDrivePage />} />
              <Route path="navigation" element={<AdminNavigationPage />} />
              <Route path="activity" element={<AdminActivityPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </RestaurantProvider>
    </AuthProvider>
  );
}
