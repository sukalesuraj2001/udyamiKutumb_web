import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, fetchProfile } from "../../redux/slices/profileSlice.js";
import { X, MapPin, Upload, Trash2, Building2, User, ChevronDown } from "lucide-react";
import LocationPickerModal from "../../auth/LocationPickerModal.jsx";
import api from "../../service/api.js";

// ─── Styles ───────────────────────────────────────────────────────────────────
const inputCls =
  "w-full border border-[#D1D9EC] rounded-lg px-3.5 py-2.5 text-[13.5px] bg-[#F8FAFF] text-[#1a2b4a] placeholder:text-slate-300 outline-none focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-[#1a56db]/10 transition";
const readonlyCls =
  "w-full border border-[#E2E8F4] rounded-lg px-3.5 py-2.5 text-[13.5px] bg-[#F1F5F9] text-slate-400 outline-none cursor-not-allowed";
const errorCls = "text-[11.5px] text-red-500 mt-1 font-mono";

// ─── Dropdown options ─────────────────────────────────────────────────────────
const BUSINESS_TYPES = [
  "Proprietorship", "Partnership", "LLP", "Private Limited (Pvt Ltd)",
  "Public Limited", "One Person Company (OPC)", "NGO / Trust / Society",
  "Government / PSU", "Hospital / Clinic", "Retail Shop",
  "Wholesale / Distribution", "Manufacturing", "Service Provider",
  "Freelancer / Consultant", "Others",
];

const STATES = [
  "Karnataka", "Tamil Nadu", "Kerala", "Andhra Pradesh", "Telangana",
  "Maharashtra", "Goa", "Gujarat", "Delhi", "Puducherry", "Rajasthan",
  "Uttar Pradesh", "Madhya Pradesh", "West Bengal", "Punjab", "Haryana",
  "Bihar", "Odisha", "Assam", "Jharkhand", "Chhattisgarh", "Himachal Pradesh",
  "Uttarakhand", "Jammu and Kashmir", "Ladakh"
];

const SECTORS = [
  "Healthcare", "IT / Software", "Education", "Retail & E-commerce",
  "Manufacturing", "Agriculture", "Finance & Banking",
  "Real Estate & Construction", "Hospitality & Tourism",
  "Transportation & Logistics", "Media & Entertainment",
  "Legal & Compliance", "Government & Public Sector",
  "Non-Profit / NGO", "Others",
];

const EMPLOYEE_RANGES = [
  "1 – 10", "11 – 50", "51 – 100", "101 – 500",
  "501 – 1,000", "1,001 – 5,000", "5,000+", "Others",
];

const TURNOVER_RANGES = [
  "Below ₹10 Lakhs", "₹10 – 50 Lakhs", "₹50 Lakhs – 1 Crore",
  "₹1 – 5 Crore", "₹5 – 10 Crore", "₹10 – 50 Crore",
  "₹50 Crore – 1 Billion", "Above ₹1 Billion", "Others",
];

const WORKING_HOURS = [
  "9 AM – 5 PM", "9 AM – 6 PM", "10 AM – 6 PM", "8 AM – 8 PM",
  "7 AM – 10 PM", "24 / 7", "Night Shift (10 PM – 6 AM)", "Others",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1950 + 1 }, (_, i) =>
  String(currentYear - i)
).concat(["Others"]);

// ─── GST Validation ───────────────────────────────────────────────────────────
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
function validateGST(value) {
  if (!value) return null;
  const v = value.trim().toUpperCase();
  if (v.length !== 15) return "GST must be exactly 15 characters";
  if (!GST_REGEX.test(v)) return "Invalid GST format (e.g. 29ABCDE1234F1Z5)";
  return null;
}

