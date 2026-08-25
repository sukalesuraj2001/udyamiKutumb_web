import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    LayoutDashboard, Building2, Briefcase, UserCog, IndianRupee,
    HandHeart, TrendingUp, ChevronLeft, ChevronRight, ChevronDown,
    ChevronUp, Users, LogOut, Globe, ShieldCheck, Settings, Menu, X as CloseIcon,
} from "lucide-react";
import { logout } from "../redux/slices/authSlice.js";
import useBreakpoint from "../utils/useBreakpoint.js";

const profilePath = {
    SuperAdmin: "/super-admin-dashboard/profile",
    superAdmin: "/super-admin-dashboard/profile",
    StateHead: "/state-head-dashboard/profile",
    stateHead: "/state-head-dashboard/profile",
    DistrictHead: "/district-head-dashboard/profile",
    districtHead: "/district-head-dashboard/profile",
    TalukHead: "/taluk-head-dashboard/profile",
    talukHead: "/taluk-head-dashboard/profile",
    WardChairman: "/wardChairman-head-dashboard/profile",
    wardChairman: "/wardChairman-head-dashboard/profile",
    ChannelPartner: "/channelPartner-dashboard/profile",
    channelPartner: "/channelPartner-dashboard/profile",
    Admin: "/admin-dashboard/profile",
    admin: "/admin-dashboard/profile",
    Member: "/member/profile",
    member: "/member/profile",
};



