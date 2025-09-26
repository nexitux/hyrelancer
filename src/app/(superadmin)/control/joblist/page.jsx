"use client";

import React, { useState, useEffect } from "react";
import {
  MdAdd,
  MdEdit,
  MdVisibility,
  MdDelete,
  MdSearch,
  MdCheckCircle,
  MdCancel,
  MdWork,
  MdGroup,
  MdRestore,
} from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Base64 } from "js-base64";
import adminApi from "@/config/adminApi";
import JobDetailModal from "./components/JobDetailModal";
import EditJobModal from "./components/EditJobModal";
import FreelancerListingModal from "./components/FreelancerListingModal";

const JobListingPage = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoadingJobDetail, setIsLoadingJobDetail] = useState(false);
  const [isFreelancerModalOpen, setIsFreelancerModalOpen] = useState(false);
const [selectedJobForFreelancers, setSelectedJobForFreelancers] = useState(null);

  const encodeId = (id) => Base64.encode(String(id));

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.get("/getJobsList");
      setJobs(response.data.job_list || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map((job) => job.cuj_id));
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    // Only allow approve when job is in Pending state (cuj_is_rejected === 0 && cuj_is_active === 1).
    // currentStatus is job.cuj_is_active (1 for pending/active), we still confirm with user before approving.
    if (!confirm("Are you sure you want to approve this job?")) return;

    try {
      // backend expects base64 encoded id
      const res = await adminApi.get(`/approveJobByAdmin/${encodeId(jobId)}`);

      // Update local state: set cuj_is_rejected = 1 and cuj_is_active = 1 (Approved / Active)
      setJobs((prev) =>
        prev.map((j) =>
          j.cuj_id === jobId
            ? {
                ...j,
                cuj_is_rejected: 1,
                cuj_is_active: 1,
                updated_at: new Date().toISOString(),
              }
            : j
        )
      );

      // optional feedback
      alert(res?.data?.message || "Job approved.");
    } catch (err) {
      console.error("Approve failed", err);
      alert(err?.response?.data?.message || "Approve failed");
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      // backend expects base64 encoded id (deleteJobByAdmin/{id})
      const res = await adminApi.delete(`/deleteJobByAdmin/${encodeId(jobId)}`);

      // Update local state to reflect soft-delete (cuj_is_rejected = 0, cuj_is_active = 0)
      setJobs((prev) =>
        prev.map((j) =>
          j.cuj_id === jobId
            ? {
                ...j,
                cuj_is_rejected: 0,
                cuj_is_active: 0,
                deleted_at: new Date().toISOString(),
              }
            : j
        )
      );

      // remove selection if it was selected
      setSelectedJobs((prev) => prev.filter((id) => id !== jobId));

      // optional feedback from API
      alert(res?.data?.message || "Job deleted.");
    } catch (err) {
      console.error("Delete failed", err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  // Restore when job is in the "both 0" state (cuj_is_rejected === 0 && cuj_is_active === 0)
  const handleRestore = async (jobId) => {
    if (!confirm("Are you sure you want to restore this job?")) return;
    try {
      // call restore API (adjust endpoint/body to match backend)
      await adminApi.post("/restoreJob", { id: jobId });
      setJobs((prev) =>
        prev.map((j) =>
          j.cuj_id === jobId
            ? { ...j, cuj_is_active: 1, cuj_is_rejected: 0 }
            : j
        )
      );
    } catch (err) {
      console.error("Restore failed", err);
      alert("Restore failed");
    }
  };

  // Open edit modal for a given job (pass the whole job object)
  const openEditModal = (job) => {
    setJobToEdit(job);
    setIsEditOpen(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditOpen(false);
    setJobToEdit(null);
  };

  // Called when EditJobModal successfully saves — update local jobs list
  // Called when EditJobModal successfully saves — update local jobs list
  const handleSaveFromEdit = (updatedPayload) => {
    // Try to extract updated job object from modal response
    const updatedJob =
      updatedPayload?.job_data || updatedPayload?.data || updatedPayload;

    // If backend didn't return the updated job, refresh list and close modal
    if (!updatedJob || !updatedJob.cuj_id) {
      fetchJobs();
      closeEditModal();
      return;
    }

    // Normalize IDs to strings when comparing so numeric/string mismatch won't fail
    setJobs((prev) =>
      prev.map((j) =>
        String(j.cuj_id) === String(updatedJob.cuj_id)
          ? { ...j, ...updatedJob }
          : j
      )
    );

    closeEditModal();
  };

  const handleViewJob = async (jobId) => {
    try {
      setIsLoadingJobDetail(true);
      const response = await adminApi.get(`/getJobData/${encodeId(jobId)}`);
      setSelectedJob(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching job details:", error);
      alert("Error loading job details. Please try again.");
    } finally {
      setIsLoadingJobDetail(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const openFreelancerModal = (job) => {
  setSelectedJobForFreelancers(job);
  setIsFreelancerModalOpen(true);
};

const closeFreelancerModal = () => {
  setIsFreelancerModalOpen(false);
  setSelectedJobForFreelancers(null);
};

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (job) => {
    let status = "Unknown";
    if (job.cuj_is_rejected === 1 && job.cuj_is_active === 1) {
      status = "Active";
    } else if (job.cuj_is_rejected === 0 && job.cuj_is_active === 1) {
      status = "Pending";
    } else if (job.cuj_is_rejected === 0 && job.cuj_is_active === 0) {
      status = "Deleted";
    } else {
      status = "Unknown"; // fallback
    }

    switch (status) {
      case "Active":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
            Active
          </span>
        );
      case "Pending":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
            Pending
          </span>
        );
      case "Deleted":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
            Deleted
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
            Unknown
          </span>
        );
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.cuj_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.cuj_desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job_category?.sc_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      job.job_service?.se_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      job.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => {
    let status = "Unknown";
    if (job.cuj_is_rejected === 1 && job.cuj_is_active === 1) {
      status = "Active";
    }
    return status === "Active";
  }).length;
  const rejectedJobs = jobs.filter((job) => {
    let status = "Unknown";
    if (job.cuj_is_rejected === 0 && job.cuj_is_active === 1) {
      status = "Pending";
    }
    return status === "Pending";
  }).length;

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex justify-center items-center">
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen flex justify-center items-center text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Jobs Management
            </h1>
            <p className="mt-1 text-slate-600">
              Manage and organize all job listings
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <MdSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search jobs, categories, or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        {/* Total Jobs */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Total Jobs</p>
              <p className="text-2xl font-bold text-slate-800">{totalJobs}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-lg">
              <MdWork className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Active Jobs</p>
              <p className="text-2xl font-bold text-green-600">{activeJobs}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-green-100 rounded-lg">
              <MdCheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        {/* Rejected Jobs */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Pending Approve</p>
              <p className="text-2xl font-bold text-red-600">{rejectedJobs}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-red-100 rounded-lg">
              <MdCancel className="text-red-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden bg-white rounded-xl border shadow-sm border-slate-200">
        {/* Table Header Actions */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <div className="flex gap-4 items-center">
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={
                  selectedJobs.length === filteredJobs.length &&
                  filteredJobs.length > 0
                }
                onChange={handleSelectAll}
                className="text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">
                {selectedJobs.length > 0
                  ? `${selectedJobs.length} selected`
                  : "Select all"}
              </span>
            </label>
          </div>

          {selectedJobs.length > 0 && (
            <div className="flex gap-2 items-center">
              <button className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-slate-50 border-slate-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">
                  Job
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">
                  Category
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">
                  Customer
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">
                  Created
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-right text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <tr
                    key={job.cuj_id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.cuj_id)}
                          onChange={() => handleSelectJob(job.cuj_id)}
                          className="text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-slate-800">
                            {job.cuj_title}
                          </p>
                          <p className="text-sm text-slate-500">
                            ID: {job.cuj_id}
                          </p>
                          <div className="text-sm text-slate-500">
                            {job.cuj_work_mode} • {job.cuj_job_type} •{" "}
                            {job.cuj_u_experience}
                          </div>
                          {job.cuj_location && (
                            <div className="text-sm text-slate-500">
                              {" "}
                              {job.cuj_location}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {job.job_category?.sc_name || "N/A"}
                        </span>
                        <div className="text-sm text-slate-500 mt-1">
                          {job.job_service?.se_name || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-slate-800">
                          {job.customer?.name || "N/A"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {job.customer?.email || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(job)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-800">
                        {formatDate(job.created_at)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {/** compute simple flags for clarity */}
                      {(() => {
                        const isSoftDeleted =
                          job.cuj_is_rejected === 0 && job.cuj_is_active === 0; // both 0 => show Restore and disable others
                        const activeButtonEnabled =
                          job.cuj_is_rejected === 0 && job.cuj_is_active === 1; // enable Active only for this condition
                        // when isSoftDeleted === true, disable view/edit/freelancers and show Restore button instead of Delete

                        return (
                          <div className="flex gap-2 justify-end items-center">
                            {/* View */}
                            <button
                              onClick={() =>
                                !isSoftDeleted && handleViewJob(job.cuj_id)
                              }
                              disabled={isSoftDeleted || isLoadingJobDetail}
                              className={`p-2 rounded-lg transition-colors ${
                                isSoftDeleted
                                  ? "text-slate-300 cursor-not-allowed"
                                  : "text-blue-600 hover:bg-blue-50"
                              } ${isLoadingJobDetail ? "opacity-50" : ""}`}
                              title="View"
                            >
                              {isLoadingJobDetail ? (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <MdVisibility size={16} />
                              )}
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => openEditModal(job)}
                              disabled={isSoftDeleted}
                              title="Edit"
                              aria-disabled={isSoftDeleted}
                              className={`p-2 rounded-lg transition-colors ${
                                isSoftDeleted
                                  ? "text-slate-300 cursor-not-allowed"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <MdEdit size={16} />
                            </button>

                            {/* Active button — always shown, enabled only for the specific condition */}
                            <button
                              className={`p-2 rounded-lg transition-colors ${
                                activeButtonEnabled
                                  ? "text-green-600 hover:bg-green-50"
                                  : "text-slate-300 cursor-not-allowed"
                              }`}
                              title="Active"
                              onClick={() =>
                                activeButtonEnabled &&
                                handleToggleStatus(
                                  job.cuj_id,
                                  job.cuj_is_active
                                )
                              }
                              disabled={!activeButtonEnabled}
                              aria-pressed={activeButtonEnabled}
                            >
                              <MdCheckCircle size={16} />
                            </button>

                            {/* Freelancers list */}
                            <button
  onClick={() => !isSoftDeleted && openFreelancerModal(job)}
  disabled={isSoftDeleted}
  className={`p-2 rounded-lg transition-colors ${
    isSoftDeleted
      ? "text-slate-300 cursor-not-allowed"
      : "text-purple-600 hover:bg-purple-50"
  }`}
  title="List Freelancers"
>
  <MdGroup size={16} />
</button>

                            {/* Delete OR Restore */}
                            {isSoftDeleted ? (
                              <button
                                className="p-2 text-indigo-600 rounded-lg transition-colors hover:bg-indigo-50"
                                title="Restore"
                                onClick={() => handleRestore(job.cuj_id)}
                              >
                                <MdRestore size={16} />
                              </button>
                            ) : (
                              <button
                                className="p-2 text-red-600 rounded-lg transition-colors hover:bg-red-50"
                                title="Delete"
                                onClick={() => handleDelete(job.cuj_id)}
                              >
                                <MdDelete size={16} />
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full bg-slate-100">
                      <MdSearch className="text-slate-400" size={24} />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-slate-800">
                      No jobs found
                    </h3>
                    <p className="text-slate-600">
                      Try adjusting your search criteria or add a new job.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredJobs.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {filteredJobs.length} of {jobs.length} jobs
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
      <JobDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        jobData={selectedJob}
      />
      <EditJobModal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        jobData={jobToEdit ? { job_data: jobToEdit } : null} // keep the shape your modal expects
        onSave={handleSaveFromEdit}
      />
      <FreelancerListingModal
  isOpen={isFreelancerModalOpen}
  onClose={closeFreelancerModal}
  jobData={selectedJobForFreelancers}
/>
    </div>
  );
};

export default JobListingPage;
