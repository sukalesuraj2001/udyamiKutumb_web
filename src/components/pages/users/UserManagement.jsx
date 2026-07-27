import React, { useMemo, useState } from "react";
import { Download, Plus, CheckCircle2, XCircle } from "lucide-react";

// ── Sub-components ────────────────────────────────────────────
import UserStats      from "./userManagement/UserStats.jsx";
import UserTabs       from "./userManagement/UserTabs.jsx";
import UserFilters    from "./userManagement/UserFilters.jsx";
import UserTable      from "./userManagement/UserTable.jsx";

// ── Modals ────────────────────────────────────────────────────
import AddUserModal       from "./userManagement/modals/AddUserModal.jsx";
import UserDetailsModal   from "./userManagement/modals/UserDetailsModal.jsx";
import AssignRoleModal    from "./userManagement/modals/AssignRoleModal.jsx";
import ConfirmationModal  from "./userManagement/modals/ConfirmationModal.jsx";

// ── Sample Data ───────────────────────────────────────────────
const SAMPLE_USERS = [
  { id: 1, name: "Thimmegowda A R", email: "9060142011@udyamicircle.app", phone: "9060142011", userType: "Both",   roles: ["User"],         assembly: "—",         ward: "—",        status: "verified", registered: "14 Jul 2026", lastLogin: "14 Jul 2026" },
  { id: 2, name: "Abhishek M",      email: "6363343135@udyamicircle.app", phone: "6363343135", userType: "Both",   roles: ["User"],         assembly: "—",         ward: "—",        status: "verified", registered: "14 Jul 2026", lastLogin: "14 Jul 2026" },
  { id: 3, name: "Esakki Raj",      email: "6383436841@udyamicircle.app", phone: "6383436841", userType: "Both",   roles: ["User"],         assembly: "—",         ward: "—",        status: "verified", registered: "13 Jul 2026", lastLogin: "13 Jul 2026" },
  { id: 4, name: "Ramesh Kumar",    email: "9876543210@udyamicircle.app", phone: "9876543210", userType: "Member", roles: ["Admin"],        assembly: "Anekal",    ward: "Bengluru north",    status: "verified", registered: "12 Jul 2026", lastLogin: "12 Jul 2026" },
  { id: 5, name: "Priya Sharma",    email: "8765432109@udyamicircle.app", phone: "8765432109", userType: "Both",   roles: ["User"],         assembly: "B.T.M Layout", ward: "Madiwala", status: "pending", registered: "11 Jul 2026", lastLogin: "11 Jul 2026" },
  { id: 6, name: "Suresh Babu",     email: "7654321098@udyamicircle.app", phone: "7654321098", userType: "Member", roles: ["User"],         assembly: "Yelahanka", ward: "—",        status: "inactive", registered: "10 Jul 2026", lastLogin: "09 Jul 2026" },
  { id: 7, name: "Kavitha R",       email: "6543210987@udyamicircle.app", phone: "6543210987", userType: "Both",   roles: ["Admin", "User"], assembly: "—",        ward: "—",        status: "verified", registered: "09 Jul 2026", lastLogin: "09 Jul 2026" },
  { id: 8, name: "Mohan Das",       email: "5432109876@udyamicircle.app", phone: "5432109876", userType: "Member", roles: ["User"],         assembly: "Anekal",    ward: "N.S Palya", status: "pending", registered: "08 Jul 2026", lastLogin: "—" },
];

const PAYMENT_APPROVALS = [
  { id: 1, user: "Ramesh Kumar", phone: "9876543210", plan: "Prime", amount: "₹2,999", date: "14 Jul 2026", status: "pending" },
  { id: 2, user: "Priya Sharma", phone: "8765432109", plan: "Basic", amount: "₹999",   date: "13 Jul 2026", status: "approved" },
  { id: 3, user: "Mohan Das",    phone: "5432109876", plan: "Prime", amount: "₹2,999", date: "12 Jul 2026", status: "pending" },
];

const ACTIVITY_LOG = [
  { id: 1, user: "Thimmegowda A R", action: "Logged in",        module: "Auth",     time: "14 Jul 2026, 10:32 AM", ip: "192.168.1.1" },
  { id: 2, user: "Abhishek M",      action: "Updated profile",  module: "Profile",  time: "14 Jul 2026, 09:15 AM", ip: "192.168.1.2" },
  { id: 3, user: "Esakki Raj",      action: "Logged in",        module: "Auth",     time: "13 Jul 2026, 06:45 PM", ip: "192.168.1.3" },
  { id: 4, user: "Kavitha R",       action: "Role assigned",    module: "Roles",    time: "13 Jul 2026, 02:10 PM", ip: "192.168.1.4" },
  { id: 5, user: "Ramesh Kumar",    action: "Payment submitted", module: "Payments", time: "12 Jul 2026, 11:00 AM", ip: "192.168.1.5" },
];

