"use client";
import { useState, useEffect } from "react";
import { User, Clock, CheckCircle, XCircle, Calendar, AlertCircle, ArrowUpRight } from "lucide-react";
import { dashboardService } from '@/services/dashboardService';

export default function RecentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getUserDashboard();
        const transformedData = dashboardService.transformDashboardData(data);
        
        // Transform latest job list data
        const jobApplications = transformedData?.latestJobs ? 
          transformedData.latestJobs.map((job, index) => ({
            candidate: job.cuj_contact_name || `Contact ${index + 1}`,
            jobTitle: job.cuj_title || `Job ${index + 1}`,
            appliedDate: job.created_at ? new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent',
            status: job.cuj_job_status === '0' ? 'Active' : job.cuj_job_status === 'rejected' ? 'Rejected' : 'Under Review',
            avatar: (job.cuj_contact_name || `C${index + 1}`).split(' ').map(n => n[0]).join('').toUpperCase(),
            priority: job.cuj_is_active === 1 ? 'high' : 'low'
          })) : [];
        
        setApplications(jobApplications);
      } catch (error) {
        console.error('Error fetching recent applications:', error);
        // Fallback to sample data
        setApplications([
          { 
            candidate: 'John Smith', 
            jobTitle: 'Frontend Developer', 
            appliedDate: 'Aug 12', 
            status: 'Under Review',
            avatar: 'JS',
            priority: 'high'
          },
          { 
            candidate: 'Sarah Johnson', 
            jobTitle: 'UX Designer', 
            appliedDate: 'Aug 11', 
            status: 'Interview Scheduled',
            avatar: 'SJ',
            priority: 'medium'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusConfig = (status) => {
    switch(status) {
      case 'Hired':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle,
          dotColor: 'bg-green-500'
        };
      case 'Interview Scheduled':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Calendar,
          dotColor: 'bg-blue-500'
        };
      case 'Under Review':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: Clock,
          dotColor: 'bg-amber-500'
        };
      case 'Rejected':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: XCircle,
          dotColor: 'bg-red-500'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: AlertCircle,
          dotColor: 'bg-gray-500'
        };
    }
  };

  const getAvatarColor = (index) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500', 
      'bg-green-500',
      'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-xl border-0 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <User className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
            <p className="text-sm text-gray-500">{applications.length} new this week</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
          <ArrowUpRight className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 lg:hidden">
        {applications.map((application, index) => {
          const statusConfig = getStatusConfig(application.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <div 
              key={index} 
              className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(index)}`}>
                  {application.avatar}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {application.candidate}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
                      <span className="text-xs text-gray-500">{application.appliedDate}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {application.jobTitle}
                    </p>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {application.status}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-sm font-medium text-gray-600 pb-3 px-2">Candidate</th>
              <th className="text-left text-sm font-medium text-gray-600 pb-3 px-2">Job Title</th>
              <th className="text-left text-sm font-medium text-gray-600 pb-3 px-2">Applied Date</th>
              <th className="text-left text-sm font-medium text-gray-600 pb-3 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application, index) => {
              const statusConfig = getStatusConfig(application.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors duration-200">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(index)}`}>
                        {application.avatar}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{application.candidate}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-sm text-gray-600">{application.jobTitle}</td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
                      {application.appliedDate}
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {application.status}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}