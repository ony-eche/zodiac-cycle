import { createContext, useContext, useState, ReactNode } from 'react';

export interface UserData {
  name?: string;
  dateOfBirth?: Date;
  timeOfBirth?: string;
  placeOfBirth?: string;
  tracksPeriods?: boolean;
  periodsRegular?: boolean;
  knowsLastPeriod?: boolean;
  lastPeriodStart?: Date;
  lastPeriodEnd?: Date;
  hormonalTracking?: {
    mood?: string;
    stressLevel?: string;
    sleepQuality?: string;
    headaches?: boolean;
    cramps?: boolean;
    libido?: string;
  };
  lifestyle?: {
    sleepHours?: string;
    stressLevel?: string;
    exerciseFrequency?: string;
    birthControl?: boolean;
    birthControlType?: string;
    pregnancyStatus?: string;
  };
  currentCity?: string;
  hasPaid?: boolean;
}

interface UserDataContextType {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>({});

  const updateUserData = (data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  return (
    <UserDataContext.Provider value={{ userData, updateUserData }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider');
  }
  return context;
}
