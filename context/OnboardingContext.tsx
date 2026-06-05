import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { marketAPI } from '../lib/marketApi';

export interface OnboardingData {
  personal: {
    name: string;
    handle: string;
    email: string;
    phone: string;
    idType: string;
    idNumber: string;
    idImage: string | null;
  };
  shop: {
    name: string; // backwards compatibility
    shopName: string; // new
    type: string; // backwards compatibility
    shopType: string; // new
    country: string;
    state: string;
    address: string; // backwards compatibility
    shopAddress: string; // new
    phone: string; // backwards compatibility
    businessPhone: string; // new
    registered: string;
    cac: string; // backwards compatibility
    cacNumber: string; // new
    logo: string | null;
  };
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updatePersonal: (data: Partial<OnboardingData['personal']>) => void;
  updateShop: (data: Partial<OnboardingData['shop']>) => void;
  resetOnboarding: () => void;
  isSubmitted: boolean;
  setIsSubmitted: (val: boolean) => void;
  loadingCheck: boolean;
}

const initialData: OnboardingData = {
  personal: {
    name: '',
    handle: '',
    email: '',
    phone: '',
    idType: '',
    idNumber: '',
    idImage: null,
  },
  shop: {
    name: '',
    shopName: '',
    type: '',
    shopType: '',
    country: 'Nigeria',
    state: '',
    address: '',
    shopAddress: '',
    phone: '',
    businessPhone: '',
    registered: 'no',
    cac: '',
    cacNumber: '',
    logo: null,
  },
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(initialData);
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Verify the user's live store status right when the app context tree initializes
  useEffect(() => {
    checkBackendStoreLifecycle();
  }, []);

  const checkBackendStoreLifecycle = async () => {
    try {
      const response = await marketAPI.get('/market/merchant/analytics/');
      if (response.status === 200 || response.status === 403) {
        // A row exists (either approved or pending activation)
        setIsSubmitted(true);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setIsSubmitted(true); // Explicit 403 Pending validation match
      } else {
        setIsSubmitted(false); // 404 means they have a clean slate to fill forms
      }
    } finally {
      setLoadingCheck(false);
    }
  };

  const updatePersonal = (data: Partial<OnboardingData['personal']>) => {
    setOnboardingData((prev) => ({
      ...prev,
      personal: { ...prev.personal, ...data },
    }));
  };

  const updateShop = (data: Partial<OnboardingData['shop']>) => {
    setOnboardingData((prev) => {
      const merged = { ...prev.shop, ...data };
      
      // Auto-synchronize old/new keys
      if (data.name !== undefined) merged.shopName = data.name;
      if (data.shopName !== undefined) merged.name = data.shopName;
      
      if (data.type !== undefined) merged.shopType = data.type;
      if (data.shopType !== undefined) merged.type = data.shopType;
      
      if (data.address !== undefined) merged.shopAddress = data.address;
      if (data.shopAddress !== undefined) merged.address = data.shopAddress;
      
      if (data.phone !== undefined) merged.businessPhone = data.phone;
      if (data.businessPhone !== undefined) merged.phone = data.businessPhone;
      
      if (data.cac !== undefined) merged.cacNumber = data.cac;
      if (data.cacNumber !== undefined) merged.cac = data.cacNumber;

      return {
        ...prev,
        shop: merged,
      };
    });
  };

  const resetOnboarding = () => {
    setOnboardingData(initialData);
  };

  return (
    <OnboardingContext.Provider value={{ onboardingData, updatePersonal, updateShop, resetOnboarding, isSubmitted, setIsSubmitted, loadingCheck }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
