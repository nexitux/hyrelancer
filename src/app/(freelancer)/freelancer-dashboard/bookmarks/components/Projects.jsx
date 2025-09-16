// components/Projects.jsx
import React from 'react';
import { MapPin, Calendar, Star, Trash2, Users } from 'lucide-react';

const Projects = ({ projects }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {projects.map((project) => (
        <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-[0_0_25px_rgba(0,0,0,0.15)] transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {project.title}
            </h3>
            <button className="text-gray-400 hover:text-red-500 p-1 border rounded-full">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {project.postedDate}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {project.location}
            </div>
            <div className="text-green-600 font-medium">
              ${project.budget}
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < project.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>
          
          <p className="text-gray-700 mb-4 text-sm line-clamp-3">
            {project.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Proposals: {project.proposals}+
            </div>
            <div className="text-lg font-semibold text-gray-900">
              ${project.price} <span className="text-sm font-normal text-gray-600">/fixed-price</span>
            </div>
          </div>
          
          <button className="w-full mt-4 bg-blue-100 hover:text-white border border-blue-400 py-2 px-4 rounded-lg hover:bg-blue-700 hover:scale-102 transition-all duration-200">
            Apply Now
          </button>
        </div>
      ))}
    </div>
  );
};

export default Projects;