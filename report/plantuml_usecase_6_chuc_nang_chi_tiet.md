# Báo cáo Biểu đồ Use Case - Đặc tả 6 chức năng Cốt lõi (Dự án E-Commerce MERN)

Tài liệu này bao gồm **mã nguồn PlantUML** cho 6 nhóm chức năng sếp yêu cầu (Hình 2.6 - Hình 2.11). Tobi đã **bổ sung thêm các tác vụ ẩn (system actions)** như xác thực, cập nhật tự động và xử lý ảnh (Cloudinary) để sơ đồ phản ánh chính xác nhất với thực tế kĩ thuật của dự án.

---

### Hình 2.6: Sơ đồ Use Case Đặt hàng (Checkout Flow)
**Phân tích bổ sung**: Thêm bước "Tính toán giỏ hàng" (tính phí ship, giảm giá) trước khi xác nhận.

```puml
@startuml
skinparam packageStyle rectangle
actor "Người dùng" as User
actor "Hệ thống DB" as System

rectangle "Quy trình Đặt hàng" {
  usecase "Nhập thông tin giao hàng\n(Tên, Đại chỉ, SĐT)" as InputInfo
  usecase "Kiểm tra tính hợp lệ form" as Validate
  usecase "Xác nhận đơn hàng\n(DS SP, Phí ship, Tổng tiền)" as Confirm
  usecase "Thanh toán thành công" as Payment
  usecase "Tạo đơn hàng mới (MongoDB)\n[Trạng thái: Đang xử lý]" as CreateOrder
  usecase "Xóa dữ liệu Giỏ hàng" as ClearCart
  usecase "Thông báo thành công kèm Mã Đơn" as Notify
}

User --> InputInfo
InputInfo ..> Validate : <<include>>
User --> Confirm
Confirm ..> Payment : <<include>>
Payment ..> CreateOrder : <<include>>
CreateOrder ..> ClearCart : <<include>>
CreateOrder ..> Notify : <<include>>

CreateOrder --> System
@enduml
```

---

### Hình 2.7: Sơ đồ Use Case Đánh giá sản phẩm (Review System)
**Phân tích bổ sung**: Thêm điều kiện kiểm tra xem người dùng đã thực sự mua món hàng này và trạng thái "Đã giao" hay chưa.

```puml
@startuml
skinparam packageStyle rectangle
actor "Người dùng (Đã đăng nhập)" as User
actor "Hệ thống Backend" as Backend

rectangle "Quy trình Đánh giá Sản phẩm" {
  usecase "Chọn số sao (1-5) & Nhập bình luận" as InputReview
  usecase "Gửi đánh giá" as Submit
  usecase "Kiểm tra quyền đánh giá\n(Đã mua hàng & Đã giao)" as CheckAuth
  usecase "Kiểm tra lịch sử đánh giá" as CheckHistory
  usecase "Tạo đánh giá mới" as Create
  usecase "Cập nhật đánh giá cũ" as Update
  usecase "Tính lại Điểm TB (Average Rating)\n& Tổng lượt (numOfReviews)" as CalcRating
}

User --> InputReview
User --> Submit
Submit ..> CheckAuth : <<include>>
Submit ..> CheckHistory : <<include>>

CheckHistory <.. Create : <<extend>> (Nếu chưa đánh giá)
CheckHistory <.. Update : <<extend>> (Nếu đã đánh giá)

Create ..> CalcRating : <<include>>
Update ..> CalcRating : <<include>>

CalcRating --> Backend
@enduml
```

---

### Hình 2.8: Sơ đồ Use Case Cập nhật hồ sơ cá nhân (User Profile)
**Phân tích bổ sung**: Để tránh lãng phí dung lượng, việc xóa ảnh cũ trên Cloudinary trước khi gán URL ảnh mới là bước cực kỳ quan trọng trong MERN stack. Cập nhật session/cookie cũng được thêm vào.

```puml
@startuml
skinparam packageStyle rectangle
actor "Người dùng" as User
actor "Cloudinary API" as Cloudinary

rectangle "Cập nhật Hồ sơ Cá nhân" {
  usecase "Thay đổi thông tin\n(Tên hiển thị, Email, Ảnh đại diện)" as EditProfile
  usecase "Kiểm tra có Ảnh đại diện mới" as CheckAvatar
  usecase "Xóa ảnh cũ trên Cloudinary" as DestroyImage
  usecase "Tải ảnh mới nhận URL" as UploadImage
  usecase "Gửi API lưu MongoDB" as SaveDB
  usecase "Phản hồi & Cập nhật UI" as Response
}

User --> EditProfile
EditProfile ..> CheckAvatar : <<include>>

CheckAvatar <.. DestroyImage : <<extend>> (Nếu có ảnh mới)
DestroyImage ..> UploadImage : <<include>>
UploadImage --> Cloudinary
DestroyImage --> Cloudinary

EditProfile ..> SaveDB : <<include>>
UploadImage ..> SaveDB : <<include>>
SaveDB ..> Response : <<include>>
@enduml
```

---

### Hình 2.9: Sơ đồ Use Case Quản lý Sản phẩm (Admin Product)
**Phân tích bổ sung**: Cả thao tác Tạo mới và Cập nhật đều phụ thuộc vào logic xử lý ảnh Cloudinary. Thêm chức năng tìm kiếm, phân trang để xem danh sách trực quan. Toàn bộ qua middleware admin bảo vệ.

```puml
@startuml
skinparam packageStyle rectangle
actor "Quản trị viên" as Admin
actor "Cloudinary API" as Cloudinary

rectangle "Quản lý Sản phẩm" {
  usecase "Xác thực Quyền Admin\n(isAdmin Middleware)" as Auth
  
  usecase "Xem danh sách dạng bảng\n(Mã, Tên, Giá, Tồn kho)" as ViewList
  usecase "Tìm kiếm & Phân trang" as Search
  
  usecase "Thêm sản phẩm mới" as Create
  usecase "Upload hình ảnh mới" as Upload
  
  usecase "Chỉnh sửa sản phẩm\n(Fill sẵn Form data)" as Edit
  
  usecase "Xóa sản phẩm" as Delete
  usecase "Xóa hình ảnh trên Cloud" as DeleteImage
}

Admin --> Auth
Auth ..> ViewList : <<include>>
ViewList <.. Search : <<extend>>

Auth ..> Create : <<include>>
Create ..> Upload : <<include>>
Upload --> Cloudinary

Auth ..> Edit : <<include>>
Edit ..> Upload : <<include>>

Auth ..> Delete : <<include>>
Delete ..> DeleteImage : <<include>>
DeleteImage --> Cloudinary
@enduml
```

---

### Hình 2.10: Sơ đồ Use Case Quản lý Đơn hàng (Admin Order)
**Phân tích bổ sung**: Nhấn mạnh hệ quả tự động của việc trừ tồn kho khi chuyển trạng thái "Đã giao" (Một phần cực kì hay dễ gặp lỗi nếu dev xử lý sai trong code).

```puml
@startuml
skinparam packageStyle rectangle
actor "Quản trị viên" as Admin
actor "Hệ thống Kho" as DB

rectangle "Quản lý Đơn hàng" {
  usecase "Xem bảng danh sách đơn hàng\n(Mã, Khách, Tổng tiền, Trạng thái)" as ViewList
  usecase "Xem chi tiết đơn hàng\n(Sản phẩm, Giao hàng, Thanh toán)" as ViewDetail
  usecase "Cập nhật Trạng thái\n(Đang xử lý -> Đang giao -> Đã giao)" as UpdateStatus
  usecase "Tự động Trừ Số lượng tồn kho\n(Stock deduction)" as DeductStock
  usecase "Xác nhận Xóa đơn hàng" as Delete
}

Admin --> ViewList
ViewList ..> ViewDetail : <<include>>
ViewDetail <.. UpdateStatus : <<extend>>
UpdateStatus ..> DeductStock : <<include>> (Khi trạng thái = 'Đã giao')

DeductStock --> DB
ViewList <.. Delete : <<extend>>
@enduml
```

---

### Hình 2.11: Sơ đồ Use Case Quản lý Người dùng (Admin User)
**Phân tích bổ sung**: Thêm bước hiển thị xác thực middleware và hệ quả xóa luôn cả avatar (nếu có) khi xóa Account - tránh tạo "file rác" trên Cloudinary.

```puml
@startuml
skinparam packageStyle rectangle
actor "Quản trị viên" as Admin
actor "Cloudinary API" as Cloudinary

rectangle "Quản lý Người dùng" {
  usecase "Xác thực Quyền Admin\n(isAdmin Middleware)" as Auth
  usecase "Xem bảng danh sách tài khoản\n(Tên, Email, Vai trò, Hành động)" as ViewList
  usecase "Tìm kiếm tài khoản" as Search
  usecase "Xem chi tiết tài khoản" as ViewDetail
  usecase "Cập nhật Vai trò\n(User <-> Admin)" as UpdateRole
  usecase "Xóa tài khoản" as DeleteAccount
  usecase "Xóa Ảnh đại diện liên kết" as DeleteAvatar
}

Admin --> Auth
Auth ..> ViewList : <<include>>
ViewList <.. Search : <<extend>>
ViewList ..> ViewDetail : <<include>>

ViewDetail <.. UpdateRole : <<extend>>
ViewDetail <.. DeleteAccount : <<extend>>

DeleteAccount ..> DeleteAvatar : <<include>>
DeleteAvatar --> Cloudinary
@enduml
```

---
**Hướng dẫn sử dụng:**
Sếp hãy copy từng khối `@startuml` ... `@enduml` bên trên vào công cụ [plantuml.com](http://www.plantuml.com) để kết xuất (render) thành hình ảnh PNG chất lượng cao cho báo cáo nhé! Các sơ đồ này đã bổ sung đầy đủ các logic kỹ thuật "thực chiến" nhất.
