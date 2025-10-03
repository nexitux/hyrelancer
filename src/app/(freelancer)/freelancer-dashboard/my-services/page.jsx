"use client";
import React, { useState } from 'react';
import { Share2, Edit, Trash2, Copy } from 'lucide-react';

const MyServices = () => {
    const [services, setServices] = useState([
        {
            id: 1,
            title: "I will translate your documents with accuracy and precision",
            description: "We need someone that can translate our documents ...",
            dateCreated: "Mar 12, 2024",
            pricing: "₹380",
            status: false,
            inQueue: 22
        },
        {
            id: 2,
            title: "I will design a professional and beautiful website on wix",
            description: "We need someone that can translate our documents ...",
            dateCreated: "Mar 08, 2024",
            pricing: "₹540",
            status: false,
            inQueue: 8
        },
        {
            id: 3,
            title: "I will create stunning logo designs for your business",
            description: "We need someone that can translate our documents ...",
            dateCreated: "Mar 02, 2024",
            pricing: "₹410",
            status: false,
            inQueue: 26
        },
        {
            id: 4,
            title: "I will do background illustration and environment concept art",
            description: "We need someone that can translate our documents ...",
            dateCreated: "Feb 16, 2024",
            pricing: "₹470",
            status: false,
            inQueue: 13
        }
    ]);

    const handleStatusToggle = (id) => {
        setServices(services.map(service =>
            service.id === id ? { ...service, status: !service.status } : service
        ));
    };

    const handleAddNewService = () => {
        console.log('Add new service clicked');
    };

    const handleViewQueue = (serviceId, queueCount) => {
        console.log(`View queue for service ₹{serviceId} with ₹{queueCount} items`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Services</h1>
                    <button
                        onClick={handleAddNewService}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors w-full sm:w-auto"
                    >
                        Add New Service
                    </button>
                </div>

                {/* Services Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Desktop Table Header - Hidden on mobile */}
                    <div className="hidden lg:block bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="grid grid-cols-12 gap-4 items-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                            <div className="col-span-4">Title</div>
                            <div className="col-span-2">Date Created</div>
                            <div className="col-span-1">Pricing</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-2">In Queue</div>
                            <div className="col-span-2">Action</div>
                        </div>
                    </div>

                    {/* Table Body - Responsive */}
                    <div className="divide-y divide-gray-200">
                        {services.map((service) => (
                            <div key={service.id} className="px-4 sm:px-6 py-4 sm:py-6 hover:bg-gray-50 transition-colors">
                                {/* Desktop Layout */}
                                <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center">
                                    {/* Title */}
                                    <div className="col-span-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">
                                            {service.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {service.description}
                                        </p>
                                    </div>

                                    {/* Date Created */}
                                    <div className="col-span-2">
                                        <span className="text-gray-900 font-medium">
                                            {service.dateCreated}
                                        </span>
                                    </div>

                                    {/* Pricing */}
                                    <div className="col-span-1">
                                        <span className="text-gray-900 font-medium">
                                            {service.pricing}
                                        </span>
                                    </div>

                                    {/* Status Toggle */}
                                    <div className="col-span-1">
                                        <button
                                            onClick={() => handleStatusToggle(service.id)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ₹{service.status ? 'bg-indigo-600' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ₹{service.status ? 'translate-x-5.5' : 'translate-x-0.5'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Queue */}
                                    <div className="col-span-2">
                                        <button
                                            onClick={() => handleViewQueue(service.id, service.inQueue)}
                                            className="text-indigo-600 border border-indigo-600 px-4 py-2 rounded-lg text-xs font-medium hover:bg-indigo-50 transition-colors"
                                        >
                                            View In Queue ({service.inQueue})
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2">
                                        <div className="flex items-center space-x-3">
                                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                <Copy className="h-5 w-5" />
                                            </button>
                                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                <Share2 className="h-5 w-5" />
                                            </button>
                                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button className="text-gray-400 hover:text-red-600 transition-colors">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile/Tablet Layout */}
                                <div className="lg:hidden space-y-4">
                                    {/* Title */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {service.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {service.description}
                                        </p>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 font-medium block">Date</span>
                                            <span className="text-gray-900 font-medium">{service.dateCreated}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 font-medium block">Price</span>
                                            <span className="text-gray-900 font-semibold">{service.pricing}</span>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <span className="text-gray-500 font-medium block mb-2">Status</span>
                                            <button
                                                onClick={() => handleStatusToggle(service.id)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ₹{service.status ? 'bg-indigo-600' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ₹{service.status ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Queue and Actions */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <button
                                            onClick={() => handleViewQueue(service.id, service.inQueue)}
                                            className="text-indigo-600 border border-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors w-full sm:w-auto"
                                        >
                                            View In Queue ({service.inQueue})
                                        </button>

                                        <div className="flex items-center justify-center sm:justify-end space-x-4">
                                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                <Copy className="h-5 w-5" />
                                            </button>
                                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                <Share2 className="h-5 w-5" />
                                            </button>
                                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button className="text-gray-400 hover:text-red-600 transition-colors">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyServices;