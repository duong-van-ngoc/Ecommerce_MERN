import React, {  useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import{ useDispatch } from 'react-redux'
import { addItemsToCart, removeErrors, removeItemFromCart, removeMessage } from '../features/cart/cartSlice';
import { useSelector } from 'react-redux'

function CartItem({item}) {
    const {success, loading, error, cartItems ,message } = useSelector(state => state.cart);

    const [quantity, setQuantity] = useState(item.quantity);
    // tính tổng tiền của sản phẩm
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    const dispatch = useDispatch(); 


    // tăng số lượng sản phẩm
    const increaseQuantity = () => {
        if(item.stock <= quantity) {
          toast.error(`Số lượng không thể vượt quá ${item.stock}`,
            {position: 'top-center' , autoClose:3000});
          dispatch(removeErrors())
          return;
        }
        setQuantity (prev => prev +1)
    }
    // giảm số lượng sản phẩm
    const decreaseQuanntity = () => {
        if(quantity <=1) {
              toast.error('Số lượng sản phẩm không được nhỏ hơn 1', 
              {position:'top-center',autoClose:3000}
              )
            dispatch(removeErrors())
            return;
        }
        setQuantity(prev => prev -1)
    }

    // cập nhật số lượng sản phẩm trong giỏ hàng
    const handleUpdate = () => {
      if(loading) return;
      if(quantity !== item.quantity) {
        dispatch(addItemsToCart({id:item.product, quantity})) 
      }
    }
    useEffect(() => {
      if(error) {
        toast.error(error?.message, {position: 'top-center', autoClose: 3000});
        dispatch(removeErrors());
      }
    }, [dispatch, error]);

    useEffect(() => {
      if(success) {
        toast.success(message, {position: 'top-center', autoClose: 3000,  toastId: "cart-success"});
        dispatch(removeMessage());
      }
    }, [dispatch, success, message]);


    // xóa sản phẩm khỏi giỏ hàng
    const handleRemove= () => {
      if(loading) return;
      dispatch(removeItemFromCart(item.product))
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng',{
        position: 'top-center',
        autoClose:3000,
      })
    }
  return (
    <div className="cart-item">
              {/* //  phần thông tin sản phẩm */}
              <div className="item-info">
                <img src={item.image} alt={item.name} 
                            className='item-iamge'
                />
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-quantity"><strong > Price: </strong>{item.price.toFixed(2)}/-</p> 
                  <p className="item-quantity"><strong>Quantity: </strong>{item.quantity}</p>
                </div>
                
              </div>
              {/* // phần số lượng sản phẩm */}
                <div className="quantity-controls">
                  <button className="quantity-button decrease-btn"
                          onClick={decreaseQuanntity} disabled={loading}
                  >-</button>
                  <input type="number" value={quantity} className='quantity-input' readOnly min="1" />
                  <button className="quantity-button increase-btn"
                            onClick={increaseQuantity} disabled={loading}
                  >+</button>
                </div>
                  {/* // phần tổng tiền */}
                  <div className="item-total">
                    <span className="item-total-price">{(item.price*item.quantity).toFixed(2)}</span>
                  </div>
                  {/* // phần xóa sản phẩm */}
                  <div className="item-actions">
                    <button className="update-item-btn" 
                            onClick = {handleUpdate}
                            disabled={loading || quantity === item.quantity}
                    >{loading ? 'Updating' : 'Update'}</button>
                    <button className="remove-item-btn" disabled={loading} onClick={handleRemove}>Remove</button>
                  </div>
            </div>
  )
}

export default CartItem