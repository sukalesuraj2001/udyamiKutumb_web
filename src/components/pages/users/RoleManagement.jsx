import { useState } from "react";
import { StatCards, TabBar } from "../users/RoleManagement/UI.jsx";
import { STATS } from "../users/RoleManagement/data/roles.js";
import OrgChartTab from "../users/RoleManagement/tabs/OrgChartTab.jsx";
import RoleCardsTab from "../users/RoleManagement/tabs/RoleCardsTab";
import AssignRolesTab from "../users/RoleManagement/tabs/AssignRolesTab";
import PermissionsTab from "../users/RoleManagement/tabs/PermissionsTab";
import LegacyMatrixTab from "../users/RoleManagement/tabs/LegacyMatrixTab";
import LegacyTreeTab from "../users/RoleManagement/tabs/LegacyTreeTab";

export default function RoleManagement() {
    const [tab, setTab] = useState("orgchart");

    return (
        <div className="min-h-full bg-[#f4f5f7] -m-6 p-6 space-y-5">
            {/* Page Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-[20px] font-bold text-gray-900 leading-tight tracking-tight">Role Management</h1>
                    <p className="text-[12.5px] text-gray-500 mt-0.5">Configure role hierarchies, permissions, and assignments</p>
                </div>
            </div>

            {/* Stat Cards */}
            <StatCards stats={STATS} />

            {/* Tab container */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <TabBar active={tab} onChange={setTab} />
                <div className="p-5">
                    {tab === "orgchart" && <OrgChartTab />}
                    {tab === "rolecards" && <RoleCardsTab />}
                    {tab === "assignroles" && <AssignRolesTab />}
                    {tab === "permissions" && <PermissionsTab />}
                    {tab === "legacymatrix" && <LegacyMatrixTab />}
                    {tab === "legacytree" && <LegacyTreeTab />}
                </div>
            </div>
        </div>
    );
}