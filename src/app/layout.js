import './globals.css';

export const metadata = {
  title: 'Better PM',
  description: 'AI-powered Product Management assistant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}