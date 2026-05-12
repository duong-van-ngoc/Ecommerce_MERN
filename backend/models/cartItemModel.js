import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    cart_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Cart",
      required: [true, "Cart item must belong to a cart"],
    },
    product_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Cart item must reference a product"],
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    priceSnapshot: {
      type: Number,
      required: true,
      default: function () {
        return this.price;
      },
    },
    originalPriceSnapshot: {
      type: Number,
      default: function () {
        return this.price;
      },
    },
    pricingType: {
      type: String,
      enum: ["normal", "flash_sale"],
      default: "normal",
    },
    flashSaleId: {
      type: mongoose.Schema.ObjectId,
      ref: "FlashSale",
      default: null,
    },
    flashSaleItemId: {
      type: mongoose.Schema.ObjectId,
      ref: "FlashSaleItem",
      default: null,
    },
    campaignEndAt: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    size: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.CartItem || mongoose.model("CartItem", cartItemSchema);
