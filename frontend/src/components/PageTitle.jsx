/**
 * ============================================================================
 * COMPONENT: PageTitle (Head Manager)
 * ============================================================================
 * 1. Component là gì: 
 *    - Một thẻ "Vô hình" chuyên phục vụ mục đích duy nhất: Đổi tiêu đề Tab trình duyệt
 *      (Thẻ <title> trên thẻ <head> của HTML DOM) nhằm thân thiện với chuẩn kỹ thuật SEO
 *      và tăng cường UX cho Application SPA - Single Page.
 * 
 * 2. Props: 
 *    - `title` (string): Text chuỗi Tiêu đề mới muốn thiết đặt.
 * 
 * 3. State:
 *    - Bỏ qua, đây là Functional Component Utility.
 * 
 * 4. Render lại khi nào:
 *    - Hiệu ứng đổi title (`document.title`) xảy ra độc quyền mỗi khi Prop `title` đổi chữ mới.
 * 
 * 5. Event handling:
 *    - API ngầm là Side-effect API Browser.
 * 
 * 6. Conditional rendering:
 *    - Không render UI, trả về React Fragment rỗng (`<></>`).
 * 
 * 7. List rendering:
 *    - Trống trơn.
 * 
 * 8. Controlled input:
 *    - Không.
 * 
 * 9. Lifting state up:
 *    - Không.
 * 
 * 10. Luồng hoạt động:
 *    - (1) React Route quét Route URL mới -> Component Page Router Mount và kéo theo <PageTitle title="Home">.
 *    - (2) Chạy `useEffect` với Array Dependency [title].
 *    - (3) BOM function `document.title = title` can thiệp DOM ngoài hệ thống để sửa tab bar.
 * ============================================================================
 */
import React, {useEffect}from 'react'

function PageTitle({title}) {
    useEffect(() => {
        document.title = title
    }
    , [title])
    return (
    <>
    </>
    )
}

export default PageTitle