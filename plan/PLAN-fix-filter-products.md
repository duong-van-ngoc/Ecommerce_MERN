# 📋 PLAN: Sửa lỗi Bộ lọc Giá & Đánh giá sao trang Sản phẩm

> **Ngày**: 10/03/2026 | **Agent**: Antigravity  
> **Status**: 🟡 Planning

---

## 1. Mô tả vấn đề

### Bug 1 — Bộ lọc giá tự động áp dụng (không chờ nút "Áp dụng")

**Hiện trạng**: Khi user gõ vào ô min/max, sản phẩm **tự động cập nhật ngay** mà không cần nhấn nút "Áp dụng".

**Nguyên nhân gốc rễ**:
- `priceRange` nằm trong dependency array của `useEffect` chính (dòng 91 `Products.jsx`).
- Mỗi lần `setPriceRange()` → React re-render → `useEffect` fire → gọi API ngay lập tức (sau debounce 500ms).
- Nút "Áp dụng" (`handleApplyPrice`) chỉ validate, **không** kiểm soát thời điểm gọi API.

**Kết quả mong muốn**:
- Gõ giá → **KHÔNG** gọi API.
- Nhấn "Áp dụng" → **MỚI** gọi API.
- Click chip preset → Gọi API **NGAY** (vì chip = áp dụng luôn).

---

### Bug 2 — Bộ lọc đánh giá sao hiển thị sai khoảng

**Hiện trạng**: Chọn 3 sao → hiển thị tất cả sản phẩm ≥3 sao (bao gồm cả 4 sao, 5 sao).

**Nguyên nhân gốc rễ**:
- `productSlice.js` dòng 34-36 chỉ gửi `ratings[gte]=3`.
- Backend MongoDB query: `{ ratings: { $gte: 3 } }` → trả về mọi sản phẩm ≥3 sao.

**Kết quả mong muốn**:
| Chọn | Hiển thị sản phẩm có rating |
|:---|:---|
| 1 sao | ≥1 và <2 |
| 2 sao | ≥2 và <3 |
| 3 sao | ≥3 và <4 |
| 4 sao | ≥4 và <5 |
| 5 sao | =5 (chính xác 5 sao) |

---

## 2. Kiến trúc & Luồng hoạt động

### 2.1 Luồng hiện tại (BỊ LỖI)

```
User gõ ô min/max
       │
       ▼
setPriceRange({ min, max })    ←── React state thay đổi
       │
       ▼
useEffect phát hiện priceRange  ←── priceRange NẰM TRONG dependency array
thay đổi → trigger!                 [priceRange, selectedRating, ...]
       │
       ▼
setTimeout 500ms (debounce)
       │
       ▼
dispatch(getProduct({           ←── GỌI API NGAY (BUG!)
  price: { gte: min, lte: max }
}))
       │
       ▼
Sản phẩm cập nhật trên UI
```

### 2.2 Luồng SAU KHI SỬA (đúng yêu cầu)

```
                             ┌────────────────────────────────┐
                             │  User gõ ô min/max             │
                             │  setPriceRange({ min, max })   │
                             │  → Chỉ lưu vào state UI       │
                             │  → KHÔNG trigger useEffect     │
                             └────────────┬───────────────────┘
                                          │
                    ┌─────────────────────┤
                    │                     │
              User nhấn            User click
             "Áp dụng"           chip preset
                    │                     │
                    ▼                     ▼
          handleApplyPrice()    handlePresetClick(preset)
          - Validate min ≤ max  - setPriceRange(preset)
          - setAppliedPrice()   - setAppliedPrice()
                    │                     │
                    └──────────┬──────────┘
                               │
                               ▼
                  useEffect phát hiện appliedPrice  ←── dependency MỚI
                  thay đổi → trigger!
                               │
                               ▼
                  dispatch(getProduct({
                    price: appliedPrice   ←── Dùng appliedPrice, KHÔNG phải priceRange
                  }))
                               │
                               ▼
                  Sản phẩm cập nhật trên UI
```

### 2.3 Luồng Rating SAU KHI SỬA

```
User click "3 sao"
       │
       ▼
handleRatingChange(3)
setSelectedRating(3)
       │
       ▼
useEffect detect selectedRating thay đổi → trigger
       │
       ▼
dispatch(getProduct({
  ratings: { gte: 3, lt: 4 }     ←── THÊM lt (less than)
}))
       │
       ▼
productSlice.js build URL:
  /api/v1/products?ratings[gte]=3&ratings[lt]=4
       │
       ▼
Express parse (query parser extended):
  req.query = { ratings: { gte: "3", lt: "4" } }
       │
       ▼
apiFunctionality.js → filter()
  → Regex: gte → $gte, lt → $lt
  → Convert: "3" → 3, "4" → 4
  → MongoDB: { ratings: { $gte: 3, $lt: 4 } }
       │
       ▼
Trả về sản phẩm có rating 3.0 ~ 3.9 → Render UI
```

