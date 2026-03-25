/**
 * ============================================================================
 * COMPONENT: MyOrders
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `MyOrders` trong ứng dụng.
 * 
 * 2. Props: 
 *    - Không nhận trực tiếp props truyền từ cha.
 * 
 * 3. State:
 *    - Local State (quản lý nội bộ qua useState).
 *      + Global State (lấy từ Redux qua useSelector).
 * 
 * 4. Render lại khi nào:
 *    - Khi Local State thay đổi.
 *    - Khi Global State (Redux) cập nhật.
 * 
 * 5. Event handling:
 *    - Có tương tác sự kiện (onClick, onChange, onSubmit...).
 * 
 * 6. Conditional rendering:
 *    - Sử dụng toán tử 3 ngôi (? :) hoặc `&&` để ẩn/hiện element hoặc component.
 * 
 * 7. List rendering:
 *    - Sử dụng `.map()` để render danh sách elements.
 * 
 * 8. Controlled input:
 *    - Có form input elements (có thể bị controlled bởi state).
 * 
 * 9. Lifting state up:
 *    - Dữ liệu được quản lý cục bộ hoặc đẩy lên Redux store toàn cục.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Component Mount -> Chạy useEffect (gọi API hoặc thiết lập timer/listener).
 *    - (2) Nhận State/Props và render UI ban đầu.
 *    - (3) End-User tương tác trên component -> Cập nhật State -> Re-render màn hình.
 * ============================================================================
 */
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyOrders } from "../features/orders/orderSlice";
import { Link } from "react-router-dom";
import { formatVND } from "../utils/formatCurrency";

import PageTitle from "../components/PageTitle";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AccountSidebar from "../components/AccountSidebar";
import ReviewComment from "./ReviewComment";
import "../CartStyles/MyOrders.css";

// Status tabs
const STATUS_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ thanh toán" },
  { id: "shipping", label: "Đang Giao" },
  { id: "delivered", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

// Normalize status
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
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewOrderId, setReviewOrderId] = useState(null);

  const { orders = [], loading, error } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  // Filter and sort orders
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
      pending: { className: "status-pending", text: "CHỜ XỬ LÝ", statusText: "" },
      shipping: { className: "status-shipping", text: "ĐANG GIAO", statusText: "Đang trên đường giao đến bạn" },
      delivered: { className: "status-delivered", text: "HOÀN THÀNH", statusText: "Giao hàng thành công" },
      cancelled: { className: "status-cancelled", text: "ĐÃ HỦY", statusText: "Đơn hàng đã bị hủy" },
    };
    return configs[normalized] || { className: "", text: status, statusText: "" };
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

          {/* Main Content */}
          <main className="orders-main-content">
            {/* Header with title + search */}
            <header className="orders-header-section">
              <div className="orders-header-top">
                <h1 className="orders-page-title">Đơn hàng của tôi</h1>
                <div className="orders-search-wrapper">
                  <span className="search-icon-box">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Tìm kiếm theo ID đơn hàng hoặc Tên sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Tab Bar */}
              <div className="orders-tab-bar">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    className={`tab-item ${currentTab === tab.id ? "active" : ""}`}
                    onClick={() => setCurrentTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </header>

            {/* Error */}
            {error && (
              <div className="orders-error">⚠️ {typeof error === 'string' ? error : 'Có lỗi xảy ra'}</div>
            )}

            {/* Scrollable Body */}
            <div className="orders-body">
              {loading ? (
                <div className="orders-loading">
                  <div className="spinner"></div>
                  <p>Đang tải đơn hàng...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                /* Empty State */
                <div className="orders-empty">
                  <div className="empty-icon-circle">
                    <svg className="empty-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="empty-title">
                    {searchQuery ? "Không tìm thấy đơn hàng phù hợp" : "Chưa có đơn hàng nào"}
                  </h3>
                  <p className="empty-desc">
                    {searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Hãy mua sắm để có đơn hàng đầu tiên!"}
                  </p>
                  {!searchQuery && (
                    <Link to="/products" className="btn-shop-now">Mua sắm ngay</Link>
                  )}
                </div>
              ) : (
                /* Orders List */
                <div className="orders-list">
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.orderStatus);
                    const normalized = normalizeStatus(order.orderStatus);

                    return (
                      <div className="order-card" key={order._id}>
                        {/* Order Header */}
                        <div className="order-card-header">
                          <div className="order-header-left">
                            <span className="shop-name">{user?.name || "Shop"}</span>
                            <span className="header-divider">|</span>
                            <span className={`status-badge ${statusConfig.className}`}>
                              {statusConfig.text}
                            </span>
                          </div>
                          <span className="order-id">ID: #{order._id?.slice(-8).toUpperCase()}</span>
                        </div>

                        {/* Product List */}
                        <div className="order-products">
                          {order.orderItems?.map((item, idx) => (
                            <div className="product-item" key={idx}>
                              <img
                                src={getItemImage(item)}
                                alt={item.name}
                                className="product-image"
                                onError={(e) => {
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23f1f5f9' width='80' height='80' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24'%3E📦%3C/text%3E%3C/svg%3E";
                                }}
                              />
                              <div className="product-info">
                                <h3 className="product-name">{item.name}</h3>
                                <p className="product-meta">Số lượng: {item.quantity}</p>
                                <p className="product-price-inline">{formatVND(item.price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="order-card-footer">
                          <div className="footer-date">
                            Đặt hàng ngày <span className="date-value">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="footer-actions-row">
                            <div className="total-block">
                              <span className="total-label">Tổng tiền</span>
                              <span className="total-price">{formatVND(order.totalPrice)}</span>
                            </div>
                            <div className="action-buttons">
                              <Link to={`/order/${order._id}`} className="btn-detail">Xem Chi Tiết</Link>
                              {normalized === "delivered" && (
                                <>
                                  <button
                                    className="btn-review"
                                    onClick={() => {
                                      const firstItem = order.orderItems?.[0];
                                      if (firstItem) {
                                        setReviewProduct({
                                          _id: firstItem.productId || firstItem.product || firstItem._id,
                                          name: firstItem.name,
                                          images: firstItem.images || (firstItem.image ? [{ url: firstItem.image }] : []),
                                          category: firstItem.category || "",
                                        });
                                        setReviewOrderId(order._id);
                                      }
                                    }}
                                  >
                                    Đánh giá
                                  </button>
                                  <button className="btn-rebuy">Mua Lại</button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>

        </div>
      </div>

      <Footer />

      {/* Review Modal */}
      <ReviewComment
        isOpen={!!reviewProduct}
        onClose={() => {
          setReviewProduct(null);
          setReviewOrderId(null);
        }}
        product={reviewProduct}
        orderId={reviewOrderId}
        onSuccess={() => {
          dispatch(getMyOrders());
        }}
      />
    </>
  );
}

export default MyOrders;
