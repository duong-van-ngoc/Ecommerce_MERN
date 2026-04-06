/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Trang Quản Lý Đơn Hàng (Orders Management Page).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là trung tâm điều phối và theo dõi toàn bộ quá trình mua sắm của khách hàng.
 *    - Cho phép Admin thay đổi trạng thái đơn hàng (từ Chờ xử lý -> Đang giao -> Đã giao) để hoàn tất quy trình bán hàng.
 *    - Cung cấp công cụ lọc và tìm kiếm đơn hàng theo Mã đơn hoặc Tên khách hàng để xử lý khiếu nại hoặc đối soát nhanh chóng.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Vận hành & Thực thi Đơn hàng (Order Fulfillment & Operations Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Inline Status Update Logic: Một kỹ thuật UX tuyệt vời. Thay vì phải vào trang chi tiết, Admin có thể đổi trạng thái đơn hàng ngay tại thẻ `<select>` trên bảng. Hệ thống sẽ tự động gọi API và cập nhật giao diện ngay lập tức mà không cần tải lại trang.
 *    - Multi-criteria Filtering: Kết hợp lọc theo từ khóa (Search) và lọc theo trạng thái (Dropdown) để tạo ra danh sách `filteredOrders`. Đây là cách xử lý dữ liệu phía Client (Client-side filtering) điển hình.
 *    - Dynamic Status Styling: Hàm `getStatusClass` sẽ gán các màu sắc đặc trưng cho từng trạng thái: Màu xanh lá cho "Đã giao" (thành công), màu đỏ cho "Đã hủy" (thất bại), giúp Admin nhận diện nhanh tình trạng đơn hàng bằng mắt thường.
 *    - String Manipulation (`slice`): Vì ID của MongoDB rất dài, file này sử dụng `.slice(-6)` để chỉ hiển thị 6 ký tự cuối của mã đơn (ví dụ: #A1B2C3), giúp bảng dữ liệu trông gọn gàng và chuyên nghiệp hơn.
 *    - Nested Data Rendering: Kỹ thuật render lồng nhau. Vì một đơn hàng có thể có nhiều sản phẩm, ta sử dụng `.map()` bên trong một `.map()` khác để hiển thị danh sách tên và số lượng sản phẩm ngay trong bảng.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Mảng `orders` từ Redux và các dữ liệu lọc từ người dùng.
 *    - Output: Một bảng điều khiển đơn hàng linh hoạt với khả năng cập nhật thời gian thực.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `searchTerm`: Lưu từ khóa tìm kiếm (Mã đơn hoặc Tên khách).
 *    - `statusFilter`: Lưu trạng thái đơn hàng đang muốn lọc.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `handleStatusChange`: Gửi yêu cầu cập nhật trạng thái mới xuống Backend.
 *    - `handleDelete`: Xóa vĩnh viễn một đơn hàng (kèm cảnh báo).
 *    - `getStatusClass`: Hàm helper quyết định màu sắc nhãn trạng thái.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Khi vào trang, tự động lấy toàn bộ đơn hàng từ Database.
 *    - Bước 2: Hiển thị danh sách đơn hàng kèm thông tin khách hàng, tổng tiền và trạng thái.
 *    - Bước 3: Admin có thể gõ tìm kiếm hoặc chọn lọc theo "Đã hủy" để xem các đơn lỗi.
 *    - Bước 4: Admin chọn "Đang giao" từ menu thả xuống -> API chạy -> Trạng thái đổi màu cam.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Request: `GET /api/v1/admin/orders` và `PUT /api/v1/admin/order/:id`.
 *    - Database: Tác động vào Collection `Orders`, có thể kích hoạt logic trừ kho hàng ở Backend.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Empty Results: Nếu không tìm thấy đơn hàng nào khớp, hệ thống hiện thông báo "Không tìm thấy" thay vì để bảng trống.
 *    - Date Formatting: Sử dụng `toLocaleDateString('vi-VN')` để hiển thị ngày tháng theo định dạng Việt Nam (Ngày/Tháng/Năm).
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Quá trình lấy danh sách đơn hàng.
 *    - Quá trình cập nhật trạng thái (Sử dụng Redux Thunk).
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Chú ý phần `order.orderItems?.map`: Dấu `?.` cực kỳ quan trọng để tránh lỗi ứng dụng bị "văng" nếu một đơn hàng cũ bị thiếu dữ liệu sản phẩm.
 *    - Link `👁️`: Dẫn sang trang Chi tiết đơn hàng để Admin xem được địa chỉ giao hàng và số điện thoại khách.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAllOrders, updateOrderStatus } from '../adminSLice/adminSlice';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    Button,
    Typography,
    Box
} from '@mui/material';
import '../styles/OrdersManagement.css';

