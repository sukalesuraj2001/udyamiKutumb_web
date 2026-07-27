import { useState, useRef } from "react";
import { ZoomIn, ZoomOut, Maximize2, Info } from "lucide-react";
import { ROLE_BY_ID } from "../data/roles";
import { ORG_NODES, ORG_EDGES, ORG_LEGEND, NODE_W, NODE_H } from "../data/orgChart";

export default function OrgChartTab() {
  const [scale, setScale] = useState(0.85);
  const [pan, setPan]     = useState({ x: 20, y: 20 });
  const isPanning = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => { isPanning.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; };
  const handleMouseMove = (e) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };
  const handleMouseUp = () => { isPanning.current = false; };

  const zoomIn  = () => setScale((s) => Math.min(s + 0.15, 2));
  const zoomOut = () => setScale((s) => Math.max(s - 0.15, 0.3));
  const reset   = () => { setScale(0.85); setPan({ x: 20, y: 20 }); };

  const edgePaths = ORG_EDGES.map((e) => {
    const fn = ORG_NODES.find((n) => n.id === e.from);
    const tn = ORG_NODES.find((n) => n.id === e.to);
    if (!fn || !tn) return null;
    const fx = fn.x + NODE_W / 2, fy = fn.y + NODE_H;
    const tx = tn.x + NODE_W / 2, ty = tn.y;
    const my = (fy + ty) / 2;
    return { key: `${e.from}-${e.to}`, d: `M${fx},${fy} C${fx},${my} ${tx},${my} ${tx},${ty}` };
  }).filter(Boolean);

  return (
    <div className="flex flex-col gap-3 min-h-[580px]">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {ORG_LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: l.color }} />
            <span className="text-[11px] text-gray-500 font-medium">{l.label}</span>
          </div>
        ))}
        <span className="ml-auto text-[11px] text-gray-400 flex items-center gap-1">
          <Info size={11} /> Drag to pan · scroll to zoom
        </span>
      </div>

      {/* Canvas */}
      <div
        className="flex-1 overflow-hidden bg-[#fafbfc] rounded-xl border border-gray-100 cursor-grab active:cursor-grabbing relative select-none"
        style={{ minHeight: 520 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={(e) => { e.preventDefault(); setScale((s) => Math.max(0.3, Math.min(2, s - e.deltaY * 0.001))); }}
      >
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#e2e8f0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        <div
          className="absolute"
          style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${scale})`, transformOrigin: "top left", transition: "transform 0.05s linear" }}
        >
          {/* Edges */}
          <svg style={{ position: "absolute", top: 0, left: 0, overflow: "visible", pointerEvents: "none" }} width="1200" height="780">
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                <path d="M0,0 L0,8 L8,4 z" fill="#94a3b8" />
              </marker>
            </defs>
            {edgePaths.map((ep) => (
              <path key={ep.key} d={ep.d} fill="none" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
            ))}
          </svg>

          {/* Nodes */}
          {ORG_NODES.map((node) => {
            const role = ROLE_BY_ID[node.id];
            if (!role) return null;
            return (
              <div
                key={node.id}
                style={{
                  position: "absolute", left: node.x, top: node.y,
                  width: NODE_W, height: NODE_H,
                  background: role.nodeBg,
                  border: `2px solid ${role.nodeColor}`,
                  borderRadius: 10,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  cursor: "default",
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: role.nodeColor, lineHeight: 1.2, textAlign: "center", padding: "0 6px" }}>
                  {role.name}
                </span>
                {role.subtitle && (
                  <span style={{ fontSize: 9.5, color: "#64748b", marginTop: 2 }}>{role.subtitle}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 left-4 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <button onClick={zoomIn}  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors border-b border-gray-100" title="Zoom in"><ZoomIn size={14} /></button>
          <button onClick={zoomOut} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors border-b border-gray-100" title="Zoom out"><ZoomOut size={14} /></button>
          <button onClick={reset}   className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors" title="Reset view"><Maximize2 size={13} /></button>
        </div>
        <div className="absolute bottom-4 right-4 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] font-mono text-gray-400 shadow-sm">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
}