"use client";

export default function TermsOfService() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing or using the Oceanora platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site."
    },
    {
      title: "2. Booking and Payments",
      content: "All bookings are subject to availability. Prices are listed in USD/TZS and are inclusive of local taxes unless otherwise stated. Full payment or a deposit may be required at the time of booking to secure your reservation."
    },
    {
      title: "3. Cancellations and Refunds",
      content: "Cancellation policies vary by property and service. Please review the specific cancellation terms provided during the booking process. Refunds, if applicable, will be processed according to the stated policy for each booking."
    },
    {
      title: "4. User Responsibilities",
      content: "You are responsible for providing accurate and complete information during the booking process. You agree to comply with the rules and regulations of the service providers (hotels, car rentals, etc.) you book through our platform."
    },
    {
      title: "5. Limitation of Liability",
      content: "Oceanora acts as an agent for service providers and is not responsible for the acts or omissions of these third parties. We are not liable for any personal injury, property damage, or financial loss incurred while using the services booked via our platform."
    },
    {
      title: "6. Governing Law",
      content: "These terms are governed by and construed in accordance with the laws of Zanzibar, Tanzania, and you irrevocably submit to the exclusive jurisdiction of the courts in that location."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 mb-4">
            Terms of Service
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Last updated: April 19, 2026
          </p>
        </header>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-8 leading-relaxed">
            Welcome to Oceanora. These terms govern your use of our platform and the services we provide. Please read them carefully to understand your rights and obligations.
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
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Legal Inquiries</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-0">
              For any legal questions or clarification regarding these terms, please contact us at{" "}
              <a href="mailto:ibnsunmday@gmail.com" className="text-blue-600 dark:text-cyan-400 font-medium hover:underline">
                ibnsunmday@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
