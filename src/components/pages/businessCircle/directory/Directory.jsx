import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import MemberDirectoryCard from "./MemberDirectoryCard.jsx";

// Replace with real member directory from your API
const SAMPLE_MEMBERS = [
  { id: "1", name: "Chandru M H", phone: "+919900000001", email: "chandru@example.com" },
  { id: "2", name: "Rajesh Member", phone: "+919900000002", email: "rajesh@example.com" },
  { id: "3", name: "Thrupthi V", phone: "+919900000003", email: "thrupthi@example.com" },
  { id: "4", name: "Spoorthi V", phone: "+919900000004", email: "spoorthi@example.com" },
  { id: "5", name: "Nandini Devi", phone: "+919900000005", email: "nandini@example.com" },
  { id: "6", name: "Umesh Gowda", phone: "+919900000006", email: "umesh@example.com" },
  { id: "7", name: "Dharani Kumar BK", phone: "+919900000007", email: "dharani@example.com" },
  { id: "8", name: "Nandeesh S Rajegowda", phone: "+919900000008", email: "nandeesh@example.com" },
  { id: "9", name: "Likhitha M", phone: "+919900000009", email: "likhitha@example.com" },
  { id: "10", name: "Nikhil Pawar", phone: "+919900000010", email: "nikhil@example.com" },
  { id: "11", name: "Nandini Devi", phone: "+919900000011", email: "nandini2@example.com" },
  { id: "12", name: "Vinoth Kumar", phone: "+919900000012", email: "vinoth@example.com" },
  { id: "13", name: "Yogesh Achar", phone: "+919900000013", email: "yogesh@example.com" },
  { id: "14", name: "Pavithra M", phone: "+919900000014", email: "pavithra@example.com" },
  { id: "15", name: "Prasanna Member", phone: "+919900000015", email: "prasanna@example.com" },
  { id: "16", name: "Kavya Reddy", phone: "+919900000016", email: "kavya@example.com", freeUser: true },
  { id: "17", name: "Pushpa HC", phone: "+919900000017", email: "pushpa@example.com", company: "Hoysala technologies india pvt", tag: "Elevator" },
  { id: "18", name: "kishan BN", phone: "+919900000018", email: "kishan@example.com" },
];

export default function Directory() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SAMPLE_MEMBERS;
    return SAMPLE_MEMBERS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.company?.toLowerCase().includes(q) ||
        m.tag?.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[18px] font-semibold text-ink">Member Directory</h2>
        <div className="flex items-center gap-2 border border-hairline rounded-xl px-3.5 py-2.5 bg-white w-full sm:w-72">
          <Search size={15} className="text-muted shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or category"
            className="w-full text-[13px] text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-white p-14 text-center">
          <p className="text-[14px] text-muted">No members match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <MemberDirectoryCard key={m.id} member={m} />
          ))}
        </div>
      )}
    </div>
  );
}