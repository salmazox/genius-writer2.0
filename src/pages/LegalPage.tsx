
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const LegalPage: React.FC = () => {
  const { t } = useThemeLanguage();
  const location = useLocation();
  
  // Determine default tab based on URL, but allow switching
  const defaultTab = location.pathname.includes('privacy') ? 'privacy' 
                   : location.pathname.includes('terms') ? 'terms' 
                   : 'imprint';
                   
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'imprint'>(defaultTab as any);

  const TabButton = ({ id, label }: { id: 'privacy' | 'terms' | 'imprint', label: string }) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
      >
          {label}
      </button>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-20 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tab Navigation */}
        <div className="flex justify-center gap-2 mb-10 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 w-fit mx-auto shadow-sm">
            <TabButton id="imprint" label={t('legal.imprintTitle')} />
            <TabButton id="privacy" label={t('legal.privacyTitle')} />
            <TabButton id="terms" label={t('legal.termsTitle')} />
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">{t('legal.lastUpdated')}</p>
            
            <div className="prose dark:prose-invert prose-indigo max-w-none">
                
                {/* --- IMPRINT (IMPRESSUM) --- */}
                {activeTab === 'imprint' && (
                    <>
                        <h1>{t('legal.imprintTitle')}</h1>
                        <p>Information according to § 5 TMG</p>
                        
                        <h3>Company Information</h3>
                        <p>
                            <strong>Genius Writer GmbH</strong><br/>
                            Silicon Allee 42<br/>
                            10115 Berlin<br/>
                            Germany
                        </p>

                        <h3>Represented by</h3>
                        <p>CEO: Alex Morgan</p>

                        <h3>Contact</h3>
                        <p>
                            Email: contact@geniuswriter.com<br/>
                            Phone: +49 (0) 30 12345678
                        </p>

                        <h3>Register Entry</h3>
                        <p>
                            Entry in the Handelsregister.<br/>
                            Registering Court: Amtsgericht Berlin-Charlottenburg<br/>
                            Registration Number: HRB 123456
                        </p>

                        <h3>VAT ID</h3>
                        <p>
                            Sales tax identification number according to § 27 a of the Sales Tax Law:<br/>
                            DE 123 456 789
                        </p>

                        <h3>Dispute Resolution</h3>
                        <p>The European Commission provides a platform for online dispute resolution (OS): <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.<br/>
                        We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.</p>
                    </>
                )}

                {/* --- PRIVACY POLICY (DSGVO) --- */}
                {activeTab === 'privacy' && (
                    <>
                        <h1>{t('legal.privacyTitle')}</h1>
                        <p>We take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the statutory data protection regulations (DSGVO/GDPR) and this privacy policy.</p>

                        <h3>1. Data Controller</h3>
                        <p>The responsible party for data processing on this website is:</p>
                        <p>
                            Genius Writer GmbH<br/>
                            Silicon Allee 42, 10115 Berlin, Germany<br/>
                            contact@geniuswriter.com
                        </p>

                        <h3>2. Collection and Processing of Data</h3>
                        <p><strong>a) Server Log Files</strong><br/>
                        The provider of the pages automatically collects and stores information in so-called server log files, which your browser automatically transmits to us. These are: Browser type/version, OS used, Referrer URL, Hostname of accessing computer, Time of request, IP address. This data is not merged with other data sources. The basis for data processing is Art. 6 (1) (f) DSGVO, which permits the processing of data to fulfill a contract or for pre-contractual measures.</p>

                        <p><strong>b) Contact Form</strong><br/>
                        If you send us inquiries via the contact form, your details from the inquiry form, including the contact details you provided there, will be stored by us for the purpose of processing the inquiry and in case of follow-up questions. We do not pass on this data without your consent (Art. 6 (1) (a) DSGVO).</p>

                        <h3>3. Use of AI & Data Processing</h3>
                        <p>When you use our AI tools (Gemini API), the text you input is sent to Google's servers for processing. 
                        <strong>We do not use your personal input data to train our public models.</strong> 
                        Google processes this data to generate the response and deletes it after a short retention period unless you opt-in to history storage.</p>

                        <h3>4. Your Rights (DSGVO)</h3>
                        <p>You have the following rights regarding your data:</p>
                        <ul>
                            <li><strong>Right to information (Art. 15 DSGVO):</strong> You have the right to request information about your stored data, its origin, its recipients, and the purpose of its collection at no charge.</li>
                            <li><strong>Right to rectification (Art. 16 DSGVO):</strong> You have the right to request that it be corrected.</li>
                            <li><strong>Right to erasure (Art. 17 DSGVO):</strong> You have the right to request that your data be deleted ("Right to be forgotten").</li>
                            <li><strong>Right to restriction of processing (Art. 18 DSGVO):</strong> You have the right to request restriction of processing of your personal data.</li>
                            <li><strong>Right to data portability (Art. 20 DSGVO):</strong> You have the right to have data which we process based on your consent or in fulfillment of a contract automatically delivered to yourself or to a third party in a standard, machine-readable format.</li>
                        </ul>
                        <p>If you wish to exercise any of these rights, please contact us at privacy@geniuswriter.com.</p>

                        <h3>5. Cookies</h3>
                        <p>Our website uses cookies. Some are necessary for the technical operation of the website (Art. 6 (1) (f) DSGVO). Other cookies (Analytics, Marketing) are only set with your explicit consent (Art. 6 (1) (a) DSGVO). You can change your cookie preferences at any time via the settings in the footer.</p>
                    </>
                )}

                {/* --- TERMS OF SERVICE --- */}
                {activeTab === 'terms' && (
                    <>
                        <h1>{t('legal.termsTitle')}</h1>
                        
                        <h3>1. Scope of Application</h3>
                        <p>These General Terms and Conditions (GTC) apply to all business relationships between Genius Writer GmbH (hereinafter: "Provider") and its customers (hereinafter: "Customer").</p>

                        <h3>2. Subject of the Contract</h3>
                        <p>The provider offers SaaS (Software as a Service) solutions for AI-supported text generation. The specific scope of services results from the product description on the website.</p>

                        <h3>3. Registration</h3>
                        <p>Use of the full service requires registration. The customer is obliged to provide truthful information during registration.</p>

                        <h3>4. Copyright & Usage Rights</h3>
                        <p>The customer receives a simple, non-transferable right to use the software for the duration of the contract. The content generated by the AI becomes the property of the customer upon creation.</p>

                        <h3>5. Liability</h3>
                        <p>The provider is liable for intent and gross negligence. Liability for slight negligence is excluded, unless essential contractual obligations are violated. The provider does not guarantee the factual correctness of AI-generated texts.</p>

                        <h3>6. Final Provisions</h3>
                        <p>The law of the Federal Republic of Germany applies. The place of jurisdiction is Berlin.</p>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
