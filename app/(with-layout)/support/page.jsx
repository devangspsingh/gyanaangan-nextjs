import Link from 'next/link';
import { Heart, ShieldCheck, Sparkles } from 'lucide-react';
import RazorpayButton from '@/components/mine/ui/RazorpayButton';

export const metadata = {
  title: 'Support GyanAangan',
  description: 'Support GyanAangan to help keep university notes, PYQs, and educational resources 100% free for students.',
  openGraph: {
    title: 'Support GyanAangan',
    description: 'Support GyanAangan to help keep university notes, PYQs, and educational resources 100% free for students.',
  },
};

export default function SupportPage() {
  return (
    <div className="relative min-h-[calc(100vh-theme(space.32))] flex flex-col justify-center items-center px-4 py-8">
      {/* Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-gradient-to-tr from-orange-600/25 via-amber-500/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md mx-auto space-y-6 text-center">
        
        {/* Simple Heading & Note */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">GyanAangan</span>
          </h1>

          <p className="text-sm text-gray-300 max-w-sm mx-auto leading-relaxed">
            Help us keep running the website, server, and domain, and keep maintaining the platform. Thank you!
          </p>
        </div>

        {/* High-Contrast, Glowing CTA Card */}
        <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-b from-orange-500/80 via-amber-500/40 to-slate-700/60 shadow-[0_0_60px_-15px_rgba(249,115,22,0.45)]">
          <div className="rounded-[23px] bg-slate-900/95 backdrop-blur-2xl p-6 sm:p-8 space-y-5 border border-white/10">
            
            {/* Razorpay Button - Auto opens payment modal & prominent CTA */}
            <div className="relative py-2 flex justify-center">
              <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full -z-10" />
              <RazorpayButton buttonId="pl_SkRvaNApeOAmRk" autoOpen={true} />
            </div>

            {/* Trust & Security */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-1.5 text-gray-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Secure via Razorpay</span>
              </div>
              <span className="hidden sm:inline text-gray-600">•</span>
              <span>UPI, Cards, NetBanking</span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline-offset-4 hover:underline"
          >
            ← Back to GyanAangan Home
          </Link>
        </div>

      </div>
    </div>
  );
}
