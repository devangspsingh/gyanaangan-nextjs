'use client';

import React, { useState, useEffect } from 'react';

// Google Docs Viewer Component
const GoogleDocsViewer = ({ resourceViewUrl }) => {
  if (!resourceViewUrl) {
    return <p className="text-center text-gray-400 py-10">Google Viewer: Resource URL not available.</p>;
  }
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(resourceViewUrl)}&embedded=true`;

  // Note: Hiding specific elements (like one with class 'ndfHFb-c4YZDc-Wrql6b')
  // inside the cross-origin Google Docs iframe is not possible due to browser security policies.
  return (
    <div className="aspect-w-16 aspect-h-9 bg-stone-800 rounded-lg overflow-hidden md:min-h-[90vh] min-h-[80vh]">
      <iframe
        src={viewerUrl}
        title="Google Docs PDF Viewer"
        frameBorder="0"
        className="w-full h-full min-h-[80vh] md:min-h-[90vh]"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin" 
      ></iframe>
    </div>
  );
};

// IP Watermark Component
const IPWatermark = () => {
  const [ip, setIp] = useState('Fetching IP...');
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp('IP N/A'));
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <p className="text-primary-dark/20 text-3xl font-bold transform -rotate-12 select-none">
        Gyan Aangan
      </p>
      <p className="absolute bottom-5 right-5 text-primary-dark/20 text-xl font-bold transform select-none">
        {ip}
      </p>
    </div>
  );
};

export default function Viewer({ resource }) {
  if (!resource || !resource.privacy?.includes('view')) {
    return <p className="text-center text-gray-400 py-10">Preview not available for this resource.</p>;
  }

  const canView = resource.privacy?.includes('view');

  if (resource.resource_type !== 'video' && canView) {
    if (!resource.view_url) {
      return <p className="text-center text-gray-400 py-10">PDF preview URL is not available.</p>;
    }
    return (
      <section className="mb-8 relative">
        <h2 className="text-xl font-semibold text-white mb-3">Preview</h2>
        <GoogleDocsViewer resourceViewUrl={resource.view_url} />
        <IPWatermark />
      </section>
    );
  }

  if (resource.resource_type === 'video' && resource.embed_link && canView) {
    return (
      <section className="mb-8 relative">
        <h2 className="text-xl font-semibold text-white mb-3">Video Preview</h2>
        <div className="aspect-video bg-stone-800 rounded-lg overflow-hidden shadow">
          <iframe
            src={resource.embed_link}
            title={resource.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
        {/* <IPWatermark /> */}
      </section>
    );
  }

  // Fallback if no specific viewer is matched but view is allowed
  if (canView) {
    return <p className="text-center text-gray-400 py-10">Preview for this resource type is not currently supported, but viewing is permitted.</p>;
  }

  return <p className="text-center text-gray-400 py-10">No preview available.</p>;
}
