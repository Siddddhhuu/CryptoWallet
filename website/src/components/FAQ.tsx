import { Plus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Is the wallet secure?',
    answer: 'Yes, absolutely. Your wallet is protected with military-grade encryption, and you maintain full control of your private keys. We never have access to your funds or recovery phrase.',
  },
  {
    question: 'What chains are supported?',
    answer: 'We support 100+ blockchains including Ethereum, Bitcoin, Polygon, Binance Smart Chain, Solana, Avalanche, and many more. New chains are added regularly.',
  },
  {
    question: 'Is it non-custodial?',
    answer: 'Yes, this is a fully non-custodial wallet. You own your private keys and have complete control over your assets. We cannot access, freeze, or manage your funds.',
  },
  {
    question: 'Are there any fees?',
    answer: 'The wallet itself is completely free to use. You only pay standard network gas fees when making transactions. Our built-in swap feature offers competitive rates with transparent pricing.',
  },
  {
    question: 'Can I use it on mobile and desktop?',
    answer: 'Yes! Our wallet is available as a browser extension for Chrome, Firefox, and Edge, as well as native mobile apps for iOS and Android. Your wallets sync seamlessly across all devices.',
  },
  {
    question: 'How do I recover my wallet?',
    answer: 'You can recover your wallet using the 12 or 24-word seed phrase provided during setup. Keep this phrase secure and never share it with anyone. With your seed phrase, you can restore your wallet on any device.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 py-20 bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMS4xLS45LTItMi0yaC00Yy0xLjEgMC0yIC45LTIgMnY0YzAgMS4xLjkgMiAyIDJoNGMxLjEgMCAyLS45IDItMnYtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Frequently Asked
            <span className="bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent"> Questions</span>
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to know about our wallet
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <h3 className="text-lg font-semibold text-white pr-8">
                  {faq.question}
                </h3>
                <Plus
                  className={`w-6 h-6 text-neon-cyan flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-45' : ''
                    }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-48' : 'max-h-0'
                  }`}
              >
                <div className="px-6 pb-6">
                  <p className="text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 rounded-lg font-semibold text-white hover:scale-105 transition-transform shadow-lg shadow-blue-500/30">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}
