import Link from 'next/link';
import { FaRegCopyright } from "react-icons/fa"; // Using react-icons for copyright symbol

const FooterNavigation = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-gray-950/50 backdrop-blur-sm border-t border-gray-700/50 text-gray-400 text-sm">
      <div className="max-w-screen-xl mx-auto pb-26 py-6 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex items-center">
          <FaRegCopyright className="mr-2" /> 
          <span>{currentYear} GyanAangan.in All rights reserved.</span>
        </div>
        <nav className="flex space-x-4">
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
