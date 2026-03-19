/**
 * ============================================================================
 * COMPONENT: orderSlice
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `orderSlice` trong ứng dụng.
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
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'



// Tạo order slice
export const createOrder = createAsyncThunk('order/createOrder', async (order, { rejectWithValue }) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const { data } = await axios.post('/api/v1/order/new', order, config)
        console.log('du lieu dat hang', data);
        return data


    } catch (error) {
        return rejectWithValue(error.response?.data || ' tao don hang that bai')
    }
})


// lấy tất cả đơn hàng của user hiện tại

export const getMyOrders = createAsyncThunk('order/getAllMyOrders', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get("/api/v1/orders/user")
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "khong tai duoc don hang "

        )
    }
})

// lấy chi tiết 1 đơn hàng
export const getOrderDetails = createAsyncThunk('order/getOrderDetails', async (id, { rejectWithValue }) => {
    try {
        const { data } = await axios.get(`/api/v1/order/${id}`)
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "khong tai duoc chi tiet don hang")
    }
})


const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        success: false,
        loading: false,
        error: null,
        orders: [],
        order: {},
        orderDetails: {},
        orderId: null,
    },
    reducers: {
        removeErrors: (state) => {
            state.error = null
        },
        removeSuccess: (state) => {
            state.success = false
        }
    },
    extraReducers: (builder) => {
        builder
            // tao don hang 
            .addCase(createOrder.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false
                state.order = action.payload.order
                state.success = action.payload.success
                state.orderId = action.payload?.orderId || action.payload?.order?._id || null;

            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Tao don hang that bai'
            })

            // lay don hang 

            .addCase(getMyOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload?.orders || [];
            })
            .addCase(getMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Không tải được đơn hàng";
            })
            // lay chi tiet don hang
            .addCase(getOrderDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.orderDetails = action.payload?.order || {};
            })
            .addCase(getOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Không tải được chi tiết đơn hàng";
            });
    }
})

export const { removeErrors, removeSuccess } = orderSlice.actions

export default orderSlice.reducer

