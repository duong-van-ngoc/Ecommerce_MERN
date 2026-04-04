/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Thành Phần Trượt Ảnh (Image Slider / Carousel).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Hiển thị các Banner quảng cáo hoặc bộ sưu tập ảnh nổi bật bằng hiệu ứng chuyển động ngang tự động.
 *    - Tăng tính thẩm mỹ và sự sống động cho giao diện người dùng.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Hiển thị Nội dung Trình diễn (Presentation UI Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Local State Management: Sử dụng `useState` để quản lý chỉ số ảnh hiện tại (`currentIndex`).
 *    - Lifecycle Side-effects: Sử dụng `useEffect` kết hợp với `setInterval` để tạo cơ chế tự động chuyển slide (Autoplay).
 *    - Cleanup Function: Rất quan trọng! Sử dụng `clearInterval` trong hàm cleanup của `useEffect` để ngăn chặn lỗi rò rỉ bộ nhớ (Memory Leak) khi component bị gỡ bỏ khỏi màn hình.
 *    - CSS Transform: Sử dụng kỹ thuật `translateX` để di chuyển băng ảnh. Đây là phương pháp tối ưu hiệu năng (Hardware Accelerated) giúp hiệu ứng trượt cực kỳ mượt mà so với việc thay đổi `margin` hay `left`.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Mảng đường dẫn ảnh `images` (Hằng số tĩnh).
 *    - Output: Một Slider có khả năng tự trượt và cho phép điều khiển qua các nút chấm (Dots).
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `currentIndex` (Local State): Lưu vị trí trang hiện tại (0, 1, 2...).
 * 
 * 7. CÁC HÀM / CHỨC NƠNG CHÍNH:
 *    - Tự động tăng `currentIndex` sau mỗi 5 giây.
 *    - `setCurrentIndex(index)`: Hàm cho phép người dùng nhảy trực tiếp đến slide cụ thể khi nhấn vào Dot.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Khởi tạo timer 5000ms.
 *    - Bước 2: Khi timer chạy hết, tính toán index tiếp theo bằng công thức modulo `% images.length` (giúp quay về 0 khi hết danh sách).
 *    - Bước 3: Cập nhật State -> React re-render -> Thuộc tính `style.transform` của container thay đổi -> Băng ảnh trượt đi.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không gọi API.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Điều kiện `index === currentIndex ? 'active' : ''` để làm sáng nút chấm (dot) tương ứng với ảnh đang xem.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - `setInterval`: Chạy ngầm định kỳ để cập nhật trạng thái.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Chú ý mảng `images`: Nếu muốn thêm ảnh, chỉ cần bỏ URL vào mảng này, giao diện sẽ tự động thích ứng nhờ logic Map và Modulo linh hoạt.
 */
import React, { useEffect, useState } from 'react'
import'../componentStyles/ImageSlider.css'


const images = [
  "/images/banner4.jpg",
  "/images/banner5.jpg",
  "/images/banner6.jpg"


]


function ImageSlider() {
  // lưu vị trí ảnh hiện tại trong slider
  const [currentIndex, setCurrentIndex] = useState(0);
  // Tự động chuyển ảnh sau mỗi 5 giây  
  useEffect(() => {
      const interval = setInterval(() => {
       setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
      }, 5000)
      return () => clearInterval(interval)
    },[])
  
  return (
   <div className="image-slider-container">
        {/*  hiển thịc các hình ảnh */}
        <div className="slider-images" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            { images.map((image, index) => 
              (<div className="slider-item" key={index}>
                <img src={image}  alt={`Slide &${index + 1}`}/>
              </div> ))
            }
        </div>
        {/* các chấm nhỉ để thể hiện vị trí của ảnh  */}    
        <div className="slider-dots">
          {images.map((_, index) => (
            <span className={`dot ${index === currentIndex? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)} key={index}/>
          ))}
        </div>
   </div>
  )
}

export default ImageSlider