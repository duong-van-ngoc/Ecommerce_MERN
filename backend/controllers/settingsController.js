/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Bộ điều khiển Cài đặt Hệ thống (System Settings Controller).
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Quản lý các thông tin cấu hình mang tính chất toàn cục của website (như Tên cửa hàng, Địa chỉ, Email liên hệ).
 *    - Điều khiển các tùy chọn thông báo (Notifications) dành cho quản trị viên.
 *    - Đảm bảo hệ thống luôn có ít nhất (và chỉ duy nhất) một bản ghi cấu hình để hoạt động ổn định.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Quản trị hệ thống (Admin & Configuration Flow).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Singleton Pattern (Logic): Chỉ làm việc với một tài liệu (Document) duy nhất trong bảng Settings.
 *    - Lazy Initialization: Cơ chế tự động tạo dữ liệu mặc định ngay khi có yêu cầu truy vấn đầu tiên mà Database chưa có dữ liệu.
 *    - Destructuring: Trích xuất nhanh dữ liệu từ request body.
 *    - Validation: Ràng buộc nhập liệu các thông tin quan trọng trước khi ghi đè vào DB.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Dữ liệu cấu hình mới từ giao diện Admin.
 *    - Output: Đối tượng Settings hiện tại sau khi đã được cập nhật hoặc khởi tạo (JSON).
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Không áp dụng.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `getSettings`: Truy xuất cấu hình hiện tại. Nếu website mới cài đặt chưa có settings, hàm sẽ tự động tạo một bản ghi "nháp" với thông tin của Admin đang đăng nhập.
 *    - `updateSettings`: Ghi đè thông tin mới lên bản ghi cũ hoặc tạo mới nếu chưa tồn tại.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Admin vào trang Dashboard -> Cài đặt.
 *    - Bước 2: Frontend gọi `getSettings` để lấy dữ liệu đổ vào Form cập nhật.
 *    - Bước 3: Admin thay đổi thông tin và nhấn Lưu.
 *    - Bước 4: Controller nhận dữ liệu, kiểm tra tính hợp lệ và thực hiện lệnh `save()` để lưu vào MongoDB.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Client -> Route -> Controller -> Settings Model -> MongoDB -> JSON Response.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Kiểm tra xem các trường AdminName, Email, CompanyName... có bị để trống hay không.
 *    - Mọi thao tác này thường yêu cầu quyền Admin cao nhất (Super Admin).
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Sử dụng `async/await` cho các thao tác `findOne()`, `create()` và `save()`.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Vì đây là cấu hình hệ thống, hãy cẩn thận khi thay đổi cấu trúc dữ liệu nặc danh (notifications) vì nó có thể ảnh hưởng đến logic gửi thông báo ở các file khác.
 *    - Cơ chế `save()` thủ công được ưu tiên hơn `findOneAndUpdate` để đảm bảo middleware `pre-save` (nếu có) trong Model được thực thi chính xác.
 */
import Settings from '../models/settingsModel.js';
import handleAsyncError from '../middleware/handleAsyncError.js';
import HandleError from '../utils/handleError.js';


export const getSettings = handleAsyncError(async (req, res, next) => {
    // findOne() - Tìm 1 document duy nhất
    let settings = await Settings.findOne();

    // Nếu chưa có settings → tạo mới
    if (!settings) {
        settings = await Settings.create({
           
        
            adminName: req.user.name,
            email: req.user.email,
            companyName: 'ToBi Shop', // Default company name
            address: 'Chưa cập nhật', // Placeholder address
            notifications: {
                newOrders: true,
                lowStock: true,
                newUsers: true,
                newReviews: true
            }
        });
    }

    res.status(200).json({
        success: true,
        settings
    });
});


export const updateSettings = handleAsyncError(async (req, res, next) => {
    // Destructure data từ request body
    const { adminName, email, companyName, address, notifications } = req.body;

    // validate
    if (!adminName || !email || !companyName || !address) {
        return next(new HandleError('Vui lòng điền đầy đủ thông tin', 400));
    }

    // ========== FIND EXISTING SETTINGS ==========
    let settings = await Settings.findOne();

    if (!settings) {
      
        settings = await Settings.create({
            adminName,
            email,
            companyName,
            address,
            notifications: notifications || {
                newOrders: true,
                lowStock: true,
                newUsers: true,
                newReviews: true
            }
        });
    } else {
       
        settings.adminName = adminName;
        settings.email = email;
        settings.companyName = companyName;
        settings.address = address;

      
        settings.notifications = notifications || settings.notifications;

        
        await settings.save();
    }

   
    res.status(200).json({
        success: true,
        message: 'Cập nhật cài đặt thành công',
        settings 
    });
});
