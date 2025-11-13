import "./globals.css";
import ClientProvider from '../components/ClientProvider';
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = { title: "StreamWatch", description: "Real-time DAO governance with Somnia Data Streams" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg">
        <ClientProvider>
          <Header />
          <main className="max-w-6xl mx-auto p-6">{children}</main>
          <Footer />
        </ClientProvider>
      </body>
    </html>
  );
}
