import { useState } from "react";

// ─── Mock Data (replace with API later) ────────────────────────────────────────

const statsData = [
  {
    id: 1,
    label: "SCORE · Q2",
    value: "48",
    suffix: "/100",
    sub: "Green · Rank 3 of 28",
    color: "text-slate-800",
  },
  {
    id: 2,
    label: "LEADS GIVEN",
    value: "4",
    suffix: "",
    sub: "1 closed",
    color: "text-slate-800",
  },
  {
    id: 3,
    label: "FACE TO FACE",
    value: "1",
    suffix: "",
    sub: "This quarter",
    color: "text-slate-800",
  },
  {
    id: 4,
    label: "GUESTS JOINED",
    value: "1",
    suffix: "",
    sub: "Pipeline active",
    color: "text-slate-800",
  },
];

const upcomingMeetings = [
  {
    id: 1,
    title: "Circle Meeting",
    date: "Thu 24 Jul",
    time: "7:30 AM",
    location: "Taluka community hall",
    rsvp: "RSVP", // "RSVP" | "Going" | "Not Going"
  },
  {
    id: 2,
    title: "Sector Team Meeting",
    date: "Tue 29 Jul",
    time: "6:00 PM",
    location: "Online",
    rsvp: "Going",
  },
];

const pendingItems = [
  {
    id: 1,
    business: "Vani Silks",
    from: "Deepa N",
    category: "Interior work",
    status: "Contacted",
  },
  {
    id: 2,
    business: "Cafe Rio",
    from: "Suresh Rao",
    category: "Renovation",
    status: "Sent",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const rsvpStyle = (rsvp) => {
  switch (rsvp) {
    case "Going":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "Not Going":
      return "bg-red-50 text-red-600 border border-red-200";
    default:
      return "bg-white text-slate-600 border border-slate-300";
  }
};

const statusStyle = (status) => {
  switch (status) {
    case "Contacted":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "Sent":
      return "bg-slate-100 text-slate-600 border border-slate-300";
    case "Closed":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    default:
      return "bg-slate-100 text-slate-500 border border-slate-200";
  }
};

// ─── Sub Components ────────────────────────────────────────────────────────────

function StatCard({ label, value, suffix, sub }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-1 shadow-sm">
      <span className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
        {label}
      </span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-3xl font-bold text-slate-800">{value}</span>
        {suffix && (
          <span className="text-lg font-medium text-slate-400">{suffix}</span>
        )}
      </div>
      <span className="text-xs text-slate-500">{sub}</span>
    </div>
  );
}

function MeetingRow({ meeting, onRsvpChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-3">
        {/* Flag icon */}
        <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 21V4m0 0l7-1 4 1 7-2v14l-7 2-4-1-7 1"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{meeting.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {meeting.date} · {meeting.time} · {meeting.location}
          </p>
        </div>
      </div>

      {/* RSVP button */}
      <button
        onClick={() => onRsvpChange && onRsvpChange(meeting.id)}
        className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all ${rsvpStyle(
          meeting.rsvp
        )}`}
      >
        {meeting.rsvp}
      </button>
    </div>
  );
}

function PendingRow({ item }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
      <td className="py-3.5 pr-4 text-sm font-medium text-slate-800">
        {item.business}
      </td>
      <td className="py-3.5 pr-4 text-sm text-slate-600">{item.from}</td>
      <td className="py-3.5 pr-4 text-sm text-blue-600 font-medium">
        {item.category}
      </td>
      <td className="py-3.5">
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyle(
            item.status
          )}`}
        >
          {item.status}
        </span>
      </td>
    </tr>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MemberDashboard() {
  const [meetings, setMeetings] = useState(upcomingMeetings);

  const handleRsvpToggle = (id) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const next =
          m.rsvp === "Going"
            ? "Not Going"
            : m.rsvp === "Not Going"
            ? "RSVP"
            : "Going";
        return { ...m, rsvp: next };
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Member Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Your activity overview · Live data
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsData.map((s) => (
          <StatCard key={s.id} {...s} />
        ))}
      </div>

      {/* ── Upcoming Meetings ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Upcoming
          </h2>
          <button className="text-xs text-blue-600 hover:underline font-medium">
            View all
          </button>
        </div>

        <div>
          {meetings.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              No upcoming meetings
            </p>
          ) : (
            meetings.map((m) => (
              <MeetingRow
                key={m.id}
                meeting={m}
                onRsvpChange={handleRsvpToggle}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Pending On You ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Pending On You
          </h2>
          <button className="text-xs text-blue-600 hover:underline font-medium">
            View all
          </button>
        </div>

        {pendingItems.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">
            No pending items
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  {["Business", "From", "Category", "Status"].map((h) => (
                    <th
                      key={h}
                      className="pb-2.5 pr-4 text-[11px] font-semibold tracking-widest text-slate-400 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingItems.map((item) => (
                  <PendingRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}