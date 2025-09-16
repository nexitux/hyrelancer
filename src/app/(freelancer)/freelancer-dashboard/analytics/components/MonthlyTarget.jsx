"use client";
import { useState } from "react";
import { MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react";

// Dropdown component
const Dropdown = ({ isOpen, onClose, className, children }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className={`absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 ${className}`}>
        {children}
      </div>
    </>
  );
};

// DropdownItem component
const DropdownItem = ({ onItemClick, className, children }) => {
  return (
    <button onClick={onItemClick} className={`px-3 py-2 text-sm transition-colors duration-150 ${className}`}>
      {children}
    </button>
  );
};

// Radial progress chart component
const RadialProgressChart = ({ percentage, size = 240 }) => {
  const radius = 80;
  const strokeWidth = 16;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={size} width={size} className="transform -rotate-90">
        <circle
          stroke="#E4E7EC"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="#465FFF"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-gray-800 dark:text-white/90">
          {percentage}%
        </span>
      </div>
      
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600 dark:bg-green-500/15 dark:text-green-500">
          +10%
        </span>
      </div>
    </div>
  );
};

// Chart header component
const ChartHeader = ({ title, subtitle, onToggleDropdown }) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        {title && (
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-1 font-normal text-gray-500 text-sm dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      <div className="relative inline-block">
        <button 
          onClick={onToggleDropdown}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
        </button>
      </div>
    </div>
  );
};

// Metric item component for footer
const MetricItem = ({ label, value, trend, isLast = false }) => {
  const TrendIcon = trend === 'up' ? ArrowUp : ArrowDown;
  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <>
      <div className="text-center">
        <p className="mb-1 text-gray-500 text-xs dark:text-gray-400">{label}</p>
        <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90">
          {value}
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
        </p>
      </div>
      {!isLast && (
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
      )}
    </>
  );
};

// Main SalesTarget component
export default function MonthlyTarget() {
  const [isOpen, setIsOpen] = useState(false);
  
  const percentage = 75.55;
  const metrics = [
    { label: "Target", value: "$20K", trend: "down" },
    { label: "Revenue", value: "$20K", trend: "up" },
    { label: "Today", value: "$20K", trend: "up" }
  ];

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] flex-1 flex flex-col">
        <div className="px-5 pt-5 bg-white shadow-default rounded-2xl flex-1 flex flex-col dark:bg-gray-900">
          <ChartHeader
            title="Monthly Target"
            subtitle="Target you've set for each month"
            onToggleDropdown={toggleDropdown}
          />
          
          <div className="relative inline-block">
            <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View More
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Delete
              </DropdownItem>
            </Dropdown>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="relative mt-2">
              <div className="flex justify-center">
                <RadialProgressChart percentage={percentage} />
              </div>
            </div>
          </div>
          
          <p className="mx-auto mb-4 w-full max-w-[320px] text-center text-sm text-gray-500">
            You earn $3287 today, it's higher than last month. Keep up your good work!
          </p>
        </div>

        <div className="flex items-center justify-center gap-6 px-4 py-4 bg-gray-100 dark:bg-white/[0.03] rounded-b-2xl">
          {metrics.map((metric, index) => (
            <MetricItem
              key={metric.label}
              label={metric.label}
              value={metric.value}
              trend={metric.trend}
              isLast={index === metrics.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}