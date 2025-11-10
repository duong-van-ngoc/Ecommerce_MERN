import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';


export const getProduct = createAsyncThunk('product/getProduct',async(_,
    {rejectWithValue}) => {
    try {
        const link = '/api/v1/products';
        const {data} = await axios.get(link);
        console.log('response', data);
        return data;

    }catch (error) {
        return rejectWithValue(error.response?.data || "An error occured")
    }
})

// chi tiet san pham 

export const getProductDetails = createAsyncThunk('product/getProductDetails',async(id,
    {rejectWithValue}) => {
        try{
            const link = `/api/v1/produc/${id}`;
            const {data} = await axios.get(link);
            return data;
        }catch(error) {
            return rejectWithValue(error.response?.data || 'An error occured')
        }
})


const productSlice = createSlice({
    name: 'product',
    initialState: {
        products: [],
        productCount:0,
        loading:false,
        error:null,
        product:null
    },
    reducers:{
        removeErros:(state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        //lay san pham 
        builder.addCase(getProduct.pending, (state) => {
            state.loading = true;
            state.error = null;
        
        })
        .addCase(getProduct.fulfilled, (state, action) => {
            console.log('action.payload', action.payload);
            state.loading = false
            state.error = null;
            state.products = action.payload.products;
            state.productCount = action.payload.productCount;
        })    
        .addCase(getProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Đã xảy ra lỗi';
        })

        // lay thong tin chi tiet  san pham
        builder.addCase(getProductDetails.pending,(state) => {
            state.loading = true;
            state.error = null
        })
        .addCase(getProductDetails.fulfilled, (state, action) => {
            console.log('product details', action.payload);
            state.loading = false
            state.error = null;
            state.products = action.payload.product;
        }) 
        .addCase(getProductDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Đã xảy ra lỗi';
        })

    }

})


export const { removeErrors } = productSlice.actions;
export default productSlice.reducer; 
