import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import LeftSidebar from '../components/LeftSidebar';
import { createClient } from '@/utils/supabase/server'

export default async function RootLayout({ children }) {

  // const supabase = await createClient()
  // const { data, error } = await supabase.auth.getUser()
  // if (error || !data?.user) {
  //   return (<html><body></body>
  //   </html>)
  // }
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <div className="flex h-screen bg-gray-100">
          <LeftSidebar />
          {children}
        </div>
      </body>
    </html>
  );
}