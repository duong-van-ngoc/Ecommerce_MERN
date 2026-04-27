/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Mảnh quản lý trạng thái Sản phẩm (Product Redux Slice).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Quản lý toàn bộ dữ liệu liên quan đến hàng hóa: Danh sách sản phẩm, chi tiết từng sản phẩm, và các trạng thái tìm kiếm/lọc.
 *    - Chịu trách nhiệm xây dựng các yêu cầu truy vấn (Query) phức tạp gửi lên Backend để lấy đúng dữ liệu người dùng mong muốn.
 *    - Điều khiển việc hiển thị danh sách sản phẩm trên trang chủ, trang tìm kiếm và phân trang (Pagination).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Dữ liệu Sản phẩm (Product Data Flow) & Hiển thị hàng hóa.
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `createAsyncThunk`: Xử lý gọi API bất đồng bộ với 3 trạng thái (Pending, Fulfilled, Rejected).
 *    - Dynamic URL Construction: Kỹ thuật xây dựng chuỗi truy vấn (Query String) động dựa trên các bộ lọc (giá, danh mục, đánh giá sao, trạng thái kho).
 *    - Redux Toolkit: Sử dụng `createSlice` và `extraReducers` để cập nhật kho dữ liệu một cách chuyên nghiệp.
 *    - API Mapping: Chuyển đổi các lựa chọn sắp xếp của người dùng trên giao diện sang các tham số mà Database hiểu được (VD: "Mới nhất" -> `-createdAt`).
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Các tiêu chí tìm kiếm từ người dùng (từ khóa, khoảng giá, số trang...).
 *    - Output: Mảng danh sách sản phẩm, thông tin chi tiết một sản phẩm, và các thông số phân trang.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `products`: Danh sách các mặt hàng đang hiển thị.
 *    - `product`: Dữ liệu chi tiết của một món hàng khi xem trang chi tiết.
 *    - `loading`: Trạng thái đang tải dữ liệu để hiển thị Spinner hoặc Skeleton.
 *    - `totalPages`: Tổng số trang có thể hiển thị sau khi đã lọc.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `getProduct`: Thunk quyền lực nhất, xử lý hàng loạt bộ lọc (Category, Price Range, Ratings, Stock, Sort) để gửi lên Server.
 *    - `getProductDetails`: Lấy thông tin từ Backend dựa trên ID sản phẩm.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Component (như trang Sản phẩm) gọi `dispatch(getProduct)` kèm các filter.
 *    - Bước 2: Slice xây dựng đường link API có chứa đầy đủ tham số (VD: `?page=1&keyword=laptop&price[gte]=500`).
 *    - Bước 3: Gọi Axios trỏ tới Backend.
 *    - Bước 4: Backend trả data -> Slice cập nhật vào `state.products` -> Giao diện React tự động vẽ lại.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - React Component -> Dispatch Action -> Slice (Build Query) -> Backend (API) -> MongoDB -> Slice -> React UI.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Logic kiểm tra `inStock`: Nếu người dùng tick chọn, slice sẽ gắn thêm tham số để Backend chỉ trả về sản phẩm còn hàng.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Sử dụng `createAsyncThunk` kết hợp `async/await` và xử lý lỗi bằng `rejectWithValue`.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Khi Backend thay đổi cấu trúc lọc (ví dụ đổi `price[gte]` thành `minPrice`), bạn PHẢI cập nhật logic xây dựng `link` trong `getProduct` đầu tiên.
 *    - `resultPerPage` cần phải đồng bộ với thiết lập của Backend để đảm bảo phân trang không bị lệch.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/shared/api/http.js';


// Lấy danh sách sản phẩm (có filter + sort + pagination)
export const getProduct = createAsyncThunk('product/getProduct',
  async ({ keyword, page = 1, category, price, sort, ratings, inStock }, { rejectWithValue }) => {
    try {
      // Bắt đầu với page
      let link = `/api/v1/products?page=${page}`;

      // Filter: category
      if (category) {
        link += `&category=${encodeURIComponent(category)}`;
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
      return rejectWithValue(error.response?.data || "Đã xảy ra lỗi khi tải sản phẩm!");
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
    totalPages: 0,
    hasResults: true,
    relatedProducts: [],
    message: null
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
        state.hasResults = action.payload.hasResults !== undefined ? action.payload.hasResults : true;
        state.relatedProducts = action.payload.relatedProducts || [];
        state.message = action.payload.message || null;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đã xảy ra lỗi';
        state.products = [];
        state.hasResults = false;
        state.relatedProducts = [];
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
