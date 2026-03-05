import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'DeFi Trader',
    image: '👩‍💼',
    content: 'The best crypto wallet I\'ve used. The multi-chain support and built-in swap feature make managing my portfolio incredibly easy.',
    rating: 5,
  },
  {
    name: 'Marcus Williams',
    role: 'NFT Collector',
    image: '👨‍🎨',
    content: 'Finally, a wallet that showcases my NFTs beautifully. The security features give me peace of mind while the interface is stunning.',
    rating: 5,
  },
  {
    name: 'Elena Rodriguez',
    role: 'Crypto Enthusiast',
    image: '👩‍💻',
    content: 'Lightning fast transactions and the lowest fees I\'ve seen. This wallet has become essential for my daily crypto activities.',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-20 py-20 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Trusted by
            <span className="bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent"> Millions</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See what our users are saying about their experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity rounded-2xl"></div>

              <div className="relative">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-blue rounded-full flex items-center justify-center text-2xl shadow-lg">
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full">
            <div className="flex -space-x-2">
              {['👨', '👩', '👨‍💼', '👩‍💻', '👨‍🎨'].map((avatar, i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-blue rounded-full flex items-center justify-center border-2 border-gray-800 text-sm"
                >
                  {avatar}
                </div>
              ))}
            </div>
            <span className="text-gray-300 text-sm ml-2">
              Join <span className="font-bold text-white">2M+</span> users worldwide
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
