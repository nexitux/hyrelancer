import "../../styles/globals.css";
import Sidebar from "@/components/sidebar/Sidebar";
import { customerMenu } from "@/components/sidebar/customerMenu";
import Header from "../(public)/Header/page";
import SimpleFooter from "@/components/Footer/SimpleFooter";

export default function DashboardLayout({ children, showSidebar = true }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar (full width) */}
      <Header />

      {/* Main Section */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <div className="border-r border-gray-200 bg-white">
             <Sidebar navItems={customerMenu} />
          </div>
        )}

        {/* Right side: content only */}
        <div className="flex flex-col flex-1">
          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Full width footer outside sidebar */}
      <SimpleFooter />
    </div>
  );
}