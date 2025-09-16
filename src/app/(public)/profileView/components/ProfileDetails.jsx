"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Briefcase, Star, Plus } from 'lucide-react';

const ProfileDetails = ({ profileData, experience, certificates, services, cities, states }) => {
  const [expandedExperience, setExpandedExperience] = useState({});
  const [showAllSkills, setShowAllSkills] = useState(false);

  const toggleExperience = (index) => {
    setExpandedExperience(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Process education data from certificates
  const educationData = certificates && certificates.length > 0 
    ? certificates.map(cert => ({
        year: cert.fc_year,
        degree: cert.fc_title,
        type: cert.fc_type,
        college: cert.fc_collage
      }))
    : [
        { year: "Not specified", degree: "No education information available" }
      ];

  // Process experience data
  const experienceData = experience && experience.length > 0 
    ? experience
        .filter(exp => exp.fj_position && exp.fj_position.trim() !== '') // Filter out empty experiences
        .map(exp => ({
          period: exp.fj_year ? `${exp.fj_year} years` : "Duration not specified",
          title: exp.fj_position,
          description: exp.fj_desc || "No description provided"
        }))
    : [
        {
          period: "Not specified",
          title: "No experience information available",
          description: "This freelancer hasn't added their work experience yet."
        }
      ];

  // Get skills from services and create a comprehensive skills array
  const serviceSkills = services && services.length > 0 
    ? services.map(service => service.se_name)
    : [];
  
  // Combine with any additional skills or use fallback
  const skills = serviceSkills.length > 0 
    ? serviceSkills 
    : ["Professional Services", "Client Consultation"];

  const visibleSkills = showAllSkills ? skills : skills.slice(0, 7);

  return (
    <div className="mx-auto space-y-8">
      {/* Education Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Education</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {educationData.map((edu, index) => (
            <div key={index} className="group">
              <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200">
                <div className="text-sm font-semibold text-blue-600 mb-2">
                  {edu.year} {edu.type && `• ${edu.type}`}
                </div>
                <div className="text-lg font-bold text-gray-900 mb-2">{edu.degree}</div>
                {edu.college && edu.college !== 'N/A' && (
                  <div className="text-sm text-gray-600">{edu.college}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Experience</h2>
        </div>
        
        <div className="space-y-4">
          {experienceData.map((exp, index) => (
            <div key={index} className="group">
              <div className="border border-gray-200 rounded-xl hover:border-blue-200 transition-colors duration-200">
                <button
                  onClick={() => toggleExperience(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors duration-200"
                >
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-blue-600 mb-2">{exp.period}</div>
                    <div className="text-lg font-bold text-gray-900">{exp.title}</div>
                  </div>
                  <div className="ml-4">
                    {expandedExperience[index] ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {expandedExperience[index] && (
                  <div className="px-6 pb-6 border-t border-gray-100 mt-4 pt-4">
                    <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
            <Star className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Services & Skills</h2>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-6">
          {visibleSkills.map((skill, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 cursor-default"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Location Information */}
        {cities && cities.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Service Areas</h4>
            <div className="flex flex-wrap gap-2">
              {cities.slice(0, 5).map((city, index) => (
                <span key={city.frc_id} className="text-sm bg-white px-3 py-1 rounded-full text-gray-700">
                  {city.cit_name}
                </span>
              ))}
              {cities.length > 5 && (
                <span className="text-sm text-blue-600 font-medium">
                  +{cities.length - 5} more cities
                </span>
              )}
            </div>
          </div>
        )}
        
        {skills.length > 7 && (
          <button
            onClick={() => setShowAllSkills(!showAllSkills)}
            className="group flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
          >
            <Plus className={`w-4 h-4 mr-2 transition-transform duration-200 ${showAllSkills ? 'rotate-45' : ''}`} />
            {showAllSkills ? 'Show Less' : 'Show All >>'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileDetails;