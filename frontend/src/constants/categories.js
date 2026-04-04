/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Cấu trúc Danh mục Sản phẩm (Product Categorization Constants).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Định nghĩa cây danh mục (Category Tree) 3 cấp dùng cho toàn bộ hệ thống (Client & Admin).
 *    - Cung cấp các hàm tiện ích để lấy danh sách danh mục theo từng cấp, giúp đồng bộ hóa dữ liệu hiển thị.
 *    - Là "Sổ cái" quy định các ngành hàng có trong shop.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Phân loại Hàng hóa (Product Taxonomy Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Nested Object Structure: Cấu trúc dữ liệu lồng nhau để biểu diễn quan hệ Cha-Con giữa các danh mục.
 *    - Helper Functions: Các hàm `get...Categories` giúp trừu tượng hóa việc truy cập dữ liệu, giảm thiểu sai sót khi thao tác với Object phức tạp.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Tên danh mục cấp trên (dành cho các hàm helper).
 *    - Output: Mảng danh sách các danh mục con tương ứng.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Dữ liệu tĩnh (Constants).
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `getLevel1Categories`: Lấy các nhóm lớn nhất (NAM, NỮ, UNISEX...).
 *    - `getLevel2Categories`: Lấy các nhóm con (Áo, Quần, Váy...).
 *    - `getLevel3Categories`: Lấy các loại sản phẩm chi tiết (Thun, Sơ mi, Jean...).
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Admin mở Modal thêm sản phẩm.
 *    - Bước 2: Modal gọi `getLevel1Categories` để hiển thị Dropdown đầu tiên.
 *    - Bước 3: Khi Admin chọn "NAM", Modal gọi `getLevel2Categories("NAM")` để cập nhật Dropdown thứ hai.
 *    - Bước 4: Tương tự cho cấp 3 để xác định chính xác loại hàng.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không liên quan trực tiếp.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Xử lý mảng rỗng: Các hàm helper luôn trả về `[]` nếu dữ liệu đầu vào không hợp lệ, tránh gây lỗi `undefined` cho giao diện.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Cây danh mục này CỰC KỲ QUAN TRỌNG: Nó phải khớp hoàn toàn với các giá trị `category` được lưu trong Database. 
 *    - Nếu bạn sửa tên một danh mục ở đây (VD: "Áo thun" -> "T-Shirt"), bạn cũng phải chạy script để cập nhật toàn bộ sản phẩm cũ trong Database, nếu không các sản phẩm đó sẽ không thể tìm thấy.
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
