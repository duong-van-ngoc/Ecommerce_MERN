# Phân rã sơ đồ Use Case: Quản lý Sản phẩm (Admin)

Sơ đồ này mô tả các hoạt động của Quản trị viên trong việc vận hành kho hàng, từ thêm mới đến quản lý tệp tin đa phương tiện và dữ liệu Excel.

## Hình 2.9: Sơ đồ Use Case Phân rã Quản lý Sản phẩm

### 1. Sơ đồ PlantUML
```puml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam roundCorner 10
skinparam Shadowing true

actor "Quản trị viên (Admin)" as Admin
actor "Cloudinary API" as Cloud
actor "Hệ thống DB" as System

rectangle "Phân rã Use Case: Quản lý Sản phẩm" {
  usecase "Xác thực quyền Admin" as Auth
  
  ' Các hành động chính
  usecase "Xem danh sách sản phẩm" as View
  usecase "Thêm sản phẩm mới" as Create
  usecase "Cập nhật sản phẩm" as Edit
  usecase "Xóa sản phẩm" as Delete
  usecase "Import sản phẩm từ Excel" as ImportExcel
  
  ' Phân rã chi tiết cho Thêm/Sửa
  usecase "Tải thông tin cũ lên Form" as LoadData
  usecase "Nhập/Sửa thông tin (Tên, Giá, Kho...)" as InputInfo
  usecase "Quản lý Hình ảnh (Upload/Destroy)" as MediaManage
  
  ' Logic hệ thống
  usecase "Lưu thông tin MongoDB" as SaveDB
  usecase "Cập nhật số lượng tồn kho" as UpdateStock
}

Admin --> View
Admin --> Create
Admin --> Edit
Admin --> Delete
Admin --> ImportExcel

' Ràng buộc quyền
View ..> Auth : <<include>>
Create ..> Auth : <<include>>
Edit ..> Auth : <<include>>
Delete ..> Auth : <<include>>
ImportExcel ..> Auth : <<include>>

' Luồng chi tiết cho Cập nhật (Edit)
Edit ..> LoadData : <<include>>
Edit ..> InputInfo : <<include>>
Edit ..> MediaManage : <<include>>
Edit ..> SaveDB : <<include>>

' Luồng chi tiết cho Thêm mới (Create)
Create ..> InputInfo : <<include>>
Create ..> MediaManage : <<include>>
Create ..> SaveDB : <<include>>

' Xử lý Media/DB
MediaManage --> Cloud
SaveDB --> System
ImportExcel ..> UpdateStock : <<include>>
UpdateStock --> System
@enduml
```

### 2. Đặc tả các bước thực hiện

| Hành động | Chi tiết xử lý |
| :--- | :--- |
| **Thêm Sản phẩm** | Admin nhập thông tin -> Tải ảnh lên Cloudinary -> Lưu dữ liệu vào MongoDB. |
| **Cập nhật Sản phẩm** | Hệ thống **tải thông tin cũ** vào Form -> Admin chỉnh sửa các trường -> Hệ thống xử lý ảnh (giữ ảnh cũ, xóa ảnh cũ hoặc thêm ảnh mới) -> Lưu thay đổi vào MongoDB. |
| **Xóa Sản phẩm** | Xóa bản ghi trong MongoDB -> Hệ thống tự động dọn dẹp toàn bộ hình ảnh liên quan trên Cloudinary. |
| **Import Excel** | Hệ thống đọc tệp `.xlsx` -> Kiểm tra định dạng -> Map dữ liệu và **Cập nhật số lượng tồn kho** hàng loạt. |

### 3. Quy trình xử lý lỗi
- **Sai định dạng Excel**: Hệ thống báo lỗi "Header không hợp lệ" hoặc "Dữ liệu dòng X bị thiếu".
- **Lỗi Cloudinary**: Nếu upload ảnh lỗi, hệ thống sẽ rollback và báo lỗi cho Admin.
