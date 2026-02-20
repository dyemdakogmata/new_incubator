import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
}

export function Card({ children, className = "", title, subtitle, headerAction }: CardProps) {
  return (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div>
            {title && <h3 className="text-white font-semibold text-base">{title}</h3>}
            {subtitle && <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
