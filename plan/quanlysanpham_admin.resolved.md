# Admin Products Management - Implementation Plan

## Overview
Tạo trang quản lý sản phẩm cho admin với đầy đủ chức năng CRUD (Create, Read, Update, Delete).

## Backend Changes (Minimal)

### ✅ Already Exists
- `getAdminProducts` - Lấy danh sách sản phẩm
- `createProducts` - Tạo sản phẩm mới
- [updateProduct](file:///d:/Projects/E_Commerce_MERN/backend/controllers/productController.js#61-76) - Cập nhật sản phẩm
- `deteteProduct` - Xóa sản phẩm

### Need to Check
- Routes có dùng admin middleware chưa?
- Upload image functionality

---

## Frontend Implementation

### 1. Redux Slice ([adminSlice.js](file:///d:/Projects/E_Commerce_MERN/frontend/src/admin/adminSLice/adminSlice.js))
Thêm async thunks:
- `fetchAllProducts` - Lấy danh sách sản phẩm (có pagination)
- `createProduct` - Tạo sản phẩm mới
- [updateProduct](file:///d:/Projects/E_Commerce_MERN/backend/controllers/productController.js#61-76) - Cập nhật sản phẩm
- `deleteProduct` - Xóa sản phẩm

### 2. UI Components

#### ProductsManagement Page (`/admin/pages/ProductsManagement.jsx`)
**Layout:**
```
┌─────────────────────────────────────────┐
│ Header (Title + Add Product Button)     │
├─────────────────────────────────────────┤
│ Products Table                           │
│ ┌────────────────────────────────────┐  │
│ │ Image │ Name │ Price │ Stock │ ⚙️ │  │
│ │ [...] │ [...] │ [...] │ [...] │ ... │  │
│ └────────────────────────────────────┘  │
├─────────────────────────────────────────┤
│ Pagination                               │
└─────────────────────────────────────────┘
```

**Features:**
- Bảng hiển thị sản phẩm
- Nút "Thêm sản phẩm" → mở modal
- Actions mỗi row: Edit, Delete
- Pagination controls

#### ProductModal Component (`/admin/components/ProductModal.jsx`)
**Form Fields:**
- Name (text)
- Description (textarea)
- Price (number)
- Category (select)
- Stock (number)
- Images (file upload - multiple)

**States:**
- Add mode: Tạo mới
- Edit mode: Cập nhật

### 3. Styling (`/admin/styles/ProductsManagement.css`)
- Table responsive
- Modal overlay
- Form styling
- Image preview

---

## User Flow

### Add Product
1. Click "Thêm sản phẩm"
2. Modal hiển thị
3. Điền form + upload ảnh
4. Submit → dispatch `createProduct`
5. Success → đóng modal, refresh list

### Edit Product
1. Click Edit icon trên row
2. Modal hiển thị với data
3. Sửa thông tin
4. Submit → dispatch [updateProduct](file:///d:/Projects/E_Commerce_MERN/backend/controllers/productController.js#61-76)
5. Success → đóng modal, refresh list

### Delete Product
1. Click Delete icon
2. Confirm dialog
3. OK → dispatch `deleteProduct`
4. Success → refresh list

---

## File Structure
```
frontend/src/admin/
├── adminSLice/
│   └── adminSlice.js (update)
├── pages/
│   └── ProductsManagement.jsx (new)
├── components/
│   └── ProductModal.jsx (new)
└── styles/
    └── ProductsManagement.css (new)
```

---

## Next Steps
1. ✅ Check backend routes
2. Update [adminSlice.js](file:///d:/Projects/E_Commerce_MERN/frontend/src/admin/adminSLice/adminSlice.js) with product thunks
3. Create `ProductsManagement.jsx`
4. Create `ProductModal.jsx`
5. Add routing in [App.jsx](file:///d:/Projects/E_Commerce_MERN/frontend/src/App.jsx)
6. Style with CSS
7. Test all CRUD operations
