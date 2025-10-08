// app/layout.js or wherever you have your main layout
'use client';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { ToastContainer } from 'react-toastify';
import AuthWrapper from '@/components/AuthWrapper/page';
import { useSEO } from '@/hooks/useSEO';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({ children }) {
  const seoComponent = useSEO();
  
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {seoComponent}
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