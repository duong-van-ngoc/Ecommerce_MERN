/**
 * ============================================================================
 * REDUX SLICE: cartSlice
 * ============================================================================
 * 1. Vai trò: 
 *    - Quản lý trạng thái giỏ hàng (sản phẩm, số lượng, biến thể) và thông tin vận chuyển.
 *    - Hỗ trợ lưu trữ riêng biệt cho từng người dùng thông qua LocalStorage.
 *    - Đồng bộ hóa dữ liệu với Backend Cart (Database).
 * 
 * 2. Luồng hoạt động (Mới):
 *    - (1) Ứng dụng khởi chạy (App.jsx) -> Kiểm tra thông tin người dùng.
 *    - (2) Nhận diện User ID -> Dispatch `syncCartWithUser(userId)`.
 *    - (3) Nếu đã đăng nhập -> Dispatch `fetchCart()` để lấy dữ liệu từ DB.
 *    - (4) Khi thêm/xóa/sửa: Cập nhật song song LocalStorage và DB (qua API).
 * ============================================================================
 */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../api/http.js";

// Hàm hỗ trợ lấy Key LocalStorage động dựa trên ID người dùng
const getCartKey = (userId) => userId ? `cartItems_${userId}` : 'cartItems_guest';
const getShippingKey = (userId) => userId ? `shippingInfo_${userId}` : 'shippingInfo_guest';

// Thunk: Lấy giỏ hàng từ Backend
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get('/api/v1/cart');
        return data.cart.items;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Không thể tải giỏ hàng');
    }
});

// Thunk: Đồng bộ giỏ hàng hiện tại lên Backend (ví dụ sau khi login)
export const syncCartWithDB = createAsyncThunk('cart/syncCartWithDB', async (items, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/v1/cart/sync', { items });
        return data.cart.items;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Lỗi đồng bộ giỏ hàng');
    }
});

// Thunk: Thêm sản phẩm vào giỏ hàng
export const addItemsToCart = createAsyncThunk('cart/addItemsToCart', async ({ id, quantity, isUpdate, size, color }, { getState, rejectWithValue }) => {
    try {
        const { data } = await axios.get(`/api/v1/products/${id}`);
        const item = {
            product: data.product._id,
            name: data.product.name,
            price: data.product.price,
            image: data.product.images[0].url,
            stock: data.product.stock,
            quantity: quantity,
            isUpdate: isUpdate,
            size: size,
            color: color
        };

        const { user } = getState().user;
        if (user) {
            await axios.post('/api/v1/cart/item', item);
        }

        return item;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Đã xảy ra lỗi')
    }
});

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        userId: null,
        cartItems: [],
        loading: false,
        error: null,
        success: false,
        message: null,
        shippingInfo: {
            address: "", pinCode: "", phoneNumber: "", country: "VN",
            provinceCode: "", districtCode: "", wardCode: "",
            provinceName: "", districtName: "", wardName: "",
        },
    },
    reducers: {
        syncCartWithUser: (state, action) => {
            const userId = action.payload;
            state.userId = userId;
            state.cartItems = JSON.parse(localStorage.getItem(getCartKey(userId))) || [];
            state.shippingInfo = JSON.parse(localStorage.getItem(getShippingKey(userId))) || {
                address: "", pinCode: "", phoneNumber: "", country: "VN",
                provinceCode: "", districtCode: "", wardCode: "",
                provinceName: "", districtName: "", wardName: "",
            };
        },
        removeErrors: (state) => {
            state.error = null
        },
        removeMessage: (state) => {
            state.message = null
            state.success = false
        },
        removeItemFromCart: (state, action) => {
            const { product, size, color } = action.payload;
            const pId = product && typeof product === 'object' ? product._id : product;
            const pSize = size || '';
            const pColor = color || '';

            state.cartItems = state.cartItems.filter(item => {
                const itemProductId = item.product && typeof item.product === 'object' ? item.product._id : item.product;
                return !(itemProductId === pId && (item.size || '') === pSize && (item.color || '') === pColor);
            });
            
            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));

            if (state.userId) {
                axios.post('/api/v1/cart/item/remove', { product: pId, size: pSize, color: pColor }).catch(err => console.error(err));
            }
        },
        saveShippingInfo: (state, action) => {
            state.shippingInfo = action.payload;
            localStorage.setItem(getShippingKey(state.userId), JSON.stringify(state.shippingInfo));
        },
        removeOrderedItems: (state, action) => {
            const orderedItems = action.payload || [];
            const orderedKeys = new Set(orderedItems.map(item => {
                const pId = item.product && typeof item.product === 'object' ? item.product._id : item.product;
                return `${pId}-${item.size || ''}-${item.color || ''}`;
            }));

            state.cartItems = state.cartItems.filter(item => {
                const pId = item.product && typeof item.product === 'object' ? item.product._id : item.product;
                const key = `${pId}-${item.size || ''}-${item.color || ''}`;
                return !orderedKeys.has(key);
            });

            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
        },
        clearCart: (state) => {
            state.cartItems = [];
            state.shippingInfo = {
                address: "", pinCode: "", phoneNumber: "", country: "VN",
                provinceCode: "", districtCode: "", wardCode: "",
                provinceName: "", districtName: "", wardName: "",
            };
            localStorage.removeItem(getCartKey(state.userId));
            localStorage.removeItem(getShippingKey(state.userId));
        }
    },
    extraReducers: (builder) => {
        builder.addCase('user/logout/fulfilled', (state) => {
            state.userId = null;
            state.cartItems = JSON.parse(localStorage.getItem(getCartKey(null))) || [];
            state.shippingInfo = JSON.parse(localStorage.getItem(getShippingKey(null))) || {
                address: "", pinCode: "", phoneNumber: "", country: "VN",
                provinceCode: "", districtCode: "", wardCode: "",
                provinceName: "", districtName: "", wardName: "",
            };
        })
        .addCase(fetchCart.fulfilled, (state, action) => {
            state.cartItems = action.payload || [];
            state.loading = false;
            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
        })
        .addCase(syncCartWithDB.fulfilled, (state, action) => {
            state.cartItems = action.payload || [];
            state.loading = false;
            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
        })
        .addCase(addItemsToCart.fulfilled, (state, action) => {
            const item = action.payload;
            const existingItem = state.cartItems.find((i) => {
                const iId = (typeof i.product === 'object' && i.product?._id) ? i.product._id : i.product;
                const itemId = (typeof item.product === 'object' && item.product?._id) ? item.product._id : item.product;
                return iId === itemId && (i.size || "") === (item.size || "") && (i.color || "") === (item.color || "");
            });

            if (existingItem) {
                if (item.isUpdate) {
                    existingItem.quantity = item.quantity;
                    state.message = `Đã cập nhật số lượng ${item.name} thành công`;
                } else {
                    existingItem.quantity += item.quantity;
                    state.message = `Đã thêm ${item.name} vào giỏ hàng thành công`;
                }
            } else {
                state.cartItems.push(item);
                state.message = `Đã thêm ${item.name} vào giỏ hàng thành công`;
            }

            state.loading = false;
            state.success = true;
            localStorage.setItem(getCartKey(state.userId), JSON.stringify(state.cartItems));
        });
    }
});

export const { 
    removeErrors, removeMessage, removeItemFromCart, 
    saveShippingInfo, removeOrderedItems, clearCart, 
    syncCartWithUser 
} = cartSlice.actions;

export default cartSlice.reducer;