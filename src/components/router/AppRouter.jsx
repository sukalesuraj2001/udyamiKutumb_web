import Register from "../auth/Register";
import Login from "../auth/Login";
import { Navigate } from "react-router-dom";
import RouteGuard from "../common/RouteGuard.jsx";
import AdminLayout from "../common/AdminLayout.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import AreaChartBuilder from "../pages/areaChart/AreaChartBuilder.jsx";
import WardChartDetail from "../pages/areaChart/WardChartDetail.jsx";
import CommunicationsLayout from "../pages/communication/CommunicationsLayout.jsx";
import SendCampaign from "../pages/communication/SendCampaign.jsx";
import Credits from "../pages/communication/Credits.jsx";
import AnalyticsTab from "../pages/communication/Analytics.jsx";
import Analytics from "../pages/communication/Analytics.jsx";
import WhatsAppOutreach from "../pages/communication/WhatsAppOutreach.jsx";
import AutoDialer from "../pages/communication/autoDialer/AutoDialer.jsx";
import BulkSmsEmail from "../pages/communication/BulkSmsEmail.jsx";
import WhatsAppAiChatbot from "../pages/communication/WhatsAppAiChatbot.jsx";
import BusinessCircleLayout from "../pages/businessCircle/BusinessCircleLayout.jsx";
import CircleNetwork from "../pages/businessCircle/CircleNetwork.jsx";
import Overview from "../pages/businessCircle/Overview.jsx";
import BusinessGroups from "../pages/businessCircle/BusinessGroups.jsx";
import MemberReviews from "../pages/businessCircle/MemberReviews.jsx";
import Meeting from "../pages/businessCircle/Meeting.jsx";
import KnowledgeSession from "../pages/businessCircle/KnowledgeSession.jsx";
import Treasury from "../pages/businessCircle/Treasury.jsx";
import Positions from "../pages/businessCircle/Positions.jsx";
import Reminders from "../pages/businessCircle/Reminders.jsx";
import Network from "../pages/businessCircle/Network.jsx";
import GratitudeWall from "../pages/businessCircle/GratitudeWall.jsx";
import Leaderboard from "../pages/businessCircle/leaderBoard/Leaderboard.jsx";
import Circles from "../pages/businessCircle/circle/Circles.jsx";
import FaceToFace from "../pages/businessCircle/faceToFace/FaceToFace.jsx";
import Directory from "../pages/businessCircle/directory/Directory.jsx";
import Pitches from "../pages/businessCircle/pitches/Pitches.jsx";
import ClosedBusiness from "../pages/businessCircle/closedBusiness/Closedbusiness.jsx";
import Guests from "../pages/businessCircle/guests/Guests.jsx";
import BusinessLeads from "../pages/businessCircle/Businessleads.jsx";
import AiIvrCalling from "../pages/communication/autoDialer/AiIvrCalling.jsx";
import MemberMap from "../pages/MemberMap.jsx";
import Udyamidatabaseupdated from "../pages/members/Udyamidatabaseupdated.jsx";
import MemberDetailPage from "../pages/members/MemberDetailPage.jsx";
import ChannelPartner from "../pages/channelPartners/ChannelPartner.jsx";
import CpMemberDetails from "../pages/channelPartners/CpMemberDetails.jsx";
import LeadManagement from "../pages/leadManagement/LeadManagement.jsx";
import SuperAdmin from "../pages/SuperAdmin.jsx";
import StateHead from "../pages/superAdmin/members/StateHead.jsx";
import DistrictHead from "../pages/superAdmin/members/DistrictHead.jsx";
import TalukHead from "../pages/superAdmin/members/TalukHead.jsx";
import WardHobliHead from "../pages/superAdmin/members/WardHobliHead.jsx";
import Membership from "../pages/membership/Membership.jsx";
import RegistrationPage from "../pages/membership/RegistrationPage.jsx";
import UserManagement from "../pages/users/UserManagement.jsx";
import RoleManagement from "../pages/users/RoleManagement.jsx";
import ChannelPartnerOnboard from "../pages/Channelpartneronboard.jsx";
import FormBuilder from '../pages/onbording/cpOnbording/Formbuilder.jsx'
// roles
import StateHeadDashboard from "../pages/stateHead/StateHeadDashboard.jsx";
import DistrictHeadDashboard from "../pages/districtHead/DistrictHeadDashboard.jsx";
import TalukHeadDashboard from "../pages/talukHead/TalukHeadDashboard.jsx";
import WardChairmanDashboard from "../pages/wardChairman/WardChairmanDashboard.jsx";
import ChannelPartnerDashboard from "../pages/channelPartners/ChannelPartnerDashboard.jsx";
import Profile from "../pages/Profile.jsx";
import MemberDashboard from "../pages/MemberDashboard.jsx";

import ModuleSettings from "../pages/businessCircle/admin/ModuleSettings.jsx";
import Scoring from "../pages/businessCircle/admin/Scoring.jsx";
import Taxonomy from "../pages/businessCircle/admin/Taxonomy.jsx";
import RolesAccess from "../pages/businessCircle/admin/RolesAccess.jsx";
import Reports from '../pages/businessCircle/Reports.jsx'
import Spinoff from '../pages/businessCircle/SpinOff.jsx'
import UCTraining from '../pages/businessCircle/admin/Uctraining.jsx'
import CreateWard from "../pages/superAdmin/CreateWard.jsx";
import JobManagement from "../pages/superAdmin/JobManagement.jsx";
import NewsManagement from "../pages/superAdmin/NewsManagement.jsx";
import Cp from '../pages/cp/Cp.jsx'
import WardChartPdfView from "../pages/areaChart/Wardchartpdfview.jsx";
import RouteTracking from "../pages/routeTracking/RouteTracking";
import CpSubmissions from "../pages/onbording/cpOnbording/CpSubmissions.jsx";
import CpFormPreview from "../pages/cp/Cpformpreview.jsx";
import CpSubmissionsView from "../pages/onbording/cpOnbording/Cpsubmissionsview.jsx";
import CloudPatraApplications from "../pages/cp/cloudPatra/CloudPatraApplications.jsx";
import CloudPatraInterviews from "../pages/cp/cloudPatra/CloudPatraInterviews.jsx";


const AppRouter = [
  {
    element: <RouteGuard guestOnly />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },

  // ─── ADMIN ────────────────────────────────────────────────────────────────
  {
    element: <RouteGuard allowedRoles={["admin"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin-dashboard", element: <AdminDashboard /> },
          { path: "/area-chart", element: <AreaChartBuilder /> },
          { path: "/admin-dashboard/area-chart/:wardId", element: <WardChartDetail /> },
          { path: "/admin-dashboard/profile", element: <Profile /> },
          {
            path: "/admin-dashboard/communications",
            element: <CommunicationsLayout />,
            children: [
              { index: true, element: <Navigate to="send-campaign" replace /> },
              { path: "send-campaign", element: <SendCampaign /> },
              { path: "credits", element: <Credits /> },
              { path: "analytics", element: <Analytics /> },
              { path: "whatsapp-outreach", element: <WhatsAppOutreach /> },
              { path: "auto-dialer", element: <AutoDialer /> },
              { path: "bulk-sms-email", element: <BulkSmsEmail /> },
              { path: "whatsapp-ai-chatbot", element: <WhatsAppAiChatbot /> },
              { path: "ai-ivr-calling", element: <AiIvrCalling /> },
            ],
          },
          {
            path: "/admin-dashboard/business-circle",
            element: <BusinessCircleLayout />,
            children: [
              { index: true, element: <Navigate to="circle-network" replace /> },
              { path: "circle-network", element: <CircleNetwork /> },
              { path: "overview", element: <Overview /> },
              { path: "business-groups", element: <BusinessGroups /> },
              { path: "member-reviews", element: <MemberReviews /> },
              { path: "meetings", element: <Meeting /> },
              { path: "knowledge-sessions", element: <KnowledgeSession /> },
              { path: "treasury", element: <Treasury /> },
              { path: "positions", element: <Positions /> },
              { path: "reminders", element: <Reminders /> },
              { path: "network", element: <Network /> },
              { path: "gratitude-wall", element: <Network /> },
              { path: "leaderboard", element: <Leaderboard /> },
              { path: "circles", element: <Circles /> },
              { path: "face-to-face", element: <FaceToFace /> },
              { path: "directory", element: <Directory /> },
              { path: "pitches", element: <Pitches /> },
              { path: "closed-business", element: <ClosedBusiness /> },
              { path: "guests", element: <Guests /> },
              { path: "business-leads", element: <BusinessLeads /> },
            ],
          },
          { path: "/admin-dashboard/member-map", element: <MemberMap /> },
          { path: "/admin-dashboard/members", element: <Udyamidatabaseupdated /> },
          { path: "/admin-dashboard/members/channelPartners", element: <ChannelPartner /> },
          { path: "/admin-dashboard/members/channelPartners/:id", element: <CpMemberDetails /> },
          { path: "/admin-dashboard/members/:id", element: <MemberDetailPage /> },
          { path: "/admin-dashboard/lead-management", element: <LeadManagement /> },
        ],
      },
    ],
  },

  // ─── SUPER ADMIN ──────────────────────────────────────────────────────────
  {
    element: <RouteGuard allowedRoles={["SuperAdmin"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/super-admin-dashboard", element: <SuperAdmin /> },
          { path: "/super-admin-dashboard/area-chart", element: <AreaChartBuilder /> },
          { path: "/super-admin-dashboard/area-chart/:wardId", element: <WardChartDetail /> },
          { path: "/super-admin-dashboard/profile", element: <Profile /> },
          {
            path: "/super-admin-dashboard/communications",
            element: <CommunicationsLayout />,
            children: [
              { index: true, element: <Navigate to="send-campaign" replace /> },
              { path: "send-campaign", element: <SendCampaign /> },
              { path: "credits", element: <Credits /> },
              { path: "analytics", element: <Analytics /> },
              { path: "whatsapp-outreach", element: <WhatsAppOutreach /> },
              { path: "auto-dialer", element: <AutoDialer /> },
              { path: "bulk-sms-email", element: <BulkSmsEmail /> },
              { path: "whatsapp-ai-chatbot", element: <WhatsAppAiChatbot /> },
              { path: "ai-ivr-calling", element: <AiIvrCalling /> },
            ],
          },
          {
            path: "/super-admin-dashboard/business-circle",
            element: <BusinessCircleLayout />,
            children: [
              { index: true, element: <Navigate to="module-settings" replace /> },
              { path: "module-settings", element: <ModuleSettings /> },
              { path: "circle-network", element: <CircleNetwork /> },
              { path: "overview", element: <Overview /> },
              { path: "business-groups", element: <BusinessGroups /> },
              { path: "member-reviews", element: <MemberReviews /> },
              { path: "meetings", element: <Meeting /> },
              { path: "knowledge-sessions", element: <KnowledgeSession /> },
              { path: "treasury", element: <Treasury /> },
              { path: "positions", element: <Positions /> },
              { path: "reminders", element: <Reminders /> },
              { path: "network", element: <Network /> },
              { path: "gratitude-wall", element: <Network /> },
              { path: "leaderboard", element: <Leaderboard /> },
              { path: "circles", element: <Circles /> },
              { path: "face-to-face", element: <FaceToFace /> },
              { path: "directory", element: <Directory /> },
              { path: "pitches", element: <Pitches /> },
              { path: "closed-business", element: <ClosedBusiness /> },
              { path: "guests", element: <Guests /> },
              { path: "business-leads", element: <BusinessLeads /> },
              { path: "reports", element: <Reports /> },
              { path: "spin-off", element: <Spinoff /> },
              { path: "scoring", element: <Scoring /> },
              { path: "uc-training", element: <UCTraining /> },
              { path: "taxonomy", element: <Taxonomy /> },
              { path: "roles-access", element: <RolesAccess /> },
            ],
          },
          { path: "/super-admin-dashboard/state-head", element: <StateHead /> },
          { path: "/super-admin-dashboard/member-map", element: <MemberMap /> },
          { path: "/super-admin-dashboard/members", element: <Udyamidatabaseupdated /> },
          { path: "/super-admin-dashboard/members/channelPartners", element: <ChannelPartner /> },
          { path: "/super-admin-dashboard/members/channelPartners/:id", element: <CpMemberDetails /> },
          { path: "/super-admin-dashboard/members/:id", element: <MemberDetailPage /> },
          { path: "/super-admin-dashboard/lead-management", element: <LeadManagement /> },
          { path: "/super-admin-dashboard/district-head", element: <DistrictHead /> },
          { path: "/super-admin-dashboard/taluk-head", element: <TalukHead /> },
          { path: "/super-admin-dashboard/ward-head", element: <WardHobliHead /> },
          { path: "/super-admin-dashboard/user-management", element: <UserManagement /> },
          { path: "/super-admin-dashboard/membership", element: <Membership /> },
          { path: "/super-admin-dashboard/membership/registration", element: <RegistrationPage /> },
          { path: "/super-admin-dashboard/membership/role-management", element: <RoleManagement /> },
          { path: "/super-admin-dashboard/cp-onboarding", element: <ChannelPartnerOnboard /> },
          { path: "/super-admin-dashboard/form-builder/channelPartner", element: <FormBuilder /> },
          { path: "/super-admin-dashboard/create-ward", element: <CreateWard /> },
          { path: "/super-admin-dashboard/job-management", element: <JobManagement /> },
          { path: "/super-admin-dashboard/news-management", element: <NewsManagement /> },

        ],
      },
    ],
  },

  // ─── STATE HEAD ───────────────────────────────────────────────────────────
  {
    element: <RouteGuard allowedRoles={["StateHead"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/state-head-dashboard", element: <StateHeadDashboard /> },
          { path: "/state-head-dashboard/area-chart", element: <AreaChartBuilder /> },
          { path: "/state-head-dashboard/area-chart/:wardId", element: <WardChartDetail /> },
          { path: "/state-head-dashboard/profile", element: <Profile /> },
          {
            path: "/state-head-dashboard/communications",
            element: <CommunicationsLayout />,
            children: [
              { index: true, element: <Navigate to="send-campaign" replace /> },
              { path: "send-campaign", element: <SendCampaign /> },
              { path: "credits", element: <Credits /> },
              { path: "analytics", element: <Analytics /> },
              { path: "whatsapp-outreach", element: <WhatsAppOutreach /> },
              { path: "auto-dialer", element: <AutoDialer /> },
              { path: "bulk-sms-email", element: <BulkSmsEmail /> },
              { path: "whatsapp-ai-chatbot", element: <WhatsAppAiChatbot /> },
              { path: "ai-ivr-calling", element: <AiIvrCalling /> },
            ],
          },
          {
            path: "/state-head-dashboard/business-circle",
            element: <BusinessCircleLayout />,
            children: [
              { index: true, element: <Navigate to="circle-network" replace /> },
              { path: "circle-network", element: <CircleNetwork /> },
              { path: "overview", element: <Overview /> },
              { path: "business-groups", element: <BusinessGroups /> },
              { path: "member-reviews", element: <MemberReviews /> },
              { path: "meetings", element: <Meeting /> },
              { path: "knowledge-sessions", element: <KnowledgeSession /> },
              { path: "treasury", element: <Treasury /> },
              { path: "positions", element: <Positions /> },
              { path: "reminders", element: <Reminders /> },
              { path: "network", element: <Network /> },
              { path: "gratitude-wall", element: <Network /> },
              { path: "leaderboard", element: <Leaderboard /> },
              { path: "circles", element: <Circles /> },
              { path: "face-to-face", element: <FaceToFace /> },
              { path: "directory", element: <Directory /> },
              { path: "pitches", element: <Pitches /> },
              { path: "closed-business", element: <ClosedBusiness /> },
              { path: "guests", element: <Guests /> },
              { path: "business-leads", element: <BusinessLeads /> },
            ],
          },
          { path: "/state-head-dashboard/member-map", element: <MemberMap /> },
          { path: "/state-head-dashboard/members", element: <Udyamidatabaseupdated /> },
          { path: "/state-head-dashboard/members/channelPartners", element: <ChannelPartner /> },
          { path: "/state-head-dashboard/members/channelPartners/:id", element: <CpMemberDetails /> },
          { path: "/state-head-dashboard/members/:id", element: <MemberDetailPage /> },
          { path: "/state-head-dashboard/lead-management", element: <LeadManagement /> },
          { path: "/state-head-dashboard/district-head", element: <DistrictHead /> },
          { path: "/state-head-dashboard/taluk-head", element: <TalukHead /> },
          { path: "/state-head-dashboard/ward-head", element: <WardHobliHead /> },
          { path: "/state-head-dashboard/user-management", element: <UserManagement /> },
          { path: "/state-head-dashboard/membership", element: <Membership /> },
          { path: "/state-head-dashboard/membership/registration", element: <RegistrationPage /> },
          { path: "/state-head-dashboard/membership/role-management", element: <RoleManagement /> },
          { path: "/state-head-dashboard/cp-onbording", element: <ChannelPartnerOnboard /> },
          { path: "/state-head-dashboard/form-builder/channelPartner", element: <FormBuilder /> },
        ],
      },
    ],
  },

  // ─── DISTRICT HEAD ────────────────────────────────────────────────────────
  {
    element: <RouteGuard allowedRoles={["DistrictHead"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/district-head-dashboard", element: <DistrictHeadDashboard /> },
          { path: "/district-head-dashboard/area-chart", element: <AreaChartBuilder /> },
          { path: "/district-head-dashboard/area-chart/:wardId", element: <WardChartDetail /> },
          { path: "/district-head-dashboard/profile", element: <Profile /> },
          {
            path: "/district-head-dashboard/communications",
            element: <CommunicationsLayout />,
            children: [
              { index: true, element: <Navigate to="send-campaign" replace /> },
              { path: "send-campaign", element: <SendCampaign /> },
              { path: "credits", element: <Credits /> },
              { path: "analytics", element: <Analytics /> },
              { path: "whatsapp-outreach", element: <WhatsAppOutreach /> },
              { path: "auto-dialer", element: <AutoDialer /> },
              { path: "bulk-sms-email", element: <BulkSmsEmail /> },
              { path: "whatsapp-ai-chatbot", element: <WhatsAppAiChatbot /> },
              { path: "ai-ivr-calling", element: <AiIvrCalling /> },
            ],
          },
          {
            path: "/district-head-dashboard/business-circle",
            element: <BusinessCircleLayout />,
            children: [
              { index: true, element: <Navigate to="overview" replace /> },
              { path: "overview", element: <Overview /> },
              { path: "circles", element: <Circles /> },
              { path: "spin-off", element: <Spinoff /> },
              { path: "reports", element: <Reports /> },
              { path: "circle-network", element: <CircleNetwork /> },
              { path: "business-groups", element: <BusinessGroups /> },
              { path: "member-reviews", element: <MemberReviews /> },
              { path: "meetings", element: <Meeting /> },
              { path: "knowledge-sessions", element: <KnowledgeSession /> },
              { path: "treasury", element: <Treasury /> },
              { path: "positions", element: <Positions /> },
              { path: "reminders", element: <Reminders /> },
              { path: "network", element: <Network /> },
              { path: "gratitude-wall", element: <Network /> },
              { path: "leaderboard", element: <Leaderboard /> },
              { path: "face-to-face", element: <FaceToFace /> },
              { path: "directory", element: <Directory /> },
              { path: "pitches", element: <Pitches /> },
              { path: "closed-business", element: <ClosedBusiness /> },
              { path: "guests", element: <Guests /> },
              { path: "business-leads", element: <BusinessLeads /> },
            ],
          },
          { path: "/district-head-dashboard/member-map", element: <MemberMap /> },
          { path: "/district-head-dashboard/members", element: <Udyamidatabaseupdated /> },
          { path: "/district-head-dashboard/members/channelPartners", element: <ChannelPartner /> },
          { path: "/district-head-dashboard/members/channelPartners/:id", element: <CpMemberDetails /> },
          { path: "/district-head-dashboard/members/:id", element: <MemberDetailPage /> },
          { path: "/district-head-dashboard/lead-management", element: <LeadManagement /> },
          { path: "/district-head-dashboard/taluk-head", element: <TalukHead /> },
          { path: "/district-head-dashboard/ward-head", element: <WardHobliHead /> },
          { path: "/district-head-dashboard/user-management", element: <UserManagement /> },
          { path: "/district-head-dashboard/membership", element: <Membership /> },
          { path: "/district-head-dashboard/membership/registration", element: <RegistrationPage /> },
          { path: "/district-head/role-management", element: <RoleManagement /> },
          { path: "/district-head-dashboard/cp-onbording", element: <ChannelPartnerOnboard /> },
          { path: "/district-head-dashboard/form-builder/channelPartner", element: <FormBuilder /> },
        ],
      },
    ],
  },

  // ─── TALUK HEAD ───────────────────────────────────────────────────────────
  {
    element: <RouteGuard allowedRoles={["TalukHead"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/taluk-head-dashboard", element: <TalukHeadDashboard /> },
          { path: "/taluk-head-dashboard/area-chart", element: <AreaChartBuilder /> },
          { path: "/taluk-head-dashboard/area-chart/:wardId", element: <WardChartDetail /> },
          { path: "/taluk-head-dashboard/profile", element: <Profile /> },
          {
            path: "/taluk-head-dashboard/communications",
            element: <CommunicationsLayout />,
            children: [
              { index: true, element: <Navigate to="send-campaign" replace /> },
              { path: "send-campaign", element: <SendCampaign /> },
              { path: "credits", element: <Credits /> },
              { path: "analytics", element: <Analytics /> },
              { path: "whatsapp-outreach", element: <WhatsAppOutreach /> },
              { path: "auto-dialer", element: <AutoDialer /> },
              { path: "bulk-sms-email", element: <BulkSmsEmail /> },
              { path: "whatsapp-ai-chatbot", element: <WhatsAppAiChatbot /> },
              { path: "ai-ivr-calling", element: <AiIvrCalling /> },
            ],
          },
          {
            path: "/taluk-head-dashboard/business-circle",
            element: <BusinessCircleLayout />,
            children: [
              { index: true, element: <Navigate to="overview" replace /> },
              { path: "overview", element: <Overview /> },
              { path: "circles", element: <Circles /> },
              { path: "spin-off", element: <Spinoff /> },
              { path: "reports", element: <Reports /> },
              { path: "circle-network", element: <CircleNetwork /> },
              { path: "business-groups", element: <BusinessGroups /> },
              { path: "member-reviews", element: <MemberReviews /> },
              { path: "meetings", element: <Meeting /> },
              { path: "knowledge-sessions", element: <KnowledgeSession /> },
              { path: "treasury", element: <Treasury /> },
              { path: "positions", element: <Positions /> },
              { path: "reminders", element: <Reminders /> },
              { path: "network", element: <Network /> },
              { path: "gratitude-wall", element: <Network /> },
              { path: "leaderboard", element: <Leaderboard /> },
              { path: "face-to-face", element: <FaceToFace /> },
              { path: "directory", element: <Directory /> },
              { path: "pitches", element: <Pitches /> },
              { path: "closed-business", element: <ClosedBusiness /> },
              { path: "guests", element: <Guests /> },
              { path: "business-leads", element: <BusinessLeads /> },
            ],
          },
          { path: "/taluk-head-dashboard/member-map", element: <MemberMap /> },
          { path: "/taluk-head-dashboard/members", element: <Udyamidatabaseupdated /> },
          { path: "/taluk-head-dashboard/members/channelPartners", element: <ChannelPartner /> },
          { path: "/taluk-head-dashboard/members/channelPartners/:id", element: <CpMemberDetails /> },
          { path: "/taluk-head-dashboard/members/:id", element: <MemberDetailPage /> },
          { path: "/taluk-head-dashboard/lead-management", element: <LeadManagement /> },
          { path: "/taluk-head-dashboard/district-head", element: <DistrictHead /> },
          { path: "/taluk-head-dashboard/taluk-head", element: <TalukHead /> },
          { path: "/taluk-head-dashboard/ward-head", element: <WardHobliHead /> },
          { path: "/taluk-head/user-management", element: <UserManagement /> },
          { path: "/taluk-head-dashboard/membership", element: <Membership /> },
          { path: "/taluk-head-dashboard/membership/registration", element: <RegistrationPage /> },
          { path: "/taluk-head/role-management", element: <RoleManagement /> },
          { path: "/taluk-head-dashboard/cp-onbording", element: <ChannelPartnerOnboard /> },
          { path: "/taluk-head-dashboard/form-builder/channelPartner", element: <FormBuilder /> },
        ],
      },
    ],
  },

  // ─── WARD CHAIRMAN ────────────────────────────────────────────────────────
  {
    element: <RouteGuard allowedRoles={["WardChairman"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/wardChairman-head-dashboard", element: <WardChairmanDashboard /> },
          { path: "/wardChairman/area-chart", element: <AreaChartBuilder /> },
          { path: "/wardChairman/area-chart/:wardId", element: <WardChartDetail /> },
          {
            path: "/ward-chart-pdf/:wardId",
            element: <WardChartPdfView />,
          },
          { path: "/wardChairman-head-dashboard/profile", element: <Profile /> },
          {
            path: "/wardChairman-head-dashboard/communications",
            element: <CommunicationsLayout />,
            children: [
              { index: true, element: <Navigate to="send-campaign" replace /> },
              { path: "send-campaign", element: <SendCampaign /> },
              { path: "credits", element: <Credits /> },
              { path: "analytics", element: <Analytics /> },
              { path: "whatsapp-outreach", element: <WhatsAppOutreach /> },
              { path: "auto-dialer", element: <AutoDialer /> },
              { path: "bulk-sms-email", element: <BulkSmsEmail /> },
              { path: "whatsapp-ai-chatbot", element: <WhatsAppAiChatbot /> },
              { path: "ai-ivr-calling", element: <AiIvrCalling /> },
            ],
          },
          {
            path: "/wardChairman-head-dashboard/business-circle",
            element: <BusinessCircleLayout />,
            children: [
              { index: true, element: <Navigate to="circle-network" replace /> },
              { path: "circle-network", element: <CircleNetwork /> },
              { path: "overview", element: <Overview /> },
              { path: "business-groups", element: <BusinessGroups /> },
              { path: "member-reviews", element: <MemberReviews /> },
              { path: "meetings", element: <Meeting /> },
              { path: "knowledge-sessions", element: <KnowledgeSession /> },
              { path: "treasury", element: <Treasury /> },
              { path: "positions", element: <Positions /> },
              { path: "reminders", element: <Reminders /> },
              { path: "network", element: <Network /> },
              { path: "gratitude-wall", element: <Network /> },
              { path: "leaderboard", element: <Leaderboard /> },
              { path: "circles", element: <Circles /> },
              { path: "face-to-face", element: <FaceToFace /> },
              { path: "directory", element: <Directory /> },
              { path: "pitches", element: <Pitches /> },
              { path: "closed-business", element: <ClosedBusiness /> },
              { path: "guests", element: <Guests /> },
              { path: "business-leads", element: <BusinessLeads /> },
            ],
          },
          { path: "/wardChairman-head-dashboard/member-map", element: <MemberMap /> },
          { path: "/wardChairman-head-dashboard/members", element: <Udyamidatabaseupdated /> },
          { path: "/wardChairman-head-dashboard/members/channelPartners", element: <ChannelPartner /> },
          { path: "/wardChairman-head-dashboard/members/channelPartners/:id", element: <CpMemberDetails /> },
          { path: "/wardChairman-head-dashboard/members/:id", element: <MemberDetailPage /> },
          { path: "/wardChairman-head-dashboard/lead-management", element: <LeadManagement /> },
          { path: "/wardChairman-head-dashboard/district-head", element: <DistrictHead /> },
          { path: "/wardChairman-head-dashboard/taluk-head", element: <TalukHead /> },
          { path: "/wardChairman-head-dashboard/ward-head", element: <WardHobliHead /> },
          { path: "/wardChairman-head-dashboard/user-management", element: <UserManagement /> },
          { path: "/wardChairman-head-dashboard/membership", element: <Membership /> },
          { path: "/wardChairman-head-dashboard/membership/registration", element: <RegistrationPage /> },
          { path: "/wardChairman-head-dashboard/rolemanagement", element: <RoleManagement /> },
          { path: "/wardChairman-head-dashboard/cp-onboarding", element: <ChannelPartnerOnboard /> },
          { path: "/wardChairman-head-dashboard/form-builder/channelPartner", element: <FormBuilder /> },
          { path: "/wardChairman-head-dashboard/channel-partner", element: <Cp /> },
          { path: "/wardChairman-head-dashboard/cp-route-tracking", element: <RouteTracking /> },
          { path: "/wardChairman-head-dashboard/forms", element: <CpSubmissions /> },
          { path: "/wardChairman-head-dashboard/get-forms", element: <CpFormPreview /> },
          { path: "/wardChairman-head-dashboard/submitions-list", element: <CpSubmissionsView /> },
          { path: "/ward-chairman/cp/applications" ,element: <CloudPatraApplications /> },
          { path: "/ward-chairman/cp/interviews" ,element: <CloudPatraInterviews  /> }


        ],
      },
    ],
  },

  // ─── CHANNEL PARTNER ──────────────────────────────────────────────────────
  {
    element: <RouteGuard allowedRoles={["ChannelPartner"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/channelPartner-dashboard", element: <ChannelPartnerDashboard /> },
          { path: "/channelPartner-dashboard/area-chart", element: <AreaChartBuilder /> },
          { path: "/channelPartner-dashboard/area-chart/:wardId", element: <WardChartDetail /> },
          { path: "/channelPartner-dashboard/profile", element: <Profile /> },
          {
            path: "/channelPartner-dashboard/communications",
            element: <CommunicationsLayout />,
            children: [
              { index: true, element: <Navigate to="send-campaign" replace /> },
              { path: "send-campaign", element: <SendCampaign /> },
              { path: "credits", element: <Credits /> },
              { path: "analytics", element: <Analytics /> },
              { path: "whatsapp-outreach", element: <WhatsAppOutreach /> },
              { path: "auto-dialer", element: <AutoDialer /> },
              { path: "bulk-sms-email", element: <BulkSmsEmail /> },
              { path: "whatsapp-ai-chatbot", element: <WhatsAppAiChatbot /> },
              { path: "ai-ivr-calling", element: <AiIvrCalling /> },
            ],
          },
          {
            path: "/channelPartner-dashboard/business-circle",
            element: <BusinessCircleLayout />,
            children: [
              { index: true, element: <Navigate to="circle-network" replace /> },
              { path: "circle-network", element: <CircleNetwork /> },
              { path: "overview", element: <Overview /> },
              { path: "business-groups", element: <BusinessGroups /> },
              { path: "member-reviews", element: <MemberReviews /> },
              { path: "meetings", element: <Meeting /> },
              { path: "knowledge-sessions", element: <KnowledgeSession /> },
              { path: "treasury", element: <Treasury /> },
              { path: "positions", element: <Positions /> },
              { path: "reminders", element: <Reminders /> },
              { path: "network", element: <Network /> },
              { path: "gratitude-wall", element: <Network /> },
              { path: "leaderboard", element: <Leaderboard /> },
              { path: "circles", element: <Circles /> },
              { path: "face-to-face", element: <FaceToFace /> },
              { path: "directory", element: <Directory /> },
              { path: "pitches", element: <Pitches /> },
              { path: "closed-business", element: <ClosedBusiness /> },
              { path: "guests", element: <Guests /> },
              { path: "business-leads", element: <BusinessLeads /> },
            ],
          },
          { path: "/channelPartner-dashboard/member-map", element: <MemberMap /> },
          { path: "/channelPartner-dashboard/members", element: <Udyamidatabaseupdated /> },
          { path: "/channelPartner-dashboard/members/channelPartners", element: <ChannelPartner /> },
          { path: "/channelPartner-dashboard/members/channelPartners/:id", element: <CpMemberDetails /> },
          { path: "/channelPartner-dashboard/members/:id", element: <MemberDetailPage /> },
          { path: "/channelPartner-dashboard/lead-management", element: <LeadManagement /> },
          { path: "/channelPartner-dashboard/district-head", element: <DistrictHead /> },
          { path: "/channelPartner-dashboard/taluk-head", element: <TalukHead /> },
          { path: "/channelPartner-dashboard/ward-head", element: <WardHobliHead /> },
          { path: "/channelPartner-dashboard/user-management", element: <UserManagement /> },
          { path: "/channelPartner-dashboard/membership", element: <Membership /> },
          { path: "/channelPartner-dashboard/membership/registration", element: <RegistrationPage /> },
          { path: "/channelPartner-dashboard/membership/role-management", element: <RoleManagement /> },
          { path: "/channelPartner-dashboard/cp-onbording", element: <ChannelPartnerOnboard /> },
          { path: "/channelPartner-dashboard/form-builder/channelPartner", element: <FormBuilder /> },
        ],
      },
    ],
  },

  // ─── MEMBER ───────────────────────────────────────────────────────────────
  {
    element: <RouteGuard allowedRoles={["Member"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/member-dashboard", element: <MemberDashboard /> },
          { path: "/member/area-chart", element: <AreaChartBuilder /> },
          { path: "/member/area-chart/:wardId", element: <WardChartDetail /> },
          { path: "/member/profile", element: <Profile /> },
          {
            path: "/member/communications",
            element: <CommunicationsLayout />,
            children: [
              { index: true, element: <Navigate to="send-campaign" replace /> },
              { path: "send-campaign", element: <SendCampaign /> },
              { path: "credits", element: <Credits /> },
              { path: "analytics", element: <Analytics /> },
              { path: "whatsapp-outreach", element: <WhatsAppOutreach /> },
              { path: "auto-dialer", element: <AutoDialer /> },
              { path: "bulk-sms-email", element: <BulkSmsEmail /> },
              { path: "whatsapp-ai-chatbot", element: <WhatsAppAiChatbot /> },
              { path: "ai-ivr-calling", element: <AiIvrCalling /> },
            ],
          },
          {
            path: "/member/business-circle",
            element: <BusinessCircleLayout />,
            children: [
              { index: true, element: <Navigate to="circle-network" replace /> },
              { path: "circle-network", element: <CircleNetwork /> },
              { path: "overview", element: <Overview /> },
              { path: "business-groups", element: <BusinessGroups /> },
              { path: "member-reviews", element: <MemberReviews /> },
              { path: "meetings", element: <Meeting /> },
              { path: "knowledge-sessions", element: <KnowledgeSession /> },
              { path: "treasury", element: <Treasury /> },
              { path: "positions", element: <Positions /> },
              { path: "reminders", element: <Reminders /> },
              { path: "network", element: <Network /> },
              { path: "gratitude-wall", element: <Network /> },
              { path: "leaderboard", element: <Leaderboard /> },
              { path: "circles", element: <Circles /> },
              { path: "face-to-face", element: <FaceToFace /> },
              { path: "directory", element: <Directory /> },
              { path: "pitches", element: <Pitches /> },
              { path: "closed-business", element: <ClosedBusiness /> },
              { path: "guests", element: <Guests /> },
              { path: "business-leads", element: <BusinessLeads /> },
            ],
          },
          { path: "/member-dashboard/member-map", element: <MemberMap /> },
          { path: "/member/membership", element: <Membership /> },
          { path: "/member/membership/registration", element: <RegistrationPage /> },
        ],
      },
    ],
  },

  // ─── FALLBACK ─────────────────────────────────────────────────────────────
  {
    path: "*",
    element: <Navigate to="/login" />,
  },
];

export default AppRouter;