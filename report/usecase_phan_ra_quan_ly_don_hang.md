# Phân rã sơ đồ Use Case: Quản lý Đơn hàng (Admin)

Sơ đồ này chi tiết hóa các hành động của Admin khi điều phối đơn hàng và cập nhật tình trạng kinh doanh.

## Hình 2.10: Sơ đồ Use Case Phân rã Quản lý Đơn hàng

### 1. Sơ đồ PlantUML
```puml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam roundCorner 10
skinparam Shadowing true

actor "Quản trị viên (Admin)" as Admin
actor "Hệ thống DB" as System

rectangle "Phân rã Use Case: Quản lý Đơn hàng" {
  usecase "Xác thực quyền Admin" as Auth
  
  ' Các hành động chính
  usecase "Xem danh sách & Tìm kiếm" as ViewOrders
  usecase "Xem chi tiết đơn hàng" as ViewDetail
  usecase "Cập nhật trạng thái đơn hàng" as UpdateStatus
  usecase "Xử lý Hủy đơn / Hoàn tiền" as Refund
  usecase "Xóa đơn hàng" as DeleteOrder
  
  ' Phân rã cho Cập nhật trạng thái
  usecase "Chọn trạng thái tiếp theo\n(Đang giao / Đã giao...)" as SelectStatus
  usecase "Kiểm tra tính hợp lệ luồng giao" as CheckFlow
  usecase "Lưu trạng thái mới vào DB" as SaveStatus
  
  ' Logic hệ thống tự động
  usecase "Tự động trừ tồn kho (Stock)" as DeductStock
  usecase "Tự động Lưu ngày giao (DeliveredAt)" as SetDate
  usecase "Cập nhật doanh thu hệ thống" as UpdateRev
}

Admin --> ViewOrders
Admin --> UpdateStatus
Admin --> Refund
Admin --> DeleteOrder

' Ràng buộc quyền
ViewOrders ..> Auth : <<include>>
UpdateStatus ..> Auth : <<include>>
Refund ..> Auth : <<include>>
DeleteOrder ..> Auth : <<include>>

' Chi tiết quy trình Cập nhật trạng thái (UpdateStatus)
UpdateStatus ..> SelectStatus : <<include>>
UpdateStatus ..> CheckFlow : <<include>>
UpdateStatus ..> SaveStatus : <<include>>

' Logic hệ thống kéo theo
SaveStatus ..> DeductStock : <<include>> (Nếu chuyển sang Đang giao)
SaveStatus ..> SetDate : <<include>> (Nếu chuyển sang Đã giao)
SaveStatus ..> UpdateRev : <<include>> (Nếu hoàn thành)

' Tương tác Actor/Hệ thống
ViewOrders ..> ViewDetail : <<include>>
DeductStock --> System
SaveStatus --> System
@enduml
```

### 2. Mô tả các bước nghiệp vụ

| Hành động | Chi tiết xử lý |
| :--- | :--- |
| **Xem & Tìm kiếm** | Admin sử dụng ID hoặc bộ lọc trạng thái để tìm đơn hàng cần xử lý. |
| **Cập nhật trạng thái** | Admin chọn trạng thái -> Hệ thống kiểm tra điều kiện (vd: Không thể hủy đơn đã giao) -> Lưu vào MongoDB. |
| **Trừ tồn kho** | Khi chuyển sang "Đang giao", hệ thống tự động trừ `Stock` của từng sản phẩm trong đơn hàng. |
| **Cập nhật Tài chính** | Khi chuyển sang "Đã giao", hệ thống ghi nhận `deliveredAt` và cộng giá trị đơn vào tổng doanh thu Admin. |
| **Hoàn tiền / Hủy** | Nếu đơn bị hủy, hệ thống xử lý hoàn tiền qua Stripe/Paypal (nếu có) và khôi phục lại tồn kho. |

### 3. Các ràng buộc dữ liệu
- **Không được xóa đơn hàng Đang giao**: Để tránh mất dấu vết vận chuyển.
- **Doanh thu**: Chỉ những đơn hàng đã Giao thành công mới được cộng vào báo cáo thống kê.
