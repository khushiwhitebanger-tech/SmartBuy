import React from 'react';
import { ShieldCheck, Sparkles, CreditCard, Truck } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const benefits = [
    {
      icon: Sparkles,
      title: 'Quality You Can Trust',
      desc: '260+ GSM combed organic cotton and Normandy pure flax linen engineered for longevity and shape retention.',
    },
    {
      icon: ShieldCheck,
      title: 'Affordable Everyday Fashion',
      desc: 'Transparent direct-to-consumer pricing. No 8x middleman markups—just honest luxury-grade garments.',
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      desc: '256-bit encrypted transactions via Razorpay supporting UPI, RuPay, Visa, Mastercard, and Cash on Delivery.',
    },
    {
      icon: Truck,
      title: 'Reliable Delivery',
      desc: 'Fast express dispatch with Delhivery and Blue Dart surface tracking across 19,000+ Indian postal PIN codes.',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 border-t border-[#D8C7B5]/30">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
          The Smart Buy Standard
        </span>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#171715] mt-1">
          Why Choose SMART BUY?
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8C7B5]/40 shadow-xs flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F7F3EE] border border-[#D8C7B5]/40 flex items-center justify-center text-[#30372B] mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#171715]">
                  {b.title}
                </h3>
                <p className="text-xs text-[#77736D] mt-2 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
