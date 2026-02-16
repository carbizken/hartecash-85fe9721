import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import harteLogo from "@/assets/harte-logo.png";
import {
  Car, Users, Shield, Zap, BarChart3, ChevronRight, ChevronLeft,
  Maximize2, Minimize2, CheckCircle2, XCircle, Clock, DollarSign,
  Smartphone, FileText, Camera, CalendarDays, UserCheck, Lock,
  TrendingUp, Award, ArrowRight, Globe, Layers, Eye, Star
} from "lucide-react";

const SLIDES = [
  "title",
  "problem",
  "competition",
  "cookie-cutter",
  "solution",
  "customer-experience",
  "employee-experience",
  "smart-workflow",
  "mobile-first",
  "security",
  "comparison",
  "why-wins",
  "cta",
] as const;

type SlideId = typeof SLIDES[number];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const SlideWrapper = ({ children, id, isPresenting, currentSlide }: { children: React.ReactNode; id: SlideId; isPresenting: boolean; currentSlide: SlideId }) => {
  if (isPresenting) {
    if (id !== currentSlide) return null;
    return (
      <div className="w-full h-full flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-6xl">{children}</div>
      </div>
    );
  }
  return (
    <section id={id} className="min-h-screen flex items-center justify-center px-4 py-16 md:py-24">
      <div className="w-full max-w-6xl">{children}</div>
    </section>
  );
};

