"use client";

import CountryMap from "@/app/(freelancer)/freelancer-dashboard/analytics/components/CountryMap";
import { useState } from "react";
import { MoreHorizontal, ChevronDown } from "lucide-react";

// Dropdown component
const Dropdown = ({ isOpen, onClose, className, children }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
      />
      {/* Dropdown menu */}
      <div className={`absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 ${className}`}>
        {children}
      </div>
    </>
  );
};

// DropdownItem component
const DropdownItem = ({ onItemClick, className, children }) => {
  return (
    <button
      onClick={onItemClick}
      className={`px-3 py-2 text-sm transition-colors duration-150 ${className}`}
    >
      {children}
    </button>
  );
};

// Flag component (using emoji as fallback for SVG flags)
const CountryFlag = ({ country, alt }) => {
  const flags = {
    usa: "🇺🇸",
    france: "🇫🇷",
    india: "🇮🇳"
  };

  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700">
      <span className="text-lg" role="img" aria-label={alt}>
        {flags[country] || "🏳️"}
      </span>
    </div>
  );
};

// Progress Bar component
const ProgressBar = ({ percentage }) => {
  return (
    <div className="flex w-full max-w-[140px] items-center gap-3">
      <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
        <div 
          className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-blue-500 text-xs font-medium text-white"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="font-medium text-gray-800 text-sm dark:text-white/90">
        {percentage}%
      </p>
    </div>
  );
};

// Country Row component
const CountryRow = ({ country, customers, percentage, flagCountry }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <CountryFlag country={flagCountry} alt={country} />
        <div>
          <p className="font-semibold text-gray-800 text-sm dark:text-white/90">
            {country}
          </p>
          <span className="block text-gray-500 text-xs dark:text-gray-400">
            {customers.toLocaleString()} Customers
          </span>
        </div>
      </div>
      <ProgressBar percentage={percentage} />
    </div>
  );
};

// Main DemographicCard component
export default function WorldMap() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const countryData = [
    { country: "India", customers: 445, percentage: 100, flagCountry: "india" }
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 h-full">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Customers Demographic
          </h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            Number of customer based on country
          </p>
        </div>

        <div className="relative inline-block">
          <button 
            onClick={toggleDropdown} 
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
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
      </div>
      
      {/* Fixed Map Container - Removed fixed widths and negative margins */}
      <div className="my-6 overflow-hidden border border-gray-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <div className="w-full h-[212px]">
          <CountryMap />
        </div>
      </div>

      <div className="space-y-5">
        {countryData.map((data, index) => (
          <CountryRow
            key={index}
            country={data.country}
            customers={data.customers}
            percentage={data.percentage}
            flagCountry={data.flagCountry}
          />
        ))}
      </div>
    </div>
  );
}