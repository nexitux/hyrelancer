"use client";
import React, { useState } from 'react';
import { X, Star, MapPin, Clock, DollarSign, Eye, MessageCircle, User, Calendar, Award } from 'lucide-react';

const FreelancerListingModal = ({ isOpen, onClose, jobTitle = "Full Stack Developer" }) => {
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);

  // Mock data for freelancers
  const freelancers = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "/api/placeholder/60/60",
      title: "Full Stack Developer",
      rating: 4.9,
      reviews: 127,
      location: "New York, USA",
      hourlyRate: 85,
      experience: "5+ years",
      completedJobs: 89,
      responseTime: "1 hour",
      skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
      proposal: "I'm excited to work on your project. With 5+ years of experience in full-stack development, I can deliver high-quality solutions that meet your requirements...",
      appliedDate: "2 days ago",
      availability: "Available now",
      portfolio: 4.8
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "/api/placeholder/60/60",
      title: "Senior React Developer",
      rating: 4.8,
      reviews: 93,
      location: "San Francisco, USA",
      hourlyRate: 95,
      experience: "7+ years",
      completedJobs: 156,
      responseTime: "30 minutes",
      skills: ["React", "Vue.js", "JavaScript", "Python", "Docker"],
      proposal: "Hello! I've reviewed your requirements and I'm confident I can deliver exactly what you're looking for. My expertise in React and modern web technologies...",
      appliedDate: "1 day ago",
      availability: "Available in 1 week",
      portfolio: 4.9
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "/api/placeholder/60/60",
      title: "Frontend Specialist",
      rating: 4.7,
      reviews: 84,
      location: "Austin, USA",
      hourlyRate: 70,
      experience: "4+ years",
      completedJobs: 72,
      responseTime: "2 hours",
      skills: ["React", "CSS", "JavaScript", "Figma", "Next.js"],
      proposal: "Hi there! I specialize in creating beautiful, responsive web applications. I'd love to contribute to your project with my frontend expertise...",
      appliedDate: "3 days ago",
      availability: "Available now",
      portfolio: 4.6
    },
    {
      id: 4,
      name: "David Kumar",
      avatar: "/api/placeholder/60/60",
      title: "Full Stack Engineer",
      rating: 4.9,
      reviews: 201,
      location: "London, UK",
      hourlyRate: 90,
      experience: "6+ years",
      completedJobs: 134,
      responseTime: "45 minutes",
      skills: ["React", "Node.js", "PostgreSQL", "GraphQL", "Kubernetes"],
      proposal: "I'm David, a seasoned full-stack developer with extensive experience in modern web technologies. Your project aligns perfectly with my skill set...",
      appliedDate: "1 day ago",
      availability: "Available in 3 days",
      portfolio: 4.8
    }
  ];

  if (!isOpen) return null;

  const FreelancerCard = ({ freelancer }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img
            src={freelancer.avatar}
            alt={freelancer.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{freelancer.name}</h3>
            <p className="text-gray-600 text-sm">{freelancer.title}</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{freelancer.rating}</span>
                <span className="text-sm text-gray-500">({freelancer.reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">${freelancer.hourlyRate}/hr</div>
          <div className="text-sm text-gray-500">{freelancer.availability}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{freelancer.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Responds in {freelancer.responseTime}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Award className="w-4 h-4" />
          <span>{freelancer.experience} experience</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <User className="w-4 h-4" />
          <span>{freelancer.completedJobs} jobs completed</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {freelancer.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
            >
              {skill}
            </span>
          ))}
          {freelancer.skills.length > 4 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              +{freelancer.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 text-sm line-clamp-2">
          {freelancer.proposal}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-500">Applied {freelancer.appliedDate}</span>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSelectedFreelancer(freelancer)}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Profile</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>Message</span>
          </button>
        </div>
      </div>
    </div>
  );

  const FreelancerDetailModal = ({ freelancer, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Freelancer Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-start space-x-6 mb-6">
            <img
              src={freelancer.avatar}
              alt={freelancer.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{freelancer.name}</h3>
              <p className="text-gray-600 mb-2">{freelancer.title}</p>
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{freelancer.rating}</span>
                  <span className="text-gray-500">({freelancer.reviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{freelancer.location}</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-green-600">${freelancer.hourlyRate}/hour</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{freelancer.completedJobs}</div>
              <div className="text-sm text-gray-600">Jobs Completed</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{freelancer.responseTime}</div>
              <div className="text-sm text-gray-600">Response Time</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{freelancer.experience}</div>
              <div className="text-sm text-gray-600">Experience</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{freelancer.portfolio}</div>
              <div className="text-sm text-gray-600">Portfolio Rating</div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {freelancer.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3">Proposal</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{freelancer.proposal}</p>
              <div className="flex items-center space-x-2 mt-3 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Applied {freelancer.appliedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
              Hire {freelancer.name.split(' ')[0]}
            </button>
            <button className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Freelancer Applications</h2>
              <p className="text-gray-600 mt-1">Job: {jobTitle}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="font-semibold text-gray-900">{freelancers.length}</span>
                  <span className="text-gray-600 ml-1">Total Applications</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">
                    ${Math.min(...freelancers.map(f => f.hourlyRate))} - ${Math.max(...freelancers.map(f => f.hourlyRate))}
                  </span>
                  <span className="text-gray-600 ml-1">Hourly Rate Range</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <select className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Sort by Rating</option>
                  <option>Sort by Price (Low to High)</option>
                  <option>Sort by Price (High to Low)</option>
                  <option>Sort by Experience</option>
                </select>
              </div>
            </div>
          </div>

          {/* Freelancer List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {freelancers.map((freelancer) => (
                <FreelancerCard key={freelancer.id} freelancer={freelancer} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedFreelancer && (
        <FreelancerDetailModal 
          freelancer={selectedFreelancer} 
          onClose={() => setSelectedFreelancer(null)} 
        />
      )}
    </>
  );
};

export default FreelancerListingModal;