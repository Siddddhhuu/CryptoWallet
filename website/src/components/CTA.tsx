import { Wallet, ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section id="cta" className="scroll-mt-20py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent"></div>

      <div className="absolute top-10 left-10 w-72 h-72 bg-neon-blue/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-neon-cyan/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg border border-white/10 rounded-3xl p-12 md:p-16 text-center hover:border-white/20 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl"></div>

          <div className="relative">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Ready to Manage Your
              <br />
              <span className="bg-gradient-to-r from-neon-blue via-neon-blue to-neon-cyan bg-clip-text text-transparent">
                Crypto Assets?
              </span>
            </h2>

            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Access your wallet anytime, anywhere. Full control, maximum security.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="group relative px-8 py-5 bg-gradient-to-r from-neon-blue to-neon-blue rounded-xl font-semibold text-white overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 min-w-[240px]">
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Wallet className="w-6 h-6" />
                  Launch Wallet Now
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              <button className="px-8 py-5 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl font-semibold text-white hover:bg-white/10 transition-all hover:scale-105 flex items-center gap-3 min-w-[240px] justify-center">
                <ArrowRight className="w-6 h-6" />
                View Documentation
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Free to use
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Fully encrypted
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Open source
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
