"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Shield, Eye, Lock, UserCheck, Mail, Phone, Clock, FileText, ChevronRight } from "lucide-react";

const PrivacyPolicyPage = () => {
    const [activeSection, setActiveSection] = useState("");
    const [isManualScroll, setIsManualScroll] = useState(false);
    const sectionRefs = useRef({});

    const sections = [
        { id: "introduction", title: "Introduction", number: "1" },
        { id: "information-collect", title: "Information We Collect", number: "2" },
        { id: "how-use", title: "How We Use Your Information", number: "3" },
        { id: "sharing", title: "Information Sharing and Disclosure", number: "4" },
        { id: "security", title: "Data Security", number: "5" },
        { id: "rights", title: "Your Rights and Choices", number: "6" },
        { id: "cookies", title: "Cookies and Tracking", number: "7" },
        { id: "third-party", title: "Third-Party Links", number: "8" },
        { id: "children", title: "Children's Privacy", number: "9" },
        { id: "changes", title: "Changes to Policy", number: "10" },
        { id: "contact", title: "Contact Us", number: "11" }
    ];

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
                            {/* Introduction */}
                            <section
                                id="introduction"
                                ref={(el) => (sectionRefs.current["introduction"] = el)}
                                className="mb-12 pb-12 border-b border-gray-200"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="text-2xl font-bold text-blue-600">1.</span>
                                    <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
                                </div>
                                <div className="ml-9 space-y-4 text-gray-700 leading-relaxed">
                                    <p>
                                        Welcome to Hyrelancer. Your privacy is paramount to us. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our platform.
                                    </p>
                                </div>
                            </section>

                            {/* Information We Collect */}
                            <section
                                id="information-collect"
                                ref={(el) => (sectionRefs.current["information-collect"] = el)}
                                className="mb-12 pb-12 border-b border-gray-200"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="text-2xl font-bold text-blue-600">2.</span>
                                    <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
                                </div>
                                <div className="ml-9 space-y-6 text-gray-700 leading-relaxed">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">a. Information You Provide</h3>
                                        <p className="mb-3">When you register or interact with our platform, we may collect:</p>
                                        <div className="space-y-2">
                                            <div className="flex gap-3">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                                <div>
                                                    <strong className="text-gray-900">Personal Information:</strong> Name, email address, phone number, and location.
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                                <div>
                                                    <strong className="text-gray-900">Professional Details:</strong> Skills, portfolio links, and service offerings.
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                                <div>
                                                    <strong className="text-gray-900">Payment Information:</strong> UPI ID, credit/debit card details (processed securely via our payment gateway).
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                                <div>
                                                    <strong className="text-gray-900">Job Details:</strong> For clients posting jobs—project descriptions, budgets, and timelines.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">b. Information Collected Automatically</h3>
                                        <p className="mb-3">We may automatically collect:</p>
                                        <div className="space-y-2">
                                            <div className="flex gap-3">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                                <div>
                                                    <strong className="text-gray-900">Device Information:</strong> Browser type, operating system, and device identifiers.
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                                <div>
                                                    <strong className="text-gray-900">Usage Data:</strong> Pages visited, time spent on pages, and other analytical data.
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                                <div>
                                                    <strong className="text-gray-900">Location Data:</strong> General geolocation based on IP address.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* How We Use Your Information */}
                            <section
                                id="how-use"
                                ref={(el) => (sectionRefs.current["how-use"] = el)}
                                className="mb-12 pb-12 border-b border-gray-200"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="text-2xl font-bold text-blue-600">3.</span>
                                    <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
                                </div>
                                <div className="ml-9 space-y-4 text-gray-700 leading-relaxed">
                                    <p>We utilize the collected information to:</p>
                                    <div className="space-y-2">
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Provide Services:</strong> Facilitate connections between freelancers and clients.
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Enhance User Experience:</strong> Personalize content and recommendations.
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Process Transactions:</strong> Manage payments and subscriptions securely.
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Communicate:</strong> Send updates, newsletters, and promotional materials.
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Ensure Security:</strong> Detect and prevent fraudulent activities.
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Comply with Legal Obligations:</strong> Adhere to applicable laws and regulations.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Information Sharing */}
                            <section
                                id="sharing"
                                ref={(el) => (sectionRefs.current["sharing"] = el)}
                                className="mb-12 pb-12 border-b border-gray-200"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="text-2xl font-bold text-blue-600">4.</span>
                                    <h2 className="text-2xl font-bold text-gray-900">Information Sharing and Disclosure</h2>
                                </div>
                                <div className="ml-9 space-y-4 text-gray-700 leading-relaxed">
                                    <p>We do not sell your personal information. We may share information with:</p>
                                    <div className="space-y-2">
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Service Providers:</strong> Third-party vendors assisting in operations like payment processing and data analysis.
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Legal Authorities:</strong> When required by law or to protect our rights.
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Business Transfers:</strong> In events like mergers or acquisitions, user information may be transferred.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Data Security */}
                            <section
                                id="security"
                                ref={(el) => (sectionRefs.current["security"] = el)}
                                className="mb-12 pb-12 border-b border-gray-200"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="text-2xl font-bold text-blue-600">5.</span>
                                    <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
                                </div>
                                <div className="ml-9 space-y-4 text-gray-700 leading-relaxed">
                                    <p>
                                        We implement robust security measures to protect your data. However, no method of transmission over the internet is entirely secure. We strive to use commercially acceptable means to protect your personal information.
                                    </p>
                                </div>
                            </section>

                            {/* Your Rights */}
                            <section
                                id="rights"
                                ref={(el) => (sectionRefs.current["rights"] = el)}
                                className="mb-12 pb-12 border-b border-gray-200"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="text-2xl font-bold text-blue-600">6.</span>
                                    <h2 className="text-2xl font-bold text-gray-900">Your Rights and Choices</h2>
                                </div>
                                <div className="ml-9 space-y-4 text-gray-700 leading-relaxed">
                                    <p>You have the right to:</p>
                                    <div className="space-y-2">
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Access:</strong> Request a copy of the personal data we hold about you.
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Correction:</strong> Update or correct your information.
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Deletion:</strong> Request deletion of your personal data.
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <strong className="text-gray-900">Opt-Out:</strong> Unsubscribe from marketing communications.
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-4">
                                        To exercise these rights, please contact us at <a href="mailto:privacy@hyrelancer.com" className="text-blue-600 hover:text-blue-700 underline">privacy@hyrelancer.com</a>.
                                    </p>
                                </div>
                            </section>

                            {/* Cookies */}
                            <section
                                id="cookies"
                                ref={(el) => (sectionRefs.current["cookies"] = el)}
                                className="mb-12 pb-12 border-b border-gray-200"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="text-2xl font-bold text-blue-600">7.</span>
                                    <h2 className="text-2xl font-bold text-gray-900">Cookies and Tracking Technologies</h2>
                                </div>
                                <div className="ml-9 space-y-4 text-gray-700 leading-relaxed">
                                    <p>
                                        We use cookies to enhance user experience. You can set your browser to refuse cookies, but some features of our platform may not function properly without them.
                                    </p>
                                </div>
                            </section>

                            {/* Third Party */}
                            <section
                                id="third-party"
                                ref={(el) => (sectionRefs.current["third-party"] = el)}
                                className="mb-12 pb-12 border-b border-gray-200"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="text-2xl font-bold text-blue-600">8.</span>
                                    <h2 className="text-2xl font-bold text-gray-900">Third-Party Links</h2>
                                </div>
                                <div className="ml-9 space-y-4 text-gray-700 leading-relaxed">
                                    <p>
                                        Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.
                                    </p>
                                </div>
                            </section>

                            {/* Children */}
                            <section
                                id="children"
                                ref={(el) => (sectionRefs.current["children"] = el)}
                                className="mb-12 pb-12 border-b border-gray-200"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="text-2xl font-bold text-blue-600">9.</span>
                                    <h2 className="text-2xl font-bold text-gray-900">Children's Privacy</h2>
                                </div>
                                <div className="ml-9 space-y-4 text-gray-700 leading-relaxed">
                                    <p>
                                        Hyrelancer is not intended for individuals under the age of 18. We do not knowingly collect data from minors.
                                    </p>
                                </div>
                            </section>

                            {/* Changes */}
                            <section
                                id="changes"
                                ref={(el) => (sectionRefs.current["changes"] = el)}
                                className="mb-12 pb-12 border-b border-gray-200"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="text-2xl font-bold text-blue-600">10.</span>
                                    <h2 className="text-2xl font-bold text-gray-900">Changes to This Privacy Policy</h2>
                                </div>
                                <div className="ml-9 space-y-4 text-gray-700 leading-relaxed">
                                    <p>
                                        We may update this Privacy Policy periodically. Changes will be posted on this page with an updated effective date.
                                    </p>
                                </div>
                            </section>

                            {/* Contact */}
                            <section
                                id="contact"
                                ref={(el) => (sectionRefs.current["contact"] = el)}
                                className="mb-8"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="text-2xl font-bold text-blue-600">11.</span>
                                    <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
                                </div>
                                <div className="ml-9 space-y-4 text-gray-700 leading-relaxed">
                                    <p>
                                        For any questions or concerns regarding this Privacy Policy, please contact us at:
                                    </p>
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                                        <p className="font-semibold text-gray-900 text-lg">Hyrelancer</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                    </main>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;