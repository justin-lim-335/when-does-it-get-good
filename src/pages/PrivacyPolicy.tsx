// src/pages/PrivacyPolicy.tsx

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-gray-200">
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6 text-white">Privacy Policy</h1>
        <p className="mb-6">Effective Date: October 16, 2025</p>

        <p className="mb-4">
          When Does It Get Good (“the Site”) values your privacy. This Privacy Policy explains how we collect, use, and protect information when you use our Site, including the voting interface and show information API.
        </p>

        <ol className="list-decimal list-inside space-y-4">
          <li>
            <strong>Information We Collect</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>Email address for account creation and verification.</li>
              <li>Usage data collected automatically via analytics (e.g., Vercel Analytics) for site improvements.</li>
              <li>No personally identifiable information is shared with third parties for advertising.</li>
            </ul>
          </li>

          <li>
            <strong>Use of Information</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>To create and verify user accounts.</li>
              <li>To send major updates or notifications relevant to your account or the Site.</li>
              <li>To improve Site functionality and user experience via anonymous analytics.</li>
            </ul>
          </li>

          <li>
            <strong>Public Data & API</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>All votes and show information served via our API are public and do not contain personal user information.</li>
              <li>Individual user votes are never exposed through the API.</li>
            </ul>
          </li>

          <li>
            <strong>Third-Party Services</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>The Site uses third-party services including TMDB, Supabase, Vercel, and Render for data, authentication, hosting, and analytics.</li>
              <li>These services may collect data as described in their own privacy policies.</li>
            </ul>
          </li>

          <li>
            <strong>Security</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>We implement reasonable measures to protect your account and data.</li>
              <li>No system is completely secure; we cannot guarantee absolute protection.</li>
            </ul>
          </li>

          <li>
            <strong>Changes</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>We may update this Privacy Policy at any time. Continued use of the Site constitutes acceptance of the revised policy.</li>
            </ul>
          </li>

          <li>
            <strong>Contact</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>For questions regarding privacy, reach out via <a href="mailto:whendoesitgg@gmail.com" className="text-blue-400 hover:underline">whendoesitgg@gmail.com</a>.</li>
            </ul>
          </li>
        </ol>
      </main>
    </div>
  );
}
