import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: {
    default: 'Maison Laurel — Fine Dining',
    template: '%s | Maison Laurel',
  },
  description: 'Maison Laurel — an elegant dining experience. Explore our menu, make reservations, and enjoy exceptional cuisine.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="page-wrapper">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
