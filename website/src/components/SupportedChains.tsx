import { Hexagon } from 'lucide-react';

const chains = [
  { name: 'Mainnet', color: 'from-blue-500 to-indigo-500', symbol: 'M' },
  { name: 'Infura', color: 'from-blue-500 to-cyan-500', symbol: '∞' },
  { name: 'Sepolia', color: 'from-orange-500 to-yellow-500', symbol: 'S' },
  { name: 'XDC', color: 'from-yellow-500 to-amber-500', symbol: 'X' },
  { name: 'TXDC', color: 'from-pink-500 to-rose-500', symbol: 'T' },
  { name: 'Volta', color: 'from-green-500 to-emerald-500', symbol: 'V' },
];

export default function SupportedChains() {
  return (
    <section id="chains" className="scroll-mt-20 py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMS4xLS45LTItMi0yaC00Yy0xLjEgMC0yIC45LTIgMnY0YzAgMS4xLjkgMiAyIDJoNGMxLjEgMCAyLS45IDItMnYtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Supported
            <span className="bg-gradient-to-r from-blue-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg"> Networks</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Access all Kaay supported networks from one unified wallet interface
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {chains.map((chain, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-white/20 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

              <div className="relative flex flex-col items-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${chain.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-2xl transition-shadow`}>
                  <span className="text-2xl font-bold text-white">{chain.symbol}</span>
                </div>
                <h3 className="text-sm font-semibold text-white">{chain.name}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full text-gray-300">
            <Hexagon className="w-5 h-5 text-neon-cyan" />
            <span className="text-sm">More networks coming soon</span>
          </div>
        </div>
      </div>
    </section>
  );
}
