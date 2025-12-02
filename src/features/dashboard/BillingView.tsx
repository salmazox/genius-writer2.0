
import React from 'react';
import { Download, CreditCard, CheckCircle2 } from 'lucide-react';
import { Invoice } from '../../types';

export const BillingView: React.FC = () => {
    const mockInvoices: Invoice[] = [
        { id: 'INV-2023-001', date: 'Oct 24, 2023', amount: 29.00, status: 'Paid', items: 'Pro Plan - Monthly' },
        { id: 'INV-2023-002', date: 'Sep 24, 2023', amount: 29.00, status: 'Paid', items: 'Pro Plan - Monthly' },
        { id: 'INV-2023-003', date: 'Aug 24, 2023', amount: 29.00, status: 'Paid', items: 'Pro Plan - Monthly' },
    ];

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
             {/* Current Plan */}
             <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="px-2 py-0.5 bg-white/20 rounded text-xs font-bold uppercase tracking-wider">Current Plan</div>
                             <span className="text-green-300 flex items-center gap-1 text-xs font-bold"><CheckCircle2 size={12} /> Active</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-1">Pro Professional</h2>
                        <p className="text-indigo-200 text-sm">Next billing date: November 24, 2023</p>
                    </div>
                    <div className="flex gap-3">
                         <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">Cancel Plan</button>
                         <button className="px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-bold transition-colors shadow-lg">Upgrade to Agency</button>
                    </div>
                </div>
             </div>

             {/* Payment Method */}
             <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                 <h3 className="font-bold text-slate-900 dark:text-white mb-4">Payment Method</h3>
                 <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                             <CreditCard size={20} className="text-slate-500" />
                         </div>
                         <div>
                             <p className="font-bold text-slate-900 dark:text-white text-sm">Visa ending in 4242</p>
                             <p className="text-xs text-slate-500">Expires 12/2025</p>
                         </div>
                     </div>
                     <button className="text-sm text-indigo-600 font-medium hover:underline">Edit</button>
                 </div>
             </div>

             {/* Invoices */}
             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                 <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                     <h3 className="font-bold text-lg text-slate-900 dark:text-white">Invoice History</h3>
                 </div>
                 <div className="divide-y divide-slate-100 dark:divide-slate-800">
                     {mockInvoices.map(invoice => (
                         <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                             <div className="flex flex-col">
                                 <span className="font-bold text-slate-900 dark:text-white text-sm">{invoice.items}</span>
                                 <span className="text-xs text-slate-500">{invoice.date}</span>
                             </div>
                             <div className="flex items-center gap-4">
                                 <span className="font-bold text-slate-900 dark:text-white">€{invoice.amount.toFixed(2)}</span>
                                 <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-bold">{invoice.status}</span>
                                 <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Download size={18} /></button>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
};
