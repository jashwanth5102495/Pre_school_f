import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  School,
  GraduationCap,
  Briefcase,
  BookOpen,
  Eye,
  EyeOff,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Loader2,
  Check,
  Info,
} from 'lucide-react';
import { apiClient, API_BASE_URL } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

// 5 Institutional Roles with their dedicated visual slideshow slides and real seed credentials
const ROLE_SLIDES = [
  {
    role: 'SUPER_ADMIN',
    shortName: 'Super',
    fullName: 'Super Admin',
    badge: 'Platform',
    title: 'Platform Super Admin',
    subtitle: 'Multi-Tenant Cloud Control & Global SaaS Architecture',
    description:
      'Central command orchestrating institutional tenant isolation, enterprise subscriptions, multi-school deployments, and platform audit controls.',
    image: '/roles/super_admin.jpg',
    greeting: 'Hi Super Admin',
    email: 'superadmin@edusaas.com',
    pass: 'SuperAdmin@2026!',
    icon: Shield,
    colorAccent: 'text-amber-400',
  },
  {
    role: 'SCHOOL_ADMIN',
    shortName: 'Admin',
    fullName: 'School Admin',
    badge: 'Principal',
    title: 'School Principal & Administrator',
    subtitle: 'Institutional Leadership, Campus Strategy & Governance',
    description:
      'Complete oversight of branch academic operations, financial health, staff compliance, campus infrastructure, and institutional excellence.',
    image: '/roles/school_admin.jpg',
    greeting: 'Hi School Admin',
    email: 'admin@oakridge.example.edu',
    pass: 'OakridgeAdmin@2026!',
    icon: School,
    colorAccent: 'text-blue-400',
  },
  {
    role: 'HEAD_MASTER',
    shortName: 'Master',
    fullName: 'Head Master',
    badge: 'Academic',
    title: 'Head Master & Academic Director',
    subtitle: 'Curriculum Timetables, Faculty Allotment & Leave Moderation',
    description:
      'Automated classroom timetable generation, substitute teacher allotment, academic syllabus progress, and teacher leave management.',
    image: '/roles/head_master.jpg',
    greeting: 'Hi Head Master',
    email: 'headmaster@oakridge.example.edu',
    pass: 'HeadMaster@2026!',
    icon: GraduationCap,
    colorAccent: 'text-emerald-400',
  },
  {
    role: 'OFFICE_ADMIN',
    shortName: 'Office',
    fullName: 'Office Admin',
    badge: 'Finance',
    title: 'Office & Finance Administrator',
    subtitle: 'Fee Collections, Invoicing & Student Document Archival',
    description:
      'Multi-component fee collection, instant tax receipts, student admission registries, digital document storage, and ledger reconciliation.',
    image: '/roles/office_admin.jpg',
    greeting: 'Hi Office Admin',
    email: 'office@oakridge.example.edu',
    pass: 'OfficeAdmin@2026!',
    icon: Briefcase,
    colorAccent: 'text-purple-400',
  },
  {
    role: 'TEACHER',
    shortName: 'Teacher',
    fullName: 'Teacher',
    badge: 'Faculty',
    title: 'Faculty & Classroom Educator',
    subtitle: 'Real-Time Attendance, Marks Entry & Student Evaluations',
    description:
      'Daily period-wise student attendance, internal assessment scores, exam marks moderation, syllabus coverage, and academic remarks.',
    image: '/roles/teacher.jpg',
    greeting: 'Hi Educator',
    email: 'teacher.math@oakridge.example.edu',
    pass: 'Teacher@2026!',
    icon: BookOpen,
    colorAccent: 'text-rose-400',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Left Visual Slideshow State (Loops automatically and independently)
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const activeSlide = ROLE_SLIDES[currentSlideIndex];

  // Right Form Selected Role State (Stable: Only changes when user clicks, never shifts automatically!)
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);
  const selectedRole = ROLE_SLIDES[selectedRoleIndex];

  // Form Input State (Pinned to user selection)
  const [email, setEmail] = useState<string>(ROLE_SLIDES[0].email);
  const [password, setPassword] = useState<string>(ROLE_SLIDES[0].pass);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWarmingUp, setIsWarmingUp] = useState<boolean>(false);
  const [showServerConfig, setShowServerConfig] = useState<boolean>(false);
  const [customBackendUrl, setCustomBackendUrl] = useState<string>(() => {
    return localStorage.getItem('custom_backend_url') || '';
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isTestingBackend, setIsTestingBackend] = useState<boolean>(false);
  const [testBackendResult, setTestBackendResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestBackendConnection = async (urlToTest: string) => {
    let target = urlToTest.trim().replace(/\/+$/, '');
    if (!target) return;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }
    const healthUrl = target.endsWith('/api/v1') ? `${target}/health` : `${target}/api/v1/health`;
    setIsTestingBackend(true);
    setTestBackendResult(null);
    try {
      const res = await fetch(healthUrl, { method: 'GET', signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        setTestBackendResult({ success: true, message: 'Backend is online and reachable!' });
      } else {
        setTestBackendResult({ success: false, message: `Server responded with status HTTP ${res.status}` });
      }
    } catch (e: any) {
      setTestBackendResult({
        success: false,
        message: `Cannot reach backend: ${e.message || 'Offline or connection refused'}`,
      });
    } finally {
      setIsTestingBackend(false);
    }
  };

  // Automatic Looping Slideshow State for Left Visual Showcase (4.5s loop)
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Live Date and Time State
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // Language Dropdown State
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<{ code: string; label: string; flag: string }>({
    code: 'EN',
    label: 'English',
    flag: '🇬🇧',
  });

  // Modal for Support / Contact Admin notice
  const [showAdminNotice, setShowAdminNotice] = useState<boolean>(false);

  // Left Slide navigation handlers (Independent visual showcase)
  const handlePrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev === 0 ? ROLE_SLIDES.length - 1 : prev - 1));
  }, []);

  const handleNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev === ROLE_SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  // Automatic Continuous Loop on the left visual showcase
  useEffect(() => {
    if (isPaused) return;

    const loopTimer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev === ROLE_SLIDES.length - 1 ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(loopTimer);
  }, [isPaused]);

  // Keyboard navigation for Left and Right arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft') handlePrevSlide();
      if (e.key === 'ArrowRight') handleNextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevSlide, handleNextSlide]);

  // Explicit User Click on one of the 5 Role Boxes (No layout shifts, stable form)
  const handleSelectRole = (index: number) => {
    setSelectedRoleIndex(index);
    setCurrentSlideIndex(index); // Syncs visual slide to selected role
    const target = ROLE_SLIDES[index];
    setEmail(target.email);
    setPassword(target.pass);
    setErrorMessage(null);
  };

  // Role-based redirection
  const redirectByRole = (user: any) => {
    if (user.userType === 'PLATFORM') {
      navigate('/dashboard');
    } else if (user.role === 'SCHOOL_ADMIN') {
      navigate('/school-admin/dashboard');
    } else if (user.role === 'HEAD_MASTER') {
      navigate('/head-master/dashboard');
    } else if (user.role === 'OFFICE_ADMIN') {
      navigate('/office-admin/dashboard');
    } else if (user.role === 'TEACHER') {
      navigate('/teacher/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setIsWarmingUp(false);
    setErrorMessage(null);
    setSuccessMessage(null);

    const warmTimer = setTimeout(() => {
      setIsWarmingUp(true);
    }, 2500);

    try {
      const res = await apiClient.post('/auth/login', {
        email: email.trim(),
        password,
      });

      clearTimeout(warmTimer);
      setIsWarmingUp(false);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      setSuccessMessage(`Welcome back, ${user.fullName || user.role}!`);

      setTimeout(() => {
        redirectByRole(user);
      }, 700);
    } catch (err: any) {
      clearTimeout(warmTimer);
      setIsWarmingUp(false);
      let msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please check your credentials.';

      const isStatus405 = err.response?.status === 405 || msg.includes('405');
      const isStatus404 = (err.response?.status === 404 || msg.includes('404')) && !err.response?.data?.error;
      const isNetworkFail = msg.includes('Network Error') || !err.response || err.code === 'ERR_NETWORK';

      if (isStatus405) {
        msg = `HTTP 405 (Method Not Allowed): The frontend is hosted on a static server (${window.location.hostname}) and cannot process API requests directly. Please connect your live backend server URL below.`;
        setShowServerConfig(true);
      } else if (isNetworkFail) {
        msg = `Cannot connect to backend server at ${API_BASE_URL}.`;
        setShowServerConfig(true);
      } else if (isStatus404) {
        msg = `404 Not Found: Backend API endpoint ${API_BASE_URL} does not exist on this host.`;
        setShowServerConfig(true);
      }

      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#212121] flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden font-sans antialiased selection:bg-[#eb4438] selection:text-white transition-colors duration-200">
      {/* ========================================================================= */}
      {/* LEFT COLUMN: FULL BLEED HERO VISUAL SLIDESHOW (NO BOX EDGES)             */}
      {/* ========================================================================= */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] h-full relative overflow-hidden flex-col justify-between p-8 xl:p-12 text-white bg-slate-950 select-none shrink-0"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Layered Role Images with smooth cross-fade transition */}
        {ROLE_SLIDES.map((slide, idx) => (
          <div
            key={slide.role}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out transform ${
              idx === currentSlideIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105 pointer-events-none'
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}

        {/* Deep atmospheric gradients for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/55 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Top Bar inside Left Section */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wide uppercase">Smart Edu ERP</span>
            <span className="hidden sm:inline-block text-[11px] text-white/70 font-medium">
              • Autonomous Campus OS
            </span>
          </div>

          {/* Slide Index Counter & Live Loop Pulse */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-xs font-semibold text-white/90">
            <span className={`w-1.5 h-1.5 rounded-full bg-[#eb4438] ${isPaused ? '' : 'animate-ping'}`} />
            <span className="text-white font-bold">0{currentSlideIndex + 1}</span>
            <span className="text-white/40">/</span>
            <span className="text-white/60">0{ROLE_SLIDES.length}</span>
          </div>
        </div>

        {/* Bottom Area: Dynamic Role Information & Working Arrow Controls */}
        <div className="relative z-10 flex items-end justify-between gap-6 pt-8">
          {/* Role Title & Description */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold text-white mb-3 uppercase tracking-wider">
              <span className={activeSlide.colorAccent}>{activeSlide.badge}</span>
              <span className="text-white/50">•</span>
              <span className="text-white/90">{activeSlide.shortName} Operations</span>
            </div>

            <h1 className="text-2xl xl:text-4xl font-extrabold text-white tracking-tight drop-shadow-md mb-2">
              {activeSlide.title}
            </h1>

            <p className="text-xs xl:text-sm text-white/85 font-normal leading-relaxed drop-shadow-sm mb-4 line-clamp-2">
              {activeSlide.description}
            </p>

            {/* Slide progress indicators */}
            <div className="flex items-center gap-2">
              {ROLE_SLIDES.map((r, idx) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlideIndex
                      ? 'w-8 bg-[#eb4438]'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Working Slide Navigation Arrows */}
          <div className="flex items-center gap-2.5 shrink-0 pb-1">
            <button
              type="button"
              onClick={handlePrevSlide}
              aria-label="Previous Slide"
              className="w-11 h-11 rounded-full border border-white/40 bg-black/45 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#eb4438] hover:text-white hover:border-[#eb4438] transition-all duration-200 active:scale-90 shadow-xl cursor-pointer"
              title="Previous Slide (or Press Left Arrow)"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNextSlide}
              aria-label="Next Slide"
              className="w-11 h-11 rounded-full border border-white/40 bg-black/45 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#eb4438] hover:text-white hover:border-[#eb4438] transition-all duration-200 active:scale-90 shadow-xl cursor-pointer"
              title="Next Slide (or Press Right Arrow)"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: RESPONSIVE AUTHENTICATION INTERFACE                         */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[48%] xl:w-[45%] min-h-screen lg:h-full flex flex-col justify-between p-0 lg:p-12 xl:p-14 overflow-y-auto bg-white dark:bg-[#212121] transition-colors duration-200">
        
        {/* ========================================================================= */}
        {/* MOBILE ONLY TOP PRODUCT DETAILS BANNER (MATCHES USER REFERENCE IMAGE)     */}
        {/* ========================================================================= */}
        <div className="lg:hidden w-full bg-gradient-to-br from-[#eb4438] via-[#e0382d] to-[#b8281d] dark:from-[#b8291f] dark:to-[#831818] text-white rounded-b-[2.5rem] px-6 pt-7 pb-8 shadow-xl relative overflow-hidden shrink-0">
          {/* Soft ambient background circles */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-black/15 blur-xl pointer-events-none" />

          {/* Top Row: Brand & Mobile Theme/Language Controls */}
          <div className="relative z-10 flex items-start justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm font-sans">
                Smart Edu
              </h1>
              <p className="text-xs font-bold text-white/90 tracking-wider">
                By BluNet IT Services
              </p>
              <p className="text-[11px] font-medium text-white/80 mt-0.5">
                Enterprise Multi-Tenant School ERP
              </p>
            </div>

            {/* Mobile Header Controls: Theme Toggle & Language */}
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/30 bg-white/20 backdrop-blur-md hover:bg-white/30 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
                >
                  <span className="text-xs">{currentLang.flag}</span>
                  <span className="text-[11px] font-bold">{currentLang.code}</span>
                  <ChevronDown className="w-3 h-3 text-white/80" />
                </button>

                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#282828] rounded-2xl shadow-xl border border-slate-100 dark:border-[#383838] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {[
                      { code: 'EN', label: 'English', flag: '🇬🇧' },
                      { code: 'HI', label: 'Hindi', flag: '🇮🇳' },
                      { code: 'AR', label: 'Arabic', flag: '🇦🇪' },
                      { code: 'ES', label: 'Spanish', flag: '🇪🇸' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setCurrentLang(lang);
                          setShowLangMenu(false);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#333333] text-slate-700 dark:text-slate-300 font-medium transition-colors"
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                        {currentLang.code === lang.code && (
                          <Check className="w-3.5 h-3.5 ml-auto text-[#eb4438]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hero Headline and Product Details (Exact Structure of Attached Image) */}
          <div className="relative z-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Manage your campus,
              <br />
              grow your institution.
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
              The all-in-one platform for schools to streamline academics, automate administration, and empower teachers and students.
            </p>
          </div>
        </div>

        {/* DESKTOP TOP HEADER: Brand Name + Date/Time + Theme Toggle + Language */}
        <div className="hidden lg:flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-2xl xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
              SMART EDU
            </span>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 tracking-widest uppercase">
              By BluNet IT Services
            </span>
          </div>

          {/* Right Header Controls: Unboxed Date/Time + Theme Toggle + Language */}
          <div className="flex items-center gap-3">
            {/* Classic Unboxed Live Date & Time */}
            <div className="hidden sm:flex items-center gap-2 text-xs select-none whitespace-nowrap text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-500 dark:text-slate-400">{formattedDate}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 tabular-nums">{formattedTime}</span>
            </div>

            {/* Dark Mode Theme Switching Toggle */}
            <ThemeToggle />

            {/* Language Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#282828] hover:bg-slate-50 dark:hover:bg-[#333333] text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-all cursor-pointer"
              >
                <span className="text-sm">{currentLang.flag}</span>
                <span>{currentLang.code}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#282828] rounded-2xl shadow-xl border border-slate-100 dark:border-[#383838] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { code: 'EN', label: 'English', flag: '🇬🇧' },
                    { code: 'HI', label: 'Hindi', flag: '🇮🇳' },
                    { code: 'AR', label: 'Arabic', flag: '🇦🇪' },
                    { code: 'ES', label: 'Spanish', flag: '🇪🇸' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setCurrentLang(lang);
                        setShowLangMenu(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#333333] text-slate-700 dark:text-slate-300 font-medium transition-colors"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                      {currentLang.code === lang.code && (
                        <Check className="w-3.5 h-3.5 ml-auto text-[#eb4438]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Section: Authentication Form */}
        <div className="w-full max-w-[400px] mx-auto my-auto p-6 sm:p-10 lg:p-0 py-6 sm:py-8 lg:py-2">
          {/* Header (On mobile: Welcome Back, on desktop: Hi Super Admin) */}
          <div className="text-left lg:text-center mb-6">
            <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-black text-slate-950 dark:text-white tracking-tight leading-tight">
              <span className="lg:hidden">Welcome Back</span>
              <span className="hidden lg:inline">{selectedRole.greeting}</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 font-normal">
              <span className="lg:hidden">Enter your institutional credentials to access your portal.</span>
              <span className="hidden lg:inline">Welcome to Smart Edu ERP</span>
            </p>
          </div>

          {/* Feedback messages */}
          {isWarmingUp && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2.5 animate-in fade-in">
              <Loader2 className="w-4 h-4 animate-spin shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Connecting to backend server... (waking free-tier cloud instance, please hold on)</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
              <div className="pt-2 border-t border-red-200/60 dark:border-red-900/40 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
                <span>Attempted API: <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-black/30 font-mono text-[10px]">{API_BASE_URL}</code></span>
                <button
                  type="button"
                  onClick={() => setShowServerConfig(!showServerConfig)}
                  className="font-semibold text-[#eb4438] underline cursor-pointer hover:text-[#c9352a]"
                >
                  {showServerConfig ? 'Hide Settings' : 'Configure Backend URL'}
                </button>
              </div>
            </div>
          )}

          {/* Quick inline backend configuration if cloud URL differs */}
          {showServerConfig && (
            <div className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#282828] border border-slate-200 dark:border-[#383838] space-y-3 text-xs animate-in fade-in">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#eb4438] animate-pulse"></span>
                  Connect Live Backend API
                </span>
                <button type="button" onClick={() => setShowServerConfig(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Enter your deployed backend server URL (from Railway, Render, or cloud VPS):
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={customBackendUrl}
                  onChange={(e) => {
                    setCustomBackendUrl(e.target.value);
                    setTestBackendResult(null);
                  }}
                  placeholder="https://school-saas-backend.up.railway.app"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#404040] bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#eb4438]"
                />

                {testBackendResult && (
                  <div
                    className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                      testBackendResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {testBackendResult.success ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Info className="w-3.5 h-3.5 shrink-0" />}
                    <span>{testBackendResult.message}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleTestBackendConnection(customBackendUrl)}
                    disabled={isTestingBackend || !customBackendUrl.trim()}
                    className="flex-1 py-1.5 px-3 rounded-lg border border-slate-300 dark:border-[#444] bg-white dark:bg-[#333] hover:bg-slate-100 dark:hover:bg-[#3a3a3a] text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isTestingBackend ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <span>Test Connection</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (customBackendUrl.trim()) {
                        let formatted = customBackendUrl.trim().replace(/\/+$/, '');
                        if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
                          formatted = `https://${formatted}`;
                        }
                        if (!formatted.endsWith('/api/v1') && !formatted.endsWith('/api')) {
                          formatted = `${formatted}/api/v1`;
                        }
                        localStorage.setItem('custom_backend_url', formatted);
                      } else {
                        localStorage.removeItem('custom_backend_url');
                      }
                      window.location.reload();
                    }}
                    className="flex-1 py-1.5 px-3 bg-[#eb4438] hover:bg-[#c9352a] text-white font-bold rounded-lg text-xs cursor-pointer text-center"
                  >
                    Save & Connect
                  </button>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                Work Email
              </label>
              <input
                type="email"
                placeholder="e.g. admin@oakridge.example.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-[#383838] focus:outline-none focus:ring-2 focus:ring-[#eb4438]/20 focus:border-[#eb4438] transition-all bg-white dark:bg-[#262626] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Password Input with Forgot Password link on the label row */}
            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-semibold text-[#eb4438] hover:text-[#d9382d] hover:underline transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-10 text-sm rounded-xl border border-slate-200 dark:border-[#383838] focus:outline-none focus:ring-2 focus:ring-[#eb4438]/20 focus:border-[#eb4438] transition-all bg-white dark:bg-[#262626] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#eb4438] focus:ring-[#eb4438] accent-[#eb4438] cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                Remember me
              </label>
            </div>

            {/* 5 Quick Role Auto-Fill Boxes (Fixed Dimensions) */}
            <div className="pt-1 pb-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  Quick Role Auto-Fill
                </span>
                <span className="text-[10px] text-slate-400">Click to fill credentials</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {ROLE_SLIDES.map((r, idx) => {
                  const IconComponent = r.icon;
                  const isSelected = selectedRoleIndex === idx;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => handleSelectRole(idx)}
                      className={`h-16 flex flex-col items-center justify-center p-1.5 rounded-xl border transition-colors duration-150 cursor-pointer ${
                        isSelected
                          ? 'border-[#eb4438] bg-[#eb4438]/10 dark:bg-[#eb4438]/20 ring-1 ring-[#eb4438] text-[#eb4438]'
                          : 'border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#282828] hover:bg-slate-100 dark:hover:bg-[#303030] hover:border-slate-300 dark:hover:border-[#484848] text-slate-600 dark:text-slate-300'
                      }`}
                      title={`${r.fullName} (${r.badge})`}
                    >
                      <IconComponent
                        className={`w-4 h-4 mb-1 transition-colors ${
                          isSelected ? 'text-[#eb4438]' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      />
                      <span className="text-[10px] font-bold leading-tight truncate w-full text-center">
                        {r.shortName}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-400 leading-none truncate w-full text-center">
                        {r.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Signature Red Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#eb4438] hover:bg-[#d9382d] text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-[#eb4438]/25 hover:shadow-lg hover:shadow-[#eb4438]/35 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </button>

            {/* Need Access / Sign Up Notice */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 font-normal">
              Need account access?{' '}
              <button
                type="button"
                onClick={() => setShowAdminNotice(true)}
                className="text-[#eb4438] font-semibold hover:underline cursor-pointer"
              >
                Contact Institution Admin
              </button>
            </p>
          </form>
        </div>

        {/* Bottom Social Icons Row */}
        <div className="px-6 pb-6 pt-2 lg:p-0 flex items-center justify-center gap-6 text-slate-600 dark:text-slate-400">
          {/* Facebook */}
          <a
            href="#facebook"
            aria-label="Facebook"
            className="hover:text-black dark:hover:text-white transition-colors p-1"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          {/* Twitter / X */}
          <a
            href="#twitter"
            aria-label="Twitter"
            className="hover:text-black dark:hover:text-white transition-colors p-1"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          {/* LinkedIn */}
          <a
            href="#linkedin"
            aria-label="LinkedIn"
            className="hover:text-black dark:hover:text-white transition-colors p-1"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
          {/* Instagram */}
          <a
            href="#instagram"
            aria-label="Instagram"
            className="hover:text-black dark:hover:text-white transition-colors p-1"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Modal Dialog for Contact Admin Notice */}
      {showAdminNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#282828] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 dark:border-[#383838]">
            <div className="w-12 h-12 rounded-full bg-[#eb4438]/10 text-[#eb4438] flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Institutional Account Notice
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Smart Edu is an enterprise multi-tenant platform. Self-registration is restricted.
              User accounts and role-based credentials are created exclusively by your School
              Administrator or Platform Super Admin.
            </p>
            <button
              type="button"
              onClick={() => setShowAdminNotice(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
