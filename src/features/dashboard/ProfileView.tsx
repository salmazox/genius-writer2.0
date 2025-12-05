
import React, { useRef, useState, useEffect } from 'react';
import { User, Upload, Lock, Trash2, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../../types';
import { validateImageFile } from '../../utils/security';
import { useToast } from '../../contexts/ToastContext';
import { useThemeLanguage } from '../../contexts/ThemeLanguageContext';
import { authService } from '../../services/authService';

interface ProfileViewProps {
    user: UserType;
    updateUser: (updates: Partial<UserType>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, updateUser }) => {
    const { showToast } = useToast();
    const { t } = useThemeLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile form state
    const [profileData, setProfileData] = useState({
        name: user.name,
        bio: user.bio || '',
        street: user.street || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || ''
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Password change state
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Account deletion state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Update local state when user prop changes
    useEffect(() => {
        setProfileData({
            name: user.name,
            bio: user.bio || '',
            street: user.street || '',
            city: user.city || '',
            postalCode: user.postalCode || '',
            country: user.country || ''
        });
    }, [user]);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validation = validateImageFile(file);
            if (!validation.valid) {
                showToast(validation.error || t('profile.uploadFailed'), "error");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({ avatar: reader.result as string });
                showToast(t('profile.uploadSuccess'), "success");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            const result = await authService.updateProfile({
                name: profileData.name,
                bio: profileData.bio || undefined,
                street: profileData.street || undefined,
                city: profileData.city || undefined,
                postalCode: profileData.postalCode || undefined,
                country: profileData.country || undefined
            });

            // Update parent component and localStorage
            updateUser(result.user);
            showToast(t('profile.saveSuccess'), 'success');
        } catch (error: any) {
            console.error('Profile update error:', error);
            showToast(error.message || 'Failed to update profile', 'error');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handlePasswordChange = (field: 'currentPassword' | 'newPassword' | 'confirmPassword', value: string) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));

        // Calculate password strength for new password
        if (field === 'newPassword') {
            if (value.length > 0) {
                const strength = authService.getPasswordStrength(value);
                setPasswordStrength(strength);
                const validation = authService.validatePassword(value);
                setPasswordErrors(validation.errors);
            } else {
                setPasswordStrength(0);
                setPasswordErrors([]);
            }
        }
    };

    const handleChangePassword = async () => {
        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            showToast('Please fill in all password fields', 'error');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        const validation = authService.validatePassword(passwordData.newPassword);
        if (!validation.valid) {
            showToast(validation.errors[0], 'error');
            return;
        }

        setIsChangingPassword(true);
        try {
            await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
            showToast('Password changed successfully', 'success');

            // Reset form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordStrength(0);
            setPasswordErrors([]);
            setShowPasswordSection(false);
        } catch (error: any) {
            console.error('Password change error:', error);
            showToast(error.message || 'Failed to change password', 'error');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            showToast('Please enter your password to confirm', 'error');
            return;
        }

        setIsDeleting(true);
        try {
            await authService.deleteAccount(deletePassword);
            showToast('Account deleted successfully', 'success');

            // Logout will happen automatically via deleteAccount method
            // Redirect to home page
            window.location.href = '/';
        } catch (error: any) {
            console.error('Account deletion error:', error);
            showToast(error.message || 'Failed to delete account', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 40) return 'bg-red-500';
        if (passwordStrength < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength < 40) return 'Weak';
        if (passwordStrength < 70) return 'Medium';
        return 'Strong';
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* Profile Information */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('profile.title')}</h2>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex flex-col items-center gap-4">
                         <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-lg overflow-hidden flex items-center justify-center relative group">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={48} className="text-slate-400" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="text-white" size={24} />
                            </div>
                         </div>
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleAvatarUpload} />
                         <button onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">{t('profile.changePhoto')}</button>
                    </div>

                    <div className="flex-1 w-full space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('profile.fullName')}</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('profile.emailAddress')}</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-3 cursor-not-allowed opacity-60"
                                    title="Email cannot be changed"
                                />
                            </div>
                        </div>

                        <div>
                             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('profile.bioRole')}</label>
                            <textarea
                                value={profileData.bio}
                                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                                placeholder={t('profile.bioPlaceholder')}
                            />
                        </div>

                        {/* Address Section */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Address (Optional)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Street Address</label>
                                    <input
                                        type="text"
                                        value={profileData.street}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, street: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="123 Main Street"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">City</label>
                                        <input
                                            type="text"
                                            value={profileData.city}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Berlin"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Postal Code</label>
                                        <input
                                            type="text"
                                            value={profileData.postalCode}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, postalCode: e.target.value }))}
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="10115"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Country</label>
                                        <input
                                            type="text"
                                            value={profileData.country}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Germany"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSavingProfile ? 'Saving...' : t('profile.saveChanges')}
                    </button>
                </div>
            </div>

            {/* Security Section - Change Password */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Lock className="text-slate-600 dark:text-slate-400" size={24} />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security</h2>
                    </div>
                    {!showPasswordSection && (
                        <button
                            onClick={() => setShowPasswordSection(true)}
                            className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            Change Password
                        </button>
                    )}
                </div>

                {showPasswordSection && (
                    <div className="space-y-4 animate-in slide-in-from-top duration-300">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Enter your current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Enter your new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {passwordData.newPassword.length > 0 && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-slate-600 dark:text-slate-400">Password Strength</span>
                                        <span className={`font-medium ${passwordStrength < 40 ? 'text-red-500' : passwordStrength < 70 ? 'text-yellow-500' : 'text-green-500'}`}>
                                            {getPasswordStrengthText()}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                            style={{ width: `${passwordStrength}%` }}
                                        />
                                    </div>
                                    {passwordErrors.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {passwordErrors.map((error, index) => (
                                                <p key={index} className="text-xs text-red-500">• {error}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Confirm your new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {passwordData.confirmPassword.length > 0 && passwordData.newPassword !== passwordData.confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleChangePassword}
                                disabled={isChangingPassword || passwordErrors.length > 0 || passwordData.newPassword !== passwordData.confirmPassword}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isChangingPassword ? 'Changing...' : 'Change Password'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowPasswordSection(false);
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    setPasswordStrength(0);
                                    setPasswordErrors([]);
                                }}
                                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Danger Zone - Delete Account */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-red-200 dark:border-red-900 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Trash2 className="text-red-600 dark:text-red-400" size={24} />
                    <h2 className="text-xl font-bold text-red-900 dark:text-red-400">Danger Zone</h2>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                </p>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all"
                    >
                        Delete Account
                    </button>
                ) : (
                    <div className="space-y-4 animate-in slide-in-from-top duration-300">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                            <p className="text-sm font-medium text-red-900 dark:text-red-400 mb-2">
                                ⚠️ This action cannot be undone!
                            </p>
                            <p className="text-sm text-red-800 dark:text-red-300">
                                All your data, documents, and settings will be permanently deleted.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                Enter your password to confirm deletion
                            </label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 focus:ring-2 focus:ring-red-500 outline-none"
                                placeholder="Enter your password"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || !deletePassword}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeletePassword('');
                                }}
                                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
