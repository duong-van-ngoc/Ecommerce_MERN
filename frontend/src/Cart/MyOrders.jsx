import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyOrders } from "../features/orders/orderSlice";
import { Link } from "react-router-dom";

import PageTitle from "../components/PageTitle";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AccountSidebar from "../components/AccountSidebar";
import "../CartStyles/MyOrders.css";

// Các tab trạng thái
const STATUS_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ thanh toán" },
  { id: "shipping", label: "Đang Giao" },
  { id: "delivered", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

// Chuẩn hóa status 
const normalizeStatus = (status) => {
  if (!status) return "pending";
  const s = status.toLowerCase().trim();

  if (s.includes("chờ") || s.includes("cho xu ly") || s.includes("pending") || s === "chờ xử lý") {
    return "pending";
  }
  if (s.includes("đang giao") || s.includes("dang giao") || s.includes("shipping")) {
    return "shipping";
  }
  if (s.includes("đã giao") || s.includes("da giao") || s.includes("delivered") || s.includes("hoàn thành")) {
    return "delivered";
  }
  if (s.includes("đã hủy") || s.includes("da huy") || s.includes("cancelled")) {
    return "cancelled";
  }

  return "pending";
};

function MyOrders() {
  const dispatch = useDispatch();
  const [currentTab, setCurrentTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { orders = [], loading, error } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  // Lọc và sắp xếp đơn hàng
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (currentTab !== "all") {
      result = result.filter((order) => normalizeStatus(order.orderStatus) === currentTab);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order._id?.toLowerCase().includes(query) ||
          order.orderItems?.some((item) => item.name?.toLowerCase().includes(query))
      );
    }

    return result;
  }, [orders, currentTab, searchQuery]);

  const formatVND = (n) => new Intl.NumberFormat("vi-VN").format(n || 0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status) => {
    const normalized = normalizeStatus(status);
    const configs = {
      pending: { bg: "#fff7e6", color: "#fa8c16", text: "CHỜ XỬ LÝ", statusText: "" },
      shipping: { bg: "#e6f7ff", color: "#1890ff", text: "ĐANG GIAO", statusText: "Đang trên đường giao đến bạn" },
      delivered: { bg: "#dcf8eb", color: "#00ab56", text: "HOÀN THÀNH", statusText: "Giao hàng thành công" },
      cancelled: { bg: "#ffe6e6", color: "#ee4d2d", text: "ĐÃ HỦY", statusText: "Đơn hàng đã bị hủy" },
    };
    return configs[normalized] || { bg: "#f5f5f5", color: "#666", text: status, statusText: "" };
  };


  const getItemImage = (item) =>
    item?.image || item?.images?.[0]?.url || item?.images?.[0] || "";

  return (
    <>
      <PageTitle title="Đơn hàng của tôi" />
      <Navbar />

      <div className="my-orders-page">
        <div className="orders-page-layout">
         
          <AccountSidebar />

         
          <div className="orders-main-content">
           
            <div className="orders-header-section">
              
             
              <div className="orders-tab-bar">
                {STATUS_TABS.map((tab) => (
                  <div
                    key={tab.id}
                    className={`tab-item ${currentTab === tab.id ? "active" : ""}`}
                    onClick={() => setCurrentTab(tab.id)}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="orders-search-section">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Bạn có thể tìm kiếm theo ID đơn hàng hoặc Tên Sản phẩm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="orders-error">⚠️ {typeof error === 'string' ? error : 'Có lỗi xảy ra'}</div>
            )}

            <div className="orders-container">
              {loading ? (
                <div className="orders-loading">
                  <div className="spinner"></div>
                  <p>Đang tải đơn hàng...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="orders-empty">
                  <div className="empty-icon">📦</div>
                  <h3>{searchQuery ? "Không tìm thấy đơn hàng phù hợp" : "Chưa có đơn hàng"}</h3>
                  <p>{searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Hãy mua sắm để có đơn hàng đầu tiên!"}</p>
                  {!searchQuery && (
                    <Link to="/products" className="btn-shop-now">Mua sắm ngay</Link>
                  )}
                </div>
              ) : (
                <div className="orders-list">
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.orderStatus);

                    return (
                      <div className="order-card" key={order._id}>
                        <div className="order-shop-header">
                          <div className="shop-info">
                            <span className="shop-name">{user?.name || "Shop"}</span>
                          </div>
                          <div className="order-status-info">
                            {statusConfig.statusText && (
                              <span className="status-text" style={{ color: statusConfig.color }}>
                                {statusConfig.statusText}
                              </span>
                            )}
                            <span className="status-badge" style={{ background: statusConfig.bg, color: statusConfig.color }}>
                              {statusConfig.text}
                            </span>
                          </div>
                        </div>

                        <div className="order-products">
                          {order.orderItems?.map((item, idx) => (
                            <div className="product-item" key={idx}>
                              <img
                                src={getItemImage(item)}
                                alt={item.name}
                                className="product-image"
                                onError={(e) => {
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23f5f5f5' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24'%3E📦%3C/text%3E%3C/svg%3E";
                                }}
                              />
                              <div className="product-info">
                                <div className="product-name">{item.name}</div>
                                <div className="product-quantity">x{item.quantity}</div>
                              </div>
                              <div className="product-prices">
                                {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                                  <div className="original-price">₫{formatVND(item.originalPrice)}</div>
                                )}
                                <div className="current-price">₫{formatVND(item.price)}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="order-card-footer">
                          <div className="footer-left">
                            <span className="order-date">🕐 {formatDate(order.createdAt)}</span>
                          </div>
                          <div className="footer-right">
                            <span className="total-label">Thành tiền:</span>
                            <span className="total-price">₫{formatVND(order.totalPrice)}</span>
                          </div>
                        </div>

                        <div className="order-actions">
                          {normalizeStatus(order.orderStatus) === "delivered" && (
                            <button className="btn-rebuy">Mua Lại</button>
                          )}
                          <Link to={`/order/${order._id}`} className="btn-detail">Xem Chi Tiết</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default MyOrders;
