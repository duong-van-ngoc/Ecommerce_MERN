# BÁO CÁO ĐỒ ÁN TỐT NGHIỆP

## TRƯỜNG `[TÊN TRƯỜNG]`
## KHOA `[TÊN KHOA]`
## NGÀNH `[TÊN NGÀNH]`

---

# ĐỒ ÁN TỐT NGHIỆP

## ĐỀ TÀI:
## XÂY DỰNG WEBSITE THƯƠNG MẠI ĐIỆN TỬ THEO KIẾN TRÚC MERN

---

Sinh viên thực hiện: `[Họ và tên]`  
Mã số sinh viên: `[MSSV]`  
Lớp: `[Lớp]`  
Giảng viên hướng dẫn: `[Họ tên GVHD]`  

`[Địa điểm], [Tháng/Năm]`

<div style="page-break-after: always;"></div>

# NHẬN XÉT CỦA GIẢNG VIÊN HƯỚNG DẪN

`[Sinh viên chừa trống theo mẫu khoa]`

<div style="page-break-after: always;"></div>

# NHẬN XÉT CỦA GIẢNG VIÊN PHẢN BIỆN

`[Sinh viên chừa trống theo mẫu khoa]`

<div style="page-break-after: always;"></div>

# LỜI CẢM ƠN

Em xin chân thành cảm ơn Ban Giám hiệu, quý Thầy/Cô khoa `[Tên khoa]` trường `[Tên trường]` đã tạo điều kiện học tập và nghiên cứu trong suốt quá trình thực hiện đồ án tốt nghiệp.

Em xin bày tỏ lòng biết ơn sâu sắc đến giảng viên hướng dẫn `[Họ tên GVHD]` đã tận tình định hướng, góp ý chuyên môn và hỗ trợ em trong toàn bộ quá trình triển khai đề tài.

Em cũng xin cảm ơn gia đình, bạn bè đã động viên và hỗ trợ em hoàn thành đồ án.

Do kiến thức và thời gian còn hạn chế, báo cáo khó tránh khỏi thiếu sót. Em rất mong nhận được ý kiến đóng góp từ quý Thầy/Cô để hoàn thiện hơn trong thời gian tới.

<div style="page-break-after: always;"></div>

# LỜI MỞ ĐẦU

Trong bối cảnh chuyển đổi số diễn ra mạnh mẽ, thương mại điện tử đã trở thành kênh bán hàng quan trọng của doanh nghiệp. Người dùng hiện nay có xu hướng mua sắm trực tuyến ngày càng nhiều, yêu cầu hệ thống bán hàng phải đảm bảo tính tiện dụng, tốc độ xử lý, bảo mật dữ liệu và khả năng mở rộng.

Xuất phát từ nhu cầu thực tiễn đó, đề tài **"Xây dựng website thương mại điện tử theo kiến trúc MERN"** được lựa chọn nhằm phát triển một hệ thống bán hàng trực tuyến hoàn chỉnh, bao gồm cả phân hệ người dùng và phân hệ quản trị.

Mục tiêu của đề tài là áp dụng tổng hợp kiến thức về phát triển web full-stack: thiết kế giao diện frontend bằng React, xây dựng backend bằng Node.js/Express, tổ chức dữ liệu trên MongoDB, xây dựng RESTful API, xác thực người dùng bằng JWT và tích hợp dịch vụ ngoài như Cloudinary, SMTP Email.

Phạm vi đề tài tập trung vào các chức năng cốt lõi: quản lý tài khoản, quản lý sản phẩm, giỏ hàng, đặt hàng, theo dõi đơn hàng, quản trị sản phẩm/đơn hàng/người dùng/cài đặt hệ thống.

Báo cáo gồm 3 chương:

1. **Chương 1: Tổng quan đề tài** - nêu lý do chọn đề tài, mục tiêu, phạm vi và công nghệ sử dụng.
2. **Chương 2: Phân tích thiết kế hệ thống** - phân tích yêu cầu và thiết kế kiến trúc, cơ sở dữ liệu, API.
3. **Chương 3: Phát triển sản phẩm** - trình bày quá trình triển khai, kết quả đạt được, hạn chế và hướng phát triển.

<div style="page-break-after: always;"></div>

# MỤC LỤC

1. LỜI MỞ ĐẦU  
2. CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI  
3. CHƯƠNG 2: PHÂN TÍCH THIẾT KẾ HỆ THỐNG  
4. CHƯƠNG 3: PHÁT TRIỂN SẢN PHẨM  
5. KẾT LUẬN  
6. TÀI LIỆU THAM KHẢO  

`[Trong bản Word, dùng References -> Table of Contents để tạo mục lục tự động]`

<div style="page-break-after: always;"></div>

# DANH MỤC TỪ VIẾT TẮT

