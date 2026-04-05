/**
 * FILE: frontend/src/features/voucher/voucherSlice.js
 * VAI TRÒ: Quản lý trạng thái Voucher (Mã giảm giá) tại Frontend.
 * CHỨC NĂNG: Gọi API kiểm tra mã, lưu trữ số tiền giảm giá và thông báo lỗi.
 */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/http.js";

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

const voucherSlice = createSlice({
  name: "voucher",
  initialState: {
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
      });
  },
});

export const { resetVoucher, clearVoucherErrors } = voucherSlice.actions;
export default voucherSlice.reducer;
