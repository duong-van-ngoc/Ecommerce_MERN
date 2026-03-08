# Kế Hoạch Redesign Trang Products

## Tổng Quan
Redesign trang Products.jsx theo mẫu HTML template hiện đại, kết hợp với backend API đã có sẵn.

---

## Phân Tích Hiện Trạng

### 🟢 **Đã Có Từ Backend** (Giữ Nguyên)
1. **Redux State Management**
   - `products` - Danh sách sản phẩm
   - `loading` - Loading state
   - `error` - Error handling
   - `productCount` - Tổng số sản phẩm
   - `totalPages` - Tổng số trang
   - `resultPerPage` - Số sản phẩm mỗi trang

2. **API Features**
   - `getProduct` action - Lấy sản phẩm với filter (keyword, page, category)
   - Pagination - Phân trang
   - Category filter - Lọc theo danh mục
   - Search - Tìm kiếm theo keyword

3. **Components Có Sẵn**
   - `Product` component - Hiển thị product card
   - `Pagination` component - Phân trang
   - `NoProducts` component - Empty state
   - `Loader` component - Loading state

4. **Routing**
   - URL params handling (keyword, category, page)
   - Navigation điều hướng

### 🔴 **Chưa Có** (Cần Mock hoặc TODO)
1. **Filters Nâng Cao**
   - Price range filter (min/max price)
   - Rating filter (1-5 sao)
   - In stock filter
   - Brand filter

2. **Sorting**
   - Sort by: newest, price (asc/desc), rating

3. **UI Components**
   - Mobile filter drawer
   - Active filter chips
   - Breadcrumb navigation
   - Filter counter badge

---

## Cấu Trúc Component Mới

```
Products.jsx
├── Navbar (có sẵn)
├── Breadcrumb (mới)
├── Mobile Filter Button (mới)
├── Main Content
│   ├── Desktop Sidebar (mới)
│   │   ├── Category Filter ✅
│   │   ├── Price Range Filter ⚠️ TODO
│   │   ├── Rating Filter ⚠️ TODO
│   │   └── Stock Filter ⚠️ TODO
│   ├── Mobile Drawer (mới)
│   └── Products Area
│       ├── Toolbar
│       │   ├── Active Filters Chips (mới)
│       │   └── Sort Dropdown ⚠️ TODO
│       ├── Result Count (mới)
│       ├── Products Grid ✅
│       └── Pagination ✅
└── Footer (có sẵn)
```

---

## Kiến Thức React Cần Áp Dụng

### 1. **useState Hook**
```javascript
const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
const [selectedCategories, setSelectedCategories] = useState([])
const [priceRange, setPriceRange] = useState({ min: '', max: '' })
const [selectedRating, setSelectedRating] = useState(null)
const [inStockOnly, setInStockOnly] = useState(false)
const [sortBy, setSortBy] = useState('newest')
```

### 2. **useEffect Hook**
- Sync URL params với local state
- Đóng mobile drawer khi route thay đổi
- Fetch products khi filters thay đổi
- Handle body scroll lock (mobile drawer)

### 3. **useSearchParams / useLocation**
- Quản lý URL query parameters
- Sync filters với URL
- Browser back/forward support

### 4. **Conditional Rendering**
```javascript
{loading && <LoadingSkeleton />}
{!loading && products.length === 0 && <EmptyState />}
{!loading && products.length > 0 && <ProductsGrid />}
```

### 5. **Event Handlers**
- `handleFilterChange` - Cập nhật filters
- `handleClearAll` - Xóa tất cả filters
- `handleApplyPrice` - Apply price range
- `handleSortChange` - Thay đổi sort
- `handleDrawerToggle` - Mở/đóng mobile drawer

### 6. **CSS Classes Dynamic**
```javascript
className={`mobile-drawer ${isMobileDrawerOpen ? 'open' : ''}`}
```

### 7. **Refs (Optional)**
```javascript
const drawerRef = useRef(null)
// Click outside to close drawer
```

---

## Các Bước Thực Hiện

### **Bước 1: Tạo Products.css Mới**
- Copy tất cả CSS từ template
- Chuyển đổi từ inline styles sang CSS classes
- Thêm responsive breakpoints
- Giữ các animations và transitions

### **Bước 2: Tạo State Management**
```javascript
// Filter states
const [filters, setFilters] = useState({
  categories: [],
  priceMin: '',
  priceMax: '',
  rating: null,
  inStock: false
})
const [sortBy, setSortBy] = useState('newest')
const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
```

### **Bước 3: Xây Dựng UI Components**
1. **Breadcrumb Component**
   ```jsx
   <div className="breadcrumb">
     <Link to="/">Home</Link> / <span>Products</span>
   </div>
   ```

