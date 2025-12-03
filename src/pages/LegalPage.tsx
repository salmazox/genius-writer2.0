
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
                        <p><strong>Information according to § 5 TMG (Telemediengesetz)</strong></p>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-6">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                <strong>⚠️ Note:</strong> Please replace all bracketed [PLACEHOLDER] information below with your actual company details. The Impressum is legally required in Germany (§ 5 TMG) and must be accurate.
                            </p>
                        </div>

                        <h3>Company Information / Angaben gemäß § 5 TMG</h3>
                        <p>
                            <strong>[YOUR COMPANY NAME] [Legal Form: e.g., GmbH, UG, GbR, Einzelunternehmen]</strong><br/>
                            [Street and House Number]<br/>
                            [Postal Code] [City]<br/>
                            Germany / Deutschland
                        </p>

                        <h3>Represented by / Vertreten durch</h3>
                        <p>
                            [Managing Director / Geschäftsführer]: [Full Name]<br/>
                            [If multiple directors, list all]
                        </p>

                        <h3>Contact / Kontakt</h3>
                        <p>
                            <strong>Email:</strong> [contact@your-company.com]<br/>
                            <strong>Phone / Telefon:</strong> [+49 (0) XXX XXXXXXX]<br/>
                            <strong>Fax:</strong> [+49 (0) XXX XXXXXXX] <em>(if applicable)</em>
                        </p>

                        <h3>Commercial Register / Handelsregister</h3>
                        <p>
                            <strong>Register Court / Registergericht:</strong> [e.g., Amtsgericht Berlin-Charlottenburg]<br/>
                            <strong>Registration Number / Registernummer:</strong> [HRB XXXXX]<br/>
                            <em>(Required for GmbH, UG, AG, KGaA)</em>
                        </p>

                        <h3>VAT Identification Number / Umsatzsteuer-Identifikationsnummer</h3>
                        <p>
                            <strong>VAT ID / USt-IdNr.:</strong> [DE XXX XXX XXX]<br/>
                            <em>According to § 27a Umsatzsteuergesetz (UStG)</em>
                        </p>

                        <h3>Tax Number / Steuernummer (Alternative to VAT ID)</h3>
                        <p>
                            <strong>Tax Number / Steuernummer:</strong> [XX/XXX/XXXXX]<br/>
                            <strong>Tax Office / Finanzamt:</strong> [Name of your Finanzamt]<br/>
                            <em>(For businesses not yet having a VAT ID)</em>
                        </p>

                        <h3>Professional Liability Insurance / Berufshaftpflichtversicherung (if applicable)</h3>
                        <p>
                            <strong>Insurance Company / Versicherung:</strong> [Name of Insurance Company]<br/>
                            <strong>Scope / Geltungsbereich:</strong> [Country/Region]<br/>
                            <em>(Required for certain professions)</em>
                        </p>

                        <h3>Responsible for Content / Inhaltlich verantwortlich gemäß § 18 Abs. 2 MStV</h3>
                        <p>
                            [Full Name]<br/>
                            [Address - can be same as company address]
                        </p>

                        <h3>Dispute Resolution / Streitschlichtung</h3>

                        <h4>Online Dispute Resolution (ODR)</h4>
                        <p>
                            The European Commission provides a platform for online dispute resolution (OS): <br/>
                            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">https://ec.europa.eu/consumers/odr</a>
                        </p>
                        <p>Our email address can be found in the contact information above.</p>

                        <h4>Consumer Dispute Resolution / Verbraucherstreitbeilegung</h4>
                        <p>
                            We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.<br/>
                            <em>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</em>
                        </p>

                        <h3>Copyright / Urheberrecht</h3>
                        <p>
                            The content and works created by the site operators on these pages are subject to German copyright law.
                            The reproduction, editing, distribution, and any kind of use outside the limits of copyright law require
                            the written consent of the respective author or creator. Downloads and copies of this site are only permitted
                            for private, non-commercial use.
                        </p>
                        <p>
                            <em>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
                            Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
                            bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</em>
                        </p>

                        <h3>Liability for Links / Haftung für Links</h3>
                        <p>
                            Our website contains links to external third-party websites over whose content we have no influence.
                            Therefore, we cannot assume any liability for this external content. The respective provider or operator
                            of the pages is always responsible for the content of the linked pages.
                        </p>
                    </>
                )}

                {/* --- PRIVACY POLICY (DSGVO) --- */}
                {activeTab === 'privacy' && (
                    <>
                        <h1>{t('legal.privacyTitle')}</h1>
                        <p>We take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the statutory data protection regulations (DSGVO/GDPR) and this privacy policy.</p>

                        <h3>1. Data Controller (Verantwortliche Stelle)</h3>
                        <p>The responsible party for data processing on this website is:</p>
                        <p>
                            <strong>[YOUR COMPANY NAME]</strong><br/>
                            [Your Address]<br/>
                            [City, Postal Code], Germany<br/>
                            Email: [your-email@company.com]<br/>
                            Phone: [your-phone]
                        </p>
                        <p><em>Note: Please replace the bracketed information with your actual company details.</em></p>

                        <h3>2. Collection and Storage of Personal Data</h3>

                        <h4>2.1 Server Log Files</h4>
                        <p>The provider of the pages automatically collects and stores information in so-called server log files, which your browser automatically transmits to us. These are:</p>
                        <ul>
                            <li>Browser type and browser version</li>
                            <li>Operating system used</li>
                            <li>Referrer URL</li>
                            <li>Hostname of the accessing computer</li>
                            <li>Time of the server request</li>
                            <li>IP address</li>
                        </ul>
                        <p>This data is not merged with other data sources. The basis for data processing is Art. 6 (1) (f) DSGVO, which permits the processing of data to fulfill a contract or for pre-contractual measures.</p>

                        <h4>2.2 Account Registration</h4>
                        <p>When you register for an account, we collect:</p>
                        <ul>
                            <li>Email address (required)</li>
                            <li>Name (optional)</li>
                            <li>Password (encrypted)</li>
                        </ul>
                        <p><strong>Legal basis:</strong> Art. 6 (1) (b) DSGVO - Processing is necessary for the performance of a contract.</p>

                        <h4>2.3 Contact Form</h4>
                        <p>If you send us inquiries via the contact form, your details from the inquiry form, including the contact details you provided there, will be stored by us for the purpose of processing the inquiry and in case of follow-up questions. We do not pass on this data without your consent.</p>
                        <p><strong>Legal basis:</strong> Art. 6 (1) (a) DSGVO - You have given consent to the processing of your personal data.</p>

                        <h4>2.4 Usage Data</h4>
                        <p>We store the following usage data locally in your browser:</p>
                        <ul>
                            <li>Documents you create</li>
                            <li>Word count and image generation statistics</li>
                            <li>Brand voice preferences</li>
                            <li>Template preferences</li>
                        </ul>
                        <p>This data is stored in your browser's localStorage and is <strong>not transmitted to our servers</strong>.</p>

                        <h3>3. Use of Third-Party Services</h3>

                        <h4>3.1 Google Gemini API (AI Processing)</h4>
                        <p>When you use our AI tools, the text you input is sent to Google's servers (Gemini API) for processing. Google processes this data to generate the AI response.</p>
                        <p><strong>Data processed:</strong> Your input text, prompts, and generated content</p>
                        <p><strong>Legal basis:</strong> Art. 6 (1) (b) DSGVO - Processing is necessary to provide the AI service you requested</p>
                        <p><strong>Data retention:</strong> Google retains API requests for a short period for quality improvement and abuse prevention. We do not use your personal input data to train public models.</p>
                        <p><strong>Third-country transfer:</strong> Data may be processed on Google servers in the USA. Google complies with EU-US Data Privacy Framework.</p>
                        <p>More information: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></p>

                        <h4>3.2 Hosting Provider</h4>
                        <p>This website is hosted by [YOUR HOSTING PROVIDER]. Your access data (IP address, timestamp, browser info) is processed by the hosting provider.</p>
                        <p><strong>Legal basis:</strong> Art. 6 (1) (f) DSGVO - Legitimate interest in reliable and secure hosting</p>

                        <h3>4. Cookies and Tracking</h3>
                        <p>Our website uses cookies to improve functionality and user experience. We distinguish between:</p>

                        <h4>4.1 Necessary Cookies (Art. 6 (1) (f) DSGVO)</h4>
                        <p>These cookies are essential for the website to function. They include:</p>
                        <ul>
                            <li>Session cookies for login</li>
                            <li>Language preference</li>
                            <li>Theme preference (light/dark mode)</li>
                        </ul>

                        <h4>4.2 Optional Cookies (Art. 6 (1) (a) DSGVO - Consent required)</h4>
                        <p><strong>Analytics Cookies:</strong> Help us understand how visitors interact with the website (e.g., page views, session duration).</p>
                        <p><strong>Marketing Cookies:</strong> Used to display relevant advertisements.</p>
                        <p>You can change your cookie preferences at any time via the cookie banner or footer link.</p>

                        <h3>5. Data Retention</h3>
                        <p>We store your personal data only as long as necessary for the purposes stated or as required by law:</p>
                        <ul>
                            <li><strong>Account data:</strong> Until you delete your account</li>
                            <li><strong>Documents:</strong> Stored locally in your browser until you delete them</li>
                            <li><strong>Contact inquiries:</strong> 3 years (based on statutory limitation periods)</li>
                            <li><strong>Server logs:</strong> 7 days</li>
                        </ul>

                        <h3>6. Your Rights under DSGVO</h3>
                        <p>You have the following rights regarding your data:</p>

                        <h4>6.1 Right to Information (Art. 15 DSGVO)</h4>
                        <p>You have the right to request information about your stored personal data, its origin, recipients, and the purpose of its collection at no charge.</p>

                        <h4>6.2 Right to Rectification (Art. 16 DSGVO)</h4>
                        <p>You have the right to request correction of incorrect personal data.</p>

                        <h4>6.3 Right to Erasure / "Right to be Forgotten" (Art. 17 DSGVO)</h4>
                        <p>You have the right to request deletion of your personal data. You can exercise this right directly in your account settings.</p>

                        <h4>6.4 Right to Restriction of Processing (Art. 18 DSGVO)</h4>
                        <p>You have the right to request restriction of processing of your personal data in certain circumstances.</p>

                        <h4>6.5 Right to Data Portability (Art. 20 DSGVO)</h4>
                        <p>You have the right to receive your data in a structured, machine-readable format. You can export all your data as JSON from your account settings.</p>

                        <h4>6.6 Right to Object (Art. 21 DSGVO)</h4>
                        <p>You have the right to object to processing based on legitimate interests (Art. 6 (1) (f) DSGVO).</p>

                        <h4>6.7 Right to Withdraw Consent (Art. 7 (3) DSGVO)</h4>
                        <p>You may withdraw your consent to data processing at any time. This does not affect the lawfulness of processing based on consent before its withdrawal.</p>

                        <h4>6.8 Right to Lodge a Complaint</h4>
                        <p>You have the right to lodge a complaint with a supervisory authority if you believe that the processing of your personal data violates DSGVO.</p>
                        <p><strong>Supervisory Authority for Germany:</strong><br/>
                        Die Bundesbeauftragte für den Datenschutz und die Informationsfreiheit<br/>
                        Graurheindorfer Str. 153<br/>
                        53117 Bonn<br/>
                        Website: <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer">www.bfdi.bund.de</a></p>

                        <h3>7. Data Security</h3>
                        <p>We use appropriate technical and organizational security measures to protect your data against accidental or intentional manipulation, partial or complete loss, destruction, or unauthorized access by third parties. Our security measures are continuously improved in accordance with technological developments.</p>

                        <h3>8. Contact for Privacy Concerns</h3>
                        <p>For questions regarding the collection, processing, or use of your personal data, information, correction, restriction, or deletion of data, and revocation of given consent, please contact:</p>
                        <p>
                            Email: privacy@[your-company].com<br/>
                            Or use the contact form on our website
                        </p>

                        <h3>9. Changes to this Privacy Policy</h3>
                        <p>We reserve the right to update this privacy policy to ensure it complies with current legal requirements or to implement changes to our services. The latest version will always apply to your visit.</p>
                    </>
                )}

                {/* --- TERMS OF SERVICE --- */}
                {activeTab === 'terms' && (
                    <>
                        <h1>{t('legal.termsTitle')}</h1>
                        <p><strong>General Terms and Conditions (AGB)</strong></p>

                        <h3>1. Scope of Application / Geltungsbereich</h3>
                        <p>1.1 These General Terms and Conditions (GTC / AGB) apply to all business relationships between [YOUR COMPANY NAME] (hereinafter: "Provider" / "Anbieter") and its customers (hereinafter: "Customer" / "Kunde").</p>
                        <p>1.2 The customer's terms and conditions are only valid if we expressly agree to them in writing.</p>
                        <p>1.3 These GTC apply in their respective version also to future business relationships without us having to refer to them again in each individual case.</p>

                        <h3>2. Conclusion of Contract / Vertragsschluss</h3>
                        <p>2.1 The presentation of products and services on our website does not constitute a legally binding offer, but an invitation to place an order.</p>
                        <p>2.2 By clicking the "Register" or "Subscribe" button, the customer submits a binding offer to conclude a contract.</p>
                        <p>2.3 We confirm receipt of the order by email. The contract is concluded when we send this confirmation.</p>
                        <p>2.4 The contract language is German and/or English.</p>

                        <h3>3. Subject of the Contract / Vertragsgegenstand</h3>
                        <p>3.1 The provider offers Software as a Service (SaaS) solutions for AI-supported content generation.</p>
                        <p>3.2 The specific scope of services results from the selected subscription plan as described on the website.</p>
                        <p>3.3 The provider reserves the right to use subcontractors and third-party services (e.g., Google Gemini API) to provide the service.</p>
                        <p>3.4 The provider strives for 99.5% availability per year, excluding scheduled maintenance windows which will be announced in advance.</p>

                        <h3>4. Registration and Account / Registrierung und Nutzerkonto</h3>
                        <p>4.1 Use of the full service requires registration and creation of a user account.</p>
                        <p>4.2 The customer must provide truthful and complete information during registration.</p>
                        <p>4.3 The customer is responsible for maintaining the confidentiality of their login credentials.</p>
                        <p>4.4 The customer must immediately notify us of any unauthorized use of their account.</p>
                        <p>4.5 One account per person or company is permitted. Multiple accounts may be deleted without prior notice.</p>

                        <h3>5. Pricing and Payment / Preise und Zahlung</h3>
                        <p>5.1 All prices are in Euro (EUR) or US Dollar (USD) and include the applicable VAT.</p>
                        <p>5.2 <strong>Free Plan:</strong> No payment required. Usage is limited as described on the pricing page.</p>
                        <p>5.3 <strong>Paid Subscriptions:</strong> Payment is due in advance for the selected billing period (monthly or annual).</p>
                        <p>5.4 Payment methods accepted: Credit card, PayPal, SEPA direct debit (for EU customers).</p>
                        <p>5.5 If payment fails, the customer will be notified and given 14 days to update payment information. After this period, the account may be suspended.</p>
                        <p>5.6 Price increases will be announced at least 30 days in advance. Existing customers can cancel before the increase takes effect.</p>

                        <h3>6. Subscription Term and Cancellation / Laufzeit und Kündigung</h3>
                        <p>6.1 <strong>Free Plan:</strong> No minimum term. Can be terminated at any time.</p>
                        <p>6.2 <strong>Monthly Subscription:</strong> Renews automatically each month unless canceled. Cancellation must be made at least 24 hours before the next billing date.</p>
                        <p>6.3 <strong>Annual Subscription:</strong> Renews automatically each year unless canceled. Cancellation must be made at least 30 days before the end of the subscription period.</p>
                        <p>6.4 Cancellation can be made at any time through the account settings or by contacting support.</p>
                        <p>6.5 No refunds for partial months or years unless required by law.</p>
                        <p>6.6 The provider may terminate the contract for cause (e.g., violation of terms, payment default, abuse) with immediate effect.</p>

                        <h3>7. Right of Withdrawal for Consumers (Widerrufsrecht) - EU Directive 2011/83/EU</h3>
                        <p>7.1 Consumers (private individuals) in the EU have a 14-day right of withdrawal.</p>
                        <p>7.2 <strong>Cancellation Policy:</strong></p>
                        <blockquote className="border-l-4 border-indigo-600 pl-4 my-4 italic text-sm">
                            <p>You have the right to withdraw from this contract within 14 days without giving any reason.</p>
                            <p>The withdrawal period will expire after 14 days from the day of the conclusion of the contract.</p>
                            <p>To exercise the right of withdrawal, you must inform us of your decision to withdraw from this contract by an unequivocal statement (e.g., email to support@[your-company].com).</p>
                        </blockquote>
                        <p>7.3 <strong>Loss of Withdrawal Right:</strong> By starting to use the service before the 14-day period expires, you expressly consent to the immediate provision of services and acknowledge that you lose your right of withdrawal.</p>

                        <h3>8. Intellectual Property Rights / Urheberrecht und Nutzungsrechte</h3>
                        <p>8.1 All content, trademarks, logos, and software on this website are protected by copyright and remain the property of the provider or its licensors.</p>
                        <p>8.2 The customer receives a simple, non-exclusive, non-transferable right to use the software for the duration of the contract.</p>
                        <p>8.3 <strong>AI-Generated Content:</strong> The customer receives full commercial usage rights to all content generated using our AI tools. The customer is responsible for ensuring the content does not infringe third-party rights.</p>
                        <p>8.4 Reverse engineering, decompilation, or disassembly of the software is prohibited.</p>

                        <h3>9. User Obligations / Pflichten des Kunden</h3>
                        <p>9.1 The customer agrees not to:</p>
                        <ul>
                            <li>Use the service for illegal activities</li>
                            <li>Generate content that violates third-party rights or applicable laws</li>
                            <li>Attempt to gain unauthorized access to the system</li>
                            <li>Use automated systems (bots) to abuse the service</li>
                            <li>Share account credentials with third parties</li>
                            <li>Generate hate speech, discriminatory, or harmful content</li>
                        </ul>
                        <p>9.2 Violation of these obligations may result in immediate account suspension or termination.</p>

                        <h3>10. Liability and Warranty / Haftung und Gewährleistung</h3>
                        <p>10.1 The provider is liable without limitation for damages resulting from injury to life, body, or health and for damages caused intentionally or through gross negligence.</p>
                        <p>10.2 For slight negligence, liability is limited to typical foreseeable damages and only applies to breach of essential contractual obligations (cardinal duties).</p>
                        <p>10.3 <strong>AI-Generated Content:</strong> The provider does not guarantee the factual correctness, completeness, or legal compliance of AI-generated content. The customer is responsible for reviewing and using the content appropriately.</p>
                        <p>10.4 The provider is not liable for third-party services (e.g., Google Gemini API) except in cases of intent or gross negligence.</p>
                        <p>10.5 Liability under the Product Liability Act remains unaffected.</p>

                        <h3>11. Data Protection / Datenschutz</h3>
                        <p>11.1 The collection, processing, and use of personal data is governed by our Privacy Policy, which complies with DSGVO/GDPR.</p>
                        <p>11.2 By using our services, the customer consents to data processing as described in the Privacy Policy.</p>

                        <h3>12. Changes to the Terms / Änderungen der AGB</h3>
                        <p>12.1 We reserve the right to change these terms at any time.</p>
                        <p>12.2 Customers will be notified of changes by email at least 30 days before they take effect.</p>
                        <p>12.3 If the customer does not object within 30 days, the changes are deemed accepted. The customer will be informed of this consequence in the notification.</p>

                        <h3>13. Final Provisions / Schlussbestimmungen</h3>
                        <p>13.1 <strong>Applicable Law:</strong> The law of the Federal Republic of Germany applies, excluding the UN Convention on Contracts for the International Sale of Goods (CISG).</p>
                        <p>13.2 <strong>Place of Jurisdiction:</strong> If the customer is a merchant (Kaufmann), legal entity under public law, or special fund under public law, the exclusive place of jurisdiction is [Your City, e.g., Berlin].</p>
                        <p>13.3 <strong>Severability Clause:</strong> Should individual provisions of these GTC be or become invalid, the validity of the remaining provisions remains unaffected. The invalid provision shall be replaced by a valid provision that comes closest to the economic purpose of the invalid provision.</p>
                        <p>13.4 The contract text is stored by us and can be accessed by the customer at any time through their account.</p>

                        <h3>14. Alternative Dispute Resolution / Alternative Streitbeilegung</h3>
                        <p>14.1 The European Commission provides a platform for online dispute resolution (ODR): <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a></p>
                        <p>14.2 We are neither willing nor obligated to participate in dispute resolution proceedings before a consumer arbitration board.</p>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
