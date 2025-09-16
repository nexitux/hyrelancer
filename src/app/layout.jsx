// app/layout.js or wherever you have your main layout
'use client';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { ToastContainer } from 'react-toastify';
import AuthWrapper from '@/components/AuthWrapper/page';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Hyrelancer - A Freelancer Marketplace</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Hyrelancer - The best freelancer marketplace to connect clients and freelancers." />
        <meta name="keywords" content="freelancer, marketplace, jobs, clients, hyrelancer" />
        <meta property="og:title" content="Hyrelancer - A Freelancer Marketplace" />
        <meta property="og:description" content="Find the best freelancers and clients at Hyrelancer." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:type" content="website" />
      </head>
      <body>
        <Provider store={store}>
          <AuthWrapper>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              toastStyle={{
                fontSize: '14px',
                borderRadius: '8px',
              }}
            />
          </AuthWrapper>
        </Provider>
      </body>
    </html>
  );
}