- **MERN**: MongoDB, Express.js, React.js, Node.js
- **API**: Application Programming Interface
- **JWT**: JSON Web Token
- **CRUD**: Create, Read, Update, Delete
- **UI/UX**: User Interface / User Experience
- **SMTP**: Simple Mail Transfer Protocol

<div style="page-break-after: always;"></div>

# CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI

## 1.1. Giới thiệu đề tài

Đề tài xây dựng một hệ thống thương mại điện tử trên nền web cho mô hình bán lẻ sản phẩm thời trang. Hệ thống cho phép khách hàng tìm kiếm sản phẩm, đặt hàng trực tuyến, đồng thời cung cấp công cụ quản trị cho quản trị viên để vận hành toàn bộ hoạt động bán hàng.

## 1.2. Lý do chọn đề tài

- Thương mại điện tử là xu hướng phát triển tất yếu trong thời đại số.
- Nhu cầu xây dựng hệ thống bán hàng online có tính thực tiễn cao trong doanh nghiệp.
- Đề tài giúp áp dụng tổng hợp kiến thức lập trình web full-stack và kỹ năng thiết kế hệ thống.

## 1.3. Mục tiêu đề tài

- Xây dựng website bán hàng trực tuyến với đầy đủ nghiệp vụ cơ bản.
- Thiết kế backend RESTful API, kết nối cơ sở dữ liệu MongoDB.
- Áp dụng cơ chế đăng nhập, xác thực, phân quyền user/admin.
- Hoàn thiện trang quản trị gồm dashboard và các module quản lý.

## 1.4. Đối tượng và phạm vi nghiên cứu

### 1.4.1. Đối tượng nghiên cứu

- Hệ thống website thương mại điện tử dạng B2C.
- Người dùng cuối và quản trị viên hệ thống.

### 1.4.2. Phạm vi thực hiện

- Quản lý tài khoản người dùng.
- Quản lý sản phẩm và đánh giá sản phẩm.
- Giỏ hàng, thông tin giao hàng, xác nhận đặt hàng.
- Quản trị sản phẩm, đơn hàng, người dùng, cấu hình hệ thống.

### 1.4.3. Giới hạn đề tài

- Thanh toán online mới ở mức mở rộng định hướng, hiện tại dùng COD là chính.
- Chưa triển khai kiểm thử tự động toàn diện và hạ tầng production.

## 1.5. Công nghệ sử dụng

### 1.5.1. Frontend

- React + Vite
- Redux Toolkit
- React Router DOM
- Axios
- React Toastify

### 1.5.2. Backend

- Node.js
- Express.js
- Mongoose
- JWT
- Bcryptjs

### 1.5.3. Cơ sở dữ liệu và dịch vụ

- MongoDB
- Cloudinary (quản lý ảnh)
- Nodemailer/SMTP (gửi email reset mật khẩu)

## 1.6. Ý nghĩa khoa học và thực tiễn

Đề tài có ý nghĩa thực tiễn cao vì mô phỏng đầy đủ quy trình vận hành của một hệ thống bán hàng online. Đồng thời, đề tài giúp sinh viên rèn luyện năng lực phân tích, thiết kế, triển khai và đánh giá một sản phẩm phần mềm hoàn chỉnh.

<div style="page-break-after: always;"></div>

# CHƯƠNG 2: PHÂN TÍCH THIẾT KẾ HỆ THỐNG

## 2.1. Phân tích yêu cầu hệ thống

## 2.1.1. Tác nhân hệ thống

- **Guest (khách vãng lai)**
- **User (người dùng đã đăng nhập)**
- **Admin (quản trị viên)**

## 2.1.2. Chức năng theo tác nhân

### a) Guest

- Xem danh sách sản phẩm.
- Xem chi tiết sản phẩm.
- Đăng ký, đăng nhập.

### b) User

- Cập nhật hồ sơ, đổi mật khẩu.
- Quên mật khẩu và đặt lại mật khẩu qua email.
- Thêm sản phẩm vào giỏ hàng, thay đổi số lượng.
- Nhập địa chỉ giao hàng.
- Xác nhận đặt hàng và xem đơn hàng cá nhân.

### c) Admin

- Xem thống kê dashboard (doanh thu, đơn hàng, người dùng, sản phẩm).
- Quản lý sản phẩm (thêm/sửa/xóa).
- Quản lý đơn hàng và trạng thái xử lý.
- Quản lý người dùng và phân quyền.
- Quản lý cài đặt hệ thống.

## 2.2. Yêu cầu phi chức năng

- **Bảo mật**: JWT, middleware xác thực và phân quyền.
- **Hiệu năng**: phân trang danh sách sản phẩm, tối ưu truy vấn cơ bản.
- **Khả năng mở rộng**: tách frontend/backend, dễ phát triển thêm module.
- **Tính khả dụng**: giao diện đáp ứng trên desktop và mobile.

