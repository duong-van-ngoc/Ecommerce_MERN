import React, { useState } from 'react'
import '../componentStyles/Product.css'
import { Link } from 'react-router-dom'
import Rating from './Rating'

function Product({ product }) {

    const [rating, setRating] = useState(0)
    const handleRatingChange = (newRating) => {
        setRating(rating)
        console.log(`rating changed to : ${newRating}`);

    }

    return (
        <Link to={`/product/${product._id}`} className="product_id">
            <div className="product-card">
                <img src={product.images?.[0]?.url || "/public/ao/ao_khoac.jpg"} alt={product.name} className='product-image-card' />
                <div className="product-details">
                    <h3 className="product-title">{product.name} </h3>
                    <p className="home-price"><strong>Giá</strong> {product.price}/-</p>
                    <div className="rating_container">
                        <Rating
                            value={product.ratings}
                            onRatingChange={handleRatingChange}
                            disabled={true}
                        />
                    </div>

                    <div className="productCardSpan">
                        {product.numOfReviews} {product.numOfReviews === 1 ? "Đánh giá" : "Đánh giá"}
                    </div>

                    <button className="add-to-cart">Xem Chi tiết Sản Phẩm</button>
                </div>
            </div>
        </Link>
    )
}

export default Product