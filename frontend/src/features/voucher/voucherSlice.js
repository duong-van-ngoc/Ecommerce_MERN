/**
 * FILE: frontend/src/features/voucher/voucherSlice.js
 * VAI TRÒ: Quản lý trạng thái Voucher (Mã giảm giá) tại Frontend.
 * CHỨC NĂNG: Gọi API kiểm tra mã, lưu trữ số tiền giảm giá và thông báo lỗi.
 */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/shared/api/http.js";

// Thunk: Kiểm tra và áp dụng Voucher
export const applyVoucher = createAsyncThunk(
  "voucher/applyVoucher",
  async ({ voucherCode, itemPrice }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/v1/vouchers/apply", { 
        voucherCode, 
        itemPrice 
      });
      return data; // { success, isValid, discountAmount, voucherCode, message }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể áp dụng mã giảm giá"
      );
    }
  }
);

// Thunk: Lấy danh sách Voucher công khai đang hoạt động
export const fetchActiveVouchers = createAsyncThunk(
  "voucher/fetchActiveVouchers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/v1/vouchers/all");
      return data.vouchers;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lấy danh sách mã giảm giá"
      );
    }
  }
);

const voucherSlice = createSlice({
  name: "voucher",
  initialState: {
    activeVouchers: [],   // Danh sách voucher công khai từ kho
    appliedVoucher: null, // Lưu kết quả validation từ server
    voucherCode: "",      // Mã đang nhập hoặc đã apply
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetVoucher: (state) => {
      state.appliedVoucher = null;
      state.voucherCode = "";
      state.error = null;
      state.success = false;
    },
    clearVoucherErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Apply Voucher
      .addCase(applyVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.appliedVoucher = action.payload;
        state.voucherCode = action.payload.voucherCode;
        state.success = true;
        state.error = null;
      })
      .addCase(applyVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.appliedVoucher = null;
        state.success = false;
      })
      // Fetch Active Vouchers
      .addCase(fetchActiveVouchers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.activeVouchers = action.payload;
      })
      .addCase(fetchActiveVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetVoucher, clearVoucherErrors } = voucherSlice.actions;
export default voucherSlice.reducer;

