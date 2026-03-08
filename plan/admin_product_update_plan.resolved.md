# Kế Hoạch Cập Nhật Quản Lý Sản Phẩm (Admin)

Tài liệu này chi tiết hóa việc xây dựng tính năng "Thêm/Sửa Sản Phẩm" trong Admin Dashboard, tập trung vào các đặc thù của ngành hàng Thời trang (Fashion) và giải thích sâu về kỹ thuật React được sử dụng.

## 1. Phân Tích Nghiệp Vụ & Yêu Cầu

Mục tiêu là xây dựng một giao diện nhập liệu mạnh mẽ, dễ sử dụng cho admin shop quần áo.

### Các Trường Dữ Liệu Cần Thiết:
*   **Thông tin cơ bản**: Tên, Mô tả, Giá bán, Tồn kho, Danh mục (Áo, Quần, Phụ kiện...).
*   **Đặc thù Thời trang (Mới)**:
    *   **Giá Gốc (`originalPrice`)**: Để tính toán và hiển thị % giảm giá (Marketing visual). Đặc biệt quan trọng trong ngành thời trang hay có sale.
    *   **Thương hiệu (`brand`)**: Quản lý brand để filter.
    *   **Chất liệu (`material`)**: Thông tin quan trọng cho khách mua online (Cotton, Kaki...).
    *   **Kích thước (`sizes`)**: Tag input động (S, M, L, XL). Sản phẩm thời trang luôn có biến thể size.
    *   **Màu sắc (`colors`)**: Tag input động (Xanh, Đỏ, Pastel...).
*   **Hình ảnh**: Upload nhiều ảnh, cho phép xem trước (Preview) để chọn ảnh đẹp nhất.

### Luồng Người Dùng (User Flow):
1.  **Dashboard**: Xem danh sách -> Nhấn "Thêm Mới" hoặc nút "Sửa" (Icon bút chì).
2.  **Popup Form (Modal)**: Mở ra form nhập liệu ngay trên trang hiện tại (không reload trang, giữ context).
3.  **Nhập liệu**:
    *   Gõ text thông thường.
    *   Nhập Size/Màu: Gõ "Xanh" -> Enter -> Tạo thành 1 thẻ (Tag).
    *   Chọn ảnh: Chọn file từ máy -> Hiện ảnh nhỏ để review ngay lập tức.
4.  **Lưu (Submit)**: Validate dữ liệu -> Gửi lên Server -> Thông báo thành công -> Đóng Form -> Tự động cập nhật lại danh sách.

---

## 2. Giải Mã Kiến Thức Kỹ Thuật (React Deep Dive)

Phần này phân tích chi tiết: **"Tại sao dùng cái này?"** và **"Nó hoạt động thế nào?"**.

### A. State Management với `useState` (Quản lý trạng thái cục bộ)
*   **Sử dụng**: `const [formData, setFormData] = useState({...})`
*   **Tại sao?**: Đây là concept **"Controlled Component"** (Component được kiểm soát).
    *   Mọi ký tự người dùng gõ vào ô input đều đi qua React state (`onChange`).
    *   *Lợi ích*: Giúp ta validate dữ liệu ngay lập tức (ví dụ: không cho nhập chữ vào ô giá tiền), và dễ dàng clear form hoặc fill dữ liệu khi edit.
    *   *Chi tiết*: Chúng ta dùng 1 object state lớn `formData` thay vì 10 biến state lẻ tẻ để code gọn hơn.

### B. Synchronization với `useEffect` (Đồng bộ hóa dữ liệu)
*   **Sử dụng**: `useEffect(() => { if (product) ... }, [product])`
*   **Tại sao?**: Để xử lý logic **"Edit Mode"**.
    *   Khi component Modal sinh ra, state mặc định là rỗng (cho trường hợp Thêm mới).
    *   Nếu props `product` (sản phẩm cần sửa) có giá trị, ta cần "bơm" dữ liệu đó vào `formData` ngay lập tức.
    *   `[product]` là dependency array: React sẽ theo dõi biến này, hễ nó thay đổi là chạy lại logic bên trong (reset form theo sản phẩm mới).

### C. Cơ chế Upload ảnh: `FileReader` vs `FormData`
Đây là phần phức tạp nhất của form này. Chúng ta dùng kết hợp cả hai:
1.  **`FileReader` (Web API)**: Dùng để **Xem Trước (Preview)**.
    *   *Vấn đề*: Trình duyệt bảo mật không cho phép web biết đường dẫn thật của file trên ổ cứng người dùng (C:\...).
    *   *Giải pháp*: Dùng `FileReader.readAsDataURL(file)` để đọc file đó thành một chuỗi mã hóa (`base64 string`). Chuỗi này có thể ném thẳng vào thẻ `<img src="...">` để hiển thị ngay lập tức mà chưa cần upload lên server.
