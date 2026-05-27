import AIChatBubble from "@/features/chat/components/AIChatBubble";

/**
 * Mục đích:
 * - Đây là component gom các UI "nổi" toàn app.
 * - Hiện tại nó đang mount `AIChatBubble`.
 *
 * Vì sao file này quan trọng?
 * - Nếu intern hỏi "AIChatBubble xuất hiện ở đâu?"
 *   thì câu trả lời là: nó được render từ đây.
 *
 * Props:
 * - File này không nhận props.
 *
 * Khi nào chạy?
 * - Khi layout/app gốc render `AppOverlays`
 * - Từ đó `AIChatBubble` mới xuất hiện ở mọi trang cần thiết
 */
function AppOverlays() {
  return (
    <>
      {/* UserDashboard moved to Navbar to prevent overlap issues */}
      <AIChatBubble />
    </>
  );
}

export default AppOverlays;
