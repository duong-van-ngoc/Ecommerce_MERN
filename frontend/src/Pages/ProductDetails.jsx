import React, { useEffect, useState } from 'react'
import  '../pageStyles/ProductDetails.css';
import PageTitle from '../components/PageTitle';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import Rating from '../components/Rating';
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom';
import { getProductDetails, removeErrors } from '../features/products/productSlice'
import  { toast } from 'react-toastify'


function ProductDetails() {

          const [userRating, setUserRating] = useState(0)
          const handleRatingChange = (newRating) => {
            setUserRating(newRating)
            console.log(`Rating changed to : ${newRating}`);
            
          }

          const{loading, error, product} =  useSelector((state) => state.product)
          const dispatch = useDispatch();
          const {id} = useParams();
          
          useEffect(() => {
            if(id) {
              dispatch(getProductDetails(id))
            }

            return () => {
              dispatch(removeErrors())
            }
          },[dispatch,id])
          
           useEffect(() => {
                if(error) {
                  toast.error(error.message, {position: 'top-center' , autoClose:3000});
                  dispatch(removeErrors())
                }
              }, [dispatch, error])
              if (loading) {
                return(
                  <>
                    <Navbar />
                    <Loader />
                    <Footer />
                  </>
                )
              }

              if(error || !product) {
                return (
                  <>
                    <PageTitle title="Chi tiết sản phẩm" />
                    <Navbar />
                    <Footer />
                    
                  </>
                )
              }


  return (
  <>
    <PageTitle title = {`${product.name} - Chi tiết`} />
    <Navbar />
    <div className="product-details-container">
        <div className="product-detail-container">
            <div className="product-iamge-container">
             <img
                  src={product.images[0].url.replace('./', '/')}
                  alt={product.name}
                  className="product-detail-iamge"
                />
            </div>

            <div className="product-info">
              <h2>{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <p className="product-price">Giá: {product.price}/-</p>
              <div className="product-rating">
                  <Rating 
                    value={product.ratinng}
                    disabled= {true}
                  />
                  <span className="productCardSpan">
                    ({product.numOfReviews} {product.numOfReviews === 1?
                      "review":"Reviews"
                    })
                  </span>
              </div>
              <div className="stock-status">
                <span className={product.stock > 0 ? `in-stock` : `out-of-stock`}>
                  {product.stock > 0 ? `in stock (${product.stock} available)` : `out of stock `}
                </span>
              </div>

              {product.stock > 0 &&( <>
                <div className="quantity-controls">
                  <span className="quantity-label">Quantity: </span>
                  <button className="quantity-button">-</button>
                  <input type="text" value={1} 
                          className='quantity-value' readOnly/>
                  <button className="quantity-button"> + </button>
                </div>

                <button className="add-to-cart-btn">Thêm vào giỏ hàng</button>
              
              </>)}

              <form action="" className="review-form">
                 <h3> Write a Review</h3>
                  <Rating
                  value={0}
                  disabled={false}
                  onRatingChang = {handleRatingChange}
                  />

                  <textarea 
                  placeholder='Nhap danh gia cua ban....'
                  name="" id="" className="review-input"></textarea>
              </form>
            </div>


        </div>

        <div className="reviews-container">
          <h3>Khach hang danh gia</h3>
          {product?.reviews && product.reviews.length > 0 ? (
            <div className="reviews-section">
              {product.reviews.map((review, index) => (
                <div className="review-item" key={index}>
                  <div className="review-header">
                    <Rating value={review.rating} disabled={true} />
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <p className="review-name">{review.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews">Chưa có đánh giá nào cho sản phẩm này.</p>
          )}
        </div>
    </div>


    <Footer />

  </>
  )
}

export default ProductDetails