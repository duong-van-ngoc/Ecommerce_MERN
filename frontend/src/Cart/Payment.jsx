import React, { useMemo, useState } from "react";
import "../CartStyles/Payment.css";
import PageTitle from "../components/PageTitle";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CheckoutPath from "./CheckoutPath";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

function Payment() {
  const navigate = useNavigate();
  const { shippingInfo, cartItems = [] } = useSelector((state) => state.cart);

  const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo") || "{}");

  const shippingInfoPayload = {
    address: shippingInfo?.address || "",
    city: shippingInfo?.city || shippingInfo?.provinceName || "",
    state: shippingInfo?.state || shippingInfo?.districtName || "",
    country: shippingInfo?.country || "Việt Nam",
    pinCode: Number(shippingInfo?.pinCode || 0),
    phoneNo: Number(shippingInfo?.phoneNo || shippingInfo?.phoneNumber || 0),
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    if (orderInfo && typeof orderInfo.total === "number") {
      return {
        itemPrice: orderInfo.subtotal ?? orderInfo.itemPrice ?? 0,
        taxPrice: orderInfo.tax ?? orderInfo.taxPrice ?? 0,
        shippingPrice: orderInfo.shippingCharges ?? orderInfo.shippingPrice ?? 0,
        totalPrice: orderInfo.total ?? orderInfo.totalPrice ?? 0,
      };
    }

    const itemPrice = cartItems.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0
    );
    const taxPrice = itemPrice * 0.1;
    const shippingPrice = itemPrice >= 500000 ? 0 : 30000;
    const totalPrice = itemPrice + taxPrice + shippingPrice;
    return { itemPrice, taxPrice, shippingPrice, totalPrice };
  }, [orderInfo, cartItems]);

  const getItemImage = (item) =>
    item?.image || item?.images?.[0]?.url || item?.images?.[0] || item?.thumbnail || "";

  const placeOrderCOD = async () => {
    setError("");

    // check tối thiểu
    if (!shippingInfoPayload.address || !shippingInfoPayload.city || !shippingInfoPayload.state) {
      setError("Thiếu thông tin giao hàng (địa chỉ/tỉnh/quận).");
      return;
    }
    if (cartItems.length === 0) {
      setError("Giỏ hàng trống.");
      return;
    }

    setLoading(true);
    try {
  const payload = {
    shippingInfo: shippingInfoPayload,
    orderItems: cartItems.map((item) => ({
      name: item.name,
      price: String(item.price),
      quantity: item.quantity,
      image: getItemImage(item),
      product: item.product || item._id,
    })),
    itemPrice: totals.itemPrice,
    taxPrice: totals.taxPrice,
    shippingPrice: totals.shippingPrice,
    totalPrice: totals.totalPrice,
  };

  const { data } = await axios.post("/api/v1/order/new", payload, {
    withCredentials: true,
  });

  // ✅ lấy orderId từ response (2 kiểu đều hỗ trợ)
  const orderId = data?.orderId || data?.order?._id;

  // dọn dữ liệu
  sessionStorage.removeItem("orderInfo");
  localStorage.removeItem("cartItems");

  // ✅ điều hướng sang trang success để hiện mã đơn
  if (!orderId) {
    console.log("Create order response (missing orderId):", data);
    navigate("/orders/me");
    return;
  }

  navigate(`/order/success?orderId=${orderId}`);
} catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Đặt hàng thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const displayTotal = typeof orderInfo?.total === "number" ? orderInfo.total : totals.totalPrice;

  return (
    <>
      <PageTitle title="Payment" />
      <Navbar />
      <CheckoutPath activePath={2} />

      <div className="payment-container">
        <Link to="/order/confirm" className="payment-go-back">
          Quay lại
        </Link>

        {error ? <p style={{ color: "red", marginTop: 10 }}>{error}</p> : null}

        <button className="payment-btn" onClick={placeOrderCOD} disabled={loading}>
          {loading ? "Đang tạo đơn..." : `Thanh toán khi nhận hàng (${displayTotal})`}
        </button>
      </div>

      <Footer />
    </>
  );
}

export default Payment;
