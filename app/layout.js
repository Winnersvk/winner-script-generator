import './globals.css';

export const metadata = {
  title: 'Winner Script Generator',
  description: 'AI Storytelling Script Generator for Thai & Lao short-form video'
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
