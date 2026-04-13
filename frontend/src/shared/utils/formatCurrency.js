/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Tiện ích Định dạng Tiền tệ (Currency Formatter Utility).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Cung cấp một chuẩn duy nhất để hiển thị giá tiền trên toàn bộ ứng dụng (Trang chủ, Chi tiết, Giỏ hàng, Admin).
 *    - Đảm bảo trải nghiệm người dùng bản địa hóa (Localized UI) cho thị trường Việt Nam.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Hiển thị & Định dạng Dữ liệu (Formatting & Presentation Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - `Intl.NumberFormat`: API chuẩn của JavaScript để định dạng số theo ngôn ngữ và quốc gia mà không cần thư viện ngoài.
 *    - vi-VN Locale: Cấu hình chuẩn ngôn ngữ Việt Nam.
 *    - Currency Style: Chế độ hiển thị ký hiệu tiền tệ (₫).
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Một con số (Number) hoặc chuỗi số (String).
 *    - Output: Chuỗi văn bản đã được định dạng (VD: "500.000 ₫").
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không sử dụng State của React.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `formatVND`: Hàm thực hiện chuyển đổi giá trị thô thành chuỗi đẹp.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Nhận giá trị đầu vào.
 *    - Bước 2: Chuyển đổi đầu vào sang kiểu `Number` để đảm bảo an toàn.
 *    - Bước 3: Áp dụng quy tắc phân tách hàng nghìn bằng dấu chấm (.) và thêm ký hiệu ₫ ở cuối.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không liên quan trực tiếp đến Database.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Xử lý giá trị mặc định: Nếu đầu vào bị trống hoặc Null, hàm sẽ tự động coi là 0 để tránh lỗi hiển thị `NaN`.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Nếu sau này dự án mở rộng ra quốc tế, bạn có thể chỉnh sửa `currency` sang USD, EUR... ngay tại đây để cập nhật toàn bộ web.
 *    - `minimumFractionDigits: 0` giúp tiền đồng Việt Nam không hiển thị phần xu lẻ (vốn không còn sử dụng).
 */
export const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));
};

export default formatVND;
