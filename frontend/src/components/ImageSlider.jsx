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
              (<div className="slider-item">
                <img src={image}  alt={`Slide &${index + 1}`}/>
              </div> ))
            }
        </div>
        {/* các chấm nhỉ để thể hiện vị trí của ảnh  */}    
        <div className="slider-dots">
          {images.map((_, index) => (
            <span className={`dot ${index === currentIndex? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}/>
          ))}
        </div>
   </div>
  )
}

export default ImageSlider