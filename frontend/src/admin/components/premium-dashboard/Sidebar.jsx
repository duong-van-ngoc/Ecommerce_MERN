import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
    { name: 'Quản lý sản phẩm', icon: 'inventory_2', path: '/admin/products' },
    { name: 'Quản lý đơn hàng', icon: 'receipt_long', path: '/admin/orders' },
    { name: 'Quản lý người dùng', icon: 'group', path: '/admin/users' },
];

export default function Sidebar({ user }) {
    return (
        <aside className="h-screen w-64 fixed left-0 top-0 border-r border-[#dfbfc0]/10 bg-[#f9f9f7] flex flex-col py-8 px-6 z-50">
            <div className="mb-12">
                <h1 className="font-headline text-2xl  font-bold text-[#ee5a6f]">ToBi Shop</h1>
            </div>
            
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out ${isActive ? 'font-semibold border-r-2 border-[#ee5a6f] bg-[#f4f4f2]' : 'text-stone-500 hover:text-[#ee5a6f] hover:bg-[#f4f4f2]'}`}
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`material-symbols-outlined ${isActive ? 'text-[#ee5a6f]' : ''}`}>{item.icon}</span>
                                <span className={`font-label text-sm tracking-wide ${isActive ? 'text-[#ee5a6f]' : ''}`}>{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="pt-8 mt-8 border-t border-[#dfbfc0]/10 space-y-1">
                <NavLink to="/admin/settings" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out ${isActive ? 'font-semibold border-r-2 border-[#ee5a6f] bg-[#f4f4f2]' : 'text-stone-500 hover:text-[#ee5a6f] hover:bg-[#f4f4f2]'}`}>
                    {({ isActive }) => (
                        <>
                            <span className={`material-symbols-outlined ${isActive ? 'text-[#ee5a6f]' : ''}`}>settings</span>
                            <span className={`font-label text-sm tracking-wide ${isActive ? 'text-[#ee5a6f]' : ''}`}>Cài đặt</span>
                        </>
                    )}
                </NavLink>
                <NavLink to="/products" className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out ${isActive ? 'font-semibold border-r-2 border-[#ee5a6f] bg-[#f4f4f2]' : 'text-stone-500 hover:text-[#ee5a6f] hover:bg-[#f4f4f2]'}`}>
                    {({ isActive }) => (
                        <>
                            <span className={`material-symbols-outlined ${isActive ? 'text-[#ee5a6f]' : ''}`}>home</span>
                            <span className={`font-label text-sm tracking-wide ${isActive ? 'text-[#ee5a6f]' : ''}`}>Về trang chủ</span>
                        </>
                    )}
                </NavLink>
            </div>

            <div className="mt-auto pt-8">
                <div className="p-4 rounded-2xl bg-[#f4f4f2] flex flex-col items-center text-center">
                    <img className="w-12 h-12 rounded-full object-cover mb-3 shadow-md" alt="Admin avatar" src={user?.avatar?.url || "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg"} />
                    <span className="font-headline text-sm font-bold text-[#1a1c1b]">{user?.name || "Admin"}</span>
                    <span className="font-label text-[10px] text-stone-400 uppercase tracking-tighter">{user?.role === 'admin' ? "Quản lý cửa hàng" : "Nhân viên"}</span>
                </div>
            </div>
        </aside>
    );
}
