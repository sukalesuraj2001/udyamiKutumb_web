import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar.jsx";
import { useSelector } from "react-redux";
function AdminLayout() {
    const [isOpen, setIsOpen] = useState(true);
    const { isLoading } = useSelector((state) => state.globalLoader);
    return (
        <div className="min-h-screen bg-zinc-50">
            <Sidebar isOpen={isOpen} onToggle={() => setIsOpen((o) => !o)} />
            {isLoading && <Loader />}
            <main
                className={`transition-all duration-300 ease-in-out p-8 ${isOpen ? "ml-64" : "ml-20"
                    }`}
            >
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;