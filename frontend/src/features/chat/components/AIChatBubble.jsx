import React, { useState, useEffect, useRef } from "react";
import axios from "@/shared/api/http.js";
import { useSelector, useDispatch } from "react-redux";
import { addItemsToCart } from "@/features/cart/cartSlice";
import ReactMarkdown from "react-markdown";

/**
 * Mục đích:
 * - Đây là component bong bóng chat AI của Tobi.
 * - Nó hiển thị UI chat nổi ở góc màn hình, gửi câu hỏi lên backend,
 *   nhận câu trả lời từ AI, và render lại cuộc hội thoại.
 *
 * File này dùng để làm gì?
 * - Tạo giao diện chat nổi cho user
 * - Lưu lịch sử chat theo session của tab trình duyệt
 * - Gọi API `/api/v1/ai/chat`
 * - Render response Markdown từ AI
 * - Hỗ trợ nút "Thêm vào giỏ hàng" ngay trong nội dung AI trả về
 *
 * Dữ liệu trong file này lấy từ đâu?
 * - `sessionStorage`: lưu `tobi_chat_history` và `tobi_session_id`
 * - Redux store: lấy `user` để cá nhân hóa lời chào
 * - Backend API: lấy câu trả lời AI từ `/api/v1/ai/chat`
 *
 * Props:
 * - Component này không nhận props.
 *
 * Nếu chuyển file này sang Next.js App Router:
 * - File này sẽ cần `"use client"` vì đang dùng:
 *   + `useState`
 *   + `useEffect`
 *   + `useRef`
 *   + `sessionStorage`
 *   + sự kiện `onClick`, `onChange`, `onSubmit`
 */
