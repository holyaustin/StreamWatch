import "./globals.css";
import ClientProvider from "../components/ClientProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "StreamWatch DAO",
  description: "Real-time DAO governance with Somnia Data Streams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="
          min-h-screen
          flex flex-col
          bg-gradient-to-b
          from-black via-[#0b1a33] to-black
          text-white
        "
      >
        <ClientProvider>
          <Header />

          {/* MAIN CONTENT (fills the screen between header and footer) */}
          <main className="flex-1 w-full px-4 md:px-0 max-w-6xl mx-auto py-6">
            {children}
          </main>

          <Footer />
        </ClientProvider>
      </body>
    </html>
  );
}