2.  **`FormData` (Web API)**: Dùng để **Gửi lên Server**.
    *   *Vấn đề*: JSON (`{ "key": "value" }`) chỉ gửi được text, không gửi được file nhị phân (ảnh) một cách hiệu quả.
    *   *Giải pháp*: `FormData` giả lập một form HTML multipart chuẩn. Nó đóng gói cả text và file binary để gửi qua HTTP Request. Backend (Multer) sẽ dễ dàng "bóc tách" file ra lưu vào ổ cứng/cloud.

### D. Redux Thunk (Xử lý Bất đồng bộ)
*   **Sử dụng**: `dispatch(createProduct(myForm))`
*   **Tại sao không gọi `axios` trực tiếp trong component?**:
    *   Để tách biệt **UI** (Giao diện) và **Logic** (Nghiệp vụ).
    *   Component chỉ cần biết: "Tôi muốn tạo sản phẩm, đây là dữ liệu". Nó không cần quan tâm API là gì, token lấy ở đâu, xử lý lỗi 500 thế nào.
    *   Redux Thunk lo việc gọi API, sau đó bắn ra các tín hiệu (`pending` -> hiện loading, `fulfilled` -> tắt loading, cập nhật list).

### E. Tag Input System (Logic mảng động)
*   **Logic**: Xử lý `sizes` và `colors` dưới dạng Mảng (`Array`).
*   **Kỹ thuật**:
    *   Dùng sự kiện `onKeyDown` kiểm tra phím `Enter`.
    *   Dùng `filter` để xóa item khỏi mảng: `newArr = arr.filter(item => item !== itemToDelete)`. Đây là cách chuẩn trong React để đảm bảo tính Bất Biến (Immutability) của state - không sửa trực tiếp mảng cũ mà tạo ra mảng mới đã bỏ phần tử đi.

---

## 3. Kiến Trúc Hệ Thống (Implementation Steps)

### Bước 1: Tạo Component [ProductFormModal](file:///d:/Projects/E_Commerce_MERN/frontend/src/admin/components/ProductFormModal.jsx#7-351)
*   Đây là "trái tim" của update lần này.
*   Chứa toàn bộ giao diện và logic form.
*   Nhận props: `product` (để biết là sửa hay thêm), `onClose` (để đóng popup).

### Bước 2: Tích hợp vào Trang Quản Lý ([ProductsManagement](file:///d:/Projects/E_Commerce_MERN/frontend/src/admin/pages/ProductsManagement.jsx#8-154))
*   Thay thế cái Modal "đang phát triển" bằng component thật.
*   Truyền state `selectedProduct` xuống modal.

### Bước 3: Kết nối Backend
*   Đảm bảo API endpoint `/api/v1/admin/products/create` trong [adminSlice.js](file:///d:/Projects/E_Commerce_MERN/frontend/src/admin/adminSLice/adminSlice.js) khớp với Backend Route.
*   Backend cần middleware `multer` (hoặc tương đương) để hứng `FormData` từ frontend gửi lên.

---

## 4. Kế Hoạch Kiểm Thử (Testing Plan)

1.  **Test Giao diện**: Mở Modal -> Các ô input thẳng hàng, đẹp, responsive trên mobile.
2.  **Test Nhập liệu**:
    *   Nhập Size "XL" -> Enter -> Thấy tag "XL" hiện ra.
    *   Nhập lại "XL" -> Phải báo lỗi hoặc không cho thêm (chống trùng lặp).
3.  **Test Upload ảnh**: Chọn 3 ảnh -> Thấy 3 ảnh nhỏ hiện ra preview.
4.  **Test Submit (Thêm mới)**:
    *   Điền đủ -> Lưu -> Thấy thông báo xanh "Thành công".
    *   Modal đóng lại -> Sản phẩm mới xuất hiện ngay cuối danh sách (hoặc đầu) mà không cần F5 (nhờ Redux state update).
5.  **Test Edit**:
    *   Chọn "Áo Thun A" -> Mở Modal -> Thấy đúng tên "Áo Thun A" và ảnh cũ.
    *   Sửa giá -> Lưu -> Danh sách bên ngoài cập nhật giá mới ngay.

--- 

*Bản kế hoạch này đảm bảo tính "Clean Code" (Dễ đọc, dễ sửa), "User Friendly" (Thân thiện người dùng) và "Scalable" (Dễ mở rộng sau này).*
