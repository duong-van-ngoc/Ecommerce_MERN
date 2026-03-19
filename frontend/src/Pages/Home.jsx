/**
 * ============================================================================
 * COMPONENT: Home
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho trang chủ (`Home`).
 *    - Gom nhóm các component UI (Hero, CategoryGrid, NewArrivals) ghép lại thành giao diện trang chủ chính.
 * 
 * 2. Props: 
 *    - Không nhận trực tiếp props từ cha.
 * 
 * 3. State:
 *    - Không có Local State.
 *    - Quản lý Global State từ Redux qua useSelector (kéo state `product` gồm `loading`, `error`, `products`).
 * 
 * 4. Render lại khi nào:
 *    - Khi Global State `product` thay đổi (đang tải API, có lỗi, có danh sách sản phẩm mới trả về).
 * 
 * 5. Event handling:
 *    - Chạy tự động `dispatch(getProduct(keyword))` qua `useEffect` khi mount.
 *    - Hiển thị Toast Error khi có error từ Global State.
 * 
 * 6. Conditional rendering:
 *    - Chưa có điều kiện ẩn hiện phức tạp trên component layout này (đẩy logic loader xuống <NewArrivals />).
 * 
 * 7. List rendering:
 *    - Không sử dụng list render trực tiếp (đẩy products qua property của component con để loop array).
 * 
 * 8. Controlled input:
 *    - Không có Input UI elements.
 * 
 * 9. Lifting state up:
 *    - Phân chia lấy data list `products` từ Redux và đẩy mảng đó xuống props cho `<NewArrivals products={products}/>`.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Component mount -> `useEffect` gọi dispatch action fetch List Sản phẩm (getProduct "Tất Cả").
 *    - (2) Nhận mảng `products` từ Redux -> tự động truyền qua các Section bên dưới.
 *    - (3) Dựng các thẻ cơ bản và Section Layout `<HeroSection />`, `<CategoryGrid />`, `<NewArrivals />` vào DOM.
 * ============================================================================
 */
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import PageTitle from '../components/PageTitle';

// New Components (Maison Style)
import HeroSection from '../components/HeroSection';
import CategoryGrid from '../components/CategoryGrid';
import NewArrivals from '../components/NewArrivals';

import { useDispatch, useSelector } from 'react-redux';
import { getProduct, removeErrors } from '../features/products/productSlice';
import { toast } from 'react-toastify';

function Home() {
  const { loading, error, products, productCount } = useSelector((state) => state.product);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProduct({ keyword: "" }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || error, { position: 'top-center', autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  return (
    <>
      <PageTitle title="Trang chủ" />

      {/* 
               We wrap everything in a Fragment or div. 
               Note: Navbar and Footer are existing components. 
               We might need to check if they match the new style later, 
               but for now we keep them to maintain navigation functionality.
            */}
      <Navbar />

      {/* Main Content Area */}
      <main className="w-full min-h-screen bg-[#FAFAF8] text-[#1A1A1A]">

        {/* Hero Section */}
        <HeroSection />

        {/* Shop By Category */}
        <CategoryGrid />

        {/* New Arrivals (Products) */}
        <NewArrivals products={products} loading={loading} />

      </main>

      <Footer />
    </>
  );
}

export default Home;