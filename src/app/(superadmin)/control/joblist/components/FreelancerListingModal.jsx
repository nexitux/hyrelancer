"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Eye,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
// Using built-in btoa for base64 encoding

import adminApi from "@/config/adminApi";

const AdminFreelancerModal = ({ isOpen, onClose, jobData = null }) => {
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Normalize API response to clean data structure
  const normalizeApplicant = (item) => {
    const freelancer = item.get_freelancer || {};
    return {
      applicationId: item.sjr_id,
      freelancerId: freelancer.id,
      name: freelancer.name || "N/A",
      email: freelancer.email || "N/A",
      mobile: freelancer.mobile || "N/A",
      address: freelancer.address || "N/A",
      status: freelancer.is_status || "unknown",
      isActive: freelancer.is_active === "1",
      isAccountActive: freelancer.is_active_acc === "1",
      registrationComplete: freelancer.is_regi_complete === "4",
      appliedDate: new Date(item.created_at).toLocaleDateString(),
      joinedDate: new Date(freelancer.created_at).toLocaleDateString(),
      lastUpdated: new Date(freelancer.updated_at).toLocaleDateString(),
      raw: item
    };
  };

  useEffect(() => {
    if (!isOpen || !jobData?.cuj_id) return;

    let mounted = true;
    const fetchApplicants = async () => {
      setLoading(true);
      setError(null);

      try {
        const encoded = btoa(String(jobData.cuj_id));
        const res = await adminApi.get(`/getJobsRequestList/${encoded}`);
        const list = res?.data?.job_re_list ?? [];

        if (!mounted) return;
        setApplicants(list.map(normalizeApplicant));
      } catch (err) {
        console.error("Failed to fetch applicants", err);
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || "Failed to load applicants");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchApplicants();
    return () => { mounted = false; };
  }, [isOpen, jobData]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFreelancer(null);
      setApplicants([]);
      setError(null);
    }
  }, [isOpen]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
      new: { bg: "bg-blue-100", text: "text-blue-800", icon: Clock },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
      rejected: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.new;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!isOpen) return null;

  const FreelancerDetailModal = ({ freelancer, onClose }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Freelancer Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <p className="font-medium">{freelancer.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Freelancer ID:</span>
                <p className="font-medium">#{freelancer.freelancerId}</p>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{freelancer.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Mobile:</span>
                <p className="font-medium">{freelancer.mobile}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Address:</span>
                <p className="font-medium">{freelancer.address}</p>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Account Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>
                <div className="mt-1">{getStatusBadge(freelancer.status)}</div>
              </div>
              <div>
                <span className="text-gray-500">Registration:</span>
                <p className="font-medium mt-1">
                  {freelancer.registrationComplete ? (
                    <span className="text-green-600">Complete</span>
                  ) : (
                    <span className="text-orange-600">Incomplete</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Account Active:</span>
                <p className="font-medium mt-1">
                  {freelancer.isAccountActive ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Profile Active:</span>
                <p className="font-medium mt-1">
                  {freelancer.isActive ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Applied:</span>
                <span className="font-medium">{freelancer.appliedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Joined Platform:</span>
                <span className="font-medium">{freelancer.joinedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated:</span>
                <span className="font-medium">{freelancer.lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Job Applications</h2>
              <p className="text-gray-600 mt-1">
                Job: {jobData?.cuj_title || `#${jobData?.cuj_id || "N/A"}`}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{applicants.length}</span> Total Applications
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading applications...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="text-red-600 mb-4">Error: {error}</div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Retry
                </button>
              </div>
            ) : applicants.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No applications found for this job.
              </div>
            ) : (
              <div className="overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Applicant</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Applied</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applicants.map((applicant) => (
                      <tr key={applicant.applicationId} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-gray-900">{applicant.name}</div>
                            <div className="text-sm text-gray-500">ID: #{applicant.freelancerId}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="truncate max-w-[150px]" title={applicant.email}>
                                {applicant.email}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{applicant.mobile}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="truncate max-w-[120px]" title={applicant.address}>
                              {applicant.address}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(applicant.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {applicant.appliedDate}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setSelectedFreelancer(applicant)}
                            className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

export default AdminFreelancerModal;