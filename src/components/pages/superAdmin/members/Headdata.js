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
export const STATE_HEAD_DATA = [
  { memberId: "UDY-1001", name: "Arjun Krishnamurthy", email: "arjun.k@udyami.in",     mobile: "+91 98401 12345", state: "Tamil Nadu",    status: "active"   },
  { memberId: "UDY-1002", name: "Lakshmi Narayanan",    email: "lakshmi.n@udyami.in",  mobile: "+91 98402 22456", state: "Karnataka",     status: "active"   },
  { memberId: "UDY-1003", name: "Ramesh Babu Reddy",    email: "ramesh.r@udyami.in",   mobile: "+91 98403 33567", state: "Andhra Pradesh",status: "inactive" },
  { memberId: "UDY-1004", name: "Suresh Kumar Nair",    email: "suresh.n@udyami.in",   mobile: "+91 98404 44678", state: "Kerala",        status: "active"   },
  { memberId: "UDY-1005", name: "Priya Venkatesh",      email: "priya.v@udyami.in",    mobile: "+91 98405 55789", state: "Telangana",     status: "active"   },
  { memberId: "UDY-1006", name: "Manoj Deshmukh",       email: "manoj.d@udyami.in",    mobile: "+91 98406 66890", state: "Maharashtra",   status: "inactive" },
  { memberId: "UDY-1007", name: "Anita Sharma",         email: "anita.s@udyami.in",    mobile: "+91 98407 77901", state: "Rajasthan",     status: "active"   },
  { memberId: "UDY-1008", name: "Vijay Chauhan",        email: "vijay.c@udyami.in",    mobile: "+91 98408 88012", state: "Gujarat",       status: "active"   },
  { memberId: "UDY-1009", name: "Sunita Patel",         email: "sunita.p@udyami.in",   mobile: "+91 98409 99123", state: "Madhya Pradesh",status: "inactive" },
  { memberId: "UDY-1010", name: "Deepak Singh Rathore", email: "deepak.s@udyami.in",   mobile: "+91 98410 10234", state: "Uttar Pradesh", status: "active"   },
  { memberId: "UDY-1011", name: "Kavita Iyer",          email: "kavita.i@udyami.in",   mobile: "+91 98411 11345", state: "Odisha",        status: "active"   },
  { memberId: "UDY-1012", name: "Rajesh Gowda",         email: "rajesh.g@udyami.in",   mobile: "+91 98412 12456", state: "Karnataka",     status: "active"   },
];

/* ── DISTRICT HEAD ───────────────────────────────────────────── */
export const DISTRICT_HEAD_DATA = [
  { memberId: "UDY-2001", name: "Murugan Selvakumar", email: "murugan.s@udyami.in",  mobile: "+91 98301 11111", state: "Tamil Nadu",     district: "Chennai",     status: "active"   },
  { memberId: "UDY-2002", name: "Kannan Raja",        email: "kannan.r@udyami.in",   mobile: "+91 98302 22222", state: "Tamil Nadu",     district: "Coimbatore",  status: "active"   },
  { memberId: "UDY-2003", name: "Vasanthi Kumari",    email: "vasanthi.k@udyami.in", mobile: "+91 98303 33333", state: "Tamil Nadu",     district: "Madurai",     status: "inactive" },
  { memberId: "UDY-2004", name: "Nagaraj Hegde",      email: "nagaraj.h@udyami.in",  mobile: "+91 98304 44444", state: "Karnataka",      district: "Bengaluru Urban", status: "active" },
  { memberId: "UDY-2005", name: "Shalini Rao",        email: "shalini.r@udyami.in",  mobile: "+91 98305 55555", state: "Karnataka",      district: "Mysuru",      status: "active"   },
  { memberId: "UDY-2006", name: "Girish Kulkarni",    email: "girish.k@udyami.in",   mobile: "+91 98306 66666", state: "Karnataka",      district: "Hubballi",    status: "inactive" },
  { memberId: "UDY-2007", name: "Padma Reddy",        email: "padma.r@udyami.in",    mobile: "+91 98307 77777", state: "Andhra Pradesh", district: "Guntur",      status: "active"   },
  { memberId: "UDY-2008", name: "Krishna Murthy",     email: "krishna.m@udyami.in",  mobile: "+91 98308 88888", state: "Andhra Pradesh", district: "Visakhapatnam", status: "active" },
  { memberId: "UDY-2009", name: "Anil Menon",         email: "anil.m@udyami.in",     mobile: "+91 98309 99999", state: "Kerala",         district: "Ernakulam",   status: "active"   },
  { memberId: "UDY-2010", name: "Beena Thomas",       email: "beena.t@udyami.in",    mobile: "+91 98310 10101", state: "Kerala",         district: "Kozhikode",   status: "inactive" },
];

/* ── TALUK HEAD ──────────────────────────────────────────────── */
export const TALUK_HEAD_DATA = [
  { memberId: "UDY-3001", name: "Pandian Selvaraj",   email: "pandian.s@udyami.in",  mobile: "+91 98201 11111", state: "Tamil Nadu", district: "Tirunelveli",     taluk: "Palayamkottai", status: "active"   },
  { memberId: "UDY-3002", name: "Meena Sundaram",     email: "meena.s@udyami.in",    mobile: "+91 98202 22222", state: "Tamil Nadu", district: "Chennai",         taluk: "Egmore",         status: "active"   },
  { memberId: "UDY-3003", name: "Karthik Balan",      email: "karthik.b@udyami.in",  mobile: "+91 98203 33333", state: "Tamil Nadu", district: "Coimbatore",      taluk: "Pollachi",       status: "inactive" },
  { memberId: "UDY-3004", name: "Ravikumar Shetty",   email: "ravikumar.s@udyami.in",mobile: "+91 98204 44444", state: "Karnataka",  district: "Bengaluru Urban", taluk: "Yelahanka",      status: "active"   },
  { memberId: "UDY-3005", name: "Sowmya Prasad",      email: "sowmya.p@udyami.in",   mobile: "+91 98205 55555", state: "Karnataka",  district: "Mysuru",          taluk: "Nanjangud",      status: "active"   },
  { memberId: "UDY-3006", name: "Harish Achar",       email: "harish.a@udyami.in",   mobile: "+91 98206 66666", state: "Karnataka",  district: "Hubballi",        taluk: "Dharwad",        status: "inactive" },
  { memberId: "UDY-3007", name: "Lavanya Reddy",      email: "lavanya.r@udyami.in",  mobile: "+91 98207 77777", state: "Andhra Pradesh", district: "Guntur",      taluk: "Tenali",         status: "active"   },
  { memberId: "UDY-3008", name: "Naveen Varma",       email: "naveen.v@udyami.in",   mobile: "+91 98208 88888", state: "Kerala",     district: "Ernakulam",       taluk: "Aluva",          status: "active"   },
];

/* ── WARD / HOBLI HEAD ───────────────────────────────────────── */
export const WARD_HOBLI_DATA = [
  { memberId: "UDY-4001", name: "Thangaraj P",       email: "thangaraj.p@udyami.in", mobile: "+91 98101 11111", state: "Tamil Nadu", district: "Tirunelveli",     taluk: "Palayamkottai", wardHobli: "Ward 12 - Melapalayam",     status: "active"   },
  { memberId: "UDY-4002", name: "Revathi Ganesan",   email: "revathi.g@udyami.in",   mobile: "+91 98102 22222", state: "Tamil Nadu", district: "Chennai",         taluk: "Egmore",         wardHobli: "Ward 05 - Chetpet",          status: "active"   },
  { memberId: "UDY-4003", name: "Bharath Kumar",     email: "bharath.k@udyami.in",   mobile: "+91 98103 33333", state: "Tamil Nadu", district: "Coimbatore",      taluk: "Pollachi",       wardHobli: "Ward 09 - Kinathukadavu",     status: "inactive" },
  { memberId: "UDY-4004", name: "Chandan Gowda",     email: "chandan.g@udyami.in",   mobile: "+91 98104 44444", state: "Karnataka",  district: "Bengaluru Urban", taluk: "Yelahanka",      wardHobli: "Hobli - Yelahanka North",    status: "active"   },
  { memberId: "UDY-4005", name: "Divya Shree",       email: "divya.s@udyami.in",     mobile: "+91 98105 55555", state: "Karnataka",  district: "Mysuru",          taluk: "Nanjangud",      wardHobli: "Hobli - Bilikere",           status: "active"   },
  { memberId: "UDY-4006", name: "Ashwin Rao",        email: "ashwin.r@udyami.in",    mobile: "+91 98106 66666", state: "Karnataka",  district: "Hubballi",        taluk: "Dharwad",        wardHobli: "Hobli - Kalghatgi",          status: "inactive" },
  { memberId: "UDY-4007", name: "Swathi Reddy",      email: "swathi.r@udyami.in",    mobile: "+91 98107 77777", state: "Andhra Pradesh", district: "Guntur",      taluk: "Tenali",         wardHobli: "Ward 03 - Tenali East",       status: "active"   },
  { memberId: "UDY-4008", name: "Gopinath Menon",    email: "gopinath.m@udyami.in",  mobile: "+91 98108 88888", state: "Kerala",     district: "Ernakulam",       taluk: "Aluva",          wardHobli: "Ward 07 - Aluva South",       status: "active"   },
];