// ─── SelectOrText — dropdown + "Others" free-text ────────────────────────────
function SelectOrText({ options, value, onChange, placeholder }) {
  const isOther = value && !options.slice(0, -1).includes(value);
  const [showOther, setShowOther] = useState(isOther);

  useEffect(() => {
    setShowOther(value && !options.slice(0, -1).includes(value));
  }, []); // eslint-disable-line

  const handleSelect = (e) => {
    const v = e.target.value;
    if (v === "Others") {
      setShowOther(true);
      onChange("");
    } else {
      setShowOther(false);
      onChange(v);
    }
  };

  const selectValue = showOther ? "Others" : (value || "");

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <select
          className={inputCls + " appearance-none pr-8"}
          value={selectValue}
          onChange={handleSelect}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {showOther && (
        <input
          className={inputCls}
          placeholder={placeholder || "Enter manually…"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className={errorCls}>{error}</p>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-2">
      <div className="w-6 h-6 rounded-md bg-[#EEF3FF] flex items-center justify-center">
        <Icon size={13} className="text-[#1a56db]" />
      </div>
      <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">{title}</span>
      <div className="flex-1 h-px bg-[#E2E8F4]" />
    </div>
  );
}

// ─── Image Upload (max 3) ─────────────────────────────────────────────────────
function BusinessImageUpload({ images, onChange }) {
  const inputRef = useRef(null);
  const MAX = 3;

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX - images.length;
    if (remaining <= 0) return;

    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Str = reader.result; // "data:image/jpeg;base64,..."
        const newImg = {
          file,
          preview: base64Str,
          base64: base64Str,
          fileName: file.name,
          mimeType: file.type || "image/jpeg",
          isNew: true,
        };
        onChange((prev) => [...prev, newImg]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const remove = (idx) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="flex gap-3 flex-wrap mb-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#E2E8F4] group shadow-sm">
            <img
              src={img.preview || img.url || ""}
              alt={`Business ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "https://via.placeholder.com/96x96?text=Img"; }}
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={11} />
            </button>
            <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] rounded px-1">{idx + 1}</span>
          </div>
        ))}
        {images.length < MAX && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-[#C7D7FA] bg-[#EEF3FF] flex flex-col items-center justify-center gap-1 hover:border-[#1a56db] hover:bg-[#E5EDFF] transition"
          >
            <Upload size={16} className="text-[#1a56db]" />
            <span className="text-[10.5px] text-[#1a56db] font-medium">Upload</span>
          </button>
        )}
      </div>
      <p className="text-[11px] text-slate-400">{images.length}/{MAX} images · JPG, PNG, WEBP · Max 5MB each</p>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
    </div>
  );
}

function MapPinButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} title="Pick on map"
      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1a56db] hover:text-[#1547c0] transition">
      <MapPin size={16} />
    </button>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function EditProfileModal({ profile, userId, onClose }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.profile);

  const [mapOpen, setMapOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [gstError, setGstError] = useState(null);

  // ── FIX: Store selected ward's geoJson for map boundary ──
  const [selectedWardGeoJson, setSelectedWardGeoJson] = useState(null);

  const [personal, setPersonal] = useState({
    alternateMobile: "", gender: "", state: "", district: "",
    assembly: "", ward: "", pincode: "", homeAddress: "", officeAddress: "",
  });

  const [hasBusiness, setHasBusiness] = useState(false);
  const [business, setBusiness] = useState({
    businessName: "", businessType: "", ownerName: "", businessMobile: "",
    sector: "", city: "", district: "", state: "", pincode: "",
    website: "", gstNumber: "", registrationNumber: "",
    employees: "", annualTurnover: "", establishedYear: "",
    workingHours: "", address: "", latitude: 0, longitude: 0,
    businessLocation: "",
  });
  const [businessImages, setBusinessImages] = useState([]);

  // ── Cascading location states (District -> Assembly/Taluka -> Ward) ──
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  const [talukas, setTalukas] = useState([]);
  const [loadingTalukas, setLoadingTalukas] = useState(false);
  const [selectedTalukaId, setSelectedTalukaId] = useState("");

  const [wards, setWards] = useState([]);
  const [loadingWards, setLoadingWards] = useState(false);

  // Business Location Cascading States
  const [bizTalukas, setBizTalukas] = useState([]);
  const [loadingBizTalukas, setLoadingBizTalukas] = useState(false);
  const [selectedBizDistrictId, setSelectedBizDistrictId] = useState("");

  const [bizWards, setBizWards] = useState([]);
  const [loadingBizWards, setLoadingBizWards] = useState(false);
  const [selectedBizTalukaId, setSelectedBizTalukaId] = useState("");

  // Fetch districts list on mount
  useEffect(() => {
    const fetchAllDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const res = await api.get("/district/getAllDistricts");
        setDistricts(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load districts:", err);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchAllDistricts();
  }, []);

  const loadTalukas = async (districtId) => {
    if (!districtId) { setTalukas([]); return; }
    try {
      setLoadingTalukas(true);
      const res = await api.get(`/district/getAllDistricts?districtId=${districtId}`);
      setTalukas(res.data?.data || []);
    } catch (e) {
      console.error("Failed to load talukas:", e);
      setTalukas([]);
    } finally {
      setLoadingTalukas(false);
    }
  };

  const loadWards = async (talukaId) => {
    if (!talukaId) { setWards([]); return; }
    try {
      setLoadingWards(true);
      let res = await api.get(`/ward/getWardBy/${talukaId}`).catch(() => null);
      if (!res?.data?.data || res.data.data.length === 0) {
        res = await api.get(`/district/getWards?talukaId=${talukaId}`).catch(() => null);
      }
      setWards(res?.data?.data || []);
    } catch (e) {
      console.error("Failed to load wards:", e);
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  const loadBizTalukas = async (districtId) => {
    if (!districtId) { setBizTalukas([]); return; }
    try {
      setLoadingBizTalukas(true);
      const res = await api.get(`/district/getAllDistricts?districtId=${districtId}`);
      setBizTalukas(res.data?.data || []);
    } catch (e) {
      setBizTalukas([]);
    } finally {
      setLoadingBizTalukas(false);
    }
  };

  const loadBizWards = async (talukaId) => {
    if (!talukaId) { setBizWards([]); return; }
    try {
      setLoadingBizWards(true);
      let res = await api.get(`/ward/getWardBy/${talukaId}`).catch(() => null);
      if (!res?.data?.data || res.data.data.length === 0) {
        res = await api.get(`/district/getWards?talukaId=${talukaId}`).catch(() => null);
      }
      setBizWards(res?.data?.data || []);
    } catch (e) {
      setBizWards([]);
    } finally {
      setLoadingBizWards(false);
    }
  };

  // ── Populate from profile ──
  useEffect(() => {
    if (!profile) return;
    const pd = profile.profile || profile || {};
    const bd = pd.businessDetails || pd || {};

    setPersonal({
      alternateMobile: pd.alternateMobile || "",
      gender: pd.gender || "",
      state: pd.state || "",
      district: pd.district || "",
      assembly: pd.assembly || "",
      ward: pd.ward || "",
      pincode: pd.pincode || "",
      homeAddress: pd.homeAddress || "",
      officeAddress: pd.officeAddress || "",
    });

    const hasBiz = pd.hasBusiness || Boolean(bd.businessName || pd.businessName);
    setHasBusiness(hasBiz);

    setBusiness({
      businessName: bd.businessName || pd.businessName || "",
      businessType: bd.businessType || pd.businessType || "",
      ownerName: bd.ownerName || pd.ownerName || "",
      businessMobile: bd.businessMobile || pd.businessMobile || "",
      sector: bd.sector || pd.sector || "",
      city: bd.city || pd.city || "",
      district: bd.district || pd.district || "",
      state: bd.state || pd.state || "",
      pincode: bd.pincode || pd.pincode || "",
      website: bd.website || pd.website || "",
      gstNumber: bd.gstNumber || pd.gstNumber || "",
      registrationNumber: bd.registrationNumber || pd.registrationNumber || "",
      employees: (bd.employees ?? pd.employees) != null ? String(bd.employees ?? pd.employees) : "",
      annualTurnover: bd.annualTurnover || pd.annualTurnover || "",
      establishedYear: (bd.establishedYear ?? pd.establishedYear) != null ? String(bd.establishedYear ?? pd.establishedYear) : "",
      workingHours: bd.workingHours || pd.workingHours || "",
      address: bd.address || pd.address || "",
      latitude: bd.latitude || pd.latitude || 0,
      longitude: bd.longitude || pd.longitude || 0,
      businessLocation: bd.address || pd.address || "",
      assembly: bd.assembly || pd.assembly || "",
      ward: bd.ward || pd.ward || "",
    });

    const imgs = [];
    ["businessImage1", "businessImage2", "businessImage3"].forEach((key) => {
      const imgData = bd[key] || pd[key];
      if (imgData) imgs.push({ isNew: false, preview: imgData.url || imgData.fileName || "", ...imgData });
    });
    setBusinessImages(imgs);
  }, [profile]);

  // Match profile's existing district & assembly to fetch cascading dropdown options
  useEffect(() => {
    if (personal.district && districts.length > 0) {
      const matched = districts.find(
        (d) => (d.districtName || d.name || "").toLowerCase() === personal.district.toLowerCase() || d._id === personal.district || d.districtId === personal.district
      );
      if (matched) {
        const distId = matched._id || matched.districtId || matched.id;
        if (distId && distId !== selectedDistrictId) {
          setSelectedDistrictId(distId);
          loadTalukas(distId);
        }
      }
    }
  }, [personal.district, districts]);

  useEffect(() => {
    if (personal.assembly && talukas.length > 0) {
      const matched = talukas.find(
        (t) => (t.talukaName || t.name || "").toLowerCase() === personal.assembly.toLowerCase() || t._id === personal.assembly || t.talukaId === personal.assembly
      );
      if (matched) {
        const talId = matched._id || matched.talukaId || matched.id;
        if (talId && talId !== selectedTalukaId) {
          setSelectedTalukaId(talId);
          loadWards(talId);
        }
      }
    }
  }, [personal.assembly, talukas]);

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setPersonal((f) => ({ ...f, district: "", assembly: "", ward: "" }));
      setSelectedDistrictId("");
      setSelectedTalukaId("");
      setTalukas([]);
      setWards([]);
      setSelectedWardGeoJson(null);
      return;
    }
    const matched = districts.find(
      (d) => (d._id || d.districtId || d.id) === val || (d.districtName || d.name) === val
    );
    const distName = matched ? (matched.districtName || matched.name) : val;
    const distId = matched ? (matched._id || matched.districtId || matched.id) : val;

    setPersonal((f) => ({ ...f, district: distName, assembly: "", ward: "" }));
    setSelectedDistrictId(distId);
    setSelectedTalukaId("");
    setTalukas([]);
    setWards([]);
    setSelectedWardGeoJson(null);
    loadTalukas(distId);
  };

  const handleAssemblyChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setPersonal((f) => ({ ...f, assembly: "", ward: "" }));
      setSelectedTalukaId("");
      setWards([]);
      setSelectedWardGeoJson(null);
      return;
    }
    const matched = talukas.find(
      (t) => (t._id || t.talukaId || t.id) === val || (t.talukaName || t.name) === val
    );
    const talName = matched ? (matched.talukaName || matched.name) : val;
    const talId = matched ? (matched._id || matched.talukaId || matched.id) : val;

    const autoPin = matched?.pincode || matched?.pinCode || matched?.postalCode || matched?.zipCode || matched?.pin || (Array.isArray(matched?.pincodes) ? matched.pincodes[0] : null);

    setPersonal((f) => ({
      ...f,
      assembly: talName,
      ward: "",
      ...(autoPin ? { pincode: String(autoPin) } : {})
    }));
    setSelectedTalukaId(talId);
    setWards([]);
    setSelectedWardGeoJson(null);
    loadWards(talId);
  };

  // ── FIX: Ward change now captures geoJson from ward response ──
  const handleWardChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setPersonal((f) => ({ ...f, ward: "" }));
      setSelectedWardGeoJson(null);
      return;
    }
    const matched = wards.find(
      (w) => (w._id || w.wardId || w.id) === val || (w.wardName || w.name) === val
    );
    const wardLabel = matched
      ? (matched.wardName || matched.name || val)
      : val;

    const autoPin = matched?.pincode || matched?.pinCode || matched?.postalCode || matched?.zipCode || matched?.pin || (Array.isArray(matched?.pincodes) ? matched.pincodes[0] : null);

    // Store geoJson for map boundary display
    if (matched?.geoJson) {
      setSelectedWardGeoJson(matched.geoJson);
    } else {
      setSelectedWardGeoJson(null);
    }

    setPersonal((f) => ({
      ...f,
      ward: wardLabel,
      ...(autoPin ? { pincode: String(autoPin) } : {})
    }));
  };

  // Business Location Handlers
  const handleBizDistrictChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setBusiness((f) => ({ ...f, district: "", assembly: "", taluka: "", ward: "" }));
      setSelectedBizDistrictId("");
      setSelectedBizTalukaId("");
      setBizTalukas([]);
      setBizWards([]);
      return;
    }
    const matched = districts.find(
      (d) => (d._id || d.districtId || d.id) === val || (d.districtName || d.name) === val
    );
    const distName = matched ? (matched.districtName || matched.name) : val;
    const distId = matched ? (matched._id || matched.districtId || matched.id) : val;

    setBusiness((f) => ({ ...f, district: distName, assembly: "", taluka: "", ward: "" }));
    setSelectedBizDistrictId(distId);
    setSelectedBizTalukaId("");
    setBizTalukas([]);
    setBizWards([]);
    loadBizTalukas(distId);
  };

  const handleBizAssemblyChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setBusiness((f) => ({ ...f, assembly: "", taluka: "", ward: "" }));
      setSelectedBizTalukaId("");
      setBizWards([]);
      return;
    }
    const matched = bizTalukas.find(
      (t) => (t._id || t.talukaId || t.id) === val || (t.talukaName || t.name) === val
    );
    const talName = matched ? (matched.talukaName || matched.name) : val;
    const talId = matched ? (matched._id || matched.talukaId || matched.id) : val;

    const autoPin = matched?.pincode || matched?.pinCode || matched?.postalCode || matched?.zipCode || matched?.pin || (Array.isArray(matched?.pincodes) ? matched.pincodes[0] : null);

    setBusiness((f) => ({
      ...f,
      assembly: talName,
      taluka: talName,
      ward: "",
      ...(autoPin ? { pincode: String(autoPin) } : {})
    }));
    setSelectedBizTalukaId(talId);
    setBizWards([]);
    loadBizWards(talId);
  };

  const handleBizWardChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setBusiness((f) => ({ ...f, ward: "" }));
      setSelectedWardGeoJson(null);
      return;
    }
    const matched = bizWards.find(
      (w) => (w._id || w.wardId || w.id) === val || (w.wardName || w.name) === val
    );
    const wardLabel = matched
      ? (matched.wardName || matched.name || val)
      : val;

    if (matched?.geoJson) {
      setSelectedWardGeoJson(matched.geoJson);
    } else {
      setSelectedWardGeoJson(null);
    }

    const autoPin = matched?.pincode || matched?.pinCode || matched?.postalCode || matched?.zipCode || matched?.pin || (Array.isArray(matched?.pincodes) ? matched.pincodes[0] : null);

    setBusiness((f) => ({
      ...f,
      ward: wardLabel,
      ...(autoPin ? { pincode: String(autoPin) } : {})
    }));
  };

  const updatePersonal = (key) => (e) => setPersonal((f) => ({ ...f, [key]: e.target.value }));
  const setBiz = (key, val) => setBusiness((f) => ({ ...f, [key]: val }));
  const updateBiz = (key) => (e) => setBiz(key, e.target.value);

  const handleGSTChange = (e) => {
    const v = e.target.value.toUpperCase().slice(0, 15);
    setBiz("gstNumber", v);
    setGstError(validateGST(v));
  };

  const handleLocationSelect = ({ address, lat, lng }) => {
    setBusiness((f) => ({ ...f, businessLocation: address, address, latitude: lat, longitude: lng }));
    setMapOpen(false);
  };

  // ── Save profile with exact JSON payload structure matching API spec ──
  const handleSave = async () => {
    const gstErr = validateGST(business.gstNumber);
    if (gstErr) { setGstError(gstErr); return; }

    const getImageObject = (idx) => {
      const img = businessImages[idx];
      if (!img) return null;
      const fileName = img.fileName || (img.file ? img.file.name : null) || (img.url ? img.url.split("/").pop() : "image.jpg");
      const mimeType = img.mimeType || (img.file ? img.file.type : "image/jpeg");
      const imageStr = img.base64 || img.preview || img.url || "";

      return {
        image: imageStr,
        fileName,
        mimeType,
      };
    };

    const parseNum = (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const n = Number(val);
      return isNaN(n) ? val : n;
    };

    const payload = {
      // Personal fields at root level
      alternateMobile: personal.alternateMobile || null,
      gender: personal.gender || null,
      state: personal.state || null,
      district: personal.district || null,
      assembly: personal.assembly || null,
      ward: personal.ward || null,
      pincode: personal.pincode || null,
      homeAddress: personal.homeAddress || null,
      officeAddress: personal.officeAddress || null,
      hasBusiness: Boolean(hasBusiness),
      profileImage: profile?.profileImage || profile?.photo || profile?.avatar || null,

      // Business details nested object
      businessDetails: hasBusiness ? {
        businessName: business.businessName || null,
        businessType: business.businessType || null,
        ownerName: business.ownerName || null,
        businessMobile: business.businessMobile || null,
        sector: business.sector || null,
        city: business.city || null,
        district: business.district || null,
        state: business.state || null,
        pincode: business.pincode || null,
        website: business.website || null,
        gstNumber: business.gstNumber || null,
        registrationNumber: business.registrationNumber || null,
        employees: parseNum(business.employees),
        annualTurnover: business.annualTurnover || null,
        establishedYear: parseNum(business.establishedYear),
        workingHours: business.workingHours || null,
        address: business.address || business.businessLocation || null,
        latitude: business.latitude ? Number(business.latitude) : null,
        longitude: business.longitude ? Number(business.longitude) : null,
        businessImage1: getImageObject(0),
        businessImage2: getImageObject(1),
        businessImage3: getImageObject(2),
      } : {},
    };

    const result = await dispatch(updateProfile({ userId, payload }));
    if (updateProfile.fulfilled.match(result)) {
      setToast(true);
      setTimeout(() => setToast(false), 3000);
      await dispatch(fetchProfile(userId));
      onClose();
    }
  };

  // ── Derive map center: ward centroid (if geoJson available) → else lat/lng from business ──
  const getMapInitialCoords = () => {
    if (selectedWardGeoJson?.geometry?.coordinates) {
      try {
        const coords = selectedWardGeoJson.geometry.coordinates[0];
        if (coords?.length > 0) {
          // Calculate centroid from polygon coordinates
          const lngSum = coords.reduce((s, c) => s + c[0], 0);
          const latSum = coords.reduce((s, c) => s + c[1], 0);
          return { lat: latSum / coords.length, lng: lngSum / coords.length };
        }
      } catch (_) {}
    }
    if (business.latitude) return { lat: business.latitude, lng: business.longitude };
    return null;
  };

  const mapCenter = getMapInitialCoords();

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
        <div className="bg-white rounded-2xl border border-[#E2E8F4] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F4] shrink-0">
            <h2 className="text-[15px] font-bold text-[#1a2b4a]">Edit Profile</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-6 py-5 flex-1">

            {/* Account info (read-only) */}
            <SectionHeader icon={User} title="Account Info" />
            <div className="grid grid-cols-2 gap-3 mb-2">
              <Field label="Name"><input className={readonlyCls} value={profile?.user?.name || ""} readOnly /></Field>
              <Field label="Email"><input className={readonlyCls} value={profile?.user?.email || ""} readOnly /></Field>
              <Field label="Mobile"><input className={readonlyCls} value={profile?.user?.mobileNumber || ""} readOnly /></Field>
              <Field label="Role"><input className={readonlyCls} value={profile?.user?.role || ""} readOnly /></Field>
            </div>

            {/* Personal */}
            <SectionHeader icon={User} title="Personal Details" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Alternate Mobile">
                <input className={inputCls} placeholder="Alternate mobile" value={personal.alternateMobile}
                  onChange={updatePersonal("alternateMobile")} inputMode="numeric" maxLength={10} />
              </Field>
              <Field label="Gender">
                <div className="relative">
                  <select className={inputCls + " appearance-none pr-8"} value={personal.gender} onChange={updatePersonal("gender")}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </Field>
              <Field label="State">
                <div className="relative">
                  <select
                    className={inputCls + " appearance-none pr-8"}
                    value={personal.state}
                    onChange={updatePersonal("state")}
                  >
                    <option value="">Select State</option>
                    {STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                    {personal.state && !STATES.includes(personal.state) && (
                      <option value={personal.state}>{personal.state}</option>
                    )}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </Field>
              <Field label="District">
                <div className="relative">
                  <select
                    className={inputCls + " appearance-none pr-8"}
                    value={
                      districts.find(d => (d._id || d.districtId || d.id) === selectedDistrictId || (d.districtName || d.name) === personal.district)
                        ? (selectedDistrictId || personal.district)
                        : (personal.district || "")
                    }
                    onChange={handleDistrictChange}
                    disabled={loadingDistricts}
                  >
                    <option value="">{loadingDistricts ? "Loading districts…" : "Select District"}</option>
                    {districts.map((d) => {
                      const val = d._id || d.districtId || d.id;
                      const label = d.districtName || d.name;
                      return <option key={val} value={val}>{label}</option>;
                    })}
                    {personal.district && !districts.some(d => (d.districtName || d.name) === personal.district || d._id === personal.district || d.districtId === personal.district) && (
                      <option value={personal.district}>{personal.district}</option>
                    )}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </Field>
              <Field label="Assembly / Taluka">
                <div className="relative">
                  <select
                    className={inputCls + " appearance-none pr-8"}
                    value={
                      talukas.find(t => (t._id || t.talukaId || t.id) === selectedTalukaId || (t.talukaName || t.name) === personal.assembly)
                        ? (selectedTalukaId || personal.assembly)
                        : (personal.assembly || "")
                    }
                    onChange={handleAssemblyChange}
                    disabled={!selectedDistrictId || loadingTalukas}
                  >
                    <option value="">
                      {!selectedDistrictId
                        ? "Select district first"
                        : loadingTalukas
                          ? "Loading assemblies…"
                          : "Select Assembly / Taluka"}
                    </option>
                    {talukas.map((t) => {
                      const val = t._id || t.talukaId || t.id;
                      const label = t.talukaName || t.name;
                      return <option key={val} value={val}>{label}</option>;
                    })}
                    {personal.assembly && !talukas.some(t => (t.talukaName || t.name) === personal.assembly || t._id === personal.assembly || t.talukaId === personal.assembly) && (
                      <option value={personal.assembly}>{personal.assembly}</option>
                    )}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </Field>
              <Field label="Ward">
                <div className="relative">
                  <select
                    className={inputCls + " appearance-none pr-8"}
                    value={personal.ward}
                    onChange={handleWardChange}
                    disabled={!selectedTalukaId || loadingWards}
                  >
                    <option value="">
                      {!selectedTalukaId
                        ? "Select assembly first"
                        : loadingWards
                          ? "Loading wards…"
                          : "Select Ward"}
                    </option>
                    {wards.map((w) => {
                      const label = w.wardName || w.name || "";
                      return <option key={w._id || w.wardId || w.id || label} value={label}>{label}</option>;
                    })}
                    {personal.ward && !wards.some(w => (w.wardName || w.name) === personal.ward) && (
                      <option value={personal.ward}>{personal.ward}</option>
                    )}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </Field>
              <Field label="Pincode"><input className={inputCls} placeholder="Pincode" value={personal.pincode} onChange={updatePersonal("pincode")} maxLength={6} inputMode="numeric" /></Field>
            </div>
            <Field label="Home Address">
              <textarea className={inputCls} rows={2} placeholder="Home address" value={personal.homeAddress} onChange={updatePersonal("homeAddress")} />
            </Field>
            <Field label="Office Address">
              <textarea className={inputCls} rows={2} placeholder="Office address" value={personal.officeAddress} onChange={updatePersonal("officeAddress")} />
            </Field>

            {/* ── FIX: Ward selected → show map hint with boundary info ── */}
            {selectedWardGeoJson && (
              <div className="mb-4 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-100 text-[12px] text-blue-700">
                <MapPin size={14} className="mt-0.5 shrink-0 text-blue-500" />
                <span>
                  Ward boundary available for <strong>{personal.ward}</strong>. Click{" "}
                  <button
                    type="button"
                    className="underline font-semibold"
                    onClick={() => setMapOpen(true)}
                  >
                    Business Location (Map)
                  </button>{" "}
                  below to see it on the map.
                </span>
              </div>
            )}

            {/* Business toggle */}
            <div className="flex items-center gap-3 mb-4 mt-1">
              <input type="checkbox" id="hasBusiness" checked={hasBusiness}
                onChange={(e) => setHasBusiness(e.target.checked)} className="w-4 h-4 accent-[#1a56db]" />
              <label htmlFor="hasBusiness" className="text-[13px] font-semibold text-slate-600 cursor-pointer">
                I have a business
              </label>
            </div>

            {hasBusiness && (
              <div className="bg-[#F8FAFF] rounded-xl border border-[#E2E8F4] p-4 mb-2">
                <SectionHeader icon={Building2} title="Business Details" />

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Business Name">
                    <input className={inputCls} placeholder="Business name" value={business.businessName} onChange={updateBiz("businessName")} />
                  </Field>
                  <Field label="Owner Name">
                    <input className={inputCls} placeholder="Owner / org name" value={business.ownerName} onChange={updateBiz("ownerName")} />
                  </Field>
                  <Field label="Business Mobile">
                    <input className={inputCls} placeholder="Business contact" value={business.businessMobile}
                      onChange={updateBiz("businessMobile")} inputMode="numeric" maxLength={10} />
                  </Field>
                  <Field label="Website">
                    <input className={inputCls} placeholder="https://example.com" value={business.website} onChange={updateBiz("website")} />
                  </Field>

                  <Field label="GST Number" error={gstError}>
                    <div className="relative">
                      <input
                        className={inputCls + (gstError ? " border-red-400 focus:border-red-400 focus:ring-red-100" : "")}
                        placeholder="e.g. 29ABCDE1234F1Z5"
                        value={business.gstNumber}
                        onChange={handleGSTChange}
                        maxLength={15}
                        style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
                      />
                      {business.gstNumber && !gstError && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-[16px]">✓</span>
                      )}
                      {gstError && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-[16px]">✗</span>
                      )}
                    </div>
                    {!gstError && (
                      <p className="text-[10.5px] text-slate-400 mt-0.5">Enter Valid GST</p>
                    )}
                  </Field>

                  <Field label="Registration Number">
                    <input className={inputCls} placeholder="License / reg. number" value={business.registrationNumber} onChange={updateBiz("registrationNumber")} />
                  </Field>

                  <Field label="Business Type">
                    <SelectOrText options={BUSINESS_TYPES} value={business.businessType} onChange={(v) => setBiz("businessType", v)} placeholder="Enter business type…" />
                  </Field>

                  <Field label="Sector">
                    <SelectOrText options={SECTORS} value={business.sector} onChange={(v) => setBiz("sector", v)} placeholder="Enter sector…" />
                  </Field>

                  <Field label="No. of Employees">
                    <SelectOrText options={EMPLOYEE_RANGES} value={business.employees} onChange={(v) => setBiz("employees", v)} placeholder="Enter employee count…" />
                  </Field>

                  <Field label="Annual Turnover">
                    <SelectOrText options={TURNOVER_RANGES} value={business.annualTurnover} onChange={(v) => setBiz("annualTurnover", v)} placeholder="Enter turnover…" />
                  </Field>

                  <Field label="Established Year">
                    <SelectOrText options={YEARS} value={business.establishedYear} onChange={(v) => setBiz("establishedYear", v)} placeholder="Enter year…" />
                  </Field>

                  <Field label="Working Hours">
                    <SelectOrText options={WORKING_HOURS} value={business.workingHours} onChange={(v) => setBiz("workingHours", v)} placeholder="e.g. 8AM – 9PM" />
                  </Field>

                  <Field label="State">
                    <div className="relative">
                      <select className={inputCls + " appearance-none pr-8"} value={business.state} onChange={updateBiz("state")}>
                        <option value="">Select State</option>
                        {STATES.map((st) => (<option key={st} value={st}>{st}</option>))}
                        {business.state && !STATES.includes(business.state) && (<option value={business.state}>{business.state}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="District">
                    <div className="relative">
                      <select
                        className={inputCls + " appearance-none pr-8"}
                        value={
                          bizTalukas.find(t => (t._id || t.talukaId || t.id) === selectedBizTalukaId)
                            ? (selectedBizDistrictId || business.district)
                            : (business.district || "")
                        }
                        onChange={handleBizDistrictChange}
                        disabled={loadingDistricts}
                      >
                        <option value="">{loadingDistricts ? "Loading districts…" : "Select District"}</option>
                        {districts.map((d) => {
                          const val = d._id || d.districtId || d.id;
                          const label = d.districtName || d.name;
                          return <option key={val} value={val}>{label}</option>;
                        })}
                        {business.district && !districts.some(d => (d.districtName || d.name) === business.district || d._id === business.district || d.districtId === business.district) && (
                          <option value={business.district}>{business.district}</option>
                        )}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="Assembly">
                    <div className="relative">
                      <select
                        className={inputCls + " appearance-none pr-8"}
                        value={
                          bizTalukas.find(t => (t._id || t.talukaId || t.id) === selectedBizTalukaId || (t.talukaName || t.name) === (business.assembly || business.taluka))
                            ? (selectedBizTalukaId || business.assembly || business.taluka)
                            : (business.assembly || business.taluka || "")
                        }
                        onChange={handleBizAssemblyChange}
                        disabled={!selectedBizDistrictId || loadingBizTalukas}
                      >
                        <option value="">
                          {!selectedBizDistrictId ? "Select district first" : loadingBizTalukas ? "Loading assemblies…" : "Select Assembly / Taluka"}
                        </option>
                        {bizTalukas.map((t) => {
                          const val = t._id || t.talukaId || t.id;
                          const label = t.talukaName || t.name;
                          return <option key={val} value={val}>{label}</option>;
                        })}
                        {(business.assembly || business.taluka) && !bizTalukas.some(t => (t.talukaName || t.name) === (business.assembly || business.taluka)) && (
                          <option value={business.assembly || business.taluka}>{business.assembly || business.taluka}</option>
                        )}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="Ward / Hobli">
                    <div className="relative">
                      <select
                        className={inputCls + " appearance-none pr-8"}
                        value={business.ward || ""}
                        onChange={handleBizWardChange}
                        disabled={!selectedBizTalukaId || loadingBizWards}
                      >
                        <option value="">
                          {!selectedBizTalukaId ? "Select assembly first" : loadingBizWards ? "Loading wards…" : "Select Ward"}
                        </option>
                        {bizWards.map((w) => {
                          const label = w.wardName || w.name || "";
                          return <option key={w._id || w.wardId || w.id || label} value={label}>{label}</option>;
                        })}
                        {business.ward && !bizWards.some(w => (w.wardName || w.name) === business.ward) && (
                          <option value={business.ward}>{business.ward}</option>
                        )}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="City">
                    <input className={inputCls} placeholder="City" value={business.city} onChange={updateBiz("city")} />
                  </Field>

                  <Field label="Pincode">
                    <input className={inputCls} placeholder="Pincode" value={business.pincode} onChange={updateBiz("pincode")} maxLength={6} inputMode="numeric" />
                  </Field>
                </div>

                {/* Map location picker */}
                <Field label="Business Location (Map)">
                  <div className="relative">
                    <input
                      className={inputCls + " pr-9 cursor-pointer"}
                      placeholder="Click 📍 to pick from map"
                      value={business.businessLocation}
                      readOnly
                      onClick={() => setMapOpen(true)}
                    />
                    <MapPinButton onClick={() => setMapOpen(true)} />
                  </div>
                  {business.latitude !== 0 && (
                    <p className="text-[11px] text-green-600 mt-1 flex items-center gap-1">
                      <MapPin size={11} /> Lat: {Number(business.latitude).toFixed(5)}, Lng: {Number(business.longitude).toFixed(5)}
                    </p>
                  )}
                </Field>

                {/* Business images */}
                <Field label="Business Images (max 3)">
                  <BusinessImageUpload images={businessImages} onChange={setBusinessImages} />
                </Field>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#E2E8F4] flex justify-end gap-3 shrink-0">
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#D1D9EC] text-[13.5px] font-medium text-slate-600 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading || !!gstError}
              className="px-5 py-2.5 rounded-lg bg-[#1a56db] text-white text-[13.5px] font-semibold hover:bg-[#1547c0] disabled:opacity-50 transition">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 bg-green-600 text-white text-[13px] font-medium px-5 py-3 rounded-xl shadow-lg z-50">
            ✓ Profile updated successfully
          </div>
        )}
      </div>

      {/* ── FIX: Pass wardGeoJson to LocationPickerModal for boundary rendering ── */}
      <LocationPickerModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        onSelect={handleLocationSelect}
        title="Select Business Location"
        initialLat={mapCenter?.lat}
        initialLng={mapCenter?.lng}
        wardGeoJson={selectedWardGeoJson}
      />
    </>
  );
}