/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Chân Trang (Footer).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là điểm kết thúc của mọi trang web, cung cấp thông tin "về đích" cho người dùng.
 *    - Chứa các thông tin pháp lý, liên hệ và các liên kết mạng xã hội để tăng độ uy tín (Brand Trust) cho cửa hàng.
 *    - Hỗ trợ tốt cho SEO nhờ cấu trúc thẻ HTML5 chuẩn.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Giao diện Chung (Shared UI Layout Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Stateless Functional Component: Đây là một Component "câm", không chứa logic hay state phức tạp. Nó chỉ nhận lệnh và render nội dung cố định, giúp React chạy cực nhẹ và nhanh.
 *    - Material UI Icons: Sử dụng thư viện icon `@mui/icons-material` (Phone, Mail, GitHub...) để giao diện trông hiện đại và chuyên nghiệp thay vì dùng ảnh bitmap nặng nề.
 *    - Semantic HTML5: Sử dụng thẻ `<footer>` thay vì thẻ `<div>` thông thường. Điều này cực kỳ quan trọng cho các công cụ tìm kiếm (Google, Bing) và các thiết bị đọc màn hình dành cho người khiếm thị.
 *    - CSS Micro-interactions: Sử dụng các class như `hover-scale-up` và `hover-icon-btn` để tạo hiệu ứng phóng to nhẹ khi người dùng rà chuột qua, tăng tính tương tác sinh động.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Không có (Thành phần tĩnh).
 *    - Output: Đoạn mã HTML hiển thị thông tin ở cuối trang.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không sử dụng State hay Props vì dữ liệu của Footer thường ít thay đổi.
 * 
 * 7. CÁC HÀM / CHỨC NƠNG CHÍNH:
 *    - Chỉ thực hiện hàm `render()` (trả về JSX).
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Được nạp vào trang chủ (`App.jsx`).
 *    - Bước 2: Luôn nằm ở dưới cùng của Viewport nhờ vào cấu trúc Flexbox/Grid của layout tổng.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không có tương tác với Server.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Không có logic rẽ nhánh. Render đồng nhất cho mọi đối tượng người dùng (Khách, Thành viên, Admin).
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Dòng bản quyền `&copy; 2025 DuongNgoc`: Nếu bạn muốn cập nhật năm tự động, có thể dùng `new Date().getFullYear()`.
 *    - Các liên kết `<a>`: Nhớ thêm `target='_blank'` và `rel='noopener noreferrer'` khi liên kết ra trang ngoài để bảo mật thông tin người dùng.
 */
import React from 'react'
import '../componentStyles/Footer.css'
import {Phone, Mail,GitHub, Facebook, Instagram } from '@mui/icons-material'


function Footer() {
  return (
        <footer className="footer"> 
          <div className="footer-container">
          {/* SECTION 1*/}
          <div className="footer-section contact">
            <h3>Kết nối với chúng tôi</h3>
            <p><Phone fontSize='small'/>Phone : +84123456789</p>
            <p><Mail fontSize='small'/>Mail : dvn150903@gmail.com</p>
          </div>
          {/* SECTION 2*/}
          <div className="footer-section social">
            <h3>Theo dõi chúng tôi</h3>
            <div className="social-">
              <a href="" target='_blank' className="hover-scale-up">
                  <GitHub  className='social-icon hover-icon-btn' />
              </a>
              <a href="" target='_blank' className="hover-scale-up">
                <Facebook className='social-icon hover-icon-btn'/>
              </a>
              <a href="" target='_blank' className="hover-scale-up">
                <Instagram className='socail-icon hover-icon-btn'/>
              </a>
            </div>
          </div>
          {/* SECTION 3*/}
          <div className="footer-section about">
          <h3>Về chúng tôi</h3>
          <p></p>
          </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 DuongNgoc </p>
          </div>
          
        </footer>

  )
}

export default Footer