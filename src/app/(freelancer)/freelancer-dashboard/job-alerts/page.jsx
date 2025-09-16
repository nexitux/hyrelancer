"use client";
import React, { useState } from 'react';
import { Search, Plus, Eye, Edit3, Trash2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import EditAlertsModal from './components/EditAlertsModal'

const JobAlerts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('Default');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alerts, setAlerts] = useState([
        {
            id: 1,
            title: 'Website design',
            status: 'Enabled',
            region: 'United States',
            categories: ['UX/UI design'],
            tags: ['web', 'landing'],
            type: 'Parttime',
            jobsFound: 32,
            frequency: 'Weekly',
            enabled: true
        },
        {
            id: 2,
            title: 'UX/UI design',
            status: 'Disabled',
            region: 'United Kingdom',
            categories: ['UX/UI design'],
            tags: ['app', 'mobile'],
            type: 'Parttime',
            jobsFound: 8,
            frequency: 'Daily',
            enabled: false
        },
        {
            id: 3,
            title: 'App design',
            status: 'Disabled',
            region: 'South Korea',
            categories: ['UX/UI design'],
            tags: ['logo', 'mockup'],
            type: 'Parttime',
            jobsFound: 24,
            frequency: 'Daily',
            enabled: false
        },
        {
            id: 4,
            title: 'Logo branding',
            status: 'Enabled',
            region: 'United States',
            categories: ['UX/UI design'],
            tags: ['logo', 'mockup'],
            type: 'Parttime',
            jobsFound: 16,
            frequency: 'Daily',
            enabled: true
        },
        {
            id: 5,
            title: 'Frontend development',
            status: 'Enabled',
            region: 'Canada',
            categories: ['Web development'],
            tags: ['react', 'javascript'],
            type: 'Fulltime',
            jobsFound: 45,
            frequency: 'Weekly',
            enabled: true
        }
    ]);

    const toggleAlert = (id) => {
        setAlerts(alerts.map(alert =>
            alert.id === id
                ? { ...alert, enabled: !alert.enabled, status: alert.enabled ? 'Disabled' : 'Enabled' }
                : alert
        ));
    };

    const deleteAlert = (id) => {
        setAlerts(alerts.filter(alert => alert.id !== id));
    };

    const getStatusBadge = (status) => {
        return status === 'Enabled'
            ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Enabled</span>
            : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Disabled</span>;
    };

    const filteredAlerts = alerts.filter(alert =>
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-4 sm:pt-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Jobs Alerts</h1>
                    <Link href={`job-alerts/add-job-alerts`}>
                        <button className="inline-flex items-center justify-center px-4 py-2.5 sm:py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Alert
                        </button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
                {/* Search and Sort Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by keyword"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 text-sm placeholder-gray-500"
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
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4">
                            <div className="col-span-6">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</h3>
                            </div>
                            <div className="col-span-2 text-center">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Number Jobs</h3>
                            </div>
                            <div className="col-span-1 text-center">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Times</h3>
                            </div>
                            <div className="col-span-1 text-center">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</h3>
                            </div>
                            <div className="col-span-2 text-center">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</h3>
                            </div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                        {filteredAlerts.map((alert, index) => (
                            <div key={alert.id} className={`grid grid-cols-12 gap-4 px-6 py-6 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                {/* Title Column */}
                                <div className="col-span-6">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h4 className="text-lg font-semibold text-gray-900 truncate">{alert.title}</h4>
                                                {getStatusBadge(alert.status)}
                                            </div>
                                            <div className="space-x-2 text-sm text-gray-500 flex flex-wrap">
                                                <div>
                                                    <span className="font-medium">Region:</span> {alert.region}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Categories:</span> {alert.categories.join(', ')}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Tags:</span> {alert.tags.join(', ')}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Type:</span> {alert.type}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Number Jobs Column */}
                                <div className="col-span-2 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-gray-900">Jobs found {alert.jobsFound}</div>
                                    </div>
                                </div>

                                {/* Times Column */}
                                <div className="col-span-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-base font-medium text-blue-800">{alert.frequency}</div>
                                    </div>
                                </div>

                                {/* Status Column */}
                                <div className="col-span-1 flex items-center justify-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={alert.enabled}
                                            onChange={() => toggleAlert(alert.id)}
                                        />
                                        <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer transition-colors ${alert.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                            <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform ${alert.enabled ? 'translate-x-5 border-blue-600' : 'translate-x-0'}`}></div>
                                        </div>
                                    </label>
                                </div>

                                {/* Action Column */}
                                <div className="col-span-2 flex items-center justify-center">
                                    <div className="flex items-center space-x-3">
                                        <Link href={`job-alerts/696`}>
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => setIsModalOpen(true)} 
                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteAlert(alert.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden space-y-4">
                    {filteredAlerts.map((alert) => (
                        <div key={alert.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900 truncate">{alert.title}</h4>
                                        {getStatusBadge(alert.status)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        <span className="font-medium text-blue-800">{alert.frequency}</span> • {alert.jobsFound} jobs found
                                    </div>
                                </div>
                                
                                {/* Toggle Switch */}
                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={alert.enabled}
                                        onChange={() => toggleAlert(alert.id)}
                                    />
                                    <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer transition-colors ${alert.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform ${alert.enabled ? 'translate-x-5 border-blue-600' : 'translate-x-0'}`}></div>
                                    </div>
                                </label>
                            </div>

                            {/* Card Details */}
                            <div className="space-y-2 mb-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                    <div>
                                        <span className="font-medium text-gray-900">Region:</span> {alert.region}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-900">Type:</span> {alert.type}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <span className="font-medium text-gray-900">Categories:</span> {alert.categories.join(', ')}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <span className="font-medium text-gray-900">Tags:</span> {alert.tags.join(', ')}
                                    </div>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                                <Link href={`/job-alerts/696`}>
                                    <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </Link>
                                <button
                                    onClick={() => setIsModalOpen(true)} 
                                    className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => deleteAlert(alert.id)}
                                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredAlerts.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
                        <div className="text-gray-500 text-lg">No job alerts found</div>
                        <div className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</div>
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-4 sm:mt-6 text-center text-sm text-gray-500">
                    Showing {filteredAlerts.length} of {alerts.length} job alerts
                </div>
            </div>
            <EditAlertsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default JobAlerts;