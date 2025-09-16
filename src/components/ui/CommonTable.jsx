"use client";
import { useState } from 'react';
import { ChevronDown, Search, Eye, Edit3, Trash2, } from 'lucide-react';

const CommonTable = ({
    data,
    columns,
    title,
    searchPlaceholder = "Search by keyword",
    itemsPerPage = 5,
    actions = ["view", "edit", "delete"], // default: all 3
    onActionClick = () => {},
  ...props
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter data based on search term
    const filteredData = data.filter(item =>
        Object.values(item).some(value =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Sort data
    const sortedData = [...filteredData].sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'title') {
            return a.title.localeCompare(b.title);
        } else if (sortBy === 'cost') {
            const getCostValue = (cost) => {
                const match = cost.match(/\$(\d+)/);
                return match ? parseInt(match[1]) : 0;
            };
            return getCostValue(a.cost) - getCostValue(b.cost);
        }
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

    const getStatusStyle = (status) => {
        switch (status.toLowerCase()) {
            case 'submitted':
                return 'bg-blue-100 text-blue-800';
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{title}</h1>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 sm:py-2.5 pr-8 text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 w-full sm:w-auto"
                            >
                                <option>Sort By (Default)</option>
                                <option>Name A-Z</option>
                                <option>Name Z-A</option>
                                <option>Most Jobs</option>
                                <option>Least Jobs</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-2.5 sm:top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {columns.map((column, index) => (
                                        <th
                                            key={index}
                                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {column}
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 mb-1">
                                                    {item.title}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <span className="flex items-center mr-4">
                                                        <div className="w-4 h-4 mr-2 flex-shrink-0">
                                                            {item.companyIcon}
                                                        </div>
                                                        {item.company}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                        </svg>
                                                        {item.location}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.cost}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            <div className="flex space-x-3">
                                                {actions.includes("view") && (
                                                    <button
                                                        onClick={() => onActionClick("view", item)}
                                                        className="hover:text-blue-600 transition-colors"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                )}
                                                {actions.includes("edit") && (
                                                    <button 
                                                        onClick={() => onActionClick("edit", item)}
                                                        className="hover:text-green-600 transition-colors"
                                                    >
                                                        <Edit3 className="h-5 w-5" />
                                                    </button>
                                                )}
                                                {actions.includes("delete") && (
                                                    <button 
                                                        onClick={() => onActionClick("delete", item)}
                                                        className="hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                    {paginatedData.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2 leading-5">
                                        {item.title}
                                    </h3>
                                    <div className="space-y-1">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <div className="w-4 h-4 mr-2 flex-shrink-0">
                                                {item.companyIcon}
                                            </div>
                                            <span className="truncate">{item.company}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="truncate">{item.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end ml-4">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(item.status)} mb-2`}>
                                        {item.status}
                                    </span>
                                    <div className="flex space-x-1">
                                        {actions.includes("view") && (
                                            <button
                                                onClick={() => onActionClick("view", item)}
                                                className="p-1 hover:text-blue-600 transition-colors"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        )}
                                        {actions.includes("edit") && (
                                            <button 
                                                onClick={() => onActionClick("edit", item)}
                                                className="p-1 hover:text-green-600 transition-colors"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                        )}
                                        {actions.includes("delete") && (
                                            <button 
                                                onClick={() => onActionClick("delete", item)}
                                                className="p-1 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Card Details */}
                            <div className="border-t border-gray-100 pt-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                            {columns[1]}
                                        </dt>
                                        <dd className="text-sm text-gray-900">{item.date}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                            {columns[2]}
                                        </dt>
                                        <dd className="text-sm text-gray-900 font-medium">{item.cost}</dd>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
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
                                        <span className="font-medium">
                                            {Math.min(startIndex + itemsPerPage, sortedData.length)}
                                        </span>{' '}
                                        of <span className="font-medium">{sortedData.length}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => handlePageChange(i + 1)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommonTable;