import React from 'react';

const Loading = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '90vh', // Ensure it takes full viewport height
      textAlign: 'center'
    }}>
      {/* You might need to adjust the path and dimensions for your logo */}
      <img 
        src="/images/logo white.png" // Example path, adjust as needed
        alt="Gyan Aangan Logo" 
        width={150} // Example width
        height={150} // Example height
        priority={1}// Preleroad the logo if it's critical for LCP
      />
  
    </div>
  );
};

export default Loading;