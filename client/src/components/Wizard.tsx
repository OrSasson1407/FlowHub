/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkspaceConfig } from '../types';
import { 
  ArrowRight, 
  Check, 
  HelpCircle, 
  Lock, 
  Mail, 
  Plus, 
  ShieldCheck, 
  Loader2, 
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';

interface WizardProps {
  config: WorkspaceConfig;
  onComplete: (updatedConfig: WorkspaceConfig) => void;
  onClose?: () => void;
  isInsideDashboard?: boolean;
}

export default function Wizard({ config, onComplete, onClose, isInsideDashboard = false }: WizardProps) {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>(config.email || 'dev@flowhub.io');
  const [password, setPassword] = useState<string>('');
  const [agreed, setAgreed] = useState<boolean>(true);
  const [calendar, setCalendar] = useState<'google' | 'outlook' | null>(config.calendarSynced);
  const [selectedTool, setSelectedTool] = useState<string | null>(
    config.connectedIntegrations.length > 0 ? config.connectedIntegrations[0] : null
  );

  // States for animations
  const [syncingCalendar, setSyncingCalendar] = useState<'google' | 'outlook' | null>(null);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleStep1Submit = () => {
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid work email.');
      return;
    }
    if (!password || password.length < 5) {
      setValidationError('Please choose a password with 5 or more characters.');
      return;
    }
    if (!agreed) {
      setValidationError('You must agree to the Terms of Service.');
      return;
    }
    setValidationError(null);
    setStep(2);
  };

  const handleSyncCalendar = (type: 'google' | 'outlook') => {
    setSyncingCalendar(type);
    setTimeout(() => {
      setCalendar(type);
      setSyncingCalendar(null);
    }, 1200);
  };

  const handleSelectIntegration = (toolId: string) => {
    // Exactly matches mockup: when selected, it locks/fades others, toggles selection
    if (selectedTool === toolId) {
      setSelectedTool(null);
    } else {
      setSelectedTool(toolId);
    }
  };

  const handleFinish = () => {
    setIsFinishing(true);
    setTimeout(() => {
      const integrations: string[] = [];
      if (selectedTool) integrations.push(selectedTool);

      onComplete({
        email,
        calendarSynced: calendar,
        connectedIntegrations: integrations,
        setupCompleted: true,
        hasSeenWizard: true
      });
      setIsFinishing(false);
    }, 1500);
  };

  const currentProgress = Math.round((step / 3) * 100);

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col transition-all duration-300 ${isInsideDashboard ? 'p-0 min-h-0 bg-transparent' : ''}`}>
      {/* Top Navigation Bar */}
      {!isInsideDashboard && (
        <header className="w-full h-16 flex justify-between items-center px-6 md:px-12 bg-white border-b border-slate-200">
          <div className="font-sans text-2xl font-bold text-slate-900 tracking-tight">FlowHub</div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.05em] text-slate-500">Setup Wizard</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
        </header>
      )}

      {/* Main onboarding canvas */}
      <main className={`flex-grow flex items-center justify-center p-4 md:p-8 ${isInsideDashboard ? 'py-4' : 'my-auto'}`}>
        <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start md:items-center">
          
          {/* Left Side: Progress HUD & Steps Description */}
          <div className="md:col-span-5 flex flex-col gap-6 md:gap-8">
            <div className="space-y-3">
              <h1 className="font-sans text-[28px] md:text-3xl font-bold leading-tight text-slate-900 tracking-tight">
                Let's build your <br />
                <span className="text-blue-600">perfect flow.</span>
              </h1>
              <p className="font-sans text-xs md:text-sm text-slate-500 max-w-sm">
                Configure your workspace in minutes. Connect your favorite tools to centralize your entire developer lifecycle.
              </p>
            </div>

            {/* Steps linear indicators */}
            <nav className="space-y-5 py-2">
              {/* Step 1 */}
              <div className={`flex items-center gap-4 group cursor-default transition-all duration-300 ${step === 1 ? 'opacity-100 scale-102' : 'opacity-50'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs font-bold ${step === 1 ? 'bg-blue-600 text-white' : step > 1 ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <div className="flex flex-col">
                  <span className={`font-mono text-[10px] font-bold tracking-wider ${step === 1 ? 'text-blue-650' : 'text-slate-400'}`}>ACCOUNT</span>
                  <span className="font-sans text-xs md:text-sm text-slate-900 font-medium">Secure your credentials</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`flex items-center gap-4 group cursor-default transition-all duration-300 ${step === 2 ? 'opacity-100 scale-102' : 'opacity-50'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs font-bold ${step === 2 ? 'bg-blue-600 text-white' : step > 2 ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <div className="flex flex-col">
                  <span className={`font-mono text-[10px] font-bold tracking-wider ${step === 2 ? 'text-blue-650' : 'text-slate-400'}`}>CALENDAR</span>
                  <span className="font-sans text-xs md:text-sm text-slate-900 font-medium">Sync your schedule</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`flex items-center gap-4 group cursor-default transition-all duration-300 ${step === 3 ? 'opacity-100 scale-102' : 'opacity-50'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs font-bold ${step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  3
                </div>
                <div className="flex flex-col">
                  <span className={`font-mono text-[10px] font-bold tracking-wider ${step === 3 ? 'text-blue-650' : 'text-slate-400'}`}>INTEGRATIONS</span>
                  <span className="font-sans text-xs md:text-sm text-slate-900 font-medium">Connect your stack</span>
                </div>
              </div>
            </nav>

            {/* Stepper Progress bar */}
            <div className="pt-4 border-t border-slate-200 max-w-[240px]">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-xs">
                <div className="h-full bg-blue-600 transition-all duration-500 rounded-full" style={{ width: `${currentProgress}%` }}></div>
              </div>
              <p className="mt-2 font-mono text-[11px] font-bold text-slate-400">
                Progress: <span className="text-slate-900">{currentProgress}%</span>
              </p>
            </div>

            {/* Quick action to exit if dashboard config editing */}
            {isInsideDashboard && onClose && (
              <button 
                onClick={onClose}
                className="mt-4 self-start flex items-center gap-2 text-xs font-mono tracking-wider text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" /> ABORT EDITING & RETURN
              </button>
            )}
          </div>

          {/* Right Side: Wizard Content Form (Canvas box) */}
          <div className="md:col-span-7 bg-white border border-slate-200 p-6 md:p-10 min-h-[460px] flex flex-col justify-between shadow-sm rounded-2xl relative overflow-hidden">
            
            {/* Top exit button inside block if inside dashboard */}
            {onClose && (
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-950 transition-colors p-1"
                title="Discard wizard"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <>
              {/* Step 1 Account Setup */}
              {step === 1 && (
                <div
                  className="flex flex-col h-full justify-between flex-grow"
                >
                  <div>
                    <div className="mb-6 md:mb-8">
                      <h2 className="font-sans text-xl md:text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
                      <p className="font-sans text-xs md:text-sm text-slate-400">Use your work email for easier organization.</p>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] md:text-xs font-bold text-slate-500 tracking-widest block uppercase">EMAIL ADDRESS</label>
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full border-0 border-b border-slate-200 focus:border-blue-600 focus:ring-0 bg-transparent py-2.5 px-0 font-sans text-sm md:text-base text-slate-900 placeholder:text-slate-350 focus:outline-none transition-all"
                          placeholder="dev@flowhub.io"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-mono text-[10px] md:text-xs font-bold text-slate-500 tracking-widest block uppercase">PASSWORD</label>
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full border-0 border-b border-slate-200 focus:border-blue-600 focus:ring-0 bg-transparent py-2.5 px-0 font-sans text-sm md:text-base text-slate-900 placeholder:text-slate-350 focus:outline-none transition-all"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="flex items-start gap-3 py-2">
                        <input 
                          id="terms" 
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-slate-200 text-blue-600 focus:ring-blue-600 cursor-pointer" 
                        />
                        <label htmlFor="terms" className="font-sans text-xs md:text-sm text-slate-450 select-none">
                          I agree to the <span className="text-blue-600 underline cursor-pointer hover:text-blue-700 font-bold">Terms of Service</span> and consent to sync metadata.
                        </label>
                      </div>
                    </div>

                    {validationError && (
                      <div className="mt-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                        {validationError}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 md:pt-8 mt-auto flex justify-end">
                    <button 
                      onClick={handleStep1Submit}
                      className="bg-blue-600 text-white px-6 md:px-8 py-3 font-sans text-xs font-bold tracking-wider hover:bg-blue-750 transition-all flex items-center gap-2 rounded-xl shadow-xs cursor-pointer uppercase"
                    >
                      CONTINUE <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 Calendar Sync */}
              {step === 2 && (
                <div
                  className="flex flex-col h-full justify-between flex-grow"
                >
                  <div>
                    <div className="mb-6 md:mb-8">
                      <h2 className="font-sans text-xl md:text-2xl font-bold text-slate-900 mb-1">Sync your calendar</h2>
                      <p className="font-sans text-xs md:text-sm text-slate-400">Enable automated task scheduling based on your availability.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Google Calendar button */}
                      <button 
                        onClick={() => handleSyncCalendar('google')}
                        className={`w-full flex items-center justify-between p-4 border text-left rounded-2xl transition-all group cursor-pointer ${calendar === 'google' ? 'bg-slate-50 border-blue-600' : 'border-slate-200 hover:border-blue-600 hover:bg-slate-50/50'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 p-1.5 shrink-0 shadow-xs">
                            <img 
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxWaM6wenmDQw2-fBF65SwG8XwmUaPOsm0McZ5Zq0i-Krfp9OUucIjAOZDwd--L9ds4JpunnLcTL3fjB6fPXcgtFVtVCKuyBTdofLFinSEqSEUCgJr9mL-bZGTtKv5rbgcDrxTqc39bnVye_0xiYbw1VKMRIpnAlFjWW6BoX_rHJ6pPnqgoLDxVaYHKJMQxlFFE4uThfLmlsWgNbKXnlA4v08xGws4dsYfxHTbupMZ9HZ9L2sNJ07sFGqukPSr9h7r2gTguIFaH0o" 
                              alt="Google" 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="font-sans text-sm md:text-base font-bold text-slate-900">Google Calendar</p>
                            <p className="font-sans text-xs text-slate-400 font-medium font-medium">Sync Workspace or Gmail Schedule</p>
                          </div>
                        </div>
                        <div>
                          {syncingCalendar === 'google' ? (
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          ) : calendar === 'google' ? (
                            <span className="font-sans text-xs font-bold text-blue-600 flex items-center gap-1 uppercase">Connected <Check className="w-4 h-4" /></span>
                          ) : (
                            <span className="font-sans text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors uppercase">Connect</span>
                          )}
                        </div>
                      </button>

                      {/* Outlook Calendar button */}
                      <button 
                        onClick={() => handleSyncCalendar('outlook')}
                        className={`w-full flex items-center justify-between p-4 border text-left rounded-2xl transition-all group cursor-pointer ${calendar === 'outlook' ? 'bg-slate-50 border-blue-600' : 'border-slate-200 hover:border-blue-600 hover:bg-slate-50/50'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 p-1.5 shrink-0 shadow-xs">
                            <img 
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiU9pR29y3r5hOQ4bZHP-wV7HTrU8RBdW8NOHeG_jwZQexwk5DZh6LMiPPqIwD-VcN8bJfxUt6u6ghS-J4MMeX5t0xC-UQbek2iXuTlXSepx_CTwWM6zgaoG617P_C6UNvy4TnVMQM854mjXLnQHM2AbOPVc53EUkfPjfd8rlBDV4zNGTtYpbIaSVlOKthFisYt4H0QaibrRraDdnIrxg0LzztLwzQjFbAsuh1f7Q_IhB_ywIUxgF6aYXCwuH9Bq4Fj1idQFwVzzE" 
                              alt="Outlook" 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="font-sans text-sm md:text-base font-bold text-slate-900">Microsoft Outlook</p>
                            <p className="font-sans text-xs text-slate-400 font-medium font-medium">Sync Office 365 or Hotmail</p>
                          </div>
                        </div>
                        <div>
                          {syncingCalendar === 'outlook' ? (
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          ) : calendar === 'outlook' ? (
                            <span className="font-sans text-xs font-bold text-blue-600 flex items-center gap-1 uppercase">Connected <Check className="w-4 h-4" /></span>
                          ) : (
                            <span className="font-sans text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors uppercase">Connect</span>
                          )}
                        </div>
                      </button>

                      <div className="pt-2 flex items-center gap-2 text-xs text-slate-450 font-medium select-none">
                        <Lock className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                        <span>Security guarantee: We only read calendar metadata to prevent schedule overlaps.</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 md:pt-8 mt-auto flex justify-between items-center bg-white">
                    <button 
                      onClick={() => setStep(1)}
                      className="font-sans text-xs font-bold tracking-wider text-slate-400 hover:text-slate-950 transition-colors cursor-pointer uppercase"
                    >
                      BACK
                    </button>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          setCalendar(null);
                          setStep(3);
                        }}
                        className="text-blue-600 font-sans text-xs font-bold tracking-wider hover:underline px-2 cursor-pointer uppercase"
                      >
                        SKIP FOR NOW
                      </button>
                      <button 
                        onClick={() => setStep(3)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 font-sans text-xs font-bold tracking-wider rounded-xl shadow-xs cursor-pointer uppercase"
                      >
                        CONTINUE
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 Integrations */}
              {step === 3 && (
                <div
                  className="flex flex-col h-full justify-between flex-grow"
                >
                  <div>
                    <div className="mb-6 md:mb-8">
                      <h2 className="font-sans text-xl md:text-2xl font-bold text-slate-900 mb-1">Connect your tools</h2>
                      <p className="font-sans text-xs md:text-sm text-slate-400">FlowHub works best when your data lives in one place. Select your primary tool.</p>
                    </div>

                    {/* Integrated Tool Grid matching locking behavior! */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                      {/* GitHub */}
                      <div 
                        onClick={() => handleSelectIntegration('github')}
                        className={`border rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative select-none
                          ${selectedTool === 'github' 
                            ? 'border-blue-600 bg-slate-50 scale-[1.02] shadow-sm' 
                            : selectedTool !== null 
                              ? 'opacity-30 grayscale pointer-events-none border-slate-100' 
                              : 'border-slate-200 hover:border-blue-600 hover:bg-slate-50/50'
                          }
                        `}
                      >
                        <div className="w-12 h-12 flex items-center justify-center mb-3">
                          <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDanyOAJIBi-PmQQGNCkj8Xw2k3ITHm5HdKJht_oSII86fG4b-o7Ge9NXqi54jBMdveOJo5ITTvYT49RmGpIiszQsYC-FMpmt7mOuUCme8rGM_PRc9gEclzu2AtpOP7IZn-j5h6ZvtmlMPZ1voYuB8wIs8kwlChGr9EVX24ZMwAw2aL6AZYF1rB8fBPQp2ParO_NgIapLE9csKqyzDiF6u2ugLEWEUxCXFnJzfISPyBbjiH96M9IGuNpcWTuwFQftNCmrZsVtOzC9s" 
                            alt="Github" 
                            className="w-10 h-10 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-905 text-slate-900">GITHUB</span>
                        {selectedTool === 'github' && (
                          <span className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      {/* Jira */}
                      <div 
                        onClick={() => handleSelectIntegration('jira')}
                        className={`border rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative select-none
                          ${selectedTool === 'jira' 
                            ? 'border-blue-600 bg-slate-50 scale-[1.02] shadow-sm' 
                            : selectedTool !== null 
                              ? 'opacity-30 grayscale pointer-events-none border-slate-100' 
                              : 'border-slate-200 hover:border-blue-600 hover:bg-slate-50/50'
                          }
                        `}
                      >
                        <div className="w-12 h-12 flex items-center justify-center mb-3">
                          <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKaXAlBtbRhvj0ifNqBTI8craqZsab8PhwV9neMS-AtWuCa1jWFuNqhympGWixU_ewz9gg5UGUOgEwLf5ulauCWMMe3_XciqmP_9EzRZ7_iIcQ1OiVdOR5VsgjycFM4QJohn5zFkOYNvY7FHAcjG3xAHEggd9S49ic5nlfrUUq_ufFNFyZ1PfLh72NJhFrqheJDRrV7OTTdXDidbBwEmQaHpfC49JOPs1Phing-D0qxghr259ViukFDUpTSNXGmEav3Non9oUFOME"
                            alt="Jira" 
                            className="w-10 h-10 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-905 text-slate-900">JIRA</span>
                        {selectedTool === 'jira' && (
                          <span className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      {/* Gmail */}
                      <div 
                        onClick={() => handleSelectIntegration('gmail')}
                        className={`border rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative select-none
                          ${selectedTool === 'gmail' 
                            ? 'border-blue-600 bg-slate-50 scale-[1.02] shadow-sm' 
                            : selectedTool !== null 
                              ? 'opacity-30 grayscale pointer-events-none border-slate-100' 
                              : 'border-slate-200 hover:border-blue-600 hover:bg-slate-50/50'
                          }
                        `}
                      >
                        <div className="w-12 h-12 flex items-center justify-center mb-3">
                          <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTILY418rMn8auf9mxrdQYbbRSW4Mdm9uCMy8ojVYg_yQprIE6gKVfpkNgRh0DTYtmHpSUJuvNn4CHM4b0F37PUmkFTGOUihDtZ2KCrc2kKr7wJmRIdZtMaPh32ecJfKygGuMlA4ZPN5pvx0jfCkzBF4upXSqlq10zF-el-vkMCmV6v_rFyezraaShFeltwXkfjwYxQZDJan5dWnBmgATBQ5dqwyfH2UxC27aw4zgmii69h1L9D04aBShHA0GHR1nkRcHZHOthdjs" 
                            alt="Gmail" 
                            className="w-10 h-10 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-905 text-slate-900">GMAIL</span>
                        {selectedTool === 'gmail' && (
                          <span className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 text-slate-500 font-medium text-xs font-sans text-center">
                      {selectedTool === null ? (
                        <span>Feel free to choose a stack hub or select later.</span>
                      ) : (
                        <span>Excellent selection! FlowHub will automatically ingest active items from your {selectedTool === 'github' ? 'GitHub pull requests' : selectedTool === 'jira' ? 'Jira project tickets' : 'Gmail inbox'}.</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 md:pt-8 mt-auto flex justify-between items-center bg-white">
                    <button 
                      onClick={() => setStep(2)}
                      className="font-sans text-xs font-bold tracking-wider text-slate-400 hover:text-slate-950 transition-colors cursor-pointer uppercase"
                    >
                      BACK
                    </button>
                    
                    <button 
                      onClick={handleFinish}
                      disabled={isFinishing}
                      className="bg-blue-600 text-white px-6 md:px-8 py-3 font-sans text-xs font-bold tracking-wider hover:bg-blue-750 transition-all flex items-center gap-2 rounded-xl shadow-lg cursor-pointer disabled:opacity-75 disabled:pointer-events-none uppercase"
                    >
                      {isFinishing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> REDIRECTING...
                        </>
                      ) : (
                        <>
                          FINISH SETUP <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          </div>
        </div>
      </main>

      {/* Footer Branding Area */}
      {!isInsideDashboard && (
        <footer className="w-full py-6 md:py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center bg-slate-100/50 border-t border-slate-200 mt-auto text-center gap-4">
          <p className="font-mono text-[10px] md:text-[11px] text-slate-400">
            © 2026 FLOWHUB TECHNOLOGIES. BUILT WITH SYSTEM CLARITY.
          </p>
          <div className="flex gap-6">
            <a href="#" className="font-mono text-[10px] md:text-[11px] text-slate-400 hover:text-blue-600 transition-colors uppercase">PRIVACY POLICY</a>
            <a href="#" className="font-mono text-[10px] md:text-[11px] text-slate-400 hover:text-blue-600 transition-colors uppercase">HELP & SUPPORT</a>
          </div>
        </footer>
      )}
    </div>
  );
}


