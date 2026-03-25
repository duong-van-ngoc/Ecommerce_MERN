import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ user, children }) {
    return (
        <div className="min-h-screen bg-[#f9f9f7] text-[#1a1c1b] font-body selection:bg-[#ffdadb] selection:text-[#40000e]">
            <div className="no-print">
                <Sidebar user={user} />
                <Header user={user} />
            </div>
            <main className="ml-64 pt-20 px-12 pb-12 print:m-0 print:p-0">
                {children}
            </main>
        </div>
    );
}
