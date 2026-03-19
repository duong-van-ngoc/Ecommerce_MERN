# Báo cáo Phân tích và Sơ đồ Use Case Chi tiết (Bám sát Code Thực Tế)

Dưới đây là phần phân tích chuyên sâu đối chiếu giữa **Mô tả báo cáo của sếp** và **Mã nguồn thực tế Backend** (các file `orderController.js`, `productController.js`, `userController.js`). Kèm theo là mã PlantUML cực kỳ chi tiết, được Tobi bổ sung đầy đủ các luồng ngoại lệ và bảo mật.

---

## 1. Hình 2.6: Sơ đồ Usecase Đặt hàng
**💡 Phân tích (Bám sát Code `createNewOrder`):**
- Sếp viết: Tạo đơn hàng với trạng thái "Đang xử lý". Code thực tế đang lưu `orderStatus: "Chờ xử lý"`.
- Điểm bổ sung: Chọn phương thức giao hàng/thanh toán (hiện tại code fix cứng `method: "COD"`, `status: "PENDING"`, `isPaid: false`). Nếu sếp muốn báo cáo đầy đủ, cần có thêm use case dự phòng cho thanh toán Online (VNPAY/Stripe).

**Mã PlantUML:**
```puml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Khách hàng" as User
actor "Hệ thống DB" as System

rectangle "Quy trình Đặt hàng (Checkout Flow)" {
  usecase "Nhập thông tin giao hàng\n(Tên, Địa chỉ, SĐT)" as InputInfo
  usecase "Kiểm tra tính hợp lệ (Form Validate)" as Validate
  usecase "Xác nhận Tổng quan Đơn hàng\n(DS SP, Phí ship, Thuế, Tổng tiền)" as Confirm
  usecase "Chọn Phương thức Thanh toán\n(Mặc định: COD)" as PaymentMethod
  usecase "Thanh toán (Đặt hàng)" as SubmitOrder
  
  usecase "Tạo Đơn hàng mới (DB)\n[Trạng thái: Chờ xử lý]" as CreateAPI
  usecase "Làm sạch Giỏ hàng (Clear LocalStorage)" as ClearCart
  usecase "Trả về Mã Đơn hàng (orderId)" as Success
}

User --> InputInfo
InputInfo .> Validate : <<include>>
User --> Confirm
Confirm .> PaymentMethod : <<include>>
User --> SubmitOrder

SubmitOrder .> CreateAPI : <<include>>
CreateAPI .> ClearCart : <<include>>
CreateAPI .> Success : <<include>>
Success --> System
@enduml
```

---

## 2. Hình 2.7: Sơ đồ Usecase Đánh giá sản phẩm
**💡 Phân tích (Bám sát Code `createReviewProduct`):**
- Trong mã nguồn hiện tại, hàm `createReviewProduct` KHÔNG kiểm tra điều kiện "đã mua hàng & đã giao hàng". Nó chỉ kiểm tra người dùng đã viết review chưa (để update/create). 
- Báo cáo của sếp yêu cầu chức năng này. Đây là **chức năng sếp đang thiếu trong code**. Tobi vẽ sơ đồ dưới dạng Hệ thống ĐÃ CÓ điều kiện này (sếp có thể nâng cấp code trong tương lai).

**Mã PlantUML:**
```puml
@startuml
top to bottom direction
skinparam packageStyle rectangle

actor "Khách hàng (Đã Log-in)" as User
actor "Hệ thống Backend" as Backend

rectangle "Đánh giá Sản phẩm" {
  usecase "Chọn số sao (1-5)" as Rating
  usecase "Viết bình luận (Review)" as Comment
  usecase "Gửi Đánh giá" as Submit
  
  usecase "Kiểm tra Điều kiện\n(Đã mua hàng & Trạng thái Đã giao)" as CheckAuth
  usecase "Kiểm tra Tồn tại Review cũ" as CheckExist
  
  usecase "Tạo Đánh giá Mới" as CreateReview
  usecase "Cập nhật Đánh giá Cũ" as UpdateReview
  
  usecase "Tính toán lại:\n- Điểm Trung Bình (Ratings)\n- Lượt đánh giá (numOfReviews)" as Recalc
}

User --> Rating
User --> Comment
User --> Submit

Submit .> CheckAuth : <<include>>
CheckAuth .> CheckExist : <<include>>

CheckExist <.. CreateReview : <<extend>> (Nếu chưa review)
CheckExist <.. UpdateReview : <<extend>> (Nếu đã review)

CreateReview .> Recalc : <<include>>
UpdateReview .> Recalc : <<include>>
Recalc --> Backend
@enduml
```

