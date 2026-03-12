# Kế Hoạch Tích Hợp Chi Tiết Đơn Hàng

Kế hoạch này dựa trên yêu cầu mã HTML đã được cung cấp để tạo trang xem chi tiết đơn hàng cho E-Commerce Platform.

## 1. Backend: Bổ sung API Xem Chi Tiết
Hiện tại code backend chỉ có API lấy thông tin đơn hàng cho **Admin**. Ta sẽ mở rộng để cho phép **người dùng thông thường** xem đơn hàng của họ.
*   **File:** `backend/routes/orderRoutes.js`
*   **Thực hiện:** Bổ sung endpoint `GET /api/v1/order/:id` gọi hàm `getSingleOrder`.
*   **File:** `backend/controllers/orderController.js`
*   **Thực hiện:** Cập nhật hàm `getSingleOrder` để kiểm tra quyền: Nếu user đang gọi API không phải là người mua đơn hàng này và cũng không phải admin, thì trả về lỗi `403 Forbidden`.

## 2. Frontend: Trạng Thái (Redux)
Triển khai chức năng gọi API cập nhật trạng thái đơn hàng.
*   **File:** `frontend/src/features/orders/orderSlice.js`
*   **Thực hiện:** Thêm action `getOrderDetails` sử dụng `createAsyncThunk` để thực hiện call HTTP bằng `axios`. Cập nhật `orderSlice` để lưu trữ `orderDetails`, `loading`, và `error`.

## 3. Frontend: Giao Diện (UI)
*   **File mới:** `frontend/src/Cart/OrderDetails.jsx`
*   **Thực hiện:**
    *   Tạo React Component nhận mã HTML bạn vừa cung cấp, chuyển đổi class HTML thành `className` theo chuẩn JSX.
    *   Import React hooks (`useEffect`, `useParams`) và Redux hooks (`useDispatch`, `useSelector`).
    *   Khi component load, dispatch `getOrderDetails(id)` để lấy dữ liệu.
    *   Thay thế dữ liệu cứng (mock data) trong HTML thành các biến từ Redux state (tên, số điện thoại, danh sách sản phẩm, trạng thái thanh toán...).
    *   Bao gồm cả file CSS `OrderDetails.css`.

## 4. Frontend: Điều Hướng (Routing)
*   **File:** `frontend/src/App.jsx`
*   **Thực hiện:** Đăng ký route: `<Route path="/order/:id" element={<OrderDetails />} />`

## Kết Luận
Bằng cách triển khai theo bốn bước trên, hệ thống sẽ kết nối thành công nút "Xem chi tiết" với màn hình đơn hàng cá nhân một cách bảo mật và hiển thị được trên UI một cách trực quan, theo đúng thiết kế Tailwind bạn mong muốn.
