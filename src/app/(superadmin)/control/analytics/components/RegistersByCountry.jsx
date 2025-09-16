const RegistersByCountry = () => {
  const countries = [
    {
      flag: "🇺🇸",
      country: "U.S.A",
      date: "21,Dec 2022",
      totalRegisters: "782",
      flagBg: "bg-blue-50"
    },
    {
      flag: "🇫🇷",
      country: "France",
      date: "29,April 2023",
      totalRegisters: "53",
      flagBg: "bg-red-50"
    },
    {
      flag: "🇦🇪",
      country: "U.A.E",
      date: "30,Nov 2023",
      totalRegisters: "15",
      flagBg: "bg-green-50"
    },
    {
      flag: "🇩🇪",
      country: "Germany",
      date: "18,Mar 2023",
      totalRegisters: "19",
      flagBg: "bg-yellow-50"
    },
    {
      flag: "🇦🇷",
      country: "Argentina",
      date: "25,Apr 2023",
      totalRegisters: "92",
      flagBg: "bg-blue-50"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className="py-4 px-2 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Registers By Country</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full h-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-sm font-medium text-gray-500 p-2">Country</th>
              <th className="text-left text-sm font-medium text-gray-500 p-2">Date</th>
              <th className="text-left text-sm font-medium text-gray-500 p-2">Total Registers</th>
              <th className="text-left text-sm font-medium text-gray-500 p-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {countries.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="p-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full ${item.flagBg} flex items-center justify-center text-lg`}>
                      {item.flag}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.country}</span>
                  </div>
                </td>
                <td className="p-2">
                  <span className="text-sm text-gray-600">{item.date}</span>
                </td>
                <td className="p-2">
                  <span className="text-sm font-semibold text-gray-900">{item.totalRegisters}</span>
                </td>
                <td className="p-2">
                  <button className="text-sm font-medium text-green-500 hover:text-green-600 transition-colors">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistersByCountry;