# Báo cáo Phân rã Use Case Chi tiết từng Chức năng (Granular Decomposition)

Tài liệu này cung cấp cái nhìn sâu nhất vào từng quy trình nghiệp vụ đơn lẻ của hệ thống. Mỗi chức năng được bóc tách thành các Use Case con, thể hiện rõ các mối quan hệ `include` (bắt buộc) và `extend` (mở rộng/tùy chọn).

---

### 1. Phân rã: Xác thực tài khoản (Authentication)
Mô tả chi tiết quy trình đăng ký, đăng nhập và bảo mật.

```mermaid
flowchart LR
    Guest((Khách vãng lai))
    
    subgraph Auth [Quy trình Xác thực]
        direction TB
        Login([Đăng nhập])
        Register([Đăng ký])
        Validate([Kiểm tra dữ liệu nhập])
        Verify([Xác thực JWT / Session])
        Error([Hiển thị lỗi xác thực])
        Remember([Ghi nhớ đăng nhập])
    end

    Guest --> Login
    Guest --> Register

    Login ..-> |<< include >>| Validate
    Login ..-> |<< include >>| Verify
    Register ..-> |<< include >>| Validate
    
    Verify ..-> |<< extend >>| Error
    Login ..-> |<< extend >>| Remember
```

---

### 2. Phân rã: Quản lý Địa chỉ Giao hàng (Address Management)
Chi tiết cách người dùng quản lý thông tin nhận hàng.

```mermaid
flowchart LR
    Customer((Khách hàng))
    
    subgraph Address [Quản lý địa chỉ]
        direction TB
        ViewAdd([Xem danh sách địa chỉ])
        CreateAdd([Thêm địa chỉ mới])
        UpdateAdd([Sửa thông tin địa chỉ])
        DeleteAdd([Xóa địa chỉ])
        SetDefault([Đặt làm địa chỉ mặc định])
    end

    Customer --> ViewAdd
    ViewAdd ..-> |<< extend >>| CreateAdd
    ViewAdd ..-> |<< extend >>| UpdateAdd
    ViewAdd ..-> |<< extend >>| DeleteAdd
    UpdateAdd ..-> |<< extend >>| SetDefault
```

---

### 3. Phân rã: Tìm kiếm & Bộ lọc (Search & Filter)
Chi tiết hành vi tìm kiếm của khách hàng.

```mermaid
flowchart LR
    User((Người dùng))
    
    subgraph SearchFilter [Tìm kiếm & Lọc]
        direction TB
        Input([Nhập từ khóa tìm kiếm])
        Suggest([Gợi ý từ khóa])
        Filter([Áp dụng bộ lọc])
        FilterPrice([Lọc theo giá])
        FilterCat([Lọc theo danh mục])
        Clear([Xóa bộ lọc])
    end

    User --> Input
    Input ..-> |<< extend >>| Suggest
    User --> Filter
    Filter ..-> |<< include >>| FilterPrice
    Filter ..-> |<< include >>| FilterCat
    Filter ..-> |<< extend >>| Clear
```

---

### 4. Phân rã: Xem chi tiết & Đánh giá (Product Detail & Reviews)
Tương tác sâu với nội dung sản phẩm.

```mermaid
flowchart LR
    Customer((Khách hàng))
    
    subgraph DetailReview [Chi tiết & Đánh giá]
        direction TB
        ViewInfo([Xem thông tin sản phẩm])
        ViewGallery([Xem thư viện ảnh])
        PostReview([Đăng đánh giá/bình luận])
        Rating([Chấm điểm sao])
        CheckOrder([Kiểm tra điều kiện: Đã mua hàng])
    end

    Customer --> ViewInfo
    ViewInfo ..-> |<< include >>| ViewGallery
    Customer --> PostReview
    PostReview ..-> |<< include >>| Rating
    PostReview ..-> |<< include >>| CheckOrder
```

---

### 5. Phân rã: Quản lý Giỏ hàng (Cart Operations)
Các thao tác cập nhật giỏ hàng.

```mermaid
flowchart LR
    Customer((Khách hàng))
    
    subgraph CartOp [Thao tác Giỏ hàng]
        direction TB
        Add([Thêm sản phẩm vào giỏ])
        IncDec([Tăng/Giảm số lượng])
        Remove([Xóa khỏi giỏ])
        Sync([Đồng bộ với Server/Local])
        CheckStock([Kiểm tra tồn kho])
    end

    Customer --> Add
    Customer --> IncDec
    Customer --> Remove
    
    Add ..-> |<< include >>| CheckStock
    IncDec ..-> |<< include >>| CheckStock
    Add ..-> |<< include >>| Sync
```

---

### 6. Phân rã: Quy trình Đặt hàng (Checkout Flow)
Quy trình từ giỏ hàng đến khi hoàn tất đơn.

```mermaid
flowchart LR
    Customer((Khách hàng))
    
    subgraph Checkout [Quy trình thanh toán]
        direction TB
        ConfirmCart([Xác nhận lại giỏ hàng])
        ChooseAddress([Chọn địa chỉ nhận hàng])
        ApplyCoupon([Áp dụng mã giảm giá])
        SelectPay([Chọn phương thức thanh toán])
        Finish([Hoàn tất đặt hàng])
        Email([Gửi email xác nhận])
    end

    Customer --> ConfirmCart
    ConfirmCart ..-> |<< include >>| ChooseAddress
    ChooseAddress ..-> |<< include >>| SelectPay
    SelectPay ..-> |<< include >>| Finish
    SelectPay ..-> |<< extend >>| ApplyCoupon
    Finish ..-> |<< include >>| Email
```

