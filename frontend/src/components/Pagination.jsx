/**
 * ============================================================================
 * COMPONENT: Pagination
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử `Pagination` trong ứng dụng.
 * 
 * 2. Props: 
 *    - Nhận các props: currentPage,
  onPageChange,
  activeClass='active',
  nextPageText = ">",
  prevPageText = "<",
  firstPageText = '1st',
  lastPageText = "Last"
 * 
 * 3. State:
 *    - Global State (lấy từ Redux qua useSelector).
 * 
 * 4. Render lại khi nào:
 *    - Khi Global State (Redux) cập nhật.
 *    - Khi Props từ cha truyền xuống thay đổi.
 * 
 * 5. Event handling:
 *    - Có tương tác sự kiện (onClick, onChange, onSubmit...).
 * 
 * 6. Conditional rendering:
 *    - Sử dụng toán tử 3 ngôi (? :) hoặc `&&` để ẩn/hiện element hoặc component.
 * 
 * 7. List rendering:
 *    - Sử dụng `.map()` để render danh sách elements.
 * 
 * 8. Controlled input:
 *    - Không chứa form controls.
 * 
 * 9. Lifting state up:
 *    - Dữ liệu được quản lý cục bộ hoặc đẩy lên Redux store toàn cục.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Component Mount -> Chỉ mount giao diện thuần và nhận Props.
 *    - (2) Nhận State/Props và render UI ban đầu.
 *    - (3) End-User tương tác trên component -> Cập nhật State -> Re-render màn hình.
 * ============================================================================
 */
import React from 'react'
import '../componentStyles/Pagination.css'
import { useSelector } from 'react-redux'
function Pagination({
  currentPage,
  onPageChange,
  activeClass='active',
  nextPageText = ">",
  prevPageText = "<",
  firstPageText = '1st',
  lastPageText = "Last"

}) {
  const {totalPages, products} = useSelector((state) => state.product)

  if(products.length === 0 || totalPages <= 1) return null;

  // hàm tạo số trang 
  const getPageNumbers=() => {
    const pageNumbers = [];
    const pageWindow = 2;
    for(let i = Math.max(1, currentPage-pageWindow);
            i <= Math.min(totalPages, currentPage+pageWindow);
            i++
    ){
      pageNumbers.push(i)
    }
    return pageNumbers;
  }

  return (
    <div className='pagiantion'>
      {/*Phần nút Quay lại (Prev/First)  */}
      {
        currentPage > 1 && (
          <>
            <button className="pagination-btn hover-btn-outline" onClick={() => onPageChange(1)} > 
               {firstPageText}
            </button>
            <button className="pagination-btn hover-btn-outline" onClick={() => onPageChange(currentPage - 1)} >  
               {prevPageText}
            </button>
          </>
        )
      }
       {/* hiển thị số trang  */}

      {
        getPageNumbers().map((number) => (
          <button className={`pagination-btn hover-btn-outline ${currentPage === number? activeClass:''}`}
                  key={number}
                  onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        ))
      }


       {/* nút Tiếp theo (Next/Last)  */}
      {
        currentPage < totalPages && (
          <>
            <button className="pagination-btn hover-btn-outline" onClick={() => onPageChange(currentPage + 1)} >
               {nextPageText}
            </button>
            <button className="pagination-btn hover-btn-outline" onClick={() => onPageChange(totalPages)} >
              {lastPageText}
            </button>
          </>
        )
      }
    </div>
  )
}

export default Pagination