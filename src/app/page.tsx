import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Sparkles, Users, FileText } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If logged in, go to dashboard
  if (user) {
    redirect('/dashboard/pipeline');
  }

  // Landing page for logged out users - Flat Design + Vibrant
  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      {/* Header */}
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-[#1E1B4B]">
            Enrol<span className="text-[#6366F1]">Studio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-[#1E1B4B]/70 hover:text-[#6366F1] transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link href="/signup">
              <Button className="bg-[#10B981] hover:bg-[#059669] text-white btn-micro">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm text-[#6366F1] font-medium mb-6 border border-indigo-100">
            <Sparkles className="w-4 h-4" />
            Built for training providers
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#1E1B4B] mb-6 leading-tight">
            Application forms + student pipeline.
            <br />
            <span className="text-[#818CF8]">That&apos;s it.</span>
          </h1>
          <p className="text-xl text-[#1E1B4B]/60 mb-8">
            Stop paying for features you don&apos;t use. Simple tools for people who train people.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button 
                size="lg" 
                className="gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white btn-micro px-8"
              >
                Start Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-[#6366F1]/30 text-[#6366F1] hover:bg-[#6366F1]/5 btn-micro"
              >
                View Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-indigo-100 card-micro">
            <div className="w-14 h-14 bg-[#6366F1]/10 rounded-xl flex items-center justify-center mb-6 feature-icon">
              <FileText className="w-7 h-7 text-[#6366F1]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1E1B4B] mb-3">Simple Forms</h3>
            <p className="text-[#1E1B4B]/60 leading-relaxed">
              Create beautiful application forms in minutes. Customizable branding, no complexity.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-indigo-100 card-micro">
            <div className="w-14 h-14 bg-[#10B981]/10 rounded-xl flex items-center justify-center mb-6 feature-icon">
              <Users className="w-7 h-7 text-[#10B981]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1E1B4B] mb-3">Visual Pipeline</h3>
            <p className="text-[#1E1B4B]/60 leading-relaxed">
              See all applicants at a glance. Drag and drop to update status instantly.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-indigo-100 card-micro">
            <div className="w-14 h-14 bg-[#818CF8]/10 rounded-xl flex items-center justify-center mb-6 feature-icon">
              <CheckCircle className="w-7 h-7 text-[#818CF8]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1E1B4B] mb-3">Made for Training</h3>
            <p className="text-[#1E1B4B]/60 leading-relaxed">
              Purpose-built for certification and training providers. No bloat.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to simplify your enrolments?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Join training providers who&apos;ve ditched complex CRMs for something that just works.
          </p>
          <Link href="/signup">
            <Button 
              size="lg" 
              className="bg-white text-[#6366F1] hover:bg-white/90 btn-micro px-8"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-100 py-8 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 text-center text-[#1E1B4B]/50 text-sm">
          Built in Melbourne 🇦🇺
        </div>
      </footer>
    </div>
  );
}
