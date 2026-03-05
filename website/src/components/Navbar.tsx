import { Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.25)' }}>
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Kaay</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#security" className="text-gray-300 hover:text-white transition-colors">
              Security
            </a>
            <a href="#chains" className="text-gray-300 hover:text-white transition-colors">
              Chains
            </a>
            <a href="#faq" className="text-gray-300 hover:text-white transition-colors">
              FAQ
            </a>
            <button className="px-6 py-2 bg-gradient-to-r from-neon-blue to-neon-blue rounded-lg font-semibold text-white hover:scale-105 transition-transform shadow-lg shadow-blue-500/30" onClick={() => window.open('http://localhost:3000', '_blank')}>
              Launch Wallet
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-lg border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            <a
              href="#features"
              className="block py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a
              href="#security"
              className="block py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Security
            </a>
            <a
              href="#chains"
              className="block py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Chains
            </a>
            <a
              href="#faq"
              className="block py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              FAQ
            </a>
            <button className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-blue rounded-lg font-semibold text-white shadow-lg shadow-blue-500/30" onClick={() => window.open('http://localhost:3000', '_blank')}>
              Launch Wallet
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
