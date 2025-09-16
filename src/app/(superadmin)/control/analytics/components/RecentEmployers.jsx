import React, { useState } from 'react';
import { Search, ChevronDown, Download, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

const RecentEmployers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployers, setSelectedEmployers] = useState([]);
  
  const employers = [
    {
      id: 1,
      name: 'Mayor Kelly',
      category: 'Manufacture',
      role: 'Team Lead',
      email: 'mayorkelly@gmail.com',
      location: 'Germany',
      date: 'Sep 15 - Oct 12, 2023',
      avatar: '👩‍🦰'
    },
    {
      id: 2,
      name: 'Andrew Garfield',
      category: 'Development',
      role: 'Director',
      email: 'andrewgarfield@gmail.com',
      location: 'Canada',
      date: 'Apr 10 - Dec 12, 2023',
      avatar: '👨‍💼'
    },
    {
      id: 3,
      name: 'Simon Cowel',
      category: 'Service',
      role: 'Manager',
      email: 'simoncowel234@gmail.com',
      location: 'Europe',
      date: 'Sep 15 - Oct 12, 2023',
      avatar: '👨‍🦳'
    },
    {
      id: 4,
      name: 'Mirinda Hers',
      category: 'Marketing',
      role: 'Employee',
      email: 'mirindahers@gmail.com',
      location: 'USA',
      date: 'Apr 10 - Dec 12, 2023',
      avatar: '👩‍💼'
    },
    {
      id: 5,
      name: 'Andrew Garfield',
      category: 'Development',
      role: 'Director',
      email: 'andrewgarfield@gmail.com',
      location: 'London',
      date: 'Jun 10 - Dec 12, 2022',
      avatar: '👨‍💼'
    }
  ];

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
    employer.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-100 w-full mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="font-bold text-gray-900">Recent Employers</h2>
          
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
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm">
              Sort By
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-600 w-8"></th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Employer</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 hidden sm:table-cell">Category</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Role</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 hidden md:table-cell">Mail</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 hidden lg:table-cell">Location</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 hidden xl:table-cell">Date</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployers.map((employer, index) => (
                <tr key={employer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 px-2">
                    <input
                      type="checkbox"
                      checked={selectedEmployers.includes(employer.id)}
                      onChange={() => handleSelectEmployer(employer.id)}
                      className="w-3.5 h-3.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {employer.avatar}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{employer.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 text-sm hidden sm:table-cell">{employer.category}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(employer.role)}`}>
                      {employer.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 text-sm hidden md:table-cell">{employer.email}</td>
                  <td className="py-2.5 px-3 text-gray-600 text-sm hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {employer.location}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 text-sm hidden xl:table-cell">{employer.date}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
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
          
          <div className="flex items-center gap-1.5">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentEmployers;