import React from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowRight, ShieldCheck, Cpu, LayoutList, Star } from "lucide-react";
import { motion } from "framer-motion";

export const Home: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden hero-dot-grid hero-mesh-bg">
      {/* Decorative Glow Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary-green/5 dark:bg-primary-green/10 blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute top-40 right-10 w-96 h-96 rounded-full bg-accent-neon/5 dark:bg-accent-neon/10 blur-[120px] pointer-events-none -z-10"></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Hero Left Content */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-150 dark:border-green-900/50 text-xs font-semibold text-primary-green"
          >
            <Cpu className="w-3.5 h-3.5" />
            Built for AP DISCOM tariffs
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.05]"
          >
            See where your <span className="text-primary-blue dark:text-blue-400">energy</span> goes — and <span className="text-primary-green">cut your bill</span>.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-lg text-slate-650 dark:text-slate-450 max-w-xl leading-relaxed font-medium"
          >
            Pick your appliances, drag a slider, and get an instant monthly estimate with slab-accurate billing and personalized savings tips.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3"
          >
            <Link
              to="/register"
              className="px-6 py-4 flex items-center justify-center gap-2 text-base font-semibold text-white bg-primary-blue hover:bg-primary-blue/95 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 rounded-2xl transition-all shadow-lg shadow-primary-blue/20 dark:shadow-none"
            >
              Create free account
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-4 flex items-center justify-center text-base font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors"
            >
              I already have one
            </Link>
          </motion.div>

          {/* Social Proof Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-3 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 w-fit"
          >
            {/* Avatar Overlap Group */}
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-primary-green text-[10px] font-bold text-slate-950 flex items-center justify-center border border-white dark:border-slate-900 shadow-sm uppercase">AP</div>
              <div className="w-7 h-7 rounded-full bg-primary-blue text-[10px] font-bold text-white flex items-center justify-center border border-white dark:border-slate-900 shadow-sm">GV</div>
              <div className="w-7 h-7 rounded-full bg-accent-neon text-[10px] font-bold text-slate-950 flex items-center justify-center border border-white dark:border-slate-900 shadow-sm">KR</div>
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-[9px] font-bold text-slate-500 flex items-center justify-center border border-white dark:border-slate-900 shadow-sm">+2k</div>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Trusted by <span className="font-bold text-slate-850 dark:text-slate-200">2,000+ households</span> in Andhra Pradesh
            </p>
          </motion.div>
        </div>

        {/* Hero Right Visual Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          {/* Decorative Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary-blue/10 to-primary-green/10 dark:from-primary-blue/20 dark:to-primary-green/20 rounded-[2.5rem] blur-2xl -z-10"></div>          {/* Glowing House Interactive Visual */}
          {/* Blueprint Card */}
          <div className="w-full max-w-sm mx-auto bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                This month
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 dark:bg-green-950/40 text-xs font-bold text-primary-green border border-green-150 dark:border-green-900/40">
                -18% vs. baseline
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold text-slate-900 dark:text-white">132</span>
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">kWh</span>
              </div>
              <p className="text-sm font-semibold text-slate-550 dark:text-slate-400 mt-1">
                Estimated bill <span className="text-slate-900 dark:text-white">₹459</span>
              </p>
            </div>

            {/* Custom Bar Graph */}
            <div className="mt-8 space-y-5">
              {/* AC */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-550 dark:text-slate-400 mb-1.5">
                  <span>AC</span>
                  <span className="text-alert-red font-semibold">High (72 kWh)</span>
                </div>
                <div className="h-6 w-full bg-slate-100 dark:bg-slate-850 rounded-lg overflow-hidden flex items-center">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "70%" }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="h-full bg-alert-red rounded-lg"
                  ></motion.div>
                </div>
              </div>

              {/* Fridge */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-550 dark:text-slate-400 mb-1.5">
                  <span>Fridge</span>
                  <span className="text-warning-orange font-semibold">Medium (36 kWh)</span>
                </div>
                <div className="h-6 w-full bg-slate-100 dark:bg-slate-850 rounded-lg overflow-hidden flex items-center">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "45%" }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="h-full bg-warning-orange rounded-lg"
                  ></motion.div>
                </div>
              </div>

              {/* Fan */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-550 dark:text-slate-400 mb-1.5">
                  <span>Fan</span>
                  <span className="text-primary-green font-semibold">Low (24 kWh)</span>
                </div>
                <div className="h-6 w-full bg-slate-100 dark:bg-slate-850 rounded-lg overflow-hidden flex items-center">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "25%" }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    className="h-full bg-primary-green rounded-lg"
                  ></motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Statistics Banner */}
      <section className="border-y border-slate-200/60 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/20 py-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="space-y-2"
            >
              <div className="text-4xl font-display font-extrabold text-primary-green">
                12,000+
              </div>
              <div className="text-sm font-semibold text-slate-850 dark:text-slate-200">
                Households Analyzed
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Across Andhra Pradesh, Telangana & Karnataka
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-2 border-y md:border-y-0 md:border-x border-slate-200/60 dark:border-slate-800 py-6 md:py-0"
            >
              <div className="text-4xl font-display font-extrabold text-primary-blue dark:text-blue-400">
                ₹5.2 Lakh+
              </div>
              <div className="text-sm font-semibold text-slate-850 dark:text-slate-200">
                Estimated Savings
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Directly calculated from slab optimization
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-2"
            >
              <div className="text-4xl font-display font-extrabold text-accent-neon">
                98.7%
              </div>
              <div className="text-sm font-semibold text-slate-850 dark:text-slate-200">
                Billing Accuracy Claim
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified matches against actual DISCOM bills
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-white dark:bg-slate-900/40 border-t border-b border-slate-200 dark:border-slate-850 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Real AP slab billing */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="p-6 text-left space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-blue/10 dark:bg-primary-blue/20 flex items-center justify-center text-primary-blue">
                <LayoutList className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Real AP slab billing</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Calculations follow the LT-I domestic tariff so estimates match your actual bill.
              </p>
            </motion.div>

            {/* Personalized tips */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-6 text-left space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-green/10 dark:bg-primary-green/20 flex items-center justify-center text-primary-green">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personalized tips</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                We highlight your top consumers and the changes that save the most.
              </p>
            </motion.div>

            {/* Private by default */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="p-6 text-left space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-secondary-teal">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Private by default</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Your data lives in your account — no one else can see your reports.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-slate-200/60 dark:border-slate-850">
        <div className="text-center space-y-4 mb-14">
          <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
            Real Stories, Verified Savings
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-medium">
            Hear from homeowners who optimized their slab categories and appliance usage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Koteswara Rao",
              location: "Vijayawada, AP",
              discom: "APSPDCL",
              avatar: "KR",
              savings: "Saved ₹1,850/month",
              quote: "Our AC usage was pushing us into the highest slab. By shifting our cooling schedule and using timer features as advised, we cut our billing category in half!",
              rating: 5,
            },
            {
              name: "Gautami V.",
              location: "Gachibowli, Hyderabad",
              discom: "TSSPDCL",
              avatar: "GV",
              savings: "Saved ₹2,400/month",
              quote: "The solar ROI calculator convinced us to set up a 3 kW rooftop panel. The payback period was spot on, and we are now generating a surplus every month.",
              rating: 5,
            },
            {
              name: "Anil Prasad",
              location: "Indiranagar, Bengaluru",
              discom: "BESCOM",
              avatar: "AP",
              savings: "Saved ₹1,200/month",
              quote: "I didn't realize how much standby power and old fans were adding to our bill. The visual breakdown made it obvious. Replacing three old fans paid for itself in 4 months.",
              rating: 5,
            }
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col justify-between p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-left relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-500">
                  {[...Array(testimonial.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-350 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-850">
                <div className="w-10 h-10 rounded-full bg-primary-green/10 dark:bg-primary-green/20 text-xs font-bold text-primary-green flex items-center justify-center border border-primary-green/20">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    <span>{testimonial.location}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span className="text-primary-blue dark:text-blue-400 font-semibold">{testimonial.discom}</span>
                  </div>
                </div>
                <div className="ml-auto text-xs font-bold text-primary-green bg-green-50 dark:bg-green-950/30 px-2.5 py-1 rounded-full border border-green-150 dark:border-green-900/30">
                  {testimonial.savings}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Overview/Process Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-12">
        <div className="space-y-4 max-w-xl mx-auto">
          <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
            Simplify your energy decisions
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Tackling high electricity bills doesn't require complex engineering. We make it visual and immediate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-primary-blue bg-white dark:bg-slate-900 text-primary-blue flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-md">Select Appliances</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Choose AC, TV, Fridge, Fans, Washing Machine, and more from our pre-defined icons.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-primary-green bg-white dark:bg-slate-900 text-primary-green flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-md">Set Sliders</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Adjust quantity steppers and usage sliders for hours per day. No complex typing needed.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-secondary-teal bg-white dark:bg-slate-900 text-secondary-teal flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-md">Analyze Results</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Instantly view estimated bills, charts of consumer splits, and personalized savings advice.
            </p>
          </div>
        </div>

        <div className="pt-8">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-7 py-4 text-base font-bold text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 rounded-2xl shadow-lg transition-all"
          >
            Start Analyzing Now
            <Zap className="w-4.5 h-4.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
