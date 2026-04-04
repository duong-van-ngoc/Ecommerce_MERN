# 🐛 Error Log - E_Commerce_MERN

> Tập hợp tất cả lỗi xảy ra trong quá trình phát triển (Auto-generated).

---

## Thống kê nhanh
- **Tổng lỗi**: 1
- **Đã sửa**: 1

---

## [2026-03-30 23:45] - Dữ liệu AI Stylist không lưu & Mất hình ảnh khi Update

- **Type**: Logic / Data Persistence
- **Severity**: Critical
- **File**: `backend/controllers/productController.js`, `frontend/src/admin/components/ProductFormModal.jsx`
- **Agent**: Tobi (Antigravity Orchestrator)
- **Status**: Fixed 🎯
- **Root Cause**: 
    1. Backend: Dòng `req.body.images = images` gán mảng rỗng nếu không có ảnh mới, xóa sạch ảnh cũ.
    2. Backend: Thiếu trích xuất tường minh các trường `style`, `vibe` từ `req.body` trong multipart request.
    3. Frontend: Modal không đóng sau khi lưu, dẫn đến `useEffect` nạp lại dữ liệu cũ từ Redux store.
- **Fix Applied**: 
    1. Backend: Chỉ cập nhật `images` nếu `images.length > 0`. Trích xuất trực tiếp `style`, `vibe`, `trending`.
    2. Frontend: Chuyển sang dùng `.set()` cho `FormData` và gọi `onClose()` sau khi thành công.
- **Prevention**: Luôn kiểm tra sự tồn tại của file trước khi ghi đè mảng. UI phải đồng bộ ngay khi Store cập nhật.


---

## [2026-04-04 11:07] - Lỗi Transaction MongoDB khi Hủy đơn (Standalone local)

- **Type**: Runtime / Configuration
- **Severity**: High
- **File**: `backend/controllers/orderController.js`
- **Agent**: Tobi (Antigravity Orchestrator)
- **Status**: Fixed 🎯
- **Root Cause**: 
    - Database local chạy ở chế độ **Standalone**, không hỗ trợ **Transactions**.
    - Backend bọc logic hủy đơn trong `mongoose.startSession()`, gây ra crash 500.
- **Error Message**: 
  ```
  Transaction numbers are only allowed on a replica set member or mongos
  ```
- **Fix Applied**: 
    - Triển khai **Hybrid Transaction Logic**: Tự động nhận diện Replica Set.
    - Chỉ kích hoạt Session nếu Database có hỗ trợ (Vercel/Atlas). 
    - Chế độ Standalone (Local) sẽ chạy logic tuần tự an toàn.
- **Prevention**: Sử dụng helper function hoặc kiểm tra `topology.type` trước khi dùng Transactions.

---
