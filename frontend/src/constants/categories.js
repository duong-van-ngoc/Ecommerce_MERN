/**
 * ============================================================================
 * COMPONENT: categories
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `categories` trong ứng dụng.
 * 
 * 2. Props: 
 *    - Không nhận trực tiếp props truyền từ cha.
 * 
 * 3. State:
 *    - Không sử dụng state (Stateless component).
 * 
 * 4. Render lại khi nào:
 *    - Khi component cha re-render.
 * 
 * 5. Event handling:
 *    - Không có event controls phức tạp.
 * 
 * 6. Conditional rendering:
 *    - Render tĩnh, không có điều kiện.
 * 
 * 7. List rendering:
 *    - Không sử dụng list rendering.
 * 
 * 8. Controlled input:
 *    - Không chứa form controls.
 * 
 * 9. Lifting state up:
 *    - Dữ liệu được quản lý cục bộ hoặc đẩy lên Redux store toàn cục.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Component Mount -> Chỉ mount giao diện thuần và nhận Props.
 *    - (2) Nhận State/Props và render UI ban đầu.
 *    - (3) End-User tương tác trên component -> Cập nhật State -> Re-render màn hình.
 * ============================================================================
 */
// Cấu trúc Data Danh mục Sản phẩm (Tree Structure)
// Dùng cho Cascading Dropdown (Chọn Cấp 1 -> Cấp 2 -> Cấp 3)

export const CATEGORY_TREE = {
  "NAM": {
    "Áo": ["Thun", "Sơ mi", "Hoodie", "Khoác", "Polo"],
    "Quần": ["Jean", "Short", "Kaki", "Jogger"]
  },
  "NỮ": {
    "Áo": ["Thun", "Sơ mi", "Kiểu", "Khoác", "Váy"],
    "Váy": ["Ngắn", "Dài", "Body"],
    "Quần": ["Jean", "Short", "Kaki"]
  },
  "UNISEX": {
    "Áo thun": ["Ngắn tay", "Dài tay", "Oversize"], // Thêm cấp 3 mặc định cho Áo thun
    "Hoodie": ["Zip", "Tròng đầu"],
    "Áo khoác": ["Bomber", "Cardigan", "Dù"]
  },
  "PHỤ KIỆN & GIÀY DÉP": {
    "Giày dép": ["Giày dép nam", "Giày dép nữ", "Giày dép unisex"],
    "Phụ kiện Nam": ["Mũ", "Thắt lưng", "Ví", "Kính", "Trang sức"],
    "Phụ kiện Nữ": ["Túi xách", "Mũ", "Kính", "Trang sức", "Khăn"],
    "Phụ kiện unisex": ["Mũ", "Kính", "Trang sức", "Khăn", "Balo", "Tất/Vớ"]
  }
};

// Hàm tiện ích lấy danh sách Cấp 1
export const getLevel1Categories = () => {
  return Object.keys(CATEGORY_TREE);
};

// Hàm tiện ích lấy danh sách Cấp 2 dựa vào Cấp 1
export const getLevel2Categories = (level1) => {
  if (!level1 || !CATEGORY_TREE[level1]) return [];
  return Object.keys(CATEGORY_TREE[level1]);
};

// Hàm tiện ích lấy danh sách Cấp 3 dựa vào Cấp 1 & Cấp 2
export const getLevel3Categories = (level1, level2) => {
  if (!level1 || !level2 || !CATEGORY_TREE[level1] || !CATEGORY_TREE[level1][level2]) return [];
  return CATEGORY_TREE[level1][level2];
};
