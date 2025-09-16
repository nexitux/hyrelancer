import "../../styles/globals.css";
import Header from "../(public)/Header/page";
import Footer from "../(public)/Footer/page";

export const metadata = {
  title: "Hyrelancer",
  description: "A modern platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
      <Header/>
        <main className="min-h-screen">{children}</main>
     <Footer/>
      </body>
    </html>
  );
}
