import { ChevronDown, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';

const RecentRecruiters = ({ dashboardData }) => {
  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case '0': return 'text-yellow-500';
      case '1': return 'text-green-500';
      case '2': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Helper function to get status text
  const getStatusText = (status) => {
    switch (status) {
      case '0': return 'Inactive';
      case '1': return 'Active';
      case '2': return 'Inactive';
      default: return 'Unknown';
    }
  };

  // Get latest 3 customers
  const recruiters = dashboardData?.latest_cu_list?.slice(0, 3) || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Recent Customer Registrations</h2>
        <Link href="/control/customerlist" className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors">
          View All
          <ChevronDown className="w-3 h-3 ml-1" />
        </Link>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100 overflow-x-auto">
        {recruiters.map((customer, index) => (
          <div key={customer.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors group">
            {/* Customer Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>

                {/* Name and Email */}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {customer.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {customer.email}
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>

            {/* Stats */}
            <div className="space-y-3">
              {/* User Type */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Type</span>
                <span className="text-lg font-bold text-gray-900">{customer.user_type}</span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-sm font-medium ${getStatusColor(customer.is_active)}`}>
                  {getStatusText(customer.is_active)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentRecruiters;