import React from 'react'
import '../componentStyles/NoProducts.css'

function NoProduct({keyword}) {
  return (
    <div className="no-products-content">
        <div className="no-products-icon">⚠</div>
        <h3 className="no-products-title">Không tìm thấy sản phẩm</h3>
        <p className="no-products-message">
                {keyword?`Chúng tôi không tìm thấy sản phẩm nào cho "${keyword}". Hãy thử tìm từ khóa khác`
                :`Hiện tại danh mục này chưa có sản phẩm. Vui lòng quay lại sau.`}
                
        </p>
        
    </div>
  )
}

export default NoProduct