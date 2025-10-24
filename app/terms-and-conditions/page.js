export default function TermsAndConditionsPage() {
  // In a real app, you might fetch this content from a CMS or have it statically defined
  const lastUpdated = "October 26, 2023"; // Example date, keep dynamic if possible
  const siteUrl = "https://gyanaangan.in"; // Example URL
  const contactEmail = "gyanaangan.in@gmail.com"; // Example email

  return (
    <>
      
      <main className="container mx-auto px-4 py-8 text-gray-300">
        <div className="max-w-3xl mx-auto bg-stone-800 p-6 md:p-8 rounded-lg shadow-md prose prose-invert prose-headings:text-white prose-a:text-primary-light hover:prose-a:text-primary">
          <h1 className="text-3xl font-bold text-white mb-6">Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mb-6">Last updated: {lastUpdated}</p>

          <p>Welcome to Gyan Aangan! These terms and conditions outline the rules and regulations for the use of Gyan Aangan&apos;s Website, located at <a href={siteUrl}>{siteUrl}</a>.</p>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use Gyan Aangan if you do not agree to all of the terms and conditions stated on this page.</p>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">2. License</h2>
          <p>Unless otherwise stated, Gyan Aangan and/or its licensors own the intellectual property rights for all material on Gyan Aangan. All intellectual property rights are reserved. You may access this from Gyan Aangan for your own personal use, subject to restrictions set in these terms and conditions.</p>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">3. User Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You must not use this website in any way that is or may be damaging to this website.</li>
            <li>You must not use this website in any way that impacts user access to this website.</li>
            <li>You must not use this website contrary to applicable laws and regulations in India, specifically in Uttar Pradesh.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">4. Limitation of Liability</h2>
          <p>In no event shall Gyan Aangan, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website.</p>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">5. Indemnification</h2>
          <p>You hereby indemnify to the fullest extent Gyan Aangan from and against any and all liabilities, costs, demands, causes of action, damages, and expenses arising in any way related to your breach of any of the provisions of these terms.</p>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">6. Dispute Resolution</h2>
          <p>For any disputes or concerns, please contact us via email at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. We will do our best to resolve any issues promptly.</p>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">7. Changes to the Terms</h2>
          <p>Gyan Aangan reserves the right to revise these terms and conditions at any time as it sees fit. By using this website, you are expected to review these terms on a regular basis.</p>

          <h2 className="text-2xl font-semibold text-white mt-6 mb-3">8. Governing Law & Jurisdiction</h2>
          <p>These Terms will be governed by and interpreted in accordance with the laws of Uttar Pradesh, India, and you submit to the non-exclusive jurisdiction of the state and federal courts located in Uttar Pradesh for the resolution of any disputes.</p>
        </div>
      </main>
    </>
  );
}
