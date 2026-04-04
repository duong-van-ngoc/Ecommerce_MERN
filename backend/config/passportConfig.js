/**
 * 1. FILE NÀY LÀ GÌ: 
 *    Đây là file Cấu hình xác thực (Authentication Configuration) sử dụng thư viện Passport.js.
 * 
 * 2. VAI TRÒ TRONG DỰ ÁN:
 *    - Thiết lập các phương thức đăng nhập bằng mạng xã hội (Google, Facebook).
 *    - Tự động đồng bộ hóa: Nếu người dùng lần đầu đăng nhập qua mạng xã hội, hệ thống sẽ tự tạo tài khoản mới trong cơ sở dữ liệu.
 *    - Quản lý phiên đăng nhập (Session): Định nghĩa cách lưu và lấy thông tin người dùng từ Session ID.
 * 
 * 3. FILE NÀY THUỘC LUỒNG NÀO:
 *    - Luồng Xác thực & Phân quyền (Authentication & Authorization).
 * 
 * 4. KIẾN THỨC / KỸ THUẬT ĐANG DÙNG:
 *    - Passport.js: Middleware xác thực phổ biến cho Node.js.
 *    - OAuth 2.0: Giao thức xác thực ủy quyền dùng cho Google/Facebook.
 *    - Mongoose Models: Tương tác với bảng `User` để kiểm tra sự tồn tại của người dùng.
 *    - Serialization & Deserialization: Kỹ thuật mã hóa đối tượng User thành ID (để lưu vào Cookie) và ngược lại.
 * 
 * 5. INPUT / OUTPUT CỦA FILE:
 *    - Input: Dữ liệu hồ sơ (Profile) từ Google/Facebook API (tên, email, ảnh đại diện...).
 *    - Output: Đối tượng `user` hoàn chỉnh từ Database. Passport sẽ gắn đối tượng này vào `req.user` để các Controller khác sử dụng.
 * 
 * 6. STATE / PROPS / PARAMS / ... : 
 *    - Sử dụng `User` model để truy vấn và cập nhật trạng thái người dùng trong DB.
 * 
 * 7. CÁC HÀM / CHỨC NĂNG CHÍNH:
 *    - `GoogleStrategy`: Xử lý logic đăng nhập Google. Kiểm tra email hoặc Google ID trong DB.
 *    - `FacebookStrategy`: Xử lý logic đăng nhập Facebook.
 *    - `serializeUser`: Quyết định thông tin nào của User sẽ được lưu vào Session (thường là User ID).
 *    - `deserializeUser`: Dùng ID từ Session để tìm lại thông tin User đầy đủ từ Database.
 * 
 * 8. LUỒNG HOẠT ĐỘNG TỪNG BƯỚC:
 *    - Bước 1: Client gửi yêu cầu đăng nhập MXH.
 *    - Bước 2: Passport chuyển hướng người dùng tới trang của Google/Facebook.
 *    - Bước 3: Sau khi người dùng đồng ý, MXH gửi thông tin Profile về Callback URL.
 *    - Bước 4: Passport gọi hàm xử lý trong file này. Logic ở đây sẽ tìm xem User đã có trong DB chưa.
 *    - Bước 5: Nếu chưa có, tạo mới `User` với password ngẫu nhiên. Nếu có rồi nhưng chưa liên kết ID MXH, tiến hành cập nhật.
 *    - Bước 6: Trả về kết quả qua hàm `done()`.
 * 
 * 9. LUỒNG REQUEST / RESPONSE / DATABASE:
 *    - Request (Social Profile) -> Controller (Passport Middleware) -> DB Query (findOne/create) -> DB Response -> Global Session -> `req.user`.
 * 
 * 10. RENDER / ĐIỀU KIỆN / VALIDATE / PHÂN QUYỀN: 
 *    - Có validate sự tồn tại của Email để tránh tạo trùng tài khoản khi người dùng đăng nhập bằng các MXH khác nhau nhưng cùng 1 email.
 * 
 * 11. PHẦN BẤT ĐỒNG BỘ TRONG FILE:
 *    - Các callback của Strategy đều dùng `async/await` vì phải truy vấn Database.
 * 
 * 12. ĐIỂM QUAN TRỌNG KHI ĐỌC HOẶC SỬA FILE:
 *    - Cấu hình `callbackURL` phải trùng khớp tuyệt đối với cấu hình trên Google Cloud và Facebook App Dashboard.
 *    - Phần `password: Math.random().toString(36).slice(-10)` là một "mẹo" để thỏa mãn điều kiện bắt buộc của Model User (thường yêu cầu trường password), thực tế người dùng social sẽ không dùng password này để login trực tiếp.
 *    - Lưu ý các quyền truy cập (Scopes) như `email`, `profile` được cấu hình để lấy đúng dữ liệu mong muốn.
 */
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/userModel.js';

export const configurePassport = () => {
    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
        callbackURL: "/api/v1/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ 
                $or: [
                    { googleId: profile.id },
                    { email: profile.emails[0].value }
                ]
            });

            if (!user) {
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    avatar: {
                        public_id: "social_avatar",
                        url: profile.photos[0].value
                    },
                    password: Math.random().toString(36).slice(-10) // Mật khẩu ngẫu nhiên cho tài khoản social
                });
            } else if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));

    // Facebook Strategy
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID || 'placeholder',
        clientSecret: process.env.FACEBOOK_APP_SECRET || 'placeholder',
        callbackURL: "/api/v1/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ 
                $or: [
                    { facebookId: profile.id },
                    { email: profile.emails?.[0].value }
                ]
            });

            if (!user) {
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails?.[0].value || `${profile.id}@facebook.com`,
                    facebookId: profile.id,
                    avatar: {
                        public_id: "social_avatar",
                        url: profile.photos?.[0].value
                    },
                    password: Math.random().toString(36).slice(-10)
                });
            } else if (!user.facebookId) {
                user.facebookId = profile.id;
                await user.save();
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};
