import "../../styles/globals.css";
import Sidebar from "@/components/sidebar/Sidebar";
import { customerMenu } from "@/components/sidebar/customerMenu";
import Header from "../(public)/Header/page";
import Footer from "../(public)/Footer/page";

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

        {/* Right side: content + footer stacked */}
        <div className="flex flex-col flex-1 gap-5">
          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

          {/* Footer (same width as content) */}
          <Footer />
        </div>
      </div>
    </div>
  );
}