const AIChatBubble = () => {
    const dispatch = useDispatch();

    // `isOpen`: điều khiển đóng/mở khung chat nổi
    const [isOpen, setIsOpen] = useState(false);

    // `messages`: toàn bộ lịch sử hội thoại của tab hiện tại
    // Lấy từ sessionStorage để khi user reload tab vẫn còn lịch sử trong phiên đó.
    const [messages, setMessages] = useState(() => {
        const saved = sessionStorage.getItem("tobi_chat_history");
        return saved ? JSON.parse(saved) : [];
    });

    // `input`: text user đang gõ trong ô chat
    const [input, setInput] = useState("");

    // `loading`: khi true thì AI đang trả lời, UI hiển thị typing indicator
    const [loading, setLoading] = useState(false);

    // `sessionId`: định danh cuộc trò chuyện cho tab hiện tại
    // Backend dùng `sessionId` này để gắn đúng lịch sử chat trong RAM.
    const [sessionId] = useState(() => {
        const saved = sessionStorage.getItem("tobi_session_id");
        if (saved) return saved;

        const newId = `tobi_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        sessionStorage.setItem("tobi_session_id", newId);
        return newId;
    });

    // Ref cuối danh sách tin nhắn để auto-scroll xuống cuối
    const messagesEndRef = useRef(null);

    // Lấy user từ Redux để cá nhân hóa lời chào
    const { user } = useSelector((state) => state.user);
    const userName = user ? user.name.split(" ").pop() : "bạn";

    /**
     * Lời chào ban đầu
     *
     * Logic:
     * - Chỉ khi chưa có message nào
     * - Tạo 1 tin nhắn mở đầu từ Tobi
     */
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    role: "bot",
                    content: `Chào ${userName}! ✨ Mình là Tobi, trợ lý phong cách của bạn. Hôm nay bạn muốn tìm đồ cho dịp gì hay cần mình tư vấn phong cách nào không? 👗👞`,
                    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                }
            ]);
        }
    }, [userName, messages.length]);

    /**
     * Mỗi khi messages đổi, lưu lại vào sessionStorage
     * để lịch sử chat còn tồn tại trong suốt phiên của tab đó.
     */
    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem("tobi_chat_history", JSON.stringify(messages));
        }
    }, [messages]);

    /**
     * Cuộn xuống tin nhắn mới nhất
     */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    /**
     * Mỗi khi messages thay đổi, auto scroll xuống cuối
     */
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    /**
     * Xóa lịch sử chat trong sessionStorage và reset state messages
     *
     * Khi user bấm nút "xóa lịch sử":
     * - hiện confirm
     * - nếu đồng ý thì xóa dữ liệu phiên
     * - setMessages([]) để lời chào mới được tạo lại
     */
    const clearChat = () => {
        if (window.confirm("Bạn có muốn xóa toàn bộ lịch sử trò chuyện với Tobi không?")) {
            sessionStorage.removeItem("tobi_chat_history");
            sessionStorage.removeItem("tobi_session_id");
            setMessages([]);
        }
    };

    /**
     * Hàm gửi tin nhắn chính
     *
     * Luồng chạy:
     * 1. Lấy text từ input hoặc quick action
     * 2. Chặn nếu text rỗng hoặc đang loading
     * 3. Add tin nhắn user vào UI ngay
     * 4. Gọi API backend `/api/v1/ai/chat`
     * 5. Nhận câu trả lời từ AI
     * 6. Add tin nhắn bot vào UI
     * 7. Nếu lỗi, add message fallback
     */
    const handleSendMessage = async (e, customInput) => {
        if (e) e.preventDefault();

        const messageText = customInput || input;
        if (!messageText.trim() || loading) return;

        const userMessage = {
            role: "user",
            content: messageText.trim(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };

        // Optimistic update:
        // hiển thị tin nhắn user ngay lập tức trước khi backend trả lời
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await axios.post("/api/v1/ai/chat", {
                message: userMessage.content,
                sessionId,
                userName
            });

            const botMessage = {
                role: "bot",
                content: response.data.data || "Xin lỗi, hiện tại tôi đang gặp chút vấn đề kỹ thuật.",
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error(error);

            const errorMessage = {
                role: "bot",
                content: "Tobi đang nghỉ ngơi, vui lòng thử lại sau nhé!",
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * CSS inline cho component
     *
     * Vì sao viết kiểu này?
     * - Component tự chứa toàn bộ style của nó
     * - Dễ copy hoặc di chuyển component
     *
     * Lưu ý:
     * - Đây là custom CSS nằm cạnh Tailwind utility classes
     * - Chủ yếu phục vụ markdown rendering và hiệu ứng glass UI
     */
    const styles = `
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .coral-gradient {
            background: linear-gradient(45deg, #ae2f34, #ff6b6b);
        }
        .wine-gradient {
            background: linear-gradient(135deg, #561922, #722f37);
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        .markdown-body h1, .markdown-body h2 {
            font-size: 1.1rem;
            margin-top: 8px;
            margin-bottom: 4px;
            color: #561922;
            font-weight: 800;
        }
        .markdown-body img {
            max-width: 100%;
            border-radius: 16px;
            margin: 12px 0;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            border: 1px solid rgba(0,0,0,0.05);
        }
        .markdown-body a {
            display: inline-block;
            margin: 4px 2px;
            padding: 8px 16px;
            background: #fff;
            color: #ae2f34;
            border: 1.5px solid #ae2f34;
            border-radius: 9999px;
            font-weight: 700;
            text-decoration: none;
            font-size: 12px;
            transition: all 0.2s ease;
        }
        .markdown-body a:hover {
            background: #ae2f34;
            color: #fff;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(174,47,52,0.2);
        }
        .markdown-body a[href*="cart/add"] {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            margin: 12px 0;
            padding: 12px;
            background: #ae2f34;
            color: #fff !important;
            border: none;
            border-radius: 12px;
            font-weight: 800;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(174,47,52,0.3);
        }
        .markdown-body a[href*="cart/add"]:hover {
            background: #561922;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(174,47,52,0.4);
        }
        .markdown-body a[href*="/product/"] {
            color: #ae2f34;
            font-weight: 600;
            text-decoration: underline;
            background: transparent;
            border: none;
            padding: 0;
            margin: 0 4px;
        }
        .markdown-body p {
            margin-bottom: 12px;
            line-height: 1.6;
        }
        .markdown-body p:last-child {
            margin-bottom: 0;
        }
        .markdown-body ul, .markdown-body ol {
            margin-left: 1.2rem;
            margin-bottom: 8px;
        }
    `;

    return (
        <>
            <style>{styles}</style>

            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-6 font-sans">
                {isOpen && (
                    <div className="glass-panel w-[400px] h-[620px] rounded-3xl overflow-hidden flex flex-col shadow-[0_20px_40px_rgba(0,0,0,0.15)] ring-1 ring-white/20">
                        {/* Header */}
                        <div className="wine-gradient p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-stone-100 flex items-center justify-center">
                                        <span
                                            className="material-symbols-outlined text-[#561922] text-[28px]"
                                            style={{ fontVariationSettings: "'FILL' 1" }}
                                        >
                                            person_4
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#561922] rounded-full" />
                                </div>

                                <div>
                                    <h3 className="text-white font-serif text-lg font-bold m-0 uppercase tracking-widest">
                                        Tobi
                                    </h3>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={clearChat}
                                    title="Xóa lịch sử"
                                    className="text-white/60 hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-1 flex items-center"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                                        close
                                    </span>
                                </button>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    title="Thu nhỏ"
                                    className="text-white/60 hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-1 flex items-center"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                                        remove
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4 relative">
                            <div className="flex justify-center my-2">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">
                                    Trò chuyện cùng Tobi
                                </span>
                            </div>

                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex flex-col gap-1 ${msg.role === "bot" ? "max-w-[90%]" : "items-end self-end max-w-[90%]"}`}
                                >
                                    <div
                                        className={`${msg.role === "bot" ? "bg-white/80 backdrop-blur-md rounded-tl-none text-[#211a1a]" : "bg-[#561922] text-white rounded-tr-none"} p-4 rounded-2xl shadow-sm text-sm leading-relaxed markdown-body`}
                                    >
                                        <ReactMarkdown
                                            components={{
                                                a: (props) => {
                                                    // Intercept link "cart/add/ID"
                                                    // để biến nó thành nút thêm vào giỏ thật.
                                                    if (props.href && props.href.includes("cart/add/")) {
                                                        const parts = props.href.split("/");
                                                        const productId = parts[parts.length - 1];

                                                        return (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    dispatch(addItemsToCart({ id: productId, quantity: 1 }));
                                                                    alert("Đã thêm vào giỏ hàng thành công! ✨");
                                                                }}
                                                                className="flex items-center justify-center gap-2 w-full mt-3 mb-3 p-3 bg-[#ae2f34] text-white border-0 rounded-xl font-extrabold text-[13px] uppercase tracking-wider shadow-lg hover:bg-[#561922] transition-all cursor-pointer"
                                                                style={{ textDecoration: "none" }}
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">
                                                                    add_shopping_cart
                                                                </span>
                                                                THÊM VÀO GIỎ HÀNG
                                                            </button>
                                                        );
                                                    }

                                                    return <a {...props} />;
                                                }
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>

                                    <span className="text-[9px] text-stone-400 px-1">{msg.time}</span>
                                </div>
                            ))}

                            {/* Typing indicator khi AI đang trả lời */}
                            {loading && (
                                <div className="flex flex-col gap-1 max-w-[85%]">
                                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-[#211a1a] flex items-center gap-2 h-[52px]">
                                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Suggestions:
                            Chỉ hiện ở đầu cuộc trò chuyện để user bấm nhanh */}
                        {messages.length <= 2 && !loading && (
                            <div className="flex flex-wrap gap-2 px-4 pb-3">
                                <button
                                    onClick={() => handleSendMessage(null, "Tư vấn cho mình phong cách Streetwear")}
                                    className="px-4 py-2 rounded-full border border-[#ae2f34]/20 bg-white/60 text-[#ae2f34] text-[10px] font-bold uppercase tracking-widest hover:bg-[#ae2f34] hover:text-white transition-all cursor-pointer"
                                >
                                    Streetwear 🔥
                                </button>

                                <button
                                    onClick={() => handleSendMessage(null, "Phối đồ đi làm thanh lịch")}
                                    className="px-4 py-2 rounded-full border border-stone-200 bg-white/60 text-stone-500 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-100 transition-all cursor-pointer"
                                >
                                    Office Chic 👔
                                </button>

                                <button
                                    onClick={() => handleSendMessage(null, "Hỏi về hàng giảm giá")}
                                    className="px-4 py-2 rounded-full border border-stone-200 bg-white/60 text-stone-500 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-100 transition-all cursor-pointer"
                                >
                                    Hàng Big Sale 🏷️
                                </button>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 bg-white/40 border-t border-white/20 backdrop-blur-md">
                            <form onSubmit={handleSendMessage} className="relative flex items-center m-0">
                                <input
                                    className="w-full bg-white border-0 outline-none rounded-full py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-[#ae2f34]/20 shadow-inner text-[#211a1a]"
                                    placeholder="Hỏi Tobi về phong cách thời trang..."
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={loading}
                                />

                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="absolute right-1.5 w-11 h-11 coral-gradient text-white rounded-full flex items-center justify-center hover:scale-95 transition-transform active:scale-90 shadow-lg disabled:opacity-50 border-0 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* FAB button:
                    Khi đóng chat thì chỉ hiện nút tròn để mở lại */}
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="coral-gradient w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(174,47,52,0.4)] hover:scale-110 transition-transform active:scale-90 relative border-0 cursor-pointer"
                    >
                        <span
                            className="material-symbols-outlined text-white text-3xl"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            chat_bubble
                        </span>

                        {messages.length === 1 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#561922] border-2 border-[#fff8f7] rounded-full flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold m-0">1</span>
                            </div>
                        )}
                    </button>
                )}
            </div>
        </>
    );
};

