import './globals.css';
import HubNav from './HubNav';

export const metadata = {
  title: 'MKT Online',
  description: 'ระบบจัดการการตลาดออนไลน์',
  manifest: '/manifest.webmanifest',
  appleWebApp: {capable:true,statusBarStyle:'black-translucent',title:'MKT Online'},
  icons: {icon:'/icon-192.png',apple:'/icon-192.png'}
};

export const viewport = {width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#0b1020'};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body><HubNav/>{children}</body>
    </html>
  );
}
