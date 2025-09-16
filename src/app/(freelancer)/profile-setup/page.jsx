// app/(freelancer)/profile-setup/page.jsx
"use client"

import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Steps, Form, Spin } from "antd";
import Loader from "../../../components/Loader/page";

// Import individual tab components
import ProfileTab from "./my-profile/page";
import ServiceTab from "./services/page";
import EducationTab from "./education-experience/page";
import SocialTab from "./social-media/page";
import PortfolioTab from "./portfolio/page";

const { Step } = Steps;

export default function FreelancerProfileSetup() {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(true);

  // Freelancer edit steps (NO Terms page)
  const freelancerSteps = [
    { 
      title: "Profile", 
      content: <ProfileTab 
        form={form}  
        onNext={() => setCurrent(1)} 
        onBack={() => setCurrent(0)}
      /> 
    },
    { 
      title: "Service", 
      content: <ServiceTab 
        form={form} 
        onNext={() => setCurrent(2)} 
        onBack={() => setCurrent(0)}
        canDelete={false} // Don't allow deletion in edit mode
        isRegistration={false}
      /> 
    },
    { 
      title: "Education", 
      content: <EducationTab 
        form={form} 
        onNext={() => setCurrent(3)} 
        onBack={() => setCurrent(1)}
        isRegistration={false}
      /> 
    },
    { 
      title: "Social Network", 
      content: <SocialTab 
        form={form} 
        onNext={() => setCurrent(4)} 
        onBack={() => setCurrent(2)}
        isRegistration={false}
      /> 
    },
    { 
      title: "Portfolio", 
      content: <PortfolioTab 
        form={form} 
        onNext={() => {
          // Last step in edit mode - show success message or stay
          console.log("Profile updated successfully!");
        }} 
        onBack={() => setCurrent(3)}
        isLastStep={true}
        isRegistration={false}
      /> 
    }
  ];

  useEffect(() => {
    if (!user) {
      router.replace('/Login');
      return;
    }

    const { is_status, is_regi_complete } = user;

    // Only completed users should access freelancer profile edit
    if (is_status === "new" && is_regi_complete > 0) {
      console.log("New user with incomplete registration → redirecting to registration");
      router.replace("/registration/profile-setup");
      return;
    }

    // Allow old users and completed new users
    if (is_status === "old" || (is_status === "new" && is_regi_complete === 0)) {
      setIsLoading(false);
    }
  }, [user, router]);

  // Show loading while checking
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader/>
          <p className="text-gray-600 mt-4">Loading profile editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Edit Profile Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Your Profile</h1>
        <p className="text-gray-600">
          Update your profile information to attract more clients
        </p>
      </div>

      {/* Navigation Steps */}
      <Steps 
        current={current} 
        responsive 
        style={{ marginBottom: 24 }}
        type="navigation"
        onChange={(step) => setCurrent(step)} // Allow direct step navigation
      >
        {freelancerSteps.map((item, index) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>

      {/* Current Step Content */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {freelancerSteps[current]?.content}
      </div>

      {/* Step Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <span className="text-sm text-gray-500 flex items-center">
          {current + 1} of {freelancerSteps.length}
        </span>
        
        <button
          onClick={() => setCurrent(Math.min(freelancerSteps.length - 1, current + 1))}
          disabled={current === freelancerSteps.length - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}