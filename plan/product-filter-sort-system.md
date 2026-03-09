# Product Filter & Sort System

> **Tài liệu thiết kế hệ thống** — Dành cho Junior/Intern đọc hiểu.
> Ngày tạo: 2026-03-08

---

## 1. Overview — Tổng quan tính năng

| # | Tính năng | Mô tả | Tại sao quan trọng? |
|---|-----------|-------|---------------------|
| 1 | **Filter by Price Range** | Lọc sản phẩm theo khoảng giá (VD: 0- 99999999) | Giúp user tìm đúng sản phẩm trong ngân sách |
| 2 | **Sort by Price** | Sắp xếp giá tăng/giảm | User muốn xem giá rẻ nhất hoặc đắt nhất trước |
| 3 | **Filter by Rating** | Lọc theo số sao (≥4 sao) | User chỉ muốn xem sản phẩm chất lượng |
| 4 | **Stock Status** | Lọc sản phẩm còn hàng / hết hàng | Tránh user click vào sản phẩm hết hàng |

### Trạng thái: ✅ ĐÃ HOÀN THÀNH
- ✅ **Frontend UI** — buttons, sliders, dropdowns
- ✅ **Backend** — filter, sort, pagination (apiFunctionality.js)
- ✅ **Frontend ↔ Backend** — đã kết nối qua productSlice.js
- ✅ **Đơn vị giá**: VND (₫), PRICE_MAX = 30.000.000₫

---

## 2. Architecture — Kiến trúc hệ thống

```
Frontend (React)                          Backend (Express)
─────────────────                         ─────────────────
Products.jsx                              productRoutes.js
    ↓ dispatch                                ↓
productSlice.js                           productController.js
    ↓ axios.get()                             ↓
──────────────── HTTP ──────────────────► APIFunctionality.js
                                              ↓
                                          MongoDB Query
                                              ↓
◄──────────────── JSON ◄──────────────── Response
    ↓
Redux Store
    ↓
UI re-render
```

### Files liên quan

| Layer | File | Vai trò |
|-------|------|---------|
| Backend Utils | `backend/utils/apiFunctionality.js` | Search, Filter, Sort, Pagination |
| Backend Controller | `backend/controllers/productController.js` | Xử lý request, trả response |
| Frontend Slice | `frontend/src/features/products/productSlice.js` | Redux async thunk, gọi API |
| Frontend Page | `frontend/src/pages/Products.jsx` | UI + filter handlers |

---

## 3. Feature Flow

```
User mở trang /products
    ↓
User kéo slider giá / chọn rating / bật stock filter / đổi sort
    ↓
React state update → useEffect trigger
    ↓
dispatch(getProduct({ price, sort, ratings, inStock }))
    ↓
productSlice.js builds URL:
  /api/v1/products?price[gte]=100000&price[lte]=500000&sort=-price&ratings[gte]=4&stock=true
    ↓
Express → Controller → APIFunctionality → MongoDB
    ↓
Response → Redux store → UI re-render
```

---

## 4. API Design

### Endpoint: `GET /api/v1/products`

| Param | Type | Example | Mô tả |
|-------|------|---------|--------|
| `keyword` | string | `?keyword=áo` | Tìm kiếm theo tên |
| `page` | number | `?page=2` | Phân trang |
| `category` | string | `?category=Áo` | Lọc theo danh mục |
| `price[gte]` | number | `?price[gte]=100000` | Giá tối thiểu |
| `price[lte]` | number | `?price[lte]=500000` | Giá tối đa |
| `ratings[gte]` | number | `?ratings[gte]=4` | Rating tối thiểu |
| `stock` | string | `?stock=true` | Chỉ lấy sản phẩm còn hàng |
| `sort` | string | `?sort=-price` | `-price`=giảm, `price`=tăng, `-createdAt`=mới nhất |

---

## 5. Database Schema

```javascript
Product {
  name: String,           // "Áo Polo Premium"
  price: Number,          // 299000
  originalPrice: Number,  // 499000
  stock: Number,          // 50 → stock > 0 = còn hàng
  ratings: Number,        // 4.5 → trung bình sao
  numOfReviews: Number,   // 120
  category: String,       // "Áo"
}
```

> **ratings** được tính: `sum(review.rating) / reviews.length`
> **Stock status**: `stock > 0` = Còn hàng, `stock === 0` = Hết hàng

---

## 6. Backend Changes

### `apiFunctionality.js` — Upgrade `filter()` + Add `sort()`
- `filter()`: Xử lý `price[gte]`, `ratings[gte]` → thêm `$` prefix cho MongoDB operators
- `filter()`: Xử lý `stock=true` → convert thành `{ stock: { $gt: 0 } }`
- `sort()`: Mới — parse `?sort=-price` thành `.sort({ price: -1 })`

### `productController.js` — Chain `.sort()`
```javascript
new APIFunctionality(Product.find(), req.query)
  .search().filter().sort().pagination(resultPerPage);
```

---

## 7. Frontend Changes

### `productSlice.js` — Thêm params vào URL
- Nhận: `{ price, sort, ratings, inStock }` từ dispatch
- Build: `&price[gte]=X&sort=-price&ratings[gte]=4&stock=true`

### `Products.jsx` — Connect handlers
- `handleApplyPrice()` → trigger useEffect
- `handleSortChange()` → trigger useEffect
- `handleRatingChange()` → trigger useEffect
- `handleStockToggle()` → trigger useEffect

---

## 8. Full Data Flow

```
UI Filter Change → State Update → useEffect → dispatch
→ productSlice → axios.get(URL with params)
→ Express Route → Controller → APIFunctionality
→ .search() → .filter() → .sort() → .pagination()
→ MongoDB Query → Response JSON
→ Redux store → UI re-render
```

---

## 9. FAQ cho Junior

**Q: `price[gte]` là gì?**
> MongoDB operator `$gte` = "greater than or equal". Express parse `price[gte]=100` thành `{ price: { gte: "100" } }`. Backend convert thành `{ price: { $gte: 100 } }`.

**Q: `sort=-price` dấu `-` là gì?**
> Convention: `-` = descending (giảm dần). Không `-` = ascending (tăng dần). MongoDB: `.sort({ price: -1 })`.

**Q: Tại sao `stock=true`?**
> Trường DB là `stock` (Number). Backend convert `stock=true` → `{ stock: { $gt: 0 } }`.