/**
 * OrdersManagement - Trang quản lý đơn hàng
 */
function OrdersManagement() {
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector(state => state.admin);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // State cho Modal cập nhật thông tin bổ sung
    const [openModal, setOpenModal] = useState(false);
    const [modalData, setModalData] = useState({
        orderId: '',
        status: '',
        trackingNumber: '',
        cancellationReason: ''
    });

    // Fetch orders khi component mount
    useEffect(() => {
        dispatch(fetchAllOrders());
    }, [dispatch]);

    // Hiển thị error
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Xử lý khi chọn trạng thái từ dropdown
    const handleStatusChange = (id, newStatus) => {
        const order = orders.find(o => o._id === id);
        
        if (newStatus === "Đang giao") {
            setModalData({
                orderId: id,
                status: newStatus,
                trackingNumber: order.trackingNumber || '',
                cancellationReason: ''
            });
            setOpenModal(true);
        } else if (newStatus === "Đã hủy") {
            setModalData({
                orderId: id,
                status: newStatus,
                trackingNumber: '',
                cancellationReason: order.cancellationReason || ''
            });
            setOpenModal(true);
        } else {
            // Các trạng thái khác cập nhật trực tiếp
            executeStatusUpdate(id, newStatus);
        }
    };

    // Thực thi cập nhật thực sự
    const executeStatusUpdate = async (id, status, extra = {}) => {
        try {
            await dispatch(updateOrderStatus({ id, status, ...extra })).unwrap();
            toast.success(`Đã chuyển đơn hàng sang trạng thái "${status}"`);
            setOpenModal(false);
        } catch (err) {
            toast.error(err || 'Cập nhật thất bại');
        }
    };

    // Xử lý gửi từ Modal
    const handleModalSubmit = () => {
        const { orderId, status, trackingNumber, cancellationReason } = modalData;

        if (status === "Đang giao" && !trackingNumber.trim()) {
            return toast.warning('Vui lòng nhập mã vận đơn để khách hàng theo dõi!');
        }

        if (status === "Đã hủy" && !cancellationReason.trim()) {
            return toast.warning('Vui lòng nhập lý do hủy đơn hàng!');
        }

        executeStatusUpdate(orderId, status, { trackingNumber, cancellationReason });
    };


    // Filter orders
    const filteredOrders = orders?.filter(order => {
        const matchesSearch =
            (order.orderCode && order.orderCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Get status badge class
    const getStatusClass = (status) => {
        switch (status) {
            case 'Chờ xử lý': return 'status-processing';
            case 'Đang giao': return 'status-shipped';
            case 'Đã giao': return 'status-delivered';
            case 'Đã hủy': return 'status-cancelled';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="orders-page">
            {/* Header */}
            <div className="orders-header">
                <div>
                    <h2 className="orders-title">Quản Lý Đơn Hàng</h2>
                    <p className="orders-subtitle">Quản lý và theo dõi đơn hàng khách hàng</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="orders-filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã đơn hoặc khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Chờ xử lý">Chờ xử lý</option>
                    <option value="Đang giao">Đang giao</option>
                    <option value="Đã giao">Đã giao</option>
                    <option value="Đã hủy">Đã hủy</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Mã Đơn</th>
                            <th>Khách Hàng</th>
                            <th>Tên Sản Phẩm</th>
                            <th>Số Lượng</th>
                            <th>Tổng Tiền</th>
                            <th>Mã Vận Đơn</th>
                            <th>Thanh Toán</th>
                            <th>Trạng Thái</th>
                            <th>Ngày</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders && filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <tr key={order._id}>
                                    <td className="order-id">
                                        {order.orderCode ? (
                                            <span className="code-highlight">{order.orderCode}</span>
                                        ) : (
                                            `#${order._id.slice(-8).toUpperCase()}`
                                        )}
                                    </td>
                                    <td>
                                        <div>
                                            <div className="customer-name">{order.user_id?.name || 'Khách vãng lai'}</div>
                                            <div className="customer-email">{order.user_id?.email || ''}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="product-list">
                                            {order.orderItems?.map((item, index) => (
                                                <div key={index} className="product-item">
                                                    {item.name}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="quantity-list">
                                            {order.orderItems?.map((item, index) => (
                                                <div key={index} className="quantity-item">
                                                    x{item.quantity}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="order-total">${order.totalPrice?.toLocaleString()}</td>
                                    <td>
                                        {order.trackingNumber ? (
                                            <span className="tracking-badge" title="Nhấn để xem">{order.trackingNumber}</span>
                                        ) : (
                                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Chưa có</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className="payment-method">{order.paymentInfo?.method || 'COD'}</span>
                                    </td>
                                    <td>
                                        <select
                                            className={`status-select ${getStatusClass(order.orderStatus)}`}
                                            value={order.orderStatus}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        >
                                            <option value="Chờ xử lý">Chờ xử lý</option>
                                            <option value="Đang giao">Đang giao</option>
                                            <option value="Đã giao">Đã giao</option>
                                            <option value="Đã hủy">Đã hủy</option>
                                        </select>
                                        {order.orderStatus === 'Đã hủy' && order.cancellationReason && (
                                            <div className="cancel-reason-hint" title={order.cancellationReason}>
                                                Lý do: {order.cancellationReason.slice(0, 15)}{order.cancellationReason.length > 15 ? '...' : ''}
                                            </div>
                                        )}
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <Link to={`/order/${order._id}`} className="btn-view" title="Xem">
                                                👁️
                                            </Link>

                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="no-orders">
                                    Không tìm thấy đơn hàng nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Nhập thông tin bổ sung (Mã vận đơn / Lý do hủy) */}
            <Dialog 
                open={openModal} 
                onClose={() => setOpenModal(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                    {modalData.status === "Đang giao" ? '📦 Thông tin vận chuyển' : '🚫 Xác nhận hủy đơn'}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ py: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Đơn hàng: <strong>#{modalData.orderId.slice(-6).toUpperCase()}</strong>
                        </Typography>
                        
                        {modalData.status === "Đang giao" ? (
                            <TextField
                                label="Mã vận đơn (Tracking Number)"
                                fullWidth
                                variant="outlined"
                                margin="normal"
                                value={modalData.trackingNumber}
                                onChange={(e) => setModalData({...modalData, trackingNumber: e.target.value})}
                                placeholder="VD: GHTK-12345678"
                                autoFocus
                            />
                        ) : (
                            <TextField
                                label="Lý do hủy"
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                margin="normal"
                                value={modalData.cancellationReason}
                                onChange={(e) => setModalData({...modalData, cancellationReason: e.target.value})}
                                placeholder="VD: Khách hàng yêu cầu hủy / Hết hàng..."
                                autoFocus
                            />
                        )}
                        
                        <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                            ℹ️ Hệ thống sẽ tự động gửi Email thông báo trạng thái này cho khách hàng.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setOpenModal(false)} color="inherit">Hủy bỏ</Button>
                    <Button 
                        onClick={handleModalSubmit} 
                        variant="contained" 
                        color={modalData.status === "Đang giao" ? "primary" : "error"}
                    >
                        Xác nhận cập nhật
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Pagination can be added here */}
        </div>
    );
}

export default OrdersManagement;
