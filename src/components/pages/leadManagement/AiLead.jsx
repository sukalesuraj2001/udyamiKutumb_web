import React, { useState } from "react";
import { 
    Sparkles, 
    MapPin, 
    Tag, 
    Hash, 
    Search, 
    Plus,
    ChevronDown,
    Filter,
    Layers
} from "lucide-react";

export default function AiLead() {
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const categories = [
        "Public Relations",
        "Accounting",
        "Administrative",
        "Advertising",
        "Marketing",
        "Finance",
        "Human Resources",
        "Technology",
        "Healthcare",
        "Education"
    ];

    const locations = [
        "Bommanahalli",
        "Electronic City",
        "Koramangala",
        "Indiranagar",
        "Whitefield",
        "MG Road"
    ];

    return (
        <div className="bg-white rounded-2xl border border-hairline p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-ink">AI Lead Mining</h2>
                        <p className="text-sm text-muted">Generate fresh leads from network signals</p>
                    </div>
                </div>

            </div>

            {/* Filters Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {/* Location Filter */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted flex items-center gap-1.5">
                        <MapPin size={14} />
                        Location
                    </label>
                    <div className="relative">
                        <select 
                            className="w-full px-3 py-2.5 bg-gray-50 border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                            defaultValue=""
                        >
                            <option value="" disabled>Select location...</option>
                            {locations.map((loc) => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted flex items-center gap-1.5">
                        <Tag size={14} />
                        Category
                    </label>
                    <div className="relative">
                        <div 
                            className="w-full px-3 py-2.5 bg-gray-50 border border-hairline rounded-xl text-sm text-ink cursor-pointer flex items-center justify-between hover:bg-gray-100 transition-colors"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className={selectedCategory ? "text-ink" : "text-muted"}>
                                {selectedCategory || "Search category..."}
                            </span>
                            <ChevronDown size={16} className={`text-muted transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                        </div>
                        
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-hairline rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                                <div className="p-2 border-b border-hairline sticky top-0 bg-white">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                        <input 
                                            type="text" 
                                            placeholder="Search categories..." 
                                            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                {categories.map((cat) => (
                                    <div 
                                        key={cat}
                                        className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm transition-colors flex items-center justify-between"
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        <span className={selectedCategory === cat ? "text-indigo-600 font-medium" : "text-ink"}>
                                            {cat}
                                        </span>
                                        {selectedCategory === cat && (
                                            <span className="text-indigo-600">✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Count Filter */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted flex items-center gap-1.5">
                        <Hash size={14} />
                        Count
                    </label>
                    <div className="relative">
                        <input 
                            type="number" 
                            defaultValue={8}
                            min={1}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter count..."
                        />
                    </div>
                </div>
            </div>

            {/* Quick Categories */}
            <div className="pt-1">
                <div className="flex items-center gap-2 mb-2">
                    <Layers size={14} className="text-muted" />
                    <span className="text-xs text-muted">Popular Categories</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {["Public Relations", "Accounting", "Administrative", "Advertising", "Marketing"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                selectedCategory === cat 
                                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200" 
                                    : "bg-gray-50 text-muted border border-hairline hover:bg-gray-100"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Category Display */}
            {selectedCategory && (
                <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-100">
                    <div>
                        <p className="text-xs text-muted">Selected Category</p>
                        <p className="text-sm font-medium text-indigo-700">{selectedCategory}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-xs text-muted text-right">Count</p>
                            <p className="text-sm font-medium text-indigo-700 text-right">8</p>
                        </div>
                        <button 
                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                            onClick={() => {
                                // Handle generate leads action
                                console.log("Generating leads for:", selectedCategory);
                            }}
                        >
                            Generate
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}