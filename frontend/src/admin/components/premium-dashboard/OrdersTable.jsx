import React from 'react';

export default function OrdersTable({ orders }) {
    if (!orders || orders.length === 0) {
        return (
            <section className="bg-white rounded-2xl overflow-hidden border border-[#dfbfc0]/10 p-10 text-center" style={{boxShadow: '0 20px 40px rgba(238, 90, 111, 0.08)'}}>
                <p className="font-body text-stone-500">Chưa có đơn hàng nào.</p>
            </section>
        );
    }

    return (
        <section className="bg-white rounded-2xl overflow-hidden border border-[#dfbfc0]/10" style={{boxShadow: '0 20px 40px rgba(238, 90, 111, 0.08)'}}>
            <div className="px-10 py-8 flex justify-between items-center border-b border-[#dfbfc0]/10">
                <h3 className="font-headline text-2xl font-bold text-[#1a1c1b]">Giao Dịch Gần Đây</h3>
                <button className="text-[#ee5a6f] font-label text-[11px] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Xem Tất Cả</button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#f4f4f2]">
                            <th className="px-10 py-5 font-label text-[10px] uppercase tracking-widest text-stone-500">Mã Đơn</th>
                            <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest text-stone-500">Khách Hàng</th>
                            <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest text-stone-500">Ngày Tháng</th>
                            <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest text-stone-500">Tổng Tiền</th>
                            <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest text-stone-500">Trạng Thái</th>
                            <th className="px-10 py-5"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dfbfc0]/10">
                        {orders.map((order, index) => {
                            const orderId = order._id || order.id || `UNKNOWN-${index}`;
                            const dateStr = new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit', year: 'numeric' });
                            const customerName = order.user?.name || order.shippingInfo?.fullName || order.customer || 'Khách vãng lai';
                            const status = order.orderStatus || order.status || 'Chờ xử lý';
                            const total = order.totalPrice || order.total || 0;

                            let statusColor = 'bg-stone-50 text-stone-600 border-stone-100';
                            let statusText = status === 'Pending' ? 'Chờ xử lý' : status;
                            if(status === 'Processing') { statusColor = 'bg-blue-50 text-blue-600 border-blue-100'; statusText = 'Đang xử lý'; }
                            if(status === 'Shipped') { statusColor = 'bg-amber-50 text-amber-600 border-amber-100'; statusText = 'Đang giao'; }
                            if(status === 'Delivered') { statusColor = 'bg-emerald-50 text-emerald-600 border-emerald-100'; statusText = 'Đã giao'; }
                            
                            return (
                                <tr key={orderId} className="hover:bg-[#f4f4f2]/50 transition-colors">
                                    <td className="px-10 py-6 font-label text-sm text-stone-600">#{String(orderId).substring(0,8)}</td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#e8e8e6] flex items-center justify-center font-headline font-bold text-[#ee5a6f]">
                                                {String(customerName).charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-body text-sm font-medium">{customerName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 font-body text-sm text-stone-500">{dateStr}</td>
                                    <td className="px-6 py-6 font-body text-sm font-bold">${Number(total).toLocaleString()}</td>
                                    <td className="px-6 py-6">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-label uppercase tracking-widest border ${statusColor}`}>
                                            {statusText}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <span className="material-symbols-outlined text-stone-400 cursor-pointer hover:text-[#ee5a6f] transition-colors">more_horiz</span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
