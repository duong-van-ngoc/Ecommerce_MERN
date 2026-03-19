/**
 * ============================================================================
 * COMPONENT: ImageSlider (Carousel Hỉnh Ảnh)
 * ============================================================================
 * 1. Component là gì: 
 *    - Khối Banner trượt tự động (Autoplay Carousel) nằm xen kẽ ở trang chủ.
 *    - Chịu trách nhiệm render các chiến dịch hình ảnh thu hút ánh nhìn người dùng.
 * 
 * 2. Props: 
 *    - Không nhận trực tiếp props, ảnh nguồn lưu bằng constant data nội tĩnh.
 * 
 * 3. State:
 *    - Local State: 
 *      + `currentIndex` (number): Lưu trữ ID vị trí của Slide đang hiển thị.
 *    - Global State: Không có.
 * 
 * 4. Render lại khi nào:
 *    - Component tự re-render mỗi 5 giây 1 lần do sự kiện thay đổi `currentIndex`.
 * 
 * 5. Event handling:
 *    - Sự kiện `onClick` cắm vào các Navigation Dots (những chấm tròn bên dưới) để User tua nhanh slide.
 * 
 * 6. Conditional rendering:
 *    - Áp dụng class `active` cho Dot nào có index trùng với `currentIndex`.
 *    - Sử dụng React Inline Style `transform: translateX(-X%)` để tịnh tiến băng slide nguyên khối về bên trái thay vì ẩn hiện HTML, giúp animation trượt mượt mà.
 * 
 * 7. List rendering:
 *    - Lặp qua Constant array `images` để Output ra list các thẻ `<img>` trượt liền kề.
 * 
 * 8. Controlled input:
 *    - Không.
 * 
 * 9. Lifting state up:
 *    - Chạy biệt lập với App chung.
 * 
 * 10. Luồng hoạt động:
 *    - Mount -> Khởi tạo `setInterval` Tick mỗi 5000ms.
 *    - Mỗi lần Timer kêu -> function Hook set `currentIndex` lùi lên 1 bậc theo modulo chiều dài mảng (% images.length) để tới đích thì quành về số 0.
 *    - Return `clearInterval` ở block Unmount để đề phòng rò rỉ bộ nhớ (Memory leak) lúc User rời Trang.
 * ============================================================================
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