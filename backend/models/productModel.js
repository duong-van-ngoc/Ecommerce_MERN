
// Mô hình dữ liệu sản phẩm
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({ // tạo schema cho sản phẩm
    name: {
        // tên sản phẩm
        type: String,
        required: [true, "Nhập tên sản sản phẩm"],
        trim: true,
        maxLength: [100, "Tên sản phẩm không được vượt quá 100 ký tự"]
    },
    description: { // mô tả sản phẩm
        type: String,
        required: [true, "Nhập mô tả sản phẩm"]
    },
    // --- NHÓM GIÁ & KHO ---
    price: { // giá bán (sau khi giảm)
        type: Number,
        required: [true, "Nhập giá sản phẩm"],
        maxLength: [10, "Giá sản phẩm không được vượt quá 10 ký tự"]
    },
    originalPrice: { // giá gốc (để hiện gạch ngang)
        type: Number,
        default: 0
    },
    stock: { // số lượng tồn kho
        type: Number,
        required: [true, "Nhập số lượng sản phẩm"],
        maxLength: [10, "Số lượng sản phẩm không được vượt quá 10 ký tự"],
        default: 1
    },
    sold: { // số lượng đã bán (social proof)
        type: Number,
        default: 0
    },

    category: { // danh mục 3 cấp (vd: Nam -> Áo -> Sơ mi)
        level1: {
            type: String,
            required: [true, "Nhập danh mục cấp 1 (Nam/Nữ/Unisex/Phụ kiện...)"]
        },
        level2: {
            type: String,
            required: [true, "Nhập danh mục cấp 2 (Áo/Quần/Giày...)"]
        },
        level3: {
            type: String,
            required: [true, "Nhập danh mục cấp 3 (Thun/Sơ mi...)"]
        }
    },
    brand: { // thương hiệu
        type: String,
        default: "No Brand"
    },
    material: { // chất liệu (Cotton, Len...)
        type: String,
        default: ""
    },
    sizes: [ // mảng các size có sẵn: ["S", "M", "L"]
        { type: String }
    ],
    colors: [ // mảng các màu có sẵn: ["Red", "Blue"]
        { type: String }
    ],

    // --- HÌNH ẢNH & ĐÁNH GIÁ ---
    ratings: { // đánh giá trung bình của sản phẩm
        type: Number,
        default: 0
    },
    images: [// hình ảnh sản phẩm
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],

    numOfReviews: { // số lượng đánh giá của sản phẩm
        type: Number,
        default: 0
    },

    reviews: [ // đánh giá của sản phẩm
        {
            user: { // id người dùng đánh giá
                type: mongoose.Schema.ObjectId, // tham chiếu đến bảng User
                ref: "User",
                required: true
            },
            name: { // tên người dùng đánh giá
                type: String,
                required: true
            },
            rating: { // số sao đánh giá
                type: Number,
                required: true
            },
            comment: { // bình luận đánh giá
                type: String,
                required: true
            },
            images: [
                {
                    public_id: { type: String, required: true },
                    url: { type: String, required: true }
                }
            ]
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: { // ngày tạo sản phẩm
        type: Date,
        default: Date.now
    }

})

export default mongoose.model("Product", productSchema); // xuất model Product để sử dụng ở các file khác
// Product: tên model, productSchema: schema của model