## 2.3. Thiết kế kiến trúc hệ thống

Hệ thống được xây dựng theo mô hình client-server 3 lớp:

1. **Lớp giao diện (Presentation Layer)**: React + Redux.
2. **Lớp nghiệp vụ (Business Layer)**: Express Controllers + Middleware.
3. **Lớp dữ liệu (Data Layer)**: MongoDB + Mongoose Models.

Luồng xử lý:

`Frontend (React) -> API request (Axios) -> Express Router -> Middleware Auth -> Controller -> MongoDB/Cloudinary/SMTP -> JSON Response -> Redux Store -> UI`

## 2.4. Thiết kế cơ sở dữ liệu

## 2.4.1. Bảng/Collection User

Các trường chính:

- `name`, `email`, `password`
- `avatar { public_id, url }`
- `role` (`user` / `admin`)
- `resetPasswordToken`, `resetPasswordExpire`
- `createdAt`, `updatedAt`

## 2.4.2. Bảng/Collection Product

Các trường chính:

- `name`, `description`
- `price`, `originalPrice`
- `stock`, `sold`
- `category`, `brand`, `material`
- `sizes[]`, `colors[]`
- `images[]`
- `ratings`, `numOfReviews`, `reviews[]`
- `user`, `createdAt`

## 2.4.3. Bảng/Collection Order

Các trường chính:

- `shippingInfo { address, city, state, country, pinCode, phoneNo }`
- `orderItems[]`
- `paymentInfo { method, status, ... }`
- `orderStatus`
- `itemPrice`, `taxPrice`, `shippingPrice`, `totalPrice`
- `isPaid`, `paidAt`, `deliveredAt`
- `user`, `createdAt`

## 2.4.4. Bảng/Collection Settings

Các trường chính:

- `adminName`, `email`
- `companyName`, `address`
- `notifications { newOrders, lowStock, newUsers, newReviews }`
- `createdAt`, `updatedAt`

## 2.5. Thiết kế API

### 2.5.1. Nhóm API User

- `POST /api/v1/register`
- `POST /api/v1/login`
- `POST /api/v1/logout`
- `GET /api/v1/profile`
- `PUT /api/v1/profile/update`
- `PUT /api/v1/password/update`
- `POST /api/v1/password/forgot`
- `POST /api/v1/reset/:token`

### 2.5.2. Nhóm API Product

- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `GET /api/v1/admin/products`
- `POST /api/v1/admin/products/create`
- `PUT /api/v1/admin/products/:id`
- `DELETE /api/v1/admin/products/:id`
- `PUT /api/v1/review`

### 2.5.3. Nhóm API Order

- `POST /api/v1/order/new`
- `GET /api/v1/orders/user`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/order/:id`
- `PUT /api/v1/admin/order/:id`
- `DELETE /api/v1/admin/order/:id`

### 2.5.4. Nhóm API Admin Dashboard

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/orders/recent`

### 2.5.5. Nhóm API Settings

- `GET /api/v1/admin/settings`
- `PUT /api/v1/admin/settings`

## 2.6. Thiết kế bảo mật và xử lý lỗi

- Mật khẩu được mã hóa bằng `bcryptjs`.
- JWT token phát hành khi đăng nhập, lưu cookie `httpOnly`.
- Middleware `verifyUserAuth` kiểm tra đăng nhập.
- Middleware `roleBasedAccess` và `isAuthenticatedAdmin` kiểm tra quyền.
- Middleware lỗi tập trung chuẩn hóa phản hồi khi có exception.

<div style="page-break-after: always;"></div>

# CHƯƠNG 3: PHÁT TRIỂN SẢN PHẨM

## 3.1. Môi trường triển khai

- Hệ điều hành phát triển: Windows.
- Backend chạy Node.js + Express tại `http://localhost:8000`.
- Frontend chạy Vite tại `http://localhost:5173`.
- Frontend proxy `/api` về backend qua `vite.config.js`.
- CSDL sử dụng MongoDB local.

## 3.2. Cấu trúc mã nguồn

- `backend/`: app server, routes, controllers, models, middleware, utils.
- `frontend/`: pages, components, redux slices, admin modules.

## 3.3. Các chức năng đã phát triển

## 3.3.1. Phân hệ người dùng

- Đăng ký tài khoản có avatar.
- Đăng nhập/đăng xuất.
- Quên mật khẩu và reset mật khẩu qua email.
- Cập nhật hồ sơ, cập nhật mật khẩu.

## 3.3.2. Phân hệ sản phẩm

