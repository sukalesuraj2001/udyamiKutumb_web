import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar.jsx";
import Loader from "./Loader.jsx";
import { useSelector } from "react-redux";

function AdminLayout() {
    const [isOpen, setIsOpen] = useState(true);
    const { isLoading } = useSelector((state) => state.globalLoader);

    return (
        <div className="min-h-screen bg-zinc-50">
            <Sidebar isOpen={isOpen} onToggle={() => setIsOpen((o) => !o)} />

            {/* Global Loader Overlay */}
            {isLoading && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <Loader Loader variant="card" />
                </div>
            )}

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