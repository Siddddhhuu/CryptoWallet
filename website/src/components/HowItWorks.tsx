import { Wallet, Key, Coins, Send } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    number: "01",
    title: "Create Wallet",
    description:
      "Set up your secure wallet in under 60 seconds with just a few clicks.",
  },
  {
    icon: Key,
    number: "02",
    title: "Secure Your Seed Phrase",
    description:
      "Safely backup your recovery phrase. Never share it with anyone.",
  },
  {
    icon: Coins,
    number: "03",
    title: "Add Crypto Assets",
    description:
      "Import existing wallets or receive your first crypto payment.",
  },
  {
    icon: Send,
    number: "04",
    title: "Start Sending & Receiving",
    description:
      "Transact freely across multiple chains with ease and speed.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 bg-[#0a0e27] relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Get Started in
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {" "}4 Easy Steps
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join millions of users managing their crypto securely
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {steps.map((step, index) => (
            <div key={index} className="relative">

              {/* connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent -translate-x-4"></div>
              )}

              {/* card */}
              <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group">

                {/* step number */}
                <div className="absolute top-4 right-6 text-6xl font-bold text-white/10 group-hover:text-cyan-400/30 transition-all pointer-events-none">
                  {step.number}
                </div>

                {/* icon */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* title */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>

                {/* description */}
                <p className="text-gray-400 text-sm">
                  {step.description}
                </p>

              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}