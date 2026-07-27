import React from "react";
import { Phone, Mail, Building2 } from "lucide-react";

export default function MemberDirectoryCard({ member }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      <p className="text-[14.5px] font-semibold text-ink mb-0.5">
        {member.name}
        {member.freeUser && (
          <span className="text-[12px] font-normal text-muted">
            {" "}
            (Free User)
          </span>
        )}
      </p>

      {member.company && (
        <p className="flex items-center gap-1.5 text-[12.5px] text-muted mb-1.5">
          <Building2 size={12} /> {member.company}
        </p>
      )}

      {member.tag && (
        <span className="inline-block bg-ink text-white text-[10.5px] font-semibold px-2 py-0.5 rounded-full mb-2">
          {member.tag}
        </span>
      )}

      <div className="flex gap-2 mt-2">
        {/* Call */}
        <a
          href={`tel:${member.phone}`}
          className="flex items-center gap-1.5 border border-hairline text-[12.5px] font-medium text-ink px-3 py-1.5 rounded-lg hover:bg-ink/5 transition-colors"
        >
          <Phone size={13} /> Call
        </a>

        {/* Email */}
        <a
          href={`mailto:${member.email}`}
          className="flex items-center gap-1.5 border border-hairline text-[12.5px] font-medium text-ink px-3 py-1.5 rounded-lg hover:bg-ink/5 transition-colors"
        >
          <Mail size={13} /> Email
        </a>
      </div>
    </div>
  );
}