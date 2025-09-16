import { ChevronDown } from 'lucide-react';

const RecentJobs = () => {
  const jobs = [
    {
      id: 'AC',
      title: 'UI Developer',
      company: 'Achies',
      time: '12 hrs ago',
      type: 'Full Time',
      tag: 'Fresher',
      tagColor: 'bg-green-100 text-green-600',
      avatarBg: 'bg-purple-100',
      avatarText: 'text-purple-600'
    },
    {
      id: 'SI',
      title: 'AWS Engineer',
      company: 'Siachies',
      time: '2 hrs ago',
      type: 'Part Time',
      tag: '+1 yrs - Experience',
      tagColor: 'bg-blue-100 text-blue-600',
      avatarBg: 'bg-cyan-100',
      avatarText: 'text-cyan-600'
    },
    {
      id: 'LS',
      title: 'React Developer',
      company: 'LifeSpace',
      time: '6 hrs ago',
      type: 'Freelancer',
      tag: 'Fresher',
      tagColor: 'bg-green-100 text-green-600',
      avatarBg: 'bg-green-100',
      avatarText: 'text-green-600'
    },
    {
      id: 'MS',
      title: 'Angular Developer',
      company: 'MegaSoft',
      time: '14 hrs ago',
      type: 'Full Time',
      tag: '+2 yrs - Experience',
      tagColor: 'bg-blue-100 text-blue-600',
      avatarBg: 'bg-yellow-100',
      avatarText: 'text-yellow-600'
    },
    {
      id: 'J',
      title: 'UI Tester',
      company: 'Joggle',
      time: '2 days ago',
      type: 'Full Time',
      tag: '+3 yrs - Experience',
      tagColor: 'bg-blue-100 text-blue-600',
      avatarBg: 'bg-red-100',
      avatarText: 'text-red-600'
    },
    {
      id: 'NL',
      title: 'Php - Laravel Develope',
      company: 'Nirfog',
      time: '2 days ago',
      type: 'Part Time',
      tag: 'Fresher',
      tagColor: 'bg-green-100 text-green-600',
      avatarBg: 'bg-blue-100',
      avatarText: 'text-blue-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 max-h-100 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Recent Jobs</h2>
        <button className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors">
          View All
          <ChevronDown className="w-3 h-3 ml-1" />
        </button>
      </div>

      {/* Jobs List */}
      <div className="divide-y divide-gray-100">
        {jobs.map((job, index) => (
          <div key={index} className="px-4 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              {/* Left Side - Avatar and Job Info */}
              <div className="flex items-start space-x-3 flex-1">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full ${job.avatarBg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-sm font-semibold ${job.avatarText}`}>
                    {job.id}
                  </span>
                </div>

                {/* Job Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {job.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {job.company} - {job.time}
                  </p>
                </div>
              </div>

              {/* Right Side - Job Type and Tag */}
              <div className="flex flex-col items-end space-y-1 ml-4">
                <span className="text-sm text-gray-700">
                  {job.type}
                </span>
                <span className={`px-2 py-1 rounded-full text-[10px] ${job.tagColor}`}>
                  {job.tag}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentJobs;