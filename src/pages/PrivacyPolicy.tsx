// src/pages/Privacy.tsx
export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">Privacy Policy</h1>
      <p className="text-gray-600 mb-6">
        Your privacy is important to us. This policy explains how we collect, use, and protect your
        information.
      </p>

      <div className="space-y-5 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-medium text-gray-800">1. Information We Collect</h2>
          <p>
            We collect account information such as your email and username, as well as limited usage
            data to improve your experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-gray-800">2. How We Use Your Data</h2>
          <p>
            Your information is used solely to provide and enhance our services. We do not sell your
            personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-gray-800">3. Data Security</h2>
          <p>
            We implement reasonable measures to safeguard your information, though no method of
            transmission over the Internet is completely secure.
          </p>
        </section>
      </div>
    </div>
  );
}
