import React from "react";
import {
  CheckCircle,
  UserPlus,
  Search,
  Megaphone,
  TrendingUp,
  Sparkles,
  X,
} from "lucide-react";

export default function AIPlanOfferModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const features = [
    {
      icon: <UserPlus className="w-4 h-4" />,
      title: "Post your services easily",
      description:
        "Create and publish your freelance services in minutes to start attracting clients.",
    },
    {
      icon: <Search className="w-4 h-4" />,
      title: "Find the right customers",
      description:
        "Connect with businesses and individuals actively searching for your skills.",
    },
    {
      icon: <Megaphone className="w-4 h-4" />,
      title: "Promote your work",
      description:
        "Showcase your portfolio and boost your visibility to reach a wider audience.",
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Grow your freelance career",
      description:
        "Build long-term client relationships and increase your income through our platform.",
    },
  ];

  // const googleOneFeatures = [
  //   {
  //     icon: <Zap className="w-4 h-4" />,
  //     title: "Flow: our AI filmmaking tool to create cinematic scenes and stories, including limited access to Veo 3",
  //     description: "Professional video creation with AI assistance"
  //   },
  //   {
  //     icon: <Image className="w-4 h-4" />,
  //     title: "Whisk: with higher limits to image-to-video creation with Veo 2",
  //     description: "Transform images into dynamic video content"
  //   },
  //   {
  //     icon: <FileText className="w-4 h-4" />,
  //     title: "NotebookLM: our research and writing assistant with 5x higher limits",
  //     description: "Enhanced productivity for research and content creation"
  //   },
  //   {
  //     icon: <Mail className="w-4 h-4" />,
  //     title: "Gemini in Gmail, Docs, Vids & more",
  //     description: "AI integration across Google Workspace applications"
  //   },
  //   {
  //     icon: <HardDrive className="w-4 h-4" />,
  //     title: "2 TB of total storage",
  //     description: "Generous cloud storage for all your files and projects"
  //   }
  // ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative scrollbar-hide">
        {/* Close Button */}

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-3">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Premium Freelance Experience
            </div>
            {/* <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
              AI Plan
            </h1> */}
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-3xl transform translate-x-6 -translate-y-6"></div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-base text-gray-500 line-through">
                  ₹1,950
                </span>
                <span className="text-4xl font-bold text-gray-900">₹0</span>
                <span className="text-lg text-gray-600">/mo</span>
              </div>
              <p className="text-gray-600">for 1 month</p>
              <div className="inline-flex bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
                Limited Time Offer
              </div>
            </div>

            {/* Main Features */}
            <div className="mb-8">
              {/* <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Boost your workflow with exclusive resources
              </h2> */}
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1 text-sm">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-xs">
                        {feature.description}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>

            {/* Google One Features */}
            {/* <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Also included in this Google One subscription
              </h2>
              <div className="grid gap-3">
                {googleOneFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-xs mb-1">{feature.title}</h3>
                      <p className="text-gray-600 text-xs">{feature.description}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </div> */}

            {/* CTA Button */}
            <div className="text-center mt-8">
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Get offer
              </button>
              <p className="text-gray-500 text-xs mt-3">
                Cancel anytime • No long-term commitment
              </p>
            </div>
          </div>

          {/* Additional Info */}
          {/* <div className="text-center mt-6">
            <div className="inline-flex items-center gap-2 text-gray-600 text-sm bg-white px-4 py-2 rounded-full shadow-md">
              <CheckCircle className="w-4 h-4 text-green-500" />
              30-day money-back guarantee
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
