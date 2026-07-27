import React from "react";
import { 
    Users, UserCheck, TrendingUp, DollarSign, 
    Building2, Briefcase, Megaphone, Phone, 
    Users as ManualIcon, Sparkles, UsersRound 
} from "lucide-react";

export default function LeadBanner({ stats }) {
    const cards = [
        { 
            key: "totalLeads", 
            label: "Total Leads", 
            value: stats.totalLeads, 
            icon: Users, 
            delta: stats.totalDelta, 
            tone: "steel",
            format: "number"
        },
        { 
            key: "acceptanceRate", 
            label: "Acceptance Rate", 
            value: stats.acceptanceRate, 
            icon: UserCheck, 
            delta: stats.activeDelta, 
            tone: "forest",
            format: "percent"
        },
        { 
            key: "conversionRate", 
            label: "Conversion Rate", 
            value: stats.conversionRate, 
            icon: TrendingUp, 
            delta: stats.basicDelta, 
            tone: "steel",
            format: "percent"
        },
        { 
            key: "closed", 
            label: "Closed", 
            value: stats.closed, 
            icon: DollarSign, 
            delta: stats.closedDelta, 
            tone: "forest",
            format: "currency"
        },
    ];

    const leadSources = [
        { key: "b2c", label: "B2C Requirement", value: 1, icon: Building2, color: "blue" },
        { key: "b2b", label: "B2B Requirement", value: 0, icon: Briefcase, color: "purple" },
        { key: "social", label: "Social Ad", value: 0, icon: Megaphone, color: "pink" },
        { key: "bulk", label: "Bulk / IVR", value: 0, icon: Phone, color: "orange" },
        { key: "manual", label: "Manual", value: 17, icon: ManualIcon, color: "green" },
        { key: "ai", label: "AI Generated", value: 0, icon: Sparkles, color: "indigo" },
        { key: "circle", label: "Circle Meeting", value: 1, icon: UsersRound, color: "teal" },
    ];

    const formatValue = (value, format) => {
        if (format === "percent") return `${value}%`;
        if (format === "currency") {
            if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
            if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
            return `₹${value}`;
        }
        return value;
    };

    const getColorClasses = (color) => {
        const colors = {
            blue: "bg-blue-50 text-blue-600 border-blue-200",
            purple: "bg-purple-50 text-purple-600 border-purple-200",
            pink: "bg-pink-50 text-pink-600 border-pink-200",
            orange: "bg-orange-50 text-orange-600 border-orange-200",
            green: "bg-green-50 text-green-600 border-green-200",
            indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
            teal: "bg-teal-50 text-teal-600 border-teal-200",
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="space-y-4">
            {/* Top 4 Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {cards.map((c) => (
                    <div key={c.key} className="rounded-2xl border border-hairline bg-white p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                { 
                                    steel: "bg-steel/10 text-steel",
                                    forest: "bg-forest/10 text-forest",
                                    amber: "bg-amber-tint text-amber",
                                    brick: "bg-brick/10 text-brick"
                                }[c.tone]
                            }`}>
                                <c.icon size={16} />
                            </span>
                            {c.delta != null && (
                                <span className={`text-[11px] font-semibold ${
                                    c.delta > 0 ? "text-forest" :
                                    c.delta < 0 ? "text-brick" : "text-muted"
                                }`}>
                                    {c.delta > 0 ? "↗" : c.delta < 0 ? "↘" : "—"}
                                    {c.delta !== 0 ? `${Math.abs(c.delta)}%` : "0%"}
                                </span>
                            )}
                        </div>
                        <p className="font-display text-[24px] text-ink leading-none tabular-nums mb-1.5">
                            {formatValue(c.value, c.format)}
                        </p>
                        <p className="text-[12px] text-muted">{c.label}</p>
                    </div>
                ))}
            </div>

            {/* Lead Sources Section */}
            <div className="bg-white rounded-2xl border border-hairline p-4">
                <h3 className="text-sm font-semibold text-ink mb-3">Lead Sources</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {leadSources.map((source) => (
                        <div 
                            key={source.key} 
                            className={`flex items-center gap-2 p-3 rounded-xl border ${getColorClasses(source.color)}`}
                        >
                            <source.icon size={16} />
                            <div>
                                <p className="text-lg font-bold leading-none">{source.value}</p>
                                <p className="text-[10px] text-muted leading-tight">{source.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}