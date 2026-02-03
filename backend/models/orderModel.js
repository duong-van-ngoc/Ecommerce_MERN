import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pinCode: { type: Number, required: true },
    phoneNo: { type: Number, required: true },
  },

  orderItems: [
    {
      name: { type: String, required: true },
      price: { type: String, required: true }, // (khuyến nghị đổi sang Number)
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "product",
        required: true,
      },
    },
  ],

  orderStatus: {
  type: String,
  required: true,
  default: "Chờ xử lý",
},

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  paymentInfo: {
    method: {
      type: String,
      enum: ["COD", "MOMO"],
      default: "COD",
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    // info riêng momo bạn đang có
    provider: { type: String }, // momo
    transId: { type: String },
    resultCode: { type: String },
    message: { type: String },
    amount: { type: String },
    payType: { type: String },
  },

  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },

  itemPrice: { type: Number, required: true, default: 0 },
  taxPrice: { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true, default: 0 },

  deliveredAt: Date,

  createdAt: { type: Date, default: Date.now }, // đổi từ createAt -> createdAt
});

export default mongoose.model("Order", orderSchema);
