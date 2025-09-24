"use client";
import { useState, useEffect } from "react";
import CommonTable from "@/components/ui/CommonTable";
import JobModal from "./components/JobModal";
import api from "@/config/api";

const MyApplied = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [appliedData, setAppliedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch applied jobs from API
  const fetchAppliedJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/getAppliedJobs');
      const data = response?.data || {};

      const list = Array.isArray(data?.job_App_list) ? data.job_App_list : [];

      // Transform API data to match your table structure
      const transformedData = list.map((job, index) => {
        // Create company icon from first letter of user name or title
        const firstLetter = (job.name || job.cuj_title || 'U').charAt(0).toUpperCase();
        const colors = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-red-600', 'bg-yellow-600', 'bg-indigo-600', 'bg-pink-600'];
        const colorClass = colors[index % colors.length];

        // Format status based on new condition
        let status = 'Unknown';
        if (job.cuj_is_rejected === 1 && job.cuj_is_active === 1) {
          status = 'Active';
        } else if (job.cuj_is_rejected === 0 && job.cuj_is_active === 1) {
          status = 'Rejected';
        } else if (job.cuj_is_rejected === 0 && job.cuj_is_active === 0) {
          status = 'Deleted';
        } else {
          status = 'Unknown'; // fallback
        }

        // Format date
        const formatDate = (dateString) => {
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
        };

        // Format salary range
        const formatSalary = () => {
          const from = job.cuj_salary_range_from || '0';
          const to = job.cuj_salary_range_to || '0';
          return `$${from}-$${to} /month`;
        };

        return {
          id: job.cuj_id,
          title: job.cuj_title || 'Untitled Job',
          company: job.name || 'Unknown Company',
          location: job.cuj_location || 'Remote',
          date: formatDate(job?.created_at || new Date().toISOString()),
          cost: formatSalary(),
          status: status,
          jobType: job.cuj_job_type || 'Full-Time',
          workMode: job.cuj_work_mode || 'Remote',
          experience: job.cuj_u_experience || 'Not specified',
          description: job.cuj_desc || '',
          languages: job.cuj_lang || '',
          contactEmail: job.email || '',
          contactMobile: job.mobile || '',
          image: job.cuj_img1 || null,
          companyIcon: (
            <div className={`w-4 h-4 ${colorClass} rounded flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{firstLetter}</span>
            </div>
          )
        };
      });

      setAppliedData(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
      setError('Failed to fetch applied jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  const handleAction = (action, rowData) => {
    if (action === "view") {
      setSelectedRow(rowData);
      setIsModalOpen(true);
    }
    if (action === "delete") {
      // Implement delete functionality if needed
      console.log("Delete clicked", rowData);
      // You can add API call to delete the job application
      // deleteJobApplication(rowData.id);
    }
  };

  // Function to delete job application (optional)
  const deleteJobApplication = async (jobId) => {
    try {
      // Implement delete API call here
      const response = await fetch(`https://test.hyrelancer.in/api/deleteAppliedJob/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers if required
        },
      });

      if (response.ok) {
        // Remove from local state
        setAppliedData(prev => prev.filter(job => job.id !== jobId));
      }
    } catch (err) {
      console.error('Error deleting job application:', err);
    }
  };

  const columns = ["Title", "Date Applied", "Cost/Time", "Status"];

  // Loading component
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchAppliedJobs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state component
  if (appliedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applied Jobs</h3>
        <p className="text-gray-600 mb-4">You haven't applied to any jobs yet.</p>
      </div>
    );
  }

  return (
    <>
      <CommonTable
        data={appliedData}
        columns={columns}
        title="My Applied"
        searchPlaceholder="Search by keyword"
        itemsPerPage={5}
        actions={["view", "delete"]}
        onActionClick={handleAction}
      />

      {isModalOpen && (
        <JobModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedJob={selectedRow}
        />
      )}
    </>
  );
};

export default MyApplied;