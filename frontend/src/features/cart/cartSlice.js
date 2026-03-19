/**
 * ============================================================================
 * COMPONENT: cartSlice
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `cartSlice` trong ứng dụng.
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
 *    - Sử dụng `.map()` để render danh sách elements.
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
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import axios from "axios";
// thêm san pham vao gio hang

export const addItemsToCart = createAsyncThunk('cart/addItemsToCart', async ({ id, quantity, isUpdate, size, color }, { rejectWithValue }) => {
    try {
        const { data } = await axios.get(`/api/v1/products/${id}`);
        console.log('thêm sản phẩm vào giỏ hàng thành công (cartSlice) ', data);

        return {
            product: data.product._id,
            name: data.product.name,
            price: data.product.price,
            image: data.product.images[0].url,
            stock: data.product.stock,
            quantity: quantity,
            isUpdate: isUpdate,
            size: size,
            color: color

        }

    } catch (error) {
        return rejectWithValue(error.response?.data || 'Đã xảy ra lỗi')
    }
})



// them vao gio hang 
const cartSlice = createSlice({
    name: 'cart',
    // định nghĩa trạng thái ban đầu của giỏ hàng 
    initialState: {
        cartItems: JSON.parse(localStorage.getItem('cartItems')) || [],
        loading: false,
        error: null,
        success: false,
        message: null,
        removingId: null,
        shippingInfo: JSON.parse(localStorage.getItem('shippingInfo')) || {
            address: "",
            pinCode: "",
            phoneNumber: "",
            country: "VN",
            provinceCode: "",
            districtCode: "",
            wardCode: "",
            provinceName: "",
            districtName: "",
            wardName: "",
        },


    },
    reducers: {
        removeErrors: (state) => {
            state.error = null
        },
        removeMessage: (state) => {
            state.message = null
            state.success = false
        },
        removeItemFromCart: (state, action) => {
            const { product, size, color } = action.payload;

            // Lọc bỏ sản phẩm khớp cả ID, size và màu
            state.cartItems = state.cartItems.filter(item =>
                !(item.product === product && item.size === size && item.color === color)
            );

            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        saveShippingInfo: (state, action) => {
            state.shippingInfo = action.payload
            localStorage.setItem('shippingInfo', JSON.stringify(state.shippingInfo));


        },
        removeOrderedItems: (state, action) => {
            const orderedItems = action.payload;

            // Tạo danh sách các key duy nhất của sản phẩm đã đặt (product + size + color)
            const orderedKeys = new Set(orderedItems.map(item => `${item.product}-${item.size}-${item.color}`));

            state.cartItems = state.cartItems.filter(item => !orderedKeys.has(`${item.product}-${item.size}-${item.color}`));
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },

    },
    extraReducers: (builder) => {
        // them san pham vao gio hang
        builder.addCase(addItemsToCart.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
            state.message = null;
        })

        builder.addCase(addItemsToCart.fulfilled, (state, action) => {
            const item = action.payload;

            // kiem tra san pham da co trong gio hang chua (Check cả size và color)
            const exitstingItem = state.cartItems.find((i) =>
                i.product === item.product && i.size === item.size && i.color === item.color
            );

            if (exitstingItem) {

                if (item.isUpdate) {
                    exitstingItem.quantity = item.quantity;
                    state.message = `Đã cập nhật số lượng ${item.name} trong giỏ hàng thành công`;
                } else {
                    exitstingItem.quantity += item.quantity;
                    state.message = `Đã thêm ${item.name} vào giỏ hàng thành công`;
                }

            } else {
                state.cartItems.push(item);
                state.message = `Đã thêm ${item.name} vào giỏ hàng thành công`;
            }

            state.loading = false;
            state.error = null;
            state.success = true;

            // luu gio hang vao localStorage
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));

        })

        builder.addCase(addItemsToCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Đã xảy ra lỗi khi thêm vào giỏ hàng';
        })


    }

})

export const { removeErrors, removeMessage, removeItemFromCart, saveShippingInfo, removeOrderedItems } = cartSlice.actions
export default cartSlice.reducer