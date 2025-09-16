import { ChevronDown } from 'lucide-react';

const TopCompanies = () => {
  const companies = [
    {
      id: 1,
      logo: "🏢",
      name: "Obligation Pvt.Ltd",
      type: "Remote/Onsite",
      subscription: "Basic",
      subscriptionColor: "bg-blue-100 text-blue-600",
      totalEmployees: "547",
      recruiterSince: "24,Nov 2021",
      logoBg: "bg-blue-100"
    },
    {
      id: 2,
      logo: "✅",
      name: "Voluptatem Pvt.Ltd",
      type: "Remote/Onsite",
      subscription: "Pro",
      subscriptionColor: "bg-green-100 text-green-600",
      totalEmployees: "223",
      recruiterSince: "13,Jan 2020",
      logoBg: "bg-green-100"
    },
    {
      id: 3,
      logo: "🚀",
      name: "BloomTech.Inc",
      type: "Remote/Onsite",
      subscription: "Basic",
      subscriptionColor: "bg-blue-100 text-blue-600",
      totalEmployees: "189",
      recruiterSince: "06,Sep 2020",
      logoBg: "bg-blue-100"
    },
    {
      id: 4,
      logo: "🎯",
      name: "Beatae Industries",
      type: "Remote/Onsite",
      subscription: "Basic",
      subscriptionColor: "bg-blue-100 text-blue-600",
      totalEmployees: "106",
      recruiterSince: "19,Mar 2020",
      logoBg: "bg-pink-100"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Top Companies</h2>
        <button className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors">
          View All
          <ChevronDown className="w-3 h-3 ml-1" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full h-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-sm font-medium text-gray-500 p-2">Name</th>
              <th className="text-left text-sm font-medium text-gray-500 p-2">Subscription</th>
              <th className="text-left text-sm font-medium text-gray-500 p-2">Total Employees</th>
              <th className="text-left text-sm font-medium text-gray-500 p-2">Recruiter Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${company.logoBg} flex items-center justify-center text-lg`}>
                      {company.logo}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{company.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{company.type}</div>
                    </div>
                  </div>
                </td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${company.subscriptionColor}`}>
                    {company.subscription}
                  </span>
                </td>
                <td className="p-2">
                  <span className="text-sm font-semibold text-gray-900">{company.totalEmployees}</span>
                </td>
                <td className="p-2">
                  <span className="text-sm text-gray-600">{company.recruiterSince}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopCompanies;