// components/Employers.jsx
import React from 'react';
import { MapPin, Star, Trash2 } from 'lucide-react';

const Employers = ({ employers }) => {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {employers.map((employer) => (
                <div key={employer.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-[0_0_25px_rgba(0,0,0,0.15)] transition-shadow duration-300">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-5">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: employer.color }}>
                                <span className="text-white font-bold text-lg">
                                    {employer.name.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < employer.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{employer.name}</h3>
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                    <span className="text-sm text-gray-600">{employer.location}</span>
                                </div>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-red-500 p-1">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Employers;