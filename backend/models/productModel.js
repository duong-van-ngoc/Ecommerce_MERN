
// Mô hình dữ liệu sản phẩm
import mongoose  from "mongoose";   

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
    price: { // giá sản phẩm
        type: Number,
        required: [true, "Nhập giá sản phẩm"],
        maxLength: [10, "Giá sản phẩm không được vượt quá 10 ký tự"]
    },
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

    category: { // danh mục sản phẩm
        type: String,
        required: [true, "Nhập danh mục sản phẩm"]
    },
    stock: { // số lượng sản phẩm trong kho
        type: Number,
        required: [true, "Nhập số lượng sản phẩm"],
        maxLength: [10, "Số lượng sản phẩm không được vượt quá 10 ký tự"],
        default: 1
    },
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
            }
        }
    ],
    createdAt: { // ngày tạo sản phẩm
        type: Date,
        default: Date.now
    }

})

export default mongoose.model("Product", productSchema); // xuất model Product để sử dụng ở các file khác
                                                        // Product: tên model, productSchema: schema của model