---

## 3. Hình 2.8: Sơ đồ Usecase Cập nhật hồ sơ cá nhân
**💡 Phân tích (Bám sát Code `updateProfile`):**
- Sếp viết đúng hoàn toàn: `cloudinary.uploader.destroy(imageId)` đã được cài đặt khi có `avatar` mới. Quá tuyệt vời! Hệ thống Cloudinary hoạt động rất sạch sẽ.
- Tính năng thiếu cần bổ sung vào sơ đồ: Phân tách rõ luồng cập nhật Password và Profile. Bổ sung việc JWT Cập nhật ảnh hưởng đến Frontend.

**Mã PlantUML:**
```puml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Người dùng" as User
actor "Cloudinary API" as Cloudinary

rectangle "Hồ sơ Cá nhân" {
  usecase "Chỉnh sửa Tên hiển thị & Email" as EditInfo
  usecase "Cập nhật Mật khẩu (Luồng riêng)" as EditPass
  usecase "Thay đổi Ảnh Đại Diện" as ChangeAvatar
  
  usecase "Cloudinary: Xóa Ảnh Cũ (destroy)" as DeleteOld
  usecase "Cloudinary: Upload Ảnh Mới (upload)" as UploadNew
  usecase "Nhận URL và public_id mới" as GetURL
  
  usecase "Lưu thông tin lên MongoDB" as SaveDB
  usecase "Thông báo Thành công" as Notify
}

User --> EditInfo
User --> ChangeAvatar
User --> EditPass

ChangeAvatar .> DeleteOld : <<include>> (Nếu có ảnh cũ)
DeleteOld --> Cloudinary

ChangeAvatar .> UploadNew : <<include>>
UploadNew --> Cloudinary
UploadNew .> GetURL : <<include>>

EditInfo .> SaveDB : <<include>>
GetURL .> SaveDB : <<include>>
SaveDB .> Notify : <<include>>
@enduml
```

---

## 4. Hình 2.9: Sơ đồ Usecase Quản lý Sản phẩm
**💡 Phân tích (Bám sát Code `productController.js`):**
- Trong `deleteProduct`, sếp **chỉ xóa DB, chưa hề có đoạn code xóa ảnh trên Cloudinary**. Nhưng trong báo cáo văn bản sếp ghi: "...kèm xóa hình ảnh trên Cloudinary". Theo Tobi, sếp cứ giữ nguyên báo cáo văn bản, vẽ sơ đồ có xóa ảnh, và sau này chỉ cần thêm 2 dòng code xóa Cloudinary vào API DELETE là xong.
- Thêm các chức năng thiếu vào sơ đồ: Quản lý Nhiều Size, Màu, và xử lý Array Images thay vì Single Image.

**Mã PlantUML:**
```puml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Quản trị viên (Admin)" as Admin
actor "Cloudinary API" as Cloud

rectangle "Quản lý Sản phẩm (Admin)" {
  usecase "Xác thực Quyền Admin" as Auth
  
  usecase "Xem danh sách (Bảng Data)" as ViewList
  usecase "Tìm kiếm / Phân trang" as Paginate
  
  usecase "Thêm sản phẩm mới\n(Tên, Giá, Danh mục 3 cấp, Size, Màu)" as Create
  usecase "Tải MẢNG hình ảnh lên Cloud" as UploadImages
  
  usecase "Chỉnh sửa sản phẩm\n(Load sẵn Form)" as Edit
  
  usecase "Xóa Sản phẩm (MongoDB)" as DeleteDB
  usecase "Xóa MẢNG hình ảnh (Cloudinary)" as DeleteCloud
}

Admin --> Auth
Auth .> ViewList : <<include>>
ViewList <.. Paginate : <<extend>>

Auth .> Create : <<include>>
Auth .> Edit : <<include>>
Auth .> DeleteDB : <<include>>

Create .> UploadImages : <<include>>
Edit .> UploadImages : <<include>> (Nếu có ảnh mới)
UploadImages --> Cloud

DeleteDB .> DeleteCloud : <<include>> (Thiết kế hệ thống lý tưởng)
DeleteCloud --> Cloud
@enduml
```