- Hiển thị danh sách sản phẩm.
- Tìm kiếm theo từ khóa, lọc theo danh mục.
- Xem chi tiết sản phẩm, chọn màu/size, thêm vào giỏ hàng.
- Đánh giá sản phẩm.

## 3.3.3. Phân hệ giỏ hàng và đặt hàng

- Quản lý giỏ hàng bằng Redux + localStorage.
- Lưu thông tin giao hàng.
- Xác nhận đơn hàng.
- Đặt hàng phương thức COD.
- Xem danh sách đơn hàng cá nhân.

## 3.3.4. Phân hệ quản trị

- Dashboard thống kê tổng quan.
- Quản lý sản phẩm (CRUD + upload ảnh).
- Quản lý đơn hàng (xem, cập nhật trạng thái, xóa).
- Quản lý người dùng (xem, đổi role, xóa).
- Cài đặt thông tin hệ thống.

## 3.4. Kiểm thử chức năng

- Kiểm thử luồng đăng ký/đăng nhập: đạt.
- Kiểm thử phân quyền user/admin: đạt.
- Kiểm thử CRUD sản phẩm phía admin: đạt.
- Kiểm thử tạo đơn hàng COD và cập nhật trạng thái: đạt.
- Kiểm thử gửi email reset mật khẩu: đạt khi SMTP cấu hình đúng.

## 3.5. Kết quả đạt được

- Hoàn thiện hệ thống thương mại điện tử có thể vận hành ở mức đồ án.
- Đảm bảo được các nghiệp vụ chính của khách hàng và quản trị viên.
- Tổ chức dự án theo mô hình rõ ràng, thuận tiện bảo trì và mở rộng.

## 3.6. Hạn chế

- Một số bộ lọc nâng cao mới ở mức frontend, chưa đồng bộ đầy đủ backend.
- Thanh toán online chưa hoàn thiện end-to-end.
- Chưa có hệ thống test tự động và quy trình CI/CD.

## 3.7. Hướng phát triển

- Tích hợp hoàn chỉnh cổng thanh toán MoMo/VNPay.
- Hoàn thiện bộ lọc nâng cao (giá, rating, tồn kho, sort).
- Bổ sung unit test, integration test.
- Triển khai production với Docker và giám sát log.

<div style="page-break-after: always;"></div>

# KẾT LUẬN

Đồ án đã xây dựng thành công một hệ thống website thương mại điện tử theo kiến trúc MERN, đáp ứng các chức năng cốt lõi bao gồm quản lý người dùng, quản lý sản phẩm, đặt hàng, theo dõi đơn hàng và quản trị hệ thống. Kiến trúc phân lớp rõ ràng giúp hệ thống dễ bảo trì và mở rộng.

Trong quá trình thực hiện, sinh viên đã vận dụng được nhiều kiến thức quan trọng của phát triển phần mềm full-stack như thiết kế API, quản trị dữ liệu MongoDB, xác thực JWT, phân quyền truy cập và tích hợp dịch vụ ngoài.

Mặc dù vẫn còn một số hạn chế, kết quả đề tài đã đạt mục tiêu đề ra và có tiềm năng mở rộng thành hệ thống ứng dụng thực tế trong tương lai.

<div style="page-break-after: always;"></div>

# TÀI LIỆU THAM KHẢO

1. React Documentation. https://react.dev/  
2. Redux Toolkit Documentation. https://redux-toolkit.js.org/  
3. React Router Documentation. https://reactrouter.com/  
4. Vite Documentation. https://vite.dev/  
5. Node.js Documentation. https://nodejs.org/en/docs  
6. Express.js Documentation. https://expressjs.com/  
7. MongoDB Documentation. https://www.mongodb.com/docs/  
8. Mongoose Documentation. https://mongoosejs.com/docs/  
9. JSON Web Token (RFC 7519). https://www.rfc-editor.org/rfc/rfc7519  
10. Cloudinary Documentation. https://cloudinary.com/documentation  
11. Nodemailer Documentation. https://nodemailer.com/  
12. Tài liệu mã nguồn dự án `E_Commerce_MERN`.

<div style="page-break-after: always;"></div>

# PHỤ LỤC A: HƯỚNG DẪN ĐỊNH DẠNG NỘP WORD

- Khổ giấy: **A4**
- Căn lề đề xuất: Trên 2.5 cm, Dưới 2.5 cm, Trái 3.5 cm, Phải 2.0 cm
- Font: **Times New Roman**
- Cỡ chữ nội dung: **13**
- Giãn dòng: **1.5 lines**
- Căn đều 2 lề (Justify)
- Đánh số trang: bắt đầu từ phần Lời mở đầu
- Đánh số chương/mục theo dạng: `1`, `1.1`, `1.1.1`

`[Khi nộp bản chính thức, thay toàn bộ nội dung trong ngoặc vuông [] bằng thông tin thật.]`
