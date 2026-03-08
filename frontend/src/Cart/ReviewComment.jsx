import React, { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { FiArrowLeft, FiCamera, FiVideo, FiInfo, FiAlertCircle, FiCheck, FiChevronRight } from "react-icons/fi";
import { FaStar, FaCoins } from "react-icons/fa";
import "../CartStyles/ReviewComment.css";

// ====== Cấu hình ======
const RATING_LABELS = {
    1: "Tệ",
    2: "Không hài lòng",
    3: "Bình thường",
    4: "Hài lòng",
    5: "Tuyệt vời",
};

const SUGGESTION_TAGS = [
    "Đúng với mô tả",
    "Chất lượng sản phẩm",
    "Giao hàng nhanh",
    "Đóng gói cẩn thận",
    "Giá cả hợp lý",
];

/**
 * ReviewComment — Modal đánh giá sản phẩm
 *
 * Props:
 * @param {boolean}  isOpen    — Hiện/ẩn modal
 * @param {function} onClose   — Callback đóng modal
 * @param {object}   product   — { _id, name, images, category }
 * @param {string}   orderId   — ID đơn hàng (tuỳ chọn)
 * @param {function} onSuccess — Callback khi gửi đánh giá thành công
 */
function ReviewComment({ isOpen, onClose, product, orderId, onSuccess }) {
    // ====== State ======
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [showUsername, setShowUsername] = useState(true);
    const [sellerRating, setSellerRating] = useState(5);
    const [shippingRating, setShippingRating] = useState(5);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // ====== Redux ======
    const { user } = useSelector((state) => state.user);

    // ====== Derived ======
    const displayRating = hoverRating || rating;
    const ratingLabel = RATING_LABELS[displayRating] || "";

    const productImage = useMemo(() => {
        if (!product) return "";
        return product.images?.[0]?.url || product.images?.[0] || product.image || "";
    }, [product]);

    const maskedName = useMemo(() => {
        if (!user?.name) return "***";
        const name = user.name;
        if (name.length <= 2) return name[0] + "*";
        return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
    }, [user]);

    // ====== Handlers ======
    const handleTagToggle = useCallback((tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!product?._id) return;
        if (rating === 0) {
            setError("Vui lòng chọn số sao đánh giá");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const tagText = selectedTags.length > 0 ? selectedTags.join(", ") + ". " : "";
            const finalComment = (tagText + comment).trim() || RATING_LABELS[rating];

            await axios.put("/api/v1/review", {
                rating: Number(rating),
                comment: finalComment,
                productId: product._id,
            });

            setSuccess(true);
            onSuccess?.();
        } catch (err) {
            const msg = err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [product, rating, comment, selectedTags, onSuccess]);

    const handleClose = useCallback(() => {
        setRating(5);
        setHoverRating(0);
        setComment("");
        setSelectedTags([]);
        setShowUsername(true);
        setSellerRating(5);
        setShippingRating(5);
        setError("");
        setSuccess(false);
        onClose?.();
    }, [onClose]);

    // ====== Early return ======
    if (!isOpen) return null;

    // ====== Success State ======
    if (success) {
        return (
            <div className="rc-success-overlay" onClick={handleClose}>
                <div className="rc-success-card" onClick={(e) => e.stopPropagation()}>
                    <div className="rc-success-icon-circle">
                        <FiCheck size={32} />
                    </div>
                    <h3 className="rc-success-title">Cảm ơn bạn!</h3>
                    <p className="rc-success-desc">Đánh giá của bạn đã được gửi thành công.</p>
                    <button className="rc-success-btn" onClick={handleClose}>
                        Đóng
                    </button>
                </div>
            </div>
        );
    }

    // ====== Render Stars Helper ======
    const renderStars = (count, currentRating, onStarClick, size = 36) => {
        return Array.from({ length: count }, (_, i) => {
            const value = i + 1;
            const isActive = value <= currentRating;
            const isMain = size > 24;

            return (
                <button
                    key={value}
                    className={isMain ? "rc-star-btn" : "rc-service-star-btn"}
                    onClick={() => onStarClick(value)}
                    onMouseEnter={isMain ? () => setHoverRating(value) : undefined}
                    onMouseLeave={isMain ? () => setHoverRating(0) : undefined}
                    type="button"
                    aria-label={`${value} sao`}
                >
                    <FaStar
                        size={size}
                        className={`${isMain ? "rc-star-icon" : "rc-service-star-icon"} ${isActive ? "active" : ""}`}
                    />
                </button>
            );
        });
    };

    return (
        <div className="rc-overlay" onClick={handleClose}>
            <div className="rc-container" onClick={(e) => e.stopPropagation()}>

                {/* ===== Header ===== */}
                <header className="rc-header">
                    <div className="rc-header-left">
                        <button className="rc-back-btn" onClick={handleClose} type="button" aria-label="Quay lại">
                            <FiArrowLeft size={20} />
                        </button>
                        <h2 className="rc-title">Đánh giá sản phẩm</h2>
                    </div>
                    <button className="rc-help-btn" type="button">Trợ giúp</button>
                </header>

                {/* ===== Scrollable Body ===== */}
                <div className="rc-body">

                    {/* Coin Banner */}
                    <div className="rc-coin-banner">
                        <div className="rc-coin-banner-left">
                            <FaCoins size={22} color="#ec5b13" />
                            <p className="rc-coin-text">
                                Xem hướng dẫn đánh giá chuẩn để nhận đến{" "}
                                <span className="rc-coin-highlight">200 xu</span>
                            </p>
                        </div>
                        <FiChevronRight size={20} color="#94a3b8" />
                    </div>

                    {/* Product Info */}
                    {product && (
                        <div className="rc-product-info">
                            <img
                                src={productImage}
                                alt={product.name}
                                className="rc-product-image"
                                onError={(e) => {
                                    e.target.src =
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23f1f5f9' width='64' height='64' rx='10'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24'%3E📦%3C/text%3E%3C/svg%3E";
                                }}
                            />
                            <div className="rc-product-details">
                                <h3 className="rc-product-name">{product.name}</h3>
                                {product.category && (
                                    <span className="rc-product-variant">Phân loại: {product.category}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Star Rating */}
                    <div className="rc-rating-section">
                        <div className="rc-stars-row">
                            {renderStars(5, displayRating, setRating, 36)}
                        </div>
                        <span className="rc-rating-label">{ratingLabel}</span>
                    </div>

                    {/* Review Form */}
                    <div className="rc-form">
                        {/* Suggestion Tags */}
                        <div className="rc-tags">
                            {SUGGESTION_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    className={`rc-tag ${selectedTags.includes(tag) ? "selected" : ""}`}
                                    onClick={() => handleTagToggle(tag)}
                                    type="button"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {/* Textarea */}
                        <div className="rc-textarea-wrapper">
                            <textarea
                                className="rc-textarea"
                                placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này với những người mua khác nhé."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                maxLength={500}
                            />
                            <span className="rc-textarea-counter">{comment.length}/500</span>
                        </div>

                        {/* Media Buttons */}
                        <div className="rc-media-row">
                            <button className="rc-media-btn" type="button">
                                <FiCamera size={24} color="#ec5b13" />
                                <span className="rc-media-label">Thêm hình ảnh</span>
                            </button>
                            <button className="rc-media-btn" type="button">
                                <FiVideo size={24} color="#ec5b13" />
                                <span className="rc-media-label">Thêm Video</span>
                            </button>
                        </div>

                        {/* Coin Hint */}
                        <div className="rc-coin-hint">
                            <FiInfo size={16} color="#94a3b8" />
                            <p>Thêm 50 ký tự và 1 hình ảnh và 1 video để nhận 200 xu</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rc-error-msg">
                                <FiAlertCircle size={18} />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Anonymous Toggle */}
                    <div className="rc-anon-section">
                        <div className="rc-anon-left">
                            <input
                                type="checkbox"
                                id="rc-anon-check"
                                className="rc-anon-checkbox"
                                checked={showUsername}
                                onChange={(e) => setShowUsername(e.target.checked)}
                            />
                            <label htmlFor="rc-anon-check" className="rc-anon-label">
                                Hiển thị tên đăng nhập trên đánh giá này
                            </label>
                        </div>
                        <span className="rc-anon-preview">Tên bạn sẽ hiển thị là {maskedName}</span>
                    </div>

                    {/* Service Ratings */}
                    <div className="rc-service-section">
                        <div className="rc-service-row">
                            <span className="rc-service-name">Dịch vụ của người bán</span>
                            <div className="rc-service-right">
                                <div className="rc-service-stars">
                                    {renderStars(5, sellerRating, setSellerRating, 20)}
                                </div>
                                <span className="rc-service-label">{RATING_LABELS[sellerRating]}</span>
                            </div>
                        </div>
                        <div className="rc-service-row">
                            <span className="rc-service-name">Dịch vụ vận chuyển</span>
                            <div className="rc-service-right">
                                <div className="rc-service-stars">
                                    {renderStars(5, shippingRating, setShippingRating, 20)}
                                </div>
                                <span className="rc-service-label">{RATING_LABELS[shippingRating]}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ===== Footer ===== */}
                <footer className="rc-footer">
                    <button className="rc-btn-back" onClick={handleClose} type="button">
                        Trở lại
                    </button>
                    <button
                        className="rc-btn-submit"
                        onClick={handleSubmit}
                        disabled={loading || rating === 0}
                        type="button"
                    >
                        {loading ? (
                            <span className="rc-btn-submit-loading">
                                <span className="rc-submit-spinner" />
                                Đang gửi...
                            </span>
                        ) : (
                            "Hoàn Thành"
                        )}
                    </button>
                </footer>

            </div>
        </div>
    );
}

export default ReviewComment;
