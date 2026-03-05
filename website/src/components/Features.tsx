import { Shield, Zap, Image, ArrowLeftRight, Layers, Blocks } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure & Non-Custodial',
    description: 'Your keys, your crypto. Full control with military-grade encryption.',
    gradient: 'from-blue-500 to-pink-500',
  },
  {
    icon: Layers,
    title: 'Multi-Chain Support',
    description: 'Access 100+ blockchains from a single, unified interface.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast Transactions',
    description: 'Send and receive crypto in seconds with optimized gas fees.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Image,
    title: 'NFT Management',
    description: 'View, manage, and showcase your entire NFT collection.',
    gradient: 'from-green-500 to-teal-500',
  },
  {
    icon: ArrowLeftRight,
    title: 'Built-in Swap',
    description: 'Trade tokens instantly with the best rates across DEXs.',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Blocks,
    title: 'DeFi & DApps Integration',
    description: 'Connect seamlessly to thousands of decentralized applications.',
    gradient: 'from-pink-500 to-rose-500',
  },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20 bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMS4xLS45LTItMi0yaC00Yy0xLjEgMC0yIC45LTIgMnY0YzAgMS4xLjkgMiAyIDJoNGMxLjEgMCAyLS45IDItMnYtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Powerful Features for
            <span className="bg-gradient-to-r from-neon-blue to-neon-cyan bg-clip-text text-transparent"> Modern Crypto</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to manage your digital assets in one secure place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

              <div className={`relative w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3 relative">
                {feature.title}
              </h3>

              <p className="text-gray-400 relative">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
