"use client";

import React, { useState } from 'react';
import CommonTable from "@/components/ui/CommonTable";
import EditBidModal from './components/EditBidModal';

const MyProposals = () => {
  const [proposalsData, setProposalsData] = useState([
    {
      id: 1,
      title: "Need a UX designer to design a website on figma",
      company: "Innovations",
      location: "Las Vegas, USA",
      date: "Mar 29, 2024",
      cost: "$15-$20 /hour",
      status: "Submitted",
      coverLetter: "Dear Tony, I am thrilled to apply for the Freelance UX/UI Designer position at Avitex. With my experience in this field and a profound passion for user experience design, I believe I can make a meaningful contribution to you.",
      companyIcon: (
        <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">I</span>
        </div>
      )
    },
    {
      id: 2,
      title: "Need high-quality video editor for our marketing campaign",
      company: "Bright Future",
      location: "Las Vegas, USA",
      date: "Mar 24, 2024",
      cost: "$60-$80 /day",
      status: "Active",
      coverLetter: "Dear Hiring Manager, I am excited to apply for this video editing position...",
      companyIcon: (
        <div className="w-4 h-4 bg-purple-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">B</span>
        </div>
      )
    },
    {
      id: 3,
      title: "Figma and photoshop expert needed for fulltime/part time long term contract",
      company: "GlobalTech Partners",
      location: "Las Vegas, USA",
      date: "Mar 19, 2024",
      cost: "$850-$1000 /month",
      status: "Expired",
      coverLetter: "Dear Team, I would like to express my interest in this design position...",
      companyIcon: (
        <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">G</span>
        </div>
      )
    },
    {
      id: 4,
      title: "Creating Landing Page from Figma template file",
      company: "Apex Innovations",
      location: "Las Vegas, USA",
      date: "Mar 16, 2024",
      cost: "$20-$25 /hour",
      status: "Expired",
      coverLetter: "Hello, I am interested in your landing page development project...",
      companyIcon: (
        <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">A</span>
        </div>
      )
    },
    {
      id: 5,
      title: "WordPress Developer for E-commerce Site",
      company: "Digital Commerce",
      location: "Las Vegas, USA",
      date: "Mar 14, 2024",
      cost: "$500-$800 /project",
      status: "Active",
      coverLetter: "Dear Sir/Madam, I am writing to apply for the WordPress developer position...",
      companyIcon: (
        <div className="w-4 h-4 bg-orange-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">D</span>
        </div>
      )
    },
    {
      id: 6,
      title: "Logo Design for Tech Startup",
      company: "TechStart",
      location: "Las Vegas, USA",
      date: "Mar 13, 2024",
      cost: "$100-$200 /project",
      status: "Submitted",
      coverLetter: "Dear Hiring Team, I am excited about the opportunity to design your logo...",
      companyIcon: (
        <div className="w-4 h-4 bg-red-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">T</span>
        </div>
      )
    },
    {
      id: 7,
      title: "SEO Specialist for Marketing Agency",
      company: "MarketPro",
      location: "Las Vegas, USA",
      date: "Mar 11, 2024",
      cost: "$25-$35 /hour",
      status: "Active",
      coverLetter: "Hello, I am interested in your SEO specialist position...",
      companyIcon: (
        <div className="w-4 h-4 bg-cyan-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">M</span>
        </div>
      )
    },
    {
      id: 8,
      title: "Content Writer for Blog Posts",
      company: "ContentHub",
      location: "Las Vegas, USA",
      date: "Mar 9, 2024",
      cost: "$15-$20 /hour",
      status: "Expired",
      coverLetter: "Dear Content Team, I am writing to express my interest in the content writer role...",
      companyIcon: (
        <div className="w-4 h-4 bg-violet-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">C</span>
        </div>
      )
    },
    {
      id: 9,
      title: "Database Administrator - MySQL",
      company: "DataFlow Systems",
      location: "Las Vegas, USA",
      date: "Mar 7, 2024",
      cost: "$50-$70 /hour",
      status: "Active",
      coverLetter: "Dear Hiring Manager, I am pleased to submit my application for the DBA position...",
      companyIcon: (
        <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">D</span>
        </div>
      )
    },
    {
      id: 10,
      title: "Social Media Manager",
      company: "SocialBuzz",
      location: "Las Vegas, USA",
      date: "Mar 5, 2024",
      cost: "$800-$1200 /month",
      status: "Submitted",
      coverLetter: "Hello, I am excited to apply for the Social Media Manager position...",
      companyIcon: (
        <div className="w-4 h-4 bg-rose-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">S</span>
        </div>
      )
    }
  ]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  const columns = ["Projects Title", "Date Bid", "Cost/Time", "Status"];

  // Fixed: Removed parameter naming conflict
  const handleEdit = (proposalId) => {
    const proposal = proposalsData.find(p => p.id === proposalId);
    setSelectedProposal(proposal);
    setIsEditModalOpen(true);
  };

  const handleDelete = (proposalId) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      setProposalsData(prev => prev.filter(p => p.id !== proposalId));
    }
  };

  const handleUpdateProposal = (updatedProposal) => {
    setProposalsData(prev => 
      prev.map(p => p.id === updatedProposal.id ? updatedProposal : p)
    );
  };

  // Fixed: Added proper action handler for the CommonTable
  const handleActionClick = (action, item) => {
    if (action === 'edit') {
      handleEdit(item.id);
    } else if (action === 'delete') {
      handleDelete(item.id);
    } else if (action === 'view') {
      // Handle view action if needed
      console.log('View item:', item);
    }
  };

  return (
    <div>
      <CommonTable
        data={proposalsData}
        columns={columns}
        title="My Proposals"
        searchPlaceholder="Search by keyword"
        itemsPerPage={5}
        actions={["edit", "delete"]}
        onActionClick={handleActionClick}
      />
      
      <EditBidModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        proposalData={selectedProposal}
        onUpdate={handleUpdateProposal}
      />
    </div>
  );
};

export default MyProposals;