---

### 7. Phân rã: Quản trị Sản phẩm - CRUD (Admin Product)
Quy trình quản lý danh mục hàng hóa của Admin.

```mermaid
flowchart LR
    Admin((Quản trị viên))
    
    subgraph CRUDProduct [Quản lý Sản phẩm Admin]
        direction TB
        Create([Tạo sản phẩm mới])
        Upload([Upload ảnh lên Cloud/Server])
        Update([Sửa sản phẩm])
        Delete([Xóa sản phẩm])
        ToggleHide([Ẩn/Hiện sản phẩm])
    end

    Admin --> Create
    Admin --> Update
    Admin --> Delete
    Create ..-> |<< include >>| Upload
    Update ..-> |<< include >>| Upload
    Delete ..-> |<< extend >>| ToggleHide
```

---

### 8. Phân rã: Import từ Excel (Excel Import Process)
Quy trình xử lý dữ liệu hàng loạt.

```mermaid
flowchart LR
    Admin((Quản trị viên))
    
    subgraph ExcelImport [Quy trình Import Excel]
        direction TB
        SelectFile([Chọn file Excel])
        Read([Đọc & Parse dữ liệu])
        MapCat([Áp danh mục tự động])
        BulkSave([Lưu hàng loạt vào DB])
        ErrorReport([Hiển thị báo cáo lỗi])
    end

    Admin --> SelectFile
    SelectFile ..-> |<< include >>| Read
    Read ..-> |<< include >>| MapCat
    MapCat ..-> |<< include >>| BulkSave
    BulkSave ..-> |<< extend >>| ErrorReport
```

---

### 9. Phân rã: Quản lý Kho hàng (Stock Management)
Kiểm soát tồn kho sản phẩm.

```mermaid
flowchart LR
    Admin((Quản trị viên))
    
    subgraph Stock [Quản lý tồn kho]
        direction TB
        ViewStock([Xem mức tồn kho hiện tại])
        ManualAdj([Điều chỉnh kho thủ công])
        AutoAdj([Tự động trừ kho khi có đơn])
        Alert([Cảnh báo hàng sắp hết])
    end

    Admin --> ViewStock
    Admin --> ManualAdj
    ViewStock ..-> |<< extend >>| Alert
    AutoAdj ..-> |<< include >>| Alert
```

---

### 10. Phân rã: Quản lý Người dùng (User Management)
Admin kiểm soát tài khoản người dùng hệ thống.

```mermaid
flowchart LR
    Admin((Quản trị viên))
    
    subgraph UserMgmt [Quản lý người dùng]
        direction TB
        List([Xem danh sách User])
        Detail([Xem lịch sử mua hàng của User])
        Block([Khóa tài khoản])
        Unblock([Mở khóa tài khoản])
        ChangeRole([Thay đổi quyền: Admin/User])
    end

    Admin --> List
    List ..-> |<< extend >>| Detail
    List ..-> |<< extend >>| Block
    List ..-> |<< extend >>| ChangeRole
    Block -- ngược lại --> Unblock
```

---

### 11. Phân rã: Xử lý Đơn hàng Admin (Order Processing)
Quy trình vận hành đơn hàng.

```mermaid
flowchart LR
    Admin((Quản trị viên))
    
    subgraph AdminOrder [Điều phối Đơn hàng]
        direction TB
        ViewNew([Xem đơn hàng mới])
        Confirm([Xác nhận đơn hàng])
        Shipping([Chuyển trạng thái Đang giao])
        Success([Hoàn thành đơn hàng])
        Cancel([Hủy đơn & Hoàn tiền])
        Print([In hóa đơn])
    end

    Admin --> ViewNew
    ViewNew ..-> |<< include >>| Confirm
    Confirm ..-> |<< include >>| Shipping
    Shipping ..-> |<< include >>| Success
    ViewNew ..-> |<< extend >>| Cancel
    Confirm ..-> |<< extend >>| Print
```

---

### 12. Phân rã: Quản lý Mã giảm giá (Coupon Management)
(Bổ sung thêm để báo cáo đầy đủ hơn).

```mermaid
flowchart LR
    Admin((Quản trị viên))
    
    subgraph Coupon [Quản lý Coupon]
        direction TB
        GenCoupon([Tạo mã giảm giá])
        SetLimit([Thiết lập hạn dùng/số lượng])
        SetMinOrder([Thiết lập điều kiện đơn tối thiểu])
        Deactivate([Vô hiệu hóa mã])
    end

    Admin --> GenCoupon
    GenCoupon ..-> |<< include >>| SetLimit
    GenCoupon ..-> |<< include >>| SetMinOrder
    Admin --> Deactivate
```

---

## Tổng kết
Báo cáo này đã thực hiện phân rã sâu nhất có thể cho từng tính năng đơn lẻ của dự án E_Commerce_MERN. Mỗi sơ đồ tập trung vào một quy trình hẹp, giúp nhà phát triển và người đọc báo cáo hiểu rõ từng bước logic và sự liên kết giữa các Use Case con.
