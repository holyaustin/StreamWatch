import Image from "next/image";

export default function Footer() {
  return (
    <footer className="
      bg-white 
      border-t 
      py-5 
      px-6 
      text-center 
      text-sm 
      shadow-inner
      flex flex-col items-center gap-3
    ">
      <Image
        src="/streamwatchlogo.png"
        width={60}
        height={60}
        alt="StreamWatch Logo"
        className="rounded-full"
      />
      
      <p className="text-[#0b1a33] font-medium">
        StreamWatchDAO • Built with Somnia Data Streams
      </p>
    </footer>
  );
}
