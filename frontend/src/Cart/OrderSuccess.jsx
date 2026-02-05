import React from "react";
import { useNavigate } from "react-router-dom";
import "../CartStyles/OrderSuccess.css";

const defaultConfig = {
  success_title: "Đặt hàng thành công",
  success_message:
    "Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất!",
  button_text: "Đi tới trang Đơn đặt hàng",
};

/**
 * OrderSuccess - Popup xác nhận đặt hàng thành công
 * 
 * @param {string} orderId - Mã đơn hàng từ server
 * @param {function} onClose - Callback khi đóng popup
 */
function OrderSuccess({ orderId, onClose }) {
  const navigate = useNavigate();

  const goToOrders = () => {
    if (onClose) {
      onClose(); // Đóng popup
    }
    navigate("/orders/user");
  };

  const handleBackdropClick = (e) => {
    // Chỉ đóng khi click vào backdrop, không phải popup content
    if (e.target.className === 'os-backdrop') {
      if (onClose) onClose();
    }
  };

  return (
    <div className="os-backdrop" onClick={handleBackdropClick}>
      <div className="os-popup">
        <button
          className="os-close"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="os-checkwrap">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            className="os-checkicon"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="os-title">{defaultConfig.success_title}</h1>

        <p className="os-message">{defaultConfig.success_message}</p>

        <p className="os-orderid">
          Mã đơn hàng: <strong>{orderId ? `#${orderId.slice(-6)}` : "Xem tại trang Đơn hàng"}</strong>
        </p>

        <button className="os-btn" type="button" onClick={goToOrders}>
          {defaultConfig.button_text}
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;
