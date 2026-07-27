import React from "react";
import CpFormFeild from "../CpFormFeild.jsx";

const LANGUAGES = ["Kannada", "Hindi", "English", "Tamil", "Telugu", "Malayalam", "Marathi", "Urdu"];

export default function Step1PersonalContact({ data, update }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild label="Full Name" required value={data.firstName} onChange={(v) => update({ firstName: v })} placeholder="First Name" />
        <CpFormFeild label="Last Name" required value={data.lastName} onChange={(v) => update({ lastName: v })} />
        <CpFormFeild label="Father's Name" value={data.fathersName} onChange={(v) => update({ fathersName: v })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild label="Mother's Name" value={data.mothersName} onChange={(v) => update({ mothersName: v })} />
        <CpFormFeild label="Date of Birth" type="date" value={data.dob} onChange={(v) => update({ dob: v })} />
        <CpFormFeild label="Gender" type="select" options={["Male", "Female", "Other"]} value={data.gender} onChange={(v) => update({ gender: v })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild label="Marital Status" type="select" options={["Single", "Married", "Widowed", "Divorced"]} value={data.maritalStatus} onChange={(v) => update({ maritalStatus: v })} />
        <CpFormFeild label="Primary Mobile" required value={data.primaryMobile} onChange={(v) => update({ primaryMobile: v })} />
        <CpFormFeild label="WhatsApp Number" value={data.whatsappNumber} onChange={(v) => update({ whatsappNumber: v })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild label="Email" required value={data.email} onChange={(v) => update({ email: v })} />
        <CpFormFeild label="Preferred Channel" type="select" options={["WhatsApp", "SMS", "Email", "Phone Call"]} value={data.preferredChannel} onChange={(v) => update({ preferredChannel: v })} />
        <CpFormFeild label="Preferred Language" type="select" options={LANGUAGES} value={data.preferredLanguage} onChange={(v) => update({ preferredLanguage: v })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild label="Blood Group" type="select" options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} value={data.bloodGroup} onChange={(v) => update({ bloodGroup: v })} />
        <CpFormFeild label="Education" type="select" options={["Below 10th", "10th Pass", "12th Pass", "Diploma", "Graduate", "Postgraduate"]} value={data.education} onChange={(v) => update({ education: v })} />
        <CpFormFeild label="Family Income" type="select" options={["Below ₹1 Lakh", "₹1 Lakh - ₹5 Lakhs", "₹5 Lakhs - ₹10 Lakhs", "₹10 Lakhs - ₹25 Lakhs", "₹25 Lakhs - ₹50 Lakhs", "Above ₹50 Lakhs"]} value={data.familyIncome} onChange={(v) => update({ familyIncome: v })} />
      </div>

      <CpFormFeild label="Current Address" value={data.currentAddress} onChange={(v) => update({ currentAddress: v })} />
      <CpFormFeild label="Permanent Address" value={data.permanentAddress} onChange={(v) => update({ permanentAddress: v })} />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <CpFormFeild label="Ward" type="select" options={[]} value={data.ward} onChange={(v) => update({ ward: v })} />
        <CpFormFeild label="Circle" value={data.circle} onChange={(v) => update({ circle: v })} />
        <CpFormFeild label="State" type="select" options={["Karnataka", "Tamil Nadu", "Kerala"]} value={data.state} onChange={(v) => update({ state: v })} />
        <CpFormFeild label="Pincode" value={data.pincode} onChange={(v) => update({ pincode: v })} />
      </div>

      <CpFormFeild label="Languages Known" type="chips" chips={LANGUAGES} value={data.languagesKnown} onChange={(v) => update({ languagesKnown: v })} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CpFormFeild label="Emergency Contact Name" required value={data.emergencyContactName} onChange={(v) => update({ emergencyContactName: v })} placeholder="Full Name" />
        <CpFormFeild label="Emergency Phone" required value={data.emergencyPhone} onChange={(v) => update({ emergencyPhone: v })} />
        <CpFormFeild label="Relationship" type="select" options={["Spouse", "Parent", "Sibling", "Child", "Friend", "Other"]} value={data.emergencyRelationship} onChange={(v) => update({ emergencyRelationship: v })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CpFormFeild label="Government ID Type" type="select" options={["Aadhaar", "PAN", "Voter ID", "Driving License", "Passport", "Ration Card"]} value={data.govtIdType} onChange={(v) => update({ govtIdType: v })} />
        <CpFormFeild label="Government ID Number" required value={data.govtIdNumber} onChange={(v) => update({ govtIdNumber: v })} placeholder="Enter ID Number" />
      </div>
    </div>
  );
}