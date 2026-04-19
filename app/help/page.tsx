"use client";

import { useState } from "react";

const faqCategories = [
  {
    id: "general",
    title: "General",
    questions: [
      {
        q: "What is Oceanora?",
        a: "Oceanora is Zanzibar's premier luxury booking platform, offering curated stays, transport solutions, and authentic cultural tours tailored to your needs."
      },
      {
        q: "Do I need an account to book?",
        a: "While you can browse listings without an account, creating one allows you to manage your bookings, track your history, and receive personalized recommendations."
      }
    ]
  },
  {
    id: "bookings",
    title: "Bookings",
    questions: [
      {
        q: "How do I make a booking?",
        a: "Simply find a listing you love (Hotel, Apartment, Car, or Tour), select your dates, and click 'Book Now'. Follow the checkout process to secure your reservation."
      },
      {
        q: "Can I book for large groups?",
        a: "Yes! Many of our listings support large groups. For specific group arrangements or corporate retreats, please contact our concierge via WhatsApp."
      }
    ]
  },
  {
    id: "payments",
    title: "Payments",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept major credit cards (Visa, Mastercard), mobile money (M-Pesa, Tigopesa), and bank transfers. In some cases, you can pay at the property."
      },
      {
        q: "Is my payment secure?",
        a: "Yes, we use industry-standard encryption and secure third-party payment gateways to ensure your financial information is always protected."
      }
    ]
  },
  {
    id: "cancellation",
    title: "Cancellation",
    questions: [
      {
        q: "How do I cancel a booking?",
        a: "You can cancel your booking through your user dashboard or by contacting us directly. Please check the specific cancellation policy for your booking first."
      },
      {
        q: "When will I receive my refund?",
        a: "Refunds are typically processed within 5-10 business days, depending on your bank and the cancellation terms of the service provider."
      }
    ]
  }
];

export default function HelpCenter() {
  const [activeCategory, setActiveCategory] = useState("general");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-16 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-6">
            How can we <span className="text-blue-600 dark:text-cyan-400">help you?</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about our platform, bookings, and services. 
            If you need further assistance, our concierge is just a message away.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Categories Sidebar */}
          <div className="lg:col-span-3">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
              {faqCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-200 text-left ${
                    activeCategory === cat.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </nav>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-9">
            <div className="space-y-6">
              {faqCategories
                .find((cat) => cat.id === activeCategory)
                ?.questions.map((faq, index) => (
                  <div
                    key={index}
                    className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                      {faq.q}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
            </div>

            {/* Support CTA */}
            <div className="mt-12 p-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl text-white shadow-xl shadow-blue-500/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
                  <p className="text-blue-50 leading-relaxed">
                    Can&apos;t find what you&apos;re looking for? Reach out to our dedicated support team.
                  </p>
                </div>
                <div className="flex gap-4">
                  <a
                    href="https://wa.me/255674020254"
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 bg-white text-blue-600 font-bold rounded-2xl hover:bg-zinc-50 transition-colors"
                  >
                    WhatsApp Support
                  </a>
                  <a
                    href="mailto:ibnsunmday@gmail.com"
                    className="px-6 py-3 bg-blue-700/50 text-white font-bold rounded-2xl border border-white/20 hover:bg-blue-700/70 transition-colors"
                  >
                    Email Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
