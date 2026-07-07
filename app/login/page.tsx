"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/context";
import { Mail, Lock, LogIn, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, isLoggedIn } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Redirect ke dashboard jika sudah login
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Email harus diisi";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password harus diisi";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await loginWithGoogle();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    setIsLoading(true);
    // Untuk email/password login, bisa ditambahkan nanti
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo dan Header tanpa pembungkus */}
        <div className="text-center mb-8">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="mx-auto h-16 w-16 object-contain mb-4"
          />
          <h1 className="font-roadrage text-4xl text-ink">Multi Gmail Wetan</h1>
          <p className="text-muted text-sm mt-2">Masuk ke akun Anda untuk melanjutkan</p>
        </div>

        {/* Form Login */}
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-line">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-line text-ink py-3 rounded-lg font-semibold text-sm transition-all hover:bg-sand disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {/* Google Logo SVG */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
              <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71L0.957273 12.93C2.43818 15.8836 5.48182 18 9 18Z" fill="#34A853"/>
              <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29L0.957273 5.07C0.347727 6.28364 0 7.61591 0 9C0 10.3841 0.347727 11.7164 0.957273 12.93L3.96409 10.71Z" fill="#FBBC05"/>
              <path d="M9 3.57955C10.3214 3.57955 11.5077 4.04318 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.11636 0.957273 5.07L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
            </svg>
            {isLoading ? (
              <span>Memproses...</span>
            ) : (
              <span>Masuk dengan Google</span>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-line"></div>
            <span className="text-xs text-muted">atau masuk dengan email</span>
            <div className="flex-1 h-px bg-line"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ink mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  placeholder="email@contoh.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-canvas text-ink text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20 transition-all ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-line focus:border-ink"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ink mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border bg-canvas text-ink text-sm placeholder:text-muted focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-line focus:ring-ink/20 focus:border-ink"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-ink text-canvas py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-canvas border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : showSuccess ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Berhasil!</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted">
          <p>© 2026 Multi Gmail Wetan. Semua hak cipta dilindungi.</p>
        </div>
      </div>
    </div>
  );
}
