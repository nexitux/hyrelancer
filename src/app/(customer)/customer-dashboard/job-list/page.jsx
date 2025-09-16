"use client";
import { useState } from 'react';
import { Eye, Check, X, Trash2, MapPin, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const ServiceOrders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([
    {
      id: 1,
      title: 'UI/UX Sales Page Design for Natural Skincare Brand',
      company: 'PrimeEdge Solutions',
      location: 'Las Vegas, USA',
      date: 'Mar 12, 2024',
      pricing: '$410',
      status: 'Hired',
      statusColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 2,
      title: 'High-quality video editing for your marketing campaign',
      company: 'Bright Future',
      location: 'Las Vegas, USA',
      date: 'Mar 12, 2024',
      pricing: '$410',
      status: 'Pending',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 3,
      title: 'Professional voiceover services for your videos',
      company: 'GlobalTech Partners',
      location: 'Las Vegas, USA',
      date: 'Mar 12, 2024',
      pricing: '$410',
      status: 'Cancelled',
      statusColor: 'bg-red-100 text-red-800'
    },
    {
      id: 4,
      title: 'UI/UX Sales Page Design for Natural Skincare Brand',
      company: 'Apex Innovations',
      location: 'Las Vegas, USA',
      date: 'Mar 12, 2024',
      pricing: '$410',
      status: 'Completed',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 5,
      title: 'I will do figma UI UX design for websites & landing page',
      company: 'Innovations',
      location: 'Las Vegas, USA',
      date: 'Mar 12, 2024',
      pricing: '$410',
      status: 'Completed',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 6,
      title: 'Mobile App UI Design for E-commerce Platform',
      company: 'TechFlow Inc',
      location: 'New York, USA',
      date: 'Mar 13, 2024',
      pricing: '$520',
      status: 'Pending',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 7,
      title: 'Brand Identity Design Package',
      company: 'Creative Studios',
      location: 'Los Angeles, USA',
      date: 'Mar 13, 2024',
      pricing: '$350',
      status: 'Hired',
      statusColor: 'bg-blue-100 text-blue-800'
    }
  ]);

  const [openDropdownId, setOpenDropdownId] = useState(null);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setOpenDropdownId(null); // Close any open dropdowns when changing pages
  };

  const getCompanyIcon = (company) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500'
    ];
    const colorIndex = company.length % colors.length;
    return colors[colorIndex];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hired':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status: newStatus, statusColor: getStatusColor(newStatus) }
        : order
    ));
    setOpenDropdownId(null);
  };

  const handleDeleteOrder = (orderId) => {
    setOrders(orders.filter(order => order.id !== orderId));
  };

  const toggleDropdown = (orderId) => {
    setOpenDropdownId(openDropdownId === orderId ? null : orderId);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Posted Jobs</h1>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Orders
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full ${getCompanyIcon(order.company)} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xs font-medium">
                            {order.company.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {order.title}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{order.company}</span>
                            <MapPin className="w-3 h-3 ml-2 mr-1" />
                            <span>{order.location}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.pricing}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block text-left">
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleDropdown(order.id)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${order.statusColor} hover:bg-opacity-80 focus:outline-none`}
                          >
                            {order.status}
                            <ChevronDown className="ml-1 w-3 h-3" />
                          </button>
                        </div>

                        {openDropdownId === order.id && (
                          <div className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleStatusChange(order.id, 'Hired')}
                                className="block w-full text-left px-4 py-2 text-xs text-blue-700 hover:bg-blue-50"
                              >
                                Hired
                              </button>
                              <button
                                onClick={() => handleStatusChange(order.id, 'Pending')}
                                className="block w-full text-left px-4 py-2 text-xs text-yellow-700 hover:bg-yellow-50"
                              >
                                Pending
                              </button>
                              <button
                                onClick={() => handleStatusChange(order.id, 'Completed')}
                                className="block w-full text-left px-4 py-2 text-xs text-green-700 hover:bg-green-50"
                              >
                                Completed
                              </button>
                              <button
                                onClick={() => handleStatusChange(order.id, 'Cancelled')}
                                className="block w-full text-left px-4 py-2 text-xs text-red-700 hover:bg-red-50"
                              >
                                Cancelled
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
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
              <div className="flex items-start space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-full ${getCompanyIcon(order.company)} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-sm font-medium">
                    {order.company.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    {order.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <span>{order.company}</span>
                    <MapPin className="w-3 h-3 ml-2 mr-1" />
                    <span>{order.location}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <span className="text-gray-500">Date:</span>
                  <span className="ml-1 text-gray-900">{order.date}</span>
                </div>
                <div>
                  <span className="text-gray-500">Price:</span>
                  <span className="ml-1 font-medium text-gray-900">{order.pricing}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="relative inline-block text-left">
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleDropdown(order.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${order.statusColor} hover:bg-opacity-80 focus:outline-none`}
                    >
                      {order.status}
                      <ChevronDown className="ml-1 w-3 h-3" />
                    </button>
                  </div>

                  {openDropdownId === order.id && (
                    <div className="origin-top-right absolute left-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleStatusChange(order.id, 'Hired')}
                          className="block w-full text-left px-4 py-2 text-xs text-blue-700 hover:bg-blue-50"
                        >
                          Hired
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'Pending')}
                          className="block w-full text-left px-4 py-2 text-xs text-yellow-700 hover:bg-yellow-50"
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'Completed')}
                          className="block w-full text-left px-4 py-2 text-xs text-green-700 hover:bg-green-50"
                        >
                          Completed
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'Cancelled')}
                          className="block w-full text-left px-4 py-2 text-xs text-red-700 hover:bg-red-50"
                        >
                          Cancelled
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded">
                    <Check className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
      </div>
    </div>
  );
};

export default ServiceOrders;