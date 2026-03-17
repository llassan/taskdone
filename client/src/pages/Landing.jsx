import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { FiCheckSquare, FiSearch, FiFileText, FiStar, FiShield, FiTrendingUp, FiMessageSquare, FiCheck, FiMail, FiChevronDown, FiArrowRight, FiZap, FiAward, FiUsers, FiClock, FiTarget, FiGift } from 'react-icons/fi';

export default function Landing() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const prefix = `/${lang || 'en'}`;
  const [openFaq, setOpenFaq] = useState(null);

  const stepIcons = [FiFileText, FiShield, FiSearch, FiStar];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full opacity-40 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-200 rounded-full opacity-30 blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 text-emerald-700 px-5 py-2 rounded-full text-sm font-medium mb-8 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            {t('hero.badge')}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
            {t('hero.title1')}<br />
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">{t('hero.title2')}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-3 leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <p className="text-base font-semibold text-emerald-600 mb-3">
            {t('hero.pricing')}
          </p>
          <p className="text-sm text-gray-400 mb-10">
            {t('hero.trustBadge')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to={`${prefix}/register`} className="group bg-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200/50 hover:shadow-emerald-300/50 hover:-translate-y-0.5 flex items-center gap-2">
              {t('hero.cta')}
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {[
              { val: t('hero.stats.trial'), sub: t('hero.stats.trialSub'), icon: FiGift },
              { val: t('hero.stats.portals'), sub: t('hero.stats.portalsSub'), icon: FiTarget },
              { val: t('hero.stats.proof'), sub: t('hero.stats.proofSub'), icon: FiShield },
              { val: t('hero.stats.report'), sub: t('hero.stats.reportSub'), icon: FiFileText },
            ].map((s, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100 text-center">
                <s.icon className="mx-auto text-emerald-500 mb-1.5" size={18} />
                <div className="text-lg font-bold text-gray-900 leading-tight">{s.val}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="relative bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 md:p-14 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-100 rounded-full opacity-50 blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">{t('problem.title')}</h2>
          <div className="w-16 h-1 bg-red-400 rounded-full mb-8"></div>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700">
            {t('problem.items', { returnObjects: true }).map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-red-100/50">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">x</span>
                <span className="text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg">
            <FiZap size={16} /> {t('problem.solution')}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{t('howItWorks.title')}</h2>
            <div className="w-16 h-1 bg-emerald-500 rounded-full mx-auto mt-4"></div>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {t('howItWorks.steps', { returnObjects: true }).map((item, i) => {
              const Icon = stepIcons[i];
              const colors = [
                'from-emerald-500 to-emerald-600',
                'from-blue-500 to-blue-600',
                'from-purple-500 to-purple-600',
                'from-amber-500 to-amber-600',
              ];
              return (
                <div key={i} className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                    {i + 1}
                  </div>
                  <div className={`w-14 h-14 bg-gradient-to-br ${colors[i]} text-white rounded-2xl flex items-center justify-center text-xl mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-base">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Two Service Modes */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">{t('serviceMode.title')}</h2>
        <p className="text-center text-gray-500 mb-10">{t('serviceMode.subtitle')}</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card border-2 border-blue-200 hover:border-blue-400 transition-colors relative">
            <div className="absolute -top-3 right-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">{t('serviceMode.direct.recommended')}</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FiMail className="text-blue-600 text-2xl" />
              </div>
              <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold">{t('serviceMode.direct.tag3')}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('serviceMode.direct.title')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('serviceMode.direct.desc')}</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">{t('serviceMode.direct.tag1')}</span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">{t('serviceMode.direct.tag2')}</span>
            </div>
          </div>
          <div className="card border-2 border-emerald-200 hover:border-emerald-400 transition-colors">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
              <FiFileText className="text-emerald-600 text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('serviceMode.portal.title')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('serviceMode.portal.desc')}</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">{t('serviceMode.portal.tag1')}</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">{t('serviceMode.portal.tag2')}</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">{t('serviceMode.portal.tag3')}</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">{t('serviceMode.portal.tag4')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 py-16" id="pricing">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">{t('pricing.title')}</h2>
        <p className="text-center text-gray-500 mb-12">{t('pricing.subtitle')}</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { key: 'free', price: '₹0', features: ['Naukri only', 'Basic tracking', 'Email updates'], highlight: false },
            { key: 'starter', price: '₹499', features: ['Naukri + Indeed', 'Weekly PDF report', 'Application spreadsheet', 'Email updates'], highlight: false },
            { key: 'pro', price: '₹999', features: ['All portals', 'Custom cover letters', 'Weekly PDF + Excel', 'WhatsApp updates', 'Resume refresh', '10 interview guarantee*'], highlight: true },
            { key: 'max', price: '₹1,999', features: ['All portals', 'Custom cover letters', 'Daily reports', 'WhatsApp + voice notes', 'Resume rewrite', 'LinkedIn optimization', 'Dedicated worker', '20 interview guarantee*'], highlight: false },
          ].map((plan, i) => (
            <div key={i} className={`card border-2 relative ${plan.highlight ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-gray-100'}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                  {t('pricing.popular')}
                </div>
              )}
              {plan.key !== 'free' && (
                <div className="absolute -top-3 right-3 bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  {t(`pricing.${plan.key}.save`)}
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900">{t(`pricing.${plan.key}.name`)}</h3>
              <div className="mt-2 mb-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                {plan.key !== 'free' && <span className="text-sm text-gray-400 line-through">{t(`pricing.${plan.key}.wasPrice`)}</span>}
              </div>
              <div className="text-sm text-emerald-600 font-medium mb-4">{t(`pricing.${plan.key}.apps`)}</div>
              <ul className="space-y-2 mb-6 text-left">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                    <FiCheck className="text-emerald-500 mt-0.5 flex-shrink-0" size={14} /> {f}
                  </li>
                ))}
              </ul>
              <Link to={`${prefix}/register`}
                className={`block text-center w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${plan.highlight ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {t(`pricing.${plan.key}.cta`)}
              </Link>
            </div>
          ))}
        </div>

        {/* Mega Plan - 3 Month Discounted */}
        <div className="mt-8 max-w-3xl mx-auto">
          <div className="card border-2 border-purple-400 ring-2 ring-purple-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-4 py-1.5 rounded-bl-lg font-medium">
              {t('pricing.mega.badge')}
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{t('pricing.mega.name')}</h3>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-gray-900">₹2,499</span>
                  <span className="text-lg text-gray-400 line-through">₹5,997</span>
                  <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{t('pricing.mega.savings')}</span>
                </div>
                <div className="text-sm text-purple-600 font-medium mt-1">{t('pricing.mega.apps')}</div>
                <p className="text-sm text-gray-500 mt-2">{t('pricing.mega.desc')}</p>
              </div>
              <div className="flex-shrink-0">
                <ul className="space-y-1.5 mb-4">
                  {['all_portals', 'cover_letters', 'daily_reports', 'whatsapp', 'resume', 'linkedin', 'dedicated_team', 'guarantee'].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <FiCheck className="text-purple-500 flex-shrink-0" size={14} /> {t(`pricing.mega.features.${f}`)}
                    </li>
                  ))}
                </ul>
                <Link to={`${prefix}/register`} className="block text-center w-full py-3 rounded-lg font-medium text-sm bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                  {t('pricing.mega.cta')}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">{t('pricing.guarantee')}</p>
      </section>

      {/* Interview Guarantee */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 rounded-3xl p-10 md:p-16 text-white overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full opacity-30 blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400 rounded-full opacity-20 blur-3xl -translate-x-1/3 translate-y-1/3"></div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/20">
                <FiAward size={14} /> Guarantee
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">{t('guarantee.title')}</h2>
              <p className="text-emerald-100 text-lg leading-relaxed mb-8 max-w-lg">
                {t('guarantee.desc')}
              </p>
              <Link to={`${prefix}/register`} className="group bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all inline-flex items-center gap-2 shadow-xl">
                {t('guarantee.cta')}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex-shrink-0 hidden md:flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-extrabold">10+</div>
                  <div className="text-xs text-emerald-200 font-medium">Interviews</div>
                </div>
              </div>
              <div className="text-sm text-emerald-200 font-medium">or next month free</div>
            </div>
          </div>
        </div>
      </section>

      {/* Freshers CTA */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
                <FiUsers size={14} /> For Freshers
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{t('freshers.title')}</h2>
              <p className="text-gray-500 leading-relaxed mb-8 text-base">
                {t('freshers.desc')}
              </p>
              <Link to={`${prefix}/register`} className="group bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all inline-flex items-center gap-2 shadow-xl shadow-blue-200/50">
                {t('freshers.cta')}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 w-full md:w-auto">
              {[
                { stat: t('freshers.stat1'), label: t('freshers.stat1Label'), icon: FiTarget, gradient: 'from-blue-500 to-blue-600' },
                { stat: t('freshers.stat2'), label: t('freshers.stat2Label'), icon: FiClock, gradient: 'from-indigo-500 to-indigo-600' },
                { stat: t('freshers.stat3'), label: t('freshers.stat3Label'), icon: FiZap, gradient: 'from-violet-500 to-violet-600' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 min-w-[240px]">
                  <div className={`w-12 h-12 bg-gradient-to-br ${s.gradient} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                    <s.icon size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-gray-900">{s.stat}</div>
                    <div className="text-xs text-gray-400 font-medium">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-green-50 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <FiMessageSquare className="text-green-600 text-3xl mb-3" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('whatsapp.title')}</h2>
            <p className="text-gray-600 mb-4">
              {t('whatsapp.desc')}
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>- {t('whatsapp.daily')}</li>
              <li>- {t('whatsapp.weekly')}</li>
              <li>- {t('whatsapp.instant')}</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm max-w-xs w-full">
            <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full inline-block mb-3">WhatsApp</div>
            <div className="bg-green-50 rounded-lg p-3 text-sm text-gray-700 mb-2">
              Hi Rahul! Daily update:<br /><br />
              Applications today: <b>8</b><br />
              Total so far: <b>34</b><br /><br />
              Top companies:<br />
              1. Razorpay<br />
              2. PhonePe<br />
              3. TCS Digital<br /><br />
              — Team TaskDone
            </div>
            <div className="text-xs text-gray-400 text-right">2:45 PM</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{t('faq.title')}</h2>
          <div className="w-16 h-1 bg-emerald-500 rounded-full mx-auto mt-4"></div>
        </div>
        <div className="space-y-3">
          {t('faq.items', { returnObjects: true }).map((faq, i) => (
            <div key={i}
              className={`bg-white rounded-2xl border transition-all ${openFaq === i ? 'border-emerald-200 shadow-md shadow-emerald-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <h3 className="font-semibold text-gray-900 text-sm md:text-base pr-4">{faq.q}</h3>
                <FiChevronDown className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180 text-emerald-500' : ''}`} size={20} />
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${openFaq === i ? 'max-h-40 pb-5' : 'max-h-0'}`}>
                <p className="text-sm text-gray-500 leading-relaxed px-6">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500 rounded-full opacity-10 blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">{t('finalCta.title')}</h2>
              <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">{t('finalCta.subtitle')}</p>
              <Link to={`${prefix}/register`} className="group bg-emerald-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 inline-flex items-center gap-3">
                {t('finalCta.cta')}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
            <FiCheckSquare className="text-emerald-600" /> {t('brand')}
          </div>
          <p className="text-sm text-gray-400">{t('footer')}</p>
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} {t('brand')}</p>
        </div>
      </footer>
    </div>
  );
}
