import React, { useState } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const RecentEmployers = ({ dashboardData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployers, setSelectedEmployers] = useState([]);
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case '0': return 'bg-yellow-100 text-yellow-700';
      case '1': return 'bg-green-100 text-green-700';
      case '2': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper function to get status text
  const getStatusText = (status) => {
    switch (status) {
      case '0': return 'Inactive';
      case '1': return 'Active';
      case '2': return 'Pending';
      default: return 'Unknown';
    }
  };

  // Helper function to get avatar emoji
  const getAvatarEmoji = (index) => {
    const emojis = ['👨‍💼', '👩‍💼', '👨‍🦳', '👩‍🦰', '👨‍💻', '👩‍💻'];
    return emojis[index % emojis.length];
  };

  const employers = dashboardData?.latest_fe_list || [];

  const getRoleColor = (role) => {
    const colors = {
      'Team Lead': 'bg-purple-100 text-purple-700',
      'Director': 'bg-blue-100 text-blue-700',
      'Manager': 'bg-green-100 text-green-700',
      'Employee': 'bg-red-100 text-red-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const handleSelectEmployer = (employerId) => {
    setSelectedEmployers(prev => 
      prev.includes(employerId) 
        ? prev.filter(id => id !== employerId)
        : [...prev, employerId]
    );
  };

  const filteredEmployers = employers.filter(employer =>
    employer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employer.user_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-100 w-full mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h2 className="font-bold text-gray-900">Recent Freelancers</h2>
            <Link href="/control/freelancelist" className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors ml-4">
              View All
              <ChevronDown className="w-3 h-3 ml-1" />
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-full sm:w-56 text-sm"
              />
            </div>
            
            {/* Sort By Button */}
            {/* <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm">
              Sort By
              <ChevronDown className="w-3.5 h-3.5" />
            </button> */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-600 w-8"></th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Freelancer</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 hidden sm:table-cell">User Type</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 hidden md:table-cell">Email</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 hidden lg:table-cell">Mobile</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 hidden xl:table-cell">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployers.map((freelancer, index) => (
                <tr key={freelancer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 px-2">
                    <input
                      type="checkbox"
                      checked={selectedEmployers.includes(freelancer.id)}
                      onChange={() => handleSelectEmployer(freelancer.id)}
                      className="w-3.5 h-3.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {getAvatarEmoji(index)}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{freelancer.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 text-sm hidden sm:table-cell">{freelancer.user_type}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(freelancer.is_active)}`}>
                      {getStatusText(freelancer.is_active)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 text-sm hidden md:table-cell">{freelancer.email}</td>
                  <td className="py-2.5 px-3 text-gray-600 text-sm hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {freelancer.mobile}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 text-sm hidden xl:table-cell">{formatDate(freelancer.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
          <div className="text-sm text-gray-600">
            Showing {filteredEmployers.length} Entries
          </div>
          
          {/* <div className="flex items-center gap-1.5">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">Prev</span>
            
            <div className="flex gap-1 mx-3">
              <button className="w-7 h-7 bg-purple-600 text-white rounded text-sm font-medium">
                1
              </button>
              <button className="w-7 h-7 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium">
                2
              </button>
            </div>
            
            <span className="text-sm text-gray-600">next</span>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default RecentEmployers;