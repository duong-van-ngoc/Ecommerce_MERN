/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component "Hành động Giỏ hàng nhanh" (CartAction).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp tính năng "Thêm vào giỏ hàng 1-click" từ các liên kết đặc biệt hoặc redirection.
 *    - Không có giao diện hiển thị (chỉ hiện Loader trong tích tắc), chủ yếu đóng vai trò như một Middleware của Frontend.
 *    - Tự động điều hướng người dùng vào trang Giỏ hàng sau khi xử lý xong nghiệp vụ.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Mua sắm (Shopping Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Programmatic Dispatch: Sử dụng `dispatch(addItemsToCart(...))` ngay trong `useEffect`.
 *    - Promise Handling: Sử dụng `.then()` và `.catch()` để kiểm soát việc điều hướng trang dựa trên kết quả của hành động Redux.
 *    - URL Parameters: Lấy ID sản phẩm từ URL thông qua `useParams`.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: ID sản phẩm từ URL.
 *    - Output: Sản phẩm được thêm vào giỏ hàng và trình duyệt chuyển hướng đến `/cart`.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `id`: Lấy từ `useParams()`.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `useEffect`: "Động cơ" chính của file, tự động chạy khi component được gọi.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: User click vào một link "Mua ngay" hoặc link tương tự.
 *    - Bước 2: `CartAction` được mount -> Lấy `id` sản phẩm.
 *    - Bước 3: Gọi action thêm sản phẩm với số lượng mặc định là 1.
 *    - Bước 4: Chờ API phản hồi (thành công hay thất bại đều điều hướng về giỏ hàng).
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI -> Redux Thunk -> Backend API (POST /api/v1/cart) -> MongoDB -> Cart Store.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Hiển thị `<Loader />` liên tục cho đến khi quá trình điều hướng xảy ra.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Toàn bộ logic trong `useEffect` đều là bất đồng bộ do phải đợi Dispatch hoàn tất.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Đây là một Component "Tiện ích". Nếu bạn muốn thay đổi số lượng mặc định hoặc thêm tùy chọn Size/Màu mặc định, hãy sửa ở dòng `dispatch(addItemsToCart({ id, quantity: 1 }))`.
 */
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItemsToCart } from '@/features/cart/cartSlice';
import Loader from '@/shared/components/Loader';

const CartAction = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (id) {
            // Defaulting to quantity 1, no specific size/color for 1-click add
            dispatch(addItemsToCart({ id, quantity: 1 }))
                .then(() => {
                    navigate('/cart');
                })
                .catch((err) => {
                    console.error("Lỗi khi thêm vào giỏ hàng:", err);
                    navigate('/cart');
                });
        } else {
            navigate('/cart');
        }
    }, [id, dispatch, navigate]);

    return <Loader />;
};

export default CartAction;
