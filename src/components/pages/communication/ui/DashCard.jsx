// components/ui/DashCard.jsx
export default function DashCard({ title, subtitle, action, children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${className}`}>
      {/* Card Header */}
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            {title && (
              <h2 className="text-[14px] font-semibold text-gray-800">{title}</h2>
            )}
            {subtitle && (
              <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Card Body */}
      <div className="p-5">{children}</div>
    </div>
  );
}