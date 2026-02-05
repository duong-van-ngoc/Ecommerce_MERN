import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAllOrders, updateOrderStatus, deleteOrder } from '../adminSLice/adminSlice';
import '../styles/OrdersManagement.css';

/**
 * OrdersManagement - Trang quản lý đơn hàng
 */
function OrdersManagement() {
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector(state => state.admin);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

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

    // Xử lý cập nhật trạng thái
    const handleStatusChange = async (id, newStatus) => {
        try {
            await dispatch(updateOrderStatus({ id, status: newStatus })).unwrap();
            toast.success('Cập nhật trạng thái thành công!');
        } catch (err) {
            toast.error(err || 'Cập nhật thất bại');
        }
    };

    // Xử lý xóa đơn hàng
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
            try {
                await dispatch(deleteOrder(id)).unwrap();
                toast.success('Xóa đơn hàng thành công!');
            } catch (err) {
                toast.error(err || 'Xóa đơn hàng thất bại');
            }
        }
    };

    // Filter orders
    const filteredOrders = orders?.filter(order => {
        const matchesSearch =
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

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
                                    <td className="order-id">#{order._id.slice(-6)}</td>
                                    <td>
                                        <div>
                                            <div className="customer-name">{order.user?.name || 'N/A'}</div>
                                            <div className="customer-email">{order.user?.email || ''}</div>
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
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-view" title="Xem">
                                                👁️
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(order._id)}
                                                title="Xóa"
                                            >
                                                🗑️
                                            </button>
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

            {/* Pagination can be added here */}
        </div>
    );
}

export default OrdersManagement;
