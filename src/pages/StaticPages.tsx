import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Mail, Phone, MapPin, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface StaticPagesProps {
  page: 'about' | 'contact' | 'faqs' | 'shipping-policy' | 'returns-policy' | 'privacy-policy' | 'terms';
  onNavigateToShop: () => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ page, onNavigateToShop }) => {
  const { showToast } = useStore();

  // Contact form
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your message has been sent to our customer care team', 'success');
  };

  const faqs = [
    {
      q: 'What makes SMART BUY fabrics distinct?',
      a: 'We use 260+ GSM combed organic cotton and genuine 100% Normandy flax linen. Our fabrics undergo a pre-shrunk silicone enzyme wash, ensuring long-lasting durability, minimal shrinkage, and an effortlessly refined drape.',
    },
    {
      q: 'How long does delivery take across India?',
      a: 'Orders typically dispatch within 24 hours from our Bengaluru central hub. Metro cities (Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Kolkata) receive shipments within 1 to 3 business days. Non-metro regions receive delivery within 3 to 5 business days.',
    },
    {
      q: 'What is your return and exchange policy?',
      a: 'We offer an unconditional 14-day return and size-exchange guarantee. You can initiate a doorstep pickup request directly from your Account Dashboard. Once picked up, refunds are credited back to your original payment mode or UPI within 24 hours.',
    },
    {
      q: 'Is Cash on Delivery (COD) available?',
      a: 'Yes, Cash on Delivery is available across 19,000+ PIN codes in India. A nominal ₹49 handling fee applies to cover physical verification logistics.',
    },
    {
      q: 'How do I care for my linen and heavyweight garments?',
      a: 'For pure linen, machine wash cold on a gentle cycle and hang dry in shade. Light damp ironing retains a smooth finish, or embrace natural relaxed creases. For heavyweight cotton tees, wash inside out in cold water.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
      {/* ABOUT US */}
      {page === 'about' && (
        <div className="space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-[#D8C7B5]/40 shadow-xs">
          <div>
            <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
              Brand Manifesto
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#171715] mt-1">
              About SMART BUY
            </h1>
            <p className="text-sm font-semibold text-[#30372B] mt-2 font-mono">
              "Your Style. Your Choice. Smart Buy."
            </p>
          </div>

          <div className="prose text-xs sm:text-sm text-[#77736D] leading-relaxed space-y-4">
            <p>
              Founded in 2026, SMART BUY was born out of a simple observation: modern Indian customers were forced to choose between disposable fast fashion with synthetic blends, or exorbitant international designer brands charging 8x retail markups.
            </p>
            <p>
              We established SMART BUY to prove that thoughtful craftsmanship, architectural silhouettes, and organic European textiles can be made accessible at honest, smart prices.
            </p>
            <div className="p-6 bg-[#F7F3EE] rounded-2xl border border-[#D8C7B5]/40 text-[#171715] space-y-2">
              <h4 className="font-display font-bold text-base">Our 3 Core Commitments:</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Textile Integrity:</strong> No cheap synthetic polyester fillers. Strictly organic cotton and natural French flax.</li>
                <li><strong>Architectural Cuts:</strong> Proportions tested on real human bodies to achieve that relaxed, confident drape.</li>
                <li><strong>Radical Transparency:</strong> Fair wages for artisans and straightforward pricing without gimmicks.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT US */}
      {page === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white p-6 sm:p-10 rounded-3xl border border-[#D8C7B5]/40 shadow-xs">
          <div className="md:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
                Customer Care
              </span>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#171715] mt-1">
                Contact Us
              </h1>
              <p className="text-xs text-[#77736D] mt-2">
                Have a question about fit, custom orders, or your delivery? We are here to help.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#30372B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#171715]">Email Support</p>
                  <p className="text-[#77736D]">care@smartbuy.in (24hr response)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#30372B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#171715]">Toll-Free Phone</p>
                  <p className="text-[#77736D]">+91 1800-209-8899 (Mon–Sat 9AM–7PM IST)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#30372B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#171715]">Studio & Headquarters</p>
                  <p className="text-[#77736D]">SMART BUY Apparel Studio, 4th Floor, Indiranagar 100ft Road, Bengaluru, Karnataka 560038, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            {submitted ? (
              <div className="p-8 bg-[#F7F3EE] rounded-2xl text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-display font-bold text-base text-[#171715]">Message Received</h3>
                <p className="text-xs text-[#77736D]">
                  Thank you, {contactName}. A customer care specialist will reply to {contactEmail} within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[#171715]">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#171715]">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. priya@example.com"
                    className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#171715]">Subject</label>
                  <input
                    type="text"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="e.g. Sizing query for Boxy Tee"
                    className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#171715]">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="How can we assist you today?"
                    className="w-full p-2.5 bg-[#F7F3EE] rounded-xl border border-[#D8C7B5] focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#171715] hover:bg-[#30372B] text-white text-xs font-bold uppercase rounded-xl transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FAQS */}
      {page === 'faqs' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#D8C7B5]/40 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-mono font-medium tracking-widest text-[#77736D] uppercase">
              Help Desk
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#171715] mt-1">
              Frequently Asked Questions
            </h1>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-[#D8C7B5]/40 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#171715]"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-[#77736D] leading-relaxed border-t border-[#D8C7B5]/20 bg-[#F7F3EE]/30">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHIPPING POLICY */}
      {page === 'shipping-policy' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#D8C7B5]/40 shadow-xs space-y-6 text-xs sm:text-sm text-[#77736D] leading-relaxed">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#171715]">
            Shipping & Delivery Policy
          </h1>
          <p>
            SMART BUY provides reliable all-India express delivery through logistics partners Delhivery, Blue Dart, and Bluedart Surface.
          </p>
          <h4 className="font-bold text-[#171715] text-sm">Shipping Charges:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Orders above ₹999: <strong>FREE Standard Express Shipping</strong></li>
            <li>Orders below ₹999: Flat ₹99 delivery charge</li>
            <li>Air Priority Expedited (1-2 Days): Optional ₹149 add-on</li>
          </ul>
        </div>
      )}

      {/* RETURNS POLICY */}
      {page === 'returns-policy' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#D8C7B5]/40 shadow-xs space-y-6 text-xs sm:text-sm text-[#77736D] leading-relaxed">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#171715]">
            14-Day Returns & Exchange Policy
          </h1>
          <p>
            We stand behind every stitch. If an item doesn't fit or meet your exact expectations, you may return or exchange it within 14 calendar days of delivery.
          </p>
          <h4 className="font-bold text-[#171715] text-sm">Simple 3-Step Return:</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Visit your Account Dashboard and tap "Request Return / Exchange".</li>
            <li>Select your pickup address and exchange size or refund method.</li>
            <li>Our courier will collect the package directly from your doorstep. Refunds are credited within 24 hours.</li>
          </ol>
        </div>
      )}

      {/* PRIVACY POLICY */}
      {page === 'privacy-policy' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#D8C7B5]/40 shadow-xs space-y-4 text-xs sm:text-sm text-[#77736D] leading-relaxed">
          <h1 className="font-display font-extrabold text-2xl text-[#171715]">Privacy Policy</h1>
          <p>
            At SMART BUY Apparel, we respect your privacy. We collect basic contact and shipping information solely to process orders, verify payments via Razorpay, and communicate delivery updates.
          </p>
          <p>
            We never sell, rent, or trade your personal information with external advertisers.
          </p>
        </div>
      )}

      {/* TERMS & CONDITIONS */}
      {page === 'terms' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#D8C7B5]/40 shadow-xs space-y-4 text-xs sm:text-sm text-[#77736D] leading-relaxed">
          <h1 className="font-display font-extrabold text-2xl text-[#171715]">Terms & Conditions</h1>
          <p>
            By using SMART BUY (smartbuy.in), you agree to these terms governing product purchases, payment authorizations, and delivery guarantees under the Consumer Protection (E-Commerce) Rules of India.
          </p>
        </div>
      )}
    </div>
  );
};
