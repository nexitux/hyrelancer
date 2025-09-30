//app/(auth)/registration/profile-setup/page.jsx
"use client"

import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Steps, Form, Spin } from "antd";
import RegistrationModal from "@/components/RegistrationModal.jsx/page";

// Import individual tab components directly
import ProfileTab from "@/app/(freelancer)/profile-setup/my-profile/page";
import ServiceTab from "@/app/(freelancer)/profile-setup/services/page";
import EducationTab from "@/app/(freelancer)/profile-setup/education-experience/page";
import SocialTab from "@/app/(freelancer)/profile-setup/social-media/page";
import PortfolioTab from "@/app/(freelancer)/profile-setup/portfolio/page";
import TermsTab from "@/app/(freelancer)/profile-setup/terms-conditions/page";

const { Step } = Steps;

export default function RegistrationProfileSetup() {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    buttonText: "Continue"
  });

  // Function to show modal with custom content
  const showCompletionModal = (title, message, buttonText = "Continue") => {
    setModalContent({ title, message, buttonText });
    setShowModal(true);
  };

  // Function to handle modal close and proceed to next step
  const handleModalClose = () => {
    setShowModal(false);
  };

  // Simple next handlers - components will handle their own modal messages
  const handleStepNext = (stepIndex) => {
    setCurrent(stepIndex);
  };

  // Registration-specific steps (includes Terms)
  const registrationSteps = [
    { 
      title: "Profile", 
      content: <ProfileTab 
        form={form}  
        onNext={() => handleStepNext(1)} 
        onBack={() => setCurrent(0)}
        isRegistration={true}
        showCompletionModal={showCompletionModal}
      /> 
    },
    { 
      title: "Service", 
      content: <ServiceTab 
        form={form} 
        onNext={() => handleStepNext(2)} 
        onBack={() => setCurrent(0)}
        canDelete={true}
        isRegistration={true}
        showCompletionModal={showCompletionModal}
      /> 
    },
    { 
      title: "Education", 
      content: <EducationTab 
        form={form} 
        onNext={() => handleStepNext(3)} 
        onBack={() => setCurrent(1)}
        isRegistration={true}
        showCompletionModal={showCompletionModal}
      /> 
    },
    { 
      title: "Social Network", 
      content: <SocialTab 
        form={form} 
        onNext={() => handleStepNext(4)} 
        onBack={() => setCurrent(2)}
        isRegistration={true}
        showCompletionModal={showCompletionModal}
      /> 
    },
    { 
      title: "Portfolio", 
      content: <PortfolioTab 
        form={form} 
        onNext={() => handleStepNext(5)} 
        onBack={() => setCurrent(3)}
        isRegistration={true}
        showCompletionModal={showCompletionModal}
      /> 
    },
    { 
      title: "Terms And Conditions", 
      content: <TermsTab 
        form={form} 
        onNext={() => {
          // Registration complete, redirect to home
          router.replace('/');
        }} 
        onBack={() => setCurrent(4)}
        isRegistrationFlow={true}
        isRegistration={true}
        showCompletionModal={showCompletionModal}
        isLastStep={true} 
      /> 
    },
  ];

  // Initialize step based on user's registration completion status
  useEffect(() => {
    if (!user) {
      router.replace('/Login');
      return;
    }

    const { is_regi_complete, is_status } = user;
    const totalSteps = registrationSteps.length;
    const completionLevel = Number(is_regi_complete);
    const parsedLevel = isFinite(completionLevel) ? completionLevel : 1;

    console.log("Registration flow - User status:", { is_status, completionLevel: parsedLevel });

    if (is_status === "old") {
      console.log("Old user in registration → redirecting to home");
      router.replace("/");
      return;
    }

    if (is_status === "new") {
      if (parsedLevel === 0) {
        console.log("Registration complete → redirecting to home");
        router.replace("/");
        return;
      }

      const currentStep = Math.max(0, Math.min(totalSteps - 1, parsedLevel - 1));
      console.log("Setting registration step:", currentStep);
      setCurrent(currentStep);
    }

    setIsLoading(false);
  }, [user, router]);

  // Show loading while checking user status
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-gray-600 mt-4">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Completion Modal */}
      <RegistrationModal
        isVisible={showModal}
        onClose={handleModalClose}
        title={modalContent.title}
        message={modalContent.message}
        buttonText={modalContent.buttonText}
      />

      <div className="py-8">
        <div className="mx-auto px-4">
          {/* Registration Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome! Let's Set Up Your Profile
            </h1>
            <p className="text-gray-600">
              Complete all sections to start receiving job opportunities
            </p>
          </div>

          {/* Progress Steps */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <Steps 
              current={current} 
              responsive 
              className="mb-6"
            >
              {registrationSteps.map((item, index) => {
                let status = "wait";
                
                // Use current step for immediate UI feedback
                if (index < current) {
                  status = "finish";
                } else if (index === current) {
                  status = "process";
                }
                
                return (
                  <Step 
                    key={item.title} 
                    title={item.title} 
                    status={status} 
                  />
                );
              })}
            </Steps>

            {/* Creative Progress Bar */}
            <div className="mt-6">
              {(() => {
                // Use current step for real-time progress updates
                const completedSteps = current;
                const totalSteps = registrationSteps.length;
                const progressPercentage = (completedSteps / totalSteps) * 100;

                console.log("Progress Debug:", { 
                  completedSteps, 
                  progressPercentage, 
                  currentStep: current,
                  totalSteps 
                });

                return (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    
                    <div className="relative">
                      {/* Background Track */}
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        {/* Animated Progress Fill */}
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out relative"
                          style={{ width: `${progressPercentage}%` }}
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                        </div>
                      </div>
                      
                      {/* Progress Milestones */}
                      <div className="absolute top-0 w-full h-2 flex justify-between">
                        {registrationSteps.map((_, index) => {
                          const isCompleted = index < completedSteps;
                          const isCurrent = index === current;
                          
                          return (
                            <div
                              key={index}
                              className={`w-0.5 h-full transition-colors duration-300 ${
                                isCompleted 
                                  ? 'bg-white' 
                                  : isCurrent 
                                    ? 'bg-blue-300' 
                                    : 'bg-gray-300'
                              }`}
                              style={{ marginLeft: index === 0 ? '0' : '-1px' }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Progress Text */}
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Getting Started</span>
                      <span className="text-blue-600 font-medium">
                        {completedSteps} of 6 steps completed
                      </span>
                      <span>Profile Complete</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Current Step Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {registrationSteps[current]?.content}
          </div>

          {/* Progress Indicator */}
          <div className="text-center mt-6 text-sm text-gray-500">
            Step {current + 1} of {registrationSteps.length}
          </div>
        </div>
      </div>
    </>
  );
}