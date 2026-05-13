
// === API FUNCTIONALITY ===
// Lớp tiện ích xử lý: Search → Filter → Sort → Pagination
// Tương tự middleware pipeline: mỗi method chain trả về `this` để tiếp tục gọi method tiếp

class APIFunctionality {
    /**
     * @param {mongoose.Query} query   — Product.find() ban đầu
     * @param {Object}         queryStr — req.query (tất cả query params từ URL)
     */
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    // ──────────────────────────────────────────────
    // 1. SEARCH — Tìm kiếm theo từ khóa (tên sản phẩm)
    // URL: ?keyword=áo
    // MongoDB: { name: { $regex: "áo", $options: "i" } }
    // ──────────────────────────────────────────────
    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,  // tìm kiếm gần đúng
                $options: "i"                    // không phân biệt hoa/thường
            }
        } : {};

        this.query = this.query.find({ ...keyword });
        return this; // trả về this để chain tiếp
    }

    // ──────────────────────────────────────────────
    // 2. FILTER — Lọc theo price, ratings, stock, category...
    //
    // URL examples:
    //   ?price[gte]=100000&price[lte]=500000  → { price: { $gte: 100000, $lte: 500000 } }
    //   ?ratings[gte]=4                        → { ratings: { $gte: 4 } }
    //   ?stock=true                            → { stock: { $gt: 0 } }
    //   ?category=Áo                           → { category: "Áo" }
    //
    // Cách hoạt động:
    //   1) Copy queryStr, xóa keyword/page/limit/sort (không phải filter)
    //   2) Xử lý stock=true riêng
    //   3) Convert gte/lte/gt/lt → $gte/$lte/$gt/$lt (MongoDB operators)
    //   4) Apply find(queryObj)
    // ──────────────────────────────────────────────
    // Bảng mapping: giá trị filter sidebar → query 3 cấp danh mục MongoDB
    // Key = giá trị gửi từ frontend, Value = query filter chính xác
    static CATEGORY_MAP = {
        // === TOP-LEVEL NAV SLUGS ===
        'nam': { 'category.level1': 'NAM' },
        'men': { 'category.level1': 'NAM' },
        'nu': { 'category.level1': 'NỮ' },
        'nữ': { 'category.level1': 'NỮ' },
        'women': { 'category.level1': 'NỮ' },
        'unisex': { 'category.level1': 'UNISEX' },
        'phu-kien': { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP' },
        'phụ kiện': { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP' },
        'giay-dep': { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP' },
        'giày dép': { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP' },

        // === NAM ===
        'Áo thun nam':    { 'category.level1': 'NAM', 'category.level2': 'Áo', 'category.level3': 'Thun' },
        'Áo sơ mi nam':   { 'category.level1': 'NAM', 'category.level2': 'Áo', 'category.level3': 'Sơ mi' },
        'Áo hoodie nam':  { 'category.level1': 'NAM', 'category.level2': 'Áo', 'category.level3': 'Hoodie' },
        'Áo khoác nam':   { 'category.level1': 'NAM', 'category.level2': 'Áo', 'category.level3': 'Khoác' },
        'Áo polo nam':    { 'category.level1': 'NAM', 'category.level2': 'Áo', 'category.level3': 'Polo' },
        'Quần jean nam':  { 'category.level1': 'NAM', 'category.level2': 'Quần', 'category.level3': 'Jean' },
        'Quần short nam': { 'category.level1': 'NAM', 'category.level2': 'Quần', 'category.level3': 'Short' },
        'Quần kaki nam':  { 'category.level1': 'NAM', 'category.level2': 'Quần', 'category.level3': 'Kaki' },
        'Quần jogger nam':{ 'category.level1': 'NAM', 'category.level2': 'Quần', 'category.level3': 'Jogger' },
        // === NỮ ===
        'Áo thun nữ':    { 'category.level1': 'NỮ', 'category.level2': 'Áo', 'category.level3': 'Thun' },
        'Áo sơ mi nữ':   { 'category.level1': 'NỮ', 'category.level2': 'Áo', 'category.level3': 'Sơ mi' },
        'Áo kiểu nữ':    { 'category.level1': 'NỮ', 'category.level2': 'Áo', 'category.level3': 'Kiểu' },
        'Áo khoác nữ':   { 'category.level1': 'NỮ', 'category.level2': 'Áo', 'category.level3': 'Khoác' },
        'Váy ngắn nữ':   { 'category.level1': 'NỮ', 'category.level2': 'Váy', 'category.level3': 'Ngắn' },
        'Váy dài nữ':    { 'category.level1': 'NỮ', 'category.level2': 'Váy', 'category.level3': 'Dài' },
        'Váy body nữ':   { 'category.level1': 'NỮ', 'category.level2': 'Váy', 'category.level3': 'Body' },
        'Quần nữ':       { 'category.level1': 'NỮ', 'category.level2': 'Quần' },
        // === UNISEX ===
        'Áo thun unisex':  { 'category.level1': 'UNISEX', 'category.level2': 'Áo', 'category.level3': 'Thun' },
        'Hoodie unisex':   { 'category.level1': 'UNISEX', 'category.level2': 'Áo', 'category.level3': 'Hoodie' },
        'Áo khoác unisex': { 'category.level1': 'UNISEX', 'category.level2': 'Áo', 'category.level3': 'Khoác' },
        // === PHỤ KIỆN & GIÀY DÉP ===
        'Giày dép nam':    { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP', 'category.level2': 'Giày dép', 'category.level3': 'Nam' },
        'Giày dép nữ':     { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP', 'category.level2': 'Giày dép', 'category.level3': 'Nữ' },
        'Giày dép unisex':  { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP', 'category.level2': 'Giày dép', 'category.level3': 'Unisex' },
        'Mũ nam':          { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP', 'category.level2': 'Phụ kiện Nam', 'category.level3': 'Mũ' },
        'Thắt lưng nam':   { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP', 'category.level2': 'Phụ kiện Nam', 'category.level3': 'Thắt lưng' },
        'Ví nam':          { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP', 'category.level2': 'Phụ kiện Nam', 'category.level3': 'Ví' },
        'Kính nam':        { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP', 'category.level2': 'Phụ kiện Nam', 'category.level3': 'Kính' },
        'Trang sức nam':   { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP', 'category.level2': 'Phụ kiện Nam', 'category.level3': 'Trang sức' },
        'Túi xách nữ':    { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP', 'category.level2': 'Phụ kiện Nữ', 'category.level3': 'Túi xách' },
        'Mũ nữ':          { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP', 'category.level2': 'Phụ kiện Nữ', 'category.level3': 'Mũ' },
        'Kính nữ':        { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP', 'category.level2': 'Phụ kiện Nữ', 'category.level3': 'Kính' },
        'Trang sức nữ':   { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP', 'category.level2': 'Phụ kiện Nữ', 'category.level3': 'Trang sức' },
        'Khăn nữ':        { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP', 'category.level2': 'Phụ kiện Nữ', 'category.level3': 'Khăn' },
        'Phụ kiện unisex': { 'category.level1': 'PHỤ KIỆN & GIÀY DÉP', 'category.level2': 'Phụ kiện', 'category.level3': 'Unisex' },
    };

    filter() {
        const queryCopy = { ...this.queryStr };

        // Bước 1: Xóa các field không phải filter
        const removeFields = ["keyword", "page", "limit", "sort"];
        removeFields.forEach(key => delete queryCopy[key]);

        // Bước 2: Xử lý category → map sang query 3 cấp
        // Frontend gửi: category=Áo thun nam (string)
        // DB lưu: category: { level1: "NAM", level2: "Áo", level3: "Thun" } (object)
        let categoryQuery = {};
        if (queryCopy.category) {
            const rawCategory = String(queryCopy.category).trim();
            const normalizedCategory = rawCategory.toLowerCase();
            const mapped = APIFunctionality.CATEGORY_MAP[rawCategory] || APIFunctionality.CATEGORY_MAP[normalizedCategory];
            if (mapped) {
                categoryQuery = { ...mapped };
            } else {
                // Fallback: tìm kiếm gần đúng trên level3
                categoryQuery = {
                    'category.level3': { $regex: rawCategory, $options: 'i' }
                };
            }
            delete queryCopy.category;
        }

        // Bước 3: Xử lý stock=true → chỉ lấy sản phẩm còn hàng
        if (queryCopy.stock === "true") {
            queryCopy.stock = { $gt: 0 };
        } else {
            delete queryCopy.stock;
        }

        // Bước 4: Convert operators cho price, ratings
        // Express parse: price[gte]=100 → { price: { gte: "100" } }
        // MongoDB cần:                  → { price: { $gte: 100 } }
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);

        const queryObj = JSON.parse(queryStr);

        // Bước 4: Convert string numbers thành Number cho MongoDB
        // Vì query params đến dưới dạng string: "100000" → cần convert thành 100000
        const convertToNumber = (obj) => {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    convertToNumber(obj[key]);
                } else if (!isNaN(obj[key]) && typeof obj[key] === 'string' && obj[key].trim() !== '') {
                    obj[key] = Number(obj[key]);
                }
            }
        };
        convertToNumber(queryObj);

        // Merge category query (đã map) với các filter khác
        this.query = this.query.find({ ...queryObj, ...categoryQuery });
        return this;
    }

    // ──────────────────────────────────────────────
    // 3. SORT — Sắp xếp kết quả
    //
    // URL examples:
    //   ?sort=price       → .sort({ price: 1 })   = tăng dần (rẻ → đắt)
    //   ?sort=-price      → .sort({ price: -1 })   = giảm dần (đắt → rẻ)
    //   ?sort=-createdAt  → .sort({ createdAt: -1 })= mới nhất
    //   ?sort=price,-createdAt → sort theo nhiều field
    //
    // Nếu không có sort → mặc định sort theo ngày tạo mới nhất
    // ──────────────────────────────────────────────
    sort() {
        if (this.queryStr.sort) {
            // Cho phép sort nhiều field: "price,-createdAt" → "price -createdAt"
            const sortBy = this.queryStr.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            // Mặc định: sản phẩm mới nhất lên trước
            this.query = this.query.sort("-createdAt");
        }
        return this;
    }

    // ──────────────────────────────────────────────
    // 4. PAGINATION — Phân trang
    //
    // URL: ?page=2
    // Logic: skip = resultPerPage * (page - 1)
    //   Page 1: skip 0, lấy 10 sản phẩm đầu
    //   Page 2: skip 10, lấy 10 sản phẩm tiếp
    // ──────────────────────────────────────────────
    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}

export default APIFunctionality;
