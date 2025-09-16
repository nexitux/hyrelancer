import { Calendar, Users, Briefcase, ArrowUpRight } from "lucide-react"

export default function ActiveJobs() {
  const jobs = [
    { 
      jobTitle: 'Senior Frontend Developer', 
      postedDate: 'August 1', 
      applicants: 21,
      status: 'active',
      priority: 'high'
    },
    { 
      jobTitle: 'UX/UI Designer', 
      postedDate: 'August 30', 
      applicants: 11,
      status: 'active',
      priority: 'medium'
    },
    { 
      jobTitle: 'Product Manager', 
      postedDate: 'Applied 30', 
      applicants: 8,
      status: 'review',
      priority: 'low'
    }
  ];

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
    <div className="bg-white rounded-xl border-0 shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
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

      <div className="space-y-4">
        {jobs.map((job, index) => (
          <div 
            key={index} 
            className={`group p-4 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer ${getStatusColor(job.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900 truncate">
                    {job.jobTitle}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(job.priority)}`}>
                    {job.priority}
                  </span>
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
              
              <div className="flex items-center gap-2 ml-4">
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {job.applicants}
                  </div>
                  <div className="text-xs text-gray-500">
                    {job.applicants > 15 ? 'High interest' : 'Moderate'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
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