"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Briefcase,
  Calendar,
  Clock,
  Star,
  Eye,
  Search,
} from "lucide-react";
import { Base64 } from "js-base64";
import adminApi from "@/config/adminApi";

const FreelancerAssignedJobsModal = ({
  isOpen = true,
  onClose = () => {},
  freelancerId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // helper: map API status/fields to UI-friendly values
  const mapJob = (job) => ({
    id: job.cuj_id,
    title: job.cuj_title,
    customer: job.customer?.name ?? "Unknown",
    customerId: job.customer?.id ?? null,
    // map c uj_job_status (0 in example) to 'pending' else 'completed'
    status: job.cuj_job_status === 0 ? "pending" : "completed",
    assignedDate: job.created_at,
    deadline: job.updated_at,
    budget: job.cuj_salary_range_to ?? job.cuj_salary_range_from ?? "0",
    progress: job.cuj_is_active ? 50 : 0, // placeholder mapping
    description: job.cuj_desc ?? "",
    location: job.cuj_location ?? "Not Specified",
    jobType: job.cuj_job_type ?? "N/A",
  });

  useEffect(() => {
    if (!isOpen || !freelancerId) return;

    let mounted = true;
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        // API examples use base64 encoded id (e.g. Mg==) — encode to match
        const encoded = Base64.encode(String(freelancerId));
        const res = await adminApi.get(`/getJobsForFreelancer/${encoded}`);
        const list = res?.data?.job_list ?? [];

        if (!mounted) return;

        const jobs = list.map(mapJob);
        setAssignedJobs(jobs);

        // set basic freelancer info from response if available
        const first = list[0];
        if (first?.freelancer) {
          const fl = first.freelancer;
          setFreelancer({
            name: fl.name ?? "Freelancer",
            avatar: (fl.name ?? "F").split(" ").map((n) => n[0]).join(""),
            totalJobs: list.length,
            activeJobs: list.filter((j) => j.cuj_is_active === 1).length,
            rating: 4.5,
            joinDate: fl.created_at ?? null,
          });
        } else {
          // fallback minimal freelancer object so modal can render
          setFreelancer({
            name: "Freelancer",
            avatar: "F",
            totalJobs: list.length,
            activeJobs: list.filter((j) => j.cuj_is_active === 1).length,
            rating: 4.5,
            joinDate: null,
          });
        }
      } catch (err) {
        console.error("Failed to fetch assigned jobs", err);
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || "Failed to load jobs");
        setAssignedJobs([]);
        setFreelancer(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchJobs();

    return () => {
      mounted = false;
    };
  }, [isOpen, freelancerId]);

  const filteredJobs = assignedJobs.filter((job) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.customer.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = assignedJobs.reduce((sum, job) => {
    const v = parseInt(String(job.budget).replace(/[^\d]/g, "")) || 0;
    return sum + v;
  }, 0);

  const completedJobs = assignedJobs.filter((j) => j.status === "completed").length;
  const overdueJobs = assignedJobs.filter((j) => j.status === "overdue").length;

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {(freelancer && freelancer.avatar) || "F"}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {freelancer?.name ?? "Freelancer"}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Star size={14} className="text-yellow-400 fill-current mr-1" />
                  {freelancer?.rating ?? "—"}
                </div>
                <span>•</span>
                <span>{freelancer?.totalJobs ?? 0} total jobs</span>
                <span>•</span>
                <span>
                  Joined{" "}
                  {freelancer?.joinDate
                    ? new Date(freelancer.joinDate).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-5 gap-4 p-6 bg-gray-50">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mx-auto mb-2">
              <Briefcase size={20} className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{assignedJobs.length}</div>
            <div className="text-xs text-gray-500">Total Jobs</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2">
              <Clock size={20} className="text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{freelancer?.activeJobs ?? 0}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mx-auto mb-2">
              <Eye size={20} className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{completedJobs}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg mx-auto mb-2">
              <Calendar size={20} className="text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{overdueJobs}</div>
            <div className="text-xs text-gray-500">Overdue</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mx-auto mb-2">
              <span className="text-orange-600 text-xl font-bold">₹</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">₹{totalValue.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total Value</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Assigned Jobs ({filteredJobs.length})</h3>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading assigned jobs...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <div className="mb-3">Error: {error}</div>
              <button
                onClick={() => {
                  // quick retry
                  setError(null);
                  setAssignedJobs([]);
                  setFreelancer(null);
                  // trigger refetch by toggling freelancerId (simple way: call useEffect fetch directly)
                  (async () => {
                    try {
                      setLoading(true);
                      const encoded = Base64.encode(String(freelancerId));
                      const res = await adminApi.get(`/getJobsForFreelancer/${encoded}`);
                      const list = res?.data?.job_list ?? [];
                      setAssignedJobs(list.map(mapJob));
                      if (list[0]?.freelancer) {
                        const fl = list[0].freelancer;
                        setFreelancer({
                          name: fl.name,
                          avatar: fl.name.split(" ").map((n) => n[0]).join(""),
                          totalJobs: list.length,
                          activeJobs: list.filter((j) => j.cuj_is_active === 1).length,
                          rating: 4.5,
                          joinDate: fl.created_at,
                        });
                      }
                    } catch (err) {
                      setError(err?.message || "Retry failed");
                    } finally {
                      setLoading(false);
                    }
                  })();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Retry
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-500">No jobs match your current search criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {job.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{job.description}</p>

                      <div className="flex flex-wrap gap-4 items-center text-sm text-gray-500">
                        <div>
                          Customer:{" "}
                          <span className="font-medium text-gray-700">{job.customer}</span>
                        </div>

                        <div>
                          Location:{" "}
                          <span className="font-medium text-gray-700">{job.location}</span>
                        </div>

                        <div>
                          Deadline:{" "}
                          <span className="font-medium text-gray-700">
                            {job.deadline ? new Date(job.deadline).toLocaleDateString() : "—"}
                          </span>
                        </div>

                        <div>
                          Budget:{" "}
                          <span className="font-medium text-gray-700">
                            ₹{(parseInt(job.budget || 0) || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreelancerAssignedJobsModal;
