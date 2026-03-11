# 📋 PLAN: Import Sản Phẩm Excel/CSV & Quản Lý Nhập Hàng

> **Ngày**: 10/03/2026 | **Agent**: Antigravity  
> **Status**: 🟡 Planning

---

## 1. Tổng Quan Yêu Cầu

### Tính năng A — Import sản phẩm từ Excel/CSV
Admin có thể **upload file Excel (.xlsx) hoặc CSV** để thêm hàng loạt sản phẩm mới vào hệ thống, thay vì phải nhập từng sản phẩm qua form.

### Tính năng B — Quản lý nhập hàng (Stock Management)
Admin có thể **cập nhật số lượng tồn kho** cho sản phẩm đã tồn tại qua:
- Import file Excel/CSV chứa danh sách `tên sản phẩm + số lượng nhập thêm`
- Tìm kiếm sản phẩm theo tên để cập nhật số lượng nhanh

---

## 2. Kiến trúc & Luồng hoạt động

### 2.1 Import Sản Phẩm (Tính năng A)

```
Admin chọn file Excel/CSV
       │
       ▼
Frontend: đọc file bằng SheetJS (xlsx)
       │ Parse tab "Products" → array of objects
       ▼
Hiển thị PREVIEW TABLE
       │ Admin xem trước dữ liệu, sửa nếu cần
       │ Nhấn "Xác nhận Import"
       ▼
Frontend gửi POST /api/v1/admin/products/import
       │ Body: { products: [ { name, price, stock, category, ... } ] }
       ▼
Backend: productController.importProducts()
       │ Validate từng sản phẩm
       │ Product.insertMany(validProducts)
       ▼
Response: { success: true, imported: 50, failed: 2, errors: [...] }
       │
       ▼
Frontend hiển thị kết quả:
  "✅ 50 sản phẩm đã import | ❌ 2 lỗi"
```

### 2.2 Nhập Hàng / Cập Nhật Tồn Kho (Tính năng B)

```
┌─────────────────────────────────────────────────┐
│  TAB "Nhập Hàng" trên trang Quản lý Sản phẩm   │
│                                                  │
│  ┌─── Cách 1: Import File ─────────────────┐    │
│  │ Upload Excel/CSV:                        │    │
│  │  | Tên SP        | Số lượng nhập |       │    │
│  │  | Áo khoác gió  | +100          |       │    │
│  │  | Quần jean     | +50           |       │    │
│  │                                          │    │
│  │ Backend: tìm SP theo tên → stock += qty  │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌─── Cách 2: Cập nhật thủ công ───────────┐    │
│  │ 🔍 Tìm kiếm: [  áo khoác  ] [Tìm]      │    │
│  │                                          │    │
│  │  | Tên SP       | Tồn kho | Nhập thêm | │    │
│  │  | Áo khoác gió | 50      | [    ]  ✅ | │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 2.3 Luồng API chi tiết

```
┌───────────────────────────────────────────────────────────────┐
│                         FRONTEND                              │
│                                                               │
│  ProductsManagement.jsx                                       │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  [Tab: Danh sách SP] [Tab: Import SP] [Tab: Nhập hàng]│    │
│  └──────────────────────────────────────────────────────┘     │
│                                                               │
│  Tab "Import SP":                                             │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ 1. User chọn file .xlsx/.csv                         │     │
│  │ 2. SheetJS parse → previewData[]                     │     │
│  │ 3. Hiển thị bảng preview + validate                  │     │
│  │ 4. Click "Import" → dispatch(importProducts(data))   │     │
│  └───────────────────────┬──────────────────────────────┘     │
│                          │                                    │
│  adminSlice.js           ▼                                    │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ importProducts thunk:                                │     │
│  │   POST /api/v1/admin/products/import                 │     │
│  │   Body: { products: [...] }                          │     │
│  │                                                      │     │
│  │ importStock thunk:                                   │     │
│  │   PUT /api/v1/admin/products/import-stock            │     │
│  │   Body: { items: [{ name, quantity }] }              │     │
│  │                                                      │     │
│  │ updateStock thunk:                                   │     │
│  │   PUT /api/v1/admin/products/:id/stock               │     │
│  │   Body: { quantity: 100 }                            │     │
│  │                                                      │     │
│  │ searchProducts thunk:                                │     │
│  │   GET /api/v1/admin/products/search?name=áo          │     │
│  └───────────────────────┬──────────────────────────────┘     │
└──────────────────────────┼────────────────────────────────────┘
                           │ HTTP
                           ▼
