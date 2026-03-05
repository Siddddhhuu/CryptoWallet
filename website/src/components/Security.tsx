import { Shield, Lock, Fingerprint, Eye } from 'lucide-react';

const securityFeatures = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'All data is encrypted locally before leaving your device.',
  },
  {
    icon: Shield,
    title: 'Private Key Ownership',
    description: 'You own your keys. We never have access to your funds.',
  },
  {
    icon: Fingerprint,
    title: 'Biometric Protection',
    description: 'Secure your wallet with Face ID or fingerprint authentication.',
  },
  {
    icon: Eye,
    title: 'Open Source Verification',
    description: 'Our code is audited and verified by the community.',
  },
];

export default function Security() {
  return (
    <section id="security" className="scroll-mt-20 py-20 bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Security You Can
              <span className="bg-gradient-to-r from-neon-blue to-neon-cyan bg-clip-text text-transparent"> Trust</span>
            </h2>

            <p className="text-xl text-gray-400 mb-12">
              Built with industry-leading security standards to protect your digital assets at all times.
            </p>

            <div className="space-y-6">
              {securityFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-blue rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg border border-white/10 rounded-3xl p-12 hover:border-white/20 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl animate-pulse"></div>

              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-neon-blue to-neon-blue rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/50 animate-glow">
                  <Shield className="w-16 h-16 text-white" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-300 text-sm">Encryption Status</span>
                    <span className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-300 text-sm">Security Score</span>
                    <span className="text-neon-cyan text-sm font-semibold">100/100</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-300 text-sm">Last Security Audit</span>
                    <span className="text-gray-400 text-sm">Dec 2026</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 w-24 h-24 bg-neon-blue/20 rounded-full blur-2xl animate-float"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-neon-cyan/30 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
