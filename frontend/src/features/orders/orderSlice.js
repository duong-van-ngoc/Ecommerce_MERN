import {createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'



// Tạo order slice
export const createOrder = createAsyncThunk('order/createOrder', async (order, {rejectWithValue}) => {
    try {
            const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const {data} = await axios.post('/api/v1/order/new', order, config)
        console.log('du lieu dat hang', data);
        return data
        

    } catch (error) {
        return rejectWithValue(error.response?.data|| ' tao don hang that bai')
    }
})


// lấy tất cả đơn hàng của user hiện tại

export const getMyOrders = createAsyncThunk('order/getAllMyOrders', async (_, {rejectWithValue}) => {
    try {
        const { data } = await axios.get("/api/v1//orders/user")
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "khong tai duoc don hang "

        )
    }
})


const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        success: false,
        loading: false,
        error: null,
        orders: [],
        order:{},
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
      });
    }
})

export const {removeErrors, removeSuccess} = orderSlice.actions

export default orderSlice.reducer