const NAV = {
    admin: [
        { type: "link", name: "Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },
        {
            type: "group", key: "members", name: "Members", icon: Building2, children: [
                { name: "Udyami Database", path: "/admin-dashboard/members" },
                { name: "Roles", path: "/admin-dashboard/members/roles" },
                { name: "Channel Partners", path: "/admin-dashboard/members/channelPartners" },
            ]
        },
        {
            type: "group", key: "Operations", name: "Operations", icon: Briefcase, children: [
                { name: "Lead Management", path: "/admin-dashboard/lead-management" },
                { name: "Send Messages", path: "/admin-dashboard/communications" },
                { name: "Comm Service Request", path: "/admin-dashboard/service-request" },
                { name: "Comm Credits Admin", path: "/register" },
                { name: "Field Operations", path: "/register" },
                { name: "Geo-Fencing", path: "/register" },
                { name: "Member Map", path: "/admin-dashboard/member-map" },
                { name: "Area Chart", path: "/area-chart" },
                { name: "UCN", path: "/admin-dashboard/business-circle" },
                { name: "Networking", path: "/register" },
            ]
        },
        {
            type: "group", key: "revenue", name: "Revenue", icon: IndianRupee, children: [
                { name: "Membership", path: "/admin-dashboard/users" },
                { name: "Registrations", path: "/register" },
                { name: "CSR Funding", path: "/admin-dashboard/users" },
            ]
        },
        {
            type: "group", key: "community", name: "Community Programmes", icon: HandHeart, children: [
                { name: "Programmes Hub", path: "/admin-dashboard/users" },
                { name: "Udyami Queens", path: "/register" },
                { name: "Senior Expert Panel", path: "/admin-dashboard/users" },
                { name: "Youth Programme", path: "/admin-dashboard/users" },
                { name: "Children Programme", path: "/admin-dashboard/users" },
            ]
        },
        {
            type: "group", key: "growth", name: "Growth", icon: TrendingUp, children: [
                { name: "Training & Jobs", path: "/admin-dashboard/users" },
                { name: "Reward & Recognition", path: "/register" },
                { name: "Analytics & Reports", path: "/admin-dashboard/users" },
            ]
        },
        {
            type: "group", key: "digital", name: "Digital", icon: Globe, children: [
                { name: "Social Onboarding", path: "/admin-dashboard/users" },
                { name: "Social Management", path: "/register" },
                { name: "Social Media Manager", path: "/admin-dashboard/users" },
                { name: "Social Media Overview", path: "/admin-dashboard/users" },
                { name: "Website & Media", path: "/admin-dashboard/users" },
            ]
        },
        {
            type: "group", key: "moderation", name: "Moderation", icon: ShieldCheck, children: [
                { name: "Job Management", path: "/admin-dashboard/users" },
                { name: "Post Management", path: "/register" },
                { name: "News Management", path: "/admin-dashboard/users" },
            ]
        },
        {
            type: "group", key: "admin", name: "Admin", icon: Settings, children: [
                { name: "Seed Rural Data", path: "/admin-dashboard/users" },
                { name: "Settings", path: "/register" },
                { name: "Users", path: "/admin-dashboard/members/new" },
            ]
        },
    ],
    SuperAdmin: [
        { type: "link", name: "Dashboard", icon: LayoutDashboard, path: "/super-admin-dashboard" },
        {
            type: "group", key: "sp-members", name: "Members", icon: Users, children: [
                // { name: "State Head", path: "/super-admin-dashboard/state-head" },
                { name: "District Head", path: "/super-admin-dashboard/district-head" },
                { name: "Taluka Head", path: "/super-admin-dashboard/taluk-head" },
                { name: "Ward / Hobli Head", path: "/super-admin-dashboard/ward-head" },
                // { name: "Channel Partners", path: "/super-admin-dashboard/members/channelPartners" },
            ]
        },
        {
            type: "group", key: "WC-Operations", name: "Operations", icon: Briefcase, children: [
                // { name: "Lead Management", path: "/admin-dashboard/lead-management" },
                { name: "Send Messages", path: "/super-admin-dashboard/communications" },
                // { name: "Comm Service Request", path: "/admin-dashboard/users" },
                // { name: "Comm Credits Admin", path: "/register" },
                // { name: "Field Operations", path: "/register" },
                // { name: "Geo-Fencing", path: "/register" },
                { name: "Member Map", path: "/super-admin-dashboard/member-map" },
                { name: "UCN", path: "/super-admin-dashboard/business-circle" },
                // { name: "Networking", path: "/register" },
            ]
        },
        {
            type: "group", key: "sp-wardChart", name: "Ward Chart", icon: Users, children: [
                { name: "Area Chart", path: "/super-admin-dashboard/area-chart" },
            ]
        },
        {
            type: "group", key: "sp-revenue", name: "Membership", icon: Briefcase, children: [
                { name: "Manage Membership", path: "/super-admin-dashboard/membership" },
                { name: "Registrations", path: "/super-admin-dashboard/membership/registration" },
            ]
        },
        {
            type: "group", key: "moderation", name: "Moderation", icon: ShieldCheck, children: [
                { name: "Job Management", path: "/super-admin-dashboard/job-management" },
                // { name: "Post Management", path: "/register" },
                { name: "News Management", path: "/super-admin-dashboard/news-management" },
            ]
        },
        {
            type: "group", key: "sp-admin", name: "Employees", icon: UserCog, children: [
                // { name: "Add Employee", path: "/super-admin-dashboard/user-management" },
                // { name: "Manage Employee", path: "/manage" },
                { name: "Manage Roles", path: "/super-admin-dashboard/membership/role-management" },
                { name: "Create Ward / Hobli", path: "/super-admin-dashboard/create-ward" },
            ]
        },
        {
            type: "group", key: "sp-formfield", name: "Form Field", icon: UserCog, children: [
                // { name: "Member Onboard", path: "/admin-dashboard/users" },
                { name: "Channel Partners Onboard", path: "/super-admin-dashboard/cp-onboarding" },
            ]
        },
    ],
    NationalHead: [
        {
            type: "link",
            name: "Dashboard",
            icon: LayoutDashboard,
            path: "/national-head-dashboard",
        },
        {
            type: "group",
            key: "nh-members",
            name: "Members",
            icon: Users,
            children: [
                { name: "State Head", path: "/national-head-dashboard/state-head" },
                { name: "District Head", path: "/national-head-dashboard/district-head" },
                { name: "Taluk Head", path: "/national-head-dashboard/taluk-head" },
                { name: "Ward / Hobli Head", path: "/national-head-dashboard/ward-head" },
                // { name: "Channel Partners", path: "/national-head-dashboard/members/channelPartners" },
            ],
        },
        {
            type: "group",
            key: "nh-operations",
            name: "Operations",
            icon: Briefcase,
            children: [
                { name: "Send Messages", path: "/national-head-dashboard/communications" },
                { name: "Member Map", path: "/national-head-dashboard/member-map" },
                { name: "UCN", path: "/national-head-dashboard/business-circle" },
            ],
        },
        {
            type: "group",
            key: "nh-wardChart",
            name: "Ward Chart",
            icon: Users,
            children: [
                { name: "Area Chart", path: "/national-head-dashboard/area-chart" },
            ],
        },
        {
            type: "group",
            key: "nh-membership",
            name: "Membership",
            icon: Briefcase,
            children: [
                { name: "Manage Membership", path: "/national-head-dashboard/membership" },
                { name: "Registration", path: "/national-head-dashboard/membership/registration" },
            ],
        },
        {
            type: "group",
            key: "nh-employees",
            name: "Employees",
            icon: UserCog,
            children: [
                { name: "Manage Roles", path: "/national-head-dashboard/membership/role-management" },
                { name: "Create Ward", path: "/national-head-dashboard/create-ward" },
            ],
        },
    ],
    StateHead: [
        { type: "link", name: "Dashboard", icon: LayoutDashboard, path: "/state-head-dashboard" },
        {
            type: "group", key: "SH-members", name: "Members", icon: Users, children: [
                { name: "District Head", path: "/state-head-dashboard/district-head" },
                { name: "Taluk Head", path: "/state-head-dashboard/taluk-head" },
                { name: "Ward / Hobli Head", path: "/state-head-dashboard/ward-head" },
                { name: "Channel Partners", path: "/state-head-dashboard/members/channelPartners" },
            ]
        },
        {
            type: "group", key: "SHG-members", name: "Members", icon: Building2, children: [
                { name: "Udyami Database", path: "/state-head-dashboard/members" },
                { name: "Roles", path: "/state-head-dashboard/members/roles" },
                { name: "Channel Partners", path: "/state-head-dashboard/members/channelPartners" },
            ]
        },
        {
            type: "group", key: "SH-Operations", name: "Operations", icon: Briefcase, children: [
                { name: "Lead Management", path: "/state-head-dashboard/lead-management" },
                { name: "Send Messages", path: "/state-head-dashboard/communications" },
                { name: "Comm Service Request", path: "/state-head-dashboard/users" },
                { name: "Comm Credits Admin", path: "/register" },
                { name: "Field Operations", path: "/register" },
                { name: "Geo-Fencing", path: "/register" },
                { name: "Member Map", path: "/state-head-dashboard/member-map" },
                { name: "Area Chart", path: "/state-head-dashboard/area-chart" },
                { name: "UCN", path: "/state-head-dashboard/business-circle" },
                { name: "Networking", path: "/register" },
            ]
        },
        {
            type: "group", key: "SH-community", name: "Community Programmes", icon: HandHeart, children: [
                { name: "Programmes Hub", path: "/state-head-dashboard/users" },
                { name: "Udyami Queens", path: "/register" },
                { name: "Senior Expert Panel", path: "/state-head-dashboard/users" },
                { name: "Youth Programme", path: "/state-head-dashboard/users" },
                { name: "Children Programme", path: "/state-head-dashboard/users" },
            ]
        },
        {
            type: "group", key: "SH-growth", name: "Growth", icon: TrendingUp, children: [
                { name: "Training & Jobs", path: "/state-head-dashboard/users" },
                { name: "Reward & Recognition", path: "/register" },
                { name: "Analytics & Reports", path: "/state-head-dashboard/users" },
            ]
        },
        {
            type: "group", key: "SH-digital", name: "Digital", icon: Globe, children: [
                { name: "Social Onboarding", path: "/state-head-dashboard/users" },
                { name: "Social Management", path: "/register" },
                { name: "Social Media Manager", path: "/state-head-dashboard/users" },
                { name: "Social Media Overview", path: "/state-head-dashboard/users" },
                { name: "Website & Media", path: "/state-head-dashboard/users" },
            ]
        },

        {
            type: "group", key: "SH-moderation", name: "Moderation", icon: ShieldCheck, children: [
                { name: "Job Management", path: "/state-head-dashboard/users" },
                { name: "Post Management", path: "/register" },
                { name: "News Management", path: "/state-head-dashboard/users" },
            ]
        },
    ],
    DistrictHead: [
        { type: "link", name: "Dashboard", icon: LayoutDashboard, path: "/district-head-dashboard" },
        {
            type: "group", key: "DH-members", name: "Members", icon: Users, children: [
                { name: "Taluk Head", path: "/district-head-dashboard/taluk-head" },
                { name: "Ward / Hobli Head", path: "/district-head-dashboard/ward-head" },
                // { name: "Channel Partners", path: "/district-head-dashboard/members/channelPartners" },
            ]
        },
        // {
        //     type: "group", key: "DH-members-db", name: "Members", icon: Building2, children: [
        //         { name: "Udyami Database", path: "/district-head-dashboard/members" },
        //         { name: "Roles", path: "/district-head-dashboard/members/roles" },
        //         { name: "Channel Partners", path: "/district-head-dashboard/members/channelPartners" },
        //     ]
        // },
        {
            type: "group", key: "DH-Operations", name: "Operations", icon: Briefcase, children: [
                // { name: "Lead Management", path: "/district-head-dashboard/lead-management" },
                // { name: "Send Messages", path: "/district-head-dashboard/communications" },
                // { name: "Comm Service Request", path: "/district-head-dashboard/users" },
                // { name: "Comm Credits Admin", path: "/register" },
                // { name: "Field Operations", path: "/register" },
                // { name: "Geo-Fencing", path: "/register" },
                { name: "Member Map", path: "/district-head-dashboard/member-map" },
                { name: "Area Chart", path: "/district-head-dashboard/area-chart" },
                { name: "UCN", path: "/district-head-dashboard/business-circle" },
                // { name: "Networking", path: "/register" },
            ]
        },
        // {
        //     type: "group", key: "DH-community", name: "Community Programmes", icon: HandHeart, children: [
        //         { name: "Programmes Hub", path: "/district-head-dashboard/users" },
        //         { name: "Udyami Queens", path: "/register" },
        //         { name: "Senior Expert Panel", path: "/district-head-dashboard/users" },
        //         { name: "Youth Programme", path: "/district-head-dashboard/users" },
        //         { name: "Children Programme", path: "/district-head-dashboard/users" },
        //     ]
        // },
        // {
        //     type: "group", key: "DH-growth", name: "Growth", icon: TrendingUp, children: [
        //         { name: "Training & Jobs", path: "/district-head-dashboard/users" },
        //         { name: "Reward & Recognition", path: "/register" },
        //         { name: "Analytics & Reports", path: "/district-head-dashboard/users" },
        //     ]
        // },
        // {
        //     type: "group", key: "DH-digital", name: "Digital", icon: Globe, children: [
        //         { name: "Social Onboarding", path: "/district-head-dashboard/users" },
        //         { name: "Social Management", path: "/register" },
        //         { name: "Social Media Manager", path: "/district-head-dashboard/users" },
        //         { name: "Social Media Overview", path: "/district-head-dashboard/users" },
        //         { name: "Website & Media", path: "/district-head-dashboard/users" },
        //     ]
        // },
        {
            type: "group", key: "sp-admin", name: "Employees", icon: UserCog, children: [
                // { name: "Add Employee", path: "/district-head/user-management" },
                // { name: "Manage Employee", path: "/district-head/manage" },
                { name: "Manage Roles", path: "/district-head/role-management" },
                // { name: "Create Ward", path: "/super-admin-dashboard/create-ward" },
            ]
        },
        // {
        //     type: "group", key: "DH-moderation", name: "Moderation", icon: ShieldCheck, children: [
        //         { name: "Job Management", path: "/district-head-dashboard/users" },
        //         { name: "Post Management", path: "/register" },
        //         { name: "News Management", path: "/district-head-dashboard/users" },
        //     ]
        // },
    ],
    TalukHead: [
        { type: "link", name: "Dashboard", icon: LayoutDashboard, path: "/taluk-head-dashboard" },
        // {
        //     type: "group", key: "TH-members", name: "Members", icon: Users, children: [
        //         { name: "Ward / Hobli Head", path: "/taluk-head-dashboard/ward-head" },
        //         // { name: "Channel Partners", path: "/taluk-head-dashboard/members/channelPartners" },
        //     ]
        // },
        // {
        //     type: "group", key: "TH-members-db", name: "Members", icon: Building2, children: [
        //         { name: "Udyami Database", path: "/taluk-head-dashboard/members" },
        //         { name: "Roles", path: "/taluk-head-dashboard/members/roles" },
        //         { name: "Channel Partners", path: "/taluk-head-dashboard/members/channelPartners" },
        //     ]
        // },
        {
            type: "group", key: "TH-Operations", name: "Operations", icon: Briefcase, children: [
                // { name: "Lead Management", path: "/taluk-head-dashboard/lead-management" },
                // { name: "Send Messages", path: "/taluk-head-dashboard/communications" },
                // { name: "Comm Service Request", path: "/taluk-head-dashboard/users" },
                // { name: "Comm Credits Admin", path: "/register" },
                // { name: "Field Operations", path: "/register" },
                // { name: "Geo-Fencing", path: "/register" },
                { name: "Member Map", path: "/taluk-head-dashboard/member-map" },
                { name: "Area Chart", path: "/taluk-head-dashboard/area-chart" },
                { name: "UCN", path: "/taluk-head-dashboard/business-circle" },
                // { name: "Networking", path: "/register" },
            ]
        },
        // {
        //     type: "group", key: "TH-community", name: "Community Programmes", icon: HandHeart, children: [
        //         { name: "Programmes Hub", path: "/taluk-head-dashboard/users" },
        //         { name: "Udyami Queens", path: "/register" },
        //         { name: "Senior Expert Panel", path: "/taluk-head-dashboard/users" },
        //         { name: "Youth Programme", path: "/taluk-head-dashboard/users" },
        //         { name: "Children Programme", path: "/taluk-head-dashboard/users" },
        //     ]
        // },
        // {
        //     type: "group", key: "TH-growth", name: "Growth", icon: TrendingUp, children: [
        //         { name: "Training & Jobs", path: "/taluk-head-dashboard/users" },
        //         { name: "Reward & Recognition", path: "/register" },
        //         { name: "Analytics & Reports", path: "/taluk-head-dashboard/users" },
        //     ]
        // },
        // {
        //     type: "group", key: "TH-digital", name: "Digital", icon: Globe, children: [
        //         { name: "Social Onboarding", path: "/taluk-head-dashboard/users" },
        //         { name: "Social Management", path: "/register" },
        //         { name: "Social Media Manager", path: "/taluk-head-dashboard/users" },
        //         { name: "Social Media Overview", path: "/taluk-head-dashboard/users" },
        //         { name: "Website & Media", path: "/taluk-head-dashboard/users" },
        //     ]
        // },
        {
            type: "group", key: "sp-admin", name: "Employees", icon: UserCog, children: [
                // { name: "Add Employee", path: "/taluk-head/user-management" },
                // { name: "Manage Employee", path: "/taluk-head/manage" },
                { name: "Manage Roles", path: "/taluk-head/role-management" },
                // { name: "Create Ward", path: "/super-admin-dashboard/create-ward" },
            ]
        },
        // {
        //     type: "group", key: "TH-moderation", name: "Moderation", icon: ShieldCheck, children: [
        //         { name: "Job Management", path: "/taluk-head-dashboard/users" },
        //         { name: "Post Management", path: "/register" },
        //         { name: "News Management", path: "/taluk-head-dashboard/users" },
        //     ]
        // },
    ],
    WardChairman: [
        { type: "link", name: "Dashboard", icon: LayoutDashboard, path: "/wardChairman-head-dashboard" },
        // {
        //     type: "group", key: "WC-members", name: "Members", icon: Users, children: [
        //         { name: "Channel Partners", path: "/wardChairman-head-dashboard/members/channelPartners" },
        //     ]
        // },
        // {
        //     type: "group", key: "WC-members-db", name: "Members", icon: Building2, children: [
        //         { name: "Udyami Database", path: "/wardChairman-head-dashboard/members" },
        //         { name: "Roles", path: "/wardChairman-head-dashboard/members/roles" },
        //         { name: "Channel Partners", path: "/wardChairman-head-dashboard/members/channelPartners" },
        //     ]
        // },
        {
            type: "group", key: "WC-Operations", name: "Operations", icon: Briefcase, children: [
                // { name: "Lead Management", path: "/wardChairman-head-dashboard/lead-management" },
                // { name: "Send Messages", path: "/wardChairman-head-dashboard/communications" },
                // // { name: "Comm Service Request", path: "/wardChairman-head-dashboard/users" },
                // { name: "Comm Credits Admin", path: "/register" },
                // { name: "Field Operations", path: "/register" },
                // { name: "Geo-Fencing", path: "/register" },
                { name: "Member Map", path: "/wardChairman-head-dashboard/member-map" },
                { name: "Area Chart", path: "/wardChairman/area-chart" },
                // { name: "UCN", path: "/wardChairman-head-dashboard/business-circle" },
                // { name: "Networking", path: "/register" },
            ]
        },
        // {
        //     type: "group", key: "WC-community", name: "Community Programmes", icon: HandHeart, children: [
        //         { name: "Programmes Hub", path: "/wardChairman-head-dashboard/users" },
        //         { name: "Udyami Queens", path: "/register" },
        //         { name: "Senior Expert Panel", path: "/wardChairman-head-dashboard/users" },
        //         { name: "Youth Programme", path: "/wardChairman-head-dashboard/users" },
        //         { name: "Children Programme", path: "/wardChairman-head-dashboard/users" },
        //     ]
        // },
        // {
        //     type: "group", key: "WC-growth", name: "Growth", icon: TrendingUp, children: [
        //         { name: "Training & Jobs", path: "/wardChairman-head-dashboard/users" },
        //         { name: "Reward & Recognition", path: "/register" },
        //         { name: "Analytics & Reports", path: "/wardChairman-head-dashboard/users" },
        //     ]
        // },
        // {
        //     type: "group", key: "WC-digital", name: "Digital", icon: Globe, children: [
        //         { name: "Social Onboarding", path: "/wardChairman-head-dashboard/users" },
        //         { name: "Social Management", path: "/register" },
        //         { name: "Social Media Manager", path: "/wardChairman-head-dashboard/users" },
        //         { name: "Social Media Overview", path: "/wardChairman-head-dashboard/users" },
        //         { name: "Website & Media", path: "/wardChairman-head-dashboard/users" },
        //     ]
        // },
        // {
        //     type: "group", key: "WC-moderation", name: "Moderation", icon: ShieldCheck, children: [
        //         { name: "Job Management", path: "/wardChairman-head-dashboard/users" },
        //         { name: "Post Management", path: "/register" },
        //         { name: "News Management", path: "/wardChairman-head-dashboard/users" },
        //     ]
        // },
        {
            type: "group", key: "WC-cp", name: "Channel Partner", icon: ShieldCheck, children: [
                { name: "Channel Partner", path: "/wardChairman-head-dashboard/channel-partner" },
                // { name: "Channel Partners Onboard", path: "/wardChairman-head-dashboard/cp-onboarding" },
                { name: "Route Tracking", path: "/wardChairman-head-dashboard/cp-route-tracking" },
                { name: "Get Forms", path: "/wardChairman-head-dashboard/get-forms" },
                // { name: "Form Submitions", path: "/wardChairman-head-dashboard/forms" },
                { name: "Submitions List", path: "/wardChairman-head-dashboard/submitions-list" },
                { name: "Applications", path: "/ward-chairman/cp/applications" },
                { name: "Partner Enrollment", path: "/ward-chairman/cp/interviews" },
                { name: "Channel Partners Survey List", path: "/ward-chairman/cp/cp-list" },

                // { name: "Post Management", path: "/register" },
                // { name: "News Management", path: "/wardChairman-head-dashboard/users" },
            ]
        },
        {
            type: "group", key: "sp-admin", name: "Employees", icon: UserCog, children: [
                // { name: "Add Employee", path: "/taluk-head/user-management" },
                // { name: "Manage Employee", path: "/taluk-head/manage" },
                { name: "Manage Roles", path: "/wardChairman-head-dashboard/rolemanagement" },
                // { name: "Create Ward", path: "/super-admin-dashboard/create-ward" },
            ]
        },
    ],
    ChannelPartner: [
        { type: "link", name: "Dashboard", icon: LayoutDashboard, path: "/channelPartner-dashboard" },
        {
            type: "group", key: "CP-members", name: "Members", icon: Building2, children: [
                { name: "Udyami Database", path: "/channelPartner-dashboard/members" },
                { name: "Roles", path: "/channelPartner-dashboard/members/roles" },
                { name: "Channel Partners", path: "/channelPartner-dashboard/members/channelPartners" },
            ]
        },
        {
            type: "group", key: "CP-Operations", name: "Operations", icon: Briefcase, children: [
                { name: "Lead Management", path: "/channelPartner-dashboard/lead-management" },
                { name: "Send Messages", path: "/channelPartner-dashboard/communications" },
                { name: "Comm Service Request", path: "/channelPartner-dashboard/users" },
                { name: "Comm Credits Admin", path: "/register" },
                { name: "Field Operations", path: "/register" },
                { name: "Geo-Fencing", path: "/register" },
                { name: "Member Map", path: "/channelPartner-dashboard/member-map" },
                { name: "Area Chart", path: "/channelPartner-dashboard/area-chart" },
                { name: "UCN", path: "/channelPartner-dashboard/business-circle" },
                { name: "Networking", path: "/register" },
            ]
        },
        {
            type: "group", key: "CP-community", name: "Community Programmes", icon: HandHeart, children: [
                { name: "Programmes Hub", path: "/channelPartner-dashboard/users" },
                { name: "Udyami Queens", path: "/register" },
                { name: "Senior Expert Panel", path: "/channelPartner-dashboard/users" },
                { name: "Youth Programme", path: "/channelPartner-dashboard/users" },
                { name: "Children Programme", path: "/channelPartner-dashboard/users" },
            ]
        },
        {
            type: "group", key: "CP-growth", name: "Growth", icon: TrendingUp, children: [
                { name: "Training & Jobs", path: "/channelPartner-dashboard/users" },
                { name: "Reward & Recognition", path: "/register" },
                { name: "Analytics & Reports", path: "/channelPartner-dashboard/users" },
            ]
        },
        {
            type: "group", key: "CP-digital", name: "Digital", icon: Globe, children: [
                { name: "Social Onboarding", path: "/channelPartner-dashboard/users" },
                { name: "Social Management", path: "/register" },
                { name: "Social Media Manager", path: "/channelPartner-dashboard/users" },
                { name: "Social Media Overview", path: "/channelPartner-dashboard/users" },
                { name: "Website & Media", path: "/channelPartner-dashboard/users" },
            ]
        },
        {
            type: "group", key: "CP-moderation", name: "Moderation", icon: ShieldCheck, children: [
                { name: "Job Management", path: "/channelPartner-dashboard/users" },
                { name: "Post Management", path: "/register" },
                { name: "News Management", path: "/channelPartner-dashboard/users" },
            ]
        },
    ],
    Member: [
        { type: "link", name: "Dashboard", icon: LayoutDashboard, path: "/member-dashboard" },
        {
            type: "group", key: "CP-Operations", name: "Operations", icon: Briefcase, children: [
                { name: "Send Messages", path: "/member/communications" },
                { name: "Member Map", path: "/member-dashboard/member-map" },
                // { name: "Area Chart", path: "/member/area-chart" },
                // { name: "UCN", path: "/member/business-circle" },
            ]
        },
        // {
        //     type: "group", key: "CP-digital", name: "Digital", icon: Globe, children: [
        //         { name: "Social Onboarding", path: "/admin-dashboard/users" },
        //         { name: "Social Management", path: "/register" },
        //         { name: "Social Media Manager", path: "/admin-dashboard/users" },
        //         { name: "Social Media Overview", path: "/admin-dashboard/users" },
        //         { name: "Website & Media", path: "/admin-dashboard/users" },
        //     ]
        // },
    ],
};
function Sidebar({ isOpen, onToggle }) {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const sidebarRef = useRef(null);

    const bp = useBreakpoint();
    const isMobile = bp === "mobile";

    const role = user?.role;
    const items = NAV[role] || NAV[role?.charAt(0).toUpperCase() + role?.slice(1)] || NAV[role?.toLowerCase()] || [];

    const initials = (user?.userName || "A")
        .trim()
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const [openGroups, setOpenGroups] = useState({
        // admin
        members: true, Operations: true, revenue: true, community: true,
        growth: true, digital: true, moderation: true, admin: true,
        // SuperAdmin
        "sp-members": true, "sp-wardChart": true, "sp-revenue": true,
        "sp-admin": true, "sp-formFeild": true,
        // StateHead
        "SH-members": true, "SHG-members": true, "SH-Operations": true,
        "SH-community": true, "SH-growth": true, "SH-digital": true, "SH-moderation": true,
        // DistrictHead
        "DH-members": true, "DH-members-db": true, "DH-Operations": true,
        "DH-community": true, "DH-growth": true, "DH-digital": true, "DH-moderation": true,
        // TalukHead
        "TH-members": true, "TH-members-db": true, "TH-Operations": true,
        "TH-community": true, "TH-growth": true, "TH-digital": true, "TH-moderation": true,
        // WardChairman
        "WC-members": true, "WC-members-db": true, "WC-Operations": true,
        "WC-community": true, "WC-growth": true, "WC-digital": true, "WC-moderation": true,
        // ChannelPartner
        "CP-members": true, "CP-Operations": true, "CP-community": true,
        "CP-growth": true, "CP-digital": true, "CP-moderation": true,
    });

    useEffect(() => {
        function handleClickOutside(event) {
            if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                onToggle();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isMobile, isOpen, onToggle]);

    const toggleGroup = (key) => {
        setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    const handleNavClick = () => {
        if (isMobile) onToggle();
    };

    const sidebarOpen = isMobile ? true : isOpen;

    return (
        <>
            {/* ── Fixed Mobile Header ────────────────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] z-30 flex items-center justify-between px-4 shadow-xs md:hidden">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={onToggle}
                        className="w-10 h-10 rounded-xl bg-slate-50 border border-[#E5E7EB] flex items-center justify-center text-slate-700 hover:text-[#2563EB] hover:bg-[#EFF6FF] active:scale-95 transition-all duration-150 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                        aria-label="Open navigation menu"
                        aria-expanded={isOpen}
                    >
                        <Menu size={20} strokeWidth={2.2} />
                    </button>
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                            <img
                                src="https://udyamicircle.in/assets/logo-BWGNLCfH.png"
                                alt="Udyami Bharat"
                                className="w-9 h-9 object-contain shrink-0"
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm text-slate-900 tracking-tight truncate leading-tight">
                                Udyami Bharat
                            </span>
                            <span className="text-[9px] font-semibold text-[#2563EB] uppercase tracking-[0.16em] truncate">
                                Admin Portal
                            </span>
                        </div>
                    </div>
                </div>
                <div
                    onClick={() => {
                        const targetPath = profilePath[role] || profilePath[role?.toLowerCase()] || "/member/profile";
                        navigate(targetPath);
                    }}
                    className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-transform shrink-0 overflow-hidden"
                    title="View Profile"
                >
                    {user?.profileImage || user?.photo || user?.avatar || user?.photoUrl ? (
                        <img src={user?.profileImage || user?.photo || user?.avatar || user?.photoUrl} alt={user?.userName || "Profile"} className="w-full h-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>
            </header>

            {/* ── Mobile backdrop overlay ──────────────────────────────────── */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out md:hidden ${isMobile && isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onToggle}
                aria-hidden="true"
            />

            {/* ── Sidebar drawer panel ────────────────────────────────────── */}
            <aside
                ref={sidebarRef}
                aria-label="Sidebar Navigation"
                role="navigation"
                className={`
                    fixed top-0 left-0 h-screen h-[100dvh] bg-white border-r border-[#E5E7EB]
                    shadow-[1px_0_20px_rgba(0,0,0,0.06)]
                    flex flex-col z-50
                    transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isMobile
                        ? `w-72 max-w-[85vw] ${isOpen ? "translate-x-0" : "-translate-x-full"}`
                        : `translate-x-0 z-40 ${sidebarOpen ? "w-64" : "w-[70px]"}`
                    }
                `}
            >
                {/* ── Floating toggle (tablet / desktop only) ─────────── */}
                {!isMobile && (
                    <button
                        onClick={onToggle}
                        className="absolute top-7 -right-3.5 w-7 h-7 rounded-full bg-white border border-[#E5E7EB]
                            shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center
                            text-slate-400 hover:text-[#2563EB] hover:border-[#2563EB]/40 hover:scale-110
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]
                            transition-all duration-200 z-50 cursor-pointer"
                        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        {sidebarOpen
                            ? <ChevronLeft size={14} strokeWidth={2.5} />
                            : <ChevronRight size={14} strokeWidth={2.5} />}
                    </button>
                )}

                {/* ── Brand & Header ────────────────────────────────────────────── */}
                <div className="h-16 flex items-center justify-between gap-3 px-4 border-b border-[#E5E7EB]/70 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                            <img
                                src="https://udyamicircle.in/assets/logo-BWGNLCfH.png"
                                alt="Udyami Bharat"
                                className="w-11 h-11 object-contain shrink-0"
                            />
                        </div>
                        <div className={`flex flex-col min-w-0 transition-all duration-200 ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}>
                            <span className="font-bold text-[15px] text-slate-900 tracking-tight truncate whitespace-nowrap leading-tight">
                                Udyami Bharat
                            </span>
                            <span className="text-[10px] font-semibold text-[#2563EB] uppercase tracking-[0.18em] truncate whitespace-nowrap">
                                Admin Portal
                            </span>
                        </div>
                    </div>
                    {isMobile && (
                        <button
                            onClick={onToggle}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition-colors shrink-0"
                            aria-label="Close sidebar"
                        >
                            <CloseIcon size={18} strokeWidth={2.2} />
                        </button>
                    )}
                </div>

                {/* ── Nav List ──────────────────────────────────────────────── */}
                <div className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                    <p className={`px-2 mb-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400 whitespace-nowrap transition-all duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}>
                        Main Menu
                    </p>

                    <div className="space-y-1">
                        {items.map((item) => {
                            if (item.type === "link") {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={`${item.type}-${item.name}`}
                                        to={item.path}
                                        onClick={handleNavClick}
                                        title={!sidebarOpen ? item.name : undefined}
                                        className={`
                                            group relative flex items-center gap-3 px-3 py-3 rounded-xl
                                            text-[13px] font-medium transition-all duration-200 min-h-[44px]
                                            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]
                                            ${sidebarOpen ? "justify-start" : "justify-center"}
                                            ${isActive
                                                ? "bg-[#2563EB] text-white shadow-[0_2px_8px_rgba(37,99,235,0.30)]"
                                                : "text-slate-600 hover:bg-[#EFF6FF] hover:text-[#2563EB]"}
                                        `}
                                    >
                                        <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.9} className="shrink-0 transition-transform duration-200 group-hover:scale-[1.06]" />
                                        <span className={`truncate min-w-0 transition-all duration-200 ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}>
                                            {item.name}
                                        </span>
                                    </Link>
                                );
                            }

                            if (!sidebarOpen) {
                                return (
                                    <button
                                        key={item.key}
                                        onClick={onToggle}
                                        title={item.name}
                                        className="w-full flex items-center justify-center min-h-[44px] py-3 rounded-xl text-slate-500 hover:text-[#2563EB] hover:bg-[#EFF6FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition-colors"
                                    >
                                        <item.icon size={18} strokeWidth={1.9} />
                                    </button>
                                );
                            }

                            const isGroupOpen = openGroups[item.key] !== false;

                            return (
                                <div key={item.key} className="pt-3 first:pt-1">
                                    <button
                                        onClick={() => toggleGroup(item.key)}
                                        aria-expanded={isGroupOpen}
                                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100/80 active:bg-slate-200/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition-colors group mb-0.5 min-h-[36px]"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <item.icon size={13} strokeWidth={2.2} className="text-slate-400 shrink-0 group-hover:text-slate-600" />
                                            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 truncate group-hover:text-slate-600">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className={`text-slate-400 shrink-0 transition-transform duration-200 group-hover:text-slate-600 ${isGroupOpen ? "rotate-0" : "-rotate-90"}`}>
                                            {isGroupOpen ? <ChevronUp size={13} strokeWidth={2.5} /> : <ChevronDown size={13} strokeWidth={2.5} />}
                                        </span>
                                    </button>

                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isGroupOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                                        {item.children.map((child) => {
                                            const isActive = location.pathname === child.path;
                                            return (
                                                <Link
                                                    key={`${item.key}-${child.name}`}
                                                    to={child.path}
                                                    onClick={handleNavClick}
                                                    className={`
                                                        flex items-center ml-4 pl-3 pr-2 py-2.5 my-0.5 rounded-lg text-[12.5px]
                                                        border-l-2 transition-all duration-150 min-h-[40px] min-w-0
                                                        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]
                                                        ${isActive
                                                            ? "border-[#2563EB] text-[#2563EB] font-semibold bg-[#EFF6FF]"
                                                            : "border-slate-200 text-slate-600 hover:text-[#2563EB] hover:bg-[#EFF6FF] hover:border-[#2563EB]/40"}
                                                    `}
                                                >
                                                    <span className="truncate min-w-0">{child.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Profile footer ────────────────────────────────────── */}
                <div className="border-t border-[#E5E7EB]/70 p-3 shrink-0 bg-slate-50/70">
                    <div
                        onClick={() => {
                            const targetPath = profilePath[role] || profilePath[role?.toLowerCase()] || "/member/profile";
                            navigate(targetPath);
                            if (isMobile) onToggle();
                        }}
                        className={`flex items-center gap-3 rounded-xl px-2.5 py-3 mb-1.5 transition-all duration-200 cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] hover:bg-white hover:border hover:border-[#E5E7EB] hover:shadow-xs ${sidebarOpen ? "bg-white border border-[#E5E7EB] shadow-xs" : "justify-center"}`}
                        title={!sidebarOpen ? user?.userName || "Profile" : undefined}
                    >
                        <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(37,99,235,0.30)] overflow-hidden">
                            {user?.profileImage || user?.photo || user?.avatar || user?.photoUrl ? (
                                <img src={user?.profileImage || user?.photo || user?.avatar || user?.photoUrl} alt={user?.userName || "Profile"} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-[11px] font-bold tracking-wide">{initials}</span>
                            )}
                        </div>
                        <div className={`min-w-0 flex-1 transition-all duration-200 ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}>
                            <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">{user?.userName || "Account"}</p>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#2563EB] truncate mt-0.5">{role}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        title={!sidebarOpen ? "Log out" : undefined}
                        className={`
                            w-full flex items-center gap-3 px-3 py-3 rounded-xl min-h-[44px]
                            text-[13px] font-medium text-slate-600
                            hover:bg-red-50 hover:text-red-600
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                            transition-all duration-200
                            ${sidebarOpen ? "justify-start" : "justify-center"}
                        `}
                    >
                        <LogOut size={17} strokeWidth={1.9} className="shrink-0" />
                        <span className={`truncate min-w-0 transition-all duration-200 ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}>
                            Log out
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}



export default Sidebar;

