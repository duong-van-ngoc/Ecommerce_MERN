// 1. Import Reducer
import voucherReducer from "./store/voucherSlice";

// 2. Export API
export * from "./api/voucherApi";

// 3. Export Components
export { default as VoucherCard } from "./components/VoucherCard";
export { default as VoucherList } from "./components/VoucherList";

// 4. Export Hooks
export * from "./hooks/useVouchers";

// 5. Export Store constants/actions
export * from "./store/voucherSlice";

// 6. Named Export cho Reducer
export { voucherReducer };

// 7. Default Export cho Reducer (Dùng cho store.js)
export default voucherReducer;