const SectionBadge = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
    <Icon className="w-4 h-4" />
    {label}
  </div>
);

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <motion.div variants={fadeUp} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const ComparisonRow = ({ feature, us, them }: { feature: string; us: boolean; them: boolean }) => (
  <div className="grid grid-cols-3 gap-4 py-3 border-b border-border/50 items-center">
    <span className="text-sm font-medium text-foreground">{feature}</span>
    <div className="flex justify-center">
      {us ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-muted-foreground/40" />}
    </div>
    <div className="flex justify-center">
      {them ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-muted-foreground/40" />}
    </div>
  </div>
);

export default function PitchDeck() {
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = SLIDES[currentIndex];

  const goNext = useCallback(() => setCurrentIndex(i => Math.min(i + 1, SLIDES.length - 1)), []);
  const goPrev = useCallback(() => setCurrentIndex(i => Math.max(i - 1, 0)), []);

  const togglePresent = useCallback(() => {
    if (!isPresenting) {
      document.documentElement.requestFullscreen?.();
      setIsPresenting(true);
    } else {
      document.exitFullscreen?.();
      setIsPresenting(false);
    }
  }, [isPresenting]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPresenting) return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "Escape") { setIsPresenting(false); document.exitFullscreen?.(); }
    };
    const handleFs = () => { if (!document.fullscreenElement) setIsPresenting(false); };
    window.addEventListener("keydown", handleKey);
    document.addEventListener("fullscreenchange", handleFs);
    return () => { window.removeEventListener("keydown", handleKey); document.removeEventListener("fullscreenchange", handleFs); };
  }, [isPresenting, goNext, goPrev]);

  const presentingContainer = isPresenting
    ? "fixed inset-0 z-[9999] bg-background overflow-hidden flex flex-col"
    : "";

  return (
    <div className={presentingContainer || "min-h-screen bg-background"}>
      {/* Floating toolbar */}
      <div className={`fixed ${isPresenting ? "bottom-4" : "top-4"} right-4 z-[10000] flex items-center gap-2`}>
        {isPresenting && (
          <>
            <span className="text-xs text-muted-foreground bg-card/80 backdrop-blur px-3 py-1.5 rounded-full border border-border">
              {currentIndex + 1} / {SLIDES.length}
            </span>
            <button onClick={goPrev} disabled={currentIndex === 0} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur border border-border flex items-center justify-center hover:bg-card disabled:opacity-30 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={goNext} disabled={currentIndex === SLIDES.length - 1} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur border border-border flex items-center justify-center hover:bg-card disabled:opacity-30 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        <button onClick={togglePresent} className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition print:hidden">
          {isPresenting ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          {isPresenting ? "Exit" : "Present"}
        </button>
      </div>

      {/* ===================== SLIDES ===================== */}
      <AnimatePresence mode="wait">
        {/* 1 — TITLE */}
        <SlideWrapper id="title" isPresenting={isPresenting} currentSlide={currentSlide} key={isPresenting ? currentSlide : "title"}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
            <motion.img src={harteLogo} alt="Harte Auto Group" className="h-20 mx-auto mb-8" variants={fadeUp} custom={0} />
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6">
              The Modern Way to Buy<br />Cars <span className="text-primary">Directly from Consumers</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A custom-built, branded acquisition platform that turns your dealership into a competitive direct-buy powerhouse.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Cash in 24 Hours</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Fully Branded</span>
              <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> End-to-End Pipeline</span>
            </motion.div>
          </motion.div>
        </SlideWrapper>

        {/* 2 — THE PROBLEM */}
        <SlideWrapper id="problem" isPresenting={isPresenting} currentSlide={currentSlide} key={isPresenting ? currentSlide : "problem"}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionBadge icon={TrendingUp} label="The Problem" />
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
              Your Customers Are Selling<br />to Your <span className="text-destructive">Competitors</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg text-muted-foreground max-w-2xl mb-12">
              Every day, consumers who would sell their car to YOUR dealership are instead going to CarMax and Carvana — because those companies made it easy.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="grid md:grid-cols-3 gap-6">
              {[
                { stat: "70%", label: "of consumers research selling online before visiting a dealer" },
                { stat: "$3,200", label: "average profit left on the table per missed direct-buy opportunity" },
                { stat: "45%", label: "of trade-ins go to CarMax or Carvana instead of the servicing dealer" },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6 text-center">
                  <p className="text-4xl font-extrabold text-primary mb-2">{item.stat}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </SlideWrapper>

        {/* 3 — COMPETITION */}
        <SlideWrapper id="competition" isPresenting={isPresenting} currentSlide={currentSlide} key={isPresenting ? currentSlide : "competition"}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionBadge icon={Award} label="The Competition" />
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
              CarMax & Carvana Set the Bar.<br />We <span className="text-primary">Raise It.</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg text-muted-foreground max-w-2xl mb-12">
              They built billion-dollar businesses on one simple idea: make selling a car easy. But they have no relationship with YOUR customer. You do.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="grid md:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-xl p-8">
                <h3 className="text-xl font-bold text-foreground mb-4">What They Do Well</h3>
                <ul className="space-y-3">
                  {["Instant online offers", "Simple user experience", "Fast payment process", "National brand recognition"].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card border border-border rounded-xl p-8">
                <h3 className="text-xl font-bold text-foreground mb-4">Where They Fall Short</h3>
                <ul className="space-y-3">
                  {["No local relationship with the customer", "Low-ball offers to maximize resale margin", "No service history or loyalty data", "Impersonal, transactional experience"].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </SlideWrapper>

        {/* 4 — COOKIE CUTTER */}
        <SlideWrapper id="cookie-cutter" isPresenting={isPresenting} currentSlide={currentSlide} key={isPresenting ? currentSlide : "cookie-cutter"}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionBadge icon={Layers} label="The Status Quo" />
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
              Cookie-Cutter Tools<br /><span className="text-destructive">Don't Cut It</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg text-muted-foreground max-w-2xl mb-12">
              Every vendor sells the same white-label widget. Same form. Same flow. Zero differentiation. Your dealership deserves better.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="grid md:grid-cols-2 gap-8">
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-8">
                <h3 className="text-xl font-bold text-destructive mb-6">❌ Generic Plug-and-Play</h3>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  {[
                    "Same look as every other dealer",
                    "No deal pipeline or workflow",
                    "Leads go into a black hole",
                    "No role-based permissions",
                    "No document or photo management",
                    "No appointment scheduling",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3"><XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-8">
                <h3 className="text-xl font-bold text-primary mb-6">✅ Our Platform</h3>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  {[
                    "Fully branded to YOUR dealership",
                    "10-stage managed deal pipeline",
                    "Role-based staff dashboard",
                    "Built-in appraisal & check requests",
                    "Photo & document collection system",
                    "Integrated appointment scheduling",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </SlideWrapper>

        {/* 5 — OUR SOLUTION */}
        <SlideWrapper id="solution" isPresenting={isPresenting} currentSlide={currentSlide} key={isPresenting ? currentSlide : "solution"}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionBadge icon={Star} label="The Solution" />
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
              A Complete <span className="text-primary">Direct-Buy Platform</span><br />Built for Your Dealership
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg text-muted-foreground max-w-2xl mb-12">
              Not a widget. Not a plugin. A full-featured acquisition system that handles every step from lead capture to check cutting.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="grid md:grid-cols-3 gap-6">
              <FeatureCard icon={Globe} title="Customer-Facing Portal" description="Branded landing page with guided form, personalized customer dashboard, real-time status tracking, and mobile-optimized uploads." />
              <FeatureCard icon={Users} title="Staff Command Center" description="Role-based admin dashboard with deal pipeline, appraisal tracking, document management, and one-click check requests." />
              <FeatureCard icon={Shield} title="Enterprise Security" description="Role-based access control, rate limiting, anti-spam protection, and encrypted file storage — built from the ground up." />
            </motion.div>
          </motion.div>
        </SlideWrapper>

        {/* 6 — CUSTOMER EXPERIENCE */}
        <SlideWrapper id="customer-experience" isPresenting={isPresenting} currentSlide={currentSlide} key={isPresenting ? currentSlide : "customer-experience"}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionBadge icon={Car} label="Customer Experience" />
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
              Selling a Car Should Feel<br /><span className="text-primary">This Easy</span>
            </motion.h2>
            <motion.div variants={fadeUp} custom={1} className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="space-y-6">
                {[
                  { icon: FileText, title: "Smart Multi-Step Form", desc: "Vehicle info, build details, condition history, and contact — all in a guided 5-step flow with validation." },
                  { icon: Eye, title: "Personal Dashboard", desc: "Customers get a branded portal showing their submission status, offer details, and next steps in real-time." },
                  { icon: Camera, title: "Guided Photo Upload", desc: "6-category mobile photo grid (front, rear, sides, dash, interior) with automatic completion tracking." },
                  { icon: CalendarDays, title: "Schedule a Visit", desc: "One-click appointment booking pre-filled with their vehicle and contact details. Confirmation via email & SMS." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-foreground mb-6">7-Stage Progress Tracker</h3>
                {["Submission Received", "Under Review", "Initial Offer", "Inspection Scheduled", "Inspection Complete", "Final Offer Accepted", "Purchase Complete"].map((stage, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-emerald-500 text-white" : i === 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {i < 3 ? "✓" : i + 1}
                    </div>
                    <span className={`text-sm ${i < 3 ? "text-foreground font-medium" : i === 3 ? "text-primary font-semibold" : "text-muted-foreground"}`}>{stage}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </SlideWrapper>

        {/* 7 — EMPLOYEE EXPERIENCE */}
        <SlideWrapper id="employee-experience" isPresenting={isPresenting} currentSlide={currentSlide} key={isPresenting ? currentSlide : "employee-experience"}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionBadge icon={Users} label="Employee Experience" />
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
              Your Team Gets a<br /><span className="text-primary">Command Center</span>
            </motion.h2>
            <motion.div variants={fadeUp} custom={1} className="grid md:grid-cols-3 gap-6 mt-12">
              <FeatureCard icon={BarChart3} title="Analytics Dashboard" description="Total leads, conversion rates, average pipeline days, and active deals — all at a glance with real-time data." />
              <FeatureCard icon={UserCheck} title="Role-Based Access" description="Sales/BDC, Used Car Manager, GSM/GM, and Admin — each sees only what they need and can do only what's allowed." />
              <FeatureCard icon={DollarSign} title="Appraisal Tracking" description="ACV entry restricted to managers. System auto-records who appraised each vehicle with name, initial, and title." />
              <FeatureCard icon={FileText} title="Check Request System" description="One-click formatted check requests with customer details, agreed price, ACV, and signature lines for accounting." />
              <FeatureCard icon={TrendingUp} title="10-Stage Deal Pipeline" description="From New Lead to Purchase Complete with server-enforced stage gates — no skipping steps, no unauthorized approvals." />
              <FeatureCard icon={Clock} title="Activity Log" description="Complete audit trail of every status change, price update, and action taken — with timestamps and attribution." />
            </motion.div>
          </motion.div>
        </SlideWrapper>

        {/* 8 — SMART WORKFLOW */}
        <SlideWrapper id="smart-workflow" isPresenting={isPresenting} currentSlide={currentSlide} key={isPresenting ? currentSlide : "smart-workflow"}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionBadge icon={Zap} label="Smart Workflow" />
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
              Automation That<br /><span className="text-primary">Actually Works</span>
            </motion.h2>
            <motion.div variants={fadeUp} custom={1} className="grid md:grid-cols-2 gap-8 mt-12">
              {[
                { icon: "📱", title: "SMS & Email Notifications", desc: "Automatic appointment confirmations sent to both the customer and your staff via email and text message." },
                { icon: "🔍", title: "Duplicate Detection", desc: "Phone and email matching flags potential duplicate submissions instantly — no wasted effort on repeat leads." },
                { icon: "🖨️", title: "Print-Ready Records", desc: "One-click professional printouts of submission details, check requests, and appended appraisal documents." },
                { icon: "📎", title: "Document Management", desc: "Secure cloud storage for titles, registrations, Carfax reports, and window stickers — all linked to the submission." },
                { icon: "📊", title: "Pipeline Enforcement", desc: "Server-side triggers prevent unauthorized status changes. Only managers can approve, only GSM/GM can finalize." },
                { icon: "🔗", title: "QR Code Sharing", desc: "Every submission generates a unique QR code for customers to upload photos and documents from their phone." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-card border border-border rounded-xl p-6">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </SlideWrapper>

        {/* 9 — MOBILE FIRST */}
        <SlideWrapper id="mobile-first" isPresenting={isPresenting} currentSlide={currentSlide} key={isPresenting ? currentSlide : "mobile-first"}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionBadge icon={Smartphone} label="Mobile First" />
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
              Built for the Way<br /><span className="text-primary">People Actually Use Phones</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg text-muted-foreground max-w-2xl mb-12">
              80% of car sellers start on mobile. Our platform is designed mobile-first, not mobile-adapted.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="grid md:grid-cols-3 gap-6">
              <FeatureCard icon={Camera} title="Guided Photo Capture" description="6-slot photo grid with category labels. Customers know exactly what photos to take — no guessing, no back-and-forth." />
              <FeatureCard icon={FileText} title="Document Scanning" description="Upload title, registration, and ID photos directly from the phone camera. Categorized slots prevent missing docs." />
              <FeatureCard icon={ArrowRight} title="Desktop ↔ Mobile Bridge" description="QR codes on the desktop view let customers seamlessly switch to their phone for photos and documents." />
            </motion.div>
          </motion.div>
        </SlideWrapper>

        {/* 10 — SECURITY */}
        <SlideWrapper id="security" isPresenting={isPresenting} currentSlide={currentSlide} key={isPresenting ? currentSlide : "security"}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionBadge icon={Lock} label="Security & Compliance" />
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
              Enterprise-Grade Security<br /><span className="text-primary">From Day One</span>
            </motion.h2>
            <motion.div variants={fadeUp} custom={1} className="grid md:grid-cols-2 gap-6 mt-12">
              {[
                { title: "Role-Based Access Control", desc: "4-tier permission system enforced at the database level. Sales can't approve deals. BDC can't set prices." },
                { title: "Anti-Spam & Rate Limiting", desc: "Honeypot fields, submission cooldowns, and database-level rate limits prevent abuse and bot submissions." },
                { title: "Encrypted File Storage", desc: "All photos and documents stored in private cloud buckets with time-limited signed URLs for secure access." },
                { title: "Server-Side Validation", desc: "Email format, ZIP code, mileage — all validated at the database level with CHECK constraints and triggers." },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />{item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </SlideWrapper>

        {/* 11 — COMPARISON TABLE */}
        <SlideWrapper id="comparison" isPresenting={isPresenting} currentSlide={currentSlide} key={isPresenting ? currentSlide : "comparison"}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionBadge icon={BarChart3} label="Comparison" />
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-extrabold text-foreground mb-12">
              How We <span className="text-primary">Stack Up</span>
            </motion.h2>
            <motion.div variants={fadeUp} custom={1} className="bg-card border border-border rounded-2xl p-8">
              <div className="grid grid-cols-3 gap-4 pb-4 border-b-2 border-border mb-2">
                <span className="text-sm font-bold text-muted-foreground">Feature</span>
                <span className="text-sm font-bold text-primary text-center">Our Platform</span>
                <span className="text-sm font-bold text-muted-foreground text-center">Cookie-Cutter Tools</span>
              </div>
              <ComparisonRow feature="Fully branded to your dealership" us={true} them={false} />
              <ComparisonRow feature="Managed deal pipeline" us={true} them={false} />
              <ComparisonRow feature="Role-based staff permissions" us={true} them={false} />
              <ComparisonRow feature="In-house appraisal tracking" us={true} them={false} />
              <ComparisonRow feature="Check request generation" us={true} them={false} />
              <ComparisonRow feature="Mobile photo/doc uploads" us={true} them={false} />
              <ComparisonRow feature="Appointment scheduling" us={true} them={false} />
              <ComparisonRow feature="Customer portal with status tracking" us={true} them={false} />
              <ComparisonRow feature="SMS & email notifications" us={true} them={false} />
              <ComparisonRow feature="Activity audit trail" us={true} them={false} />
              <ComparisonRow feature="Basic lead capture form" us={true} them={true} />
            </motion.div>
          </motion.div>
        </SlideWrapper>

        {/* 12 — WHY THIS WINS */}
        <SlideWrapper id="why-wins" isPresenting={isPresenting} currentSlide={currentSlide} key={isPresenting ? currentSlide : "why-wins"}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
            <SectionBadge icon={Award} label="The Bottom Line" />
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-extrabold text-foreground mb-12">
              Why This <span className="text-primary">Wins</span>
            </motion.h2>
            <motion.div variants={fadeUp} custom={1} className="grid md:grid-cols-4 gap-6">
              {[
                { icon: DollarSign, title: "More Profit", desc: "Buy direct from consumers at wholesale, skip the auction fees, and control your own inventory pipeline." },
                { icon: Zap, title: "Faster Deals", desc: "From submission to check in hand — streamlined workflow means less time per deal, more deals per month." },
                { icon: Shield, title: "Your Brand", desc: "Not CarMax's brand. Not a vendor's brand. YOUR dealership, YOUR customer relationship, YOUR experience." },
                { icon: TrendingUp, title: "Competitive Edge", desc: "Be the only dealer in your market with a professional direct-buy platform that rivals the national players." },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </SlideWrapper>

        {/* 13 — CTA */}
        <SlideWrapper id="cta" isPresenting={isPresenting} currentSlide={currentSlide} key={isPresenting ? currentSlide : "cta"}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
            <motion.img src={harteLogo} alt="Harte Auto Group" className="h-16 mx-auto mb-8" variants={fadeUp} custom={0} />
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
              Ready to <span className="text-primary">Transform</span><br />Your Acquisition Strategy?
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Let's bring this platform to your dealership. Custom-branded, fully configured, and ready to compete with the biggest names in the industry.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:kenc@hartecars.com" className="inline-flex items-center gap-2 h-14 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition">
                Get Started <ArrowRight className="w-5 h-5" />
              </a>
              <a href="tel:8668517390" className="inline-flex items-center gap-2 h-14 px-8 rounded-xl border-2 border-primary text-primary font-bold text-lg hover:bg-primary/5 transition">
                (866) 851-7390
              </a>
            </motion.div>
            <motion.p variants={fadeUp} custom={4} className="text-sm text-muted-foreground mt-8">
              kenc@hartecars.com · Harte Auto Group · Hartford, CT
            </motion.p>
          </motion.div>
        </SlideWrapper>
      </AnimatePresence>
    </div>
  );
}
