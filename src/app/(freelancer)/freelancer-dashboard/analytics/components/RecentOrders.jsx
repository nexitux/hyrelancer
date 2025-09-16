import { Filter } from "lucide-react";

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
      <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
        See all
      </button>
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
  // Define the table data
  const tableData = [
  {
    id: 1,
    name: "React Native E-commerce App",
    variants: "3 Bids",
    category: "Mobile Development",
    price: "₹75,000",
    status: "In Progress",
    imageColor: "#8b5cf6"
  },
  {
    id: 2,
    name: "Website Redesign (Startup)",
    variants: "5 Bids",
    category: "Web Development",
    price: "₹40,000",
    status: "Pending Payment",
    imageColor: "#ef4444"
  },
  {
    id: 3,
    name: "SEO Optimization — 6 Months",
    variants: "2 Bids",
    category: "Digital Marketing",
    price: "₹18,500",
    status: "Completed",
    imageColor: "#64748b"
  },
  {
    id: 4,
    name: "Landing Page → Conversion",
    variants: "1 Bid",
    category: "UI/UX Design",
    price: "₹8,500",
    status: "Canceled",
    imageColor: "#374151"
  },
  {
    id: 5,
    name: "Monthly Maintenance Retainer",
    variants: "0 Bids",
    category: "DevOps",
    price: "₹25,000",
    status: "Active",
    imageColor: "#d1d5db"
  }
];


  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <TableHeaderSection title="Recent Orders" />
      
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Products
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Category
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Price
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
            {tableData.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="py-3">
                  <ProductCell product={product} />
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {product.category}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {product.price}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  <StatusBadge status={product.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}