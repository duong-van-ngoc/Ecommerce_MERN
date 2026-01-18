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
    initialState: {
        cartItems:[],
        loading:false,
        error: null,
        success: false,
        message: null
    },
    reducers: {
        removeError:(state) => {
            state.error = null
        },
        removeMessage:(state) => {
            state.message = null
        }
     },
     extraReducers : (builder) => {
        // them san pham vao gio hang
        builder.addCase(addItemsToCart.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(addItemsToCart.fulfilled, (state, action) => {
            const item = action.payload;
            console.log('item cart slice', item);
        })
        builder.addCase(addItemsToCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Đã xảy ra lỗi khi thêm vào giỏ hàng';
        })
    }

})

export const {removeError, removeMessage} = cartSlice.actions
export default cartSlice.reducer