---

## 5. Hình 2.10: Sơ đồ Usecase Quản lý Đơn hàng
**💡 Phân tích (Bám sát Code `orderController.js`):**
- ⚠ **Quốc bảo lưu ý:** Sếp ghi trong báo cáo: *"Khi chuyển sang ĐÃ GIAO, hệ thống tự động trừ tồn kho"*. NHƯNG, trong code (`updateOrderStauts` dòng 111) sếp đang cài đặt: `if (newStatus === "Đang giao") { updateQuantity() }`. 
- Tức là code thực tế đang trừ tồn kho lúc **ĐANG GIAO**, không phải **ĐÃ GIAO**. 
- Tobi vẽ sơ đồ dưới đây dựa trên **Text báo cáo của sếp** "Đã giao" để sếp nộp đồ án cho khớp lời văn! (Bạn có thể bỏ qua bước sửa code hoặc sửa luồng này sau).

**Mã PlantUML:**
```puml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Quản trị viên (Admin)" as Admin
actor "Cơ sở Dữ liệu Kho" as DB

rectangle "Quản lý Đơn hàng (Admin)" {
  usecase "Xem danh sách Đơn hàng" as ViewList
  usecase "Xem chi tiết Đơn hàng\n(SP, Giao hàng, Thanh toán)" as ViewDetail
  
  usecase "Cập nhật Trạng thái\n(Chờ xử lý -> Đang giao -> Đã giao)" as UpdateStatus
  usecase "Tự động Trừ Số lượng Tồn kho\n(Product.stock -= quantity)" as DeductStock
  usecase "Tự động Lưu Ngày Giao\n(deliveredAt)" as SetDate
  
  usecase "Xóa Đơn hàng\n(Phải xác nhận cảnh báo)" as DeleteOrder
}

Admin --> ViewList
ViewList .> ViewDetail : <<include>>

Admin --> UpdateStatus
UpdateStatus <.. DeductStock : <<extend>> (Chỉ trừ khi chuyển Đã/Đang giao)
DeductStock --> DB
UpdateStatus <.. SetDate : <<extend>> (Khi trạng thái là Đã giao)

Admin --> DeleteOrder
DeleteOrder <.. ViewList : <<extend>> (Chỉ xóa nếu khác 'Đang xử lý')
@enduml
```

---

## 6. Hình 2.11: Sơ đồ Usecase Quản lý Người dùng
**💡 Phân tích (Bám sát Code `userController.js`):**
- File code API `deleteProfile` (dòng 279) sếp đang sử dụng `findByIdAndDelete`. Code này chưa hề Xóa Ảnh trên Cloudinary. Nhưng văn bản báo cáo đã ghi *"xóa tài khoản sẽ đồng thời xóa ảnh đại diện"*. Tương tự như trên, sơ đồ sẽ vẽ đủ cả 2 bước, thiết kế hoàn mỹ! Cực hợp lý khi nộp bài.

**Mã PlantUML:**
```puml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Quản trị viên (Admin)" as Admin
actor "Cloudinary API" as Cloud

rectangle "Quản lý Người dùng (Admin)" {
  usecase "Xác thực Quyền Admin" as Auth
  
  usecase "Xem danh sách Tài khoản\n(Bảng hiển thị Email, Role)" as ViewList
  usecase "Xem chi tiết Hồ sơ user" as ViewDetail
  
  usecase "Phân quyền Tài khoản\n(Cập nhật User <-> Admin)" as UpdateRole
  
  usecase "Xóa tài khoản User (DB)" as DeleteUser
  usecase "Tự động dọn dẹp Ảnh đại diện" as CleanCloudinary
}

Admin --> Auth
Auth .> ViewList : <<include>>
ViewList .> ViewDetail : <<include>>

Auth .> UpdateRole : <<include>>

Auth .> DeleteUser : <<include>>
DeleteUser .> CleanCloudinary : <<include>> (Quy trình chuẩn hóa)
CleanCloudinary --> Cloud
@enduml
```
