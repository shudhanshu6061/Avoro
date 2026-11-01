import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';

// Controllers
import { adminLogin, adminLogout, adminMe, verify2FA, setup2FA, enable2FA, changePassword } from '../../controllers/admin/auth.controller';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../../controllers/admin/product.controller';
import { listOrders, getOrder, updateOrderStatus, deleteOrder } from '../../controllers/admin/order.controller';
import {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  updateArticleStatus,
  deleteArticle,
  bulkDeleteArticles,
  bulkUpdateArticlesStatus,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/admin/article.controller';
import { listDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../../controllers/admin/discount.controller';
import { getDashboardStats } from '../../controllers/admin/dashboard.controller';
import { listCustomers, getCustomer, deleteCustomer } from '../../controllers/admin/customer.controller';
import {
  listSubscribers,
  getSubscribersStats,
  getSubscriber,
  updateSubscriber,
  deleteSubscriber,
  bulkUpdateSubscribers,
  bulkDeleteSubscribers,
} from '../../controllers/admin/subscriber.controller';
import {
  listMessages,
  getMessagesStats,
  getMessage,
  updateMessage,
  deleteMessage,
  bulkUpdateMessages,
  bulkDeleteMessages,
} from '../../controllers/admin/message.controller';

import { getSettings, updateSettings } from '../../controllers/admin/settings.controller';
import {
  getAdminSeo,
  regenerateSitemap,
  scanDuplicateContent,
  updateAdminSeo,
} from '../../controllers/seo.controller';

const router = Router();

// ─── Auth (no admin middleware needed for login) ────────
router.post('/auth/login', adminLogin);
router.post('/auth/logout', adminLogout);
router.post('/auth/verify-2fa', verify2FA);
router.get('/auth/me', requireAuth, requireAdmin, adminMe);
router.post('/auth/setup-2fa', requireAuth, requireAdmin, setup2FA);
router.post('/auth/change-password', requireAuth, requireAdmin, changePassword);
router.post('/auth/enable-2fa', requireAuth, requireAdmin, enable2FA);

// ─── Dashboard ──────────────────────────────────────────
router.get('/dashboard', requireAdmin, getDashboardStats);

// ─── Products ───────────────────────────────────────────
router.get('/products', requireAdmin, listProducts);
router.get('/products/:id', requireAdmin, getProduct);
router.post('/products', requireAdmin, createProduct);
router.put('/products/:id', requireAdmin, updateProduct);
router.delete('/products/:id', requireAdmin, deleteProduct);

// ─── Orders ─────────────────────────────────────────────
router.get('/orders', requireAdmin, listOrders);
router.get('/orders/:id', requireAdmin, getOrder);
router.patch('/orders/:id/status', requireAdmin, updateOrderStatus);
router.delete('/orders/:id', requireAdmin, deleteOrder);

// ─── Articles ───────────────────────────────────────────
router.get('/articles', requireAdmin, listArticles);
router.delete('/articles/bulk', requireAdmin, bulkDeleteArticles);
router.patch('/articles/bulk-status', requireAdmin, bulkUpdateArticlesStatus);
router.get('/articles/categories', requireAdmin, listCategories);
router.post('/articles/categories', requireAdmin, createCategory);
router.put('/articles/categories/:id', requireAdmin, updateCategory);
router.delete('/articles/categories/:id', requireAdmin, deleteCategory);
router.get('/articles/:id', requireAdmin, getArticle);
router.post('/articles', requireAdmin, createArticle as any);
router.put('/articles/:id', requireAdmin, updateArticle);
router.patch('/articles/:id/status', requireAdmin, updateArticleStatus);
router.delete('/articles/:id', requireAdmin, deleteArticle);

// ─── Discounts ──────────────────────────────────────────
router.get('/discounts', requireAdmin, listDiscounts);
router.post('/discounts', requireAdmin, createDiscount);
router.put('/discounts/:id', requireAdmin, updateDiscount);
router.delete('/discounts/:id', requireAdmin, deleteDiscount);

// ─── Customers ────────────────────────────────────────────
router.get('/customers', requireAdmin, listCustomers);
router.get('/customers/:id', requireAdmin, getCustomer);
router.delete('/customers/:id', requireAdmin, deleteCustomer);

// ─── Subscribers ──────────────────────────────────────────
router.get('/subscribers', requireAdmin, listSubscribers);
router.get('/subscribers/stats', requireAdmin, getSubscribersStats);
router.get('/subscribers/:id', requireAdmin, getSubscriber);
router.patch('/subscribers/:id', requireAdmin, updateSubscriber);
router.delete('/subscribers/:id', requireAdmin, deleteSubscriber);
router.patch('/subscribers', requireAdmin, bulkUpdateSubscribers);
router.delete('/subscribers', requireAdmin, bulkDeleteSubscribers);

// ─── Messages ─────────────────────────────────────────────
router.get('/messages', requireAdmin, listMessages);
router.get('/messages/stats', requireAdmin, getMessagesStats);
router.get('/messages/:id', requireAdmin, getMessage);
router.patch('/messages/:id', requireAdmin, updateMessage);
router.delete('/messages/:id', requireAdmin, deleteMessage);
router.patch('/messages', requireAdmin, bulkUpdateMessages);
router.delete('/messages', requireAdmin, bulkDeleteMessages);


// ─── Settings ───────────────────────────────────────────
router.get('/settings', requireAdmin, getSettings);
router.put('/settings', requireAdmin, updateSettings);

// ─── SEO ────────────────────────────────────────────────
router.get('/seo', requireAdmin, getAdminSeo);
router.put('/seo', requireAdmin, updateAdminSeo);
router.post('/seo/regenerate-sitemap', requireAdmin, regenerateSitemap);
router.post('/seo/scan-duplicates', requireAdmin, scanDuplicateContent);

export default router;
