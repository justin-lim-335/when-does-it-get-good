// src/pages/TermsOfUse.tsx

export default function TermsOfUse() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-gray-200">
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6 text-white">Terms of Use</h1>
        <p className="mb-6">Effective Date: October 16, 2025</p>

        <p className="mb-4">
          Welcome to When Does It Get Good (“the Site”). By using our Site and services, including our voting interface and show information API, you agree to the following terms:
        </p>

        <ol className="list-decimal list-inside space-y-4">
          <li>
            <strong>Use of the Site</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>The Site is for personal, non-commercial use.</li>
              <li>Users may vote on shows and access public show information only.</li>
              <li>You may not attempt to scrape, copy, or exploit the Site for commercial purposes.</li>
            </ul>
          </li>

          <li>
            <strong>Account Responsibility</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>You may need to create an account using your email.</li>
              <li>Keep your login information confidential.</li>
              <li>You are responsible for all activity under your account.</li>
            </ul>
          </li>

          <li>
            <strong>Content & Data</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>All show information is sourced from third-party services (e.g., TMDB). We do not guarantee completeness or accuracy.</li>
              <li>Users may only interact with the Site for voting. No other content submissions are permitted.</li>
            </ul>
          </li>

          <li>
            <strong>Limitations & Liability</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>The Site is provided “as-is” and we disclaim all warranties.</li>
              <li>We are not liable for data inaccuracies, service interruptions, or other losses.</li>
            </ul>
          </li>

          <li>
            <strong>Changes</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>We may update these Terms at any time. Continued use constitutes acceptance of the revised Terms.</li>
            </ul>
          </li>

          <li>
            <strong>Governing Law</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>These Terms are governed by international standards and applicable local laws.</li>
            </ul>
          </li>

          <li>
            <strong>Contact</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>For questions regarding the Terms, reach out via <a href="mailto:whendoesitgg@gmail.com" className="text-blue-400 hover:underline">whendoesitgg@gmail.com</a>.</li>
            </ul>
          </li>
        </ol>
      </main>
    </div>
  );
}
