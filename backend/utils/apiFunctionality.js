
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
    filter() {
        const queryCopy = { ...this.queryStr };

        // Bước 1: Xóa các field không phải filter
        const removeFields = ["keyword", "page", "limit", "sort"];
        removeFields.forEach(key => delete queryCopy[key]);

        // Bước 2: Xử lý stock=true → chỉ lấy sản phẩm còn hàng
        // stock=true nghĩa là user muốn filter "Còn hàng" (stock > 0)
        if (queryCopy.stock === "true") {
            queryCopy.stock = { $gt: 0 };
        } else {
            // Nếu stock không phải "true", xóa nó (không filter theo stock)
            delete queryCopy.stock;
        }

        // Bước 3: Convert operators cho price, ratings
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

        this.query = this.query.find(queryObj);
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