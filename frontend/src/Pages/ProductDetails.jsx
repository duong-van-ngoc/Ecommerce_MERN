import React, { useEffect, useState } from 'react'
import  '../pageStyles/ProductDetails.css';
import PageTitle from '../components/PageTitle';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'
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
              dispatch(removeErrors)
            }
          },[dispatch,id])
          
           useEffect(() => {
                if(error) {
                  toast.error(error.message, {position: 'top-center' , autoClose:3000});
                  dispatch(removeErrors)
                }
              }, [dispatch, error])
              if (loading) {
                return(
                  <>
                    
                  </>
                )
              }


  return (
  <>
    <PageTitle title = 'Product Name - Details' />
    <Navbar />
    <div className="product-details-container">
        <div className="product-detail-container">
            <div className="product-iamge-container">
              <img src="" alt="Product title"
              className='product-detail-iamge'
              />
            </div>

            <div className="product-info">
              <h2>Product Name</h2>
              <p className="product-description">Mô tả sảnn phẩm</p>
              <p className="product-price">Giá: 200/-</p>
              <div className="product-rating">
                  <Rating 
                    value={2}
                    disabled= {true}
                  />
                  <span className="productCardSpan">(1 Review)</span>
              </div>
              <div className="stock-status">
                <span className="instock">
                  In Stock (8 vailabel)
                </span>
              </div>

              <div className="quantity-controls">
                <span className="quantity-label">Quantity: </span>
                <button className="quantity-button">-</button>
                <input type="text" value={1} 
                        className='quantity-value' readOnly/>
                <button className="quantity-button"> + </button>
              </div>

              <button className="add-to-cart-btn">Thêm vào giỏ hàng</button>

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
          <div className="review-item">
            <div className="review-header">
              <Rating 
                    value={2}
                    disabled= {true}
                  />
            </div>

            <p className="review-comment">Binh luan danh gia </p>
            <p className="review-name">Duong Ngoc</p>
          </div>
        </div>
    </div>

  </>
  )
}

export default ProductDetails