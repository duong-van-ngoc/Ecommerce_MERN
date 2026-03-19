# Báo cáo Biểu đồ Use Case - PlantUML (Bản đặc tả thực tế dự án)

Tài liệu này chứa mã nguồn **PlantUML** được tinh chỉnh để bám sát **100% logic nghiệp vụ** thực tế trong mã nguồn dự án E_Commerce_MERN của sếp.

---

### 1. Phân rã: Import Sản phẩm từ Excel (Dựa trên `ImportProductModal.jsx`)
Mô tả chính xác quy trình sếp đã xử lý trong code.

```puml
@startuml
actor "Quản trị viên" as Admin
rectangle "Quy trình Import Sản phẩm v2.0" {
  usecase "Mở Modal Import" as Open
  usecase "Tải template mẫu (.xlsx)" as Download
  usecase "Chọn file Excel/CSV" as Select
  usecase "Tìm Header tự động ("name", "tên"...) " as FindHeader
  usecase "Validate trường bắt buộc (level1, price...)" as Validate
  usecase "Hiển thị Preview (50 dòng đầu)" as Preview
  usecase "Báo lỗi Validation (Error list)" as Error
  usecase "Click Import (Gửi API Bulk POST)" as BulkAPI
  usecase "Refresh danh sách (onImportSuccess)" as Refresh
}

Admin --> Open
Admin --> Download
Admin --> Select

Select ..> FindHeader : <<include>>
FindHeader ..> Validate : <<include>>
Validate ..> Preview : <<include>>
Validate <.. Error : <<extend>> (Nếu dữ liệu sai)

Admin --> BulkAPI
BulkAPI ..> Refresh : <<include>> (Sau khi thành công)
@enduml
```

---

### 2. Phân rã: Quản lý Kho (Dựa trên `StockManagement.jsx`)
Thể hiện rõ 2 luồng: Thủ công & Excel.

```puml
@startuml
actor "Quản trị viên" as Admin
rectangle "Quản lý Tồn kho" {
  usecase "Tìm kiếm sản phẩm (Search Bar)" as Search
  usecase "Cập nhật kho thủ công (Quick Update)" as Manual
  usecase "Import tồn kho từ Excel" as ImportExcel
  usecase "Xem báo cáo Report Import" as Report
  usecase "Cảnh báo Stock < 10 (Low Stock Badge)" as Alert
}

Admin --> Search
Search ..> Manual : <<include>>
Admin --> ImportExcel
ImportExcel ..> Report : <<include>>
Search <.. Alert : <<extend>>
@enduml
```

---

### 3. Phân rã: Thanh toán COD (Dựa trên `Payment.jsx`)
Mô tả quy trình checkout thực tế trong project.

```puml
@startuml
actor "Khách hàng" as Customer
rectangle "Quy trình Thanh toán COD" {
  usecase "Xác nhận Giỏ hàng" as Confirm
  usecase "Tính toán chi phí (Ship 30k, VAT 10%)" as Calc
  usecase "Chọn phương thức COD" as COD
  usecase "Tạo đơn hàng (/api/v1/order/new)" as CreateAPI
  usecase "Dọn dẹp Giỏ hàng (Clear LocalStorage)" as Clear
  usecase "Chuyển hướng trang Thành công" as Success
}

Customer --> Confirm
Confirm ..> Calc : <<include>>
Confirm ..> COD : <<include>>
COD ..> CreateAPI : <<include>>
CreateAPI ..> Clear : <<include>>
CreateAPI ..> Success : <<include>>
@enduml
```

---

### 4. Phân rã: Tìm kiếm & Lọc (Dựa trên `Products.jsx` & `features`)
```puml
@startuml
actor "Khách hàng" as User
rectangle "Mua sắm & Tìm kiếm" {
  usecase "Tìm theo từ khóa" as Search
  usecase "Lọc theo Danh mục (3 cấp độ)" as FilterCat
  usecase "Lọc theo giá (Price Range)" as FilterPrice
  usecase "Sắp xếp (Mới nhất, Giá tăng/giảm)" as Sort
  usecase "Xem chi tiết sản phẩm" as Detail
}

User --> Search
User --> FilterCat
User --> FilterPrice
User --> Sort
User --> Detail
@enduml
```

---

### 5. Phân rã: Quản lý Người dùng (Admin Side)
```puml
@startuml
actor "Quản trị viên" as Admin
rectangle "Quản lý Hội viên" {
  usecase "Xem danh sách User" as ListView
  usecase "Khóa/Mở khóa tài khoản" as ToggleLock
  usecase "Xem lịch sử đơn hàng của User" as UserHistory
  usecase "Thay đổi quyền (Role: Admin/User)" as ChangeRole
}

Admin --> ListView
ListView <.. ToggleLock : <<extend>>
ListView <.. UserHistory : <<extend>>
ListView <.. ChangeRole : <<extend>>
@enduml
```

---

### 6. Phân rã: Sản phẩm (CRUD Admin)
```puml
@startuml
actor "Quản trị viên" as Admin
rectangle "Quản lý Sản phẩm Admin" {
  usecase "Thêm sản phẩm mới" as Create
  usecase "Sửa thông tin sản phẩm" as Edit
  usecase "Xóa sản phẩm" as Delete
  usecase "Upload ảnh (Cloudinary/Local)" as Upload
  usecase "Báo cáo Validation form" as FormVal
}

Admin --> Create
Admin --> Edit
Admin --> Delete
Create ..> Upload : <<include>>
Create ..> FormVal : <<include>>
Edit ..> Upload : <<include>>
@enduml
```

---

### 7. Phân rã: Địa chỉ giao hàng (User Profile)
```puml
@startuml
actor "Khách hàng" as Customer
rectangle "Địa chỉ cá nhân" {
  usecase "Xem list địa chỉ" as List
  usecase "Thêm địa chỉ mới" as Add
  usecase "Sửa địa chỉ" as Edit
  usecase "Đặt làm địa chỉ mặc định" as SetDefault
}

Customer --> List
List <.. Add : <<extend>>
List <.. Edit : <<extend>>
Edit ..> SetDefault : <<extend>>
@enduml
```

---

### 8. Phân rã: Đánh giá & Phản hồi
```puml
@startuml
actor "Khách hàng" as User
actor "Admin" as Admin
rectangle "Feedback System" {
  usecase "Viết đánh giá" as Review
  usecase "Chấm điểm sao" as Star
  usecase "Admin Reply" as Reply
  usecase "Check điều kiện đã mua hàng" as CheckBought
}

User --> Review
Review ..> Star : <<include>>
Review ..> CheckBought : <<include>>
Admin --> Reply
@enduml
```

---

### 🏆 Tổng kết hướng dẫn
Đây là bộ mã nguồn PlantUML bám sát thực tế nhất. Sếp chỉ cần:
1. Truy cập [plantuml.com](http://www.plantuml.com).
2. Copy mã `@startuml ... @enduml`.
3. Nhận kết quả biểu đồ chính xác với những gì sếp đã lập trình.
