import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight, Sparkles, Users, FileText, BarChart3, CheckCircle2, ArrowUpRight } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard/pipeline');
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] overflow-hidden">
      {/* Ambient background shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-[#6366F1]/[0.04] to-transparent blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-[#10B981]/[0.03] to-transparent blur-3xl" />
      </div>

      {/* Navigation */}
      <header className="relative z-50">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-1">
              <span className="text-2xl font-semibold tracking-tight text-[#1a1a1a]">
                Enrol
              </span>
              <span className="text-2xl font-semibold tracking-tight text-[#6366F1]">
                Studio
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-[15px] text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-[15px] text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="text-[15px] text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors">
                Sign in
              </Link>
            </div>

            <Link href="/signup" className="hidden md:block">
              <Button className="bg-[#1a1a1a] hover:bg-[#333] text-white text-[15px] px-5 h-11 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-black/10">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Link href="/signup" className="md:hidden">
              <Button size="sm" className="bg-[#1a1a1a] text-white rounded-full">
                Start Free
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 md:pt-24 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            {/* Left content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6366F1]/[0.08] mb-8">
                <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[13px] font-medium text-[#6366F1]">
                  Built for training providers
                </span>
              </div>

              <h1 className="font-serif text-[3.25rem] md:text-[4rem] lg:text-[4.5rem] leading-[1.05] tracking-tight text-[#1a1a1a] mb-6">
                The simple way to{' '}
                <span className="relative">
                  enrol
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 8.5C47.3333 3.16667 147.6 -3.4 198 8.5" stroke="#6366F1" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span>{' '}
                students.
              </h1>

              <p className="text-lg md:text-xl text-[#1a1a1a]/60 leading-relaxed mb-10 max-w-md">
                Stop wrestling with clunky CRMs. Create beautiful application forms and manage your pipeline in minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link href="/signup">
                  <Button className="bg-[#6366F1] hover:bg-[#5558E3] text-white text-base px-8 h-14 rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-[#6366F1]/20 hover:-translate-y-0.5">
                    Start for free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login" className="group flex items-center gap-2 text-[15px] font-medium text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors">
                  Watch demo
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              {/* Social proof */}
              <div className="mt-12 pt-8 border-t border-[#1a1a1a]/[0.06]">
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[
                      'bg-gradient-to-br from-[#F59E0B] to-[#D97706]',
                      'bg-gradient-to-br from-[#6366F1] to-[#4F46E5]',
                      'bg-gradient-to-br from-[#10B981] to-[#059669]',
                      'bg-gradient-to-br from-[#EC4899] to-[#DB2777]',
                    ].map((bg, i) => (
                      <div key={i} className={`w-10 h-10 rounded-full ${bg} border-2 border-[#FAF9F7] flex items-center justify-center text-white text-xs font-medium`}>
                        {['SJ', 'MK', 'AR', 'LP'][i]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a]">Trusted by 500+ training providers</p>
                    <p className="text-sm text-[#1a1a1a]/50">across Australia & New Zealand</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right visual - Dashboard preview */}
            <div className="relative lg:pl-8">
              <div className="relative">
                {/* Main card */}
                <div className="relative bg-white rounded-3xl shadow-2xl shadow-black/[0.08] border border-black/[0.04] overflow-hidden">
                  {/* Browser bar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-black/[0.04] bg-[#FAFAFA]">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                      <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-48 h-6 bg-black/[0.04] rounded-lg" />
                    </div>
                  </div>
                  
                  {/* Pipeline preview */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-lg font-semibold text-[#1a1a1a]">Student Pipeline</div>
                      <div className="text-sm text-[#1a1a1a]/40">12 applicants</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { stage: 'Applied', count: 5, color: '#6366F1' },
                        { stage: 'Reviewing', count: 4, color: '#F59E0B' },
                        { stage: 'Enrolled', count: 3, color: '#10B981' },
                      ].map((col, i) => (
                        <div key={i} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[#1a1a1a]/70">{col.stage}</span>
                            <span className="text-xs text-[#1a1a1a]/40">{col.count}</span>
                          </div>
                          <div className="space-y-2">
                            {Array.from({ length: col.count }).slice(0, 2).map((_, j) => (
                              <div 
                                key={j} 
                                className="p-3 bg-[#FAFAFA] rounded-xl border border-black/[0.03]"
                                style={{ borderLeftColor: col.color, borderLeftWidth: 3 }}
                              >
                                <div className="w-20 h-2.5 bg-black/[0.06] rounded mb-2" />
                                <div className="w-14 h-2 bg-black/[0.04] rounded" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl shadow-black/[0.08] p-4 border border-black/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1a1a]">New enrolment</p>
                      <p className="text-xs text-[#1a1a1a]/50">Sarah just enrolled</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl shadow-black/[0.08] p-4 border border-black/[0.04]">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-semibold text-[#6366F1]">94%</div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1a1a]">Completion</p>
                      <p className="text-xs text-[#1a1a1a]/50">This month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-[#6366F1] mb-4">Features</p>
              <h2 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-4">
                Everything you need, nothing you don't.
              </h2>
              <p className="text-lg text-[#1a1a1a]/60 max-w-2xl mx-auto">
                Built specifically for training providers. No complex setup, no steep learning curve.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: FileText,
                  color: '#6366F1',
                  title: 'Beautiful Forms',
                  description: 'Create branded application forms in minutes. Embed anywhere, collect everything you need.',
                },
                {
                  icon: Users,
                  color: '#10B981',
                  title: 'Visual Pipeline',
                  description: 'See all applicants at a glance. Drag and drop to move students through your workflow.',
                },
                {
                  icon: BarChart3,
                  color: '#F59E0B',
                  title: 'Simple Analytics',
                  description: 'Track conversion rates and identify bottlenecks. Make data-driven decisions.',
                },
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="group relative p-8 rounded-3xl bg-[#FAFAFA] hover:bg-white border border-transparent hover:border-black/[0.04] hover:shadow-xl hover:shadow-black/[0.03] transition-all duration-300"
                >
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${feature.color}10` }}
                  >
                    <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3">{feature.title}</h3>
                  <p className="text-[#1a1a1a]/60 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration callout */}
        <section className="py-24 bg-[#FAF9F7]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-12 md:p-16">
              {/* Subtle grid pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
              
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 mb-6">
                    <Sparkles className="h-4 w-4 text-[#10B981]" />
                    <span className="text-sm font-medium text-white/80">New integration</span>
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
                    Connects with LearnStudio
                  </h2>
                  <p className="text-lg text-white/60 mb-8">
                    When students are enrolled, they automatically get access to your courses in LearnStudio. Zero manual work.
                  </p>
                  <Link href="/signup">
                    <Button className="bg-white text-[#1a1a1a] hover:bg-white/90 text-base px-6 h-12 rounded-xl">
                      Learn more
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-white">ES</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ArrowRight className="h-6 w-6 text-white/40" />
                    <span className="text-xs text-white/40">auto-sync</span>
                  </div>
                  <div className="w-20 h-20 rounded-2xl bg-[#22C55E]/20 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-[#22C55E]">LS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6">
              Ready to simplify enrolments?
            </h2>
            <p className="text-lg text-[#1a1a1a]/60 mb-10">
              Join hundreds of training providers who've switched to a simpler way to manage students.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button className="bg-[#6366F1] hover:bg-[#5558E3] text-white text-base px-8 h-14 rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-[#6366F1]/20">
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-[#1a1a1a]/50">
                No credit card required • Free forever for small teams
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-black/[0.04]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1 text-[#1a1a1a]/50 text-sm">
                <span>Built with</span>
                <span className="text-red-500">♥</span>
                <span>in Melbourne</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-[#1a1a1a]/50">
                <Link href="/privacy" className="hover:text-[#1a1a1a] transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-[#1a1a1a] transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
