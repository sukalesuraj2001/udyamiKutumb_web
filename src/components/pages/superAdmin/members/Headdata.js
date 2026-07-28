/**
 * headData.js
 * ─────────────────────────────────────────────────────────────
 * Central data source for all "Head" listing pages
 * (State / District / Taluk / Ward-Hobli).
 *
 * NOTE: This file currently exports static sample arrays.
 * When wiring up the real API, replace these exports with
 * fetch calls / React Query hooks that resolve to the same
 * shape, so HeadTable and the page components require no
 * changes. e.g.:
 *
 *   export const getStateHeads = () => api.get("/heads/state");
 *
 * Keeping the field names identical to the ones below
 * (memberId, name, email, mobile, state, district, taluk,
 * wardHobli, status) is what keeps HeadTable plug-and-play.
 * ─────────────────────────────────────────────────────────────
 */

/* ── STATE HEAD ─────────────────────────────────────────────── */
// export const STATE_HEAD_DATA = [
//   { memberId: "UDY-1001", name: "Arjun Krishnamurthy", email: "arjun.k@udyami.in",     mobile: "+91 98401 12345", state: "Tamil Nadu",    status: "active"   },
//   { memberId: "UDY-1002", name: "Lakshmi Narayanan",    email: "lakshmi.n@udyami.in",  mobile: "+91 98402 22456", state: "Karnataka",     status: "active"   },
//   { memberId: "UDY-1003", name: "Ramesh Babu Reddy",    email: "ramesh.r@udyami.in",   mobile: "+91 98403 33567", state: "Andhra Pradesh",status: "inactive" },
//   { memberId: "UDY-1004", name: "Suresh Kumar Nair",    email: "suresh.n@udyami.in",   mobile: "+91 98404 44678", state: "Kerala",        status: "active"   },
//   { memberId: "UDY-1005", name: "Priya Venkatesh",      email: "priya.v@udyami.in",    mobile: "+91 98405 55789", state: "Telangana",     status: "active"   },
//   { memberId: "UDY-1006", name: "Manoj Deshmukh",       email: "manoj.d@udyami.in",    mobile: "+91 98406 66890", state: "Maharashtra",   status: "inactive" },
//   { memberId: "UDY-1007", name: "Anita Sharma",         email: "anita.s@udyami.in",    mobile: "+91 98407 77901", state: "Rajasthan",     status: "active"   },
//   { memberId: "UDY-1008", name: "Vijay Chauhan",        email: "vijay.c@udyami.in",    mobile: "+91 98408 88012", state: "Gujarat",       status: "active"   },
//   { memberId: "UDY-1009", name: "Sunita Patel",         email: "sunita.p@udyami.in",   mobile: "+91 98409 99123", state: "Madhya Pradesh",status: "inactive" },
//   { memberId: "UDY-1010", name: "Deepak Singh Rathore", email: "deepak.s@udyami.in",   mobile: "+91 98410 10234", state: "Uttar Pradesh", status: "active"   },
//   { memberId: "UDY-1011", name: "Kavita Iyer",          email: "kavita.i@udyami.in",   mobile: "+91 98411 11345", state: "Odisha",        status: "active"   },
//   { memberId: "UDY-1012", name: "Rajesh Gowda",         email: "rajesh.g@udyami.in",   mobile: "+91 98412 12456", state: "Karnataka",     status: "active"   },
// ];

/* ── DISTRICT HEAD ───────────────────────────────────────────── */
export const DISTRICT_HEAD_DATA = [
  { memberId: "UDY-2001", name: "Murugan Selvakumar", email: "murugan.s@udyami.in",  mobile: "+91 98301 11111", state: "Tamil Nadu",     district: "Chennai",     status: "active"   },
];

/* ── TALUK HEAD ──────────────────────────────────────────────── */
export const TALUK_HEAD_DATA = [
  { memberId: "UDY-3001", name: "Pandian Selvaraj",   email: "pandian.s@udyami.in",  mobile: "+91 98201 11111", state: "Tamil Nadu", district: "Tirunelveli",     taluk: "Palayamkottai", status: "active"   },
];

/* ── WARD / HOBLI HEAD ───────────────────────────────────────── */
export const WARD_HOBLI_DATA = [
  { memberId: "UDY-4001", name: "Thangaraj P",       email: "thangaraj.p@udyami.in", mobile: "+91 98101 11111", state: "Tamil Nadu", district: "Tirunelveli",     taluk: "Palayamkottai", wardHobli: "Ward 12 - Melapalayam",     status: "active"   },
];