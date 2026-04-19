
//  * 1. FILE NÀY LÀ GÌ: 
//  *    Đây là Thanh Tiêu Đề Dashboard (Premium Admin Header).
//  * 
//  * 2. VAI TRÒ TRONG DỰ ÁN:
//  *    - Cung cấp tính năng tìm kiếm toàn cục (Global Search) giúp Admin tra cứu nhanh mọi thứ từ bất kỳ trang nào.
//  *    - Hiển thị các thông báo hệ thống và lối tắt truy cập nhanh vào hồ sơ cá nhân.
//  *    - Đóng vai trò là "Vùng điều hướng tĩnh" luôn nằm trên cùng của trình duyệt.
//  * 
import { useDispatch, useSelector } from 'react-redux';
import { setGlobalSearchQuery } from '@/admin/adminSLice/adminSlice';

export default function Header({ user }) {
    const dispatch = useDispatch();
    const globalSearchQuery = useSelector(state => state.admin.globalSearchQuery);

    return (
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-20 z-40 bg-[#f9f9f7]/70 backdrop-blur-xl flex justify-between items-center px-12">
            <div className="flex items-center flex-1 max-w-xl">
                <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-stone-400 text-lg">search</span>
                    <input 
                        className="w-full bg-transparent border-b border-[#dfbfc0]/30 py-2 pl-8 focus:outline-none focus:border-[#ee5a6f] font-label text-[13px] tracking-wide text-[#1a1c1b] placeholder:text-stone-400 placeholder:uppercase placeholder:text-[11px] placeholder:tracking-widest" 
                        placeholder="TÌM KIẾM SẢN PHẨM, ĐƠN HÀNG, KHÁCH HÀNG..." 
                        type="text" 
                        value={globalSearchQuery}
                        onChange={(e) => dispatch(setGlobalSearchQuery(e.target.value))}
                    />
                </div>
            </div>
            <div className="flex items-center gap-8">
                <button className="relative text-[#1a1c1b] hover:text-[#ee5a6f] transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-gradient-to-br from-[#ff6b6b] to-[#ee5a6f] rounded-full"></span>
                </button>
                <div className="h-6 w-[1px] bg-[#dfbfc0]/20"></div>
                <div className="flex items-center gap-3 group cursor-pointer">
                </div>
            </div>
        </header>
    );
}
