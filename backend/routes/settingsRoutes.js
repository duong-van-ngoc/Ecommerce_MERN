import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { verifyUserAuth, roleBasedAccess } from '../middleware/userAuth.js';

/**
 * Settings Routes
 * 
 * RESTFUL API DESIGN:
 * - GET /api/v1/admin/settings  → Lấy settings
 * - PUT /api/v1/admin/settings  → Update settings (full update)
 * 
 * LÝ DO DÙNG ROUTE CHAINING:
 * router.route('/path').get().put().delete()
 * - Clean code: Gom các methods cùng path vào 1 chỗ
 * - DRY: Không lặp lại path string
 * - Maintainable: Dễ thêm/xóa methods
 */
const router = express.Router();

/**
 * ========================================
 * ADMIN SETTINGS ROUTE
 * ========================================
 * 
 * Path: /api/v1/admin/settings
 * 
 * MIDDLEWARE CHAIN (chạy từ trái sang phải):
 * 
 * 1. verifyUserAuth
 *    - Kiểm tra JWT token trong cookies/headers
 *    - Decode token → lấy user ID
 *    - Query user từ DB
 *    - Inject user vào req.user
 *    - Nếu fail → return 401 Unauthorized
 * 
 * 2. roleBasedAccess('admin')
 *    - Kiểm tra req.user.role === 'admin'
 *    - Nếu không phải admin → return 403 Forbidden
 *    - Chỉ cho phép admin truy cập
 * 
 * 3. getSettings / updateSettings
 *    - Controller function xử lý logic
 *    - Chỉ chạy nếu pass 2 middleware trước
 * 
 * SECURITY LAYERS:
 * - Layer 1: Authentication (đã đăng nhập?)
 * - Layer 2: Authorization (có quyền admin?)
 * - Layer 3: Business Logic (data validation, processing)
 */
router.route('/admin/settings')
    .get(
        verifyUserAuth,           // Middleware 1: Check authentication
        roleBasedAccess('admin'), // Middleware 2: Check authorization
        getSettings               // Controller: Handle request
    )
    .put(
        verifyUserAuth,           // Middleware 1: Check authentication
        roleBasedAccess('admin'), // Middleware 2: Check authorization
        updateSettings            // Controller: Handle request
    );

/**
 * Export router
 * Sẽ được import vào app.js và mount vào Express app
 * app.use('/api/v1', settingsRoutes)
 */
export default router;
