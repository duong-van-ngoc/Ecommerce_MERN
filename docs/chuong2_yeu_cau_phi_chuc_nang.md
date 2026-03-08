# 2.X. Phân tích yêu cầu phi chức năng

**Hiệu năng:**
Tốc độ xử lý: Hệ thống hoạt động mượt mà, thời gian phản hồi cho các yêu cầu như tải danh sách sản phẩm, xem chi tiết sản phẩm, quản lý giỏ hàng hay xử lý đơn hàng phải nhanh chóng, nhằm đem đến trải nghiệm mua sắm trực tuyến mượt mà nhất có thể cho người dùng. Node.js với kiến trúc hướng sự kiện và I/O không đồng bộ kết hợp cùng ReactJS sử dụng cơ chế Virtual DOM giúp đảm bảo tốc độ phản hồi nhanh chóng cả ở phía server lẫn giao diện người dùng.

**Khả năng mở rộng:**
Ứng dụng có thể dễ dàng mở rộng thêm các tính năng như tích hợp cổng thanh toán trực tuyến, hệ thống voucher/khuyến mãi, đánh giá sản phẩm, chat trực tiếp với người bán hay kết hợp AI để gợi ý sản phẩm theo sở thích. Kiến trúc RESTful API với mã nguồn được tổ chức theo mô hình module hóa (tách biệt Controller, Model, Route, Middleware) cho phép bổ sung các module mới mà không ảnh hưởng đến các chức năng hiện có. MongoDB với cấu trúc dữ liệu linh hoạt dạng document cũng hỗ trợ việc mở rộng schema dễ dàng khi có yêu cầu mới.

**Bảo mật:**
Dữ liệu thông tin tài khoản cá nhân, mật khẩu người dùng, địa chỉ giao hàng hay lịch sử đơn hàng phải được bảo mật và mã hóa. Hệ thống sử dụng bcryptjs để băm mật khẩu với cơ chế salting trước khi lưu vào cơ sở dữ liệu, triển khai xác thực không trạng thái qua JSON Web Token (JWT) được truyền qua HTTP-only cookie, và phân quyền Admin/User thông qua hai tầng middleware riêng biệt. Toàn bộ thông tin nhạy cảm (khóa bí mật, thông tin kết nối database, API key) đều được quản lý qua biến môi trường (dotenv), không hardcode trong mã nguồn.

**Khả năng bảo trì:**
Dễ bảo trì: Hệ thống được xây dựng theo kiến trúc MVC (Model–View–Controller) ở phía back-end với cấu trúc module hóa rõ ràng — tách biệt Controller, Model, Route và Middleware — giúp việc sửa lỗi, cập nhật và mở rộng hệ thống trở nên dễ dàng mà không ảnh hưởng đến các chức năng đang hoạt động. Phía front-end sử dụng kiến trúc Component-based của ReactJS kết hợp Redux quản lý trạng thái tập trung, cho phép chỉnh sửa hoặc thay thế từng component độc lập. Mã nguồn được quản lý bằng Git, hỗ trợ theo dõi lịch sử thay đổi và quay lại phiên bản ổn định khi cần thiết.
Hỗ trợ kỹ thuật: Hệ thống cần có cơ chế phản hồi và hỗ trợ người dùng khi gặp sự cố trong quá trình sử dụng, bao gồm hỗ trợ qua email liên hệ, trang thông báo hệ thống (Notifications) để cập nhật trạng thái đơn hàng và thông tin khuyến mãi, cùng với giao diện quản trị cho phép admin theo dõi và xử lý phản hồi từ khách hàng một cách kịp thời.

**Tính sẵn sàng và độ tin cậy:**
Hệ thống triển khai cơ chế xử lý lỗi toàn diện với error handling middleware tập trung, async error wrapper cho mọi controller, và bộ lắng nghe sự kiện uncaughtException/unhandledRejection để ngăn chặn sập server bất ngờ. MongoDB Atlas cung cấp tính năng sao lưu tự động và khôi phục dữ liệu theo thời điểm, đảm bảo an toàn dữ liệu. Server thực hiện graceful shutdown — đóng các kết nối hiện có trước khi thoát tiến trình — nhằm tránh mất mát dữ liệu khi xảy ra sự cố.

**Khả năng sử dụng:**
Giao diện thân thiện, trực quan với Navbar cố định truy cập nhanh các chức năng chính, trang chủ bố trí rõ ràng với Hero Section, lưới danh mục và sản phẩm mới. Quy trình mua hàng được thiết kế đơn giản qua các bước: xem giỏ hàng → nhập thông tin giao hàng → xác nhận đơn hàng → thanh toán, giảm thiểu thao tác cần thiết để hoàn tất giao dịch. Toàn bộ giao diện triển khai thiết kế đáp ứng (Responsive Design) với CSS Media Queries, tự động điều chỉnh bố cục phù hợp trên mọi kích thước màn hình từ điện thoại di động đến máy tính để bàn.

**Tính tương thích:**
Ứng dụng front-end được xây dựng bằng ReactJS và đóng gói qua Vite, tự động biên dịch mã JavaScript về phiên bản tương thích rộng, hoạt động tốt trên các trình duyệt phổ biến như Google Chrome, Firefox, Microsoft Edge và Safari. Phía back-end giao tiếp hoàn toàn qua RESTful API với định dạng JSON chuẩn, không phụ thuộc vào bất kỳ thiết bị hay nền tảng cụ thể nào. Hệ thống hỗ trợ đa thiết bị nhờ thiết kế đáp ứng với các breakpoint phù hợp cho điện thoại, máy tính bảng và máy tính để bàn.