---

## 3. Cách gọi API chi tiết

### 3.1 Frontend → Backend Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                      FRONTEND                                │
│                                                              │
│  Products.jsx                                                │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ useEffect → dispatch(getProduct({                   │     │
│  │   keyword: "áo",                                    │     │
│  │   page: 1,                                          │     │
│  │   category: "Quần",                                 │     │
│  │   price: { gte: 100000, lte: 500000 },  ← FIX 1    │     │
│  │   ratings: { gte: 3, lt: 4 },           ← FIX 2    │     │
│  │   sort: "price_asc",                                │     │
│  │   inStock: true                                     │     │
│  │ }))                                                 │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│  productSlice.js        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Build URL string:                                   │     │
│  │ /api/v1/products                                    │     │
│  │   ?page=1                                           │     │
│  │   &keyword=áo                                       │     │
│  │   &category=Quần                                    │     │
│  │   &price[gte]=100000                                │     │
│  │   &price[lte]=500000                                │     │
│  │   &ratings[gte]=3                                   │     │
│  │   &ratings[lt]=4              ← MỚI                │     │
│  │   &stock=true                                       │     │
│  │   &sort=price                                       │     │
│  │                                                     │     │
│  │ axios.get(link) ─────────────────────────────────────┼────┤
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
                         │ HTTP GET
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                      BACKEND                                 │
│                                                              │
│  Express v5 + query parser extended                          │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ req.query = {                                       │     │
│  │   page: "1",                                        │     │
│  │   keyword: "áo",                                    │     │
│  │   category: "Quần",                                 │     │
│  │   price: { gte: "100000", lte: "500000" },          │     │
│  │   ratings: { gte: "3", lt: "4" },                   │     │
│  │   stock: "true",                                    │     │
│  │   sort: "price"                                     │     │
│  │ }                                                   │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│  productController.js   ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ const api = new APIFunctionality(Product.find(),    │     │
│  │                                  req.query);        │     │
│  │ api.search()      → name regex "áo"                 │     │
│  │    .filter()      → price, ratings, stock, category │     │
│  │    .sort()        → sort by price ascending         │     │
│  │    .pagination(8) → skip/limit                      │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│  apiFunctionality.js    ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ filter() method:                                    │     │
│  │  1. Xóa keyword, page, limit, sort                 │     │
│  │  2. stock="true" → { $gt: 0 }                      │     │
│  │  3. Regex: gte→$gte, lte→$lte, lt→$lt, gt→$gt      │     │
│  │  4. Convert string → Number                         │     │
│  │                                                     │     │
│  │  Final MongoDB query:                               │     │
│  │  db.products.find({                                 │     │
│  │    name: { $regex: "áo", $options: "i" },           │     │
│  │    category: "Quần",                                │     │
│  │    price: { $gte: 100000, $lte: 500000 },           │     │
│  │    ratings: { $gte: 3, $lt: 4 },         ← FIX 2   │     │
│  │    stock: { $gt: 0 }                                │     │
│  │  }).sort({ price: 1 }).skip(0).limit(8)             │     │
│  └─────────────────────────────────────────────────────┘     │
│                         │                                    │
│  Response (JSON):       ▼                                    │
│  {                                                           │
│    products: [...],                                          │
│    productCount: 5,                                          │
│    resultPerPage: 8,                                         │
│    totalPages: 1                                             │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Các file cần thay đổi

| # | File | Thay đổi | Độ khó |
|:---|:---|:---|:---|
| 1 | `frontend/src/pages/Products.jsx` | Thêm `appliedPrice` state, sửa useEffect, handler | ⭐⭐ |
| 2 | `frontend/src/features/products/productSlice.js` | Hỗ trợ `ratings` object `{gte, lt}` | ⭐ |
| ✅ | `backend/utils/apiFunctionality.js` | **KHÔNG CẦN SỬA** — đã hỗ trợ `$lt` sẵn | — |

---

## 5. Chi tiết thay đổi code

### 5.1 Products.jsx — Fix 1: Tách Price State

**Ý tưởng**: Dùng 2 state riêng biệt:
- `priceRange` — Giá trị UI (user đang gõ), **KHÔNG** trigger API.
- `appliedPrice` — Giá trị đã xác nhận, **CÓ** trigger API.

```diff
  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 30000000 });
+ const [appliedPrice, setAppliedPrice] = useState(null);
  const [priceError, setPriceError] = useState('');
```

**Sửa useEffect chính** (dòng 72-91):

```diff
  // Dependency array:
- }, [dispatch, currentPage, selectedCategories, keyword, priceRange, sortBy, selectedRating, inStockOnly]);
+ }, [dispatch, currentPage, selectedCategories, keyword, appliedPrice, sortBy, selectedRating, inStockOnly]);

  // Trong dispatch params:
- price: (priceRange.min > PRICE_MIN || priceRange.max < PRICE_MAX)
-   ? { gte: priceRange.min, lte: priceRange.max }
-   : null,
+ price: appliedPrice,
```

**Sửa handleApplyPrice** (dòng 137-145):

```diff
  const handleApplyPrice = () => {
    if (priceRange.min > 0 && priceRange.max > 0 && priceRange.min > priceRange.max) {
      setPriceError('Khoảng giá không hợp lệ');
      return;
    }
    setPriceError('');
+   // Tạo giá trị filter thực sự để trigger useEffect
+   const newPrice =
+     (priceRange.min > PRICE_MIN || priceRange.max < PRICE_MAX)
+       ? { gte: priceRange.min, lte: priceRange.max }
+       : null;
+   setAppliedPrice(newPrice);
    setCurrentPage(1);
  };
```

**Sửa handlePresetClick** (dòng 148-152):

```diff
  const handlePresetClick = (preset) => {
    setPriceRange({ min: preset.min, max: preset.max });
+   // Chip = áp dụng ngay, gửi API luôn
+   setAppliedPrice({ gte: preset.min, lte: preset.max });
    setPriceError('');
    setCurrentPage(1);
  };
```

**Sửa handleClearAll và handleRemoveFilter**:

```diff
  const handleClearAll = () => {
    setPriceRange({ min: PRICE_MIN, max: PRICE_MAX });
+   setAppliedPrice(null);
    // ... rest
  };

  const handleRemoveFilter = (filterType, value) => {
    if (filterType === 'price') {
      setPriceRange({ min: PRICE_MIN, max: PRICE_MAX });
+     setAppliedPrice(null);
    }
  };
```

**Sửa activeFilterCount**:

```diff
- (priceRange.min > PRICE_MIN || priceRange.max < PRICE_MAX ? 1 : 0) +
+ (appliedPrice ? 1 : 0) +
```

---

### 5.2 Products.jsx — Fix 2: Rating gửi khoảng

```diff
  // Trong useEffect dispatch params:
- ratings: selectedRating,
+ ratings: selectedRating
+   ? { gte: selectedRating, lt: selectedRating + 1 }
+   : null,
```

---

### 5.3 productSlice.js — Hỗ trợ Rating object

```diff
- // Filter: ratings (tối thiểu N sao)
- if (ratings && ratings > 0) {
-   link += `&ratings[gte]=${ratings}`;
- }
+ // Filter: ratings (khoảng sao)
+ if (ratings) {
+   if (ratings.gte !== undefined) {
+     link += `&ratings[gte]=${ratings.gte}`;
+   }
+   if (ratings.lt !== undefined) {
+     link += `&ratings[lt]=${ratings.lt}`;
+   }
+ }
```

---

## 6. Tại sao KHÔNG cần sửa Backend?

Backend (`apiFunctionality.js`) đã xử lý tự động:

```js
// Dòng 68: Regex replace cho TẤT CẢ operators
queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);
```

→ `ratings: { gte: "3", lt: "4" }` tự động thành `ratings: { $gte: 3, $lt: 4 }` ✅

---

## 7. Verification Checklist

### Bộ lọc giá
- [ ] Gõ min/max → Sản phẩm KHÔNG thay đổi
- [ ] Click "Áp dụng" → Sản phẩm cập nhật đúng khoảng
- [ ] Click chip preset → Sản phẩm cập nhật NGAY
- [ ] Validation min > max → Hiện lỗi, không gọi API
- [ ] "Xóa tất cả" → Reset cả priceRange lẫn appliedPrice

### Bộ lọc đánh giá
- [ ] Chọn 1 sao → Sản phẩm rating 1.0 ~ 1.9
- [ ] Chọn 2 sao → Sản phẩm rating 2.0 ~ 2.9
- [ ] Chọn 3 sao → Sản phẩm rating 3.0 ~ 3.9
- [ ] Chọn 4 sao → Sản phẩm rating 4.0 ~ 4.9
- [ ] Chọn 5 sao → Sản phẩm rating = 5
- [ ] Bỏ chọn → Hiển thị tất cả

### Kết hợp
- [ ] Chọn category + giá + rating → Kết quả đúng
- [ ] Sort vẫn hoạt động bình thường

---

## 8. Rủi ro & Giải pháp

| Rủi ro | Xác suất | Giải pháp |
|:---|:---|:---|
| Rating = 5 sao: `$lt: 6` sẽ lấy hết | Thấp | Không ảnh hưởng vì max rating là 5 |
| User nhấn Enter thay vì click Áp dụng | Trung bình | Có thể thêm `onKeyDown` handler sau |
| Mobile drawer price apply | Thấp | Drawer dùng chung `renderFilters` nên tự fix |

---

> **Bước tiếp theo**: Review plan → Chạy `/create` để thực thi.
