// Replace with real templates from your API
export const TEMPLATE_LIBRARY = [
  {
    id: "t1",
    name: "New Lead Notification",
    type: "sms",
    tag: "Lead Alert",
    body: "New lead {first_name} from {ward_name} showed interest in {business_name}. Follow up soon!",
  },
  {
    id: "t2",
    name: "Ward Meeting Invite",
    type: "email",
    tag: "Event Invite",
    body: "Dear {first_name}, you're invited to the monthly Udyami meet for {ward_name} on Saturday at 6 PM.",
  },
  {
    id: "t3",
    name: "Renewal Reminder",
    type: "whatsapp",
    tag: "Membership Renewal",
    body: "Hi {first_name}, your membership for {business_name} is due for renewal. Renew today to keep your benefits active.",
  },
  {
    id: "t4",
    name: "Diwali Greetings",
    type: "whatsapp",
    tag: "Congratulations",
    body: "Wishing {first_name} and the team at {business_name} a very Happy Diwali from all of us at Udyami Bharat!",
  },
  {
    id: "t5",
    name: "Daily Lead Digest",
    type: "sms",
    tag: "Lead Alert",
    body: "You have {lead_count} new leads today in {ward_name}. Log in to view and respond.",
  },
  {
    id: "t6",
    name: "GST Filing Tip",
    type: "email",
    tag: "Business Tip",
    body: "Dear {first_name}, GST filing for this quarter is due soon. Here are 3 quick tips to file without errors...",
  },
  {
    id: "t7",
    name: "Business Anniversary",
    type: "whatsapp",
    tag: "Congratulations",
    body: "Congratulations {first_name}! {business_name} completes another successful year with Udyami Bharat.",
  },
  {
    id: "t8",
    name: "Prime Plan Drive",
    type: "sms",
    tag: "Upsell",
    body: "Upgrade {business_name} to Prime and unlock {lead_count}x more leads in {ward_name}. Reply UPGRADE to switch.",
  },
];

export const TYPE_BADGE_CLASS = {
  sms: "bg-steel/10 text-steel",
  email: "bg-forest/10 text-forest",
  whatsapp: "bg-amber-tint text-amber",
};

export const TYPE_LABEL = { sms: "SMS", email: "Email", whatsapp: "WhatsApp" };