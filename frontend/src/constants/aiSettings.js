
/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Cấu hình Tham số AI (AI Stylist Configuration Constants).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Định nghĩa các tùy chọn phong cách thời trang (Styles) và cảm hứng (Vibes) cho AI Stylist.
 *    - Giúp chuẩn hóa các nhãn (Labels) hiển thị trên giao diện người dùng và các giá trị (Values) gửi lên cho AI xử lý.
 *    - Là nơi quản lý các "Metadata" giúp AI hiểu về gu thẩm mỹ của người dùng.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Trải nghiệm Người dùng AI (AI-Powered User Experience Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Constant Mapping Pattern: Sử dụng mảng các Object để lưu trữ cặp giá trị-nhãn (Value-Label) cùng biểu tượng (Icon).
 *    - Emoji Icons: Sử dụng các biểu tượng cảm xúc để trực quan hóa các phong cách thời trang mà không cần file ảnh nặng nề.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Không có.
 *    - Output: Các mảng hằng số `STYLE_OPTIONS` và `COMMON_VIBES`.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Dữ liệu tĩnh, không thay đổi trong suốt vòng đời ứng dụng.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - Không có hàm logic, chỉ chứa dữ liệu.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Ứng dụng import file này khi hiển thị Form khảo sát gu thời trang của User.
 *    - Bước 2: Các Component (như `AIChatBubble`) sử dụng các mảng này để render danh sách lựa chọn.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Không liên quan trực tiếp.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Không trực tiếp render.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Không có.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Nếu bạn muốn thêm một phong cách mới (ví dụ: "Goth" hoặc "Boho"), bạn chỉ cần thêm một object vào `STYLE_OPTIONS`.
 *    - Các giá trị `value` ở đây cần phải khớp với logic xử lý của AI Prompt ở Backend để đảm bảo AI đưa ra gợi ý chính xác.
 */

export const STYLE_OPTIONS = [
  { value: 'Streetwear', label: 'Streetwear', icon: '👟' },
  { value: 'Minimalism', label: 'Minimalism', icon: '⚪' },
  { value: 'Vintage', label: 'Vintage', icon: '🎞️' },
  { value: 'Office', label: 'Office', icon: '💼' },
  { value: 'Y2K', label: 'Y2K', icon: '🌈' },
  { value: 'Old Money', label: 'Old Money', icon: '🏛️' },
  { value: 'Sporty', label: 'Sporty', icon: '⚽' },
];

export const COMMON_VIBES = [
  'Bí ẩn', 'Năng động', 'Quyến rũ', 'Phóng khoáng', 
  'Thanh lịch', 'Ngọt ngào', 'Cá tính', 'Mạnh mẽ'
];
