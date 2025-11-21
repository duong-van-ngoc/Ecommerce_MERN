import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';


export const getProduct = createAsyncThunk(
  'product/getProduct',
  async ({ keyword, page = 1 }, { rejectWithValue }) => {
    try {
      const link = keyword
        ? `/api/v1/products?keyword=${encodeURIComponent(keyword)}&page=${page}`
        : `/api/v1/products?page=${page}`;

      const { data } = await axios.get(link);
      
      console.log('response', data);
      return data;

    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

// chi tiet san pham 
export const getProductDetails = createAsyncThunk(
  'product/getProductDetails',
  async (id, { rejectWithValue }) => {
    try {
      // Gọi API đúng cấu trúc (Vite sẽ tự proxy sang localhost:8000)
      const { data } = await axios.get(`/api/v1/products/${id}`);

      //Trả về dữ liệu backend (chứa product)
      return data;
    } catch (error) {
      //Trả lỗi theo chuẩn để tránh undefined
      return rejectWithValue({
        message: error.response?.data?.message || 'Đã xảy ra lỗi khi tải sản phẩm!',
        status: error.response?.status || 500,
      });
    }
  }
);


const productSlice = createSlice({
    name: 'product',
    initialState: {
        products: [],
        productCount:0,
        loading:false,
        error:null,
        product:null,
        resultPerPage:4,
        totalPages:0
    },
    reducers:{
        removeErrors:(state) => {
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
            state.resultPerPage = action.payload.resultPerPage;
            state.totalPages = action.payload.totalPages;
        })    
        .addCase(getProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Đã xảy ra lỗi';
            state.products=[]
        })

        // lay thong tin chi tiet  san pham
        builder.addCase(getProductDetails.pending,(state) => {
            state.loading = true;
            state.error = null
        })
        .addCase(getProductDetails.fulfilled, (state, action) => {
            console.log('product details', action.payload);
            state.loading = false;
            state.error = null;
            state.product = action.payload.product;
        })
        .addCase(getProductDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Đã xảy ra lỗi';
        })

    }

})


export const { removeErrors } = productSlice.actions;
export default productSlice.reducer; 
