import React, { useState, useEffect } from 'react';
import { MapPin, Save, Edit2, X } from 'lucide-react';
import * as billingAPI from '../../services/billingAPI';
import { useToast } from '../../contexts/ToastContext';

interface BillingAddressFormProps {
  onUpdate?: () => void;
}

export const BillingAddressForm: React.FC<BillingAddressFormProps> = ({ onUpdate }) => {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  const [originalData, setOriginalData] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  useEffect(() => {
    loadBillingAddress();
  }, []);

  const loadBillingAddress = async () => {
    try {
      setLoading(true);
      const result = await billingAPI.getBillingAddress();

      if (result.billingAddress) {
        const address = {
          street: result.billingAddress.street || '',
          city: result.billingAddress.city || '',
          state: result.billingAddress.state || '',
          postalCode: result.billingAddress.postalCode || '',
          country: result.billingAddress.country || ''
        };
        setFormData(address);
        setOriginalData(address);
      }
    } catch (error) {
      console.error('Failed to load billing address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const result = await billingAPI.updateBillingAddress(formData);

      if (result.error) {
        showToast(result.error, 'error');
        return;
      }

      showToast('Billing address updated and synced with Stripe', 'success');
      setOriginalData(formData);
      setIsEditing(false);

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      showToast('Failed to update billing address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const hasAddress = originalData.street || originalData.city || originalData.country;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="text-center text-slate-500">Loading billing address...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="text-indigo-600" size={20} />
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Billing Address</h3>
            <p className="text-sm text-slate-500">Manage your billing address (syncs with Stripe)</p>
          </div>
        </div>
        {!isEditing && hasAddress && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
            Edit
          </button>
        )}
      </div>

      <div className="p-6">
        {!isEditing && !hasAddress ? (
          <div className="text-center py-8">
            <MapPin className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
            <p className="text-slate-500 mb-4">No billing address set</p>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Add Billing Address
            </button>
          </div>
        ) : !isEditing ? (
          <div className="space-y-2 text-slate-700 dark:text-slate-300">
            {formData.street && <p>{formData.street}</p>}
            <p>
              {[formData.city, formData.state, formData.postalCode].filter(Boolean).join(', ')}
            </p>
            {formData.country && <p>{formData.country}</p>}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                id="street"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Berlin"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  State / Province *
                </label>
                <input
                  type="text"
                  id="state"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Berlin"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  id="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="10115"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  id="country"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Germany"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save & Sync with Stripe'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={16} />
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              * This address will be automatically synced with your Stripe account for billing purposes.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