// ── Badge helpers (used in Payments / Activity sub-tabs) ──────
const PAY_STATUS_MAP = {
  pending:  { label: "Pending",  cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
};

function PayStatusBadge({ status }) {
  const s = PAY_STATUS_MAP[status] ?? PAY_STATUS_MAP.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

const MODAL_NONE = { type: null, payload: null };

// ── Main Component ────────────────────────────────────────────
export default function UserManagement() {
  // ── Tab state ──
  const [tab, setTab] = useState("users");

  // ── Filter state ──
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter,   setTypeFilter]   = useState("all");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");

  // ── Centralized modal state ──
  const [modal, setModal] = useState(MODAL_NONE);

  const openModal  = (type, payload = null) => setModal({ type, payload });
  const closeModal = () => setModal(MODAL_NONE);

  // ── Derived stats ──
  const stats = {
    total:    SAMPLE_USERS.length,
    verified: SAMPLE_USERS.filter((u) => u.status === "verified").length,
    roles:    11,
    recent:   10,
  };

  // ── Filtered users ──
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_USERS.filter((u) => {
      if (roleFilter   !== "all" && !u.roles.includes(roleFilter)) return false;
      if (statusFilter !== "all" && u.status   !== statusFilter)   return false;
      if (typeFilter   !== "all" && u.userType !== typeFilter)      return false;
      if (q && !u.name.toLowerCase().includes(q) && !u.phone.includes(q) && !u.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, roleFilter, statusFilter, typeFilter]);

  const hasFilters = !!(search || roleFilter !== "all" || statusFilter !== "all" || typeFilter !== "all" || dateFrom || dateTo);

  const clearFilters = () => {
    setSearch(""); setRoleFilter("all"); setStatusFilter("all");
    setTypeFilter("all"); setDateFrom(""); setDateTo("");
  };

  // ── Action handlers ──
  const handleAddUser       = (formData)  => { /* TODO: API call */ closeModal(); };
  const handleAssignRole    = ({ user, newRole }) => { /* TODO: API call */ closeModal(); };
  const handleDeleteUser    = () => { /* TODO: API call */ closeModal(); };
  const handleResetPassword = () => { /* TODO: API call */ closeModal(); };
  const handleApprovePayment = () => { /* TODO: API call */ closeModal(); };
  const handleRejectPayment  = () => { /* TODO: API call */ closeModal(); };

  // When "Change Role" is clicked from UserDetailsModal — close details, open assign role
  const handleChangeRoleFromDetails = (user) => {
    closeModal();
    openModal("assignRole", user);
  };

  // When "Delete" is clicked from UserDetailsModal — close details, open confirmation
  const handleDeleteFromDetails = (user) => {
    closeModal();
    openModal("deleteUser", user);
  };

  // ── Confirmation modal config ──
  const confirmationConfig = (() => {
    switch (modal.type) {
      case "deleteUser":
        return {
          title:       "Delete User",
          description: `Are you sure you want to delete ${modal.payload?.name}? This action cannot be undone.`,
          confirmText: "Delete",
          variant:     "danger",
          onConfirm:   handleDeleteUser,
        };
      case "resetPassword":
        return {
          title:       "Reset Password",
          description: `Send a password reset link to ${modal.payload?.name}?`,
          confirmText: "Send Reset Link",
          variant:     "warning",
          onConfirm:   handleResetPassword,
        };
      case "approvePayment":
        return {
          title:       "Approve Payment",
          description: `Approve the ${modal.payload?.plan} plan payment from ${modal.payload?.user}?`,
          confirmText: "Approve",
          variant:     "success",
          onConfirm:   handleApprovePayment,
        };
      case "rejectPayment":
        return {
          title:       "Reject Payment",
          description: `Reject the ${modal.payload?.plan} plan payment from ${modal.payload?.user}?`,
          confirmText: "Reject",
          variant:     "danger",
          onConfirm:   handleRejectPayment,
        };
      default:
        return null;
    }
  })();

  const isConfirmationModal = !!confirmationConfig;

  return (
    <div className="min-h-full bg-[#f4f5f7] -m-6 p-6 space-y-5">

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900 leading-tight tracking-tight">User Management</h1>
          <p className="text-[12.5px] text-gray-500 mt-0.5">Manage user accounts, roles, and activity</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 h-8 bg-white border border-gray-200 text-[12.5px] font-medium text-gray-700 px-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={13} />
            Export
          </button>
          <button
            onClick={() => openModal("addUser")}
            className="inline-flex items-center gap-2 h-8 bg-blue-600 text-white text-[12.5px] font-semibold px-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            <Plus size={14} />
            Add User
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <UserStats
        total={stats.total}
        verified={stats.verified}
        roles={stats.roles}
        recent={stats.recent}
      />

      {/* ── Tabs ── */}
      <UserTabs activeTab={tab} totalUsers={stats.total} onChange={setTab} />

      {/* ══════════ USERS TAB ══════════ */}
      {tab === "users" && (
        <div className="space-y-3">
          <UserFilters
            search={search}
            roleFilter={roleFilter}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            dateFrom={dateFrom}
            dateTo={dateTo}
            hasFilters={hasFilters}
            onSearchChange={setSearch}
            onRoleChange={setRoleFilter}
            onStatusChange={setStatusFilter}
            onTypeChange={setTypeFilter}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onClearFilters={clearFilters}
          />
          <UserTable
            users={filteredUsers}
            totalUsers={SAMPLE_USERS.length}
            onView={(u)            => openModal("viewUser",  u)}
            onPermissions={(u)     => openModal("viewUser",  u)}
            onResetPassword={(u)   => openModal("resetPassword", u)}
            onAssignRole={(u)      => openModal("assignRole", u)}
          />
        </div>
      )}

      {/* ══════════ PAYMENT APPROVALS TAB ══════════ */}
      {tab === "payments" && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[13.5px] font-semibold text-gray-900">Payment Approvals</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Review and approve pending membership payments</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              {PAYMENT_APPROVALS.filter((p) => p.status === "pending").length} Pending
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["User", "Phone", "Plan", "Amount", "Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10.5px] font-semibold tracking-wider uppercase text-gray-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PAYMENT_APPROVALS.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{p.user}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                        {p.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{p.amount}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PayStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.status === "pending" ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openModal("approvePayment", p)}
                            className="inline-flex items-center gap-1 h-7 px-3 text-[11.5px] font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                          >
                            <CheckCircle2 size={11} /> Approve
                          </button>
                          <button
                            onClick={() => openModal("rejectPayment", p)}
                            className="inline-flex items-center gap-1 h-7 px-3 text-[11.5px] font-semibold bg-white border border-gray-200 text-gray-500 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <XCircle size={11} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[12px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════ ACTIVITY LOG TAB ══════════ */}
      {tab === "activity" && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[13.5px] font-semibold text-gray-900">Activity Log</p>
            <p className="text-[12px] text-gray-400 mt-0.5">Recent user actions across the platform</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["User", "Action", "Module", "Time", "IP Address"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10.5px] font-semibold tracking-wider uppercase text-gray-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ACTIVITY_LOG.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{a.user}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{a.action}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        {a.module}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{a.time}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-[11.5px] whitespace-nowrap">{a.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
            <p className="text-[12px] text-gray-400">
              Showing <span className="font-semibold text-gray-600">{ACTIVITY_LOG.length}</span> recent actions
            </p>
          </div>
        </div>
      )}

      {/* ══════════ MODALS ══════════ */}

      <AddUserModal
        open={modal.type === "addUser"}
        onClose={closeModal}
        onSubmit={handleAddUser}
      />

      <UserDetailsModal
        open={modal.type === "viewUser"}
        user={modal.payload}
        onClose={closeModal}
        onChangeRole={handleChangeRoleFromDetails}
        onDelete={handleDeleteFromDetails}
      />

      <AssignRoleModal
        open={modal.type === "assignRole"}
        user={modal.payload}
        onClose={closeModal}
        onSubmit={handleAssignRole}
      />

      {/* Single reusable confirmation modal for all destructive / action-only operations */}
      {isConfirmationModal && (
        <ConfirmationModal
          open
          title={confirmationConfig.title}
          description={confirmationConfig.description}
          confirmText={confirmationConfig.confirmText}
          cancelText="Cancel"
          variant={confirmationConfig.variant}
          loading={false}
          onConfirm={confirmationConfig.onConfirm}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}