┌───────────────────────────────────────────────────────────────┐
│                         BACKEND                               │
│                                                               │
│  productRoutes.js (NEW routes):                               │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ POST   /admin/products/import        → importProducts│     │
│  │ PUT    /admin/products/import-stock   → importStock   │     │
│  │ PUT    /admin/products/:id/stock      → updateStock   │     │
│  │ GET    /admin/products/search         → searchProducts│     │
│  └───────────────────────┬──────────────────────────────┘     │
│                          │                                    │
│  productController.js    ▼                                    │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ importProducts:                                      │     │
│  │   - Validate fields (name, price, stock required)    │     │
│  │   - req.body.user = req.user.id (admin ID)           │     │
│  │   - Product.insertMany(validProducts)                │     │
│  │   - Return { imported, failed, errors }              │     │
│  │                                                      │     │
│  │ importStock:                                         │     │
│  │   - Loop items: tìm SP theo name (regex)             │     │
│  │   - product.stock += quantity                        │     │
│  │   - product.save()                                   │     │
│  │   - Return { updated, notFound }                     │     │
│  │                                                      │     │
│  │ updateStock:                                         │     │
│  │   - Product.findById(id)                             │     │
│  │   - product.stock += quantity                        │     │
│  │   - product.save()                                   │     │
│  │                                                      │     │
│  │ searchProducts:                                      │     │
│  │   - Product.find({ name: { $regex, $options: "i" }}) │     │
│  │   - Return matching products                         │     │
│  └──────────────────────────────────────────────────────┘     │
│                          │                                    │
│                          ▼                                    │
│  MongoDB: products collection                                 │
│  { name, price, stock, category, ... }                        │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Dependencies cần cài đặt

| Package | Mục đích | Cài ở |
|:---|:---|:---|
| `xlsx` (SheetJS) | Parse Excel/CSV phía client | Frontend |

> **Backend KHÔNG cần thêm dependency** — file parse ở frontend, backend chỉ nhận JSON array.

---

## 4. Các file cần tạo/sửa

### 4.1 Backend (4 files)

| # | File | Hành động | Mô tả |
|:---|:---|:---|:---|
| 1 | `backend/controllers/productController.js` | MODIFY | Thêm 4 controller functions |
| 2 | `backend/routes/productRoutes.js` | MODIFY | Thêm 4 routes mới |

### 4.2 Frontend (6 files)

| # | File | Hành động | Mô tả |
|:---|:---|:---|:---|
| 3 | `frontend/src/admin/adminSLice/adminSlice.js` | MODIFY | Thêm 4 async thunks + extraReducers |
| 4 | `frontend/src/admin/pages/ProductsManagement.jsx` | MODIFY | Thêm tab system + nút Import |
| 5 | `frontend/src/admin/components/ImportProductModal.jsx` | NEW | Modal import SP từ Excel/CSV |
| 6 | `frontend/src/admin/components/StockManagement.jsx` | NEW | Tab quản lý nhập hàng |
| 7 | `frontend/src/admin/styles/ImportProductModal.css` | NEW | CSS cho modal import |
| 8 | `frontend/src/admin/styles/StockManagement.css` | NEW | CSS cho tab nhập hàng |

---

## 5. Chi tiết thiết kế

### 5.1 Template Excel/CSV mẫu

Cột bắt buộc cho **Import Sản phẩm**:

| name* | description* | price* | stock* | category* | brand | material | sizes | colors | originalPrice |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| Áo khoác gió | Áo khoác chống nước | 350000 | 100 | Áo | Nike | Polyester | S,M,L,XL | Đen,Trắng | 500000 |

Cột bắt buộc cho **Nhập hàng**:

| name* | quantity* |
|:---|:---|
| Áo khoác gió | 50 |
| Quần jean | 100 |

### 5.2 Validation Rules

**Import sản phẩm**:
- `name`: bắt buộc, max 100 ký tự
- `description`: bắt buộc
- `price`: bắt buộc, number > 0
- `stock`: bắt buộc, number ≥ 0
- `category`: bắt buộc
- `sizes`, `colors`: parse từ string "S,M,L" → array ["S","M","L"]

**Nhập hàng**:
- `name`: bắt buộc, dùng regex tìm kiếm
- `quantity`: bắt buộc, number > 0

### 5.3 UI Design

**ProductsManagement.jsx** — Tab system:
```
┌────────────────┬──────────────────┬─────────────────┐
│ 📦 Danh sách   │ 📥 Import SP     │ 📊 Nhập hàng   │
│    (active)     │                  │                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  TAB CONTENT hiển thị ở đây                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**ImportProductModal** — Upload + Preview + Confirm:
```
┌─────────────────────────────────────────────────┐
│  📥 Import Sản Phẩm Từ Excel/CSV               │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │  📎 Kéo thả file hoặc Click để chọn     │    │
│  │     Hỗ trợ: .xlsx, .csv                │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  📋 Preview (50 sản phẩm):                      │
│  ┌─────────────────────────────────────────┐    │
│  │ ✅ | Áo khoác | 350000 | Áo     | 100  │    │
│  │ ❌ | Quần     | (trống) | Quần   | 50   │    │
│  │ ✅ | Giày Nike| 1200000| Giày   | 30   │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  📊 Tổng: 50 hợp lệ | 2 lỗi                    │
│                                                  │
│  [📥 Tải template mẫu]  [❌ Hủy]  [✅ Import]   │
└─────────────────────────────────────────────────┘
```

**StockManagement** — Tìm kiếm + Import hàng:
```
┌─────────────────────────────────────────────────┐
│  📊 Quản Lý Nhập Hàng                          │
│                                                  │
│  ── Import từ file ──────────────────────────   │
│  [📎 Chọn file Excel/CSV]  [📥 Import]          │
│                                                  │
│  ── Cập nhật thủ công ──────────────────────    │
│  🔍 [  Tìm tên sản phẩm...  ] [Tìm]           │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ Tên SP       │ Tồn kho │ Nhập thêm │ ✅ │    │
│  │ Áo khoác gió │ 50      │ [100]     │ ✅ │    │
│  │ Quần jean    │ 25      │ [  ]      │    │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 6. Backend API Specification

