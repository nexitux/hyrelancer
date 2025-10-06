"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Edit, Trash2, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle } from 'lucide-react';
import api from '../../../../config/api';
import JobModal from './components/JobDetailsModal';
import { setSelectedJobId, setSelectedJobData } from '../../../../redux/slices/jobSlice';

const ServiceOrders = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // "success" or "error"
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { orderId, action, newStatus }

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showConfirmModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showConfirmModal]);

  useEffect(() => {
    let isMounted = true;
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch site data (categories, subcategories, services) and jobs in parallel
        const [siteDataRes, jobsRes] = await Promise.all([
          api.get('/getSiteData'),
          api.get('/getJob')
        ]);

        const siteData = siteDataRes?.data || {};
        const scList = Array.isArray(siteData.sc_list) ? siteData.sc_list : [];
        const seList = Array.isArray(siteData.se_list) ? siteData.se_list : [];

        // Build lookup maps
        const categoryIdToName = {};
        const subCategoryIdToName = {};
        scList.forEach((sc) => {
          if (sc?.get_ca_data?.ca_id != null && sc?.get_ca_data?.ca_name) {
            categoryIdToName[sc.get_ca_data.ca_id] = sc.get_ca_data.ca_name;
          }
          if (sc?.sc_id != null && sc?.sc_name) {
            subCategoryIdToName[sc.sc_id] = sc.sc_name;
          }
        });

        const serviceIdToName = {};
        seList.forEach((se) => {
          if (se?.se_id != null && se?.se_name) {
            serviceIdToName[se.se_id] = se.se_name;
          }
        });

        const raw = jobsRes?.data;
        console.log('getJob raw response:', raw);
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.jobs)
              ? raw.jobs
              : Array.isArray(raw?.job_list)
                ? raw.job_list
                : raw?.job_list
                  ? [raw.job_list]
                  : [];

        // Sort latest first by updated_at or created_at
        const sorted = [...list].sort((a, b) => {
          const aDate = new Date(a?.updated_at || a?.created_at || 0).getTime();
          const bDate = new Date(b?.updated_at || b?.created_at || 0).getTime();
          return bDate - aDate;
        });

        const mapped = sorted.map((job, index) => {
          const updated = job.updated_at || job.created_at;
          const postedOn = updated
            ? new Date(updated).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : '';
            
          // Check active status
          let isActive = false;
          if (typeof job.cuj_is_active !== 'undefined') {
            isActive = Number(job.cuj_is_active) === 1;
          } 
          
          const status = isActive ? 'Active' : 'Inactive';

          const subCategoryName = job.subcategory_name || job.sc_name || subCategoryIdToName[job.cuj_sc_id] || '—';
          const serviceName = job.service_name || job.service || job.job_type || serviceIdToName[job.cuj_se_id] || '—';

          // Get job status based on cuj_is_assigned only
          let jobStatus = 'Not Assigned';
          if (job.cuj_is_assigned === 1) {
            jobStatus = 'Assigned';
          }

          // Format salary range
          const salaryFrom = job.cuj_salary_range_from ? `₹${Number(job.cuj_salary_range_from).toLocaleString()}` : '—';
          const salaryTo = job.cuj_salary_range_to ? `₹${Number(job.cuj_salary_range_to).toLocaleString()}` : '—';
          const salaryRange = salaryFrom !== '—' && salaryTo !== '—' ? `${salaryFrom} - ${salaryTo}` : '—';

          return {
            id: job.cuj_id ?? job.id ?? index + 1,
            title: job.cuj_title || 'Untitled Job',
            category: subCategoryName,
            service: serviceName,
            location: job.cuj_location || 'Not specified',
            jobType: job.cuj_job_type || '—',
            workMode: job.cuj_work_mode || '—',
            experience: job.cuj_u_experience || '—',
            salaryRange,
            postedOn,
            status,
            jobStatus,
            statusColor: getStatusColor(status),
            jobStatusColor: getJobStatusColor(jobStatus),
            raw: job
          };
        });

        if (isMounted) {
          setOrders(mapped);
        }
      } catch (e) {
        if (isMounted) setError(e?.response?.data?.message || 'Failed to load jobs');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchJobs();
    return () => { isMounted = false; };
  }, []);

  const [openDropdownId, setOpenDropdownId] = useState(null);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(orders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = useMemo(() => orders.slice(startIndex, endIndex), [orders, startIndex, endIndex]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setOpenDropdownId(null); // Close any open dropdowns when changing pages
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobStatusColor = (jobStatus) => {
    switch (jobStatus) {
      case 'Assigned':
        return 'bg-green-100 text-green-800';
      case 'Not Assigned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteOrder = (orderId) => {
    const job = orders.find(o => o.id === orderId);
    if (!job) return;

    // Determine the new active status based on current status
    const newStatus = job.status === 'Active' ? 'Inactive' : 'Active';
    const action = newStatus === 'Active' ? 'activate' : 'deactivate';

    // Show confirmation modal
    setPendingAction({ orderId, action, newStatus });
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    try {
      const { orderId, newStatus } = pendingAction;
      const job = orders.find(o => o.id === orderId);
      if (!job) return;

      const newIsActive = newStatus === 'Active' ? 1 : 0;
      const jobId = job.raw.cuj_id || job.raw.id;
      const encodedJobId = btoa(jobId.toString()); // Base64 encode the job ID
      
      console.log('Updating job:', jobId, 'encoded as:', encodedJobId, 'active status:', newIsActive);

      // Call API to update job active status using GET method
      const response = await api.get(`/inactiveJob/${encodedJobId}?cuj_is_active=${newIsActive}`);

      console.log('API Response:', response?.data);

      // Update local state immediately regardless of response structure
      // The API call succeeded if we got here without an error
      setOrders(prevOrders => 
        prevOrders.map(order =>
          order.id === orderId
            ? { 
                ...order, 
                status: newStatus, 
                statusColor: getStatusColor(newStatus),
                raw: { ...order.raw, cuj_is_active: newIsActive }
              }
            : order
        )
      );

      // Show success message
      const actionText = newStatus === 'Active' ? 'activated' : 'deactivated';
      setToastType("success");
      setToastMessage(`Job ${actionText} successfully`);
      setTimeout(() => setToastMessage(""), 3000);
      console.log(`Job ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating job status:', error);
      console.error('Error details:', error.response?.data);
      
      // Show error message
      setToastType("error");
      setToastMessage(`Failed to update job status: ${error.message}`);
      setTimeout(() => setToastMessage(""), 5000);
    } finally {
      // Close modal and reset pending action
      setShowConfirmModal(false);
      setPendingAction(null);
    }
  };

  const cancelAction = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const handleEditOrder = (orderId) => {
    const job = orders.find(o => o.id === orderId);
    if (job) {
      const jobId = job.raw?.cuj_id || job.raw?.id || job.id;
      if (jobId) {
        // Store job ID and data in Redux state
        dispatch(setSelectedJobId(jobId));
        dispatch(setSelectedJobData(job));
        // Navigate to edit page without ID in URL
        router.push('/customer-dashboard/job-list/edit');
      }
    }
  };

  const handleViewOrder = (orderId) => {
    const job = orders.find(o => o.id === orderId);
    setSelectedJob(job || null);
    setIsModalOpen(Boolean(job));
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <div className="w-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Posted Jobs</h1>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm w-full overflow-hidden">
          <div className="overflow-x-auto w-full" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[250px]">
                    Job Title
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                    Category
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                    Salary Range
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                    Job Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                    Posted On
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading jobs...</td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-red-600">{error}</td>
                  </tr>
                )}
                {!loading && !error && currentOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No jobs found</td>
                  </tr>
                )}
                {!loading && !error && currentOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1 truncate max-w-[200px]" title={order.title}>
                            {order.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.jobType} • {order.workMode}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        <p className="font-medium">{order.category}</p>
                        <p className="text-xs text-gray-500">{order.service}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <span className="font-medium">{order.salaryRange}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.jobStatusColor}`}>
                        {order.jobStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {order.postedOn}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewOrder(order.id)}
                          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                          title="View"
                          aria-label="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order.id)}
                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className={`p-1.5 rounded-md border transition-colors ${
                            order.status === 'Active'
                              ? 'text-red-600 border-red-200 hover:bg-red-50'
                              : 'text-green-600 border-green-200 hover:bg-green-50'
                          }`}
                          title={order.status === 'Active' ? 'Deactivate Job' : 'Activate Job'}
                          aria-label={order.status === 'Active' ? 'Deactivate Job' : 'Activate Job'}
                        >
                          {order.status === 'Active' ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {currentOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 mb-1 truncate" title={order.title}>
                    {order.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <span>{order.category} • {order.service}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{order.jobType} • {order.workMode}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.jobStatusColor}`}>
                    {order.jobStatus}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="text-gray-900 text-right max-w-[200px] truncate" title={order.location}>
                    {order.location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Salary Range:</span>
                  <span className="text-gray-900 font-medium">{order.salaryRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Posted On:</span>
                  <span className="text-gray-900">{order.postedOn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Experience:</span>
                  <span className="text-gray-900">{order.experience}</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleViewOrder(order.id)}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                  title="View"
                  aria-label="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditOrder(order.id)}
                  className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                  title="Edit"
                  aria-label="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  className={`p-1.5 rounded-md border transition-colors ${
                    order.status === 'Active'
                      ? 'text-red-600 border-red-200 hover:bg-red-50'
                      : 'text-green-600 border-green-200 hover:bg-green-50'
                  }`}
                  title={order.status === 'Active' ? 'Deactivate Job' : 'Activate Job'}
                  aria-label={order.status === 'Active' ? 'Deactivate Job' : 'Activate Job'}
                >
                  {order.status === 'Active' ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-6 bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, orders.length)}</span> of{' '}
                <span className="font-medium">{orders.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Job Details Modal */}
        <JobModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          job={selectedJob} 
        />

        {/* Confirmation Modal */}
        {showConfirmModal && pendingAction && (
          <div className="fixed inset-0 flex items-center justify-center z-[70] backdrop-blur-[1px]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg border">
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-full mr-3 ${
                  pendingAction.action === 'activate' 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  {pendingAction.action === 'activate' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {pendingAction.action === 'activate' ? 'Activate Job' : 'Deactivate Job'}
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to {pendingAction.action} this job? 
                {pendingAction.action === 'activate' 
                  ? ' This will make the job visible to job seekers.' 
                  : ' This will hide the job from job seekers.'
                }
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelAction}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    pendingAction.action === 'activate'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {pendingAction.action === 'activate' ? 'Activate' : 'Deactivate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[60]">
          <div className={`flex items-center gap-2 rounded-xl border shadow-md px-4 py-2 text-sm ${
            toastType === 'success' 
              ? 'border-green-200 bg-green-50 text-green-800' 
              : 'border-red-200 bg-red-50 text-red-800'
          }`}>
            {toastType === 'success' ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            )}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceOrders;