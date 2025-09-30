import { Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { freelancerJobAPI } from "@/config/api";
import { freelancerDashboardService } from '@/services/freelancerDashboardService';
import Link from "next/link";

// Badge component with different color variants
const Badge = ({ color, size = "md", children }) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full";
  
  const sizeVariants = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1.5 text-sm",
    lg: "px-3 py-2 text-base"
  };
  
  const colorVariants = {
    success: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    error: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
  };

  return (
    <span className={`${baseClasses} ${sizeVariants[size]} ${colorVariants[color] || colorVariants.info}`}>
      {children}
    </span>
  );
};

// Table components
const Table = ({ children, className = "" }) => {
  return (
    <table className={`w-full text-left ${className}`}>
      {children}
    </table>
  );
};

const TableHeader = ({ children, className = "" }) => {
  return (
    <thead className={className}>
      {children}
    </thead>
  );
};

const TableBody = ({ children, className = "" }) => {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className = "" }) => {
  return (
    <tr className={className}>
      {children}
    </tr>
  );
};

const TableCell = ({ children, className = "", isHeader = false }) => {
  const Component = isHeader ? "th" : "td";
  return (
    <Component className={`px-0 ${className}`}>
      {children}
    </Component>
  );
};

// Product image component (using placeholder colored divs)
const ProductImage = ({ name, color = "#6366f1" }) => {
  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2);
  };

  return (
    <div 
      className="h-[50px] w-[50px] rounded-md flex items-center justify-center text-white text-sm font-medium"
      style={{ backgroundColor: color }}
    >
      {getInitials(name)}
    </div>
  );
};

// Product cell component
const ProductCell = ({ product }) => {
  return (
    <div className="flex items-center gap-3">
      <ProductImage name={product.name} color={product.imageColor} />
      <div>
        <p className="font-medium text-gray-800 text-sm dark:text-white/90">
          {product.name}
        </p>
        <span className="text-gray-500 text-xs dark:text-gray-400">
          {product.variants}
        </span>
      </div>
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "success";
      case "Pending": return "warning";
      case "Canceled": return "error";
      default: return "info";
    }
  };

  return (
    <Badge size="sm" color={getStatusColor(status)}>
      {status}
    </Badge>
  );
};

// Action buttons component
const ActionButtons = () => {
  return (
    <div className="flex items-center gap-3">
      <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
        <Filter className="w-4 h-4" />
        Filter
      </button>
      <Link href="/freelancer-dashboard/active-works">
        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
          See all
        </button>
      </Link>
    </div>
  );
};

// Table header component
const TableHeaderSection = ({ title }) => {
  return (
    <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
      </div>
      <ActionButtons />
    </div>
  );
};

// Main RecentOrders component
export default function RecentOrders() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch active job list from API
  const fetchActiveJobList = async () => {
    try {
      setLoading(true);
      const data = await freelancerDashboardService.getFreelancerDashboard();
      
      const list = Array.isArray(data?.$active_job_list) ? data.$active_job_list : [];
      
      // Transform API data to match the table structure
      const transformedData = list.slice(0, 5).map((job, index) => {
        // Create color for each job
        const colors = ["#8b5cf6", "#ef4444", "#64748b", "#374151", "#d1d5db"];
        const colorClass = colors[index % colors.length];

        // Format date
        const formatDate = (dateString) => {
          if (!dateString) return 'Recent';
          const date = new Date(dateString);
          const now = new Date();
          const diffTime = Math.abs(now - date);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0) return 'Today';
          if (diffDays === 1) return 'Yesterday';
          return `${diffDays} days ago`;
        };

        // Format salary range
        const formatSalary = () => {
          const from = job.cuj_salary_range_from || '0';
          const to = job.cuj_salary_range_to || '0';
          return from === to ? `₹${from}` : `₹${from} - ₹${to}`;
        };

        // Format status based on job status
        const formatStatus = () => {
          switch (job.cuj_job_status) {
            case 'completed':
              return 'Completed';
            case 'in_progress':
              return 'In Progress';
            case 'pending':
              return 'Pending';
            case 'rejected':
              return 'Rejected';
            default:
              return 'Active';
          }
        };

        return {
          id: job.cuj_id,
          name: job.cuj_title || 'Untitled Job',
          variants: `${formatDate(job.created_at)}`,
          category: job.cuj_job_type || 'General',
          price: formatSalary(),
          status: formatStatus(),
          imageColor: colorClass
        };
      });

      setTableData(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching active job list:', err);
      setError('Failed to load active jobs');
      // Fallback to sample data
      setTableData([
        {
          id: 1,
          name: "Software Developers",
          variants: "4 days ago",
          category: "Full-Time",
          price: "₹30,000 - ₹39,000",
          status: "Completed",
          imageColor: "#8b5cf6"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchActiveJobList();
  }, []);


  // Loading component
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <TableHeaderSection title="Active Jobs" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <TableHeaderSection title="Active Jobs" />
      
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Job Title
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Created Date
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Budget
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-[50px] w-[50px] rounded-md flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: application.imageColor }}
                    >
                      {application.name.split(' ').map(word => word[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm dark:text-white/90">
                        {application.name}
                      </p>
                      <span className="text-gray-500 text-xs dark:text-gray-400">
                        {application.category}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {application.variants}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {application.price}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  <StatusBadge status={application.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}