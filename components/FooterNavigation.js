import Link from 'next/link';
import { FaRegCopyright } from "react-icons/fa"; // Using react-icons for copyright symbol

const FooterNavigation = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative bg-gray-950/50 backdrop-blur-sm border-t border-gray-700/50 text-gray-400 text-sm overflow-hidden">
      
      {/* Stylized Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[18vw] md:text-[12vw] font-black text-white/40 tracking-tighter leading-none whitespace-nowrap font-heading-main">
          GyanAangan.in
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pb-52 pt-12 md:pb-42 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex items-center">
          <FaRegCopyright className="mr-2" /> 
          <span>{currentYear} GyanAangan.in All rights reserved.</span>
        </div>
        <nav className="flex space-x-6">
          <Link href="/terms-and-conditions" className="hover:text-primary-light transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/privacy-policy" className="hover:text-primary-light transition-colors">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default FooterNavigation;
