import './globals.css';
import { headers } from 'next/headers';
import NonceScript from './components/NonceScript';

export const metadata = {
  title: 'Shakibul Security Writeups & Research Platform',
  description: 'Technical security research, CTF walkthroughs, defensive architecture, and vulnerability breakdowns by Shakibul Bokthiar.',
};

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce');

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        {/* Critical inline styles with nonce */}
        {nonce && (
          <style nonce={nonce} suppressHydrationWarning>
            {`
              body { 
                margin: 0; 
                padding: 0; 
                overflow-x: hidden;
              }
              * { 
                box-sizing: border-box; 
              }
            `}
          </style>
        )}
      </head>
      <body className="bg-[#07090e] text-[#f0f4f8] antialiased min-h-screen font-sans" suppressHydrationWarning>
        <NonceScript nonce={nonce} />
        {children}
      </body>
    </html>
  );
}
