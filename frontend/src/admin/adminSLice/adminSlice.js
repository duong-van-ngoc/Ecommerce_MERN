/**
 * ============================================================================
 * COMPONENT: adminSlice
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `adminSlice` trong ứng dụng.
 * 
 * 2. Props: 
 *    - Không nhận trực tiếp props truyền từ cha.
 * 
 * 3. State:
 *    - Không sử dụng state (Stateless component).
 * 
 * 4. Render lại khi nào:
 *    - Khi component cha re-render.
 * 
 * 5. Event handling:
 *    - Không có event controls phức tạp.
 * 
 * 6. Conditional rendering:
 *    - Sử dụng toán tử 3 ngôi (? :) hoặc `&&` để ẩn/hiện element hoặc component.
 * 
 * 7. List rendering:
 *    - Không sử dụng list rendering.
 * 
 * 8. Controlled input:
 *    - Không chứa form controls.
 * 
 * 9. Lifting state up:
 *    - Dữ liệu được quản lý cục bộ hoặc đẩy lên Redux store toàn cục.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Component Mount -> Chỉ mount giao diện thuần và nhận Props.
 *    - (2) Nhận State/Props và render UI ban đầu.
 *    - (3) End-User tương tác trên component -> Cập nhật State -> Re-render màn hình.
 * ============================================================================
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/http.js';

/**
 * Async Thunk - Lấy thống kê dashboard
 */
export const fetchDashboardStats = createAsyncThunk(
    'admin/fetchDashboardStats',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/api/v1/admin/dashboard', {
                withCredentials: true
            });
            return data.stats;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải dữ liệu');
        }
    }
);

/**
 * Async Thunk - Lấy đơn hàng gần đây
 */
export const fetchRecentOrders = createAsyncThunk(
    'admin/fetchRecentOrders',
    async (limit = 5, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/v1/admin/orders/recent?limit=${limit}`, {
                withCredentials: true
            });
            return data.orders;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải đơn hàng');
        }
    }
);

/**
 * Async Thunk - Lấy tất cả sản phẩm (Admin)
 */
export const fetchAllProducts = createAsyncThunk(
    'admin/fetchAllProducts',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/api/v1/admin/products', {
                withCredentials: true
            });
            return data.products;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải sản phẩm');
        }
    }
);

/**
 * Async Thunk - Tạo sản phẩm mới
 */
export const createProduct = createAsyncThunk(
    'admin/createProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/api/v1/admin/products/create', productData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data.product;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tạo sản phẩm');
        }
    }
);

/**
 * Async Thunk - Cập nhật sản phẩm
 */
export const updateProduct = createAsyncThunk(
    'admin/updateProduct',
    async ({ id, productData }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/v1/admin/products/${id}`, productData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data.product;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật sản phẩm');
        }
    }
);

/**
 * Async Thunk - Xóa sản phẩm
 */
export const deleteProduct = createAsyncThunk(
    'admin/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/v1/admin/products/${id}`, {
                withCredentials: true
            });
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa sản phẩm');
        }
    }
);

/**
 * Async Thunk - Import sản phẩm hàng loạt từ Excel/CSV
 */
export const importProducts = createAsyncThunk(
    'admin/importProducts',
    async (products, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/api/v1/admin/products/import',
                { products },
                { withCredentials: true }
            );
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Import sản phẩm thất bại');
        }
    }
);

/**
 * Async Thunk - Import tồn kho hàng loạt
 */
export const importStock = createAsyncThunk(
    'admin/importStock',
    async (items, { rejectWithValue }) => {
        try {
            const { data } = await axios.put('/api/v1/admin/products/import-stock',
                { items },
                { withCredentials: true }
            );
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Import tồn kho thất bại');
        }
    }
);

/**
 * Async Thunk - Cập nhật tồn kho 1 sản phẩm
 */
export const updateSingleStock = createAsyncThunk(
    'admin/updateSingleStock',
    async ({ id, quantity }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/v1/admin/products/${id}/stock`,
                { quantity },
                { withCredentials: true }
            );
            return data.product;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Cập nhật tồn kho thất bại');
        }
    }
);

/**
 * Async Thunk - Tìm kiếm sản phẩm theo tên (Admin)
 */
export const searchAdminProducts = createAsyncThunk(
    'admin/searchAdminProducts',
    async (name, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/v1/admin/products/search?name=${encodeURIComponent(name)}`, {
                withCredentials: true
            });
            return data.products;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Tìm kiếm thất bại');
        }
    }
);

/**
 * === ORDERS MANAGEMENT ===
 */

/**
 * Async Thunk - Lấy tất cả đơn hàng (admin)
 */
