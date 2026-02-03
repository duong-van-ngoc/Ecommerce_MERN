import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyOrders } from "../features/orders/orderSlice"; // sửa path đúng theo project bạn
import { Link } from "react-router-dom";

import PageTitle from "../components/PageTitle";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


function MyOrders() {
  const dispatch = useDispatch();

  const { orders = [], myOrdersLoading, myOrdersError } = useSelector(
    (state) => state.order
  );

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  const sortedOrders = useMemo(() => {
    const list = [...orders];
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [orders]);

  const formatVND = (n) => Number(n || 0).toLocaleString("vi-VN") + " đ";

  const getPaymentLabel = (o) => {
    const method = o?.paymentInfo?.method || "COD";
    const status = o?.paymentInfo?.status || "PENDING";
    if (method === "COD") return status === "PAID" || o?.isPaid ? "Đã thanh toán" : "Chưa thanh toán (COD)";
    return status === "PAID" || o?.isPaid ? "Đã thanh toán" : "Chờ thanh toán";
  };

  return (
    <>
      <PageTitle title="Đơn hàng của tôi" />
      <Navbar />

      <div style={{ maxWidth: 1100, margin: "30px auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0 }}>📦 Đơn hàng của tôi</h1>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => dispatch(getMyOrders())}
              disabled={myOrdersLoading}
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
            >
              {myOrdersLoading ? "Đang tải..." : "Refresh"}
            </button>

            <Link
              to="/"
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", textDecoration: "none" }}
            >
              Về trang chủ
            </Link>
          </div>
        </div>

        {myOrdersError ? (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#ffecec", border: "1px solid #ffb7b7", color: "#b00020" }}>
            {myOrdersError}
          </div>
        ) : null}

        {myOrdersLoading ? (
          <div style={{ marginTop: 14, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
            Đang tải đơn hàng...
          </div>
        ) : sortedOrders.length === 0 ? (
          <div style={{ marginTop: 14, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
            Bạn chưa có đơn hàng nào.
          </div>
        ) : (
          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            {sortedOrders.map((o) => (
              <div key={o._id} style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>Mã đơn: {o._id}</div>
                    <div style={{ color: "#666" }}>
                      Ngày tạo: {new Date(o.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #ddd", borderRadius: 999, padding: "6px 10px" }}>
                    🚚 {o.orderStatus || "Chờ xử lý"}
                  </div>
                </div>

                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                  <div style={{ border: "1px dashed #eee", borderRadius: 12, padding: 12 }}>
                    <div style={{ color: "#666" }}>Thanh toán</div>
                    <div style={{ fontWeight: 800, marginTop: 6 }}>{getPaymentLabel(o)}</div>
                    <div style={{ color: "#666", marginTop: 6 }}>Method: {o?.paymentInfo?.method || "COD"}</div>
                  </div>

                  <div style={{ border: "1px dashed #eee", borderRadius: 12, padding: 12 }}>
                    <div style={{ color: "#666" }}>Tổng tiền</div>
                    <div style={{ fontWeight: 900, fontSize: 18, marginTop: 6 }}>{formatVND(o.totalPrice)}</div>
                    <div style={{ color: "#666", marginTop: 6 }}>
                      Sản phẩm: {Array.isArray(o.orderItems) ? o.orderItems.length : 0}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default MyOrders;
