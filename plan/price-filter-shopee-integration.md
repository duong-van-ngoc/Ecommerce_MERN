# 📄 Documentation: Tích Hợp Price Filter Kiểu Shopee

> **Ngày**: 09/03/2026 | **Agent**: Antigravity

---

## 1. Tổng Quan

Thay thế slider kéo (range slider) bằng **2 ô nhập số + preset chips + nút Áp dụng** kiểu Shopee cho filter giá trên trang `/products`.

## 2. Các File Thay Đổi

| File | Thay đổi |
|:---|:---|
| `frontend/src/pages/Products.jsx` | Thêm state, handlers, thay JSX block Price Range |
| `frontend/src/pageStyles/Products.css` | Thay CSS slider → CSS input fields + chips |
| `frontend/src/features/products/productSlice.js` | Sửa sortMap keys (fix sort bug) |
| `backend/app.js` | Thêm `app.set('query parser', 'extended')` cho Express v5 |

## 3. Luồng Hoạt Động

```
User nhập giá / click chip
        │
        ▼
setPriceRange({ min, max })  ←── React state update
        │
        ▼
useEffect (debounce 500ms)   ←── Tự trigger khi priceRange thay đổi
        │
        ▼
dispatch(getProduct({
  price: { gte: min, lte: max }  ←── Gửi đến Redux thunk
}))
        │
        ▼
productSlice.js build URL:
  /api/v1/products?price[gte]=100000&price[lte]=500000
        │
        ▼
Express v5 + app.set('query parser', 'extended')
  → req.query = { price: { gte: "100000", lte: "500000" } }
        │
        ▼
apiFunctionality.js → filter()
  → Regex: gte → $gte, lte → $lte
  → convertToNumber: "100000" → 100000
  → MongoDB: { price: { $gte: 100000, $lte: 500000 } }
        │
        ▼
Trả về products khớp khoảng giá → Render trên UI
```

## 4. Giải Thích Code (Senior → Intern)

### 4.1 State Management

```jsx
// State chính: lưu khoảng giá user chọn
const [priceRange, setPriceRange] = useState({ min: 0, max: 30000000 });

// State phụ: hiện thông báo lỗi khi min > max
const [priceError, setPriceError] = useState('');
```

**Tại sao tách `priceError`?** Vì validation chỉ cần check khi nhấn "Áp dụng", không cần mỗi lần nhập.

### 4.2 Preset Chips

```jsx
const pricePresets = [
  { label: 'Dưới 100k', min: 0, max: 100000 },
  { label: '100k - 500k', min: 100000, max: 500000 },
  // ...
];
```

Khi click chip → gọi `setPriceRange()` → useEffect tự trigger gọi API (nhờ debounce 500ms). **Không cần** gọi API thủ công.

### 4.3 Bug Express v5 Query Parser

**Vấn đề**: Express v5 mặc định dùng `querystring` (native Node.js), không parse bracket notation:
- `?price[lte]=100000` → `{ "price[lte]": "100000" }` (SAI!)

**Fix**: Thêm 1 dòng vào `app.js`:
```js
app.set('query parser', 'extended');
```
Bật `qs` library → parse đúng thành `{ price: { lte: "100000" } }`.

### 4.4 Validation Flow

```jsx
const handleApplyPrice = () => {
  // Check: giá tối thiểu > giá tối đa → báo lỗi
  if (priceRange.min > 0 && priceRange.max > 0 && priceRange.min > priceRange.max) {
    setPriceError('Khoảng giá không hợp lệ');
    return; // DỪNG - không gọi API
  }
  setPriceError('');
  setCurrentPage(1); // Reset về trang 1
};
```

## 5. Kết Quả Test

| Test Case | Kết quả |
|:---|:---|
| ✅ Chip "Dưới 100k" | Hiển thị MSI 2.000₫ đúng |
| ✅ Chip "100k - 500k" | Hiển thị Quần 123.123₫, Áo khoác 100.000₫ |
| ✅ Nhập tay min/max | Filter đúng khoảng giá |
| ✅ Validation min > max | Hiện "Khoảng giá không hợp lệ" |
| ✅ Xóa tất cả | Reset về 14 sản phẩm |