### API 1: Import Products (Batch Create)
```
POST /api/v1/admin/products/import
Auth: Admin only
Content-Type: application/json

Request Body:
{
  "products": [
    {
      "name": "Áo khoác gió",
      "description": "Áo khoác chống nước",
      "price": 350000,
      "stock": 100,
      "category": "Áo",
      "brand": "Nike",
      "sizes": ["S", "M", "L"],
      "colors": ["Đen", "Trắng"]
    },
    // ... more products
  ]
}

Response (200):
{
  "success": true,
  "imported": 48,
  "failed": 2,
  "errors": [
    { "row": 5, "name": "Quần", "message": "Thiếu trường price" },
    { "row": 12, "name": "", "message": "Thiếu trường name" }
  ]
}
```

### API 2: Import Stock (Batch Update)
```
PUT /api/v1/admin/products/import-stock
Auth: Admin only

Request Body:
{
  "items": [
    { "name": "Áo khoác gió", "quantity": 100 },
    { "name": "Quần jean", "quantity": 50 }
  ]
}

Response (200):
{
  "success": true,
  "updated": 2,
  "notFound": ["Sản phẩm XYZ"]
}
```

### API 3: Update Single Stock
```
PUT /api/v1/admin/products/:id/stock
Auth: Admin only

Request Body:
{ "quantity": 100 }

Response (200):
{
  "success": true,
  "product": { "_id": "...", "name": "Áo khoác", "stock": 150 }
}
```

### API 4: Search Products by Name
```
GET /api/v1/admin/products/search?name=áo
Auth: Admin only

Response (200):
{
  "success": true,
  "products": [
    { "_id": "...", "name": "Áo khoác gió", "stock": 50, "price": 350000 },
    { "_id": "...", "name": "Áo thun", "stock": 120, "price": 200000 }
  ]
}
```

---

## 7. Thứ tự thực thi

| Phase | Thực hiện | Dependencies |
|:---|:---|:---|
| 1 | Cài `xlsx` cho frontend | — |
| 2 | Backend: 4 API endpoints | — |
| 3 | Frontend: adminSlice thunks | Phase 2 |
| 4 | Frontend: ImportProductModal component | Phase 1, 3 |
| 5 | Frontend: StockManagement component | Phase 3 |
| 6 | Sửa ProductsManagement.jsx (tab system) | Phase 4, 5 |
| 7 | CSS + polish UI | Phase 6 |
| 8 | Test toàn bộ trên trình duyệt | Phase 7 |

---

## 8. Verification Checklist

### Import Sản Phẩm
- [ ] Upload file .xlsx → preview đúng
- [ ] Upload file .csv → preview đúng
- [ ] Validation highlight hàng lỗi
- [ ] Click Import → tạo sản phẩm thành công
- [ ] Hiển thị kết quả imported/failed
- [ ] Tải template mẫu

### Nhập Hàng
- [ ] Import file stock → cập nhật đúng số lượng
- [ ] Tìm kiếm sản phẩm theo tên
- [ ] Cập nhật thủ công stock cho 1 sản phẩm
- [ ] Sản phẩm không tìm thấy → báo lỗi

### Edge Cases
- [ ] File rỗng → báo lỗi
- [ ] File sai format → báo lỗi
- [ ] File quá lớn (>1000 dòng) → xử lý ổn
- [ ] Tên sản phẩm trùng → xử lý đúng

---

## 9. Rủi ro & Giải pháp

| Rủi ro | Giải pháp |
|:---|:---|
| Import sản phẩm KHÔNG có ảnh | Gán ảnh placeholder mặc định |
| Tên sản phẩm trùng nhiều kết quả khi nhập hàng | Hiển thị popup chọn đúng sản phẩm |
| File Excel quá lớn (>5000 dòng) | Batch insert chunked (500 dòng/batch) |
| CSV encoding sai (UTF-8 BOM) | SheetJS tự xử lý encoding |

---

> **Bước tiếp theo**: Review plan → Duyệt → Thực thi theo thứ tự Phase 1 → 8.
