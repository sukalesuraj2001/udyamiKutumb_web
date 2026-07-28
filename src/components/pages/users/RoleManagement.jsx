import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRoles } from "../../redux/slices/rolesSlice.js";
import { fetchDashboard } from "../../redux/slices/dashboardSlice";
import { StatCards, TabBar } from "../users/RoleManagement/UI.jsx";
import OrgChartTab from "../users/RoleManagement/tabs/OrgChartTab.jsx";
import RoleCardsTab from "../users/RoleManagement/tabs/RoleCardsTab";
import AssignRolesTab from "../users/RoleManagement/tabs/AssignRolesTab";
import PermissionsTab from "../users/RoleManagement/tabs/PermissionsTab";
import LegacyMatrixTab from "../users/RoleManagement/tabs/LegacyMatrixTab";
import LegacyTreeTab from "../users/RoleManagement/tabs/LegacyTreeTab";

const ADMIN_KEYWORDS = ["admin", "super", "owner", "master"];

export default function RoleManagement() {
    const dispatch = useDispatch();
    const [tab, setTab] = useState("orgchart");

    // ✅ Correct slice keys
    const roles  = useSelector((s) => s.roles.roles);    // rolesSlice → roles: []
    const counts = useSelector((s) => s.dashboard.stats); // dashboardSlice → stats: {}

    useEffect(() => {
        dispatch(fetchRoles());
        dispatch(fetchDashboard());
    }, [dispatch]);

    const stats = useMemo(() => [
        { label: "Total Roles",      value: roles.length },
        { label: "Total Users",      value: counts?.totalUsers ?? 0 },
        { label: "Hierarchy Levels", value: new Set(roles.map((r) => r.role)).size },
        { label: "Admin Roles",      value: roles.filter((r) =>
            ADMIN_KEYWORDS.some((kw) => r.roleName.toLowerCase().includes(kw))
          ).length },
    ], [roles, counts]);

    return (
        <div className="min-h-full bg-[#f4f5f7] -m-6 p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-[20px] font-bold text-gray-900 leading-tight tracking-tight">Role Management</h1>
                    <p className="text-[12.5px] text-gray-500 mt-0.5">Configure role hierarchies, permissions, and assignments</p>
                </div>
            </div>

            <StatCards stats={stats} />

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <TabBar active={tab} onChange={setTab} />
                <div className="p-5">
                    {tab === "orgchart"     && <OrgChartTab />}
                    {tab === "rolecards"    && <RoleCardsTab />}
                    {tab === "assignroles"  && <AssignRolesTab />}
                    {tab === "permissions"  && <PermissionsTab />}
                    {tab === "legacymatrix" && <LegacyMatrixTab />}
                    {tab === "legacytree"   && <LegacyTreeTab />}
                </div>
            </div>
        </div>
    );
}