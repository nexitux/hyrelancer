import "../../styles/globals.css";
// import Header from "../(public)/Header/page";
import Footer from "../../components/Footer/SimpleFooter";

export default function AuthLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-50">
           {/* <Header /> */}
        <main className="flex-grow">
          {children} 
          </main>
          <Footer/>
      </body>
    </html>
  );
}