2. **Mobile Filter Button**
   ```jsx
   <button onClick={() => setIsMobileDrawerOpen(true)}>
     Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
   </button>
   ```

3. **Desktop Sidebar**
   - Category checkboxes (kết nối với backend) ✅
   - Price range inputs ⚠️ TODO
   - Rating radio buttons ⚠️ TODO
   - In stock checkbox ⚠️ TODO

4. **Mobile Drawer**
   - Giống desktop sidebar
   - Slide-in animation
   - Backdrop overlay
   - Close button

5. **Active Filter Chips**
   ```jsx
   {filters.categories.map(cat => (
     <span className="filter-chip">
       {cat} <button onClick={() => removeFilter(cat)}>×</button>
     </span>
   ))}
   ```

6. **Sort Dropdown**
   ```jsx
   <select value={sortBy} onChange={handleSortChange}>
     <option value="newest">Newest</option>
     <option value="price_asc">Price: Low to High</option>
     // TODO: Backend chưa hỗ trợ sort
   </select>
   ```

### **Bước 4: Xử Lý Logic**

1. **URL Sync**
   ```javascript
   useEffect(() => {
     const params = new URLSearchParams(location.search)
     // Sync filters từ URL vào state
     setFilters({
       categories: params.getAll('category'),
       // ...
     })
   }, [location.search])
   ```

2. **Filter Change Handler**
   ```javascript
   const handleFilterChange = (filterType, value) => {
     setFilters(prev => ({...prev, [filterType]: value}))
     // Update URL
     updateURLParams(filterType, value)
   }
   ```

3. **Calculate Active Filter Count**
   ```javascript
   const activeFilterCount = 
     filters.categories.length +
     (filters.priceMin || filters.priceMax ? 1 : 0) +
     (filters.rating ? 1 : 0) +
     (filters.inStock ? 1 : 0)
   ```

### **Bước 5: Integration với Backend**

**Đã Có:**
```javascript
dispatch(getProduct({
  keyword,      // ✅ Search
  page,         // ✅ Pagination
  category      // ✅ Category filter
}))
```

**Cần TODO (Backend chưa hỗ trợ):**
```javascript
// ⚠️ TODO: Backend cần thêm params
dispatch(getProduct({
  keyword,
  page,
  category,
  minPrice,     // ⚠️ TODO
  maxPrice,     // ⚠️ TODO
  rating,       // ⚠️ TODO
  inStock,      // ⚠️ TODO
  sortBy        // ⚠️ TODO
}))
```

### **Bước 6: Mobile Drawer Control**
```javascript
useEffect(() => {
  if (isMobileDrawerOpen) {
    document.body.classList.add('no-scroll')
  } else {
    document.body.classList.remove('no-scroll')
  }
  return () => document.body.classList.remove('no-scroll')
}, [isMobileDrawerOpen])
```

---

## TODO List - Backend Integration

> [!WARNING]
> **Các features sau cần bổ sung ở backend:**

1. **API Endpoint `/products` cần nhận thêm query params:**
   - `minPrice` - Lọc giá tối thiểu
   - `maxPrice` - Lọc giá tối đa
   - `rating` - Lọc theo rating (1-5)
   - `inStock` - Lọc sản phẩm còn hàng
   - `sortBy` - Sort theo: `newest`, `price_asc`, `price_desc`, `rating_desc`

2. **Product Schema cần có:**
   - `rating` field (average rating)
   - `stock` field (số lượng tồn kho)
   - `createdAt` field (để sort by newest)

3. **Response cần trả về:**
   - `availableFilters` - Danh sách các filter có sẵn
   - `priceRange` - Min/max price hiện tại trong DB

---

## Mock Data Strategy

**Hiện tại:**
- Categories: Hardcoded array `["laptop", "mobile", "tv", "fruits", "glass"]`
- Rating: Mock trong component (chưa có data từ backend)
- Price range: User input (chưa validate với backend)
- Sort: Frontend only (chưa gửi lên backend)

**Sau khi có backend:**
- Thay categories hardcoded = API call
- Kết nối rating filter với backend
- Validate price range với actual product prices
- Implement server-side sorting

---

## Responsive Breakpoints

```css
/* Desktop: >= 1024px - Full sidebar */
/* Tablet: 768px - 1023px - Sidebar + 2 column grid */
/* Mobile: < 768px - Drawer + 1-2 column grid */
```

---

## Performance Optimization

1. **Debounce Search Input** - Giảm API calls
2. **Lazy Load Images** - Product images
3. **Virtualization** - Nếu có nhiều sản phẩm
4. **Memoization** - `useMemo` cho filtered products

---

## Accessibility

- ✅ ARIA labels cho buttons
- ✅ Keyboard navigation
- ✅ Focus management (drawer)
- ✅ Screen reader support
