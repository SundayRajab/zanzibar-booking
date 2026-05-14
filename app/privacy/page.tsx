"use client";

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us when you make a booking, create an account, or contact us. This may include your name, email address, phone number, payment information, and any other details relevant to your travel arrangements."
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to process your bookings, communicate with you about your travel plans, provide customer support, and improve our services. We may also use your information to send you promotional offers or updates if you have opted in to receive them."
    },
    {
      title: "3. Information Sharing",
      content: "We may share your information with third-party service providers, such as hotels, car rental companies, and tour operators, to facilitate your travel arrangements. We do not sell your personal information to third parties."
    },
    {
      title: "4. Data Security",
      content: "We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure."
    },
    {
      title: "5. Your Rights",
      content: "You have the right to access, update, or delete your personal information. If you wish to exercise any of these rights, please contact us at ibnsunmday@gmail.com."
    },
    {
      title: "6. Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 mb-4">
            Privacy Policy
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Last updated: April 19, 2026
          </p>
        </header>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-8 leading-relaxed">
            At Oceanora, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This policy outlines how we collect, use, and protect your data.
          </p>

          <div className="space-y-12">
            {sections.map((section, index) => (
              <section key={index} className="border-l-2 border-blue-500/20 pl-6 py-2">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {section.content}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-16 p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Contact Us</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-0">
              If you have any questions about our Privacy Policy, please reach out to our privacy officer at{" "}
              <a href="mailto:rajeevraheem@gmail.com" className="text-blue-600 dark:text-cyan-400 font-medium hover:underline">
                rajeevraheem@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
