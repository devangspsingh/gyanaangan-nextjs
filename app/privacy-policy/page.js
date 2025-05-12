import Header from '../../components/Header'; // Adjust path as necessary

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 26, 2023"; // Example date, keep dynamic if possible
  const siteUrl = "https://gyanaangan.in"; // Example URL
  const contactEmail = "dspscpy@gmail.com"; // Example email
  const siteName = "Gyan Aangan";

  return (
    <>
      
      <main className="container mx-auto px-4 py-8 text-gray-300">
        <div className="max-w-3xl mx-auto bg-stone-800 p-6 md:p-8 rounded-lg shadow-md prose prose-invert prose-headings:text-white prose-a:text-primary-light hover:prose-a:text-primary">
          <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-6">Last updated: {lastUpdated}</p>

          <p>At {siteName}, accessible from <a href={siteUrl}>{siteUrl}</a>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that are collected and recorded by {siteName} and how we use it.</p>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">1. Information We Collect</h2>
          <p><strong>Personal Data:</strong> When you sign in, we collect your basic public data to provide you with enhanced services. We do not collect any other form of data.</p>
          <p><strong>Usage Data:</strong> We may collect information on how the service is accessed and used, including but not limited to IP addresses, browser type, and usage patterns.</p>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">2. Use of Data</h2>
          <p>{siteName} uses the collected data for various purposes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To provide customer support</li>
            <li>To monitor the usage of our service</li>
            <li>To detect, prevent, and address technical issues</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">3. Data Security</h2>
          <p>We strive to use commercially acceptable means to protect your Personal Data. However, remember that no method of transmission over the Internet or method of electronic storage is 100% secure.</p>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">4. Third-Party Services</h2>
          <p>We use Google Analytics as a third-party service to monitor and analyze the use of our service. Your interaction with Google Analytics is governed by their own terms and conditions.</p>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">5. Links to Other Sites</h2>
          <p>Our service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.</p>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">6. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <p>Email: <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
        </div>
      </main>
    </>
  );
}
