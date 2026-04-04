/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component con "Dòng sản phẩm trong giỏ" (CartItem).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Hiển thị thông tin chi tiết của một mặt hàng cụ thể trong danh sách giỏ hàng.
 *    - Cung cấp các nút điều khiển trực tiếp: Tăng/Giảm số lượng, Xóa sản phẩm và Cập nhật trạng thái.
 *    - Giúp người dùng quan sát được tổng giá trị (Price * Quantity) của riêng mặt hàng đó trước khi thanh toán.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Mua sắm & Quản lý Giỏ hàng (Shopping & Cart Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Reusable Component: Thiết kế để có thể lặp lại (loop) trong một danh sách dài mà vẫn đảm bảo hiệu năng.
 *    - Component State: Sử dụng `useState` để quản lý số lượng (`quantity`) tạm thời trước khi người dùng nhấn "Update" để đồng bộ với Redux.
 *    - Redux Integration: `useSelector` để theo dõi trạng thái loading từ Store và `useDispatch` để kích hoạt các hành động cập nhật/xóa.
 *    - Toast Notification: Cung cấp phản hồi tức thì cho người dùng khi họ tăng quá số lượng tồn kho hoặc thực hiện xóa thành công.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Prop `item` chứa thông tin sản phẩm (name, price, stock, image...).
 *    - Output: Một hàng giao diện tương tác trong bảng giỏ hàng.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - `quantity`: Số lượng món hàng mà người dùng muốn mua (được khởi tạo từ `item.quantity`).
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `increaseQuantity/decreaseQuantity`: Điều chỉnh số lượng và validate giới hạn (không dưới 1, không quá stock).
 *    - `handleUpdate`: Gửi yêu cầu cập nhật số lượng mới lên Redux Store.
 *    - `handleRemove`: Gửi yêu cầu xóa hoàn toàn sản phẩm khỏi giỏ hàng.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Nhận dữ liệu `item` từ trang Cart cha.
 *    - Bước 2: Hiển thị giao diện và khởi tạo Local State `quantity`.
 *    - Bước 3: Người dùng bấm +/- -> Cập nhật Local State -> Nút "Update" sáng lên.
 *    - Bước 4: Người dùng bấm "Update" -> Dispatch hành động -> Đồng bộ dữ liệu lên Server/Redux.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - UI -> Dispatch (addItemsToCart / removeItemFromCart) -> API Request -> MongoDB -> Response -> Update Redux Store.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Nút "Update" sẽ bị vô hiệu hóa (`disabled`) nếu số lượng không thay đổi hoặc đang trong quá trình tải dữ liệu (`loading`).
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Các hàm `handleUpdate` và `handleRemove` thực thi các hành động bất đồng bộ thông qua Redux Thunk.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬ A FILE:
 *    - Lưu ý sự khác biệt giữa `quantity` (State nội bộ) và `item.quantity` (Dữ liệu từ Redux). Việc tách biệt này giúp tránh việc gọi API liên tục mỗi khi người dùng bấm nút thay đổi số lượng.
 */
import React, {  useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import{ useDispatch } from 'react-redux'
import { addItemsToCart, removeErrors, removeItemFromCart, removeMessage } from '../features/cart/cartSlice';
import { useSelector } from 'react-redux'

function CartItem({item}) {
    const {success, loading, error, cartItems ,message } = useSelector(state => state.cart);

    const [quantity, setQuantity] = useState(item.quantity);
    // tính tổng tiền của sản phẩm
    // const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
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
              {/*    thông tin sản phẩm */}
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
              {/* số lượng sản phẩm */}
                <div className="quantity-controls">
                  <button className="quantity-button decrease-btn"
                          onClick={decreaseQuanntity} disabled={loading}
                  >-</button>
                  <input type="number" value={quantity} className='quantity-input' readOnly min="1" />
                  <button className="quantity-button increase-btn"
                            onClick={increaseQuantity} disabled={loading}
                  >+</button>
                </div>
                  {/*  tổng tiền */}
                  <div className="item-total">
                    <span className="item-total-price">{(item.price*item.quantity).toFixed(2)}</span>
                  </div>
                  {/* // xóa sản phẩm */}
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