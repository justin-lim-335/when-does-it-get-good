// src/pages/Terms.tsx
export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">Terms of Service</h1>
      <p className="text-gray-600 mb-6">
        These Terms of Service govern your use of this website and related services. By using our
        site, you agree to abide by the terms outlined below.
      </p>

      <div className="space-y-5 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-medium text-gray-800">1. Use of Service</h2>
          <p>
            You agree to use this website in compliance with all applicable laws and not for any
            unlawful or prohibited purpose.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-gray-800">2. Account Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password and
            for restricting access to your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-gray-800">3. Modifications</h2>
          <p>
            We reserve the right to modify these terms at any time. Updates will be posted on this
            page.
          </p>
        </section>
      </div>
    </div>
  );
}
