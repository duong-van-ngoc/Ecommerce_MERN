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

// Thunk: Lấy danh sách Voucher người dùng đang sở hữu
export const fetchMyVouchers = createAsyncThunk(
  "voucher/fetchMyVouchers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/v1/user-vouchers/me");
      return data.vouchers;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lấy kho voucher của bạn"
      );
    }
  }
);

// Thunk: User bấm "Lấy mã" (Claim Voucher)
export const claimVoucher = createAsyncThunk(
  "voucher/claimVoucher",
  async (voucherId, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`/api/v1/user-vouchers/claim/${voucherId}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lưu mã giảm giá"
      );
    }
  }
);

const voucherSlice = createSlice({
  name: "voucher",
  initialState: {
    activeVouchers: [],   // Danh sách voucher công khai từ kho (hệ thống)
    myVouchers: [],       // Danh sách voucher người dùng đang sở hữu
    appliedVoucher: null, // Lưu kết quả validation từ server
    voucherCode: "",      // Mã đang nhập hoặc đã apply
    loading: false,
    claimLoading: false,  // Loading riêng cho hành động claim
    error: null,
    success: false,
    claimSuccess: false,  // Cờ báo claim thành công
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
    resetClaimState: (state) => {
      state.claimSuccess = false;
      state.claimLoading = false;
      state.error = null;
    }
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
      })
      // Fetch My Vouchers
      .addCase(fetchMyVouchers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.myVouchers = action.payload;
      })
      .addCase(fetchMyVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Claim Voucher
      .addCase(claimVoucher.pending, (state) => {
        state.claimLoading = true;
        state.error = null;
      })
      .addCase(claimVoucher.fulfilled, (state) => {
        state.claimLoading = false;
        state.claimSuccess = true;
        // Tùy chọn: Có thể refetch hoặc push vào myVouchers
        // Ở đây ta để UI tự refetch hoặc user chuyển trang
      })
      .addCase(claimVoucher.rejected, (state, action) => {
        state.claimLoading = false;
        state.error = action.payload;
        state.claimSuccess = false;
      });
  },
});

export const { resetVoucher, clearVoucherErrors, resetClaimState } = voucherSlice.actions;
export default voucherSlice.reducer;
