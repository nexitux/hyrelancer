import { FaTachometerAlt, FaBriefcase, FaUser, FaHeadset, FaComments } from "react-icons/fa";

export const customerMenu = [
  {
    icon: <FaTachometerAlt className="w-4 h-4" />,
    name: "Dashboard",
    path: "/customer-dashboard/Analytics",
    pro: false,
  },
  {
    icon: <FaComments className="w-4 h-4" />,
    name: "Messages",
    path: "/customer-dashboard/message",
    pro: false,
  },
  {
    icon: <FaBriefcase className="w-4 h-4" />,
    name: "Post a Job",
    subItems: [
      { name: "New Job", path: "/customer-dashboard/job-post" },
      { name: "Manage Jobs", path: "/customer-dashboard/job-list" },
      { name: "Freelancers Request", path: "/customer-dashboard/work-request" },
    ],
  },
  {
    icon: <FaUser className="w-4 h-4" />,
    name: "Account",
    subItems: [{ name: "Change Password", path: "/customer-dashboard/Changepassword", pro: false },
               { name: "Delete Profile", path: "/customer-dashboard/Deleteprofile", pro: false },
               { name: "Deactivate Profile", path: "/customer-dashboard/acc-active", pro: false }
    ]
  },
  {
    icon: <FaHeadset className="w-4 h-4" />,
    name: "Support Tickets",
    subItems: [{ name: "Support Tickets", path: "/customer-dashboard/support-tickets", pro: false }
    ]
  },
 
];
