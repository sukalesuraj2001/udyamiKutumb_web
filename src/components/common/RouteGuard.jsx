import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";



export default function RouteGuard({ guestOnly = false, allowedRoles }) {
  const { token, user } = useSelector((s) => s.auth);
  const location = useLocation();


  const homeFor = (u) => {
    if (u?.role === "SuperAdmin") return "/super-admin-dashboard";
    if (u?.role === "StateHead") return "/state-head-dashboard";
    if (u?.role === "DistrictHead") return "/district-head-dashboard";
    if (u?.role === "TalukHead") return "/taluk-head-dashboard";
    if (u?.role === "WardChairman") return "/wardChairman-head-dashboard";
    if (u?.role === "ChannelPartner") return "/channelPartner-dashboard";  // ← fix
    if (u?.role === "admin") return "/admin-dashboard";
    if (u?.role === "Member") return "/member-dashboard";
    return "/dashboard";
  };

  if (guestOnly) {
    return token ? <Navigate to={homeFor(user)} replace /> : <Outlet />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={homeFor(user)} replace />;
  }

  return <Outlet />;
}