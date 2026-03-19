/**
 * ============================================================================
 * COMPONENT: Footer
 * ============================================================================
 * 1. Component là gì: 
 *    - Vùng chân trang (Footer) của toàn bộ các màn hình hiển thị. Cung cấp thông tin
 *      liên hệ, các kênh kết nối bên ngoài (Social links) và dòng bản quyền.
 * 
 * 2. Props: 
 *    - Không sử dụng props truyền từ component cha.
 * 
 * 3. State:
 *    - Component ở dạng Stateless (Hoàn toàn không cần state).
 * 
 * 4. Render lại khi nào:
 *    - Rất hiếm khi re-render vì đây là thành phần tĩnh, chỉ render theo Root App.
 * 
 * 5. Event handling:
 *    - Không có bất kỳ event handler hay form control nào. Các CTA hoàn toàn bằng thẻ `<a>` tĩnh.
 * 
 * 6. Conditional rendering:
 *    - Không sử dụng conditional rendering. Render 100% markup cố định.
 * 
 * 7. List rendering:
 *    - Không sử dụng array `.map()`, các list social icon được code thủ công để tối ưu tốc độ.
 * 
 * 8. Controlled input:
 *    - Không tồn tại Input fields trong Footer này.
 * 
 * 9. Lifting state up:
 *    - Hoàn toàn tách biệt khỏi cấu trúc state chung của ứng dụng.
 * 
 * 10. Luồng hoạt động:
 *    - Component thuần tuý mount vào cuối thẻ `div#root` và hiển thị UI cố định, hỗ trợ HTML5 semantic `<footer>` cho SEO.
 * ============================================================================
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