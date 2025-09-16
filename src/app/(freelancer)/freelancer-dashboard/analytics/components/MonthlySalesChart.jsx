"use client";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

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

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-gray-600 dark:text-gray-300 text-sm">{`${label}`}</p>
        <p className="text-blue-600 dark:text-blue-400 font-medium">
          {`Sales: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

// Chart header component
const ChartHeader = ({ title, onToggleDropdown }) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h3>
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

// Main SalesChart component
export default function MonthlySalesChart() {
  const [isOpen, setIsOpen] = useState(false);

  // Chart data
  const chartData = [
    { month: "Jan", sales: 168 },
    { month: "Feb", sales: 385 },
    { month: "Mar", sales: 201 },
    { month: "Apr", sales: 298 },
    { month: "May", sales: 187 },
    { month: "Jun", sales: 195 },
    { month: "Jul", sales: 291 },
    { month: "Aug", sales: 110 },
    { month: "Sep", sales: 215 },
    { month: "Oct", sales: 390 },
    { month: "Nov", sales: 280 },
    { month: "Dec", sales: 112 }
  ];

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-3 dark:border-gray-800 dark:bg-white/[0.03]">
      <ChartHeader title="Monthly Sales" onToggleDropdown={toggleDropdown} />
      
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

      <div className="max-w-full overflow-x-auto mt-4">
        <div className="-ml-2 min-w-[500px] xl:min-w-full">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
            >
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280', fontFamily: 'ui-sans-serif, system-ui' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280', fontFamily: 'ui-sans-serif, system-ui' }}
                grid={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="#465fff" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}