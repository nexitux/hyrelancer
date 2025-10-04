'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  MdSearch, 
  MdCheckCircle, 
  MdCancel, 
  MdStar,
  MdPerson,
  MdWork,
  MdAccessTime,
  MdThumbUp,
  MdThumbDown,
  MdRefresh
} from 'react-icons/md';
import adminApi from '@/config/adminApi';

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getStatusInfo = (status) => {
  switch (status) {
    case 0:
      return { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: MdCancel };
    case 1:
      return { label: 'Approved', color: 'bg-green-100 text-green-800', icon: MdCheckCircle };
    case 2:
      return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: MdAccessTime };
    default:
      return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: MdCancel };
  }
};

const renderStars = (rating) => {
  const stars = [];
  const numRating = parseInt(rating) || 0;
  
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <MdStar
        key={i}
        className={`w-4 h-4 ${i <= numRating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    );
  }
  return stars;
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.get('/getAllTestimonial');
      const data = response.data?.fe_testi || response.data || [];
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Filter testimonials based on search and status
  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = 
      testimonial.te_user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.freelancer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.ft_desc?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || testimonial.ft_is_active.toString() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (testimonialId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [testimonialId]: true }));
    
    try {
      await adminApi.get(`/PublishTestimonial/${newStatus}/${testimonialId}`);
      
      // Update the local state
      setTestimonials(prev => 
        prev.map(testimonial => 
          testimonial.ft_id === testimonialId 
            ? { ...testimonial, ft_is_active: newStatus }
            : testimonial
        )
      );
    } catch (err) {
      console.error('Error updating testimonial status:', err);
      setError(err.message || 'An error occurred while updating testimonial status.');
    } finally {
      setActionLoading(prev => ({ ...prev, [testimonialId]: false }));
    }
  };

  // Stats
  const totalTestimonials = testimonials.length;
  const pendingTestimonials = testimonials.filter(t => t.ft_is_active === 2).length;
  const approvedTestimonials = testimonials.filter(t => t.ft_is_active === 1).length;
  const rejectedTestimonials = testimonials.filter(t => t.ft_is_active === 0).length;

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex justify-center items-center">
        <div className="flex items-center gap-3">
          <MdRefresh className="animate-spin text-blue-600" size={24} />
          <p className="text-slate-600">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen flex justify-center items-center text-red-600">
        <div className="text-center">
          <p className="mb-4">Error: {error}</p>
          <button 
            onClick={fetchTestimonials}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Testimonials Management</h1>
            <p className="mt-1 text-slate-600">Review and manage customer testimonials</p>
          </div>
          <button 
            onClick={fetchTestimonials}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <MdRefresh size={20} />
            Refresh
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search testimonials by customer, freelancer, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="2">Pending</option>
                <option value="1">Approved</option>
                <option value="0">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Testimonials */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Total Testimonials</p>
              <p className="text-2xl font-bold text-slate-800">{totalTestimonials}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-lg">
              <MdStar className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        {/* Pending Testimonials */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingTestimonials}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-yellow-100 rounded-lg">
              <MdAccessTime className="text-yellow-600" size={20} />
            </div>
          </div>
        </div>

        {/* Approved Testimonials */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedTestimonials}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-green-100 rounded-lg">
              <MdCheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        {/* Rejected Testimonials */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{rejectedTestimonials}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-red-100 rounded-lg">
              <MdCancel className="text-red-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Table */}
      <div className="overflow-hidden bg-white rounded-xl border shadow-sm border-slate-200">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-slate-50 border-slate-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">User</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Freelancer</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Rating</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Testimonial</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Date</th>
                <th className="px-6 py-3 text-sm font-semibold text-right text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTestimonials.length > 0 ? (
                filteredTestimonials.map((testimonial) => {
                  const statusInfo = getStatusInfo(testimonial.ft_is_active);
                  const StatusIcon = statusInfo.icon;
                  const isLoading = actionLoading[testimonial.ft_id];

                  return (
                    <tr key={testimonial.ft_id} className="transition-colors hover:bg-slate-50">
                      {/* Customer Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex justify-center items-center w-8 h-8 bg-blue-100 rounded-lg">
                            <MdPerson className="text-blue-600" size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{testimonial.te_user?.name}</p>
                            <p className="text-sm text-slate-500">{testimonial.te_user?.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Freelancer Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex justify-center items-center w-8 h-8 bg-green-100 rounded-lg">
                            <MdWork className="text-green-600" size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{testimonial.freelancer?.name}</p>
                            <p className="text-sm text-slate-500">{testimonial.freelancer?.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {renderStars(testimonial.ft_rating)}
                          <span className="ml-2 text-sm text-slate-600">({testimonial.ft_rating}/5)</span>
                        </div>
                      </td>

                      {/* Testimonial Content */}
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-slate-800 text-sm leading-relaxed line-clamp-3">
                            {testimonial.ft_desc}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon size={12} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-slate-600">{formatDate(testimonial.created_at)}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex gap-2 justify-end items-center">
                          {testimonial.ft_is_active === 2 && (
                            <>
                              <button
                                onClick={() => handleStatusChange(testimonial.ft_id, 1)}
                                disabled={isLoading}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                title="Approve"
                              >
                                <MdThumbUp size={14} />
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(testimonial.ft_id, 0)}
                                disabled={isLoading}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                title="Reject"
                              >
                                <MdThumbDown size={14} />
                                Reject
                              </button>
                            </>
                          )}
                          
                          {testimonial.ft_is_active === 1 && (
                            <button
                              onClick={() => handleStatusChange(testimonial.ft_id, 0)}
                              disabled={isLoading}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              title="Reject"
                            >
                              <MdThumbDown size={14} />
                              Reject
                            </button>
                          )}
                          
                          {testimonial.ft_is_active === 0 && (
                            <button
                              onClick={() => handleStatusChange(testimonial.ft_id, 1)}
                              disabled={isLoading}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              title="Approve"
                            >
                              <MdThumbUp size={14} />
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full bg-slate-100">
                      <MdSearch className="text-slate-400" size={24} />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-slate-800">No testimonials found</h3>
                    <p className="text-slate-600">Try adjusting your search criteria or check back later for new testimonials.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredTestimonials.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {filteredTestimonials.length} of {testimonials.length} testimonials
            </div>
            <div className="flex gap-2 items-center">
              <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
