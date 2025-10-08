import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

const RecentJobs = ({ dashboardData }) => {
  // Helper function to format time ago
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hrs ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  };

  // Helper function to get avatar colors
  const getAvatarStyle = (index) => {
    const colors = [
      { bg: 'bg-purple-100', text: 'text-purple-600' },
      { bg: 'bg-cyan-100', text: 'text-cyan-600' },
      { bg: 'bg-green-100', text: 'text-green-600' },
      { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      { bg: 'bg-red-100', text: 'text-red-600' },
      { bg: 'bg-blue-100', text: 'text-blue-600' }
    ];
    return colors[index % colors.length];
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case '0': return 'bg-yellow-100 text-yellow-600';
      case '1': return 'bg-green-100 text-green-600';
      case '2': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const jobs = dashboardData?.latest_job_list?.slice(0, 6) || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 max-h-100 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Recent Jobs</h2>
        <Link href="/control/joblist" className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors">
          View All
          <ChevronDown className="w-3 h-3 ml-1" />
        </Link>
      </div>

      {/* Jobs List */}
      <div className="divide-y divide-gray-100">
        {jobs.length > 0 ? (
          jobs.map((job, index) => {
            const avatarStyle = getAvatarStyle(index);
            const initials = job.cuj_contact_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'J';
            const statusText = job.cuj_job_status === '0' ? 'Pending' : job.cuj_job_status === '1' ? 'Active' : 'Inactive';
            
            return (
              <div key={job.cuj_id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  {/* Left Side - Avatar and Job Info */}
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full ${avatarStyle.bg} flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-sm font-semibold ${avatarStyle.text}`}>
                        {initials}
                      </span>
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {job.cuj_title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {job.cuj_contact_name} - {getTimeAgo(job.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Right Side - Job Type and Status */}
                  <div className="flex flex-col items-end space-y-1 ml-4">
                    <span className="text-sm text-gray-700">
                      {job.cuj_job_type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-[10px] ${getStatusColor(job.cuj_job_status)}`}>
                      {statusText}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">No recent jobs</h3>
                <p className="text-xs text-gray-500 mt-1">There are no recent jobs to display at the moment.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentJobs;