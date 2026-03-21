/**
 * ============================================================================
 * COMPONENT: productSlice
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `productSlice` trong ứng dụng.
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


// Lấy danh sách sản phẩm (có filter + sort + pagination)
export const getProduct = createAsyncThunk('product/getProduct',
  async ({ keyword, page = 1, category, price, sort, ratings, inStock }, { rejectWithValue }) => {
    try {
      // Bắt đầu với page
      let link = `/api/v1/products?page=${page}`;

      // Filter: category
      if (category) {
        link += `&category=${category}`;
      }

      // Search: keyword
      if (keyword) {
        link += `&keyword=${keyword}`;
      }

      // Filter: price range
      // price = { gte: 100000, lte: 500000 }
      if (price) {
        if (price.gte !== undefined && price.gte !== null && price.gte > 0) {
          link += `&price[gte]=${price.gte}`;
        }
        if (price.lte !== undefined && price.lte !== null) {
          link += `&price[lte]=${price.lte}`;
        }
      }

      // Filter: ratings (khoảng sao: gte → $gte, lt → $lt)
      if (ratings) {
        if (ratings.gte !== undefined) {
          link += `&ratings[gte]=${ratings.gte}`;
        }
        if (ratings.lt !== undefined) {
          link += `&ratings[lt]=${ratings.lt}`;
        }
      }

      // Filter: stock (chỉ sản phẩm còn hàng)
      if (inStock) {
        link += `&stock=true`;
      }

      // Sort: price (tăng/giảm), newest, etc.
      // sort values: "price" (tăng), "-price" (giảm), "-createdAt" (mới nhất), "-sold" (bán chạy)
      if (sort && sort !== 'newest') {
        // Map frontend sort values → backend sort param
        const sortMap = {
          'price_asc': 'price',
          'price_desc': '-price',
          'rating_desc': '-ratings',
          'bestselling': '-sold',
          'newest': '-createdAt',
        };
        const sortParam = sortMap[sort] || sort;
        link += `&sort=${sortParam}`;
      }

      const { data } = await axios.get(link);
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
    productCount: 0,
    loading: false,
    error: null,
    product: null,
    resultPerPage: 4,
    totalPages: 0
  },
  reducers: {
    removeErrors: (state) => {
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
        state.products = []
      })

    // lay thong tin chi tiet  san pham
    builder.addCase(getProductDetails.pending, (state) => {
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