export default AIChatBubble;

/**
 * ========================= TỔNG KẾT FILE =========================
 *
 * 1. File này dùng để làm gì?
 * - Hiển thị bong bóng chat AI nổi trên giao diện
 * - Gửi message lên backend
 * - Nhận câu trả lời từ AI và render lại
 *
 * 2. Data lấy từ đâu?
 * - `sessionStorage`: lịch sử chat + sessionId
 * - Redux: user name
 * - API backend: response AI
 *
 * 3. Props truyền qua đâu?
 * - File này không nhận props
 * - Nó tự đọc dữ liệu từ Redux và sessionStorage
 *
 * 4. User click thì chuyện gì xảy ra?
 * - Click FAB -> mở khung chat
 * - Click quick suggestion -> gọi `handleSendMessage` với message mẫu
 * - Click send -> gọi API `/api/v1/ai/chat`
 * - Click clear -> xóa sessionStorage và reset chat
 * - Click link "cart/add/ID" trong markdown -> dispatch `addItemsToCart`
 *
 * 5. Nếu data rỗng thì UI hiển thị gì?
 * - Nếu chưa có message nào:
 *   + `useEffect` sẽ tạo message chào đầu tiên
 * - Nếu API lỗi:
 *   + hiện tin nhắn fallback của Tobi
 * - Nếu đang loading:
 *   + hiện typing indicator
 *
 * 6. Chỗ intern cần học kỹ:
 * - `useState`, `useEffect`, `useRef`
 * - Session storage theo browser tab
 * - Optimistic UI khi gửi tin nhắn
 * - Render markdown an toàn
 * - Intercept link để biến thành action thật
 *
 * 7. Điểm cần để ý thêm:
 * - Component này đang giả định chạy ở browser
 * - Nếu chuyển sang Next App Router thì cần `"use client"`
 * - Nếu muốn clear session hoàn toàn hơn, có thể gọi thêm backend `/chat/clear`
 */
