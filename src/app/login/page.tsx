"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  const router = useRouter();
  const { user, token, isLoading, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && user && token) {
      router.push("/dashboard");
    }
  }, [user, token, hasHydrated, router]);

  if (isLoading || !hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-2xl font-bold">SmartTask</span>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-bold leading-tight">
            Управляйте задачами умнее
          </h1>
          <p className="text-xl text-blue-100 max-w-md">
            Организация, аналитика и фокус — всё в одном месте. Отслеживайте прогресс, планируйте день и достигайте целей.
          </p>
          <div className="flex gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <div className="text-3xl font-bold">📊</div>
              <div className="text-sm mt-2">Аналитика</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <div className="text-3xl font-bold">🎯</div>
              <div className="text-sm mt-2">Фокус</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <div className="text-3xl font-bold">📅</div>
              <div className="text-sm mt-2">Календарь</div>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-sm text-blue-200">
          © 2024 SmartTask Tracker
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-2xl font-bold">SmartTask</span>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
