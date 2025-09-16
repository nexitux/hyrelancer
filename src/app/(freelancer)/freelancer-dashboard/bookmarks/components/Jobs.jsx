// components/Jobs.jsx
import React from 'react';
import { MapPin, Calendar, Trash2, DollarSign } from 'lucide-react';

const Jobs = ({ jobs }) => {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {jobs.map((job) => (
                <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-[0_0_25px_rgba(0,0,0,0.15)] transition-shadow duration-300">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: job.company.color }}>
                                <span className="text-white font-bold text-sm">
                                    {job.company.name.charAt(0)}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-medium text-blue-600 mb-0.5">{job.company.name}</h4>
                                <h3 className="text-base font-semibold text-gray-900 leading-tight">{job.title}</h3>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0 border rounded-full">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            {job.location}
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {job.postedDate}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 mb-3 flex justify-between">
                        <div className="flex flex-wrap gap-2 items-center">
                            {job.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                                {job.salary} <span className="text-sm font-normal text-gray-600">/{job.period}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Jobs;