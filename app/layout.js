import './globals.css';

export const metadata = {
  title: 'Winner Script Generator',
  description: 'AI Storytelling Script Generator for Thai & Lao short-form video',
  manifest: '/manifest.webmanifest',
  appleWebApp: {capable:true,statusBarStyle:'black-translucent',title:'Winner Script'},
  icons: {icon:'/icon-192.png',apple:'/icon-192.png'}
};

export const viewport = {width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#0b1020'};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
