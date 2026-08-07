/**
 * DEFAULT_FIELDS
 * ─────────────────────────────────────────────────────────────────────────────
 * Pre-filled fields shown in every new form.
 * WardChairman can freely edit OR delete any of these.
 */

export const DEFAULT_FIELDS = [
  {
    id: "default-name",
    label: "Full Name",
    type: "Text",
    required: true,
    disabled: false,
    placeholder: "Enter full name",
  },
  {
    id: "default-mobile",
    label: "Mobile Number",
    type: "Tel",
    required: true,
    disabled: false,
    placeholder: "10-digit mobile number",
  },
  {
    id: "default-email",
    label: "Email Address",
    type: "Email",
    required: false,
    disabled: false,
    placeholder: "example@email.com",
  },
  {
    id: "default-company",
    label: "Company / Business Name",
    type: "Text",
    required: false,
    disabled: false,
    placeholder: "Business name",
  },
  {
    id: "default-address",
    label: "Address",
    type: "Textarea",
    required: false,
    disabled: false,
    placeholder: "Full address",
  },
  {
    id: "default-pincode",
    label: "Pincode",
    type: "Number",
    required: false,
    disabled: false,
    placeholder: "6-digit pincode",
  },
];

export const DEFAULT_SECTION = {
  id: "section-basic-info",
  title: "Basic Information",
  icon: "👤",
  subtitle: "Core CP details",
  fields: DEFAULT_FIELDS,
};

export function makeNewSection() {
  return {
    id: `section-${Date.now()}`,
    title: "New Section",
    icon: "📋",
    subtitle: "",
    fields: [],
  };
}