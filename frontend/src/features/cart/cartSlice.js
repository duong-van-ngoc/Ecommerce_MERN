import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import axios from "axios"; 
// thêm san pham vao gio hang

export const addItemsToCart = createAsyncThunk('cart/addItemsToCart', async({id, quantity}, {rejectWithValue}) => {
    try {
        const { data } = await axios.get(`/api/v1/products/${id}`);
        console.log('thêm sản phẩm vào giỏ hàng thành công (cartSlice) ', data);
        
        return {
            product: data.product._id,
            name: data.product.name,
            price: data.product.price,
            image: data.product.images[0].url,
            stock: data.product.stock,
            quantity: quantity

        }

    } catch (error) {
        return rejectWithValue(error.response?.data ||  'Đã xảy ra lỗi')
    }
})


// them vao gio hang 
const cartSlice = createSlice ({
    name: 'cart',
    // định nghĩa trạng thái ban đầu của giỏ hàng 
    initialState: {
        cartItems: JSON.parse(localStorage.getItem('cartItems'))  || [], 
        loading:false,
        error: null,
        success: false,
        message: null,
        removingId:null
    },
    reducers: {
        removeErrors:(state) => {
            state.error = null
        },
        removeMessage:(state) => {
            state.message = null
            state.success = false
        },
        removeItemFromCart:(state, action) => {
            state.removingId = action.payload; 
            
            state.cartItems = state.cartItems.filter(item => item.product !== action.payload); // lọc bỏ sản phẩm có id trùng với payload
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems)); // cập nhật lại localStorage
            state.removingId = null; 

        }
     },
     extraReducers : (builder) => {
        // them san pham vao gio hang
        builder.addCase(addItemsToCart.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
            state.message = null;
        })
        
        builder.addCase(addItemsToCart.fulfilled, (state, action) => {
            const item = action.payload;

            // kiem tra san pham da co trong gio hang chua
            const exitstingItem = state.cartItems.find((i) => i.product === item.product);
            if(exitstingItem) {
                
                exitstingItem.quantity = item.quantity;
                state.message = `Đã cập nhật số lượng ${item.name} trong giỏ hàng thành công`;

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

export const {removeErrors, removeMessage, removeItemFromCart} = cartSlice.actions
export default cartSlice.reducer