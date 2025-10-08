"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Shield, Eye, Lock, UserCheck, Mail, Phone, Clock, FileText, ChevronRight } from "lucide-react";
import api from "@/config/api";

const PrivacyPolicyPage = () => {
    const [activeSection, setActiveSection] = useState("");
    const [isManualScroll, setIsManualScroll] = useState(false);
    const sectionRefs = useRef({});
    const [privacyData, setPrivacyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dynamic sections will be created from API data
    const [sections, setSections] = useState([]);

    // Fetch privacy policy data
    useEffect(() => {
        const fetchPrivacyData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/cms-pages1/Mg==');
                
                if (response.data && response.data.status === 'success' && response.data.data) {
                    const cmsData = response.data.data;
                    setPrivacyData(cmsData);
                    
                    // Create sections from contents array
                    if (cmsData.contents && Array.isArray(cmsData.contents)) {
                        const sortedContents = cmsData.contents.sort((a, b) => a.cms_c_number - b.cms_c_number);
                        const dynamicSections = sortedContents.map((content, index) => ({
                            id: content.cms_c_title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                            title: content.cms_c_title,
                            number: (index + 1).toString(),
                            content: content.cms_c_content
                        }));
                        setSections(dynamicSections);
                    }
                }
            } catch (error) {
                console.error('Error fetching privacy policy data:', error);
                setError('Failed to load privacy policy. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchPrivacyData();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // Skip if we just manually scrolled
                if (isManualScroll) return;

                // Get all visible sections
                const visibleSections = entries
                    .filter(entry => entry.isIntersecting)
                    .map(entry => ({
                        id: entry.target.id,
                        ratio: entry.intersectionRatio,
                        top: entry.boundingClientRect.top
                    }))
                    .sort((a, b) => {
                        // Sort by top position first (closest to top), then by ratio
                        if (Math.abs(a.top) < Math.abs(b.top)) return -1;
                        if (Math.abs(a.top) > Math.abs(b.top)) return 1;
                        return b.ratio - a.ratio;
                    });

                if (visibleSections.length > 0) {
                    // Select the section closest to the top of the viewport
                    setActiveSection(visibleSections[0].id);
                }
            },
            { 
                threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], 
                rootMargin: "-100px 0px -30% 0px" 
            }
        );

        // Observe all sections
        Object.values(sectionRefs.current).forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [isManualScroll]);

    const scrollToSection = (id) => {
        const element = sectionRefs.current[id];
        if (element) {
            // Set manual scroll flag
            setIsManualScroll(true);
            // Set the active section immediately when clicking
            setActiveSection(id);
            
            // Calculate the offset position (accounting for sticky header and padding)
            const offsetTop = element.offsetTop - 120; // Adjust based on your header height + desired padding
            
            // Scroll to the calculated position
            window.scrollTo({
                top: offsetTop,
                behavior: "smooth"
            });
            
            // Reset manual scroll flag after a delay
            setTimeout(() => {
                setIsManualScroll(false);
            }, 1500); // Increased timeout for smoother transition
        }
    };


    return (
        <>
            <style jsx global>{`
                .privacy-content ul {
                    list-style-type: disc;
                    margin-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .privacy-content li {
                    margin-bottom: 0.5rem;
                }
                .privacy-content ul li {
                    display: list-item;
                }
            `}</style>
            <div className="min-h-screen bg-gray-50">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">Privacy Policy</h1>
                            <p className="text-slate-300 text-lg">Hyrelancer Platform</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Clock className="w-4 h-4" />
                            <span>Effective Date: January 2025</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="sticky top-32 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Table of Contents
                            </h3>
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                                            activeSection === section.id
                                                ? "bg-blue-50 text-blue-700 font-medium"
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        <span className="text-xs font-semibold">{section.number}.</span>
                                        <span className="flex-1">{section.title}</span>
                                        {activeSection === section.id && (
                                            <ChevronRight className="w-4 h-4" />
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Document */}
                    <main className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 sm:p-8 lg:p-12 max-w-4xl">
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12">
                                    <p className="text-red-600 mb-4">{error}</p>
                                    <button 
                                        onClick={() => window.location.reload()} 
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Introduction */}
                                    <div className="mb-8 pb-8 border-b border-gray-200">
                                        <p className="text-lg text-gray-700 leading-relaxed">
                                            {privacyData?.cms_dec || "Welcome to Hyrelancer. Your privacy is paramount to us. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our platform."}
                                        </p>
                                    </div>

                                    {/* Dynamic Sections */}
                                    {sections.map((section, index) => (
                                        <section
                                            key={section.id}
                                            id={section.id}
                                            ref={(el) => (sectionRefs.current[section.id] = el)}
                                            className="mb-12 pb-12 border-b border-gray-200"
                                        >
                                            <div className="flex items-start gap-3 mb-4">
                                                <span className="text-2xl font-bold text-blue-600">{section.number}.</span>
                                                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                                            </div>
                                            <div 
                                                className="ml-9 space-y-4 text-gray-700 leading-relaxed privacy-content"
                                                dangerouslySetInnerHTML={{ __html: section.content }}
                                            />
                                        </section>
                                    ))}
                                </>
                            )}
                        </div>

                    </main>
                </div>
            </div>
        </div>
        </>
    );
};

export default PrivacyPolicyPage;