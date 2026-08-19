"use client";

import { AuthProvider } from "@/features/auth/store/auth-context";
import { CityModal } from "@/features/city/components/CityModal";
import { CityProvider } from "@/features/city/store/city-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CityProvider>
        {children}
        <CityModal />
      </CityProvider>
    </AuthProvider>
  );
}
