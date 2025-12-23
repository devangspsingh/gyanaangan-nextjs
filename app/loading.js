import React from 'react';
import Image from 'next/image';

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
      <Image 
        src="/images/logo white.png"
        alt="Gyan Aangan Logo" 
        width={150}
        height={150}
        priority
      />
  
    </div>
  );
};

export default Loading;