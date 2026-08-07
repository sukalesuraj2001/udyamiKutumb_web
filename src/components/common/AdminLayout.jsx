import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar.jsx";

function AdminLayout() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="min-h-screen bg-zinc-50">
            <Sidebar isOpen={isOpen} onToggle={() => setIsOpen((o) => !o)} />

            <main
                className={`transition-all duration-300 ease-in-out p-4 sm:p-6 md:p-8 pt-20 md:pt-8 min-w-0 flex-1 ${isOpen ? "md:ml-64" : "md:ml-[70px]"
                    }`}
            >
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;