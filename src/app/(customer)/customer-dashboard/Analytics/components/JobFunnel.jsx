// components/JobFunnel.jsx
export default function JobFunnel() {
  const stages = [
    { label: 'Applications Received', count: 1250, width: 100 },
    { label: 'Shortlisted', count: 485, width: 80 },
    { label: 'Interviewed', count: 186, width: 60 },
    { label: 'Hired', count: 42, width: 40 }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Job Funnel</h3>
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center">
            <div className="flex-1">
              <div
                className="bg-gray-400 h-12 flex items-center justify-center text-white font-medium rounded"
                style={{ width: `${stage.width}%`, marginLeft: `${(100 - stage.width) / 2}%` }}
              >
                {stage.count}
              </div>
            </div>
            <div className="ml-4 text-sm text-gray-600 w-32">
              {stage.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}