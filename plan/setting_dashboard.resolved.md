# Settings Backend Integration - Implementation Plan

## Tổng Quan

Xây dựng hệ thống quản lý cài đặt (Settings) hoàn chỉnh cho admin dashboard với full-stack integration.

---

## 1. Database Layer - MongoDB Schema

### Lý Thuyết

**Tại sao dùng MongoDB Schema?**
- **Validation**: Đảm bảo data đúng format trước khi lưu vào database
- **Default Values**: Tự động set giá trị mặc định nếu không được cung cấp
- **Type Safety**: Mongoose sẽ tự động convert và validate types
- **Indexing**: Tối ưu performance cho các query thường xuyên

**Tại sao sử dụng Singleton Pattern?**
- Settings chỉ cần **1 document duy nhất** trong DB
- Tránh duplicate data và xung đột
- Dễ dàng query và update

### Nghiệp Vụ

**Business Rules:**
1. Chỉ có 1 settings document trong toàn bộ hệ thống
2. Admin có thể update bất kỳ lúc nào
3. Notification preferences mặc định = true (opt-out thay vì opt-in)
4. Email admin phải unique và valid

### Implementation

**File**: `backend/models/settingsModel.js`

```javascript
import mongoose from 'mongoose';
import validator from 'validator';

const settingsSchema = new mongoose.Schema({
    // Personal Info
    adminName: {
        type: String,
        required: [true, 'Tên admin không được để trống'],
        trim: true,
        maxLength: [100, 'Tên không được vượt quá 100 ký tự']
    },
    email: {
        type: String,
        required: [true, 'Email không được để trống'],
        unique: true,
        validate: [validator.isEmail, 'Email không hợp lệ']
    },

    // Company Info
    companyName: {
        type: String,
        required: [true, 'Tên công ty không được để trống'],
        trim: true,
        maxLength: [200, 'Tên công ty quá dài']
    },
    address: {
        type: String,
        required: [true, 'Địa chỉ không được để trống'],
        trim: true,
        maxLength: [500, 'Địa chỉ quá dài']
    },

    // Notifications
    notifications: {
        newOrders: {
            type: Boolean,
            default: true
        },
        lowStock: {
            type: Boolean,
            default: true
        },
        newUsers: {
            type: Boolean,
            default: true
        },
        newReviews: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true  // createdAt, updatedAt tự động
});

// Middleware: Ensure only 1 settings document exists
settingsSchema.pre('save', async function(next) {
    const count = await this.constructor.countDocuments();
    if (count > 0 && this.isNew) {
        throw new Error('Settings document already exists. Use update instead.');
    }
    next();
});

export default mongoose.model('Settings', settingsSchema);
```

---

## 2. Controller Layer - Business Logic

### Lý Thuyết

**Tại sao tách riêng Controller?**
- **Separation of Concerns**: Tách logic nghiệp vụ ra khỏi routing
- **Reusability**: Có thể tái sử dụng controller ở nhiều routes
- **Testability**: Dễ dàng test từng function riêng lẻ
- **Maintainability**: Code dễ đọc, dễ maintain

**Tại sao dùng async/await với try-catch?**
- MongoDB operations đều là **asynchronous**
- Try-catch bắt lỗi database và validation errors
- Async/await giúp code dễ đọc hơn callback hell

### Nghiệp Vụ

**GET Settings:**
- Nếu chưa có settings → tạo mới với default values
- Nếu đã có → return về cho client
- Chỉ admin mới có quyền xem

**UPDATE Settings:**
- Validate input data trước khi lưu
- Update existing document (không tạo mới)
- Return updated data về client
- Chỉ admin mới có quyền update

### Implementation

**File**: `backend/controllers/settingsController.js`

```javascript
import Settings from '../models/settingsModel.js';
import handleAsyncError from '../middleware/handleAsyncError.js';
import HandleError from '../utils/handleError.js';

/**
 * @desc    Get settings
 * @route   GET /api/v1/admin/settings
 * @access  Private/Admin
 */
export const getSettings = handleAsyncError(async (req, res, next) => {
    // Try to find existing settings
    let settings = await Settings.findOne();

    // If no settings exist, create default one
    if (!settings) {
        settings = await Settings.create({
            adminName: req.user.name,  // Từ logged-in user
            email: req.user.email,
            companyName: 'ShopHub',
            address: 'Chưa cập nhật',
            notifications: {
                newOrders: true,
                lowStock: true,
                newUsers: true,
                newReviews: true
            }
        });
    }

    res.status(200).json({
        success: true,
        settings
    });
});

/**
 * @desc    Update settings
 * @route   PUT /api/v1/admin/settings
 * @access  Private/Admin
 */
export const updateSettings = handleAsyncError(async (req, res, next) => {
    const { adminName, email, companyName, address, notifications } = req.body;

    // Validate input
    if (!adminName || !email || !companyName || !address) {
        return next(new HandleError('Vui lòng điền đầy đủ thông tin', 400));
    }

    // Find existing settings
    let settings = await Settings.findOne();

    if (!settings) {
        // Create new if not exists
        settings = await Settings.create({
            adminName,
            email,
            companyName,
            address,
            notifications: notifications || {
                newOrders: true,
                lowStock: true,
                newUsers: true,
                newReviews: true
            }
        });
    } else {
        // Update existing
        settings.adminName = adminName;
        settings.email = email;
        settings.companyName = companyName;
        settings.address = address;
        settings.notifications = notifications || settings.notifications;
        
        await settings.save();
    }

    res.status(200).json({
        success: true,
        message: 'Cập nhật cài đặt thành công',
        settings
    });
});
```

---

## 3. Routes Layer - API Endpoints

### Lý Thuyết

**Tại sao dùng RESTful API?**
- **Standardization**: Theo chuẩn REST API design
- **Predictability**: Client biết endpoint nào làm gì
- **HTTP Methods**: GET (read), PUT (update full), PATCH (partial update)

**Tại sao cần Middleware?**
- **Authentication**: Kiểm tra user đã login chưa (`verifyUserAuth`)
- **Authorization**: Kiểm tra user có role admin không (`roleBasedAccess`)
- **Security**: Bảo vệ endpoints khỏi unauthorized access

### Nghiệp Vụ

**Security Requirements:**
1. Chỉ admin mới được truy cập
2. Phải authenticated (có JWT token)
3. Token phải hợp lệ và chưa expire

### Implementation

**File**: `backend/routes/settingsRoutes.js` (NEW)

```javascript
import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { verifyUserAuth, roleBasedAccess } from '../middleware/userAuth.js';

const router = express.Router();

// Admin settings routes
router.route('/admin/settings')
    .get(verifyUserAuth, roleBasedAccess('admin'), getSettings)
    .put(verifyUserAuth, roleBasedAccess('admin'), updateSettings);

export default router;
```

**Update**: [backend/app.js](file:///d:/Projects/E_Commerce_MERN/backend/app.js)

```javascript
// Import settings routes
import settingsRoutes from './routes/settingsRoutes.js';

// Use routes
app.use('/api/v1', settingsRoutes);
```

---

## 4. Redux State Management

### Lý Thuyết

**Tại sao dùng Redux?**
- **Global State**: Settings cần truy cập ở nhiều nơi
- **Predictable**: State changes theo pattern cố định
- **DevTools**: Dễ debug với Redux DevTools

**Tại sao dùng Redux Thunk?**
- **Async Actions**: Xử lý API calls (async operations)
- **Side Effects**: Dispatch multiple actions từ 1 thunk
- **Error Handling**: Centralized error handling

### Nghiệp Vụ

**State Flow:**
1. Component dispatch thunk
2. Thunk gọi API (loading = true)
3. API success → update state
4. API fail → set error
5. Component re-render với data mới

### Implementation

**Update**: [frontend/src/admin/adminSlice/adminSlice.js](file:///d:/Projects/E_Commerce_MERN/frontend/src/admin/adminSlice/adminSlice.js)

```javascript
// Add to existing file

/**
 * === SETTINGS MANAGEMENT ===
 */

/**
 * Async Thunk - Lấy settings
 */
export const fetchSettings = createAsyncThunk(
    'admin/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/api/v1/admin/settings', {
                withCredentials: true
            });
            return data.settings;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Không thể tải cài đặt'
            );
        }
    }
);

/**
 * Async Thunk - Cập nhật settings
 */
export const updateSettings = createAsyncThunk(
    'admin/updateSettings',
    async (settingsData, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(
                '/api/v1/admin/settings',
                settingsData,
                { withCredentials: true }
            );
            return data.settings;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Không thể cập nhật cài đặt'
            );
        }
    }
);

// Update initialState
const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        // ... existing state
        settings: null,  // Add this
        loading: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // ... existing reducers

        // Fetch Settings
        builder
            .addCase(fetchSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update Settings
        builder
            .addCase(updateSettings.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
            })
            .addCase(updateSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});
```

---

## 5. Frontend Integration

### Lý Thuyết

**Tại sao useEffect?**
- **Side Effects**: Fetch data khi component mount
- **Lifecycle**: Chạy sau khi component render
- **Dependencies**: Control khi nào re-fetch data

**Tại sao useSelector?**
- **Redux State**: Lấy data từ Redux store
- **Auto Re-render**: Component tự update khi state thay đổi

### Implementation

**Update**: [frontend/src/admin/pages/Settings.jsx](file:///d:/Projects/E_Commerce_MERN/frontend/src/admin/pages/Settings.jsx)

```javascript
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchSettings, updateSettings } from '../adminSLice/adminSlice';
import '../styles/Settings.css';

function Settings() {
    const dispatch = useDispatch();
    const { settings, loading, error } = useSelector(state => state.admin);
    
    const [formData, setFormData] = useState({
        adminName: '',
        email: '',
        companyName: '',
        address: '',
        notifications: {
            newOrders: true,
            lowStock: true,
            newUsers: true,
            newReviews: true
        }
    });

    // Fetch settings on mount
    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    // Update form when settings loaded
    useEffect(() => {
        if (settings) {
            setFormData({
                adminName: settings.adminName || '',
                email: settings.email || '',
                companyName: settings.companyName || '',
                address: settings.address || '',
                notifications: settings.notifications || {
                    newOrders: true,
                    lowStock: true,
                    newUsers: true,
                    newReviews: true
                }
            });
        }
    }, [settings]);

    // Error handling
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [name]: checked
            }
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        try {
            await dispatch(updateSettings(formData)).unwrap();
            toast.success('Đã lưu cài đặt thành công!', {
                position: 'top-center',
                autoClose: 2000
            });
        } catch (err) {
            toast.error(err || 'Lưu cài đặt thất bại');
        }
    };

    if (loading && !settings) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        // ... rest of JSX (keep existing)
    );
}
```

---

## Verification Plan

### Testing Steps

1. **Backend Testing (Postman)**
   ```
   GET http://localhost:4000/api/v1/admin/settings
   Headers: Cookie: token=<admin-jwt-token>
   Expected: 200 OK with settings data
   ```

2. **Frontend Testing**
   - Navigate to `/admin/settings`
   - Check if data loads from backend
   - Update fields and click Save
   - Verify toast success message
   - Reload page → data should persist

3. **Error Scenarios**
   - Non-admin user access → Should redirect/error
   - Invalid email format → Validation error
   - Missing required fields → Error message

---

## Key Takeaways

### Architecture Decisions

1. **Singleton Settings Model** → One source of truth
2. **RESTful API** → Standard, predictable endpoints
3. **Redux for State** → Global access, predictable updates
4. **Middleware Chain** → Security layers (auth → role check)
5. **Error Handling** → Consistent error responses

### Best Practices Applied

- ✅ Input validation (frontend + backend)
- ✅ Authentication & Authorization
- ✅ Error handling with try-catch
- ✅ Loading states for UX
- ✅ Toast notifications for feedback
- ✅ Default values for new installations
