const Acquisitions = () => {
  const acquisitions = [
    {
      label: "Total Applications",
      value: "1,982",
      color: "bg-purple-500",
      percentage: "52%"
    },
    {
      label: "Recruited",
      value: "214",
      color: "bg-cyan-500", 
      percentage: "12%"
    },
    {
      label: "Short Listed",
      value: "262",
      color: "bg-green-500",
      percentage: "19%"
    },
    {
      label: "Rejected",
      value: "306",
      color: "bg-orange-500",
      percentage: "10%"
    },
    {
      label: "Blocked",
      value: "79",
      color: "bg-red-500",
      percentage: "8%"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className="py-4 px-2 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Acquisitions</h2>
      </div>

      {/* Progress Bar */}
      <div className="p-2 flex-1 flex flex-col justify-center">
        <div className="flex h-3 rounded-lg overflow-hidden mb-3">
          {acquisitions.map((item, index) => (
            <div
              key={index}
              className={`${item.color}`}
              style={{ width: `${item.percentage}` }}
            />
          ))}
        </div>

        {/* Stats List */}
        <div className="space-y-4 border border-gray-100 p-4">
          {acquisitions.map((item, index) => (
            <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Acquisitions;