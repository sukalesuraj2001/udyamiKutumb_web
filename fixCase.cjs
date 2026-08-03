const fs = require('fs');
const path = require('path');

// [relativeFilePath, oldImportString, newImportString]
const fixes = [
  ['src/components/auth/Login.jsx', '../redux/slices/areaChartSlice.js', '../redux/slices/areaChartSlice.js'],
  ['src/components/common/AdminLayout.jsx', './Sidebar.jsx', './SideBar.jsx'],
  ['src/components/pages/areaChart/AreaChartBuilder.jsx', '../../redux/slices/AuthSlice', '../../redux/slices/authSlice'],
  ['src/components/pages/businessCircle/Businessleads.jsx', '../businessCircle/closedBusiness/SlideOver.jsx', '../businessCircle/closedBusiness/Slideover.jsx'],
  ['src/components/pages/businessCircle/Businessleads.jsx', '../businessCircle/closedBusiness/ConfirmDeleteModal.jsx', '../businessCircle/closedBusiness/Confirmdeletemodal.jsx'],
  ['src/components/pages/businessCircle/closedBusiness/Closedbusiness.jsx', './SlideOver.jsx', './Slideover.jsx'],
  ['src/components/pages/businessCircle/closedBusiness/Closedbusiness.jsx', './ConfirmDeleteModal.jsx', './Confirmdeletemodal.jsx'],
  ['src/components/pages/businessCircle/guests/Guests.jsx', '../../businessCircle/closedBusiness/SlideOver.jsx', '../../businessCircle/closedBusiness/Slideover.jsx'],
  ['src/components/pages/businessCircle/guests/Guests.jsx', '../../businessCircle/closedBusiness/ConfirmDeleteModal.jsx', '../../businessCircle/closedBusiness/Confirmdeletemodal.jsx'],
  ['src/components/pages/communication/SendCampaign.jsx', './AdminCsvSection', './Admincsvsection'],
  ['src/components/pages/membership/Membership.jsx', './PaymentsTab.jsx', './Paymentstab.jsx'],
  ['src/components/pages/membership/Membership.jsx', './BuyPlanTab.jsx', './Buyplantab.jsx'],
  ['src/components/pages/membership/Membership.jsx', './RevenueTab.jsx', './Revenuetab.jsx'],
  ['src/components/pages/membership/Membership.jsx', './UpgradeFunnelTab.jsx', './Upgradefunneltab.jsx'],
  ['src/components/pages/membership/Membership.jsx', './ManagePlansTab.jsx', './Manageplanstab.jsx'],
  ['src/components/pages/onbording/cpOnbording/Buildersection.jsx', './BuilderField', './Builderfield'],
  ['src/components/pages/onbording/cpOnbording/Buildersidebar.jsx', './BuilderSection', './Buildersection'],
  ['src/components/pages/onbording/cpOnbording/Formbuilder.jsx', './BuilderSidebar', './Buildersidebar'],
  ['src/components/pages/onbording/cpOnbording/Formbuilder.jsx', './FormPreview.jsx', './Formpreview.jsx'],
  ['src/components/pages/onbording/cpOnbording/Formbuilder.jsx', './FieldEditorModal', './Fieldeditormodal'],
  ['src/components/pages/onbording/cpOnbording/Formbuilder.jsx', './ConfirmationModal', './Confirmationmodal'],
  ['src/components/pages/superAdmin/CreateWard.jsx', '../../redux/slices/Wardslice.js', '../../redux/slices/wardSlice.js'],
  ['src/components/pages/superAdmin/members/DistrictHead.jsx', './headData.js', './Headdata.js'],
  ['src/components/pages/superAdmin/members/StateHead.jsx', './headData.js', './Headdata.js'],
  ['src/components/pages/superAdmin/members/TalukHead.jsx', './headData.js', './Headdata.js'],
  ['src/components/pages/superAdmin/members/WardHobliHead.jsx', './headData.js', './Headdata.js'],
  ['src/components/pages/SuperAdmin.jsx', '../redux/slices/dashboardSlice.JS', '../redux/slices/dashboardSlice.js'],
  ['src/components/pages/users/RoleManagement/tabs/AssignRolesTab.jsx', '../../../../redux/slices/areaChartSlice', '../../../../redux/slices/areaChartSlice'],
  ['src/components/router/AppRouter.jsx', '../pages/channelPartners/ChannelPArtner.jsx', '../pages/channelPartners/ChannelPartner.jsx'],
];

let fixedCount = 0;
let errorCount = 0;

fixes.forEach(([relPath, oldStr, newStr]) => {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  FILE NOT FOUND: ${relPath}`);
    errorCount++;
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  if (!content.includes(oldStr)) {
    console.log(`⚠️  STRING NOT FOUND in ${relPath}: "${oldStr}"`);
    errorCount++;
    return;
  }
  const updated = content.split(oldStr).join(newStr);
  fs.writeFileSync(fullPath, updated, 'utf8');
  console.log(`✅ Fixed ${relPath}`);
  console.log(`   "${oldStr}" -> "${newStr}"`);
  fixedCount++;
});

console.log(`\nDone. Fixed ${fixedCount}, errors ${errorCount}.`);
