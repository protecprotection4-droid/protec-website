import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  MailCheck,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Language } from '../../types';

interface AdminLoginPageProps {
  lang: Language;
  onBackToSite: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ lang, onBackToSite }) => {
  const isAr = lang === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const {
    authReady,
    user,
    needsEmailVerification,
    unauthorizedEmail,
    authStatusLoading,
    serverPasswordConfigured,
    envPasscodeActive,
    sendAdminVerificationEmail,
    refreshFirebaseUser,
    setupServerPassword,
    signInWithServerPassword,
    signOutAdmin,
  } = useAdminAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!authReady) {
    return (
      <div className="min-h-[80vh] bg-[#F7FAF7] dark:bg-[#09110C] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm font-semibold text-[#4B6152] dark:text-[#A3B9AA]">
          <Loader2 className="w-5 h-5 animate-spin text-[#0B5D27] dark:text-[#7AD959]" aria-hidden="true" />
          <span>
            {isAr
              ? 'جاري التحقق من جلسة الإدارة...'
              : 'Verifying admin authentication session...'}
          </span>
        </div>
      </div>
    );
  }

  // Case A: Signed into Firebase with a non-admin email
  if (unauthorizedEmail) {
    return (
      <div className="min-h-[80vh] bg-[#F7FAF7] dark:bg-[#09110C] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#111E16] border border-[#FECACA] dark:border-[#7F1D1D] rounded-2xl p-8 text-center">
          <AlertTriangle className="w-11 h-11 text-[#B91C1C] dark:text-[#FCA5A5] mx-auto mb-3" aria-hidden="true" />
          <h1 className="text-xl font-extrabold text-[#B91C1C] dark:text-[#FCA5A5] mb-2">
            {isAr ? 'حساب غير مصرح له' : 'Unauthorized Account'}
          </h1>
          <p className="text-sm text-[#4B6152] dark:text-[#A3B9AA] mb-6 leading-relaxed">
            {isAr
              ? `الحساب الحالي (${unauthorizedEmail}) لا يملك صلاحيات إدارة Protec. يرجى استخدام حساب الإدارة المعتمد.`
              : `The signed-in account (${unauthorizedEmail}) is not authorized for Protec Admin access. Please use an authorized admin account.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void signOutAdmin()}
              className="px-4 py-2.5 bg-[#0B5D27] hover:bg-[#08431C] text-white text-xs font-bold rounded-lg min-h-[42px] whitespace-nowrap"
            >
              {isAr ? 'تبديل الحساب' : 'Switch Account'}
            </button>
            <button
              type="button"
              onClick={onBackToSite}
              className="px-4 py-2.5 bg-[#F1F6F2] dark:bg-[#14241A] hover:bg-[#E2EDE5] dark:hover:bg-[#1C3224] text-[#102116] dark:text-[#ECF4EE] text-xs font-semibold rounded-lg min-h-[42px] whitespace-nowrap"
            >
              {isAr ? 'العودة للموقع' : 'Back to Site'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case B: Signed into Firebase as admin email, but email is not yet verified
  if (needsEmailVerification) {
    return (
      <div className="min-h-[80vh] bg-[#F7FAF7] dark:bg-[#09110C] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-2xl p-8 text-center">
          <MailCheck className="w-11 h-11 text-[#0B5D27] dark:text-[#7AD959] mx-auto mb-3" aria-hidden="true" />
          <h1 className="text-xl font-extrabold text-[#102116] dark:text-[#ECF4EE] mb-2">
            {isAr ? 'تأكيد البريد الإلكتروني مطلوب' : 'Email Verification Required'}
          </h1>
          <p className="text-sm text-[#4B6152] dark:text-[#A3B9AA] mb-5 leading-relaxed">
            {isAr
              ? `تم تسجيل الدخول بالحساب (${user?.email}) ولكن يلزم تأكيد البريد الإلكتروني للوصول إلى لوحة التحكم.`
              : `Signed in as ${user?.email}, but email verification is required before accessing the Admin Dashboard.`}
          </p>

          {verificationSent && (
            <div className="mb-4 p-3 bg-[#F1F6F2] dark:bg-[#14241A] border border-[#0B5D27]/30 dark:border-[#65B32E]/40 text-xs font-semibold text-[#0B5D27] dark:text-[#7AD959] rounded-lg">
              {isAr
                ? 'تم إرسال رابط التفعيل إلى بريدك الإلكتروني. بعد الضغط على الرابط اضغط "تحديث الحالة".'
                : 'Verification link sent. After confirming in your inbox, click Refresh Status.'}
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="mb-4 p-3 bg-[#FEF2F2] dark:bg-[#2A1215] border border-[#FECACA] dark:border-[#7F1D1D] text-xs text-[#B91C1C] dark:text-[#FCA5A5] rounded-lg"
            >
              {errorMsg}
            </div>
          )}

          <div className="space-y-2.5">
            <button
              type="button"
              disabled={sendingVerification}
              onClick={async () => {
                setErrorMsg(null);
                setSendingVerification(true);
                try {
                  await sendAdminVerificationEmail();
                  setVerificationSent(true);
                } catch (err) {
                  setErrorMsg(err instanceof Error ? err.message : 'Could not send email.');
                } finally {
                  setSendingVerification(false);
                }
              }}
              className="w-full py-2.5 px-4 bg-[#0B5D27] hover:bg-[#08431C] text-white text-xs font-bold rounded-lg min-h-[42px]"
            >
              {isAr ? 'إرسال رابط تأكيد البريد' : 'Send Verification Email'}
            </button>
            <button
              type="button"
              onClick={() => void refreshFirebaseUser()}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#F1F6F2] dark:bg-[#14241A] hover:bg-[#E2EDE5] dark:hover:bg-[#1C3224] text-[#0B5D27] dark:text-[#7AD959] text-xs font-bold rounded-lg min-h-[42px]"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isAr ? 'تحديث حالة التأكيد' : 'Refresh Verification Status'}</span>
            </button>
            <button
              type="button"
              onClick={() => void signOutAdmin()}
              className="w-full py-2 text-xs font-semibold text-[#4B6152] dark:text-[#A3B9AA] hover:text-[#102116] dark:hover:text-[#ECF4EE]"
            >
              {isAr ? 'تسجيل الخروج' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isFirstRunSetup = !authStatusLoading && !serverPasswordConfigured;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg(
        isAr
          ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'
          : 'Please enter your admin email and password.'
      );
      return;
    }

    if (isFirstRunSetup) {
      if (password.length < 8) {
        setErrorMsg(
          isAr
            ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.'
            : 'Password must be at least 8 characters.'
        );
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg(isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isFirstRunSetup) {
        await setupServerPassword(email, password);
      } else {
        await signInWithServerPassword(email, password);
      }
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'protec/unauthorized-email') {
        setErrorMsg(
          isAr
            ? 'هذا البريد الإلكتروني غير مدرج ضمن حسابات الإدارة المعتمدة.'
            : 'This email address is not listed as an authorized admin email.'
        );
      } else if (code === 'protec/weak-password') {
        setErrorMsg(
          isAr
            ? 'كلمة المرور يجب أن تكون بين 8 و 128 حرفاً.'
            : 'Password must be between 8 and 128 characters.'
        );
      } else {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : isAr
              ? 'تعذر تسجيل الدخول. تأكد من صحة البريد الإلكتروني وكلمة المرور.'
              : 'Authentication failed. Check your admin email and password.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#F7FAF7] dark:bg-[#09110C] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-2xl p-7 sm:p-8">
        <div className="text-center mb-6">
          <ShieldCheck className="w-11 h-11 text-[#0B5D27] dark:text-[#7AD959] mx-auto mb-3" aria-hidden="true" />
          <h1 className="text-xl font-extrabold text-[#102116] dark:text-[#ECF4EE] mb-1.5">
            {isAr ? 'تسجيل دخول إدارة Protec' : 'Protec Admin Login'}
          </h1>
          <p className="text-xs sm:text-sm text-[#4B6152] dark:text-[#A3B9AA] leading-relaxed">
            {isAr
              ? 'ادخل إلى لوحة تحكم Protec عبر البريد الإلكتروني المعتمد وكلمة مرور الإدارة.'
              : 'Sign in to the Protec Admin Dashboard using your authorized admin email and password.'}
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 p-3 bg-[#FEF2F2] dark:bg-[#2A1215] border border-[#FECACA] dark:border-[#7F1D1D] text-xs text-[#B91C1C] dark:text-[#FCA5A5] rounded-lg leading-relaxed"
          >
            {errorMsg}
          </div>
        )}

        {authStatusLoading ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs text-[#4B6152] dark:text-[#A3B9AA]">
            <Loader2 className="w-4 h-4 animate-spin text-[#0B5D27] dark:text-[#7AD959]" />
            <span>{isAr ? 'جاري فحص حالة الدخول...' : 'Checking login configuration...'}</span>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {isFirstRunSetup && (
              <div className="p-3 bg-[#F1F6F2] dark:bg-[#14241A] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg flex items-start gap-2.5 text-xs text-[#2E4235] dark:text-[#C4D8CA]">
                <KeyRound className="w-4 h-4 text-[#0B5D27] dark:text-[#7AD959] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  {isAr
                    ? 'لم يتم تعيين كلمة مرور الإدارة بعد. أدخل البريد المعتمد وأنشئ كلمة مرور جديدة لفتح لوحة التحكم.'
                    : 'No admin password is set yet. Enter your authorized admin email and create your password to unlock the dashboard.'}
                </span>
              </div>
            )}

            <div>
              <label
                htmlFor="admin-login-email"
                className="block text-xs font-bold text-[#102116] dark:text-[#ECF4EE] mb-1.5"
              >
                {isAr ? 'البريد الإلكتروني المعتمد' : 'Authorized Admin Email'}
              </label>
              <input
                id="admin-login-email"
                type="email"
                dir="ltr"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3.5 py-2.5 bg-[#F7FAF7] dark:bg-[#0B150E] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg text-sm text-[#102116] dark:text-[#ECF4EE] focus:outline-none focus:border-[#0B5D27] dark:focus:border-[#65B32E] min-h-[44px]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-login-password"
                className="block text-xs font-bold text-[#102116] dark:text-[#ECF4EE] mb-1.5"
              >
                {isFirstRunSetup
                  ? isAr
                    ? 'كلمة المرور الجديدة (8 أحرف على الأقل)'
                    : 'New Admin Password (min 8 chars)'
                  : isAr
                    ? 'كلمة المرور'
                    : 'Password'}
              </label>
              <div className="relative">
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  autoComplete={isFirstRunSetup ? 'new-password' : 'current-password'}
                  required
                  minLength={isFirstRunSetup ? 8 : 1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full ps-3.5 pe-10 py-2.5 bg-[#F7FAF7] dark:bg-[#0B150E] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg text-sm text-[#102116] dark:text-[#ECF4EE] focus:outline-none focus:border-[#0B5D27] dark:focus:border-[#65B32E] min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 end-0 px-3 flex items-center text-[#4B6152] dark:text-[#A3B9AA] hover:text-[#102116] dark:hover:text-[#ECF4EE]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isFirstRunSetup && (
              <div>
                <label
                  htmlFor="admin-login-confirm"
                  className="block text-xs font-bold text-[#102116] dark:text-[#ECF4EE] mb-1.5"
                >
                  {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <input
                  id="admin-login-confirm"
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#F7FAF7] dark:bg-[#0B150E] border border-[#DCE6DE] dark:border-[#243D2D] rounded-lg text-sm text-[#102116] dark:text-[#ECF4EE] focus:outline-none focus:border-[#0B5D27] dark:focus:border-[#65B32E] min-h-[44px]"
                />
              </div>
            )}

            {envPasscodeActive && (
              <p className="text-[11px] text-[#4B6152] dark:text-[#A3B9AA]">
                {isAr
                  ? 'ملاحظة: كلمة مرور الإدارة مُفعّلة عبر إعدادات الخادم (ADMIN_PASSCODE).'
                  : 'Admin passcode is active via server environment settings.'}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#0B5D27] hover:bg-[#08431C] disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-colors min-h-[46px]"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Lock className="w-4 h-4" aria-hidden="true" />
              )}
              <span>
                {isFirstRunSetup
                  ? isAr
                    ? 'حفظ كلمة المرور والدخول للوحة التحكم'
                    : 'Create Admin Password & Sign In'
                  : isAr
                    ? 'دخول بالبريد الإلكتروني وكلمة المرور'
                    : 'Sign In with Email & Password'}
              </span>
            </button>
          </form>
        )}

        <div className="text-center mt-5">
          <button
            type="button"
            onClick={onBackToSite}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4B6152] dark:text-[#A3B9AA] hover:text-[#102116] dark:hover:text-[#ECF4EE] py-2"
          >
            <BackArrow className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isAr ? 'العودة إلى الموقع العام' : 'Return to Public Site'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
