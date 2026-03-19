# Phân rã sơ đồ Use Case: Quản lý Người dùng (Admin)

Sơ đồ này mô tả chi tiết các quyền hạn của Quản trị viên trong việc giám sát và điều chỉnh tài khoản người dùng trên hệ thống.

## Hình 2.11: Sơ đồ Use Case Phân rã Quản lý Người dùng

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

rectangle "Phân rã Use Case: Quản lý Người dùng" {
  usecase "Xác thực quyền Admin" as Auth
  
  ' Các hành động chính
  usecase "Xem danh sách & Tìm kiếm" as ViewUsers
  usecase "Xem chi tiết hồ sơ" as ViewDetail
  usecase "Cập nhật quyền hạn (Role)" as UpdateRole
  usecase "Xóa tài khoản người dùng" as DeleteUser
  
  ' Phân rã cho Xem chi tiết
  usecase "Tải thông tin (JSON Export)" as DownloadInfo
  
  ' Phân rã cho Cập nhật quyền
  usecase "Tải dữ liệu hiện tại" as LoadUserInfo
  usecase "Chọn quyền mới (User/Admin)" as SelectRole
  usecase "Cập nhật bản ghi MongoDB" as SaveRole
  
  ' Phân rã cho Xóa tài khoản
  usecase "Yêu cầu xác nhận xóa" as ConfirmDelete
  usecase "Dọn dẹp Avatar từ Cloudinary" as CleanMedia
  usecase "Xóa vĩnh viễn trong DB" as PermanentDelete
}

Admin --> ViewUsers
Admin --> UpdateRole
Admin --> DeleteUser

' Ràng buộc quyền
ViewUsers ..> Auth : <<include>>
UpdateRole ..> Auth : <<include>>
DeleteUser ..> Auth : <<include>>

' Chi tiết quy trình Xem chi tiết (ViewDetail)
ViewUsers ..> ViewDetail : <<include>>
ViewDetail ..> DownloadInfo : <<extend>>

' Chi tiết quy trình Cập nhật quyền (UpdateRole)
UpdateRole ..> LoadUserInfo : <<include>>
UpdateRole ..> SelectRole : <<include>>
UpdateRole ..> SaveRole : <<include>>

' Chi tiết quy trình Xóa tài khoản (DeleteUser)
DeleteUser ..> ConfirmDelete : <<include>>
DeleteUser ..> CleanMedia : <<include>> (Để giải phóng bộ nhớ)
DeleteUser ..> PermanentDelete : <<include>>
CleanMedia --> Cloud
PermanentDelete --> System
SaveRole --> System
@enduml
```

### 2. Mô tả các bước nghiệp vụ

| Hành động | Chi tiết xử lý |
| :--- | :--- |
| **Xem & Tìm kiếm** | Admin truy cập Dashbard -> Hệ thống gọi API liệt kê danh sách kèm bộ lọc theo tên/email. |
| **Xem chi tiết & Tải về** | Admin mở Modal chi tiết -> Hệ thống hiển thị Avatar (Cloudinary), Role, ID. Admin nhấn "Tải thông tin" -> Trình duyệt đóng gói JSON và cho phép tải xuống file. |
| **Cập nhật quyền (Role)** | Hệ thống **tải thông tin hiện tại** -> Admin chọn quyền mới -> Lưu vào MongoDB -> Hiệu lực ngay lập tức khi User load lại trang. |
| **Xóa tài khoản** | Admin xác nhận xóa -> Hệ thống thực hiện "Quy trình xóa sạch": Xóa bản ghi DB + **Gọi Cloudinary API xóa ảnh đại diện**. |

### 3. Các đặc điểm bảo mật
- **Admin không thể tự xóa chính mình**: Để tránh mất quyền quản trị cao nhất của hệ thống.
- **Xác thực JWT**: Mọi hành động Quản trị đều được kiểm tra Token và `role: "admin"` tại Middleware.