export const fetchAllOrders = createAsyncThunk(
    'admin/fetchAllOrders',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/api/v1/admin/orders/', {
                withCredentials: true
            });
            return data.orders;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải đơn hàng');
        }
    }
);

/**
 * Async Thunk - Cập nhật trạng thái đơn hàng
 */
export const updateOrderStatus = createAsyncThunk(
    'admin/updateOrderStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/v1/admin/order/${id}`,
                { status },
                { withCredentials: true }
            );
            return data.order;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật đơn hàng');
        }
    }
);

/**
 * Async Thunk - Xóa đơn hàng
 */
export const deleteOrder = createAsyncThunk(
    'admin/deleteOrder',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/v1/admin/order/${id}`, {
                withCredentials: true
            });
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa đơn hàng');
        }
    }
);

/**
 * === USERS MANAGEMENT ===
 */

/**
 * Async Thunk - Lấy tất cả users (admin)
 */
export const fetchAllUsers = createAsyncThunk(
    'admin/fetchAllUsers',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/api/v1/admin/users', {
                withCredentials: true
            });
            return data.users;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách user');
        }
    }
);

/**
 * Async Thunk - Cập nhật role user
 */
export const updateUserRole = createAsyncThunk(
    'admin/updateUserRole',
    async ({ id, role }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/v1/admin/users/${id}`,
                { role },
                { withCredentials: true }
            );
            return data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật role');
        }
    }
);

/**
 * Async Thunk - Xóa user
 */
export const deleteUser = createAsyncThunk(
    'admin/deleteUser',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/v1/admin/users/${id}`, {
                withCredentials: true
            });
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể xóa user');
        }
    }
);

/**
 * ========================================
 * SETTINGS MANAGEMENT
 * ========================================
 * 
 * LÝ DO DÙNG REDUX THUNK:
 * - Settings cần lưu global state (dùng ở nhiều components)
 * - Cần handle async API calls
 * - Cần dispatch nhiều actions (loading, success, error)
 * 
 * THUNK PATTERN:
 * thunk = async function nhận (dispatch, getState) và return promise
 * createAsyncThunk tự động tạo 3 action types:
 * - pending: Khi bắt đầu call API
 * - fulfilled: Khi API success
 * - rejected: Khi API fail
 */

/**
 * Async Thunk - Lấy settings từ server
 * 
 * FLOW:
 * 1. Component dispatch fetchSettings()
 * 2. Redux dispatch 'fetchSettings/pending'
 * 3. Call API GET /api/v1/admin/settings
 * 4. Success → dispatch 'fetchSettings/fulfilled' với data
 *    Fail → dispatch 'fetchSettings/rejected' với error
 * 
 * PARAMETERS:
 * - Param 1: 'admin/fetchSettings' - Action type prefix
 * - Param 2: Async callback function
 *   - Argument 1: _ (không cần params)
 *   - Argument 2: { rejectWithValue } - Thunk API
 */
export const fetchSettings = createAsyncThunk(
    'admin/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            // axios.get() - HTTP GET request
            // withCredentials: true - Gửi cookies (JWT token) kèm theo
            const { data } = await axios.get('/api/v1/admin/settings', {
                withCredentials: true
            });

            // Return data.settings → sẽ trở thành action.payload
            return data.settings;
        } catch (error) {
            // rejectWithValue() - Trả về custom error payload
            // error.response?.data?.message - Error message từ backend
            // Fallback: 'Không thể tải cài đặt' nếu không có message
            return rejectWithValue(
                error.response?.data?.message || 'Không thể tải cài đặt'
            );
        }
    }
);

/**
 * Async Thunk - Cập nhật settings
 * 
 * FLOW:
 * 1. Component dispatch updateSettings(formData)
 * 2. Redux dispatch 'updateSettings/pending'
 * 3. Call API PUT /api/v1/admin/settings với settingsData
 * 4. Success → dispatch 'updateSettings/fulfilled' với updated data
 *    Fail → dispatch 'updateSettings/rejected' với error
 * 
 * PARAMETERS:
 * - Param 1: settingsData - Object chứa form data từ component
 *   { adminName, email, companyName, address, notifications }
 * - Param 2: { rejectWithValue } - Thunk API
 */
export const updateSettings = createAsyncThunk(
    'admin/updateSettings',
    async (settingsData, { rejectWithValue }) => {
        try {
            // axios.put() - HTTP PUT request
            // Param 1: URL
            // Param 2: Request body (settingsData)
            // Param 3: Config (withCredentials)
            const { data } = await axios.put(
                '/api/v1/admin/settings',
                settingsData,
                { withCredentials: true }
            );

            // Return updated settings → action.payload
            return data.settings;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Không thể cập nhật cài đặt'
            );
        }
    }
);

/**
 * Admin Slice
 */
const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        stats: null,
        recentOrders: [],
        products: [],
        orders: [],
        users: [],
        settings: null,
        searchResults: [],    // Kết quả tìm kiếm sản phẩm
        importResult: null,   // Kết quả import
        loading: false,
        error: null
    },
    reducers: {
        // Có thể thêm reducers khác nếu cần
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch Dashboard Stats
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch Recent Orders
        builder
            .addCase(fetchRecentOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRecentOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.recentOrders = action.payload;
            })
            .addCase(fetchRecentOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch All Products
        builder
            .addCase(fetchAllProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Create Product
        builder
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products.push(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update Product
        builder
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.products.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Delete Product
        builder
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products = state.products.filter(p => p._id !== action.payload);
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch All Orders
        builder
            .addCase(fetchAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update Order Status
        builder
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.orders.findIndex(o => o._id === action.payload._id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Delete Order
        builder
            .addCase(deleteOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = state.orders.filter(o => o._id !== action.payload);
            })
            .addCase(deleteOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch All Users
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update User Role
        builder
            .addCase(updateUserRole.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.users.findIndex(u => u._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Delete User
        builder
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.filter(u => u._id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * ========================================
         * SETTINGS REDUCERS
         * ========================================
         * 
         * EXTRA REDUCERS:
         * - Xử lý actions từ async thunks
         * - Không thể dùng trong reducers thường vì async
         * - Builder pattern: Chuỗi .addCase() để handle các cases
         * 
         * STATE TRANSITIONS:
         * pending → loading = true, error = null
         * fulfilled → loading = false, update data
         * rejected → loading = false, set error
         */

        // ===== Fetch Settings =====
        builder
            /** 
             * PENDING STATE
             * Trigger: Khi gọi dispatch(fetchSettings())
             * Action: Set loading = true để hiện spinner
             */
            .addCase(fetchSettings.pending, (state) => {
                state.loading = true;
                state.error = null; // Clear error cũ
            })

            /** 
             * FULFILLED STATE
             * Trigger: Khi API success
             * Payload: action.payload = settings object từ server
             * Action: Lưu settings vào state
             */
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload; // Update settings từ server
            })

            /** 
             * REJECTED STATE
             * Trigger: Khi API fail (network error, 401, 500, etc)
             * Payload: action.payload = error message
             * Action: Set error để component hiện thông báo
             */
            .addCase(fetchSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ===== Update Settings =====
        builder
            /** PENDING: Khi click Save button */
            .addCase(updateSettings.pending, (state) => {
                state.loading = true; // Disable button, show loading
            })

            /** 
             * FULFILLED: Khi update thành công
             * Optimistic update: Cập nhật state ngay với data mới
             * Không cần refetch - server đã return updated data
             */
            .addCase(updateSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload; // Update với data mới từ server
            })

            /** REJECTED: Khi update fail */
            .addCase(updateSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ===== Import Products (batch) =====
        builder
            .addCase(importProducts.pending, (state) => {
                state.loading = true;
                state.importResult = null;
            })
            .addCase(importProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.importResult = action.payload;
                // Thêm sản phẩm mới vào danh sách
                if (action.payload.products) {
                    state.products = [...state.products, ...action.payload.products];
                }
            })
            .addCase(importProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ===== Import Stock (batch) =====
        builder
            .addCase(importStock.pending, (state) => {
                state.loading = true;
                state.importResult = null;
            })
            .addCase(importStock.fulfilled, (state, action) => {
                state.loading = false;
                state.importResult = action.payload;
                // Cập nhật stock trong danh sách products
                if (action.payload.details) {
                    action.payload.details.forEach(item => {
                        const idx = state.products.findIndex(p => p._id === item._id);
                        if (idx !== -1) {
                            state.products[idx].stock = item.newStock;
                        }
                    });
                }
            })
            .addCase(importStock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ===== Update Single Stock =====
        builder
            .addCase(updateSingleStock.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateSingleStock.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.products.findIndex(p => p._id === action.payload._id);
                if (idx !== -1) {
                    state.products[idx] = action.payload;
                }
                // Cập nhật cả searchResults
                const sIdx = state.searchResults.findIndex(p => p._id === action.payload._id);
                if (sIdx !== -1) {
                    state.searchResults[sIdx].stock = action.payload.stock;
                }
            })
            .addCase(updateSingleStock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ===== Search Admin Products =====
        builder
            .addCase(searchAdminProducts.pending, (state) => {
                state.loading = true;
                state.searchResults = [];
            })
            .addCase(searchAdminProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchAdminProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
