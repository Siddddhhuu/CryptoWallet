import { ArrowRight, Wallet } from 'lucide-react';

export default function Hero() {
  return (
    <section id="hero" className="scroll-mt-20 relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      <div className="absolute top-20 left-10 w-32 h-32 bg-neon-blue/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-neon-cyan/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-neon-blue/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-8 animate-slide-up">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full text-sm text-gray-300">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Supporting Mainnet, Infura, Sepolia, XDC, TXDC, and Volta
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Your Secure Gateway
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
              to Web3
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Store, send, receive, and manage your crypto assets safely in one powerful wallet.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-blue rounded-lg font-semibold text-white overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50" onClick={() => window.open('http://localhost:3000', '_blank')}>
              <span className="relative z-10 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Launch Wallet
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button className="px-8 py-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg font-semibold text-white hover:bg-white/10 transition-all hover:scale-105 flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Learn More
            </button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-12">
            <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center animate-float shadow-lg shadow-orange-500/50">
              <span className="text-2xl font-bold text-white">₿</span>
            </div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-500 rounded-2xl flex items-center justify-center animate-float shadow-lg shadow-blue-500/50" style={{ animationDelay: '1s' }}>
              <span className="text-3xl font-bold text-white">Ξ</span>
            </div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center animate-float shadow-lg shadow-green-500/50" style={{ animationDelay: '2s' }}>
              <span className="text-2xl font-bold text-white">₮</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent"></div>
    </section>
  );
}
