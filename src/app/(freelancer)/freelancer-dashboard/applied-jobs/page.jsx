"use client";
import { useState } from "react";
import CommonTable from "@/components/ui/CommonTable";
import JobModal from "./components/JobModal";

const MyApplied = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleAction = (action, rowData) => {
    if (action === "view") {
      setSelectedRow(rowData);
      setIsModalOpen(true);
    }
    if (action === "delete") {
      console.log("Delete clicked", rowData);
    }
  };

  const appliedData = [
    {
      title: "Full Stack Developer",
      company: "PrimeEdge Solutions",
      location: "Las Vegas, USA",
      date: "Mar 29, 2024",
      cost: "$15-$20 /hour",
      status: "Submitted",
      companyIcon: (
        <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">P</span>
        </div>
      )
    },
    {
      title: "Senior DevOps Engineer",
      company: "Bright Future",
      location: "Las Vegas, USA",
      date: "Mar 24, 2024",
      cost: "$60-$80 /day",
      status: "Active",
      companyIcon: (
        <div className="w-4 h-4 bg-purple-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">B</span>
        </div>
      )
    },
    {
      title: "Need a UX designer to design a website on figma",
      company: "GlobalTech Partners",
      location: "Las Vegas, USA",
      date: "Mar 19, 2024",
      cost: "$850-$1000 /month",
      status: "Expired",
      companyIcon: (
        <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">G</span>
        </div>
      )
    },
    {
      title: "Social Media Marketing",
      company: "Apex Innovations",
      location: "Las Vegas, USA",
      date: "Mar 16, 2024",
      cost: "$20-$25 /hour",
      status: "Expired",
      companyIcon: (
        <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">A</span>
        </div>
      )
    },
    {
      title: "React Native Developer",
      company: "Tech Innovations",
      location: "Las Vegas, USA",
      date: "Mar 15, 2024",
      cost: "$35-$45 /hour",
      status: "Active",
      companyIcon: (
        <div className="w-4 h-4 bg-red-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">T</span>
        </div>
      )
    },
    {
      title: "Backend Developer - Node.js",
      company: "StartupHub",
      location: "Las Vegas, USA",
      date: "Mar 12, 2024",
      cost: "$40-$55 /hour",
      status: "Submitted",
      companyIcon: (
        <div className="w-4 h-4 bg-yellow-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">S</span>
        </div>
      )
    },
    {
      title: "Frontend Developer - Vue.js",
      company: "WebSolutions Inc",
      location: "Las Vegas, USA",
      date: "Mar 10, 2024",
      cost: "$30-$40 /hour",
      status: "Active",
      companyIcon: (
        <div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">W</span>
        </div>
      )
    },
    {
      title: "Mobile App Developer",
      company: "AppCraft Studios",
      location: "Las Vegas, USA",
      date: "Mar 8, 2024",
      cost: "$45-$60 /hour",
      status: "Expired",
      companyIcon: (
        <div className="w-4 h-4 bg-pink-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">A</span>
        </div>
      )
    }
  ];

  const columns = ["Title", "Date Applied", "Cost/Time", "Status"];

  return (
    <>
    <CommonTable
      data={appliedData}
      columns={columns}
      title="My Applied"
      searchPlaceholder="Search by keyword"
      itemsPerPage={5}
      actions={["view", "delete"]}
      onActionClick={handleAction}
    />

    
    {isModalOpen && (
      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedJob={selectedRow} // optional
      />
    )}
  </>

  );
};

export default MyApplied;