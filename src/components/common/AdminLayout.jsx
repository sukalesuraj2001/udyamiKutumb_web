import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar.jsx";
import useBreakpoint from "../utils/useBreakpoint.js";

function AdminLayout() {
    const isMobile = useBreakpoint() === "mobile";

    // On mobile the sidebar is an overlay drawer, so it must start CLOSED and
    // open only when the user taps the menu button. On tablet/desktop it
    // starts expanded.
    const [isOpen, setIsOpen] = useState(() => !isMobile);

    // When the screen crosses the mobile breakpoint (rotate / resize),
    // reset to the right default: closed drawer on mobile, expanded on desktop.
    const [wasMobile, setWasMobile] = useState(isMobile);
    if (wasMobile !== isMobile) {
        setWasMobile(isMobile);
        setIsOpen(!isMobile);
    }

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