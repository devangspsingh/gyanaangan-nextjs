'use client'
import { useTheme } from "@/context/ThemeContext";

function DynamicBackground() {
  const { currentTheme } = useTheme(); // Consume theme from context
  return (
    <div
      className="fixed inset-0 bg-repeat bg-center -z-10"
      style={{
        backgroundImage: `url('/svg/${currentTheme}')`, // Use theme from context
        backgroundSize: '200px auto',
        backgroundRepeat: 'repeat',
        opacity: 0.15,
        transition: 'background-image 0.5s ease-in-out', // Smooth transition
      }}
    ></div>
  );
}


export default DynamicBackground