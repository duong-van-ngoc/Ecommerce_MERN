/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là Component Trang chủ (Home Page) - "Trái tim" hiển thị của ứng dụng.
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Là điểm chạm đầu tiên của người dùng khi truy cập website (Landing Page).
 *    - Đóng vai trò là "Người điều phối" (Orchestrator): Lấy dữ liệu sản phẩm từ Redux và phân phối xuống các Component con.
 *    - Kết hợp các Section lớn: Banner chào mừng (Hero), Lưới danh mục (Category) và Sản phẩm mới về (New Arrivals).
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Khám phá (Discovery Flow) & Duyệt hàng hóa (Browsing Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `useSelector` & `useDispatch`: Cặp bài trùng của Redux Toolkit để đọc và ghi dữ liệu vào Store toàn cục.
 *    - `useEffect`: React Hook dùng để thực thi các hiệu ứng phụ (ở đây là gọi API lấy dữ liệu) ngay khi trang vừa được "nâng" lên (Mount).
 *    - Component Composition: Kỹ thuật lắp ghép các mảnh giao diện nhỏ thành một trang lớn hoàn chỉnh.
 *    - React-Toastify: Thư viện hiển thị thông báo (Popup) chuyên nghiệp.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: State từ Redux (danh sách sản phẩm, trạng thái loading).
 *    - Output: Một giao diện trang chủ lộng lẫy và đầy đủ thông tin hàng hóa.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Lấy ra `loading`, `error`, `products` từ mảng trạng thái `state.product`.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Tự động gọi `getProduct` với keyword rỗng để lấy về danh sách sản phẩm mới nhất/tất cả.
 *    - Lắng nghe và xử lý lỗi (`error`) tập trung: Nếu có lỗi từ Server, trang chủ sẽ hiển thị thông báo Toast ngay lập tức.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: User vào trang chủ -> React render khung giao diện ban đầu.
 *    - Bước 2: `useEffect` chạy -> Dispatch hành động lấy sản phẩm.
 *    - Bước 3: Redux cập nhật `loading = true` -> Hiện Loader.
 *    - Bước 4: API trả về data -> Redux cập nhật `products` -> Trang chủ đẩy data này xuống `<NewArrivals />`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Browser -> Home.jsx -> Redux Thunk -> Backend API -> MongoDB -> JSON Response -> Redux Store -> Home.jsx UI.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Sử dụng Component `<PageTitle />` để thay đổi tiêu đề trang trên tab trình duyệt (Tốt cho SEO).
 *    - Truyền `loading` và `products` xuống component con để xử lý hiển thị có điều kiện (Hiện sản phẩm hoặc hiện Skeleton).
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Việc gọi API thông qua Dispatch là một tiến trình bất đồng bộ (Async), dữ liệu sẽ không có ngay mà phải chờ phản hồi từ Server.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Chú ý hàm `dispatch(removeErrors())`: Đây là bước "dọn dẹp" (Cleanup) cực kỳ quan trọng để lỗi không bị hiển thị lặp đi lặp lại khi người dùng chuyển trang.
 *    - File này tập trung vào Layout (bố cục), nếu muốn sửa giao diện chi tiết từng sản phẩm, hãy vào component `NewArrivals` hoặc `ProductCard`.
 */
import React, { useEffect } from 'react';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import Loader from '@/shared/components/Loader';
import PageTitle from '@/shared/components/PageTitle';

// New Components (Maison Style)
import HeroSection from '@/shared/components/HeroSection';
import CategoryGrid from '@/shared/components/CategoryGrid';
import NewArrivals from '@/shared/components/NewArrivals';

import { useDispatch, useSelector } from 'react-redux';
import { getProduct, removeErrors } from '@/features/products/productSlice';
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