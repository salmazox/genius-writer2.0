
import React from 'react';
import { Mail, MapPin, Clock, Send, Building, Users } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const ContactInfoCard: React.FC<{ icon: React.ReactNode; title: string; value: string; subtext?: string }> = ({ icon, title, value, subtext }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{title}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">{value}</p>
            {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
    </div>
);

const ContactPage: React.FC = () => {
  const { t } = useThemeLanguage();

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{t('contact.title')}</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t('contact.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Contact Info */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('contact.infoTitle')}</h2>
                
                <ContactInfoCard 
                    icon={<Building size={20}/>}
                    title={t('contact.sales')}
                    value={t('contact.salesEmail')}
                    subtext="For enterprise inquiries & demos"
                />
                <ContactInfoCard 
                    icon={<Users size={20}/>}
                    title={t('contact.support')}
                    value={t('contact.supportEmail')}
                    subtext="For technical issues & billing"
                />
                <ContactInfoCard 
                    icon={<MapPin size={20}/>}
                    title={t('contact.address')}
                    value={t('contact.addressVal')}
                />
                <ContactInfoCard 
                    icon={<Clock size={20}/>}
                    title={t('contact.hours')}
                    value={t('contact.hoursVal')}
                />

                {/* Enterprise Box */}
                <div className="mt-8 p-6 bg-indigo-600 rounded-2xl text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2">Enterprise Needs?</h3>
                    <p className="text-indigo-100 text-sm mb-4">Need custom integrations, SSO, or unlimited seats? Talk to our sales team directly.</p>
                    <button className="w-full py-2 bg-white text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors">
                        Schedule Demo
                    </button>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('contact.name')}</label>
                            <input type="text" id="name" className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border transition-colors" placeholder={t('contact.placeholderName')} />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('contact.email')}</label>
                            <input type="email" id="email" className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border transition-colors" placeholder={t('contact.placeholderEmail')} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                        <select id="subject" className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border transition-colors">
                            <option>General Inquiry</option>
                            <option>Support Request</option>
                            <option>Enterprise Sales</option>
                            <option>Partnership</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('contact.message')}</label>
                        <textarea id="message" rows={6} className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border transition-colors resize-none" placeholder={t('contact.placeholderMessage')}></textarea>
                    </div>
                    <button type="submit" className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:-translate-y-0.5">
                        <Send size={18} />
                        {t('contact.send')}
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
