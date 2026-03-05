import { ArrowUpRight, ArrowDownLeft, Eye, Copy } from 'lucide-react';

export default function WalletPreview() {
  return (
    <section id="wallet-preview" className="scroll-mt-20 py-20 bg-gray-900 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-neon-blue/20 to-neon-cyan/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Beautiful
            <span className="bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent"> Wallet Interface</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Manage your assets with an intuitive, modern design
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Total Balance</p>
                  <h3 className="text-4xl font-bold text-white">$24,581.32</h3>
                  <p className="text-green-400 text-sm mt-1">+12.5% this week</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                    <Eye className="w-5 h-5 text-gray-300" />
                  </button>
                  <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                    <Copy className="w-5 h-5 text-gray-300" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Ethereum', symbol: 'ETH', amount: '2.45', value: '$4,890.00', change: '+5.2%', color: 'from-blue-500 to-indigo-500', icon: 'Ξ' },
                  { name: 'Bitcoin', symbol: 'BTC', amount: '0.28', value: '$12,640.00', change: '+3.8%', color: 'from-orange-500 to-yellow-500', icon: '₿' },
                  { name: 'USDT', symbol: 'USDT', amount: '7,051.32', value: '$7,051.32', change: '0.0%', color: 'from-green-500 to-teal-500', icon: '₮' },
                ].map((token, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${token.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <span className="text-xl font-bold text-white">{token.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{token.name}</h4>
                        <p className="text-gray-400 text-sm">{token.amount} {token.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{token.value}</p>
                      <p className={`text-sm ${token.change.startsWith('+') ? 'text-green-400' : 'text-gray-400'}`}>
                        {token.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-pink-500/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Send</h3>
                <p className="text-gray-400 text-sm">Transfer crypto to any address</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-blue rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <ArrowDownLeft className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Receive</h3>
                <p className="text-gray-400 text-sm">Get your wallet address & QR</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-pink-500/10 to-blue-500/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
              <h3 className="text-xl font-bold text-white mb-6">NFT Gallery</h3>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="aspect-square bg-gradient-to-br from-blue-500/20 to-pink-500/20 rounded-xl border border-white/10 hover:scale-105 transition-transform cursor-pointer overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🎨
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white font-semibold transition-all">
                View All NFTs
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
              <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { type: 'Received', amount: '+0.5 ETH', time: '2 hours ago' },
                  { type: 'Sent', amount: '-0.2 BTC', time: '5 hours ago' },
                  { type: 'Swapped', amount: '1000 USDT', time: '1 day ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white text-sm font-semibold">{activity.type}</p>
                      <p className="text-gray-400 text-xs">{activity.time}</p>
                    </div>
                    <p className="text-white text-sm font-semibold">{activity.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
