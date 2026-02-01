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
import { addItemsToCart, removeMessage } from '../features/cart/cartSlice';


function ProductDetails() {

          const [userRating, setUserRating] = useState(0)
          const [quantity, setQuantity] = useState(1)

          //  xu ly danh gia
          const handleRatingChange = (newRating) => {
            setUserRating(newRating)
            console.log(`Rating changed to : ${newRating}`);
            
          }
          // chi tiet san pham
          const{loading, error, product} =  useSelector((state) => state.product)
          // gio hang
          const {loading: cartLoading , error: cartError, success, message, cartItems} = useSelector((state) => state.cart)
          


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
          
          // xu ly loi
           useEffect(() => {
              if (error) {
                toast.error(error, { position: 'top-center', autoClose: 3000 });
                dispatch(removeErrors());
              }

              if (cartError) {
                toast.error(cartError, { position: 'top-center', autoClose: 3000 });
              }
            }, [dispatch, error, cartError]);

          // hien thi thong bao khi them vao gio hang thanh cong
            useEffect(() => {
              if (success) {
                toast.success(message, { position: 'top-center', autoClose: 3000 });
                dispatch(removeMessage());
              }

              
            }, [dispatch, success, message]);

              // neu dang tai
              if (loading) {
                return(
                  <>
                    <Navbar />
                    <Loader />
                    <Footer />
                  </>
                )
              }

              // neu khong co san pham
              if(error || !product) {
                return (
                  <>
                    <PageTitle title="Chi tiết sản phẩm" />
                    <Navbar />
                    <Footer />
                    
                  </>
                )
              }

              // tăng  so luong
              const increaseQuantity = () => {
                if(product.stock <= quantity) {
                  toast.error(`Số lượng không thể vượt quá ${product.stock}`, {position: 'top-center' , autoClose:3000});
                  dispatch(removeErrors())
                  return;
                }
                setQuantity (prev => prev +1)
              }
              // giam so luong
              const decreaseQuantity = () => {
              if(quantity <= 1) {
                toast.error(`Số lượng không thể nhỏ hơn 1`, {position: 'top-center' , autoClose:3000});
                dispatch(removeErrors())
                return;
              }
              setQuantity (prev => prev -1)
            }
            // them vao gio hang 
            const addToCart = () => {
              dispatch(addItemsToCart({id, quantity}))
              
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
                    value={product.rating}
                    disabled= {true}
                  />
                  <span className="productCardSpan">
                    ({product.numOfReviews} {product.numOfReviews === 1?
                      "review":"Reviews"
                    })
                  </span>
              </div>
              <div className="stock-status">
                <span className={product.stock > 0 ? `Còn hàng` : `Hết hàng`}>
                  {product.stock > 0 ? `in stock (${product.stock} available)` : `out of stock `}
                </span>
              </div>
                      {/* them vao gio hang */}
              {product.stock > 0 && (
                <>
                  <div className="quantity-controls">
                    <span className="quantity-label">Số lượng:</span>

                    <button
                      className="quantity-button"
                      onClick={decreaseQuantity}
                    >
                      -
                    </button>

                    <input
                      type="text"
                      value={quantity}
                      className="quantity-value"
                      readOnly
                    />

                    <button
                      className="quantity-button"
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>

                  <button className="add-to-cart-btn" 
                          onClick={addToCart}
                          disabled={cartLoading} >
                   {cartLoading ? "Đang thêm..." : "Thêm vào giỏ hàng"} 
                  </button>
                </>
              )}

              <form action="" className="review-form">
                 <h3> Viết đánh giá</h3>
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