# Báo cáo Chi tiết Biểu đồ Use Case cho từng Chức năng

Tài liệu này cung cấp các sơ đồ Use Case phân rã chi tiết cho từng mô-đun chức năng trong dự án E-Commerce MERN, dựa trên việc phân tích mã nguồn thực tế (Backend Routes & Frontend Components).

---

## 1. Nhóm chức năng: Xác thực & Người dùng (Authentication & User)
Mô-đun này xử lý quyền truy cập và thông tin cá nhân.

```mermaid
flowchart LR
    Guest((Khách vãng lai))
    Customer((Khách hàng))
    
    subgraph AuthUser [Xác thực & Tài khoản]
        direction TB
        Register([Đăng ký tài khoản])
        Login([Đăng nhập])
        Logout([Đăng xuất])
        Reset([Quên/Đặt lại mật khẩu])
        Profile([Quản lý hồ sơ])
        Address([Quản lý địa chỉ giao hàng])
    end

    Guest --> Register
    Guest --> Login
    Guest --> Reset
    
    Customer --> Logout
    Customer --> Profile
    Customer --> Address
    
    Address ..-> |<< include >>| Profile
```

---

## 2. Nhóm chức năng: Mua sắm & Sản phẩm (Product & Shopping)
Phân rã các hành động tương tác với danh mục hàng hóa.

```mermaid
flowchart LR
    User((Người dùng))
    
    subgraph Shopping [Mua sắm & Tìm kiếm]
        direction TB
        Search([Tìm kiếm sản phẩm])
        FilterPrice([Lọc theo giá])
        FilterCat([Lọc theo danh mục])
        Sort([Sắp xếp: Mới nhất, Giá tăng/giảm])
        ViewDetail([Xem chi tiết sản phẩm])
        ViewReviews([Xem đánh giá])
    end

    User --> Search
    User --> FilterPrice
    User --> FilterCat
    User --> Sort
    User --> ViewDetail
    ViewDetail ..-> |<< extend >>| ViewReviews
```

---

## 3. Nhóm chức năng: Giỏ hàng & Thanh toán (Cart & Checkout)
Quy trình nghiệp vụ quan trọng nhất đối với khách hàng.

```mermaid
flowchart LR
    Customer((Khách hàng))
    
    subgraph CartCheckout [Giỏ hàng & Thanh toán]
        direction TB
        AddToCart([Thêm vào giỏ hàng])
        EditCart([Cập nhật số lượng])
        RemoveItem([Xóa sản phẩm khỏi giỏ])
        Checkout([Tiến hành đặt hàng])
        ApplyCoupon([Nhập mã giảm giá])
        SelectAddress([Chọn địa chỉ nhận hàng])
        Pay([Thanh toán: COD / Online])
    end

    Customer --> AddToCart
    Customer --> EditCart
    Customer --> RemoveItem
    Customer --> Checkout
    
    Checkout ..-> |<< include >>| SelectAddress
    Checkout ..-> |<< include >>| Pay
    Checkout ..-> |<< extend >>| ApplyCoupon
```

---

## 4. Nhóm chức năng: Quản trị Sản phẩm & Kho (Admin Product & Stock)
Dành cho Quản trị viên quản lý hàng hóa và dữ liệu Excel.

```mermaid
flowchart LR
    Admin((Quản trị viên))
    
    subgraph AdminProduct [Quản trị Sản phẩm & Kho]
        direction TB
        ManageProd([CRUD Sản phẩm])
        ImportExcel([Import Sản phẩm từ Excel])
        ManageImage([Quản lý hình ảnh])
        UpdateStock([Cập nhật tồn kho])
        AlertStock([Nhận cảnh báo hết hàng])
        ManageCat([Quản lý danh mục])
    end

    Admin --> ManageProd
    Admin --> ImportExcel
    Admin --> ManageCat
    Admin --> UpdateStock
    
    ManageProd ..-> |<< include >>| ManageImage
    UpdateStock ..-> |<< extend >>| AlertStock
```

---

## 5. Nhóm chức năng: Quản trị Đơn hàng & Người dùng (Admin Orders & Users)
Dành cho Quản trị viên điều hành hệ thống.

```mermaid
flowchart LR
    Admin((Quản trị viên))
    
    subgraph AdminSystem [Điều hành Hệ thống]
        direction TB
        ViewOrders([Xem danh sách đơn hàng])
        UpdateOrderStatus([Xác nhận/Cập nhật trạng thái đơn])
        Refund([Xử lý hoàn tiền/Hủy đơn])
        ViewUsers([Xem danh sách người dùng])
        BlockUser([Khóa/Mở khóa tài khoản])
        Dashboard([Xem thống kê & Báo cáo])
    end

    Admin --> ViewOrders
    Admin --> ViewUsers
    Admin --> Dashboard
    
    ViewOrders ..-> |<< extend >>| UpdateOrderStatus
    ViewOrders ..-> |<< extend >>| Refund
    ViewUsers ..-> |<< extend >>| BlockUser
```

---

## 6. Nhóm chức năng: Đánh giá & Phản hồi (Reviews & Feedback)
Tương tác giữa khách hàng và sản phẩm.

```mermaid
flowchart LR
    Customer((Khách hàng))
    Admin((Quản trị viên))

    subgraph Feedback [Đánh giá sản phẩm]
        direction TB
        WriteReview([Viết đánh giá & Chấm sao])
        EditReview([Sửa đánh giá cũ])
        ReplyReview([Admin phản hồi đánh giá])
    end

    Customer --> WriteReview
    Customer --> EditReview
    Admin --> ReplyReview
```

---

## Kết luận
Bộ sơ đồ Use Case trên đã bao phủ toàn bộ các chức năng từ Client (Khách hàng) đến Admin (Quản trị) dựa trên cấu trúc thực tế của dự án E_Commerce_MERN. Tài liệu sử dụng Mermaid JS giúp sếp dễ dàng nhúng vào báo cáo hoặc trình bày trực quan.
