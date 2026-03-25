import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function BirthDate() {
  const navigate = useNavigate();
  const { userData, updateUserData } = useUserData();
  const { t } = useTranslation();
  
  // State for the picker
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (userData.dateOfBirth) {
      const dateStr = typeof userData.dateOfBirth === 'string' 
        ? userData.dateOfBirth 
        : new Date(userData.dateOfBirth).toISOString().split('T')[0];
      return parseInt(dateStr.split('-')[0]);
    }
    return 2000;
  });
  
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    if (userData.dateOfBirth) {
      const dateStr = typeof userData.dateOfBirth === 'string' 
        ? userData.dateOfBirth 
        : new Date(userData.dateOfBirth).toISOString().split('T')[0];
      return parseInt(dateStr.split('-')[1]);
    }
    return 1;
  });
  
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    if (userData.dateOfBirth) {
      const dateStr = typeof userData.dateOfBirth === 'string' 
        ? userData.dateOfBirth 
        : new Date(userData.dateOfBirth).toISOString().split('T')[0];
      return parseInt(dateStr.split('-')[2]);
    }
    return 1;
  });
  
  const [showPicker, setShowPicker] = useState(false);
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const minYear = 1900;
  const maxYear = currentYear;
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  
  // Validate and adjust day if needed
  if (selectedDay > daysInMonth) {
    setSelectedDay(daysInMonth);
  }
  
  // Year options (last 100 years)
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Format date as YYYY-MM-DD
  const formattedDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  
  // Check if date is valid
  const isValidDate = () => {
    const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    selectedDate.setHours(0, 0, 0, 0);
    
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    const minDate = new Date(minYear, 0, 1);
    minDate.setHours(0, 0, 0, 0);
    
    // Check range
    if (selectedDate < minDate || selectedDate > todayDate) {
      return false;
    }
    
    // Check age (at least 13)
    let age = currentYear - selectedYear;
    const monthDiff = today.getMonth() - (selectedMonth - 1);
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDay)) {
      age--;
    }
    
    return age >= 13;
  };
  
  const handleContinue = () => {
    if (isValidDate()) {
      updateUserData({ dateOfBirth: formattedDate });
      navigate('/onboarding/birth-time');
    }
  };
  
  // Quick year navigation
  const handleYearChange = (delta: number) => {
    const newYear = selectedYear + delta;
    if (newYear >= minYear && newYear <= maxYear) {
      setSelectedYear(newYear);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        <div className="text-center space-y-2">
          <h1 className="text-3xl">Nice to meet you, {userData.name}! ✨</h1>
          <p className="text-muted-foreground">{t('onboarding.birthDate.subtitle')}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-sm text-muted-foreground block">{t('profile.dateOfBirth')}</label>
            
            {/* Display selected date */}
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="w-full flex items-center justify-between p-4 bg-input-background border border-border rounded-xl hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg text-foreground">
                  {selectedDay} {monthNames[selectedMonth - 1]} {selectedYear}
                </span>
              </div>
              <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${showPicker ? 'rotate-90' : ''}`} />
            </button>
            
            {/* Date Picker */}
            {showPicker && (
              <div className="border border-border rounded-xl bg-card p-4 space-y-4 animate-in slide-in-from-top-2">
                
                {/* Year selector with quick navigation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleYearChange(-10)}
                      className="px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium"
                    >
                      -10
                    </button>
                    <div className="flex items-center gap-2 flex-1 justify-center">
                      <button
                        onClick={() => handleYearChange(-1)}
                        className="p-1 rounded-full hover:bg-muted"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div className="relative">
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                          className="appearance-none bg-transparent text-center text-lg font-semibold py-1 px-4 rounded-lg border border-border focus:outline-none focus:border-primary"
                        >
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => handleYearChange(1)}
                        className="p-1 rounded-full hover:bg-muted"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleYearChange(10)}
                      className="px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium"
                    >
                      +10
                    </button>
                  </div>
                </div>
                
                {/* Month selector */}
                <div className="grid grid-cols-3 gap-2">
                  {monthNames.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => setSelectedMonth(index + 1)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        selectedMonth === index + 1
                          ? 'bg-primary text-white'
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      }`}
                    >
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
                
                {/* Day selector */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Day</p>
                  <div className="grid grid-cols-7 gap-1 max-h-32 overflow-y-auto">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedDay === day
                            ? 'bg-primary text-white'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Validation message */}
            {!isValidDate() && (
              <p className="text-sm text-red-500 mt-2">
                {new Date(formattedDate) > new Date() 
                  ? 'Birth date cannot be in the future'
                  : 'You must be at least 13 years old'
                }
              </p>
            )}
          </div>
          
          <Button
            onClick={handleContinue}
            disabled={!isValidDate()}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl"
          >
            {t('onboarding.next')}
          </Button>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all ${i === 1 ? 'w-8 bg-primary' : 'w-1.5 bg-border'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}