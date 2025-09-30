"use client";
import { useState, useEffect } from "react";
import { Calendar, Users, Briefcase, ArrowUpRight } from "lucide-react";
import { dashboardService } from '@/services/dashboardService';

export default function ActiveJobs() {
  const [activeJobsData, setActiveJobsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getUserDashboard();
        const transformedData = dashboardService.transformDashboardData(data);
        
        // Transform latest active jobs data
        const jobs = transformedData?.latestActiveJobs ? 
          transformedData.latestActiveJobs.map((job, index) => ({
            jobTitle: job.cuj_title || `Job ${index + 1}`,
            postedDate: job.created_at ? new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent',
            applicants: job.cuj_fe_assigned || 0,
            status: job.cuj_job_status === '0' ? 'active' : job.cuj_job_status === 'rejected' ? 'rejected' : 'pending',
            priority: job.cuj_is_active === 1 ? 'high' : 'low'
          })) : [];
        
        setActiveJobsData(jobs);
      } catch (error) {
        console.error('Error fetching active jobs data:', error);
        // Fallback to sample data
        setActiveJobsData([
      
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border-0 shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const jobs = activeJobsData;

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-blue-50 border-blue-200' 
      : 'bg-orange-50 border-orange-200';
  };

  return (
    <div className="bg-white rounded-xl border-0 shadow-md p-4 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Active Jobs</h3>
            <p className="text-sm text-gray-500">{jobs.length} positions open</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
          <ArrowUpRight className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-3">
        {jobs.map((job, index) => (
          <div 
            key={index} 
            className={`group p-3 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer ${getStatusColor(job.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900 truncate">
                    {job.jobTitle}
                  </h4>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{job.postedDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-medium text-gray-900">
                      {job.applicants} applicants
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Total applicants this month</span>
          <span className="font-semibold text-gray-900">
            {jobs.reduce((sum, job) => sum + job.applicants, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}