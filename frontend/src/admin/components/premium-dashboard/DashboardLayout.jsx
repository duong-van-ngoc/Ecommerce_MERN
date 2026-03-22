import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ user, children }) {
    return (
        <div className="min-h-screen bg-[#f9f9f7] text-[#1a1c1b] font-body selection:bg-[#ffdadb] selection:text-[#40000e]">
            <Sidebar user={user} />
            <Header user={user} />
            <main className="ml-64 pt-20 px-12 pb-12">
                {children}
            </main>
        </div>
    );
}
