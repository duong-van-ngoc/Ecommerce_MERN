import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
        unique: true // Mỗi user chỉ có 1 giỏ hàng duy nhất trong DB
    },
    items: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                required: true
            },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            image: { type: String, required: true },
            stock: { type: Number, required: true },
            quantity: {
                type: Number,
                required: true,
                min: [1, "Số lượng phải ít nhất là 1"],
                default: 1
            },
            size: { type: String },
            color: { type: String }
        }
    ],
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);
