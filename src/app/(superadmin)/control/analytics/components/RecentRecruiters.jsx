import { ChevronDown, ChevronRight, User } from 'lucide-react';

const RecentRecruiters = () => {
  const recruiters = [
    {
      name: 'Hr@Spruko',
      email: 'hr.spruko@gmail.com',
      avatar: '/api/placeholder/40/40', // Placeholder for actual image
      hasAvatar: true,
      vacancies: '07',
      position: 'Aws Engineer',
      positionColor: 'text-blue-500'
    },
    {
      name: 'Hr@Nicero',
      email: 'nicero.help@gmail.com',
      avatar: null,
      hasAvatar: false,
      vacancies: '16',
      position: 'React Developer',
      positionColor: 'text-orange-500'
    },
    {
      name: 'JosephSmith',
      email: 'josephsmith@gmail.com',
      avatar: '/api/placeholder/40/40', // Placeholder for actual image
      hasAvatar: true,
      vacancies: '32',
      position: 'UI Developer',
      positionColor: 'text-purple-500'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Recent Recruiter Registrations</h2>
        <button className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors">
          View All
          <ChevronDown className="w-3 h-3 ml-1" />
        </button>
      </div>

      {/* Recruiters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100 overflow-x-auto">
        {recruiters.map((recruiter, index) => (
          <div key={index} className="p-4 md:p-6 hover:bg-gray-50 transition-colors group">
            {/* Recruiter Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                {recruiter.hasAvatar ? (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img 
                      src={recruiter.avatar} 
                      alt={recruiter.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gray-200 items-center justify-center hidden">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                )}

                {/* Name and Email */}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {recruiter.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {recruiter.email}
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>

            {/* Stats */}
            <div className="space-y-3">
              {/* Vacancies */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Vacancies</span>
                <span className="text-lg font-bold text-gray-900">{recruiter.vacancies}</span>
              </div>

              {/* Position */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Position</span>
                <span className={`text-sm font-medium ${recruiter.positionColor}`}>
                  {recruiter.position}
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