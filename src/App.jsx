import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowLeft, Clock, FileText, Mail, MapPin, MessageCircleMore, Phone, Sparkles, Stethoscope, Star, Wallet, HeartPulse, Activity, AlertTriangle, CheckCircle2, XCircle, UserRound, MessageCircle, DollarSign, TrendingUp, Clock3, Users, ScanLine, ShieldCheck, BarChart3, Loader2, TriangleAlert, CalendarCheck, CalendarDays, Smile, PhoneCall, PawPrint } from 'lucide-react'
import DoctorAvailabilityShowcase from './components/DoctorAvailabilityShowcase.jsx'
import ReviewFeedbackCard from './components/ReviewFeedbackCard.jsx'
import AppointmentConfirmationPage from './components/AppointmentConfirmationPage.jsx'
import MedicalFileUploader from './components/MedicalFileUploader.jsx'
import PrescriptionModal from './components/PrescriptionModal.jsx'
import { buildMedicalCoordinatorJsonPrompt } from './components/geminiService.js'
import { supabase } from './supabaseClient.js'

const DashboardPortfolio = lazy(() => import('./components/DashboardPortfolio.jsx'))
const PremiumDoctorProfile = lazy(() => import('./components/PremiumDoctorProfile.jsx'))
const CinematicAnalyticsDashboard = lazy(() => import('./components/CinematicAnalyticsDashboard.jsx'))
const AITriageChat = lazy(() => import('./components/ai/AITriageChat.tsx'))
const DoctorDashboard = lazy(() => import('./components/dashboard/DoctorDashboard.tsx'))
const GatewayScreen = lazy(() => import('./components/GatewayScreen.jsx'))
import { TriageProvider } from './context/TriageContext'

function RouteFallback({ ui }) {
  const isAr = ui?.language === 'ar'
  return (
    <main className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4 dark:bg-[#020617]">
      <p className="text-sm text-slate-600 dark:text-slate-300">{isAr ? 'جارٍ التحميل…' : 'Loading…'}</p>
    </main>
  )
}

const defaultLanguage = 'ar'
const defaultTheme = 'light'
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const translations = {
  en: {
    navBrand: 'Hihya Care',
    navSubtitle: 'Cyberpunk Clinic Network',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    english: 'EN',
    arabic: 'AR',
    rtlBanner: 'The interface is now in Arabic with right-to-left direction.',
    homeKicker: '',
    homeTitle: '',
    homeDescription: '',
    loadingDoctors: 'Loading doctors...',
    loadingProfile: 'Loading doctor profile...',
    loadingAppointments: 'Loading appointments...',
    fallbackNotice: '',
    profileTitle: 'Doctor Profile',
    acceptingAppointments: 'Accepting Appointments',
    experience: 'Experience',
    clinicLocation: 'Clinic Location',
    price: 'Price',
    bookNow: 'Book Now',
    dashboard: 'Doctor Dashboard',
    backToDoctors: 'Back to Doctors',
    backToProfile: 'Back to Profile',
    specialty: 'Specialty',
    consultationFee: 'Consultation Fee',
    whatsapp: 'WhatsApp',
    bookingPortal: 'Booking Portal',
    bookingTitle: doctorName => (doctorName ? `Book ${doctorName}` : 'Book Appointment'),
    bookingIntro:
      'The same Supabase-backed booking flow, now wrapped in a routed cinematic medical experience.',
    selectedDoctor: 'Selected Doctor',
    bookingPatientName: 'Patient Name',
    bookingPhone: 'Phone Number',
    bookingAppointmentDate: 'Appointment Date',
    bookingPlaceholderName: 'Enter patient full name',
    bookingPlaceholderPhone: 'Enter contact number',
    bookingPlaceholderDate: 'Choose date and time',
    bookingDateHint: 'Pick when the appointment should take place.',
    confirmBooking: 'Confirm Booking',
    finalizingBooking: 'Finalizing Booking',
    readyStatus: 'Ready for a new booking',
    successTitle: 'Appointment secured',
    errorTitle: 'Submission needs attention',
    successMessage: 'Booking confirmed and stored in the appointment ledger.',
    bookingToastTitle: 'Booking confirmed',
    bookingToastBody: 'The appointment was saved and the WhatsApp handoff is ready.',
    whatsappCta: 'Chat with Clinic on WhatsApp',
    whatsappMissing: 'Doctor WhatsApp number is missing from the database.',
    whatsappQueued: 'WhatsApp notification queued for the doctor.',
    whatsappFallback: 'WhatsApp API endpoint is not configured. Use the chat link instead.',
    dashboardLogin: 'Doctor Login Simulation',
    dashboardAuthTitle: 'Secure doctor access',
    dashboardAuthIntro: 'Use a magic link or OTP to verify the session before loading the queue.',
    dashboardEmail: 'Email',
    dashboardEmailPlaceholder: 'doctor@hihyacare.com',
    sendMagicLink: 'Send Magic Link',
    dashboardOtpSent: 'Check your email for the login link or OTP.',
    dashboardOtpError: 'Could not send the OTP right now.',
    dashboardSessionActive: 'Supabase session active',
    dashboardCodeGateTitle: 'Doctor code',
    dashboardCodeGateIntro: 'Enter the private code that maps the session to one doctor.',
    clinicMapLink: 'Clinic location link',
    dashboardTitle: doctorName => (doctorName ? `${doctorName} Dashboard` : 'Doctor Dashboard'),
    dashboardIntro:
      'A private intake view filtered to one doctor. Only appointments with a matching doctor_id are displayed here.',
    appointmentsTitle: 'Appointments',
    appointmentsSubtitle: 'Filtered by doctor_id',
    appointmentsOverview: 'Appointments Overview',
    analyticsTitle: 'Analytics',
    analyticsIntro: 'Tracked from the live appointment ledger and refreshed after each booking.',
    exportReport: 'Export CSV',
    monthlyReport: 'Monthly performance',
    currentMonth: 'Current month',
    todayPatients: "Today's Patients", 
    monthPatients: 'This Month',
    revenueEstimate: 'Revenue Estimate',
    statusBreakdown: 'Status Breakdown',
    peakDay: 'Peak Day',
    monthlyTrends: 'Monthly Trends',
    liveQueue: 'Live Queue',
    totalWaiting: 'Total Waiting',
    doctorId: 'Doctor ID',
    state: 'State',
    cinematic: 'Cinematic',
    waiting: 'Waiting',
    noAppointments: 'No appointments for this doctor yet.',
    dashboardIdentity: 'Dashboard Identity',
    whatsappLabel: 'WhatsApp',
    returnHome: 'Return Home',
    doctorNotFound: 'Doctor not found',
    doctorNotFoundDescription: 'The profile you requested does not exist.',
    loadingDoctorData: 'Loading doctor data...',
    loadingAppointmentsData: 'Loading appointments...',
    supplyNotice: 'Showing cached doctor profile until Supabase is available.',
    appointmentsFallbackNotice: 'Appointments table is not fully available. Showing demo waiting patients.',
    loadingProfileFromDb: 'Pulling the profile from Supabase.',
    doctorUnknown: 'Unknown specialist',
    doctorFallbackBio: 'Cinematic specialist profile available on the details page.',
    doctorWhatsAppReady: 'WhatsApp Ready',
    doctorNoPhone: 'No Phone Number',
    doctorViewProfile: 'View Profile',
    doctorCardTitle: 'Doctor',
    profileSignal: 'Profile Signal',
    dashboardAppointments: 'Appointments',
    dashboardTotalWaiting: 'Total Waiting',
    dashboardDoctorId: 'Doctor ID',
    dashboardState: 'State',
    dashboardWaiting: 'Waiting',
    privateDoctorCode: 'Private Doctor Code',
    enterDashboardCode: 'Enter the code to unlock the doctor dashboard.',
    dashboardCodePlaceholder: 'Enter private doctor code',
    unlockDashboard: 'Unlock Dashboard',
    invalidDashboardCode: 'The code did not match any doctor.',
    dashboardUnlocked: 'Dashboard unlocked',
    appointmentStatus: 'Status',
    pendingStatus: 'Pending',
    inClinicStatus: 'In Clinic',
    completedStatus: 'Completed',
    toggleStatus: 'Toggle Status',
    statusUpdated: 'Status updated',
    dashboardCodeHelper: 'Each code maps to one doctor and one filtered queue.',
    reviewPortal: 'Review Portal',
    reviewTitle: 'Share your consultation review',
    reviewSubtitle: 'Your insight helps Hihya Care refine the clinical experience.',
    reviewRatingLabel: 'Your rating',
    reviewCommentLabel: 'Your experience',
    reviewCommentPlaceholder: 'Describe what stood out about the visit.',
    reviewSubmit: 'Submit Review',
    reviewSubmitting: 'Submitting',
    reviewThankYouTitle: 'Thank you',
    reviewThankYouBody: 'Your feedback was delivered to the care team.',
    reviewRatingRequired: 'Please select a rating before submitting.',
    reviewLockedTitle: 'Review locked',
    reviewLockedBody: 'Reviews unlock after the appointment is marked Completed.',
    reviewLockedCaption: 'Appointment status',
    reviewAuthRequired: 'Please sign in to submit a review.',
    reviewSavedLocal: 'Supabase is offline. Review saved locally.',
    reviewFallbackNotice: 'Supabase reviews table is not available. Showing local reviews.',
    reviewAnalyticsTitle: 'Review Analytics',
    reviewAverageLabel: 'Average Rating',
    reviewTotalLabel: 'Total Reviews',
    reviewDistributionLabel: 'Rating Distribution',
    reviewRecentLabel: 'Recent Reviews',
    reviewEmpty: 'No reviews yet.',
    reviewPatientFallback: 'Patient',
    reviewCommentFallback: 'No comment provided.',
    reviewOpen: 'Open Review',
    reviewUnavailable: 'Review available after completion',
    reviewPatientFeedback: 'Patient feedback',
    reviewProfileLabel: 'Patient Rating',
    reviewLoading: 'Loading reviews...',
    reviewNotFound: 'Review link not found.',
    reviewNotReady: 'Review not available yet.',
    reviewAppointmentLabel: 'Appointment',
    reviewDoctorLabel: 'Doctor',
    availabilityKicker: 'Quick booking',
    availabilityTitle: 'Available slots',
    availabilitySubtitle: 'Pick a time window before you arrive.',
    availabilitySelectDoctor: 'Select doctor',
    availabilityToday: 'Today',
    availabilityTomorrow: 'Tomorrow',
    availabilityDayAfter: 'After tomorrow',
    availabilityFrom: 'From',
    availabilityTo: 'To',
    availabilityBook: 'Book',
    availabilityNote: 'Advance booking, entry by arrival order.',
    availabilityRatingLabel: 'Overall rating',
    availabilityRatingCount: count => `${count} reviews`,
    availabilityRatingEmpty: 'New',
    availabilityPriceLabel: 'Consultation',
    availabilityPaymentLabel: 'Payment',
    availabilityPaymentValue: 'Online / Cash',
    availabilityWaitLabel: 'Wait time',
    availabilityWaitValue: minutes => `${minutes} min`,
    availabilityLocationLabel: 'Location',
    availabilityAvailabilityLabel: 'Status',
    availabilityAvailabilityValue: 'Open today',
    availabilityTagOne: 'Detailed explanation',
    availabilityTagTwo: 'Good listener',
    availabilityTagThree: 'Fast booking',
    availabilityBookNow: 'Book now',
    availabilityViewProfile: 'View profile',
    availabilityLoading: 'Loading doctor',
  },
  ar: {
    navBrand: 'هيهيا كير',
    navSubtitle: 'شبكة عيادات بطابع سايبربانك',
    language: 'اللغة',
    theme: 'الوضع',
    light: 'فاتح',
    dark: 'داكن',
    english: 'EN',
    arabic: 'AR',
    rtlBanner: 'تم ضبط الواجهة إلى العربية مع اتجاه من اليمين إلى اليسار.',
    homeKicker: '',
    homeTitle: '',
    homeDescription: '',
    loadingDoctors: 'جارٍ تحميل الأطباء...',
    loadingProfile: 'جارٍ تحميل ملف الطبيب...',
    loadingAppointments: 'جارٍ تحميل المواعيد...',
    fallbackNotice: '',
    profileTitle: 'ملف الطبيب',
    acceptingAppointments: 'يقبل الحجوزات',
    experience: 'الخبرة',
    clinicLocation: 'موقع العيادة',
    price: 'السعر',
    bookNow: 'احجز الآن',
    dashboard: 'لوحة الطبيب',
    backToDoctors: 'العودة إلى الأطباء',
    backToProfile: 'العودة إلى الملف',
    specialty: 'التخصص',
    consultationFee: 'رسوم الاستشارة',
    whatsapp: 'واتساب',
    bookingPortal: 'بوابة الحجز',
    bookingTitle: doctorName => (doctorName ? `احجز مع ${doctorName}` : 'حجز موعد'),
    bookingIntro:
      'نفس تدفق الحجز المرتبط بـ Supabase، لكن داخل تجربة طبية سينمائية موجهة.',
    selectedDoctor: 'الطبيب المختار',
    bookingPatientName: 'اسم المريض',
    bookingPhone: 'رقم الهاتف',
    bookingAppointmentDate: 'تاريخ ووقت الموعد',
    bookingPlaceholderName: 'اكتب الاسم الكامل للمريض',
    bookingPlaceholderPhone: 'اكتب رقم التواصل',
    bookingPlaceholderDate: 'اختر التاريخ والوقت',
    bookingDateHint: 'اختر الوقت الذي يجب أن يتم فيه الموعد.',
    confirmBooking: 'تأكيد الحجز',
    finalizingBooking: 'جارٍ إنهاء الحجز',
    readyStatus: 'جاهز لحجز جديد',
    successTitle: 'تم تأكيد الموعد',
    errorTitle: 'يحتاج الإرسال إلى مراجعة',
    successMessage: 'تم حفظ الحجز بنجاح في سجل المواعيد.',
    bookingToastTitle: 'تم تأكيد الحجز',
    bookingToastBody: 'تم حفظ الموعد وتجهيز الإحالة إلى واتساب.',
    whatsappCta: 'تحدث مع العيادة على واتساب',
    whatsappMissing: 'رقم واتساب الطبيب غير موجود في قاعدة البيانات.',
    whatsappQueued: 'تم تجهيز إشعار واتساب للطبيب.',
    whatsappFallback: 'واجهة WhatsApp API غير مهيأة. استخدم رابط المحادثة بدلاً من ذلك.',
    dashboardLogin: 'محاكاة دخول الطبيب',
    dashboardAuthTitle: 'دخول آمن للطبيب',
    dashboardAuthIntro: 'استخدم رابطاً سحرياً أو رمز OTP لتأكيد الجلسة قبل تحميل الطابور.',
    dashboardEmail: 'البريد الإلكتروني',
    dashboardEmailPlaceholder: 'doctor@hihyacare.com',
    sendMagicLink: 'إرسال الرابط السحري',
    dashboardOtpSent: 'تفقد بريدك للحصول على رابط الدخول أو رمز OTP.',
    dashboardOtpError: 'تعذر إرسال رمز OTP الآن.',
    dashboardSessionActive: 'جلسة Supabase نشطة',
    dashboardCodeGateTitle: 'رمز الطبيب',
    dashboardCodeGateIntro: 'أدخل الرمز الخاص لربط الجلسة بطبيب واحد.',
    clinicMapLink: 'رابط موقع العيادة',
    dashboardTitle: doctorName => (doctorName ? `لوحة ${doctorName}` : 'لوحة الطبيب'),
    dashboardIntro:
      'عرض خاص للطبيب فقط، يعرض المواعيد المرتبطة بنفس doctor_id الموجود في الرابط.',
    appointmentsTitle: 'المواعيد',
    appointmentsSubtitle: 'مفلترة حسب doctor_id',
    appointmentsOverview: 'ملخص المواعيد',
    analyticsTitle: 'التحليلات',
    analyticsIntro: 'يتم تتبعها من سجل المواعيد الفعلي وتحديثها بعد كل حجز.',
    exportReport: 'تصدير CSV',
    monthlyReport: 'الأداء الشهري',
    currentMonth: 'الشهر الحالي',
    todayPatients: 'مرضى اليوم',
    monthPatients: 'هذا الشهر',
    revenueEstimate: 'تقدير الإيراد',
    statusBreakdown: 'توزيع الحالات',
    peakDay: 'اليوم الأعلى',
    monthlyTrends: 'الاتجاه الشهري',
    liveQueue: 'الصف الحي',
    totalWaiting: 'إجمالي المنتظرين',
    doctorId: 'معرّف الطبيب',
    state: 'الحالة',
    cinematic: 'سينمائي',
    waiting: 'منتظر',
    noAppointments: 'لا توجد مواعيد لهذا الطبيب حتى الآن.',
    dashboardIdentity: 'هوية اللوحة',
    whatsappLabel: 'واتساب',
    returnHome: 'العودة للرئيسية',
    doctorNotFound: 'الطبيب غير موجود',
    doctorNotFoundDescription: 'الملف المطلوب غير متاح.',
    loadingDoctorData: 'جارٍ تحميل بيانات الطبيب...',
    loadingAppointmentsData: 'جارٍ تحميل المواعيد...',
    supplyNotice: 'يتم عرض ملف الطبيب من الذاكرة المؤقتة حتى تصبح Supabase متاحة.',
    appointmentsFallbackNotice: 'جدول المواعيد غير جاهز بالكامل. يتم عرض بيانات تجريبية.',
    loadingProfileFromDb: 'جارٍ جلب الملف من Supabase.',
    doctorUnknown: 'أخصائي غير معروف',
    doctorFallbackBio: 'ملف أخصائي سينمائي متاح في صفحة التفاصيل.',
    doctorWhatsAppReady: 'جاهز لواتساب',
    doctorNoPhone: 'لا يوجد رقم هاتف',
    doctorViewProfile: 'عرض الملف',
    doctorCardTitle: 'الطبيب',
    profileSignal: 'إشارة الملف',
    dashboardAppointments: 'المواعيد',
    dashboardTotalWaiting: 'إجمالي المنتظرين',
    dashboardDoctorId: 'معرّف الطبيب',
    dashboardState: 'الحالة',
    dashboardWaiting: 'منتظر',
    privateDoctorCode: 'رمز الطبيب الخاص',
    enterDashboardCode: 'أدخل الرمز لفتح لوحة الطبيب.',
    dashboardCodePlaceholder: 'أدخل رمز الطبيب الخاص',
    unlockDashboard: 'فتح اللوحة',
    invalidDashboardCode: 'الرمز لا يطابق أي طبيب.',
    dashboardUnlocked: 'تم فتح اللوحة',
    appointmentStatus: 'الحالة',
    pendingStatus: 'قيد الانتظار',
    inClinicStatus: 'داخل العيادة',
    completedStatus: 'مكتمل',
    toggleStatus: 'تبديل الحالة',
    statusUpdated: 'تم تحديث الحالة',
    dashboardCodeHelper: 'كل رمز يرتبط بطبيب واحد ولوحة مواعيد خاصة به.',
    reviewPortal: 'بوابة التقييم',
    reviewTitle: 'شارك تقييم زيارتك',
    reviewSubtitle: 'رأيك يساعد Hihya Care على تحسين التجربة الطبية.',
    reviewRatingLabel: 'تقييمك',
    reviewCommentLabel: 'تجربتك',
    reviewCommentPlaceholder: 'اكتب ما الذي أعجبك في الزيارة.',
    reviewSubmit: 'إرسال التقييم',
    reviewSubmitting: 'جارٍ الإرسال',
    reviewThankYouTitle: 'شكراً لك',
    reviewThankYouBody: 'تم إرسال ملاحظاتك لفريق الرعاية.',
    reviewRatingRequired: 'يرجى اختيار عدد النجوم قبل الإرسال.',
    reviewLockedTitle: 'التقييم غير متاح',
    reviewLockedBody: 'يتاح التقييم بعد تحويل الموعد إلى مكتمل.',
    reviewLockedCaption: 'حالة الموعد',
    reviewAuthRequired: 'يرجى تسجيل الدخول لإرسال التقييم.',
    reviewSavedLocal: 'Supabase غير متاح. تم حفظ التقييم محلياً.',
    reviewFallbackNotice: 'جدول التقييمات غير متاح. يتم عرض البيانات المحلية.',
    reviewAnalyticsTitle: 'تحليلات التقييم',
    reviewAverageLabel: 'متوسط التقييم',
    reviewTotalLabel: 'إجمالي التقييمات',
    reviewDistributionLabel: 'توزيع التقييمات',
    reviewRecentLabel: 'أحدث التقييمات',
    reviewEmpty: 'لا توجد تقييمات بعد.',
    reviewPatientFallback: 'مريض',
    reviewCommentFallback: 'لا توجد ملاحظة مكتوبة.',
    reviewOpen: 'فتح التقييم',
    reviewUnavailable: 'التقييم بعد اكتمال الموعد',
    reviewPatientFeedback: 'ملاحظات المرضى',
    reviewProfileLabel: 'تقييم المرضى',
    reviewLoading: 'جارٍ تحميل التقييمات...',
    reviewNotFound: 'لم يتم العثور على رابط التقييم.',
    reviewNotReady: 'التقييم غير متاح بعد.',
    reviewAppointmentLabel: 'الموعد',
    reviewDoctorLabel: 'الطبيب',
    availabilityKicker: 'حجز سريع',
    availabilityTitle: 'المواعيد المتاحة',
    availabilitySubtitle: 'اختر الوقت المناسب قبل الوصول.',
    availabilitySelectDoctor: 'اختر الطبيب',
    availabilityToday: 'اليوم',
    availabilityTomorrow: 'غدا',
    availabilityDayAfter: 'بعد غد',
    availabilityFrom: 'من',
    availabilityTo: 'حتى',
    availabilityBook: 'احجز',
    availabilityNote: 'الحجز مسبقا والدخول بأسبقية الحضور.',
    availabilityRatingLabel: 'التقييم العام',
    availabilityRatingCount: count => `${count} تقييم`,
    availabilityRatingEmpty: 'جديد',
    availabilityPriceLabel: 'الكشف',
    availabilityPaymentLabel: 'الدفع',
    availabilityPaymentValue: 'أونلاين / كاش',
    availabilityWaitLabel: 'مدة الانتظار',
    availabilityWaitValue: minutes => `${minutes} دقيقة`,
    availabilityLocationLabel: 'الموقع',
    availabilityAvailabilityLabel: 'الحالة',
    availabilityAvailabilityValue: 'متاح اليوم',
    availabilityTagOne: 'شرح مفصل',
    availabilityTagTwo: 'مستمع جيد',
    availabilityTagThree: 'حجز سريع',
    availabilityBookNow: 'احجز الآن',
    availabilityViewProfile: 'عرض الملف',
    availabilityLoading: 'جارٍ تحميل الطبيب',
  },
}

const fallbackDoctors = [
  {
    id: 'dr-mohamed-alafandi',
    name: 'د. محمد حسن الأفندي',
    name_en: 'Dr. Mohamed Hassan El Afandy',
    name_ar: 'د. محمد حسن الأفندي',
    specialty: 'مسالك بولية وحصوات وجراحة مناظير',
    specialty_en: 'Urology, Stones & Endoscopic Surgery',
    specialty_ar: 'مسالك بولية وحصوات وجراحة مناظير',
    specialties: ['مسالك بولية', 'حصوات', 'جراحة مناظير', 'ذكورة', 'عقم الرجال'],
    gender: 'male',
    availability: ['today', 'tomorrow'],
    image_url: '/doctors/mohamed-afandy.png',
    bio: 'استشاري جراحة ومناظير المسالك البولية والكلى وأمراض الذكورة والبروستاتا وعقم الرجال.',
    bio_en: 'Consultant in endoscopic urology, kidney stones, andrology, prostate and infertility.',
    bio_ar: 'استشاري جراحة ومناظير المسالك البولية والكلى وأمراض الذكورة والبروستاتا وعقم الرجال.',
    price: 'استشارة حسب الكشف',
    price_value: 120,
    base_price: 120,
    clinicLocation: 'عند البنك الأهلي القديم، بجوار صيدلية د. جمعة',
    clinicLocation_en: 'Near the old National Bank, next to Dr. Gomaa Pharmacy',
    clinicLocation_ar: 'عند البنك الأهلي القديم، بجوار صيدلية د. جمعة',
    clinic_link: 'https://maps.app.goo.gl/hCyijNgYe1inGouk9',
    phone_number: '+201000000001',
    secret_code: 'HC-2026',
  },
  {
    id: 'dr-elya-nassar',
    name: 'د. إليا نصار',
    specialty: 'طبيب قلب',
    specialties: ['قلب واوعية دموية'],
    gender: 'male',
    availability: ['today'],
    image_url: null,
    bio: '14 سنة في رعاية القلب المتقدمة.',
    price: '90 دولار استشارة',
    price_value: 90,
    base_price: 90,
    phone_number: '+201001112233',
    secret_code: 'HC-9017',
  },
  {
    id: 'dr-adam-fahmy',
    name: 'د. آدم فهمي',
    specialty: 'طبيب أعصاب',
    specialties: ['مخ واعصاب'],
    gender: 'male',
    availability: ['tomorrow'],
    image_url: null,
    bio: '11 سنة في تشخيص أمراض الأعصاب.',
    price: '110 دولار استشارة',
    price_value: 110,
    base_price: 110,
    phone_number: '+201002223344',
    secret_code: 'HC-1142',
  },
  {
    id: 'dr-sara-adel',
    name: 'د. سارة عادل',
    specialty: 'طبيب أطفال',
    specialties: ['اطفال وحديثي الولادة'],
    gender: 'female',
    availability: ['today', 'tomorrow'],
    image_url: null,
    bio: '9 سنوات في رعاية الأطفال.',
    price: '75 دولار استشارة',
    price_value: 75,
    base_price: 75,
    phone_number: '+201003334455',
    tele_consultation: true,
    secret_code: 'HC-2608',
  },
  {
    id: 'dr-omar-ibrahim',
    name: 'د. عمر إبراهيم',
    specialty: 'جراح عظام',
    specialties: ['عظام'],
    gender: 'male',
    availability: ['this-week'],
    image_url: null,
    bio: '16 سنة في استعادة الحركة والعظام.',
    price: '120 دولار استشارة',
    price_value: 120,
    base_price: 120,
    phone_number: '+201004445566',
    secret_code: 'HC-7784',
  },
  {
    id: 'dr-asmaa-desouky',
    name: 'د. أسماء دسوقي',
    name_en: 'Dr. Asmaa Desouky',
    name_ar: 'د. أسماء دسوقي',
    specialty: 'جلدية وتجميل وليزر',
    specialty_en: 'Dermatology, Cosmetic & Laser',
    specialty_ar: 'جلدية وتجميل وليزر',
    specialties: ['جلدية', 'تجميل', 'ليزر'],
    gender: 'female',
    availability: ['today', 'tomorrow'],
    image_url: null,
    bio: 'عيادة مرواد للجلدية والتجميل والليزر في ههيا.',
    bio_en: 'Marwad Dermatology, Cosmetic & Laser Clinic in Hehya.',
    bio_ar: 'عيادة مرواد للجلدية والتجميل والليزر في ههيا.',
    price: 'استشارة حسب الكشف',
    price_value: 80,
    base_price: 80,
    clinicLocation: 'ههيا، شارع الجمهورية، أعلى صيدلية الضريبي',
    clinicLocation_en: 'El-Gomhoreya St, above El-Dariby Pharmacy, Hehya',
    clinicLocation_ar: 'ههيا، شارع الجمهورية، أعلى صيدلية الضريبي',
    clinic_link: 'https://maps.app.goo.gl/Sz17GxRQXXSpVZpH9',
    phone_number: '01154041649',
    secret_code: 'HC-3321',
  },
  {
    id: 'dr-nagy-derma',
    name: 'د. ناجي',
    name_en: 'Dr. Nagy',
    name_ar: 'د. ناجي',
    specialty: 'جلدية',
    specialty_en: 'Dermatology',
    specialty_ar: 'جلدية',
    specialties: ['جلدية'],
    gender: 'male',
    availability: ['today'],
    image_url: null,
    bio: 'متخصص في الجلدية والعناية بالبشرة.',
    bio_en: 'Specialist in dermatology and skin care.',
    bio_ar: 'متخصص في الجلدية والعناية بالبشرة.',
    price: 'استشارة حسب الكشف',
    price_value: 60,
    base_price: 60,
    clinicLocation: 'El-Gomhoreya St, Hehya (MHFQ+C7M)',
    clinicLocation_en: 'El-Gomhoreya St, Hehya (MHFQ+C7M)',
    clinicLocation_ar: 'شارع الجمهورية، ههيا (MHFQ+C7M)',
    clinic_link: 'https://maps.google.com/?q=MHFQ%2BC7M%2C%20El-Gomhoreya%20St%2C%20Hehya',
    phone_number: '+201000000002',
    secret_code: 'HC-5638',
  },
  {
    id: 'dr-mohamed-shabrawy',
    name: 'د. محمد الشبراوي',
    name_en: 'Dr. Mohamed El Shabrawy',
    name_ar: 'د. محمد الشبراوي',
    specialty: 'أمراض صدرية',
    specialty_en: 'Chest Diseases',
    specialty_ar: 'أمراض صدرية',
    specialties: ['باطنة', 'أمراض صدرية'],
    gender: 'male',
    availability: ['tomorrow'],
    image_url: null,
    bio: 'خبرة في أمراض الصدر والجهاز التنفسي.',
    bio_en: 'Experience in chest and respiratory diseases.',
    bio_ar: 'خبرة في أمراض الصدر والجهاز التنفسي.',
    price: 'استشارة حسب الكشف',
    price_value: 70,
    base_price: 70,
    clinicLocation: 'عيادة أمراض صدرية - ههيا',
    clinicLocation_en: 'Chest Diseases Clinic - Hehya',
    clinicLocation_ar: 'عيادة أمراض صدرية - ههيا',
    clinic_link: 'https://maps.app.goo.gl/u5AGRUgwBN8dfWoZ8',
    phone_number: '+201000000003',
    tele_consultation: true,
    secret_code: 'HC-4407',
  },
  {
    id: 'dr-mohamed-abdelbaset',
    name: 'د. محمد عبدالباسط',
    name_en: 'Dr. Mohamed Abdelbaset',
    name_ar: 'د. محمد عبدالباسط',
    specialty: 'قلب وقسطرة',
    specialty_en: 'Cardiology & Catheterization',
    specialty_ar: 'قلب وقسطرة',
    specialties: ['قلب واوعية دموية'],
    gender: 'male',
    availability: ['today'],
    image_url: null,
    bio: 'استشاري أول القلب والقسطرة - جامعة الزقازيق.',
    bio_en: 'Senior cardiology & catheterization consultant - Zagazig University.',
    bio_ar: 'استشاري أول القلب والقسطرة - جامعة الزقازيق.',
    price: 'استشارة حسب الكشف',
    price_value: 150,
    base_price: 150,
    clinicLocation: 'عيادة القلب والقسطرة - ههيا',
    clinicLocation_en: 'Cardiology & Cath Clinic - Hehya',
    clinicLocation_ar: 'عيادة القلب والقسطرة - ههيا',
    clinic_link: 'https://maps.app.goo.gl/YGaht1rGot6deUxT9',
    phone_number: '+201000000004',
    secret_code: 'HC-7814',
  },
  {
    id: 'dr-ahmed-ghazy',
    name: 'د. أحمد غازي',
    name_en: 'Dr. Ahmed Ghazy',
    name_ar: 'د. أحمد غازي',
    specialty: 'جلدية وتناسلية وتجميل',
    specialty_en: 'Dermatology, Andrology & Cosmetic',
    specialty_ar: 'جلدية وتناسلية وتجميل',
    specialties: ['جلدية', 'تجميل'],
    gender: 'male',
    availability: ['tomorrow'],
    image_url: null,
    bio: 'عيادة للجلدية والتناسلية والتجميل.',
    bio_en: 'Dermatology, andrology and cosmetic clinic.',
    bio_ar: 'عيادة للجلدية والتناسلية والتجميل.',
    price: 'استشارة حسب الكشف',
    price_value: 90,
    base_price: 90,
    clinicLocation: 'عيادة الجلدية والتجميل - ههيا',
    clinicLocation_en: 'Dermatology & Cosmetic Clinic - Hehya',
    clinicLocation_ar: 'عيادة الجلدية والتجميل - ههيا',
    clinic_link: 'https://maps.app.goo.gl/pUS1XXoEm4QsKpnTA',
    phone_number: '+201000000005',
    tele_consultation: true,
    secret_code: 'HC-6024',
  },
  {
    id: 'dr-hassan-nafea',
    name: 'د. حسن نافع',
    name_en: 'Dr. Hassan Nafea',
    name_ar: 'د. حسن نافع',
    specialty: 'عظام',
    specialty_en: 'Orthopedics',
    specialty_ar: 'عظام',
    specialties: ['عظام'],
    gender: 'male',
    availability: ['today', 'this-week'],
    image_url: null,
    bio: 'عيادة عظام بجوار صيدلية السلام وحلويات شروق.',
    bio_en: 'Orthopedic clinic near El Salam Pharmacy and Shorouq Sweets.',
    bio_ar: 'عيادة عظام بجوار صيدلية السلام وحلويات شروق.',
    price: 'استشارة حسب الكشف',
    price_value: 85,
    base_price: 85,
    clinicLocation: 'Ahmed Oraby St, Hehya - بجوار صيدلية السلام',
    clinicLocation_en: 'Ahmed Oraby St, near El Salam Pharmacy',
    clinicLocation_ar: 'شارع أحمد عرابي، بجوار صيدلية السلام',
    clinic_link: 'https://maps.app.goo.gl/iU3GrsV32xBkPuVG8',
    phone_number: '+201000000006',
    secret_code: 'HC-9142',
  },
  {
    id: 'dr-ayman-makawi',
    name: 'د. أيمن عبداللطيف مكاوي',
    name_en: 'Dr. Ayman Abdelatif Makawi',
    name_ar: 'د. أيمن عبداللطيف مكاوي',
    specialty: 'باطنة',
    specialty_en: 'Internal Medicine',
    specialty_ar: 'باطنة',
    specialties: ['باطنة'],
    gender: 'male',
    availability: ['tomorrow'],
    image_url: null,
    bio: 'عيادة بجوار البوسطة القديمة أمام محطة القطار.',
    bio_en: 'Clinic near the old post office, opposite the train station.',
    bio_ar: 'عيادة بجوار البوسطة القديمة أمام محطة القطار.',
    price: 'استشارة حسب الكشف',
    price_value: 70,
    base_price: 70,
    clinicLocation: 'شارع عمر بن الخطاب، بجوار البوسطة القديمة',
    clinicLocation_en: 'Omar Ibn El-Khattab St, near the old post office',
    clinicLocation_ar: 'شارع عمر بن الخطاب، بجوار البوسطة القديمة',
    clinic_link: 'https://maps.app.goo.gl/93n78fzvK2kn9RJf7',
    phone_number: '+201000000007',
    tele_consultation: true,
    home_visit: true,
    secret_code: 'HC-4059',
  },
  {
    id: 'dr-mostafa-elshamy',
    name: 'أ.د. مصطفى الشامي',
    name_en: 'Prof. Dr. Mostafa El Shamy',
    name_ar: 'أ.د. مصطفى الشامي',
    specialty: 'باطنة',
    specialty_en: 'Internal Medicine',
    specialty_ar: 'باطنة',
    specialties: ['باطنة'],
    gender: 'male',
    availability: ['today'],
    image_url: null,
    bio: 'فرع ههيا - استشاري باطنة.',
    bio_en: 'Hehya branch - Internal medicine consultant.',
    bio_ar: 'فرع ههيا - استشاري باطنة.',
    price: 'استشارة حسب الكشف',
    price_value: 130,
    base_price: 130,
    clinicLocation: 'عيادة باطنة - ههيا',
    clinicLocation_en: 'Internal Medicine Clinic - Hehya',
    clinicLocation_ar: 'عيادة باطنة - ههيا',
    clinic_link: 'https://maps.app.goo.gl/9wgUonjix6pBc7PR9',
    phone_number: '+201000000008',
    home_visit: true,
    secret_code: 'HC-5526',
  },
  {
    id: 'dr-ibrahim-lebda',
    name: 'د. إبراهيم لبدة',
    name_en: 'Dr. Ibrahim Lebda',
    name_ar: 'د. إبراهيم لبدة',
    specialty: 'مركز أشعة',
    specialty_en: 'Radiology Center',
    specialty_ar: 'مركز أشعة',
    specialties: ['الآشعة التداخلية'],
    gender: 'male',
    availability: ['this-week'],
    image_url: null,
    bio: 'مركز أشعة تشخيصية وخدمات تصوير طبي.',
    bio_en: 'Radiology center with diagnostic imaging services.',
    bio_ar: 'مركز أشعة تشخيصية وخدمات تصوير طبي.',
    price: 'استشارة حسب الكشف',
    price_value: 95,
    base_price: 95,
    clinicLocation: 'مركز أشعة - ههيا',
    clinicLocation_en: 'Radiology Center - Hehya',
    clinicLocation_ar: 'مركز أشعة - ههيا',
    clinic_link: 'https://maps.app.goo.gl/ktCbMDAiQ9iDBd4Z7',
    phone_number: '+201000000009',
    secret_code: 'HC-3380',
  },
  {
    id: 'al-rahma-pet-clinic',
    name: 'Al Rahma Pet Clinic',
    name_en: 'Al Rahma Pet Clinic',
    name_ar: 'عيادة الرحمة البيطرية',
    specialty: 'Pet Medicine & Surgery (Cats & Dogs)',
    specialty_en: 'Pet Medicine & Surgery (Cats & Dogs)',
    specialty_ar: 'طب وجراحة الحيوانات الأليفة (قطط وكلاب)',
    specialties: ['بيطري', 'قطط', 'كلاب', 'جراحة', 'باطنة'],
    category: 'veterinary',
    veterinary_team: [
      { name: 'Mahmoud Rasmy', name_ar: 'محمود رسمي', specialty: 'Surgery', specialty_ar: 'جراحة' },
      { name: 'Abdulrahman El-Gammal', name_ar: 'عبدالرحمن الجمال', specialty: 'Internal Medicine', specialty_ar: 'باطنة' },
    ],
    image_url: null,
    bio: 'عيادة بيطرية متخصصة في علاج القطط والكلاب فقط. تضم فريقاً من 2 أطباء: جراحة وباطنة.',
    bio_en: 'A veterinary clinic specialized in cats & dogs only. Team of 2 doctors: surgery & internal medicine.',
    bio_ar: 'عيادة بيطرية متخصصة في علاج القطط والكلاب فقط. تضم فريقاً من 2 أطباء: جراحة وباطنة.',
    price: 'الكشف 80 ج - التطعیمات حسب النوع',
    price_value: 80,
    base_price: 80,
    clinicLocation: 'شارع مضیفة المركز، خلف السجل، داخل الشارع تاني شمال',
    clinicLocation_en: 'Madafet El-Markaz St, behind the registry, second left',
    clinicLocation_ar: 'شارع مضیفة المركز، خلف السجل، داخل الشارع تاني شمال',
    clinic_link: 'https://maps.google.com/maps?q=30.6733874%2C31.5864982&z=17&hl=en',
    phone_number: '+201028423304',
    facebook_url: 'https://www.facebook.com/share/18gX5Uh1r2/?mibextid=wwXIfr',
    working_days: 'جميع أيام الأسبوع حتی الجمعة (الجمعة غير ثابتة)',
    working_hours: 'من 2 ظهراً إلى 11 مساءً',
    payment_method: 'كاش - فودافون كاش',
    rescue_discount: 'خصم 50 ج على الكشف والعلاج لحالات الإنقاذ',
    secret_code: 'HC-VET01',
  },
]

const fallbackAppointmentsByDoctor = {
  'dr-mohamed-alafandi': [
    { patient_name: 'أية محمود', phone: '+201055501234', doctor_id: 'dr-mohamed-alafandi', status: 'Pending', appointment_date: '2026-05-03T09:00:00.000Z', time: '09:00' },
    { patient_name: 'مينا عادل', phone: '+201066602345', doctor_id: 'dr-mohamed-alafandi', status: 'In Clinic', appointment_date: '2026-05-03T09:30:00.000Z', time: '09:30' },
    { patient_name: 'سارة فؤاد', phone: '+201022203456', doctor_id: 'dr-mohamed-alafandi', status: 'Completed', appointment_date: '2026-05-03T10:15:00.000Z', time: '10:15' },
    { patient_name: 'ياسر حسن', phone: '+201033304567', doctor_id: 'dr-mohamed-alafandi', status: 'In Clinic', appointment_date: '2026-05-03T11:00:00.000Z', time: '11:00' },
    { patient_name: 'ديانا شريف', phone: '+201044405678', doctor_id: 'dr-mohamed-alafandi', status: 'Completed', appointment_date: '2026-05-03T11:45:00.000Z', time: '11:45' },
    { patient_name: 'محمد سامح', phone: '+201011106789', doctor_id: 'dr-mohamed-alafandi', status: 'Pending', appointment_date: '2026-05-03T14:00:00.000Z', time: '14:00' },
    { patient_name: 'نور خالد', phone: '+201055523456', doctor_id: 'dr-mohamed-alafandi', status: 'Completed', appointment_date: '2026-05-02T09:00:00.000Z', time: '09:00' },
    { patient_name: 'يوسف عمر', phone: '+201055534567', doctor_id: 'dr-mohamed-alafandi', status: 'Completed', appointment_date: '2026-05-02T10:00:00.000Z', time: '10:00' },
    { patient_name: 'ليلى إبراهيم', phone: '+201066645678', doctor_id: 'dr-mohamed-alafandi', status: 'Completed', appointment_date: '2026-05-02T14:00:00.000Z', time: '14:00' },
  ],
  'dr-elya-nassar': [
    { patient_name: 'Aya Mahmoud', phone: '+201055501234', doctor_id: 'dr-elya-nassar', status: 'Pending', appointment_date: '2026-05-03T09:00:00.000Z', time: '09:00' },
    { patient_name: 'Mina Adel', phone: '+201066602345', doctor_id: 'dr-elya-nassar', status: 'In Clinic', appointment_date: '2026-05-03T09:30:00.000Z', time: '09:30' },
    { patient_name: 'Sara Fouad', phone: '+201022203456', doctor_id: 'dr-elya-nassar', status: 'Completed', appointment_date: '2026-05-03T10:15:00.000Z', time: '10:15' },
    { patient_name: 'Yasser Hassan', phone: '+201033304567', doctor_id: 'dr-elya-nassar', status: 'In Clinic', appointment_date: '2026-05-03T11:00:00.000Z', time: '11:00' },
    { patient_name: 'Dina Sherif', phone: '+201044405678', doctor_id: 'dr-elya-nassar', status: 'Completed', appointment_date: '2026-05-03T11:45:00.000Z', time: '11:45' },
    { patient_name: 'Mohamed Sameh', phone: '+201011106789', doctor_id: 'dr-elya-nassar', status: 'Pending', appointment_date: '2026-05-03T14:00:00.000Z', time: '14:00' },
    { patient_name: 'Noor Khaled', phone: '+201055523456', doctor_id: 'dr-elya-nassar', status: 'Completed', appointment_date: '2026-05-02T09:00:00.000Z', time: '09:00' },
    { patient_name: 'Youssef Omar', phone: '+201055534567', doctor_id: 'dr-elya-nassar', status: 'Completed', appointment_date: '2026-05-02T10:00:00.000Z', time: '10:00' },
  ],
  'dr-adam-fahmy': [
    { patient_name: 'Tamer Hossam', phone: '+201055512345', doctor_id: 'dr-adam-fahmy', status: 'Pending', appointment_date: '2026-05-03T09:00:00.000Z', time: '09:00' },
    { patient_name: 'Ahmed Mahmoud', phone: '+201066634567', doctor_id: 'dr-adam-fahmy', status: 'In Clinic', appointment_date: '2026-05-03T10:00:00.000Z', time: '10:00' },
    { patient_name: 'Fatima Ali', phone: '+201022234567', doctor_id: 'dr-adam-fahmy', status: 'Completed', appointment_date: '2026-05-03T11:00:00.000Z', time: '11:00' },
    { patient_name: 'Khadija Hassan', phone: '+201033345678', doctor_id: 'dr-adam-fahmy', status: 'Completed', appointment_date: '2026-05-02T09:00:00.000Z', time: '09:00' },
    { patient_name: 'Salma Gamal', phone: '+201044456789', doctor_id: 'dr-adam-fahmy', status: 'Completed', appointment_date: '2026-05-01T10:00:00.000Z', time: '10:00' },
  ],
  'dr-sara-adel': [
    { patient_name: 'Noor Khaled', phone: '+201055523456', doctor_id: 'dr-sara-adel', status: 'Pending', appointment_date: '2026-05-03T09:00:00.000Z', time: '09:00' },
    { patient_name: 'Youssef Omar', phone: '+201055534567', doctor_id: 'dr-sara-adel', status: 'In Clinic', appointment_date: '2026-05-03T10:00:00.000Z', time: '10:00' },
    { patient_name: 'Layla Ibrahim', phone: '+201066645678', doctor_id: 'dr-sara-adel', status: 'Completed', appointment_date: '2026-05-03T11:00:00.000Z', time: '11:00' },
    { patient_name: 'Omar Farouk', phone: '+201011167890', doctor_id: 'dr-sara-adel', status: 'Completed', appointment_date: '2026-05-02T09:00:00.000Z', time: '09:00' },
  ],
  'dr-omar-ibrahim': [
    { patient_name: 'Youssef Omar', phone: '+201055534567', doctor_id: 'dr-omar-ibrahim', status: 'Pending', appointment_date: '2026-05-03T09:00:00.000Z', time: '09:00' },
    { patient_name: 'Nermin Saeed', phone: '+201055545678', doctor_id: 'dr-omar-ibrahim', status: 'In Clinic', appointment_date: '2026-05-03T10:00:00.000Z', time: '10:00' },
    { patient_name: 'Mohammad Alaa', phone: '+201066756789', doctor_id: 'dr-omar-ibrahim', status: 'Completed', appointment_date: '2026-05-03T11:00:00.000Z', time: '11:00' },
    { patient_name: 'Hassan Ibrahim', phone: '+201033356789', doctor_id: 'dr-omar-ibrahim', status: 'Completed', appointment_date: '2026-05-02T09:00:00.000Z', time: '09:00' },
    { patient_name: 'Zainab Karim', phone: '+201044467890', doctor_id: 'dr-omar-ibrahim', status: 'Completed', appointment_date: '2026-04-28T10:00:00.000Z', time: '10:00' },
  ],
}

const appointmentStatusOrder = ['Pending', 'In Clinic', 'Completed']

function localizeAppointmentStatus(language, status) {
  const normalizedStatus = appointmentStatusOrder.includes(status) ? status : 'Pending'
  const statusMap = {
    en: {
      Pending: 'Pending',
      'In Clinic': 'In Clinic',
      Completed: 'Completed',
    },
    ar: {
      Pending: 'قيد الانتظار',
      'In Clinic': 'داخل العيادة',
      Completed: 'مكتمل',
    },
  }

  return statusMap[language]?.[normalizedStatus] || normalizedStatus
}

const localAppointmentsStorageKey = 'hihya-care-local-appointments'

function readLocalAppointments() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(localAppointmentsStorageKey)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalAppointments(appointments) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(localAppointmentsStorageKey, JSON.stringify(appointments))
  } catch {
    return
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function filesToAttachments(files) {
  const results = []
  for (const file of files) {
    try {
      if (file.size > 3 * 1024 * 1024) {
        results.push({ name: file.name, data: null, size: file.size, tooLarge: true })
      } else {
        const data = await readFileAsBase64(file)
        results.push({ name: file.name, data, size: file.size })
      }
    } catch {
      results.push({ name: file.name, data: null, size: file.size, error: true })
    }
  }
  return results
}

function parseAppointmentAttachments(symptoms) {
  if (!symptoms || typeof symptoms !== 'string') return []
  const idx = symptoms.indexOf('__FILES__')
  if (idx === -1) return []
  return symptoms.slice(idx + 9).split('||').map(s => {
    try { return JSON.parse(decodeURIComponent(s)) } catch { return null }
  }).filter(Boolean)
}

function stripFileDataFromSymptoms(symptoms) {
  if (!symptoms || typeof symptoms !== 'string') return symptoms
  const idx = symptoms.indexOf('__FILES__')
  return idx === -1 ? symptoms : symptoms.slice(0, idx).replace(/\n$/, '')
}

function createLocalAppointment(doctorId, patientName, phone, appointmentDateIso, symptoms) {
  const iso =
    appointmentDateIso && !Number.isNaN(new Date(appointmentDateIso).getTime())
      ? appointmentDateIso
      : new Date().toISOString()

  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    patient_name: patientName,
    patient_phone: phone,
    phone,
    appointment_date: iso,
    time: iso,
    status: 'Pending',
    doctor_id: doctorId,
    source: 'local',
    symptoms: symptoms || null,
  }
}

function getLocalAppointmentsForDoctor(doctorId) {
  return readLocalAppointments().filter(appointment => String(appointment.doctor_id) === String(doctorId))
}

function saveLocalAppointment(appointment) {
  const currentAppointments = readLocalAppointments()
  const nextAppointments = [...currentAppointments.filter(item => item.id !== appointment.id), appointment]
  writeLocalAppointments(nextAppointments)
  return appointment
}

/* ── Supabase retry queue ── */
const RETRY_QUEUE_KEY = 'hihya-supabase-retry-queue'

function readRetryQueue() {
  try { return JSON.parse(localStorage.getItem(RETRY_QUEUE_KEY) || '[]') } catch { return [] }
}

function writeRetryQueue(queue) {
  try { localStorage.setItem(RETRY_QUEUE_KEY, JSON.stringify(queue)) } catch {}
}

function enqueueRetry(payload) {
  const queue = readRetryQueue()
  queue.push({ payload, createdAt: Date.now(), attempts: 0 })
  writeRetryQueue(queue)
  // Immediately attempt sync
  void processRetryQueue()
}

async function processRetryQueue() {
  const queue = readRetryQueue()
  if (!queue.length) return
  const remaining = []
  for (const item of queue) {
    // Strip columns that don't exist in Supabase
    if (item.payload) {
      delete item.payload.service_type
      delete item.payload.pet_name
      delete item.payload.pet_type
    }
    try {
      const { error } = await supabase.from('appointments').insert([item.payload])
      if (error) throw error
      // Success — don't add back to queue
    } catch {
      item.attempts++
      // Keep for up to 24h, max 50 retries
      if (item.attempts < 50 && Date.now() - item.createdAt < 86400000) {
        remaining.push(item)
      }
    }
  }
  writeRetryQueue(remaining)
}

// Periodic retry
function startRetryScheduler() {
  const id = setInterval(() => void processRetryQueue(), 30000)
  return () => clearInterval(id)
}

function updateLocalAppointmentStatus(appointmentId, status) {
  const nextAppointments = readLocalAppointments().map(appointment => (
    appointment.id === appointmentId ? { ...appointment, status } : appointment
  ))
  writeLocalAppointments(nextAppointments)
}

const localReviewsStorageKey = 'hihya-care-local-reviews'

function readLocalReviews() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(localReviewsStorageKey)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalReviews(reviews) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(localReviewsStorageKey, JSON.stringify(reviews))
  } catch {
    return
  }
}

function createLocalReview({ doctorId, appointmentId, rating, comment, patientName }) {
  return {
    id: `local-review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    doctor_id: doctorId,
    appointment_id: appointmentId,
    rating,
    comment: comment || null,
    patient_name: patientName || null,
    created_at: new Date().toISOString(),
    source: 'local',
  }
}

function saveLocalReview(review) {
  const currentReviews = readLocalReviews()
  const nextReviews = [...currentReviews.filter(item => item.id !== review.id), review]
  writeLocalReviews(nextReviews)
  return review
}

function getLocalReviewsForDoctor(doctorId) {
  return readLocalReviews().filter(review => String(review.doctor_id) === String(doctorId))
}

function getLocalAppointmentById(appointmentId) {
  return readLocalAppointments().find(appointment => String(appointment.id) === String(appointmentId))
}

const avatarGradients = [
  'from-cyan-400/30 via-sky-500/20 to-emerald-400/25',
  'from-indigo-400/30 via-cyan-500/20 to-sky-400/25',
  'from-emerald-400/30 via-cyan-400/20 to-teal-400/25',
  'from-sky-400/30 via-indigo-500/20 to-cyan-400/25',
]

const doctorCardTones = [
  {
    keys: ['جلدية', 'تجميل', 'ليزر'],
    surface: 'from-fuchsia-500/15 via-rose-500/10 to-amber-400/15',
    badge: 'border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-700 dark:text-fuchsia-100',
    glow: 'hover:shadow-[0_0_80px_rgba(236,72,153,0.25)]',
    avatar: 'from-fuchsia-500/45 via-rose-500/30 to-amber-500/35',
  },
  {
    keys: ['قلب'],
    surface: 'from-rose-500/15 via-red-500/10 to-amber-400/15',
    badge: 'border-rose-300/30 bg-rose-400/10 text-rose-700 dark:text-rose-100',
    glow: 'hover:shadow-[0_0_80px_rgba(244,63,94,0.25)]',
    avatar: 'from-rose-500/45 via-red-500/30 to-amber-500/35',
  },
  {
    keys: ['عظام'],
    surface: 'from-emerald-500/15 via-teal-500/10 to-cyan-400/15',
    badge: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-100',
    glow: 'hover:shadow-[0_0_80px_rgba(16,185,129,0.25)]',
    avatar: 'from-emerald-500/45 via-teal-500/30 to-cyan-500/35',
  },
  {
    keys: ['مخ', 'اعصاب', 'أعصاب'],
    surface: 'from-indigo-500/15 via-sky-500/10 to-cyan-400/15',
    badge: 'border-indigo-300/30 bg-indigo-400/10 text-indigo-700 dark:text-indigo-100',
    glow: 'hover:shadow-[0_0_80px_rgba(99,102,241,0.25)]',
    avatar: 'from-indigo-500/45 via-sky-500/30 to-cyan-500/35',
  },
  {
    keys: ['باطنة', 'صدرية'],
    surface: 'from-amber-500/15 via-yellow-500/10 to-orange-400/15',
    badge: 'border-amber-300/30 bg-amber-400/10 text-amber-700 dark:text-amber-100',
    glow: 'hover:shadow-[0_0_80px_rgba(245,158,11,0.25)]',
    avatar: 'from-amber-500/45 via-yellow-500/30 to-orange-500/35',
  },
  {
    keys: ['مسالك', 'ذكورة'],
    surface: 'from-cyan-500/15 via-sky-500/10 to-emerald-400/15',
    badge: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-700 dark:text-cyan-100',
    glow: 'hover:shadow-[0_0_80px_rgba(34,211,238,0.25)]',
    avatar: 'from-cyan-500/45 via-sky-500/30 to-emerald-500/35',
  },
  {
    keys: ['أشعة', 'الآشعة'],
    surface: 'from-slate-500/15 via-zinc-500/10 to-sky-400/15',
    badge: 'border-slate-300/30 bg-slate-400/10 text-slate-700 dark:text-slate-100',
    glow: 'hover:shadow-[0_0_80px_rgba(148,163,184,0.25)]',
    avatar: 'from-slate-500/45 via-zinc-500/30 to-sky-500/35',
  },
]

function getDoctorTone(specialty) {
  const normalized = String(specialty || '')
  const match = doctorCardTones.find(tone => tone.keys.some(key => normalized.includes(key)))
  return match || {
    surface: 'from-cyan-400/12 via-slate-900/10 to-emerald-400/12',
    badge: 'border-cyan-300/20 bg-cyan-400/10 text-cyan-700 dark:text-cyan-100',
    glow: 'hover:shadow-[0_0_70px_rgba(34,211,238,0.2)]',
    avatar: avatarGradients[0],
  }
}

function getSpecialtyVisual(specialty) {
  const normalized = String(specialty || '').toLowerCase()
  const variants = [
    {
      keys: ['قلب', 'cardio', 'heart', 'وعية', 'vascular'],
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1200&q=80',
    },
    {
      keys: ['عظام', 'ortho', 'bone', 'joint', 'مفاصل'],
      image: 'https://images.unsplash.com/photo-1580281657527-47d35d4f00ca?auto=format&fit=crop&w=1200&q=80',
    },
    {
      keys: ['جلدية', 'derma', 'skin', 'تجميل', 'cosmetic'],
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    },
    {
      keys: ['اطفال', 'pediatric', 'طفل', 'حديثي الولادة', 'neonatal'],
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    },
    {
      keys: ['نساء', 'توليد', 'gyn', 'obstetric', 'pregnancy'],
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    },
    {
      keys: ['مخ', 'اعصاب', 'أعصاب', 'neurolog', 'brain'],
      image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80',
    },
    {
      keys: ['اسنان', 'أسنان', 'dent', 'tooth'],
      image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
    },
    {
      keys: ['انف', 'اذن', 'أذن', 'حنجرة', 'ent'],
      image: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=1200&q=80',
    },
    {
      keys: ['صدر', 'respiratory', 'pulmon'],
      image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=1200&q=80',
    },
    {
      keys: ['باطنة', 'internal medicine', 'gastro', 'هضم'],
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    },
    {
      keys: ['نفسي', 'psy', 'mental'],
      image: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?auto=format&fit=crop&w=1200&q=80',
    },
    {
      keys: ['مسالك', 'urology', 'ذكورة'],
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    },
    {
      keys: ['اشعة', 'أشعة', 'الآشعة', 'radiology', 'scan'],
      image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1200&q=80',
    },
    {
      keys: ['دم', 'hematology'],
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80',
    },
    {
      keys: ['اورام', 'أورام', 'oncology', 'cancer'],
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    },
  ]

  const match = variants.find(item => item.keys.some(key => normalized.includes(key)))
  const fallback = 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80'
  return {
    image: match?.image || fallback,
  }
}

const specialtyMap = {
  en: {
    Cardiologist: 'Cardiologist',
    Neurologist: 'Neurologist',
    Pediatrician: 'Pediatrician',
    'Orthopedic Surgeon': 'Orthopedic Surgeon',
    Specialist: 'Specialist',
  },
  ar: {
    Cardiologist: 'طبيب قلب',
    Neurologist: 'طبيب أعصاب',
    Pediatrician: 'طبيب أطفال',
    'Orthopedic Surgeon': 'جراح عظام',
    Specialist: 'أخصائي',
  },
}

const bioMap = {
  en: {
    Cardiologist: '14 years in advanced cardiac care.',
    Neurologist: '11 years in neuro diagnostics.',
    Pediatrician: '9 years in child wellness.',
    'Orthopedic Surgeon': '16 years in mobility restoration.',
    Specialist: 'Cinematic specialist profile available on the details page.',
  },
  ar: {
    Cardiologist: '14 سنة في رعاية القلب المتقدمة.',
    Neurologist: '11 سنة في تشخيص أمراض الأعصاب.',
    Pediatrician: '9 سنوات في رعاية الأطفال.',
    'Orthopedic Surgeon': '16 سنة في استعادة الحركة والعظام.',
    Specialist: 'ملف اختصاصي سينمائي متاح في صفحة التفاصيل.',
  },
}

const locationMap = {
  en: {
    Cardiologist: 'Hihya Care Cardiology Wing',
    Neurologist: 'Hihya Care Neurology Wing',
    Pediatrician: 'Hihya Care Pediatrics Wing',
    'Orthopedic Surgeon': 'Hihya Care Orthopedic Block',
    Specialist: 'Hihya Care main wing',
  },
  ar: {
    Cardiologist: 'جناح أمراض القلب - هيهيا كير',
    Neurologist: 'جناح الأعصاب - هيهيا كير',
    Pediatrician: 'جناح الأطفال - هيهيا كير',
    'Orthopedic Surgeon': 'وحدة العظام - هيهيا كير',
    Specialist: 'الجناح الرئيسي - هيهيا كير',
  },
}

function getText(language, key, ...args) {
  const dictionary = translations[language] || translations.en
  const value = dictionary[key]
  return typeof value === 'function' ? value(...args) : value
}

function normalizePhoneForWa(phoneNumber) {
  const digits = String(phoneNumber || '').replace(/[^\d]/g, '')
  if (!digits) return ''
  // Egyptian numbers: 01xxxxxxxxx → 201xxxxxxxxx
  if (digits.startsWith('01') && digits.length === 11) return '2' + digits.slice(1)
  // Already has country code (e.g. 201xxxxxxxxx)
  if (digits.startsWith('2') && digits.length === 12) return digits
  // Generic: just return digits
  return digits
}

function parseClinicImages(value) {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []
    } catch {
      return [value]
    }
  }
  return []
}

function makeDoctorFromRow(row) {
  return {
    id: String(row.id),
    user_id: row.user_id ?? null,
    name: row.name,
    name_en: row.name_en ?? null,
    name_ar: row.name_ar ?? null,
    specialty: row.specialty || 'Specialist',
    specialty_en: row.specialty_en ?? null,
    specialty_ar: row.specialty_ar ?? null,
    specialties: Array.isArray(row.specialties) ? row.specialties : row.specialties ? [row.specialties] : null,
    gender: row.gender ?? null,
    availability: Array.isArray(row.availability) ? row.availability : row.availability ? [row.availability] : null,
    price_value: row.price_value ?? null,
    base_price: row.base_price != null ? Number(row.base_price) : (row.price_value != null ? Number(row.price_value) : 100),
    image_url: row.image_url ?? null,
    bio: row.bio ?? null,
    bio_en: row.bio_en ?? null,
    bio_ar: row.bio_ar ?? null,
    price: row.price ? String(row.price) : 'Consultation on request',
    clinicLocation: row.clinicLocation ?? row.location ?? null,
    clinicLocation_en: row.clinicLocation_en ?? null,
    clinicLocation_ar: row.clinicLocation_ar ?? null,
    clinic_link: row.clinic_link ?? null,
    phone_number: row.phone_number ?? null,
    secret_code: row.secret_code ?? null,
    clinic_images: parseClinicImages(row.clinic_images),
    wait_minutes: row.wait_minutes != null ? Number(row.wait_minutes) : null,
    payment_method: row.payment_method ?? null,
    payment_method_en: row.payment_method_en ?? null,
    tele_consultation: Boolean(row.tele_consultation),
    home_visit: Boolean(row.home_visit),
    next_available_slot: row.next_available_slot ?? null,
    rating: row.rating != null ? Number(row.rating) : null,
    reviews_count: row.reviews_count != null ? Number(row.reviews_count) : null,
    category: row.category || 'human',
    veterinary_team: Array.isArray(row.veterinary_team) ? row.veterinary_team : [],
    veterinaryTeam: Array.isArray(row.veterinary_team) ? row.veterinary_team : [],
    facebook_url: row.facebook_url || null,
    working_days: row.working_days || null,
    working_hours: row.working_hours || null,
    payment_method: row.payment_method || null,
    rescue_discount: row.rescue_discount || null,
  }
}

function getServicePrices(basePrice) {
  const bp = Number(basePrice) || 100
  return [
    {
      id: 'clinic-visit',
      price: bp,
      originalPrice: bp,
      labelAr: 'كشف عيادة',
      labelEn: 'Clinic Visit',
      icon: '🩺',
      multiplier: 1,
      color: 'text-cyan-600 dark:text-cyan-300',
      bgColor: 'bg-cyan-500/10 border-cyan-400/30',
    },
    {
      id: 'tele-consultation',
      price: Math.round(bp * 0.7),
      originalPrice: bp,
      labelAr: 'استشارة هاتفية',
      labelEn: 'Phone Consultation',
      icon: '📞',
      multiplier: 0.7,
      discount: '30%',
      color: 'text-emerald-600 dark:text-emerald-300',
      bgColor: 'bg-emerald-500/10 border-emerald-400/30',
    },
    {
      id: 'urgent-care',
      price: Math.round(bp * 1.5),
      originalPrice: bp,
      labelAr: 'كشف عاجل',
      labelEn: 'Urgent Care',
      icon: '⚡',
      multiplier: 1.5,
      badge: 'رسوم أولوية',
      color: 'text-amber-600 dark:text-amber-200',
      bgColor: 'bg-amber-500/10 border-amber-400/30',
    },
    {
      id: 'home-visit',
      price: Math.round(bp * 2.5),
      originalPrice: bp,
      labelAr: 'زيارة منزلية',
      labelEn: 'Home Visit',
      icon: '🏠',
      multiplier: 2.5,
      badge: 'زيارة منزلية',
      color: 'text-rose-600 dark:text-rose-200',
      bgColor: 'bg-rose-500/10 border-rose-400/30',
    },
  ]
}

function localizeDoctor(language, doctor) {
  if (!doctor) {
    return doctor
  }

  const specialty = doctor.specialty || 'Specialist'
  const translatedSpecialty = (language === 'ar' ? doctor.specialty_ar : doctor.specialty_en) || specialtyMap[language]?.[specialty] || specialty
  const fallbackBio = (language === 'ar' ? doctor.bio_ar : doctor.bio_en) || bioMap[language]?.[specialty] || bioMap[language]?.Specialist
  const translatedLocation =
    (language === 'ar' ? doctor.clinicLocation_ar : doctor.clinicLocation_en) ||
    doctor.clinicLocation ||
    locationMap[language]?.[specialty] ||
    locationMap[language]?.Specialist

  return {
    ...doctor,
    name: (language === 'ar' ? doctor.name_ar : doctor.name_en) || doctor.name,
    specialty: translatedSpecialty,
    bio: fallbackBio,
    clinicLocation: translatedLocation,
    experience: doctor.experience || fallbackBio,
  }
}

function createFallbackDoctor(doctorId) {
  const match = fallbackDoctors.find(doctor => doctor.id === String(doctorId))
  return match ? makeDoctorFromRow(match) : null
}

function createFallbackDoctorByCode(secretCode) {
  const normalizedCode = String(secretCode || '').trim().toUpperCase()
  const match = fallbackDoctors.find(doctor => String(doctor.secret_code || '').toUpperCase() === normalizedCode)
  return match ? makeDoctorFromRow(match) : null
}

function createFallbackDoctors() {
  return fallbackDoctors.map(makeDoctorFromRow)
}

function createFallbackAppointments(doctorId, language) {
  const base = fallbackAppointmentsByDoctor[String(doctorId)] || []
  if (base.length) {
    return base.map((appointment, index) => ({
      id: `${appointment.doctor_id}-${index}`,
      status: appointment.status || 'Pending',
      appointment_date: appointment.appointment_date || appointment.time || new Date().toISOString(),
      time: appointment.time || '09:00',
      ...appointment,
    }))
  }

  // محاكاة بيانات غنية للشهر الحالي والشهر الماضي
  const mockAppointments = language === 'ar'
    ? [
        // مواعيد اليوم (مايو 3)
        { id: `${doctorId}-1`, patient_name: "أية محمود", phone: "+201055501234", doctor_id: doctorId, status: "Pending", appointment_date: "2026-05-03T09:00:00.000Z", time: "09:00", symptoms: "صداع نصفي منذ ٣ أيام مع زغللة" },
        { id: `${doctorId}-2`, patient_name: "مينا عادل", phone: "+201066602345", doctor_id: doctorId, status: "In Clinic", appointment_date: "2026-05-03T09:30:00.000Z", time: "09:30", symptoms: "ألم في البطن وإسهال" },
        { id: `${doctorId}-3`, patient_name: "سارة فؤاد", phone: "+201022203456", doctor_id: doctorId, status: "Completed", appointment_date: "2026-05-03T10:15:00.000Z", time: "10:15" },
        { id: `${doctorId}-4`, patient_name: "ياسر حسن", phone: "+201033304567", doctor_id: doctorId, status: "In Clinic", appointment_date: "2026-05-03T11:00:00.000Z", time: "11:00", symptoms: "ارتفاع ضغط مفاجئ" },
        { id: `${doctorId}-5`, patient_name: "ديانا شريف", phone: "+201044405678", doctor_id: doctorId, status: "Completed", appointment_date: "2026-05-03T11:45:00.000Z", time: "11:45" },
        { id: `${doctorId}-6`, patient_name: "محمد سامح", phone: "+201011106789", doctor_id: doctorId, status: "Pending", appointment_date: "2026-05-03T14:00:00.000Z", time: "14:00", symptoms: "حمى وكحة منذ أسبوع" },
        // مواعيد أمس (مايو 2)
        { id: `${doctorId}-7`, patient_name: "نور خالد", phone: "+201055523456", doctor_id: doctorId, status: "Completed", appointment_date: "2026-05-02T09:00:00.000Z", time: "09:00" },
        { id: `${doctorId}-8`, patient_name: "يوسف عمر", phone: "+201055534567", doctor_id: doctorId, status: "Completed", appointment_date: "2026-05-02T10:00:00.000Z", time: "10:00" },
        { id: `${doctorId}-9`, patient_name: "ليلى إبراهيم", phone: "+201066645678", doctor_id: doctorId, status: "Completed", appointment_date: "2026-05-02T14:00:00.000Z", time: "14:00" },
        // مواعيد هذا الأسبوع
        { id: `${doctorId}-10`, patient_name: "تامر حسام", phone: "+201055512345", doctor_id: doctorId, status: "Pending", appointment_date: "2026-04-29T09:00:00.000Z", time: "09:00" },
        { id: `${doctorId}-11`, patient_name: "أحمد محمود", phone: "+201066634567", doctor_id: doctorId, status: "Completed", appointment_date: "2026-04-29T11:00:00.000Z", time: "11:00" },
        { id: `${doctorId}-12`, patient_name: "فاطمة علي", phone: "+201022234567", doctor_id: doctorId, status: "Completed", appointment_date: "2026-04-30T10:00:00.000Z", time: "10:00" },
        // مواعيد من أبريل
        { id: `${doctorId}-13`, patient_name: "خديجة حسن", phone: "+201033345678", doctor_id: doctorId, status: "Completed", appointment_date: "2026-04-22T09:00:00.000Z", time: "09:00" },
        { id: `${doctorId}-14`, patient_name: "سلمى جمال", phone: "+201044456789", doctor_id: doctorId, status: "Completed", appointment_date: "2026-04-23T14:00:00.000Z", time: "14:00" },
        { id: `${doctorId}-15`, patient_name: "عمر فاروق", phone: "+201011167890", doctor_id: doctorId, status: "Completed", appointment_date: "2026-04-24T11:00:00.000Z", time: "11:00" },
        { id: `${doctorId}-16`, patient_name: "نرمين سعيد", phone: "+201055545678", doctor_id: doctorId, status: "Completed", appointment_date: "2026-04-20T10:00:00.000Z", time: "10:00" },
        { id: `${doctorId}-17`, patient_name: "محمد علاء", phone: "+201066756789", doctor_id: doctorId, status: "Completed", appointment_date: "2026-04-15T09:00:00.000Z", time: "09:00" },
      ]
    : [
        // Today's appointments (May 3)
        { id: `${doctorId}-1`, patient_name: "Aya Mahmoud", phone: "+201055501234", doctor_id: doctorId, status: "Pending", appointment_date: "2026-05-03T09:00:00.000Z", time: "09:00", symptoms: "Migraine for 3 days with blurred vision" },
        { id: `${doctorId}-2`, patient_name: "Mina Adel", phone: "+201066602345", doctor_id: doctorId, status: "In Clinic", appointment_date: "2026-05-03T09:30:00.000Z", time: "09:30", symptoms: "Abdominal pain and diarrhea" },
        { id: `${doctorId}-3`, patient_name: "Sara Fouad", phone: "+201022203456", doctor_id: doctorId, status: "Completed", appointment_date: "2026-05-03T10:15:00.000Z", time: "10:15" },
        { id: `${doctorId}-4`, patient_name: "Yasser Hassan", phone: "+201033304567", doctor_id: doctorId, status: "In Clinic", appointment_date: "2026-05-03T11:00:00.000Z", time: "11:00", symptoms: "Sudden high blood pressure" },
        { id: `${doctorId}-5`, patient_name: "Dina Sherif", phone: "+201044405678", doctor_id: doctorId, status: "Completed", appointment_date: "2026-05-03T11:45:00.000Z", time: "11:45" },
        { id: `${doctorId}-6`, patient_name: "Mohamed Sameh", phone: "+201011106789", doctor_id: doctorId, status: "Pending", appointment_date: "2026-05-03T14:00:00.000Z", time: "14:00", symptoms: "Fever and cough for a week" },
        // Yesterday's appointments (May 2)
        { id: `${doctorId}-7`, patient_name: "Noor Khaled", phone: "+201055523456", doctor_id: doctorId, status: "Completed", appointment_date: "2026-05-02T09:00:00.000Z", time: "09:00" },
        { id: `${doctorId}-8`, patient_name: "Youssef Omar", phone: "+201055534567", doctor_id: doctorId, status: "Completed", appointment_date: "2026-05-02T10:00:00.000Z", time: "10:00" },
        { id: `${doctorId}-9`, patient_name: "Layla Ibrahim", phone: "+201066645678", doctor_id: doctorId, status: "Completed", appointment_date: "2026-05-02T14:00:00.000Z", time: "14:00" },
        // This week's appointments
        { id: `${doctorId}-10`, patient_name: "Tamer Hossam", phone: "+201055512345", doctor_id: doctorId, status: "Pending", appointment_date: "2026-04-29T09:00:00.000Z", time: "09:00" },
        { id: `${doctorId}-11`, patient_name: "Ahmed Mahmoud", phone: "+201066634567", doctor_id: doctorId, status: "Completed", appointment_date: "2026-04-29T11:00:00.000Z", time: "11:00" },
        { id: `${doctorId}-12`, patient_name: "Fatima Ali", phone: "+201022234567", doctor_id: doctorId, status: "Completed", appointment_date: "2026-04-30T10:00:00.000Z", time: "10:00" },
        // April appointments
        { id: `${doctorId}-13`, patient_name: "Khadija Hassan", phone: "+201033345678", doctor_id: doctorId, status: "Completed", appointment_date: "2026-04-22T09:00:00.000Z", time: "09:00" },
        { id: `${doctorId}-14`, patient_name: "Salma Gamal", phone: "+201044456789", doctor_id: doctorId, status: "Completed", appointment_date: "2026-04-23T14:00:00.000Z", time: "14:00" },
        { id: `${doctorId}-15`, patient_name: "Omar Farouk", phone: "+201011167890", doctor_id: doctorId, status: "Completed", appointment_date: "2026-04-24T11:00:00.000Z", time: "11:00" },
        { id: `${doctorId}-16`, patient_name: "Nermin Saeed", phone: "+201055545678", doctor_id: doctorId, status: "Completed", appointment_date: "2026-04-20T10:00:00.000Z", time: "10:00" },
        { id: `${doctorId}-17`, patient_name: "Mohammad Alaa", phone: "+201066756789", doctor_id: doctorId, status: "Completed", appointment_date: "2026-04-15T09:00:00.000Z", time: "09:00" },
      ]

  return mockAppointments.map((appointment, index) => ({
    id: appointment.id || `${doctorId}-${index}`,
    status: appointment.status || 'Pending',
    appointment_date: appointment.appointment_date || appointment.time || new Date().toISOString(),
    time: appointment.time || '09:00',
    ...appointment,
  }))
}

function parseAppointmentDate(appointment) {
  const rawValue = appointment?.appointment_date || appointment?.time || appointment?.created_at || ''

  if (!rawValue) {
    return new Date()
  }

  if (typeof rawValue === 'string' && /^\d{2}:\d{2}$/.test(rawValue)) {
    const [hours, minutes] = rawValue.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  const parsedDate = new Date(rawValue)
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate
}

function formatAppointmentDate(appointment, language) {
  const date = parseAppointmentDate(appointment)
  return date.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTimeAgo(value, language) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const now = new Date()
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000)
  const absSeconds = Math.abs(diffSeconds)
  const rtf = new Intl.RelativeTimeFormat(language === 'ar' ? 'ar' : 'en', { numeric: 'auto' })

  const thresholds = [
    { unit: 'year', seconds: 60 * 60 * 24 * 365 },
    { unit: 'month', seconds: 60 * 60 * 24 * 30 },
    { unit: 'week', seconds: 60 * 60 * 24 * 7 },
    { unit: 'day', seconds: 60 * 60 * 24 },
    { unit: 'hour', seconds: 60 * 60 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ]

  const match = thresholds.find(item => absSeconds >= item.seconds) || thresholds[thresholds.length - 1]
  const valueForUnit = Math.round(diffSeconds / match.seconds)
  return rtf.format(valueForUnit, match.unit)
}

function toDatetimeLocalValue(appointmentDate) {
  if (!appointmentDate) {
    return ''
  }

  const date = appointmentDate instanceof Date ? appointmentDate : new Date(appointmentDate)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** `<input type="datetime-local">` values are local wall time without a zone — parse explicitly to avoid UTC misreads. */
function datetimeLocalInputToISO(datetimeLocal) {
  const raw = String(datetimeLocal ?? '').trim()
  if (!raw) {
    return null
  }
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/)
  if (m) {
    const y = Number(m[1])
    const mo = Number(m[2]) - 1
    const da = Number(m[3])
    const h = Number(m[4])
    const mi = Number(m[5])
    const se = m[6] != null ? Number(m[6]) : 0
    const d = new Date(y, mo, da, h, mi, se, 0)
    if (Number.isNaN(d.getTime())) {
      return null
    }
    return d.toISOString()
  }
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) {
    return null
  }
  return d.toISOString()
}

function parsePriceValue(price) {
  const match = String(price || '').match(/\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : 0
}

function getAppointmentDayKey(appointment) {
  const date = parseAppointmentDate(appointment)
  return date.toLocaleDateString('en-CA')
}

function getAppointmentMonthKey(appointment) {
  const date = parseAppointmentDate(appointment)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthKey(date, language) {
  return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function buildAnalyticsSummary(appointments, doctor, language) {
  const monthPrice = parsePriceValue(doctor?.price)
  const todayKey = new Date().toLocaleDateString('en-CA')
  const currentMonthKey = getAppointmentMonthKey({ appointment_date: new Date().toISOString() })
  const currentMonthAppointments = appointments.filter(appointment => getAppointmentMonthKey(appointment) === currentMonthKey)
  const todayAppointments = appointments.filter(appointment => getAppointmentDayKey(appointment) === todayKey)
  const completedThisMonth = currentMonthAppointments.filter(appointment => appointment.status === 'Completed').length

  const monthSeries = Array.from({ length: 6 }, (_, index) => {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() - (5 - index))

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthAppointments = appointments.filter(appointment => getAppointmentMonthKey(appointment) === monthKey)

    return {
      key: monthKey,
      label: formatMonthKey(date, language),
      appointments: monthAppointments.length,
      completed: monthAppointments.filter(appointment => appointment.status === 'Completed').length,
      waiting: monthAppointments.filter(appointment => appointment.status !== 'Completed').length,
      revenue: monthAppointments.filter(appointment => appointment.status === 'Completed').length * monthPrice,
    }
  })

  const weekdayCounts = Array.from({ length: 7 }, (_, index) => index).map(dayIndex => {
    const weekdayAppointments = appointments.filter(appointment => parseAppointmentDate(appointment).getDay() === dayIndex)
    const date = new Date()
    date.setDate(date.getDate() + ((dayIndex + 7 - date.getDay()) % 7))

    return {
      key: String(dayIndex),
      label: date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' }),
      count: weekdayAppointments.length,
    }
  })

  const statusBreakdown = appointmentStatusOrder.map(status => ({
    label: localizeAppointmentStatus(language, status),
    value: appointments.filter(appointment => appointment.status === status).length,
  }))

  return {
    todayPatients: todayAppointments.length,
    currentMonthPatients: currentMonthAppointments.length,
    completedThisMonth,
    revenueEstimate: completedThisMonth * monthPrice,
    monthSeries,
    weekdayCounts,
    statusBreakdown,
  }
}

function buildReviewSummary(reviews) {
  const sanitized = reviews.filter(review => Number.isFinite(review.rating))
  const total = sanitized.length
  const average = total ? sanitized.reduce((sum, review) => sum + review.rating, 0) / total : 0

  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star: String(star),
    count: sanitized.filter(review => review.rating === star).length,
  }))

  return {
    total,
    average,
    distribution,
  }
}

function normalizeSpecialtyText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[^a-z0-9\u0600-\u06FF\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function doctorSnapshotHaystack(doctor) {
  const specs = Array.isArray(doctor?.specialties) ? doctor.specialties : []
  const parts = [doctor?.specialty, doctor?.specialty_ar, doctor?.specialty_en, ...specs].filter(Boolean)
  return normalizeSpecialtyText(parts.join(' '))
}

function specialtyHintMatches(hint, doctor) {
  const needle = normalizeSpecialtyText(hint)
  if (!needle) {
    return false
  }
  const hay = doctorSnapshotHaystack(doctor)
  if (!hay) {
    return false
  }
  if (hay.includes(needle)) {
    return true
  }
  return needle.split(' ').some(token => token.length > 1 && hay.includes(token))
}

function pickCoordinatorDoctors(snapshot, specialtyHint) {
  const withTele = snapshot.filter(doctor => Boolean(doctor.tele_consultation))
  const teleMatched = withTele.filter(doctor => specialtyHintMatches(specialtyHint, doctor))
  if (teleMatched.length) {
    return teleMatched.slice(0, 5)
  }
  const anyMatched = snapshot.filter(doctor => specialtyHintMatches(specialtyHint, doctor))
  if (anyMatched.length) {
    return anyMatched.slice(0, 5)
  }
  if (withTele.length) {
    return withTele.slice(0, 5)
  }
  return snapshot.slice(0, 3)
}

function normalizeCoordinatorMatchKey(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[^a-z0-9\u0600-\u06FF\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** ترشيح طبيب واحد من مخرجات الموديل، مع احترام التخصص الناقص */
function resolveRecommendedDoctors(snapshot, parsed) {
  const missing = String(parsed?.missing_specialty_only ?? '').trim()
  if (missing) {
    return { doctors: [], missingSpecialty: missing }
  }

  const specialtyHint = String(parsed?.specialty_hint || parsed?.specialty || '').trim()

  const idRaw = parsed?.recommended_doctor_id
  if (idRaw != null && String(idRaw).trim() !== '') {
    const found = snapshot.find(doctor => String(doctor.id) === String(idRaw).trim())
    if (found && (!specialtyHint || specialtyHintMatches(specialtyHint, found))) {
      return { doctors: [found], missingSpecialty: '' }
    }
  }

  const nameHint = String(parsed?.recommended_doctor_name ?? '').trim()
  if (nameHint) {
    const needle = normalizeCoordinatorMatchKey(nameHint)
    const found =
      snapshot.find(doctor => normalizeCoordinatorMatchKey(doctor.name) === needle)
      || snapshot.find(doctor => {
        const hay = normalizeCoordinatorMatchKey(doctor.name)
        return hay && needle && (hay.includes(needle) || needle.includes(hay))
      })
    if (found && (!specialtyHint || specialtyHintMatches(specialtyHint, found))) {
      return { doctors: [found], missingSpecialty: '' }
    }
  }

  if (specialtyHint) {
    const fallback = pickCoordinatorDoctors(snapshot, specialtyHint).slice(0, 1)
    if (fallback.length) {
      return { doctors: fallback, missingSpecialty: '' }
    }
    return { doctors: [], missingSpecialty: specialtyHint }
  }

  return { doctors: [], missingSpecialty: '' }
}

function parseCoordinatorJsonFromText(modelText) {
  const raw = String(modelText || '{}')
  try {
    return JSON.parse(raw)
  } catch {
    const brace = raw.match(/\{[\s\S]*\}/)
    return brace ? JSON.parse(brace[0]) : {}
  }
}

async function fetchCoordinatorJsonWithGemini(systemPrompt, userPrompt, apiKey) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1536,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      },
    )
    clearTimeout(timeout)
    if (!response.ok) return null
    const payload = await response.json()
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    return parseCoordinatorJsonFromText(text)
  } catch {
    clearTimeout(timeout)
    return null
  }
}

async function fetchCoordinatorJsonWithGroq(systemPrompt, userPrompt, apiKey) {
  const model = String(import.meta.env.VITE_GROQ_MODEL || '').trim() || 'llama-3.3-70b-versatile'
  const url = 'https://api.groq.com/openai/v1/chat/completions'
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], temperature: 0.2, max_tokens: 1400, response_format: { type: 'json_object' } }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const payload = await res.json()
    const text = payload?.choices?.[0]?.message?.content || '{}'
    return parseCoordinatorJsonFromText(text)
  } catch {
    clearTimeout(timeout)
    return null
  }
}

async function fetchMedicalCoordinatorJson(systemPrompt, userPrompt) {
  const geminiKey = String(import.meta.env.VITE_GEMINI_API_KEY || '').trim()
  const groqKey = String(import.meta.env.VITE_GROQ_API_KEY || '').trim()
  if (geminiKey) {
    return fetchCoordinatorJsonWithGemini(systemPrompt, userPrompt, geminiKey)
  }
  if (groqKey) {
    return fetchCoordinatorJsonWithGroq(systemPrompt, userPrompt, groqKey)
  }
  return null
}

function buildAppointmentCsvRows(appointments, doctor, language) {
  const headers = language === 'ar'
    ? ['الموعد', 'الاسم', 'الهاتف', 'الحالة', 'الطبيب', 'الرمز']
    : ['Appointment Date', 'Patient Name', 'Phone', 'Status', 'Doctor', 'Code']

  const rows = [headers]

  appointments.forEach(appointment => {
    rows.push([
      formatAppointmentDate(appointment, language),
      appointment.patient_name || '',
      appointment.phone || '',
      localizeAppointmentStatus(language, appointment.status),
      doctor?.name || '',
      doctor?.secret_code || '',
    ])
  })

  return rows
}

function downloadCsv(filename, rows) {
  const csvContent = rows
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  window.URL.revokeObjectURL(url)
}

function HihyaEmblem({ theme = 'light' }) {
  const isDark = theme === 'dark'
  const lightPrimary = '#0E7490'
  const lightSecondary = '#0F766E'
  const lightAccent = '#115E59'

  return (
    <svg
      viewBox="0 0 180 96"
      className="h-12 w-auto shrink-0"
      style={{
        filter: isDark ? 'drop-shadow(0 0 10px #06b6d4)' : 'none',
      }}
      role="img"
      aria-label="Hihya Care emblem"
    >
      <defs>
        <linearGradient id="hihya-emblem-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#ecfeff' : lightPrimary} />
          <stop offset="48%" stopColor={isDark ? '#67e8f9' : lightSecondary} />
          <stop offset="100%" stopColor={isDark ? '#10b981' : lightAccent} />
        </linearGradient>
        <linearGradient id="hihya-emblem-line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isDark ? '#a7f3d0' : lightPrimary} />
          <stop offset="50%" stopColor={isDark ? '#22d3ee' : lightSecondary} />
          <stop offset="100%" stopColor={isDark ? '#34d399' : lightAccent} />
        </linearGradient>
        <filter id="hihya-emblem-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.13 0 0 0 0 0.82 0 0 0 0 0.89 0 0 0 0.75 0"
          />
        </filter>
      </defs>

      <g filter={isDark ? 'url(#hihya-emblem-glow)' : 'none'} opacity={isDark ? '0.42' : '1'}>
        <path d="M52 20 L52 72 M52 46 L82 46 M82 20 L82 72" stroke="url(#hihya-emblem-metal)" strokeWidth="8" strokeLinecap="round" />
        <path d="M93 21 C101 16, 114 16, 122 22 C129 27, 132 36, 128 44 C125 49, 120 54, 112 56 C105 58, 100 63, 98 70" fill="none" stroke="url(#hihya-emblem-line)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28 56 C42 56, 48 56, 56 56 C62 56, 67 53, 70 47 C74 39, 80 39, 84 47 C87 53, 91 56, 98 56 C105 56, 109 52, 111 45 C114 34, 120 34, 124 45 C127 53, 131 56, 141 56 C151 56, 158 56, 168 56" fill="none" stroke="url(#hihya-emblem-line)" strokeWidth="3.5" strokeLinecap="round" />
      </g>

      <rect x="46" y="18" width="42" height="54" rx="18" fill={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)'} stroke={isDark ? 'rgba(186,230,253,0.75)' : '#E2E8F0'} strokeWidth="1.5" />
      <path d="M52 20 L52 72 M52 46 L82 46 M82 20 L82 72" stroke="url(#hihya-emblem-metal)" strokeWidth="7" strokeLinecap="round" />

      <path d="M98 22 C106 16, 117 16, 124 22 C131 28, 134 36, 130 43 C126 50, 118 55, 111 57 C105 59, 101 63, 98 70" fill="none" stroke="url(#hihya-emblem-line)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 56 C42 56, 48 56, 56 56 C62 56, 67 53, 70 47 C74 39, 80 39, 84 47 C87 53, 91 56, 98 56 C105 56, 109 52, 111 45 C114 34, 120 34, 124 45 C127 53, 131 56, 141 56 C151 56, 158 56, 168 56" fill="none" stroke="url(#hihya-emblem-line)" strokeWidth="2.2" strokeLinecap="round" />

      <path d="M100 18 L100 10 M96 14 L104 14" stroke={isDark ? '#ecfeff' : lightPrimary} strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="100" cy="14" r="5.5" fill="none" stroke={isDark ? 'rgba(34,211,238,0.85)' : lightSecondary} strokeWidth="1.5" />

      <text x="108" y="76" fill={isDark ? 'rgba(226,232,240,0.82)' : lightPrimary} fontSize="11" fontWeight="700" letterSpacing="4">CARE</text>
    </svg>
  )
}

function App() {
  const [language, setLanguage] = useState(defaultLanguage)
  const [theme, setTheme] = useState(defaultTheme)
  const [themePulse, setThemePulse] = useState(false)
  const themeMountedRef = useRef(false)
  const [doctors, setDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [doctorsNotice, setDoctorsNotice] = useState('')
  const [section, setSection] = useState(() => {
    try { return localStorage.getItem('hihya-section') || null } catch { return null }
  })

  const handleSetSection = (s) => {
    setSection(s)
    try { localStorage.setItem('hihya-section', s) } catch { }
  }

  // Diagnose Supabase connection
  useEffect(() => {
    const hasUrl = Boolean(import.meta.env.VITE_SUPABASE_URL)
    const hasKey = Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)
    console.log('[Supabase] Config:', hasUrl ? 'URL ✓' : 'URL ✗', hasKey ? 'Key ✓' : 'Key ✗')
    if (hasUrl && hasKey) {
      supabase.from('doctors').select('count', { count: 'exact', head: true }).then(r =>
        console.log('[Supabase] Connection test:', r.error ? `FAIL: ${r.error.message}` : 'OK ✓')
      ).catch(e => console.log('[Supabase] Connection error:', e.message))
    } else {
      console.log('[Supabase] Using FALLBACK client (no credentials)')
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language === 'ar' ? 'ar' : 'en'
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (!themeMountedRef.current) {
      themeMountedRef.current = true
      return undefined
    }

    setThemePulse(true)
    const timeoutId = window.setTimeout(() => setThemePulse(false), 700)

    return () => window.clearTimeout(timeoutId)
  }, [theme])

  useEffect(() => {
    let active = true

    const loadDoctors = async () => {
      setLoadingDoctors(true)
      setDoctorsNotice('')

      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .order('name', { ascending: true })

        if (!active) return

        if (error || !Array.isArray(data) || data.length === 0) {
          setDoctors(createFallbackDoctors())
          if (error) setDoctorsNotice(`${getText(language, 'fallbackNotice')} (${error.message})`)
          else setDoctorsNotice(getText(language, 'fallbackNotice'))
        } else {
          const supabaseDoctors = data.map(makeDoctorFromRow)
          const hasVet = supabaseDoctors.some(d => d.id === 'al-rahma-pet-clinic')
          const vetClinic = createFallbackDoctor('al-rahma-pet-clinic')
          setDoctors(hasVet ? supabaseDoctors : [...supabaseDoctors, vetClinic].filter(Boolean))
        }
      } catch (err) {
        if (active) {
          setDoctors(createFallbackDoctors())
          setDoctorsNotice(`${getText(language, 'fallbackNotice')} (${err instanceof Error ? err.message : 'Network error'})`)
        }
      }

      setLoadingDoctors(false)
    }

    loadDoctors()

    return () => {
      active = false
    }
  }, [language])

  const doctorLookup = useMemo(() => new Map(doctors.map(doctor => [doctor.id, doctor])), [doctors])

  const ui = {
    language,
    theme,
    setLanguage,
    setTheme,
    themePulse,
    section,
    setSection: handleSetSection,
  }

  if (!section) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TriageProvider>
            <Suspense fallback={<RouteFallback ui={ui} />}>
              <GatewayScreen onSelect={handleSetSection} />
            </Suspense>
          </TriageProvider>
        </BrowserRouter>
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TriageProvider>
        <Suspense fallback={<RouteFallback ui={ui} />}>
          <Routes>
            <Route path="/" element={<HomePage doctors={doctors} loading={loadingDoctors} notice={doctorsNotice} ui={ui} />} />
            <Route path="/portfolio" element={<DashboardPortfolio />} />
            <Route path="/analytics" element={<CinematicAnalyticsDashboard theme={ui.theme} />} />
            <Route path="/doctor/premium-preview" element={<PremiumDoctorProfile />} />
            <Route path="/doctor/:doctorId" element={<DoctorProfilePage loading={loadingDoctors} notice={doctorsNotice} ui={ui} />} />
            <Route path="/book/:doctorId" element={<BookingPage doctorLookup={doctorLookup} loading={loadingDoctors} notice={doctorsNotice} ui={ui} />} />
            <Route path="/booking-success" element={<AppointmentConfirmationPage ui={ui} />} />
            <Route path="/dashboard" element={<DashboardAccessPage ui={ui} />} />
            <Route path="/review/:appointmentId" element={<ReviewPage ui={ui} />} />
            <Route path="/dashboard/:doctorId" element={<Navigate to="/dashboard" replace />} />
            <Route path="/ai-triage" element={<AITriageChat section={section} />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/prescription/:id" element={<PrescriptionPublicView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </TriageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

function AppShell({ children, ui }) {
  const { language, theme, setLanguage, setTheme, themePulse = false, section, setSection } = ui
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = key => getText(language, key)
  const isArabic = language === 'ar'
  const isDark = theme === 'dark'

  return (
    <main className={`relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#020617] dark:text-slate-100 ${themePulse ? 'theme-fade' : ''}`}>
      <style>{`
        @keyframes floatSoft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .shimmer-text {
          background: linear-gradient(90deg, currentColor 0%, rgba(255,255,255,0.45) 50%, currentColor 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: none;
        }
      `}</style>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.08),_transparent_32%)] dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_32%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(2,6,23,1))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)] dark:bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)]" />
      <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-400/20" />
      <div className="absolute right-10 top-24 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="sticky top-0 z-30 mb-4 rounded-2xl border border-slate-200/80 bg-white/92 px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-colors duration-300 dark:border-cyan-300/15 dark:bg-slate-950/72 dark:shadow-[0_0_24px_rgba(34,211,238,0.06)] sm:sticky sm:top-3 sm:mb-4 sm:px-4 sm:py-2.5 sm:rounded-3xl">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <Link to="/" className="flex items-center gap-2 text-slate-900 dark:text-cyan-100">
              <HihyaEmblem theme={theme} />
              <span className="hidden flex-col text-start sm:flex">
                <span className="text-[10px] font-semibold uppercase tracking-[0.34em]">{t('navBrand')}</span>
                <span className="hidden text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 sm:block">
                  {isArabic ? 'هوية طبية مستقبلية' : 'Futuristic medical identity'}
                </span>
              </span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-2">
              <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300/25 bg-gradient-to-r from-cyan-400/15 to-emerald-400/15 px-2 py-1.5 text-[10px] font-semibold text-cyan-700 transition hover:shadow-[0_0_16px_rgba(34,211,238,0.2)] active:scale-[0.95] dark:text-cyan-200 dark:from-cyan-500/15 dark:to-emerald-500/15 sm:px-3">
                <svg className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <span className="hidden sm:inline">{isArabic ? 'لوحة التحكم' : 'Dashboard'}</span>
              </Link>
              <Link to="/ai-triage" className="inline-flex items-center gap-1.5 rounded-xl border border-violet-300/25 bg-gradient-to-r from-violet-400/15 to-cyan-400/15 px-2 py-1.5 text-[10px] font-semibold text-violet-700 transition hover:shadow-[0_0_16px_rgba(139,92,246,0.2)] active:scale-[0.95] dark:text-violet-200 dark:from-violet-500/15 dark:to-cyan-500/15 sm:px-3">
                <svg className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                <span className="hidden sm:inline">{isArabic ? 'المساعد الذكي' : 'AI Chat'}</span>
              </Link>
              {/* Section Toggle */}
              <button
                type="button"
                onClick={() => setSection(section === 'veterinary' ? 'human' : 'veterinary')}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-[10px] font-semibold transition active:scale-[0.95] sm:px-3 ${
                  section === 'veterinary'
                    ? 'border-emerald-300/30 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'border-blue-300/25 bg-gradient-to-r from-blue-400/15 to-cyan-400/15 text-blue-200'
                }`}
                title={section === 'veterinary' ? (isArabic ? 'التبديل للعيادات البشرية' : 'Switch to Human') : (isArabic ? 'التبديل للطب البيطري' : 'Switch to Veterinary')}
              >
                {section === 'veterinary' ? (
                  <>
                    <Stethoscope className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">{isArabic ? 'بشري' : 'Human'}</span>
                  </>
                ) : (
                  <>
                    <PawPrint className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">{isArabic ? 'بيطري' : 'Vet'}</span>
                  </>
                )}
              </button>

              {/* Desktop language & theme */}
              <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-0.5 dark:border-white/10 dark:bg-slate-950/60 sm:flex">
                <span className="px-1.5 text-[9px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('language')}</span>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`min-w-7 rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition ${
                    language === 'en'
                      ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10'
                  }`}
                >
                  {t('english')}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`min-w-7 rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition ${
                    language === 'ar'
                      ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10'
                  }`}
                >
                  {t('arabic')}
                </button>
              </div>

              <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-0.5 dark:border-white/10 dark:bg-slate-950/60 sm:flex">
                <span className="px-1.5 text-[9px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('theme')}</span>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`min-w-7 rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition ${
                    theme === 'light'
                      ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10'
                  }`}
                >
                  {t('dark')}
                </button>
              </div>

              {/* Hamburger — mobile only */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(o => !o)}
                className="flex sm:hidden items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-slate-600 dark:text-slate-300 active:scale-[0.9] transition"
                aria-label={isArabic ? 'القائمة' : 'Menu'}
              >
                {mobileMenuOpen ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu panel */}
          {mobileMenuOpen && (
            <div className="mt-3 space-y-2 border-t border-white/10 pt-3 sm:hidden">
              {/* Dashboard */}
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5">
                <svg className="h-5 w-5 shrink-0 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                {isArabic ? 'لوحة التحكم' : 'Dashboard'}
              </Link>
              {/* AI Assistant */}
              <Link to="/ai-triage" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5">
                <svg className="h-5 w-5 shrink-0 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                {isArabic ? 'المساعد الذكي' : 'AI Assistant'}
              </Link>
              {/* Section Toggle */}
              <button
                type="button"
                onClick={() => { setSection(section === 'veterinary' ? 'human' : 'veterinary'); setMobileMenuOpen(false) }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  section === 'veterinary'
                    ? 'text-emerald-600 dark:text-emerald-200'
                    : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                {section === 'veterinary' ? (
                  <Stethoscope className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <PawPrint className="h-5 w-5 shrink-0 text-blue-500" />
                )}
                <span>{section === 'veterinary' ? (isArabic ? 'بشري' : 'Human') : (isArabic ? 'بيطري' : 'Vet')}</span>
              </button>
              {/* Divider */}
              <div className="border-t border-white/10 pt-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('language')}</span>
                  <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5 dark:border-white/10 dark:bg-slate-950/60">
                    <button onClick={() => setLanguage('en')} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${language === 'en' ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950' : 'text-slate-600 dark:text-slate-300'}`}>EN</button>
                    <button onClick={() => setLanguage('ar')} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${language === 'ar' ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950' : 'text-slate-600 dark:text-slate-300'}`}>AR</button>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('theme')}</span>
                  <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5 dark:border-white/10 dark:bg-slate-950/60">
                    <button onClick={() => setTheme('light')} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${theme === 'light' ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950' : 'text-slate-600 dark:text-slate-300'}`}>{t('light')}</button>
                    <button onClick={() => setTheme('dark')} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${theme === 'dark' ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950' : 'text-slate-600 dark:text-slate-300'}`}>{t('dark')}</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        <div dir={isArabic ? 'rtl' : 'ltr'}>
          {children}

          <footer className="mt-6 rounded-2xl border border-slate-200 bg-white/92 p-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 sm:mt-8 sm:rounded-3xl sm:p-4">
            <div className="grid gap-3 lg:gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:justify-between">
              <div className="max-w-2xl text-center lg:text-start">
                <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-700/70 dark:text-cyan-200/70 sm:text-xs sm:tracking-[0.4em]">
                  {isArabic ? 'دعم العيادة' : 'Clinic support'}
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-900 dark:text-white sm:mt-1.5 sm:text-xl">
                  {isArabic ? 'للاستفسار أو الحجز أو المتابعة' : 'For booking, questions, or follow-up'}
                </h3>
                <div className="mt-1.5 space-y-1.5 text-xs leading-4 text-slate-600 dark:text-slate-300 sm:mt-2 sm:space-y-2 sm:text-sm sm:leading-6">
                  <p className="sm:hidden">{isArabic ? 'الدعم جاهز لأي سؤال أو حجز.' : 'Support is ready for any question or booking.'}</p>
                  <p className="hidden sm:block">{isArabic ? 'فريق الدعم جاهز لمساعدتك في أي استفسار عن التجربة أو الحجز.' : 'The support team is ready to help with any booking or demo question.'}</p>
                  <p className="hidden text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400 sm:block">
                    {isArabic ? 'بيانات التواصل المباشر' : 'Direct contact details'}
                  </p>
                  <p className="hidden sm:block"><span className="font-semibold text-slate-900 dark:text-white">{isArabic ? 'الاسم' : 'Name'}:</span> Mohammed Abdelkarim</p>
                  <p className="hidden sm:block"><span className="font-semibold text-slate-900 dark:text-white">{isArabic ? 'الرقم' : 'Phone'}:</span> 01013988098</p>
                  <p className="hidden sm:block"><span className="font-semibold text-slate-900 dark:text-white">{isArabic ? 'الإيميل' : 'Email'}:</span> mohammed.abdelkarim2025@gmail.com</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5 lg:self-end">
                <a
                  href="https://wa.me/201013988098"
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full min-h-[3.25rem] items-start gap-3 rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-3 py-2.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-400/15 dark:text-emerald-100 sm:rounded-2xl sm:px-3.5 sm:py-3 sm:text-sm"
                >
                  <span className="mt-0.5 box-border flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-400/35 bg-emerald-500/15 leading-none">
                    <MessageCircleMore className="block size-[14px] shrink-0 text-emerald-800 dark:text-emerald-200" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="min-w-0 flex flex-1 flex-col gap-0.5 leading-snug sm:text-start">
                    <span className="block">{isArabic ? 'واتساب' : 'WhatsApp'}</span>
                    <span className="block text-[10px] font-normal opacity-80">01013988098</span>
                  </span>
                </a>
                <a
                  href="mailto:mohammed.abdelkarim2025@gmail.com"
                  className="flex w-full min-h-[3.25rem] items-start gap-3 rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-2.5 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-400/15 dark:text-cyan-100 sm:rounded-2xl sm:px-3.5 sm:py-3 sm:text-sm"
                >
                  <span className="mt-0.5 box-border flex size-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/35 bg-cyan-500/15 leading-none">
                    <Mail className="block size-[14px] shrink-0 text-cyan-800 dark:text-cyan-200" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="min-w-0 flex flex-1 flex-col gap-0.5 leading-snug sm:text-start">
                    <span className="block">{isArabic ? 'إيميل' : 'Email'}</span>
                    <span className="block break-all text-[10px] font-normal opacity-80 sm:break-words sm:break-normal">
                      mohammed.abdelkarim2025@gmail.com
                    </span>
                  </span>
                </a>
                <a
                  href="tel:+201013988098"
                  className="flex w-full min-h-[3.25rem] items-start gap-3 rounded-xl border border-slate-300/50 bg-white/70 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 sm:rounded-2xl sm:px-3.5 sm:py-3 sm:text-sm"
                >
                  <span className="mt-0.5 box-border flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-300/45 bg-white/90 leading-none dark:border-white/15 dark:bg-white/10">
                    <Phone className="block size-[14px] shrink-0 text-slate-700 dark:text-slate-200" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="min-w-0 flex flex-1 flex-col gap-0.5 leading-snug sm:text-start">
                    <span className="block">{isArabic ? 'اتصال' : 'Call'}</span>
                    <span className="block text-[10px] font-normal opacity-80">+20 101 398 8098</span>
                  </span>
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  )
}

const DoctorCard = memo(function DoctorCard({ doctor, index, ui }) {
  const t = key => getText(ui.language, key)
  const navigate = useNavigate()
  const localizedDoctor = localizeDoctor(ui.language, doctor)
  const tone = getDoctorTone(localizedDoctor?.specialty)
  const avatarGradient = tone.avatar || avatarGradients[index % avatarGradients.length]
  const isAfandy = /أفندي|Afandy/i.test(localizedDoctor?.name || '')
  const availability = Array.isArray(doctor?.availability) ? doctor.availability : []
  const ratingValue = Number(doctor?.rating ?? 4.8)
  const reviewsCount = Number(doctor?.reviews_count ?? 120)
  const waitMinutes = Number(doctor?.wait_minutes ?? 24)
  const paymentLabel = ui.language === 'ar'
    ? (doctor?.payment_method || 'كاش')
    : (doctor?.payment_method_en || doctor?.payment_method || 'Cash')
  const specialtiesList = Array.isArray(doctor?.specialties) ? doctor.specialties.slice(0, 3) : []
  const specialtyKeyword = [localizedDoctor?.specialty, ...(Array.isArray(doctor?.specialties) ? doctor.specialties : [])].filter(Boolean).join(' ')
  const specialtyVisual = getSpecialtyVisual(specialtyKeyword)
  const availabilityLabel = availability.includes('today')
    ? (ui.language === 'ar' ? 'متاح اليوم' : 'Available today')
    : availability.includes('tomorrow')
      ? (ui.language === 'ar' ? 'متاح غداً' : 'Available tomorrow')
      : availability.includes('this-week')
        ? (ui.language === 'ar' ? 'متاح هذا الأسبوع' : 'Available this week')
        : (ui.language === 'ar' ? 'حجز مرن' : 'Flexible booking')

  const openProfile = useCallback(() => {
    navigate(`/doctor/${localizedDoctor.id}`)
  }, [navigate, localizedDoctor.id])

  const onCardKeyDown = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openProfile()
    }
  }, [openProfile])

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openProfile}
      onKeyDown={onCardKeyDown}
      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.6rem] border border-white/30 bg-gradient-to-br ${tone.surface} p-3 shadow-[0_14px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-white/40 active:scale-[0.98] ${tone.glow} dark:border-white/10 dark:bg-white/5 sm:p-4`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/75 via-white/55 to-white/90 dark:from-slate-950/75 dark:via-slate-950/55 dark:to-slate-950/88" />
      <div className="absolute -top-10 left-6 h-16 w-16 rounded-full bg-white/30 blur-2xl dark:bg-white/10" />
      <div className="absolute -bottom-12 right-6 h-20 w-20 rounded-full bg-white/15 blur-2xl dark:bg-white/5" />

      <div
        className="pointer-events-none absolute end-2.5 top-2.5 z-[1] h-11 w-11 overflow-hidden rounded-xl border border-white/60 shadow-md ring-1 ring-slate-900/5 sm:end-3 sm:top-3 sm:h-12 sm:w-12 dark:border-white/20 dark:ring-white/10"
        title={localizedDoctor.specialty || ''}
      >
        <img
          src={specialtyVisual.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
        />
      </div>

      <div className="relative z-[2] flex items-center gap-3 pe-12 sm:pe-14">
        <div className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.2rem] border border-white/30 bg-gradient-to-br ${avatarGradient} shadow-inner dark:border-white/10`}>
          {localizedDoctor.image_url ? (
            <img src={localizedDoctor.image_url} alt={localizedDoctor.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-white/90" fill="none" aria-hidden="true">
              <path
                d="M12 12.4C14.2091 12.4 16 10.6091 16 8.4C16 6.19086 14.2091 4.4 12 4.4C9.79086 4.4 8 6.19086 8 8.4C8 10.6091 9.79086 12.4 12 12.4Z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M4.8 19.2C5.9 15.9 8.6 14.2 12 14.2C15.4 14.2 18.1 15.9 19.2 19.2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
        <div className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] ${tone.badge}`}>
          {availabilityLabel}
        </div>
      </div>

      <div className="relative z-[2] mt-3">
        <p className="text-[10px] uppercase tracking-[0.34em] text-slate-600 dark:text-slate-300">{t('doctorCardTitle')}</p>
        <h3 className={`mt-1 text-base font-semibold tracking-[-0.03em] text-slate-900 dark:text-white ${isAfandy ? 'shimmer-text' : ''}`}>
          {localizedDoctor.name}
        </h3>
        <p className="mt-1 text-xs text-slate-700/80 dark:text-slate-200/80">{localizedDoctor.specialty}</p>
      </div>

      <div className="relative z-[2] mt-3 rounded-2xl border border-white/40 bg-white/60 px-3 py-2 text-[11px] leading-5 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
        <p className="line-clamp-2">{localizedDoctor.bio || t('doctorFallbackBio')}</p>
        {localizedDoctor.clinicLocation ? (
          <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-300">{localizedDoctor.clinicLocation}</p>
        ) : null}
      </div>

      <div className="relative z-[2] mt-3 grid gap-2 text-[11px] text-slate-600 dark:text-slate-200">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400" fill="currentColor" />
          <span className="font-semibold text-slate-800 dark:text-white">{ratingValue.toFixed(1)}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-300">
            {ui.language === 'ar' ? `(${reviewsCount} تقييم)` : `(${reviewsCount} reviews)`}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-500" />
            <span>{ui.language === 'ar' ? 'الانتظار' : 'Wait'}</span>
          </span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-100">{ui.language === 'ar' ? `${waitMinutes} دقيقة` : `${waitMinutes} min`}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cyan-500" />
            <span>{ui.language === 'ar' ? 'الموقع' : 'Location'}</span>
          </span>
          <span className="max-w-[9rem] truncate text-[10px] font-semibold text-slate-700 dark:text-slate-100">
            {localizedDoctor.clinicLocation || '--'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-sky-500" />
            <span>{ui.language === 'ar' ? 'الدفع' : 'Payment'}</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-100">{paymentLabel}</span>
        </div>
      </div>

      <div className="relative z-[2] mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.25em] text-slate-400">
        {doctor.tele_consultation ? (
          <span className="rounded-full border border-purple-300/40 bg-purple-100/70 px-2.5 py-1 font-semibold text-purple-800 dark:border-purple-400/30 dark:bg-purple-500/20 dark:text-purple-200">
            {ui.language === 'ar' ? 'استشارة هاتفية' : 'Telemedicine'}
          </span>
        ) : null}
        {doctor.home_visit ? (
          <span className="rounded-full border border-amber-300/40 bg-amber-100/70 px-2.5 py-1 font-semibold text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-200">
            {ui.language === 'ar' ? 'زيارة منزلية' : 'Home Visit'}
          </span>
        ) : null}
        <span className="rounded-full border border-white/40 bg-white/70 px-2.5 py-1 font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
          {localizedDoctor.price}
        </span>
        <span className="rounded-full border border-white/40 bg-white/70 px-2.5 py-1 font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
          {localizedDoctor.phone_number ? t('doctorWhatsAppReady') : t('doctorNoPhone')}
        </span>
        {specialtiesList.map(item => (
          <span
            key={`${localizedDoctor.id}-spec-${item}`}
            className="rounded-full border border-white/30 bg-white/50 px-2.5 py-1 text-[9px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="relative z-[2] mt-4 grid grid-cols-2 gap-2">
        <Link
          to={`/dashboard?doctor=${localizedDoctor.id}`}
          onClick={event => event.stopPropagation()}
          className="inline-flex w-full items-center justify-center rounded-xl border border-white/30 bg-white/50 px-2.5 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
        >
          {ui.language === 'ar' ? 'فتح اللوحة' : 'Open Dashboard'}
        </Link>
        <Link
          to={`/doctor/${localizedDoctor.id}`}
          onClick={event => event.stopPropagation()}
          className="inline-flex w-full items-center justify-center rounded-xl border border-white/40 bg-white/70 px-2.5 py-2 text-[11px] font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-white/90 dark:border-white/10 dark:bg-white/10 dark:text-white"
        >
          {t('doctorViewProfile')}
        </Link>
      </div>
    </article>
  )
})

function DoctorAvailabilityItem({ doctor, ui, labels }) {
  const t = key => getText(ui.language, key)
  const navigate = useNavigate()
  const { reviews, loading: reviewsLoading } = useReviewsByDoctorId(doctor?.id, ui.language)
  const reviewSummary = useMemo(() => buildReviewSummary(reviews), [reviews])
  const ratingValue = reviewSummary.total ? reviewSummary.average : null
  const ratingCountLabel = reviewsLoading
    ? t('reviewLoading')
    : reviewSummary.total
      ? t('availabilityRatingCount', reviewSummary.total)
      : t('availabilityRatingEmpty')
  const waitValue = t('availabilityWaitValue', 24)

  if (!doctor) {
    return null
  }

  const handleBookSlot = slotDate => {
    navigate(`/book/${doctor.id}?slot=${encodeURIComponent(slotDate.toISOString())}`)
  }

  const handleBookDoctor = () => {
    navigate(`/book/${doctor.id}`)
  }

  const handleViewProfile = () => {
    navigate(`/doctor/${doctor.id}`)
  }

  return (
    <DoctorAvailabilityShowcase
      doctor={doctor}
      onBookSlot={handleBookSlot}
      onBookDoctor={handleBookDoctor}
      onViewProfile={handleViewProfile}
      labels={labels}
      language={ui.language}
      ratingValue={ratingValue}
      ratingCountLabel={ratingCountLabel}
      waitValue={waitValue}
    />
  )
}

function HomePage({ doctors, loading, notice, ui }) {
  const t = key => getText(ui.language, key)
  const isArabic = ui.language === 'ar'
  const activeSection = ui.section || 'human'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [genderFilter, setGenderFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [clinicStatusNonce, setClinicStatusNonce] = useState(0)
  const [bookingType, setBookingType] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const doctorsRef = useRef(null)

  const handleBookingTypeSelect = useCallback((type) => {
    setBookingType((prev) => (prev === type ? null : type))
    try { sessionStorage.setItem('hihya-service-type', type) } catch {}
    setTimeout(() => {
      doctorsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [])

  useEffect(() => {
    const handler = () => setClinicStatusNonce(n => n + 1)
    window.addEventListener('clinic-status-changed', handler)
    window.addEventListener('storage', handler)
    return () => { window.removeEventListener('clinic-status-changed', handler); window.removeEventListener('storage', handler) }
  }, [])

  const specialtyGroups = useMemo(
    () => ({
      popular: ['جلدية', 'اسنان', 'نفسي', 'اطفال وحديثي الولادة', 'مخ واعصاب', 'عظام', 'نساء وتوليد', 'انف واذن وحنجرة', 'قلب واوعية دموية'],
      other: ['الآشعة التداخلية', 'امراض دم', 'اورام', 'باطنة', 'تخسيس وتغذية', 'جراحة اطفال', 'جراحة أورام', 'جراحة اوعية دموية', 'جراحة تجميل'],
    }),
    [],
  )

  const vetDoctors = useMemo(() => doctors.filter(d => d.category === 'veterinary'), [doctors])

  const filteredDoctors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return doctors.filter(doctor => {
      if (doctor.category === 'veterinary') return false
      const nameValues = [doctor.name, doctor.name_en, doctor.name_ar]
        .filter(Boolean)
        .map(value => String(value).toLowerCase())
      const matchesSearch = !query || nameValues.some(value => value.includes(query))

      let clinicStatus = null
      try { clinicStatus = window.localStorage.getItem(`hihya-clinic-status-${doctor.id}`) } catch (e) { /* localStorage unavailable */ }
      const isClosed = clinicStatus === 'closed' || clinicStatus === 'break'
      if (isClosed && availabilityFilter === 'today') return false

      const doctorSpecialties = Array.isArray(doctor.specialties)
        ? doctor.specialties
        : doctor.specialty
          ? [doctor.specialty]
          : []
      const matchesSpecialty = !selectedSpecialty || doctorSpecialties.some(spec => String(spec).includes(selectedSpecialty))

      const matchesGender = genderFilter === 'all' || doctor.gender === genderFilter

      const availability = Array.isArray(doctor.availability) ? doctor.availability : []
      const matchesAvailability = availabilityFilter === 'all' || availability.includes(availabilityFilter)

      const priceValue = Number(doctor.price_value ?? parsePriceValue(doctor.price))
      const matchesPrice = priceFilter === 'all'
        || (priceFilter === 'lt100' && priceValue > 0 && priceValue < 100)
        || (priceFilter === '100-150' && priceValue >= 100 && priceValue <= 150)
        || (priceFilter === 'gt150' && priceValue > 150)

      return matchesSearch && matchesSpecialty && matchesGender && matchesAvailability && matchesPrice
    })
  }, [doctors, searchTerm, selectedSpecialty, genderFilter, availabilityFilter, priceFilter, clinicStatusNonce, bookingType])

  const localizedDoctors = useMemo(
    () => filteredDoctors.map(doctor => localizeDoctor(ui.language, doctor)),
    [filteredDoctors, ui.language],
  )

  const localizedVetDoctors = useMemo(
    () => vetDoctors.map(doctor => localizeDoctor(ui.language, doctor)),
    [vetDoctors, ui.language],
  )

  return (
    <AppShell ui={ui}>
      {/* Triple Hero Cards — Service Selection */}
      <div className="mb-8 rounded-3xl p-6">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-200/70">Our Services</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl md:text-4xl lg:text-5xl">
            {isArabic ? 'اختر نوع الخدمة' : 'Choose Service Type'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isArabic ? 'استشارة هاتفية، كشف عيادة، أو زيارة منزلية — احجز ما يناسبك' : 'Phone consult, clinic visit, or home visit'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3" dir={isArabic ? 'rtl' : 'ltr'}>
          {/* Tele-consultation */}
          <button
            type="button"
            onClick={() => handleBookingTypeSelect('tele-consultation')}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-5 text-right backdrop-blur-2xl transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] min-h-[180px] md:p-6 ${
              bookingType === 'tele-consultation' ? 'border-purple-400/60 shadow-lg shadow-purple-500/30' : 'border-purple-500/30'
            }`}
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(168,85,247,0.2), rgba(217,70,239,0.15))' }}
          >
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-purple-500/15 text-2xl shadow-inner backdrop-blur-xl md:h-16 md:w-16 md:text-3xl">
              📞
            </div>
            <h3 className="mb-1 text-base font-bold text-white md:text-lg">{isArabic ? 'استشارة هاتفية' : 'Phone Consultation'}</h3>
            <p className="text-xs text-slate-400 md:text-sm">{isArabic ? 'تحدث مع طبيبك الآن من منزلك' : 'Talk to your doctor from home'}</p>
            <div className="mt-3 w-full rounded-xl border border-purple-400/30 bg-purple-600/80 py-3 text-center text-sm font-bold text-white transition group-hover:bg-purple-500 md:mt-4">
              {isArabic ? 'احجز استشارتك' : 'Book Consultation'}
            </div>
          </button>

          {/* Clinic Visit */}
          <button
            type="button"
            onClick={() => handleBookingTypeSelect('clinic-visit')}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-5 text-right backdrop-blur-2xl transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] min-h-[180px] md:p-6 ${
              bookingType === 'clinic-visit' ? 'border-blue-400/60 shadow-lg shadow-blue-500/30' : 'border-blue-400/30'
            }`}
            style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(37,99,235,0.2), rgba(8,145,178,0.15))' }}
          >
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-blue-500/15 text-2xl shadow-inner backdrop-blur-xl md:h-16 md:w-16 md:text-3xl">
              🩺
            </div>
            <h3 className="mb-1 text-base font-bold text-white md:text-lg">{isArabic ? 'كشف العيادة' : 'Clinic Visit'}</h3>
            <p className="text-xs text-slate-400 md:text-sm">{isArabic ? 'احجز موعدك التقليدي في العيادة' : 'Book your regular clinic visit'}</p>
            <div className="mt-3 w-full rounded-xl border border-blue-400/30 bg-blue-600/80 py-3 text-center text-sm font-bold text-white transition group-hover:bg-blue-500 md:mt-4">
              {isArabic ? 'احجز موعدك' : 'Book Appointment'}
            </div>
          </button>

          {/* Urgent Care */}
          <button
            type="button"
            onClick={() => handleBookingTypeSelect('urgent-care')}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-5 text-right backdrop-blur-2xl transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] min-h-[180px] md:p-6 ${
              bookingType === 'urgent-care' ? 'border-amber-400/60 shadow-lg shadow-amber-500/30' : 'border-amber-500/30'
            }`}
            style={{ background: 'linear-gradient(135deg, #020617, #030712, #09090b)' }}
          >
            <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 rounded-b-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1 text-[10px] font-bold text-white shadow-lg md:px-4 md:text-xs">
              {isArabic ? 'الأكثر طلباً ⭐' : 'Most Popular ⭐'}
            </div>
            <div className="mx-auto mb-3 mt-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-amber-500/20 text-2xl shadow-inner backdrop-blur-xl md:mb-4 md:mt-4 md:h-16 md:w-16 md:text-3xl">
              ⚡
            </div>
            <h3 className="mb-1 text-base font-bold text-amber-200 md:text-lg">{isArabic ? 'زيارة منزلية فورية' : 'Urgent Home Visit'}</h3>
            <p className="text-xs text-slate-400 md:text-sm">{isArabic ? 'اطلب طبيب للمنزل فوراً للحالات الطارئة' : 'Request an immediate home visit for emergencies'}</p>
            <div className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3 text-center text-sm font-bold text-white shadow-lg shadow-amber-500/30 md:mt-4">
              {isArabic ? 'اطلب زيارة منزلية' : 'Request Home Visit'}
            </div>
          </button>
        </div>
      </div>

      <section ref={doctorsRef} className="animate-[fadeIn_0.6s_ease-out]">
        {activeSection === 'veterinary' ? (
          <>
            {/* Veterinary Mode Header */}
            <div className="mx-auto mb-6 max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-amber-400/40 bg-gradient-to-r from-amber-500/25 to-orange-500/20 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-amber-500/20">
                <PawPrint className="h-4 w-4" />
                {isArabic ? 'قسم الطب البيطري' : 'Veterinary Medicine'}
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-white drop-shadow-lg sm:text-3xl md:text-4xl">
                {isArabic ? 'العيادات البيطرية' : 'Veterinary Clinics'}
              </h2>
              <p className="mt-1 text-lg font-bold text-amber-100">
                {isArabic ? 'أفضل العيادات البيطرية في ههيا' : 'Top veterinary clinics in Hehya'}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border-2 border-amber-400/20 bg-amber-500/15 px-4 py-1.5 text-sm font-bold text-amber-50 shadow-sm">
                <span>🕐</span>
                {isArabic ? 'حجز مرن – احجز موعدك مباشرة مع العيادة' : 'Flexible booking – book directly with the clinic'}
              </div>
            </div>

            {!loading ? (
              <div className="min-w-0">
                <div className="order-1 min-w-0 xl:order-2">
                  {localizedVetDoctors.length ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {localizedVetDoctors.map((doctor, index) => (
                        <DoctorCard key={doctor.id} doctor={doctor} index={index} ui={ui} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-600 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                      {isArabic ? 'لا توجد عيادات بيطرية متاحة حالياً.' : 'No veterinary clinics available.'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-slate-600 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {t('loadingDoctors')}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="relative mx-auto mb-4 max-w-3xl overflow-hidden rounded-2xl border border-violet-200/40 bg-gradient-to-br from-violet-500/[0.06] via-transparent to-cyan-500/[0.06] p-px shadow-[0_16px_48px_rgba(91,33,182,0.1)] dark:border-white/10 dark:from-violet-500/10 dark:to-cyan-500/10 dark:shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
              <MedicalCoordinatorPanel ui={ui} variant="hero" />
            </div>

            <div className="mx-auto mb-4 flex max-w-3xl flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/85 p-3 text-[11px] text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-slate-200 sm:p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 flex-wrap gap-2 md:items-center">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-50 dark:bg-slate-50 dark:text-slate-900">
                    {isArabic ? 'النوع' : 'Gender'}
                  </span>
                  <div className="inline-flex rounded-full bg-slate-100/80 p-1 text-[11px] dark:bg-slate-900/70">
                    {[
                      { value: 'all', label: isArabic ? 'الكل' : 'All' },
                      { value: 'female', label: isArabic ? 'دكتورة' : 'Female' },
                      { value: 'male', label: isArabic ? 'دكتور' : 'Male' },
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGenderFilter(option.value)}
                        className={`rounded-full px-2.5 py-1 font-semibold transition ${
                          genderFilter === option.value
                            ? 'bg-slate-900 text-slate-50 shadow-sm dark:bg-slate-50 dark:text-slate-900'
                            : 'text-slate-600 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-50 dark:bg-slate-50 dark:text-slate-900">
                    {isArabic ? 'المواعيد المتاحة' : 'Availability'}
                  </span>
                  <div className="inline-flex flex-wrap gap-1 text-[11px]">
                    {[
                      { value: 'all', label: isArabic ? 'الكل' : 'All' },
                      { value: 'today', label: isArabic ? 'اليوم' : 'Today' },
                      { value: 'tomorrow', label: isArabic ? 'غداً' : 'Tomorrow' },
                      { value: 'this-week', label: isArabic ? 'هذا الأسبوع' : 'This week' },
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setAvailabilityFilter(option.value)}
                        className={`rounded-full border px-2.5 py-1 font-semibold transition ${
                          availabilityFilter === option.value
                            ? 'border-emerald-300/60 bg-emerald-400/15 text-emerald-900 dark:text-emerald-100'
                            : 'border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-wrap items-center gap-2 md:justify-end">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-50 dark:bg-slate-50 dark:text-slate-900">
                    {isArabic ? 'سعر الكشف' : 'Fee'}
                  </span>
                  <div className="inline-flex flex-wrap gap-1 text-[11px]">
                    {[
                      { value: 'all', label: isArabic ? 'الكل' : 'All' },
                      { value: 'lt100', label: isArabic ? 'أقل من 100' : '< 100' },
                      { value: '100-150', label: isArabic ? '100 - 150' : '100 - 150' },
                      { value: 'gt150', label: isArabic ? 'أعلى من 150' : '> 150' },
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPriceFilter(option.value)}
                        className={`rounded-full border px-2.5 py-1 font-semibold transition ${
                          priceFilter === option.value
                            ? 'border-sky-300/70 bg-sky-400/20 text-sky-900 dark:text-sky-100'
                            : 'border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedSpecialty('')
                    setGenderFilter('all')
                    setAvailabilityFilter('all')
                    setPriceFilter('all')
                  }}
                  className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
                >
                  {isArabic ? 'مسح الفلاتر' : 'Clear filters'}
                </button>
              </div>
            </div>

            <p className="mb-6 text-center text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
              {isArabic ? 'اختيار الطبيب المناسب يبدأ بفهم الأعراض بدقة.' : 'Choosing the right doctor starts with clear symptom details.'}
            </p>

            {loading ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-slate-600 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {t('loadingDoctors')}
              </div>
            ) : notice ? (
              <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-50 p-6 text-sm text-emerald-800 backdrop-blur-2xl dark:bg-emerald-500/10 dark:text-emerald-100">
                {notice}
              </div>
            ) : null}

            {!loading ? (
              <div className="min-w-0">
                <div className="order-1 min-w-0 xl:order-2">
                  <div className="mb-4 grid gap-3 rounded-[1.4rem] border border-slate-200 bg-white/80 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] backdrop-blur-md dark:border-white/10 dark:bg-white/5 sm:grid-cols-[1fr_260px]">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
                        {isArabic ? 'أبحث عن دكتور' : 'Search'}
                      </p>
                      <input
                        type="text"
                        placeholder={isArabic ? 'ابحث بالاسم...' : 'Search by name...'}
                        value={searchTerm}
                      />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
                        {isArabic ? 'اختار التخصص' : 'Select specialty'}
                      </p>
                      <select
                        value={selectedSpecialty}
                        onChange={event => setSelectedSpecialty(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200/60 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                      >
                        <option value="">{isArabic ? 'كل التخصصات' : 'All specialties'}</option>
                        <optgroup label={isArabic ? 'الأكثر اختيارا' : 'Most selected'}>
                          {specialtyGroups.popular.map(item => (
                            <option key={`popular-${item}`} value={item}>{item}</option>
                          ))}
                        </optgroup>
                        <optgroup label={isArabic ? 'تخصصات أخرى' : 'Other specialties'}>
                          {specialtyGroups.other.map(item => (
                            <option key={`other-${item}`} value={item}>{item}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4 rounded-[1.4rem] border border-slate-200 bg-white/80 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
                        {isArabic ? 'الأكثر اختيارا' : 'Most selected'}
                      </p>
                      {selectedSpecialty ? (
                        <button
                          type="button"
                          onClick={() => setSelectedSpecialty('')}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                        >
                          {isArabic ? 'إزالة' : 'Clear'}
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {specialtyGroups.popular.map(item => {
                        const isActive = selectedSpecialty === item
                        return (
                          <button
                            key={`badge-${item}`}
                            type="button"
                            onClick={() => setSelectedSpecialty(item)}
                            className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                              isActive
                                ? 'border-cyan-300/40 bg-cyan-400/15 text-cyan-800 dark:text-cyan-100'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
                      {isArabic ? 'نتائج البحث' : 'Results'}
                    </p>
                    <div className="flex items-center gap-2">
                      {bookingType ? (
                        <button
                          type="button"
                          onClick={() => setBookingType(null)}
                          className="rounded-full border border-rose-300/40 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-500/20 dark:text-rose-300"
                        >
                          {isArabic ? 'إلغاء الفلتر' : 'Clear filter'} ✕
                        </button>
                      ) : null}
                      <div className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                        {isArabic ? `عدد النتائج: ${localizedDoctors.length}` : `Results: ${localizedDoctors.length}`}
                      </div>
                    </div>
                  </div>

                  {bookingType && localizedDoctors.length ? (
                    <div className="mb-4 rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-700 dark:text-cyan-200">
                      {bookingType === 'tele-consultation'
                        ? (isArabic ? '🩺 عرض الأطباء المتاحين للاستشارة الهاتفية' : '🩺 Showing doctors available for phone consultation')
                        : bookingType === 'urgent-care'
                          ? (isArabic ? '🚨 عرض الأطباء المتاحين للزيارة المنزلية العاجلة' : '🚨 Showing doctors available for urgent home visit')
                          : (isArabic ? '🏥 عرض جميع الأطباء المتاحين للكشف في العيادة' : '🏥 Showing all doctors for clinic visit')}
                    </div>
                  ) : null}

                  {localizedDoctors.length ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {localizedDoctors.map((doctor, index) => (
                        <DoctorCard key={doctor.id} doctor={doctor} index={index} ui={ui} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-600 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                      {bookingType === 'tele-consultation'
                        ? (isArabic ? '📞 لا يتوفر أطباء للاستشارة الهاتفية حالياً — جرّب خدمة أخرى أو تابع لاحقاً' : '📞 No doctors available for phone consultation right now — try another service or check back later')
                        : bookingType === 'urgent-care'
                          ? (isArabic ? '🚨 لا يتوفر أطباء للزيارات المنزلية العاجلة حالياً — اتصل على الطوارئ أو جرّب خدمة أخرى' : '🚨 No doctors available for urgent home visits right now — contact emergency or try another service')
                          : (isArabic ? 'لا توجد نتائج مطابقة للفلترة الحالية.' : 'No results match the current filters.')}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </AppShell>
  )
}

function useDoctorById(doctorId, language) {
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true

      const loadDoctor = async () => {
        if (!doctorId) {
          setDoctor(null)
          setLoading(false)
          return
        }

        setLoading(true)
        setNotice('')

        try {
          const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', doctorId)
            .maybeSingle()

          if (!active) return

          if (error || !data) {
            const fallbackDoctor = createFallbackDoctor(doctorId)
            if (fallbackDoctor) {
              setDoctor(localizeDoctor(language, fallbackDoctor))
              setNotice(error?.message ? `${getText(language, 'supplyNotice')} (${error.message})` : getText(language, 'supplyNotice'))
            } else {
              setDoctor(null)
              setNotice(error?.message || getText(language, 'doctorNotFoundDescription'))
            }
          } else {
            setDoctor(localizeDoctor(language, makeDoctorFromRow(data)))
          }
        } catch (err) {
          if (active) {
            const fallbackDoctor = createFallbackDoctor(doctorId)
            if (fallbackDoctor) {
              setDoctor(localizeDoctor(language, fallbackDoctor))
              setNotice(`${getText(language, 'supplyNotice')} (${err instanceof Error ? err.message : 'Network error'})`)
            } else {
              setDoctor(null)
              setNotice(err instanceof Error ? err.message : getText(language, 'doctorNotFoundDescription'))
            }
          }
        }

        setLoading(false)
      }

    loadDoctor()

    return () => {
      active = false
    }
  }, [doctorId, language])

  return { doctor, loading, notice }
}

function useDoctorByCode(secretCode, language) {
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    const normalizedCode = String(secretCode || '').trim()

    if (!normalizedCode) {
      setDoctor(null)
      setLoading(false)
      setNotice('')
      return () => { active = false }
    }

    const loadDoctor = async () => {
      setLoading(true)
      setNotice('')

      try {
        const timer = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        const { data, error } = await Promise.race([
          supabase.from('doctors').select('*').eq('secret_code', normalizedCode).maybeSingle(),
          timer,
        ])

        if (!active) return

        if (error || !data) {
          const fallbackDoctor = createFallbackDoctorByCode(normalizedCode)
          if (fallbackDoctor) {
            setDoctor(localizeDoctor(language, fallbackDoctor))
            setNotice(error?.message ? `${getText(language, 'supplyNotice')} (${error.message})` : getText(language, 'supplyNotice'))
          } else {
            setDoctor(null)
            setNotice(getText(language, 'invalidDashboardCode'))
          }
        } else {
          setDoctor(localizeDoctor(language, makeDoctorFromRow(data)))
        }
      } catch (err) {
        if (active) {
          const fallbackDoctor = createFallbackDoctorByCode(normalizedCode)
          if (fallbackDoctor) {
            setDoctor(localizeDoctor(language, fallbackDoctor))
            setNotice(getText(language, 'supplyNotice'))
          } else {
            setDoctor(null)
            setNotice(err instanceof Error ? err.message : getText(language, 'invalidDashboardCode'))
          }
        }
      }

      if (active) setLoading(false)
    }

    loadDoctor()

    return () => { active = false }
  }, [secretCode, language])

  return { doctor, loading, notice }
}

function InfoPanel({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">{value || '—'}</p>
    </div>
  )
}

function VetClinicSimpleView({ doctor, ui }) {
  const navigate = useNavigate()
  const isAr = ui.language === 'ar'
  const team = doctor?.veterinary_team || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-[2rem] border border-emerald-400/25 bg-gradient-to-br from-slate-800/80 via-emerald-900/30 to-slate-800/80 p-8 shadow-[0_0_60px_rgba(16,185,129,0.12)] backdrop-blur-2xl">
        <div className="text-5xl mb-4">🐾</div>
        <p className="text-xs uppercase tracking-[0.45em] text-emerald-300 font-semibold">{isAr ? 'عيادة بيطرية' : 'Veterinary Clinic'}</p>
        <h1 className="mt-3 text-3xl font-bold text-white">{doctor?.name_ar || doctor?.name}</h1>
        <p className="mt-1 text-emerald-200 font-medium">{doctor?.specialty_ar || doctor?.specialty}</p>
        <p className="mt-4 text-sm text-slate-100 leading-relaxed">{doctor?.bio_ar || doctor?.bio}</p>
        {team.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300 font-semibold">{isAr ? 'الفريق الطبي' : 'Medical Team'}</p>
            {team.map((vet, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-900/20 px-4 py-3">
                <span className="font-semibold text-white">{vet.name_ar}</span>
                <span className="text-sm font-medium text-emerald-200">{vet.specialty_ar}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 space-y-2 text-sm text-slate-200">
          {doctor?.phone_number && <p><span className="inline-block w-6">📞</span> {doctor.phone_number}</p>}
          {doctor?.price && <p><span className="inline-block w-6">💰</span> {doctor.price}</p>}
          {doctor?.working_hours && <p><span className="inline-block w-6">🕐</span> {doctor.working_hours}</p>}
          {doctor?.working_days && <p><span className="inline-block w-6">📅</span> {doctor.working_days}</p>}
          {doctor?.payment_method && <p><span className="inline-block w-6">💳</span> {doctor.payment_method}</p>}
        </div>
        <div className="mt-6 flex gap-3">
          {doctor?.clinic_link && (
            <a href={doctor.clinic_link} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-emerald-400/30 bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:from-emerald-400 hover:to-emerald-500">
              📍 {isAr ? 'عرض على الخريطة' : 'View on Map'}
            </a>
          )}
          <button onClick={() => navigate('/')} className="rounded-xl border border-slate-500/30 bg-slate-700/50 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-600/50">
            ← {isAr ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DoctorProfilePage({ loading, notice, ui }) {
  const queryClient = useQueryClient()
  const t = key => getText(ui.language, key)
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { doctor, loading: doctorLoading, notice: doctorNotice } = useDoctorById(doctorId, ui.language)
  const { reviews, loading: reviewsLoading } = useReviewsByDoctorId(doctor?.id, ui.language)

  const reviewSummary = useMemo(() => buildReviewSummary(reviews), [reviews])
  const [guestName, setGuestName] = useState('')
  const [guestRating, setGuestRating] = useState(5)
  const [guestComment, setGuestComment] = useState('')
  const [guestSubmitting, setGuestSubmitting] = useState(false)
  const [guestNotice, setGuestNotice] = useState('')
  const clinicMapHref = doctor?.clinic_link || 'https://maps.app.goo.gl/hCyijNgYe1inGouk9'
  const specialtyVisual = useMemo(() => getSpecialtyVisual(doctor?.specialty), [doctor?.specialty])
  const clinicImages = useMemo(() => {
    if (Array.isArray(doctor?.clinic_images) && doctor.clinic_images.length) {
      return doctor.clinic_images.slice(0, 6)
    }
    return [
      'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
    ]
  }, [doctor?.clinic_images])

  const submitGuestReview = useCallback(async () => {
    if (!doctor?.id || guestSubmitting) {
      return
    }
    setGuestSubmitting(true)
    setGuestNotice('')
    const name = guestName.trim() || (ui.language === 'ar' ? 'مريض' : 'Patient')
    try {
      const { error } = await supabase.from('reviews').insert([
        {
          doctor_id: doctor.id,
          rating: guestRating,
          comment: guestComment.trim() || null,
          patient_name: name,
          appointment_id: null,
        },
      ])
      if (error) {
        saveLocalReview(
          createLocalReview({
            doctorId: doctor.id,
            appointmentId: 'profile-public',
            rating: guestRating,
            comment: guestComment.trim() || null,
            patientName: name,
          }),
        )
        setGuestNotice(t('reviewSavedLocal'))
      } else {
        setGuestNotice(ui.language === 'ar' ? 'تم حفظ تقييمك، شكراً.' : 'Your review was saved. Thank you.')
        setGuestComment('')
      }
      await queryClient.invalidateQueries({ queryKey: ['reviews', doctor.id] })
    } catch (err) {
      setGuestNotice(err instanceof Error ? err.message : '')
    } finally {
      setGuestSubmitting(false)
    }
  }, [doctor, guestSubmitting, guestName, guestRating, guestComment, queryClient, ui.language, t])

  if (!doctor) {
    return (
      <AppShell ui={ui}>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {loading || doctorLoading ? t('loadingProfile') : t('doctorNotFound')}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            {loading || doctorLoading
              ? t('loadingProfileFromDb')
              : doctorNotice || notice || t('doctorNotFoundDescription')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 rounded-2xl border border-cyan-300/25 bg-cyan-400/15 px-5 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-400/20 dark:text-cyan-100"
          >
            {t('returnHome')}
          </button>
        </div>
      </AppShell>
    )
  }

  const isVet = doctor.category === 'veterinary'
  const waitMinutes = doctor.wait_minutes != null && Number.isFinite(Number(doctor.wait_minutes)) ? Number(doctor.wait_minutes) : 24
  const paymentAside =
    ui.language === 'ar'
      ? doctor.payment_method || 'ادفع في العيادة — كاش أو شبكة'
      : doctor.payment_method_en || doctor.payment_method || 'Pay at clinic'

  return (
    <AppShell ui={ui}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            {t('backToDoctors')}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/book/${doctor.id}`)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_8px_30px_rgba(34,211,238,0.3)] transition hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {ui.language === 'ar' ? 'احجز الآن' : 'Book Now'}
          </button>
        </div>

        <section className="relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-950/90">
          <img
            src={specialtyVisual.image}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14] dark:opacity-[0.18]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/95 via-white/88 to-white dark:from-slate-950/92 dark:via-slate-950/88 dark:to-slate-950" />
          <div className="relative z-10 grid gap-8 p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className={`mx-auto flex h-40 w-40 shrink-0 overflow-hidden rounded-3xl border-4 border-white shadow-xl ring-2 sm:h-44 sm:w-44 lg:h-52 lg:w-52 ${
                isVet ? 'ring-amber-400/25 dark:ring-amber-400/30' : 'ring-cyan-400/20 dark:ring-cyan-400/25'
              }`}>
              {doctor.image_url ? (
                <img src={doctor.image_url} alt={doctor.name} className="h-full w-full object-cover" loading="eager" decoding="async" />
              ) : (
                <div className={`flex h-full w-full items-center justify-center text-4xl text-white ${
                  isVet
                    ? 'bg-gradient-to-br from-amber-400/35 to-orange-500/30'
                    : 'bg-gradient-to-br from-cyan-400/35 to-emerald-500/30'
                }`}>
                  🐾
                </div>
              )}
            </div>
            <div className="min-w-0 text-center lg:text-start rtl:lg:text-right">
              <p className={`text-xs uppercase tracking-[0.45em] ${
                isVet ? 'text-amber-600/90 dark:text-amber-200/90' : 'text-cyan-700/80 dark:text-cyan-200/80'
              }`}>{isVet ? (ui.language === 'ar' ? 'عيادة بيطرية' : 'Veterinary Clinic') : t('profileTitle')}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">{doctor.name}</h1>
              <p className={`mt-2 text-lg font-medium ${
                isVet ? 'text-amber-700 dark:text-amber-100/90' : 'text-cyan-700 dark:text-cyan-100/90'
              }`}>{doctor.specialty}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start rtl:lg:justify-end">
                <span className="rounded-full border border-emerald-300/40 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100">
                  {t('acceptingAppointments')}
                </span>
                {doctor.tele_consultation ? (
                  <span className="rounded-full border border-cyan-300/40 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-900 dark:bg-cyan-400/10 dark:text-cyan-100">
                    {ui.language === 'ar' ? 'استشارة تيليميديسين' : 'Telemedicine'}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                  {ui.language === 'ar' ? `وقت الانتظار تقريباً ${waitMinutes} دقيقة` : `~${waitMinutes} min wait`}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start rtl:lg:justify-end">
                <span className="rounded-xl border border-emerald-300/35 bg-emerald-50/90 px-3 py-2 text-xs font-semibold leading-snug text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-50">
                  {ui.language === 'ar' ? 'احجز أونلاين، ادفع في العيادة!' : 'Book online — pay at the clinic'}
                </span>
                <span className="rounded-xl border border-cyan-300/35 bg-cyan-50/90 px-3 py-2 text-xs font-semibold leading-snug text-cyan-900 dark:bg-cyan-400/10 dark:text-cyan-50">
                  {ui.language === 'ar' ? 'الدكتور يشترط الحجز المسبق!' : 'Advance booking required'}
                </span>
                <span className="rounded-xl border border-amber-300/35 bg-amber-50/90 px-3 py-2 text-xs font-semibold leading-snug text-amber-950 dark:bg-amber-400/10 dark:text-amber-50">
                  {ui.language === 'ar' ? 'الدخول بأسبقية الحضور بعد الحجز' : 'Queue by arrival after booking'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(280px,340px)]">
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-emerald-300/25 bg-emerald-50/80 p-5 dark:border-emerald-400/15 dark:bg-emerald-500/5">
              <p className="text-[11px] uppercase tracking-[0.32em] text-emerald-800/80 dark:text-emerald-200/80">{t('experience')}</p>
              <p className="mt-2 text-base font-semibold leading-relaxed text-emerald-950 dark:text-emerald-50">
                {doctor.experience || doctor.bio || getText(ui.language, 'doctorFallbackBio')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoPanel label={t('clinicLocation')} value={doctor.clinicLocation || (ui.language === 'ar' ? 'الجناح الرئيسي - هيهيا كير' : 'Hihya Care main wing')} />
              <InfoPanel label={t('price')} value={doctor.price} />
            </div>

            {isVet && doctor.secret_code ? (
              <div className="rounded-2xl border-2 border-amber-500/20 bg-gradient-to-r from-amber-500/15 to-orange-500/10 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.3em] font-bold text-amber-300">{ui.language === 'ar' ? 'كود الدخول للوحة التحكم' : 'Dashboard Access Code'}</p>
                <p className="mt-1 text-2xl font-bold tracking-widest text-white font-mono">{doctor.secret_code}</p>
                <p className="mt-1 text-xs text-amber-200/70">{ui.language === 'ar' ? 'استخدم هذا الكود لتسجيل الدخول إلى لوحة التحكم' : 'Use this code to log in to the dashboard'}</p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <a
                href={clinicMapHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-400/15 dark:text-cyan-100"
              >
                {t('clinicMapLink')}
              </a>
              <button
                type="button"
                onClick={() => navigate(`/dashboard${doctor.secret_code ? `?code=${doctor.secret_code}` : ''}`)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              >
                {t('dashboard')}
              </button>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-cyan-700/70 dark:text-cyan-200/70">
                {ui.language === 'ar' ? 'صور العيادة' : 'Clinic gallery'}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {clinicImages.map((imageUrl, index) => (
                  <div key={`${doctor.id}-clinic-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
                    <img
                      src={String(imageUrl)}
                      alt={ui.language === 'ar' ? `صورة العيادة ${index + 1}` : `Clinic ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover transition duration-200 hover:scale-[1.02]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-cyan-700/70 dark:text-cyan-200/70">
                {ui.language === 'ar' ? 'تعليقات وتقييمات' : 'Reviews'}
              </p>
              <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-slate-950/60">
                <div className="flex flex-wrap items-center gap-2">
                  <Star className="h-6 w-6 text-amber-400" fill="currentColor" />
                  <span className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {reviewSummary.total ? reviewSummary.average.toFixed(1) : '—'}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {ui.language === 'ar' ? `(${reviewSummary.total} تقييم)` : `(${reviewSummary.total} reviews)`}
                  </span>
                </div>

                <div className="mt-5 rounded-xl border border-dashed border-cyan-300/40 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {ui.language === 'ar' ? 'أضف تقييمك' : 'Leave a quick review'}
                  </p>
                  <input
                    type="text"
                    value={guestName}
                    onChange={event => setGuestName(event.target.value)}
                    placeholder={ui.language === 'ar' ? 'الاسم (اختياري)' : 'Name (optional)'}
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{t('reviewRatingLabel')}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={`guest-star-${star}`}
                          type="button"
                          onClick={() => setGuestRating(star)}
                          className="rounded p-0.5 transition hover:scale-110"
                          aria-label={`${star}`}
                        >
                          <Star className={`h-5 w-5 ${star <= guestRating ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={guestComment}
                    onChange={event => setGuestComment(event.target.value)}
                    placeholder={t('reviewCommentPlaceholder')}
                    rows={3}
                    className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                  />
                  <button
                    type="button"
                    disabled={guestSubmitting || !guestComment.trim()}
                    onClick={() => void submitGuestReview()}
                    className="mt-3 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {guestSubmitting ? t('reviewSubmitting') : t('reviewSubmit')}
                  </button>
                  {guestNotice ? <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-200">{guestNotice}</p> : null}
                </div>

                <div className="mt-5 space-y-3">
                  {reviewsLoading ? (
                    <p className="text-sm text-slate-500 dark:text-slate-300">{t('reviewLoading')}</p>
                  ) : reviews.length ? (
                    reviews.slice(0, 8).map(review => (
                      <div key={review.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{review.patient_name || t('reviewPatientFallback')}</p>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{formatTimeAgo(review.created_at, ui.language)}</span>
                        </div>
                        <div className="mt-1 flex gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={`${review.id}-s-${idx}`}
                              className={`h-3.5 w-3.5 ${idx < Math.round(review.rating || 0) ? 'fill-current' : ''}`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{review.comment || t('reviewCommentFallback')}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-300">{t('reviewEmpty')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg dark:border-white/10 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">{t('profileSignal')}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ui.language === 'ar' ? 'باقات الأسعار' : 'Pricing plans'}</p>
              <div className="mt-3 space-y-2">
                {getServicePrices(doctor.base_price).map(s => (
                  <div key={s.id} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${s.bgColor}`}>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                      <span>{s.icon}</span>
                      <span>{ui.language === 'ar' ? s.labelAr : s.labelEn}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {s.discount && (
                        <span className="text-[10px] text-slate-400 line-through">{s.originalPrice} {ui.language === 'ar' ? 'ج.م' : 'EGP'}</span>
                      )}
                      <span className={`text-sm font-bold ${s.color}`}>{s.price} <span className="text-[9px]">{ui.language === 'ar' ? 'ج.م' : 'EGP'}</span></span>
                      {s.discount && <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold text-white">-{s.discount}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{ui.language === 'ar' ? 'طريقة الدفع' : 'Payment'}</p>
              <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">{paymentAside}</p>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{t('clinicLocation')}</p>
              <p className="mt-1 flex items-start gap-2 text-base text-cyan-800 dark:text-cyan-100">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{doctor.clinicLocation || (ui.language === 'ar' ? 'هيهيا والشرقية' : 'Hihya & Sharqia')}</span>
              </p>
              <button
                type="button"
                onClick={() => navigate(`/book/${doctor.id}`)}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_12px_40px_rgba(34,211,238,0.25)] transition hover:-translate-y-0.5"
              >
                {t('bookNow')}
              </button>
              {doctor.phone_number ? (
                <a
                  href={`https://wa.me/${normalizePhoneForWa(doctor.phone_number)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/30 bg-emerald-50 py-3 text-sm font-semibold text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100"
                >
                  <MessageCircleMore className="h-4 w-4" aria-hidden />
                  {t('whatsapp')}
                </a>
              ) : null}
            </div>

            <div className="rounded-[1.5rem] border border-emerald-300/30 bg-emerald-50/90 p-4 text-sm text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-50">
              <p className="font-semibold">{ui.language === 'ar' ? 'تنبيه الحجز' : 'Booking policy'}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-relaxed opacity-95">
                <li>{ui.language === 'ar' ? 'اكتب الأعراض بدقة لضمان توجيه تخصصي أفضل.' : 'Describe symptoms clearly for better specialty guidance.'}</li>
                <li>{ui.language === 'ar' ? 'ادفع في العيادة بعد الكشف حسب سياسة الطبيب.' : 'Pay in clinic after consultation per doctor policy.'}</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  )
}

const SYMPTOM_SPECIALTY = [
  { keywords: ['صدر', 'قلب', 'نهجان', 'ضيق نفس', 'نبض', 'دقات'], specialty: 'قلب وأوعية دموية', specEn: 'Cardiology' },
  { keywords: ['بطن', 'جنب', 'يمين', 'يسار', 'سرة', 'تحت', 'ترجيع', 'غثيان', 'إسهال', 'سخونية', 'حرارة', 'حمى', 'كحة', 'برد', 'عطس'], specialty: 'باطنة', specEn: 'Internal Medicine' },
  { keywords: ['صداع', 'زغللة', 'دوخة', 'تنميل', 'شلل', 'رعشة'], specialty: 'مخ وأعصاب', specEn: 'Neurology' },
  { keywords: ['جلد', 'حكة', 'طفح', 'قشرة', 'شعر', 'ثعلبة', 'حساسية'], specialty: 'جلدية', specEn: 'Dermatology' },
  { keywords: ['عظم', 'مفصل', 'ركبة', 'قدم', 'يد', 'كتف', 'ظهر', 'رقبة'], specialty: 'عظام', specEn: 'Orthopedics' },
  { keywords: ['مثانة', 'بول', 'كلى', 'حصوات', 'تبول'], specialty: 'مسالك بولية', specEn: 'Urology' },
  { keywords: ['طفل', 'أطفال', 'رضيع', 'بيبي'], specialty: 'أطفال', specEn: 'Pediatrics' },
  { keywords: ['نفسية', 'قلق', 'اكتئاب', 'نفس'], specialty: 'طب نفسي', specEn: 'Psychiatry' },
  { keywords: ['جرح', 'قطع', 'تورم', 'ورم'], specialty: 'جراحة عامة', specEn: 'General Surgery' },
]

function findSpecialty(text) {
  const t = text.toLowerCase()
  for (const s of SYMPTOM_SPECIALTY) {
    if (s.keywords.some(k => t.includes(k))) return s
  }
  return null
}

function localTriageResponse(context, turns, doctors) {
  const userTexts = turns.filter(t => t.role === 'user').map(t => t.text.toLowerCase())

  const allUserText = userTexts.join(' ')

  const hasLocation = /(يمين|شمال|بطن|صدر|راس|قدم|يد|ركبة|ظهر|مثانة|حلق|عين|أذن)/i.test(allUserText)
  const hasAge = /\d+.*(سنة|سنه|عام|سن)/i.test(allUserText) || /(عمري|عمرى|سن).*\d+/i.test(allUserText)
  const hasDuration = /(ساعة|ساعات|يوم|أيام|شهر|شهور|أسبوع|اسبوع|دقائق|لحظة)/i.test(allUserText)
  const hasSeverity = /(شديدة|شديد|جامد|أوي|خفيف|متوسط|\d+\s*\/\s*10|10\/10|9\/10|8\/10|7\/10|لا يحتمل)/i.test(allUserText)

  const matched = findSpecialty(allUserText)

  const lastAskAt = (pattern) => {
    for (let i = turns.length - 1; i >= 0; i--)
      if (turns[i].role === 'assistant' && pattern.test(turns[i].text)) return i
    return -1
  }

  const repliedAfter = (askIdx) => askIdx >= 0 && turns.slice(askIdx + 1).some(t => t.role === 'user')

  const ageAskAt = lastAskAt(/(عمر|سن|كم.*سنة)/)
  const durAskAt = lastAskAt(/(من امتى|مدة|بقاله|بقالك)/)
  const sevAskAt = lastAskAt(/(شدة|قد إيه|1 لـ 10|1 إلى 10)/)

  const gotAge = hasAge || repliedAfter(ageAskAt)
  const gotDuration = hasDuration || repliedAfter(durAskAt)
  const gotSeverity = hasSeverity || repliedAfter(sevAskAt)
  const askedAge = ageAskAt >= 0
  const askedDuration = durAskAt >= 0
  const askedSeverity = sevAskAt >= 0

  const needToAskAge = !gotAge && !askedAge
  const needToAskDuration = !gotDuration && !askedDuration
  const needToAskSeverity = !gotSeverity && !askedSeverity

  const responses = {
    location: [
      'فين بالظبط المكان اللي بيوجعك؟',
      'حدد مكان الألم بالظبط.',
      'الألم فين في الجسم؟',
    ],
    age: [
      'عندك كام سنة؟',
      'كم عمرك؟',
      'سنك كام؟',
    ],
    duration: [
      'من امتى بالظبط والأعراض دي؟',
      'بقالك كام يوم كدا؟',
      'مدة الأعراض دي قد إيه؟',
    ],
    severity: [
      'قد إيه شدة الألم من 1 لـ 10؟',
      'حدد الشدة: خفيف ولا متوسط ولا شديد؟',
      'الألم درجة كام من 10؟',
    ],
  }

  function pick(arr, seed) {
    return arr[(userTexts.length + seed) % arr.length]
  }

  function buildRecommendation(specialty, reason) {
    const candidates = Array.isArray(doctors) ? pickCoordinatorDoctors(doctors, specialty) : []
    const first = candidates[0]
    const name = first?.name || ''
    const id = first?.id || null
    const answer = name
      ? `أرشحلك الدكتور ${name} (${specialty})`
      : `التخصص المناسب: ${specialty}`
    return {
      medical_answer: answer,
      specialty_hint: specialty,
      triage_complete: true,
      emergency_alert: false,
      recommended_doctor_id: id,
      recommended_doctor_name: name,
      missing_specialty_only: '',
      recommendation_reason: reason || `الأعراض تناسب ${specialty}`,
    }
  }

  if (!hasLocation && !matched) {
    return { medical_answer: pick(responses.location, 0), specialty_hint: '', triage_complete: false, emergency_alert: false, recommended_doctor_id: null, recommended_doctor_name: '', missing_specialty_only: '', recommendation_reason: '' }
  }

  if (needToAskAge) {
    return { medical_answer: pick(responses.age, 1), specialty_hint: matched?.specialty || '', triage_complete: false, emergency_alert: false, recommended_doctor_id: null, recommended_doctor_name: '', missing_specialty_only: '', recommendation_reason: '' }
  }

  if (needToAskDuration) {
    return { medical_answer: pick(responses.duration, 2), specialty_hint: matched?.specialty || '', triage_complete: false, emergency_alert: false, recommended_doctor_id: null, recommended_doctor_name: '', missing_specialty_only: '', recommendation_reason: '' }
  }

  if (needToAskSeverity) {
    return { medical_answer: pick(responses.severity, 3), specialty_hint: matched?.specialty || '', triage_complete: false, emergency_alert: false, recommended_doctor_id: null, recommended_doctor_name: '', missing_specialty_only: '', recommendation_reason: '' }
  }

  if (gotAge && gotDuration && gotSeverity && matched) {
    return buildRecommendation(matched.specialty, `الأعراض تناسب ${matched.specialty}`)
  }

  if (gotAge && gotDuration && gotSeverity) {
    return buildRecommendation('باطنة', 'الأعراض تحتاج تقييم باطنة')
  }

  return { medical_answer: 'تمام. عايز أعرف كمان التفاصيل: العمر، المدة، والشدة.', specialty_hint: matched?.specialty || '', triage_complete: false, emergency_alert: false, recommended_doctor_id: null, recommended_doctor_name: '', missing_specialty_only: '', recommendation_reason: '' }
}

function MedicalCoordinatorPanel({ ui, variant = 'compact' }) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [doctorsSnapshot, setDoctorsSnapshot] = useState([])
  const [snapshotLoading, setSnapshotLoading] = useState(true)
  const [chatTurns, setChatTurns] = useState([])

  useEffect(() => {
    let active = true

    const loadSnapshot = async () => {
      setSnapshotLoading(true)
      const { data } = await supabase
        .from('doctors')
        .select('*')
        .order('name', { ascending: true })

      if (active) {
        const rows = Array.isArray(data) ? data : []
        setDoctorsSnapshot(rows.map(row => ({ ...row, tele_consultation: Boolean(row.tele_consultation) })))
        setSnapshotLoading(false)
      }
    }

    loadSnapshot()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0)
      return undefined
    }
    const id = window.setInterval(() => {
      setLoadingStep(prev => (prev + 1) % 3)
    }, 750)
    return () => window.clearInterval(id)
  }, [loading])

  const onAsk = async event => {
    event.preventDefault()
    const trimmed = question.trim()
    if (!trimmed) {
      return
    }
    setQuestion('')
    const nextTurns = [...chatTurns, { role: 'user', text: trimmed }]
    setChatTurns(nextTurns)
    setResult(null)
    const mergedContext = nextTurns
      .map(turn => `${turn.role === 'user' ? 'المريض' : 'المساعد'}: ${turn.text}`)
      .join('\n')

    const geminiKey = String(import.meta.env.VITE_GEMINI_API_KEY || '').trim()
    const groqKey = String(import.meta.env.VITE_GROQ_API_KEY || '').trim()
    if (!geminiKey && !groqKey) {
      setError(
        ui.language === 'ar'
          ? 'أضف أحد المفتاحين في ملف .env ثم أعد تشغيل npm run dev: VITE_GEMINI_API_KEY (Google AI Studio) أو VITE_GROQ_API_KEY (Groq).'
          : 'Add VITE_GEMINI_API_KEY or VITE_GROQ_API_KEY to .env, then restart npm run dev.',
      )
      return
    }

    setLoading(true)
    setError('')

    try {
      const { system: sysPrompt, user: userPrompt } = buildMedicalCoordinatorJsonPrompt(mergedContext, doctorsSnapshot)

      let parsedResult = await fetchMedicalCoordinatorJson(sysPrompt, userPrompt)
      if (!parsedResult) {
        parsedResult = localTriageResponse(mergedContext, nextTurns, doctorsSnapshot)
      }

      const parsed = parsedResult
      const contextLower = mergedContext.toLowerCase()
      const hasAge = /\d+.*(سنة|سنه|عام|سن|age|yr|yo)/i.test(contextLower) || /(عمري|عمرى|عندي|عندى|سن).*\d+/i.test(contextLower)
      const hasDuration = /(من|مدة|منذ|عندي|عندى).*(يوم|ساعة|شهر|أسبوع|اسبوع|دقائق|سنة|سنه)/i.test(contextLower) || /\d+.*(day|hour|week|month)/i.test(contextLower)
      const hasSeverity = /(شدة|severity|degree|\d+\s*\/\s*10|10\/10|9\/10|8\/10|7\/10|6\/10|5\/10|4\/10|3\/10|2\/10|1\/10|لا يحتمل|مش قادر|تعبان|وجع.*جامد|وجع.*شديد|א|very painful|severe)/i.test(contextLower) || /(خفيف|متوسط|شديد|mild|moderate)/i.test(contextLower)
      const hasEnoughInfo = hasAge || hasDuration || hasSeverity
      const enoughTurns = chatTurns.length >= 3

      const aiAnswer = String(parsed?.medical_answer || '').trim()
      const specialtyHintRaw = String(parsed?.specialty_hint || parsed?.specialty || '').trim()
      const specialtyHint = specialtyHintRaw || ''
      const recommendationReason = String(parsed?.recommendation_reason || '').trim()
      const triageComplete = Boolean(parsed?.triage_complete) && hasEnoughInfo && enoughTurns
      const emergencyAlert = Boolean(parsed?.emergency_alert)
      const { doctors: recommendations, missingSpecialty } = resolveRecommendedDoctors(doctorsSnapshot, parsed)

      const finalDoctors = triageComplete ? recommendations : []
      const finalMissing = triageComplete ? missingSpecialty : ''
      const finalAnswer = aiAnswer || (ui.language === 'ar'
        ? 'أهلاً بيك. فهمت شكواك. عشان أقدر أساعدك بدقة، محتاج أعرف: العمر كام؟ ومن امتى الأعراض دي؟ وقد إيه شدتها من 1 لـ 10؟'
        : 'I understand your complaint. To help accurately, I need: your age, how long you\'ve had these symptoms, and their severity from 1-10?')

      setChatTurns(prev => [...prev, { role: 'assistant', text: finalAnswer }])
      setResult({
        specialty: specialtyHint,
        reason: recommendationReason,
        doctors: finalDoctors,
        missingSpecialty: finalMissing,
        triageComplete,
        emergencyAlert,
      })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to generate answer')
    } finally {
      setLoading(false)
    }
  }

  const loadingLabels = ui.language === 'ar'
    ? ['براجع الأعراض...', 'بربطها بالتخصصات...', 'بجهّز التوصية...']
    : ['Reviewing symptoms...', 'Matching specialties...', 'Preparing recommendation...']

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700/60 dark:bg-slate-900/95">
      <div className="flex items-center gap-2 mb-2">
        <Stethoscope className="size-4 text-emerald-500" aria-hidden />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-300">
          {ui.language === 'ar' ? 'د. شريف — الفرز الطبي' : 'Dr. Sherif — Medical Triage'}
        </p>
      </div>
      <p className="text-sm font-semibold text-slate-800 dark:text-white">
        {ui.language === 'ar' ? 'صف أعراضك وهرشحلك الدكتور المناسب' : 'Describe your symptoms, I\'ll recommend the right doctor'}
      </p>
      {snapshotLoading ? (
        <p className="mt-2 text-xs text-slate-400">{ui.language === 'ar' ? 'جارٍ تحميل بيانات الأطباء…' : 'Loading doctors…'}</p>
      ) : null}
      <form className="mt-3 space-y-2" onSubmit={onAsk}>
        <textarea
          value={question}
          onChange={event => setQuestion(event.target.value)}
          placeholder={ui.language === 'ar' ? 'اكتب أعراضك هنا...' : 'Write your symptoms here...'}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? loadingLabels[loadingStep] : (ui.language === 'ar' ? 'تحليل وترشيح' : 'Analyze & suggest')}
        </button>
      </form>

      {error ? (
        <p className="mt-3 rounded-xl border border-rose-400 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/40 dark:bg-rose-900/60 dark:text-rose-200">{error}</p>
      ) : null}

      {chatTurns.length ? (
        <div className="mt-4 max-h-[300px] space-y-2.5 overflow-y-auto pr-1">
          {chatTurns.map((turn, idx) => (
            <div
              key={`${turn.role}-${idx}-${turn.text.slice(0, 20)}`}
              className={`rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                turn.role === 'user'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-600/50 dark:bg-emerald-900/70 dark:text-emerald-50'
                  : 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600/50 dark:bg-slate-800/80 dark:text-gray-200'
              }`}
            >
              {turn.text}
            </div>
          ))}
        </div>
      ) : null}

      {result?.triageComplete ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-700/60 dark:bg-slate-900/95">
          {result.specialty ? (
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-600/50 dark:bg-emerald-900/60 dark:text-emerald-300">
                {result.specialty}
              </span>
              {result.emergencyAlert ? (
                <span className="rounded-md border border-rose-300 bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-800 dark:border-rose-600/50 dark:bg-rose-900/60 dark:text-rose-300">
                  طوارئ
                </span>
              ) : null}
            </div>
          ) : null}

          {result.reason ? (
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{result.reason}</p>
          ) : null}

          {result.emergencyAlert ? (
            <div className="mb-3 rounded-lg border border-rose-300 bg-rose-100 px-3 py-2 text-xs font-medium text-rose-800 dark:border-rose-600/50 dark:bg-rose-900/60 dark:text-rose-200">
              ⚠️ {ui.language === 'ar' ? 'لازم تتوجه لأقرب مستشفى فوراً' : 'Go to the nearest emergency room immediately'}
            </div>
          ) : result.missingSpecialty ? (
            <p className="mb-3 rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-xs text-amber-800 dark:border-amber-600/50 dark:bg-amber-900/60 dark:text-amber-200">
              {ui.language === 'ar'
                ? `ابدأ بباطنة عامة للفحوصات الأولية، ثم توجه لـ ${result.missingSpecialty}`
                : `Start with Internal Medicine, then proceed to ${result.missingSpecialty}`}
            </p>
          ) : result.doctors?.length ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {ui.language === 'ar' ? 'الأطباء المقترحون:' : 'Recommended doctors:'}
              </p>
              {result.doctors.map(doctor => (
                <div key={`rec-${doctor.id}`} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600/50 dark:bg-slate-800/80">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate dark:text-gray-100">{doctor.name}</p>
                      <p className="text-xs text-emerald-600/90 dark:text-emerald-400/90">{doctor.specialty}</p>
                      {doctor.secret_code ? (
                        <p className="mt-0.5 text-[11px] font-mono text-slate-400">كود: {doctor.secret_code}</p>
                      ) : null}
                      {doctor.price ? (
                        <p className="mt-0.5 text-xs text-slate-400">{ui.language === 'ar' ? `الكشف: ${doctor.price}` : `Fee: ${doctor.price}`}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Link
                      to={`/doctor/${doctor.id}`}
                      className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200 dark:border-slate-500/40 dark:bg-slate-700/60 dark:text-gray-200 dark:hover:bg-slate-700"
                    >
                      {ui.language === 'ar' ? 'عرض البروفايل' : 'View Profile'}
                    </Link>
                    <Link
                      to={`/book/${doctor.id}`}
                      className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:brightness-110"
                    >
                      {ui.language === 'ar' ? 'احجز الآن' : 'Book Now'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!result.emergencyAlert && result.doctors?.length ? (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {ui.language === 'ar'
                ? 'تقدر تشوف البروفايل أو تحجز موعد مباشرة من الأزرار فوق'
                : 'You can view the profile or book an appointment directly'}
            </p>
          ) : null}
        </div>
      ) : null}

    </div>
  )
}

function useAppointmentsByDoctorId(doctorId, language) {
  const appointmentsQuery = useQuery({
    queryKey: ['appointments', doctorId, language],
    enabled: Boolean(doctorId),
    placeholderData: () => {
      if (!doctorId) return { appointments: [], notice: '' }
      const local = getLocalAppointmentsForDoctor(doctorId).map((appt, i) => ({
        ...appt,
        id: appt.id || `local-${doctorId}-${i}`,
        status: appt.status || 'Pending',
        appointment_date: appt.appointment_date || appt.time || new Date().toISOString(),
        time: appt.time || '09:00',
      }))
      local.sort((a, b) => parseAppointmentDate(a).getTime() - parseAppointmentDate(b).getTime())
      return { appointments: local, notice: '' }
    },
    queryFn: async () => {
      if (!doctorId) {
        return { appointments: [], notice: '' }
      }

      try {
        const timer = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
        const { data, error } = await Promise.race([
          supabase
            .from('appointments')
            .select('id, patient_name, patient_phone, appointment_date, appointment_time, status, doctor_id, symptoms, patient_age, patient_gender')
            .eq('doctor_id', doctorId)
            .order('appointment_date', { ascending: true }),
          timer,
        ])

        if (!error && Array.isArray(data)) {
          const remoteAppointments = data.map((appointment, index) => {
            const atts = parseAppointmentAttachments(appointment.symptoms)
            return {
              ...appointment,
              id: appointment.id ?? `${appointment.doctor_id}-${index}`,
              status: appointment.status || 'Pending',
              appointment_date: appointment.appointment_date || new Date().toISOString(),
              appointment_time: appointment.appointment_time || '09:00',
              phone: appointment.patient_phone || '',
              fees: Number(appointment.fees ?? 0) || 0,
              symptoms: stripFileDataFromSymptoms(appointment.symptoms),
              attachments: atts.length ? atts : undefined,
            }
          })

          const localAppointments = getLocalAppointmentsForDoctor(doctorId).map((appointment, index) => ({
            ...appointment,
            id: appointment.id || `local-${doctorId}-${index}`,
            status: appointment.status || 'Pending',
            appointment_date: appointment.appointment_date || appointment.time || new Date().toISOString(),
            time: appointment.time || '09:00',
          }))

          const mergedAppointments = [...remoteAppointments]
          const existingIds = new Set(remoteAppointments.map(appointment => appointment.id))
          mergedAppointments.push(...localAppointments.filter(appointment => !existingIds.has(appointment.id)))
          mergedAppointments.sort((left, right) => parseAppointmentDate(left).getTime() - parseAppointmentDate(right).getTime())

          return { appointments: mergedAppointments, notice: '' }
        }
      } catch (_) {}

      const localAppointments = getLocalAppointmentsForDoctor(doctorId).map((appointment, index) => ({
        ...appointment,
        id: appointment.id || `local-${doctorId}-${index}`,
        status: appointment.status || 'Pending',
        appointment_date: appointment.appointment_date || appointment.time || new Date().toISOString(),
        time: appointment.time || '09:00',
      }))
      localAppointments.sort((left, right) => parseAppointmentDate(left).getTime() - parseAppointmentDate(right).getTime())
      return { appointments: localAppointments, notice: getText(language, 'appointmentsFallbackNotice') }
    },
    staleTime: 45_000,
    refetchInterval: 60_000,
  })

  const queryCache = useQueryClient()

  const setAppointments = updater => {
    queryCache.setQueryData(['appointments', doctorId, language], previous => {
      const currentAppointments = previous?.appointments || []
      const nextAppointments = typeof updater === 'function' ? updater(currentAppointments) : updater

      return {
        ...(previous || {}),
        appointments: nextAppointments,
      }
    })
  }

  useEffect(() => {
    if (!doctorId) return
    if (typeof supabase.channel !== 'function') return

    const channel = supabase
      .channel(`appointments-realtime-${doctorId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${doctorId}` },
        () => {
          queryCache.invalidateQueries({ queryKey: ['appointments', doctorId, language] })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [doctorId, language, queryCache])

  return {
    appointments: appointmentsQuery.data?.appointments || [],
    setAppointments,
    loading: appointmentsQuery.isLoading,
    notice: appointmentsQuery.data?.notice || '',
  }
}

function useReviewsByDoctorId(doctorId, language) {
  const reviewsQuery = useQuery({
    queryKey: ['reviews', doctorId, language],
    enabled: Boolean(doctorId),
    queryFn: async () => {
      if (!doctorId) {
        return { reviews: [], notice: '' }
      }

      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, appointment_id, doctor_id, patient_id, patient_name')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false })

      if (error || !Array.isArray(data)) {
        return {
          reviews: getLocalReviewsForDoctor(doctorId),
          notice: getText(language, 'reviewFallbackNotice'),
        }
      }

      const remoteReviews = data.map((review, index) => ({
        id: review.id ?? `review-${doctorId}-${index}`,
        rating: Number(review.rating) || 0,
        comment: review.comment ?? null,
        created_at: review.created_at ?? new Date().toISOString(),
        appointment_id: review.appointment_id ?? null,
        doctor_id: review.doctor_id ?? doctorId,
        patient_id: review.patient_id ?? null,
        patient_name: review.patient_name ?? null,
      }))

      const localReviews = getLocalReviewsForDoctor(doctorId)
      const mergedReviews = [...remoteReviews]
      const existingIds = new Set(remoteReviews.map(review => review.id))
      mergedReviews.push(...localReviews.filter(review => !existingIds.has(review.id)))

      mergedReviews.sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())

      return {
        reviews: mergedReviews,
        notice: '',
      }
    },
    staleTime: 120_000,
  })

  return {
    reviews: reviewsQuery.data?.reviews || [],
    loading: reviewsQuery.isLoading,
    notice: reviewsQuery.data?.notice || '',
  }
}

function useAppointmentById(appointmentId, language) {
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true

    const loadAppointment = async () => {
      if (!appointmentId) {
        setAppointment(null)
        setLoading(false)
        setNotice('')
        return
      }

      setLoading(true)
      setNotice('')

      const { data, error } = await supabase
        .from('appointments')
        .select('id, patient_name, phone, appointment_date, time, status, doctor_id')
        .eq('id', appointmentId)
        .maybeSingle()

      if (!active) {
        return
      }

      if (error || !data) {
        const localAppointment = getLocalAppointmentById(appointmentId)
        if (localAppointment) {
          setAppointment(localAppointment)
        } else {
          setAppointment(null)
          setNotice(error?.message || getText(language, 'reviewNotFound'))
        }
      } else {
        setAppointment({
          ...data,
          appointment_date: data.appointment_date || data.time || new Date().toISOString(),
          status: data.status || 'Pending',
        })
      }

      setLoading(false)
    }

    loadAppointment()

    return () => {
      active = false
    }
  }, [appointmentId, language])

  return { appointment, loading, notice }
}

function BookingPage({ doctorLookup, loading, notice, ui }) {
  const t = key => getText(ui.language, key)
  const { doctorId } = useParams()
  const location = useLocation()
  const slotParam = useMemo(() => new URLSearchParams(location.search).get('slot'), [location.search])
  const navigate = useNavigate()
  const queryCache = useQueryClient()
  const [patientName, setPatientName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [intakeData, setIntakeData] = useState({ age: '', gender: '', symptoms: '' })
  const [petType, setPetType] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [homeVisitAddress, setHomeVisitAddress] = useState('')
  const [homeVisitLocationLink, setHomeVisitLocationLink] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [appointmentDate, setAppointmentDate] = useState(() => {
    if (!slotParam) {
      return toDatetimeLocalValue(new Date())
    }

    const parsedDate = new Date(slotParam)
    if (Number.isNaN(parsedDate.getTime())) {
      return toDatetimeLocalValue(new Date())
    }

    return toDatetimeLocalValue(parsedDate)
  })
  const [status, setStatus] = useState('idle')
  const [feedback, setFeedback] = useState('')
  const [toast, setToast] = useState(null)
  const [session, setSession] = useState(null)
  const [bookingServiceType, setBookingServiceType] = useState(() => {
    try { const st = sessionStorage.getItem('hihya-service-type'); if (st === 'tele-consultation' || st === 'urgent-care' || st === 'clinic-visit' || st === 'home-visit') return st } catch {}
    return 'clinic-visit'
  })
  const [waConfirmed, setWaConfirmed] = useState(false)
  const [bookingData, setBookingData] = useState(null)
  const [syncStatus, setSyncStatus] = useState('synced') // 'synced' | 'syncing' | 'pending'

  const doctor = doctorId ? doctorLookup.get(doctorId) : null
  const selectedDoctor = doctor ? localizeDoctor(ui.language, doctor) : (doctorId ? localizeDoctor(ui.language, createFallbackDoctor(doctorId)) : null)
  const isVet = selectedDoctor?.category === 'veterinary'

  const servicePrices = useMemo(() => getServicePrices(selectedDoctor?.base_price), [selectedDoctor?.base_price])
  const serviceTypePrice = useMemo(() => {
    const found = servicePrices.find(s => s.id === bookingServiceType)
    return found || servicePrices[0]
  }, [bookingServiceType, servicePrices])

  const handleServiceTypeChange = useCallback((type) => {
    setBookingServiceType(type)
    setLocationError(null)
    try { sessionStorage.setItem('hihya-service-type', type) } catch {}
  }, [])

  const bookingServiceTypeToDb = bookingServiceType === 'tele-consultation' ? 'phone' : bookingServiceType === 'urgent-care' || bookingServiceType === 'home-visit' ? 'urgent' : 'normal'

  const isHomeVisit = bookingServiceType === 'home-visit'
  const trimmedAddr = homeVisitAddress.trim()
  const homeAddrLine = isHomeVisit && trimmedAddr ? `📍 العنوان: ${trimmedAddr}\n` : ''
  const homeMapLine = isHomeVisit && homeVisitLocationLink ? `🗺️ الخريطة: ${homeVisitLocationLink}\n` : ''
  const symptomsWa = symptoms.trim()
  const sympLine = symptomsWa ? `🩺 الأعراض: ${symptomsWa}\n` : ''
  const petLineWa = isVet ? (petType ? `🐾 النوع: ${petType === 'cat' ? 'قطة' : 'كلب'}\n` : '') + (patientName.trim() ? `🐾 الاسم: ${patientName.trim()}\n` : '') + (ownerName.trim() ? `👤 المالك: ${ownerName.trim()}\n` : '') : ''
  const baseMsg = `🔵 Hihya Care — حجز جديد\n━━━━━━━━━━━━━━━\n👨‍⚕️ الطبيب: ${selectedDoctor?.name}\n🏷️ التخصص: ${selectedDoctor?.specialty}\n📋 الخدمة: ${ui.language === 'ar' ? serviceTypePrice.labelAr : serviceTypePrice.labelEn}\n💰 السعر: ${serviceTypePrice.price} ج.م\n${petLineWa}${sympLine}${homeAddrLine}${homeMapLine}📅 التاريخ: ${appointmentDate}\n👤 الاسم: ${patientName}\n📞 الهاتف: ${phoneNumber}\n━━━━━━━━━━━━━━━\n✅ الرجاء تأكيد الحجز`
  const whatsappMessage = baseMsg

  const whatsappLink = selectedDoctor?.phone_number
    ? `https://wa.me/${normalizePhoneForWa(selectedDoctor.phone_number)}?text=${encodeURIComponent(whatsappMessage)}`
    : ''

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => setToast(null), 4200)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  // Start Supabase retry scheduler
  useEffect(() => startRetryScheduler(), [])

  // Periodically check sync status
  useEffect(() => {
    const id = setInterval(() => {
      const queue = readRetryQueue()
      setSyncStatus(queue.length > 0 ? 'pending' : 'synced')
    }, 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!slotParam) {
      return
    }

    const parsedDate = new Date(slotParam)
    if (Number.isNaN(parsedDate.getTime())) {
      return
    }

    setAppointmentDate(toDatetimeLocalValue(parsedDate))
  }, [slotParam])

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (active) {
        setSession(data?.session || null)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession || null)
      }
    })

    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  const handleSubmit = async event => {
    event.preventDefault()

    if (!doctorId || !selectedDoctor) {
      setStatus('error')
      setFeedback(ui.language === 'ar' ? 'بيانات الطبيب ما زالت تُحمّل. حاول مرة أخرى بعد لحظات.' : 'Doctor data is still loading. Please try again in a moment.')
      return
    }

    const trimmedName = isVet ? patientName.trim() : patientName.trim()
    const trimmedPhone = phoneNumber.trim()
    const trimmedAppointmentDate = appointmentDate.trim()
    const trimmedOwner = isVet ? ownerName.trim() : ''
    const petTypeLabel = isVet && petType ? (petType === 'cat' ? (ui.language === 'ar' ? 'قطة' : 'Cat') : (ui.language === 'ar' ? 'كلب' : 'Dog')) : ''

    const trimmedAddress = homeVisitAddress.trim()
    const nameForDisplay = isVet && trimmedOwner ? trimmedOwner : trimmedName
    const nameRequired = isVet ? (!trimmedName || !trimmedPhone || !trimmedAppointmentDate) : (!trimmedName || !trimmedPhone || !trimmedAppointmentDate)

    if (nameRequired) {
      setStatus('error')
      setFeedback(
        ui.language === 'ar'
          ? (isVet ? 'يرجى إدخال اسم الحيوان ورقم الهاتف وتاريخ الموعد.' : 'يرجى إدخال اسم المريض ورقم الهاتف وتاريخ الموعد.')
          : 'Please enter the patient name, phone number, and appointment date.',
      )
      return
    }

    const isHomeVisit = bookingServiceType === 'home-visit'
    if (isHomeVisit && !trimmedAddress) {
      setStatus('error')
      setFeedback(ui.language === 'ar' ? 'يرجى إدخال عنوان الزيارة المنزلية.' : 'Please enter the home visit address.')
      return
    }

    const appointmentIso = datetimeLocalInputToISO(trimmedAppointmentDate)
    if (!appointmentIso) {
      setStatus('error')
      setFeedback(
        ui.language === 'ar'
          ? 'تاريخ أو وقت الموعد غير صالح. رجاءً اختر تاريخًا ووقتًا صحيحين.'
          : 'The appointment date or time is invalid. Please pick a valid slot.',
      )
      return
    }

    const trimmedSymptoms = symptoms.trim()
    const appointmentTime = appointmentIso ? appointmentIso.slice(11, 16) : null
    const attachmentNames = uploadedFiles.map(f => f.name)
    const attachments = await filesToAttachments(uploadedFiles)
    const patientNameForDb = isVet && trimmedOwner ? trimmedOwner : trimmedName
    const localAppointment = createLocalAppointment(doctorId, patientNameForDb, trimmedPhone, appointmentIso, trimmedSymptoms)
    if (isVet) {
      localAppointment.pet_name = trimmedName
      localAppointment.pet_type = petTypeLabel
      localAppointment.owner_name = trimmedOwner
    }
    localAppointment.attachments = attachments
    localAppointment.patient_age = intakeData.age
    localAppointment.patient_gender = intakeData.gender
    localAppointment.intake_symptoms = intakeData.symptoms

    // Save locally FIRST so dashboard always sees it
    saveLocalAppointment(localAppointment)
    void queryCache.invalidateQueries({ queryKey: ['appointments', doctorId] })

    setStatus('loading')
    setFeedback(ui.language === 'ar' ? 'جارٍ تأكيد الموعد...' : 'Securing appointment...')

    // Build Supabase payload
    const buildSupabasePayload = () => {
      const symptomsParts = [
        intakeData.age ? `العمر: ${intakeData.age}` : '',
        intakeData.gender ? `النوع: ${intakeData.gender}` : '',
        isHomeVisit && trimmedAddress ? `📍 العنوان: ${trimmedAddress}` : '',
        trimmedSymptoms,
        attachmentNames.length ? `📎 ${attachmentNames.join(', ')}` : '',
      ]
      if (attachments.length) {
        symptomsParts.push('__FILES__' + attachments.map(a => encodeURIComponent(JSON.stringify({ name: a.name, data: a.data, size: a.size }))).join('||'))
      }
      if (isVet) {
        const petInfo = [petTypeLabel && `النوع: ${petTypeLabel}`, trimmedName && `الحيوان: ${trimmedName}`, trimmedOwner && `صاحب الحيوان: ${trimmedOwner}`].filter(Boolean).join(' | ')
        symptomsParts.unshift(petInfo)
      }
      symptomsParts.unshift(`[SERVICE_TYPE:${bookingServiceTypeToDb}]`)
      const payload = {
        patient_name: patientNameForDb,
        patient_phone: trimmedPhone,
        doctor_id: doctorId,
        patient_id: session?.user?.id ?? null,
        appointment_date: appointmentIso,
        appointment_time: appointmentTime,
        status: 'Pending',
        symptoms: symptomsParts.filter(Boolean).join('\n') || null,
      }
      if (isVet && trimmedOwner) payload.owner_name = trimmedOwner
      if (intakeData.age) payload.patient_age = intakeData.age
      if (intakeData.gender) payload.patient_gender = intakeData.gender
      return payload
    }

    // Try save to Supabase — if fails, add to retry queue
    const supabasePayload = buildSupabasePayload()
    try {
      const { error } = await supabase.from('appointments').insert([supabasePayload])
      if (error) {
        if (error.message?.includes('patient_age') || error.message?.includes('patient_gender')) {
          delete supabasePayload.patient_age; delete supabasePayload.patient_gender
          const { error: retryErr } = await supabase.from('appointments').insert([supabasePayload])
          if (retryErr) { enqueueRetry(supabasePayload); setSyncStatus('pending'); console.error('[Booking] Queued for retry:', retryErr) }
        } else {
          enqueueRetry(supabasePayload); setSyncStatus('pending')
          console.error('[Booking] Queued for retry:', error)
        }
      }
    } catch (supaErr) {
      enqueueRetry(supabasePayload); setSyncStatus('pending')
      console.error('[Booking] Exception — queued for retry:', supaErr)
    }

    const whatsappApiUrl = String(import.meta.env.VITE_WHATSAPP_API_URL || '').trim()
    if (selectedDoctor.phone_number && whatsappApiUrl) {
      const payload = JSON.stringify({
        doctor_id: selectedDoctor.id,
        doctor_name: selectedDoctor.name,
        doctor_phone: selectedDoctor.phone_number,
        patient_name: trimmedName,
        patient_phone: trimmedPhone,
        appointment_date: appointmentIso,
        service_type: bookingServiceTypeToDb,
        message: `New ${bookingServiceTypeToDb} booking from ${trimmedName} for ${selectedDoctor.name}`,
      })
      const signal =
        typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
          ? AbortSignal.timeout(4000)
          : undefined
      void fetch(whatsappApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        ...(signal ? { signal } : {}),
      }).catch(() => {})
    }

    const navPayload = {
      patientName: patientNameForDb,
      patientPhone: trimmedPhone,
      appointmentIso,
      doctorId,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      clinicAddress: selectedDoctor.clinicLocation || '',
      clinicPhone: selectedDoctor.phone_number || '',
      mapsUrl: selectedDoctor.clinic_link || 'https://maps.app.goo.gl/hCyijNgYe1inGouk9',
      bookingRef: `HC-${Date.now().toString(36).toUpperCase()}`,
      serviceType: bookingServiceTypeToDb,
      servicePrice: serviceTypePrice.price,
      ...(isHomeVisit && trimmedAddress ? { homeAddress: trimmedAddress } : {}),
      ...(isHomeVisit && homeVisitLocationLink ? { homeAddressLink: homeVisitLocationLink } : {}),
      ...(isVet ? { petName: trimmedName, petType: petTypeLabel } : {}),
    }

    // Phone/urgent bookings require mandatory WhatsApp confirmation first
    if (bookingServiceTypeToDb === 'phone' || bookingServiceTypeToDb === 'urgent') {
      setBookingData(navPayload)
      setStatus('wa-pending')
      setFeedback(ui.language === 'ar' ? '📲 يرجى تأكيد الحجز عبر واتساب' : '📲 Please confirm booking via WhatsApp')
    } else {
      navigate('/booking-success', { state: navPayload })
    }
  }

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const isWaPending = status === 'wa-pending'

  return (
    <AppShell ui={ui}>
      <div className="fixed right-4 top-4 z-50 w-[min(92vw,24rem)]">
        {toast ? (
          <div
            className={`rounded-3xl border px-4 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl transition-all duration-300 ${
              toast.tone === 'success'
                ? 'border-emerald-300/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-50'
                : 'border-amber-300/40 bg-amber-50 text-amber-900 dark:bg-amber-400/10 dark:text-amber-50'
            }`}
            role="status"
            aria-live="polite"
          >
            <p className="text-xs uppercase tracking-[0.32em] opacity-70">{toast.title}</p>
            <p className="mt-2 text-sm leading-6">{toast.message}</p>
          </div>
        ) : null}
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-700/70 dark:text-cyan-200/70">{t('bookingPortal')}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">
            {t('bookingTitle', selectedDoctor ? selectedDoctor.name : null)}
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {t('bookingIntro')}
          </p>
          {loading ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {t('loadingProfile')}
            </div>
          ) : notice ? (
            <div className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100">
              {notice}
            </div>
          ) : null}
          {selectedDoctor ? (
            <div className="mt-6 rounded-3xl border border-cyan-300/15 bg-slate-50 p-5 dark:bg-slate-950/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('selectedDoctor')}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{selectedDoctor.name}</p>
              <p className="mt-2 text-cyan-700/80 dark:text-cyan-100/80">{selectedDoctor.specialty}</p>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{selectedDoctor.clinicLocation}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{selectedDoctor.bio || t('doctorFallbackBio')}</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => navigate(selectedDoctor ? `/doctor/${selectedDoctor.id}` : '/')}
            className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
          >
            {t('backToProfile')}
          </button>
        </div>

        <div className="rounded-[2rem] border border-cyan-300/20 bg-white p-4 shadow-[0_0_120px_rgba(34,211,238,0.12)] backdrop-blur-2xl transition-colors duration-300 dark:bg-white/5 sm:p-6">
          <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:border-white/10 dark:bg-slate-950/60 sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-cyan-700/70 dark:text-cyan-200/70">Hihya Care</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white sm:text-4xl">
                  {ui.language === 'ar' ? 'تأكيد الحجز' : 'Secure the booking.'}
                </h2>
              </div>
              <div className="rounded-full border border-emerald-400/30 bg-emerald-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
                Live Intake
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {/* reserved for live intake metrics */}
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {/* Service Type Selector */}
              <div className="rounded-2xl border border-cyan-300/20 bg-white/80 p-4 dark:bg-slate-950/60">
                <p className="mb-3 text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
                  {ui.language === 'ar' ? 'اختر نوع الخدمة' : 'Choose service type'}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {servicePrices.map(opt => {
                    const isActive = bookingServiceType === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleServiceTypeChange(opt.id)}
                        className={`relative rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                          isActive ? opt.bgColor + ' shadow-lg' : 'border-white/20 bg-white/40 hover:border-white/40 dark:border-white/10 dark:bg-white/5'
                        }`}
                      >
                        <span className="block text-lg">{opt.icon}</span>
                        <span className={`mt-1 block text-[11px] font-semibold ${isActive ? opt.color : 'text-slate-600 dark:text-slate-300'}`}>
                          {ui.language === 'ar' ? opt.labelAr : opt.labelEn}
                        </span>
                        {opt.discount && isActive ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="mt-0.5 text-[9px] text-slate-400 line-through">{opt.originalPrice} {ui.language === 'ar' ? 'ج.م' : 'EGP'}</span>
                            <span className={`mt-0.5 block text-[10px] font-bold ${opt.color}`}>{opt.price} {ui.language === 'ar' ? 'ج.م' : 'EGP'}</span>
                          </div>
                        ) : (
                          <span className={`mt-0.5 block text-[10px] font-bold ${isActive ? opt.color : 'text-slate-500'}`}>
                            {opt.price} {ui.language === 'ar' ? 'ج.م' : 'EGP'}
                          </span>
                        )}
                        {isActive && opt.discount && (
                          <span className="absolute -top-1.5 -left-1.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold text-white">{opt.discount} خصم</span>
                        )}
                        {isActive && opt.badge && (
                          <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.1em] text-amber-400">{opt.badge}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <div className={`mt-3 flex items-center justify-between rounded-xl border px-4 py-2 ${
                  bookingServiceType === 'tele-consultation' ? 'border-emerald-400/30 bg-emerald-500/10'
                  : bookingServiceType === 'urgent-care' ? 'border-amber-400/30 bg-amber-500/10'
                  : bookingServiceType === 'home-visit' ? 'border-rose-400/30 bg-rose-500/10'
                  : 'border-cyan-400/20 bg-cyan-500/10'
                }`}>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {ui.language === 'ar' ? 'السعر النهائي:' : 'Final price:'}
                  </span>
                  <div className="flex items-center gap-2">
                    {serviceTypePrice.discount && (
                      <span className="text-xs text-slate-400 line-through">{serviceTypePrice.originalPrice} {ui.language === 'ar' ? 'ج.م' : 'EGP'}</span>
                    )}
                    <span className={`text-base font-bold ${
                      bookingServiceType === 'tele-consultation' ? 'text-emerald-600 dark:text-emerald-300'
                      : bookingServiceType === 'urgent-care' ? 'text-amber-600 dark:text-amber-200'
                      : bookingServiceType === 'home-visit' ? 'text-rose-600 dark:text-rose-200'
                      : 'text-cyan-600 dark:text-cyan-200'
                    }`}>
                      {serviceTypePrice.icon} {serviceTypePrice.price} <span className="text-xs">{ui.language === 'ar' ? 'ج.م' : 'EGP'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Home Visit Address — required when service is home-visit */}
              {bookingServiceType === 'home-visit' ? (
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-rose-600 dark:text-rose-300">
                      {ui.language === 'ar' ? '📍 عنوان الزيارة المنزلية *' : '📍 Home visit address *'}
                    </span>
                    <div className="group rounded-2xl border border-rose-300/20 bg-white px-4 py-3 transition-all duration-300 focus-within:border-rose-300/60 focus-within:shadow-[0_0_0_1px_rgba(244,63,94,0.2),0_0_35px_rgba(244,63,94,0.16)] dark:bg-slate-950/70">
                      <textarea
                        className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 resize-none"
                        value={homeVisitAddress}
                        onChange={event => setHomeVisitAddress(event.target.value)}
                        placeholder={ui.language === 'ar' ? 'اكتب العنوان بالتفصيل (شارع، مدينة، بجانب إيه)' : 'Enter your full address (street, city, landmark)'}
                        rows={2}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </label>

                  {/* Share Location Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        setToast({ title: ui.language === 'ar' ? 'خطأ' : 'Error', message: ui.language === 'ar' ? 'متصفحك لا يدعم مشاركة الموقع' : 'Your browser does not support location sharing', tone: 'error' })
                        return
                      }
                      setIsLocating(true)
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const lat = pos.coords.latitude
                          const lng = pos.coords.longitude
                          const link = `https://www.google.com/maps?q=${lat},${lng}`
                          setHomeVisitLocationLink(link)
                          setIsLocating(false)
                          setLocationError(null)
                          setToast({ title: ui.language === 'ar' ? 'تم' : 'Done', message: ui.language === 'ar' ? '✅ تم الحصول على الموقع بنجاح' : '✅ Location obtained successfully', tone: 'success' })
                        },
                        (err) => {
                          setIsLocating(false)
                          if (err.code === 1) {
                            setLocationError('permission')
                            setToast({ title: ui.language === 'ar' ? 'إذن الموقع' : 'Location permission', message: ui.language === 'ar' ? '⚠️ تم رفض إذن الموقع — الرجاء السماح بالوصول للموقع من إعدادات المتصفح' : '⚠️ Location permission denied — please allow location access in browser settings', tone: 'error' })
                          } else if (err.code === 2) {
                            setLocationError('disabled')
                            setToast({ title: ui.language === 'ar' ? 'GPS غير مفعل' : 'GPS disabled', message: ui.language === 'ar' ? '❌ GPS غير مفعل — يرجى تشغيل تحديد الموقع من الإعدادات' : '❌ GPS is off — please enable location services in settings', tone: 'error' })
                          } else {
                            setLocationError('timeout')
                            setToast({ title: ui.language === 'ar' ? 'انتهت المهلة' : 'Timeout', message: ui.language === 'ar' ? '❌ لم يتم الحصول على الموقع — حاول مرة أخرى أو اكتب العنوان يدوياً' : '❌ Could not get location — try again or enter address manually', tone: 'error' })
                          }
                        },
                        { enableHighAccuracy: true, timeout: 15000 },
                      )
                    }}
                    disabled={isLocating || isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-500/20 disabled:opacity-50 dark:text-rose-300"
                  >
                    {isLocating ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600/25 border-t-rose-600 dark:border-rose-300/25 dark:border-t-rose-300" />
                        {ui.language === 'ar' ? 'جارٍ تحديد الموقع...' : 'Getting location...'}
                      </>
                    ) : (
                      <>
                        <span>📍</span>
                        {ui.language === 'ar' ? 'مشاركة الموقع الحالي' : 'Share current location'}
                      </>
                    )}
                  </button>

                  {/* Location Error — Help user fix it */}
                  {locationError ? (
                    <div className="rounded-xl border border-rose-300/40 bg-rose-500/10 p-3">
                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">
                        {ui.language === 'ar' ? '📍 تفعيل الموقع' : '📍 Enable location'}
                      </p>
                      <p className="mt-1 text-[11px] text-rose-600/80 dark:text-rose-300/80">
                        {locationError === 'permission'
                          ? (ui.language === 'ar'
                              ? 'الرجاء السماح للموقع بالوصول إلى موقعك:'
                              : 'Please allow the site to access your location:')
                          : (ui.language === 'ar'
                              ? 'يرجى تفعيل GPS من الإعدادات:'
                              : 'Please enable GPS in settings:')}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            // iOS: try App-Prefs, Android: try settings intent
                            window.open('App-Prefs:root=Privacy&path=LOCATION', '_blank')
                            window.open('intent://settings/#Intent;action=android.settings.LOCATION_SOURCE_SETTINGS;end', '_blank')
                          }}
                          className="rounded-lg border border-rose-300/30 bg-rose-500/15 px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-500/25 dark:text-rose-300"
                        >
                          ⚙️ {ui.language === 'ar' ? 'فتح الإعدادات' : 'Open Settings'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocationError(null)}
                          className="rounded-lg border border-slate-300/30 bg-slate-500/10 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-500/20 dark:text-slate-300"
                        >
                          {ui.language === 'ar' ? 'تجاهل' : 'Dismiss'}
                        </button>
                      </div>
                      <p className="mt-2 text-[10px] text-rose-500/70 dark:text-rose-300/70">
                        {ui.language === 'ar'
                          ? '💡 الإعدادات > الخصوصية > خدمات الموقع > تفعيل للمتصفح'
                          : '💡 Settings > Privacy > Location Services > Enable for browser'}
                      </p>
                    </div>
                  ) : null}

                  {/* Show maps link if shared */}
                  {homeVisitLocationLink ? (
                    <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">
                            {ui.language === 'ar' ? '🗺️ رابط الموقع' : '🗺️ Location link'}
                          </p>
                          <a href={homeVisitLocationLink} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs font-medium text-emerald-700 underline hover:text-emerald-900 dark:text-emerald-200 dark:hover:text-emerald-100">
                            {homeVisitLocationLink}
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setHomeVisitLocationLink(''); setToast({ title: ui.language === 'ar' ? 'تم' : 'Done', message: ui.language === 'ar' ? 'تم إزالة رابط الموقع' : 'Location link removed', tone: 'success' }) }}
                          className="shrink-0 rounded-lg border border-rose-300/30 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-500 hover:bg-rose-500/20 dark:text-rose-300"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <span className="block text-[10px] text-rose-500 dark:text-rose-400">
                    {ui.language === 'ar' ? '⚠️ مطلوب — العنوان أو مشاركة الموقع سيتم إرسالهم في واتساب للطبيب' : '⚠️ Required — address or shared location will be sent to the doctor via WhatsApp'}
                  </span>
                </div>
              ) : null}

              {isVet ? (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-amber-600 dark:text-amber-300">{ui.language === 'ar' ? 'نوع الحيوان' : 'Pet Type'}</span>
                    <div className="group rounded-2xl border border-amber-300/20 bg-white px-4 py-3 dark:bg-slate-950/70">
                      <select
                        value={petType}
                        onChange={event => setPetType(event.target.value)}
                        className="w-full bg-transparent text-base text-slate-900 outline-none dark:text-white"
                        disabled={isLoading}
                      >
                        <option value="">{ui.language === 'ar' ? '— اختر النوع —' : '— Select type —'}</option>
                        <option value="cat">{ui.language === 'ar' ? 'قطة' : 'Cat'}</option>
                        <option value="dog">{ui.language === 'ar' ? 'كلب' : 'Dog'}</option>
                      </select>
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-amber-600 dark:text-amber-300">{ui.language === 'ar' ? 'اسم الحيوان الأليف' : 'Pet Name'}</span>
                    <div className="group rounded-2xl border border-amber-300/20 bg-white px-4 py-3 transition-all duration-300 focus-within:border-amber-300/60 focus-within:shadow-[0_0_0_1px_rgba(251,191,36,0.2),0_0_35px_rgba(251,191,36,0.16)] dark:bg-slate-950/70">
                      <input
                        className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                        value={patientName}
                        onChange={event => setPatientName(event.target.value)}
                        placeholder={ui.language === 'ar' ? 'اسم القطة أو الكلب...' : 'Pet name...'}
                        spellCheck={false}
                        disabled={isLoading}
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-amber-600 dark:text-amber-300">{ui.language === 'ar' ? 'اسم صاحب الحيوان' : 'Owner Name'}</span>
                    <div className="group rounded-2xl border border-amber-300/20 bg-white px-4 py-3 transition-all duration-300 focus-within:border-amber-300/60 focus-within:shadow-[0_0_0_1px_rgba(251,191,36,0.2),0_0_35px_rgba(251,191,36,0.16)] dark:bg-slate-950/70">
                      <input
                        className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                        value={ownerName}
                        onChange={event => setOwnerName(event.target.value)}
                        placeholder={ui.language === 'ar' ? 'اسم صاحب الحيوان...' : 'Owner name...'}
                        autoComplete="name"
                        spellCheck={false}
                        disabled={isLoading}
                      />
                    </div>
                  </label>
                </>
              ) : (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('bookingPatientName')}</span>
                  <div className="group rounded-2xl border border-cyan-300/15 bg-white px-4 py-3 transition-all duration-300 focus-within:border-cyan-300/60 focus-within:shadow-[0_0_0_1px_rgba(103,232,249,0.2),0_0_35px_rgba(34,211,238,0.16)] dark:bg-slate-950/70">
                    <input
                      className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                      value={patientName}
                      onChange={event => setPatientName(event.target.value)}
                      placeholder={t('bookingPlaceholderName')}
                      autoComplete="name"
                      spellCheck={false}
                      disabled={isLoading}
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('bookingPhone')}</span>
                <div className="group rounded-2xl border border-cyan-300/15 bg-white px-4 py-3 transition-all duration-300 focus-within:border-cyan-300/60 focus-within:shadow-[0_0_0_1px_rgba(103,232,249,0.2),0_0_35px_rgba(34,211,238,0.16)] dark:bg-slate-950/70">
                  <input
                    className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                    value={phoneNumber}
                    onChange={event => setPhoneNumber(event.target.value)}
                    placeholder={t('bookingPlaceholderPhone')}
                    autoComplete="tel"
                    inputMode="tel"
                    disabled={isLoading}
                  />
                </div>
              </label>

              <label className="block">
                <span className={`mb-2 block text-sm font-medium ${isVet ? 'text-amber-600 dark:text-amber-300' : 'text-slate-700 dark:text-slate-200'}`}>{ui.language === 'ar' ? 'الأعراض (اختياري)' : 'Symptoms (optional)'}</span>
                <div className={`group rounded-2xl border px-4 py-3 transition-all duration-300 focus-within:shadow-[0_0_0_1px_rgba(103,232,249,0.2),0_0_35px_rgba(34,211,238,0.16)] dark:bg-slate-950/70 ${
                  isVet
                    ? 'border-amber-300/20 focus-within:border-amber-300/60 bg-white'
                    : 'border-cyan-300/15 focus-within:border-cyan-300/60 bg-white'
                }`}>
                  <textarea
                    className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 resize-none"
                    value={symptoms}
                    onChange={event => setSymptoms(event.target.value)}
                    placeholder={isVet ? (ui.language === 'ar' ? 'صف أعراض الحيوان...' : 'Describe the pet symptoms...') : (ui.language === 'ar' ? 'صِف الأعراض التي تشعر بها...' : 'Describe your symptoms...')}
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('bookingAppointmentDate')}</span>
                <div className="group rounded-2xl border border-cyan-300/15 bg-white px-4 py-3 transition-all duration-300 focus-within:border-cyan-300/60 focus-within:shadow-[0_0_0_1px_rgba(103,232,249,0.2),0_0_35px_rgba(34,211,238,0.16)] dark:bg-slate-950/70">
                  <input
                    className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                    value={appointmentDate}
                    onChange={event => setAppointmentDate(event.target.value)}
                    placeholder={t('bookingPlaceholderDate')}
                    type="datetime-local"
                    disabled={isLoading}
                  />
                </div>
                <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400">{t('bookingDateHint')}</span>
              </label>

              {selectedDoctor ? (
                <MedicalFileUploader
                  variant="compact"
                  language={ui.language === 'ar' ? 'ar' : 'en'}
                  whatsappPhone={selectedDoctor.phone_number || ''}
                  patientName={patientName}
                  doctorName={selectedDoctor.name}
                  onFilesChange={setUploadedFiles}
                  onIntakeChange={setIntakeData}
                />
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className={`group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border px-5 py-4 text-sm font-semibold shadow-[0_10px_40px_rgba(34,211,238,0.28)] transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 dark:focus:ring-offset-slate-950 ${
                  isVet
                    ? 'border-amber-400/30 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/20 hover:shadow-[0_16px_60px_rgba(251,191,36,0.36)] focus:ring-amber-200/70'
                    : 'border-cyan-300/25 bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 text-slate-950 hover:shadow-[0_16px_60px_rgba(34,211,238,0.36)] focus:ring-cyan-200/70'
                }`}
              >
                <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.45),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/25 border-t-slate-950" />
                    {t('finalizingBooking')}
                  </>
                ) : (
                  <>
                    <span>{t('confirmBooking')}</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                  </>
                )}
              </button>
            </form>

            <div
              className={`mt-6 overflow-hidden rounded-2xl border px-4 py-4 transition-all duration-500 ${
                isSuccess
                  ? 'border-emerald-300/40 bg-emerald-400/10 shadow-[0_0_30px_rgba(16,185,129,0.18)]'
                  : isWaPending
                    ? 'border-amber-300/40 bg-amber-400/10 shadow-[0_0_30px_rgba(251,191,36,0.18)]'
                    : status === 'error'
                      ? 'border-rose-300/30 bg-rose-500/10'
                      : 'border-white/10 bg-white/5'
              }`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                    isSuccess
                      ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-200'
                      : isWaPending
                        ? 'border-amber-300/40 bg-amber-400/15 text-amber-200'
                        : status === 'error'
                          ? 'border-rose-300/30 bg-rose-500/15 text-rose-200'
                          : 'border-cyan-300/20 bg-cyan-400/10 text-cyan-100'
                  }`}
                >
                  {isSuccess ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path d="M20 7L10.5 16.5L4 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : isWaPending ? (
                    <MessageCircleMore className="h-5 w-5" />
                  ) : status === 'error' ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path d="M12 9V13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                      <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                      <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-current" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {isSuccess ? t('successTitle') : isWaPending ? (ui.language === 'ar' ? '📲 تأكيد واتساب مطلوب' : '📲 WhatsApp confirmation required') : status === 'error' ? t('errorTitle') : t('readyStatus')}
                  </p>
                  {isSuccess ? (
                    <div className="mt-2 space-y-3">
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{feedback || t('successMessage')}</p>
                      <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-xs text-slate-600 dark:text-slate-300">
                        <p><strong>{ui.language === 'ar' ? 'الخدمة' : 'Service'}:</strong> {serviceTypePrice.icon} {ui.language === 'ar' ? serviceTypePrice.labelAr : serviceTypePrice.labelEn}</p>
                        <p><strong>{ui.language === 'ar' ? 'السعر' : 'Price'}:</strong> {serviceTypePrice.price} ج.م</p>
                      </div>
                      {syncStatus === 'pending' ? (
                        <div className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                          {ui.language === 'ar'
                            ? '⏳ جارٍ مزامنة الحجز مع الخادم — سيتم التحديث تلقائياً'
                            : '⏳ Syncing booking with server — will update automatically'}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          {ui.language === 'ar' ? '✅ تمت المزامنة مع الخادم' : '✅ Synced with server'}
                        </div>
                      )}
                    </div>
                  ) : isWaPending ? (
                    <div className="mt-2 space-y-3">
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{feedback}</p>
                      <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-xs text-slate-600 dark:text-slate-300">
                        <p className="mb-2"><strong>{ui.language === 'ar' ? 'نوع الحجز' : 'Booking type'}:</strong> {serviceTypePrice.icon} {ui.language === 'ar' ? serviceTypePrice.labelAr : serviceTypePrice.labelEn}</p>
                        <p><strong>{ui.language === 'ar' ? 'السعر' : 'Price'}:</strong> {serviceTypePrice.price} ج.م</p>
                      </div>
                      {selectedDoctor?.phone_number ? (
                        <div className="flex flex-col gap-2">
                          {!waConfirmed ? (
                            <>
                              <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setTimeout(() => setWaConfirmed(true), 1000)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/30 bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
                              >
                                <MessageCircleMore className="h-4 w-4" />
                                {ui.language === 'ar' ? '📲 أرسل واتساب للطبيب لتأكيد الحجز' : '📲 Send WhatsApp to doctor to confirm'}
                              </a>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {ui.language === 'ar' ? '⚠️ الحجز لن يتم تأكيده إلا بعد إرسال رسالة واتساب للطبيب' : '⚠️ Booking is confirmed only after sending WhatsApp to the doctor'}
                              </p>
                            </>
                          ) : (
                            <div className="space-y-2">
                              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-center text-sm font-bold text-emerald-600 dark:text-emerald-300">
                                ✅ {ui.language === 'ar' ? 'تم إرسال رسالة واتساب بنجاح' : 'WhatsApp sent successfully'}
                              </div>
                              <button
                                type="button"
                                onClick={() => navigate('/booking-success', { state: bookingData })}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-600"
                              >
                                🎫 {ui.language === 'ar' ? 'اذهب إلى التذكرة' : 'Go to ticket'}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-amber-700 dark:text-amber-100">{t('whatsappMissing')}</p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{feedback || t('bookingIntro')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  )
}

function ReviewPage({ ui }) {
  const t = key => getText(ui.language, key)
  const { appointmentId } = useParams()
  const { appointment, loading, notice } = useAppointmentById(appointmentId, ui.language)
  const { doctor } = useDoctorById(appointment?.doctor_id, ui.language)
  const [session, setSession] = useState(null)
  const [authNotice, setAuthNotice] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!active) {
        return
      }

      if (error) {
        setAuthNotice(error.message)
        setSession(null)
      } else {
        setAuthNotice('')
        setSession(data?.session || null)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession || null)
      }
    })

    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  const isCompleted = appointment?.status === 'Completed'
  const isSupabaseOffline = authNotice.toLowerCase().includes('supabase is not configured')
  const canSubmit = Boolean(session?.user) || isSupabaseOffline
  const disabledReason = canSubmit ? '' : t('reviewAuthRequired')

  const handleLogin = async event => {
    event.preventDefault()

    const email = loginEmail.trim()
    if (!email) {
      setAuthNotice(ui.language === 'ar' ? 'يرجى إدخال البريد الإلكتروني.' : 'Please enter an email address.')
      return
    }

    try {
      setLoginLoading(true)
      setAuthNotice('')

      const redirectTo = typeof window !== 'undefined' ? window.location.href : undefined
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      })

      if (error) {
        throw error
      }

      setAuthNotice(t('dashboardOtpSent'))
    } catch (error) {
      setAuthNotice(error instanceof Error ? error.message : t('dashboardOtpError'))
    } finally {
      setLoginLoading(false)
    }
  }

  const reviewLabels = {
    kicker: t('reviewPatientFeedback'),
    title: t('reviewTitle'),
    subtitle: t('reviewSubtitle'),
    ratingLabel: t('reviewRatingLabel'),
    commentLabel: t('reviewCommentLabel'),
    commentPlaceholder: t('reviewCommentPlaceholder'),
    submitLabel: t('reviewSubmit'),
    submittingLabel: t('reviewSubmitting'),
    thankYouTitle: t('reviewThankYouTitle'),
    thankYouBody: t('reviewThankYouBody'),
    ratingRequired: t('reviewRatingRequired'),
  }

  const handleSubmitReview = async ({ rating, comment }) => {
    if (!appointment || !doctor) {
      throw new Error(t('reviewNotFound'))
    }

    if (!isCompleted) {
      throw new Error(t('reviewNotReady'))
    }

    const payload = {
      doctor_id: appointment.doctor_id,
      appointment_id: String(appointment.id),
      patient_id: session?.user?.id ?? null,
      patient_name: appointment.patient_name || null,
      rating,
      comment: comment?.trim() || null,
    }

    const { error } = await supabase.from('reviews').insert([payload])

    if (error) {
      if (error.message.toLowerCase().includes('supabase is not configured')) {
        saveLocalReview(
          createLocalReview({
            doctorId: appointment.doctor_id,
            appointmentId: String(appointment.id),
            rating,
            comment: comment?.trim() || null,
            patientName: appointment.patient_name,
          }),
        )
        return { note: t('reviewSavedLocal') }
      }

      throw error
    }

    return { note: '' }
  }

  return (
    <AppShell ui={ui}>
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.45em] text-amber-600/70 dark:text-amber-200/70">
            {t('reviewPortal')}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">
            {t('reviewTitle')}
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {t('reviewSubtitle')}
          </p>

          {loading ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {t('reviewLoading')}
            </div>
          ) : notice ? (
            <div className="mt-6 rounded-3xl border border-rose-300/30 bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-100">
              {notice}
            </div>
          ) : null}

          {appointment ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-cyan-300/20 bg-slate-50 p-5 dark:border-cyan-300/20 dark:bg-slate-950/60">
                <p className="text-xs uppercase tracking-[0.32em] text-cyan-700/70 dark:text-cyan-200/70">
                  {t('reviewAppointmentLabel')}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {appointment.patient_name || t('reviewPatientFallback')}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {formatAppointmentDate(appointment, ui.language)}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    {t('reviewLockedCaption')}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${(STATUS_CONFIG[appointment.status]?.className) || 'border-slate-300/30 bg-slate-500/10 text-slate-600 dark:text-slate-200'}`}>
                    {localizeAppointmentStatus(ui.language, appointment.status)}
                  </span>
                </div>
              </div>

              {doctor ? (
                <div className="rounded-3xl border border-emerald-300/20 bg-emerald-50/60 p-5 dark:border-emerald-300/20 dark:bg-emerald-400/5">
                  <p className="text-xs uppercase tracking-[0.32em] text-emerald-700/70 dark:text-emerald-200/70">
                    {t('reviewDoctorLabel')}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{doctor.name}</p>
                  <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-200/80">{doctor.specialty}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
              {ui.language === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {ui.language === 'ar'
                ? 'تحتاج جلسة Supabase نشطة لحفظ التقييم بشكل رسمي.'
                : 'An active Supabase session is required to store reviews securely.'}
            </p>
            {session ? (
              <div className="mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-50 p-4 text-xs text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">
                {t('dashboardSessionActive')}
              </div>
            ) : (
              <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleLogin}>
                <input
                  className="w-full flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-200/60 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                  value={loginEmail}
                  onChange={event => setLoginEmail(event.target.value)}
                  placeholder={t('dashboardEmailPlaceholder')}
                  autoComplete="email"
                  inputMode="email"
                />
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-4 py-3 text-sm font-semibold text-amber-950 shadow-[0_10px_26px_rgba(251,191,36,0.3)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loginLoading ? t('reviewSubmitting') : t('sendMagicLink')}
                </button>
              </form>
            )}
            {authNotice ? (
              <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-50 p-4 text-xs text-amber-700 dark:bg-amber-400/10 dark:text-amber-100">
                {authNotice}
              </div>
            ) : null}
          </div>
        </div>

        {appointment && isCompleted ? (
          <ReviewFeedbackCard
            doctorName={doctor?.name}
            doctorSpecialty={doctor?.specialty}
            onSubmit={handleSubmitReview}
            strings={reviewLabels}
            disabledReason={disabledReason}
          />
        ) : appointment ? (
          <div className="rounded-[2rem] border border-amber-200/30 bg-amber-50/70 p-6 text-slate-700 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-amber-300/20 dark:bg-amber-400/10 dark:text-slate-100">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-700/70 dark:text-amber-200/70">
              {t('reviewLockedTitle')}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
              {t('reviewNotReady')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {t('reviewLockedBody')}
            </p>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-rose-300/30 bg-rose-50/70 p-6 text-rose-700 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:bg-rose-500/10 dark:text-rose-100">
            <p className="text-xs uppercase tracking-[0.35em] text-rose-600/70 dark:text-rose-200/70">
              {t('reviewNotFound')}
            </p>
            <p className="mt-3 text-sm leading-6">
              {t('reviewLockedBody')}
            </p>
          </div>
        )}
      </section>
    </AppShell>
  )
}

function useDoctorByUserId(uid, language) {
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    if (!uid) {
      setDoctor(null); setLoading(false); setNotice('')
      return () => { active = false }
    }

    const loadDoctor = async () => {
      setLoading(true); setNotice('')
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle()

      if (!active) return
      if (data) {
        setDoctor(localizeDoctor(language, makeDoctorFromRow(data)))
      }
      // no error/not found — just means unlinked
      setLoading(false)
    }

    loadDoctor()
    return () => { active = false }
  }, [uid, language])

  return { doctor, loading, notice }
}

function DashboardAccessPage({ ui }) {
  const t = key => getText(ui.language, key)
  const navigate = useNavigate()
  const isAr = ui.language === 'ar'
  const [secretCode, setSecretCode] = useState('')
  const [submittedCode, setSubmittedCode] = useState('')
  const [actionNotice, setActionNotice] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const [linkNotice, setLinkNotice] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [linkLoading, setLinkLoading] = useState(false)
  const [session, setSession] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const { doctor: authDoctor, loading: authDoctorLoading } = useDoctorByUserId(session?.user?.id, ui.language)
  const { doctor, loading: doctorLoading, notice: doctorNotice } = useDoctorByCode(submittedCode, ui.language)
  const { appointments, setAppointments, loading: appointmentsLoading, notice: appointmentsNotice } = useAppointmentsByDoctorId(doctor?.id, ui.language)

  // Use ONLY the code-submitted doctor — never auto-enter from auth session
  const resolvedDoctor = doctor
  const resolvedAppointments = appointments || []
  const dataReady = resolvedDoctor && !appointmentsLoading

  // Session management
  useEffect(() => {
    let active = true
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (active) setSession(data?.session || null)
    }
    loadSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession || null)
    })
    return () => { active = false; subscription?.unsubscribe() }
  }, [])

  // Prefill input from URL (never auto-submit)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const params = new URLSearchParams(window.location.search)
      const codeParam = params.get('code') || params.get('secret_code')
      if (codeParam) { setSecretCode(String(codeParam).trim()) }
    } catch (e) { /* ignore */ }
  }, [])

  const handleLogin = async event => {
    event.preventDefault()
    const email = loginEmail.trim()
    if (!email) { setAuthNotice(isAr ? 'يرجى إدخال البريد الإلكتروني.' : 'Please enter an email address.'); return }
    try {
      setLoginLoading(true); setAuthNotice('')
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined },
      })
      if (error) throw error
      setAuthNotice(t('dashboardOtpSent'))
    } catch (error) {
      setAuthNotice(error instanceof Error ? error.message : t('dashboardOtpError'))
    } finally { setLoginLoading(false) }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    const code = secretCode.trim()
    if (!code) return
    setSubmittedCode(code)
    setActionNotice('')
    setLinkNotice('')
    if (session?.user?.id) {
      setLinkLoading(true)
      try {
        const { data: doc } = await supabase.from('doctors').select('id, user_id').eq('secret_code', code).maybeSingle()
        if (doc) {
          const { error: updateError } = await supabase.from('doctors').update({ user_id: session.user.id }).eq('id', doc.id)
          if (updateError) throw updateError
          setLinkNotice(isAr ? `✅ تم الربط. المرة الجاية ادخل بالإيميل مباشرة.` : `✅ Linked. Next time just sign in with email.`)
        }
      } catch { setLinkNotice(isAr ? '❌ فشل الربط. استخدم الكود للدخول.' : '❌ Link failed.') }
      setLinkLoading(false)
    }
  }

  // Always require a submitted code — never auto-enter without explicit code entry
  if (!submittedCode || !resolvedDoctor) {
    return (
      <AppShell ui={ui}>
        <div className="flex min-h-[85vh] items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[2.5rem] border border-white/40 bg-white/70 p-8 shadow-[0_25px_60px_rgba(15,23,42,0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-800/70">
            <div className="text-center">
              <HeartPulse className="mx-auto h-12 w-12 text-cyan-500" />
              <p className="mt-4 text-xs uppercase tracking-[0.4em] text-cyan-700/70 dark:text-cyan-200/70">Hihya Care</p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                {isAr ? 'لوحة تحكم الأطباء' : 'Doctor Dashboard'}
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {isAr ? 'أدخل رمز الطبيب للبدء' : 'Enter your doctor code to start'}
              </p>
            </div>

            <form className="mt-8 space-y-3" onSubmit={handleSubmit}>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200/60 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                value={secretCode}
                onChange={event => setSecretCode(event.target.value)}
                placeholder={isAr ? 'مثال: HC-2026' : 'e.g. HC-2026'}
                autoComplete="off"
              />
              <button type="submit"
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.24)] transition hover:-translate-y-0.5">
                {isAr ? 'دخول' : 'Enter'}
              </button>
            </form>

            {doctorNotice ? (
              <div className="mt-4 rounded-2xl border border-rose-300/30 bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-100">{doctorNotice}</div>
            ) : null}

            <div className="mt-6 text-center">
              <button type="button" onClick={() => setShowLogin(!showLogin)}
                className="text-xs text-cyan-600 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-100">
                {showLogin
                  ? (isAr ? '← رجوع لرمز الطبيب' : '← Back to doctor code')
                  : (isAr ? 'تسجيل دخول بالبريد الإلكتروني' : 'Sign in with email')}
              </button>
            </div>

            {showLogin ? (
              <form className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-white/10" onSubmit={handleLogin}>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200/60 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                  value={loginEmail}
                  onChange={event => setLoginEmail(event.target.value)}
                  placeholder={isAr ? 'البريد الإلكتروني' : 'Email address'}
                  autoComplete="email" inputMode="email"
                />
                <button type="submit" disabled={loginLoading}
                  className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {loginLoading ? t('finalizingBooking') : (isAr ? 'إرسال رابط الدخول' : 'Send magic link')}
                </button>
                {authNotice ? (
                  <div className="rounded-xl border border-emerald-300/30 bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100">{authNotice}</div>
                ) : null}
                <p className="text-[10px] text-slate-400">
                  {isAr ? 'مرة واحدة بس. بعدها تدخل مباشرة.' : 'One-time setup. Then you log in directly.'}
                </p>
              </form>
            ) : null}

            <div className="mt-6 flex items-center justify-center gap-3 text-[10px] text-slate-400">
              <button type="button" onClick={() => ui.setLanguage('en')} className="hover:text-slate-600">EN</button>
              <span>·</span>
              <button type="button" onClick={() => ui.setLanguage('ar')} className="hover:text-slate-600">AR</button>
              <span>·</span>
              <button type="button" onClick={() => ui.setTheme(ui.theme === 'dark' ? 'light' : 'dark')} className="hover:text-slate-600">
                {ui.theme === 'dark' ? (isAr ? 'فاتح' : 'Light') : (isAr ? 'داكن' : 'Dark')}
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  // Loading state
  if (appointmentsLoading && !dataReady) {
    return (
      <AppShell ui={ui}>
        <div className="flex min-h-[85vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </div>
      </AppShell>
    )
  }

  // Doctor data ready — show the dashboard
  return (
    <AppShell ui={ui}>
      <section className="min-h-[80vh]">
        <DoctorDashboardPage
          doctor={resolvedDoctor}
          doctorLoading={false}
          appointments={resolvedAppointments}
          setAppointments={setAppointments}
          appointmentsLoading={appointmentsLoading}
          appointmentsNotice={appointmentsNotice}
          ui={ui}
        />
      </section>
    </AppShell>
  )
}

const STATUS_CYCLE = ['Pending', 'In Clinic', 'Completed']
const STATUS_CONFIG = {
  Pending: { label: 'في الانتظار', className: 'border-amber-300/30 bg-amber-500/10 text-amber-700 dark:text-amber-200', order: 0 },
  'In Clinic': { label: 'مع الطبيب', className: 'border-blue-300/30 bg-blue-500/10 text-blue-700 dark:text-blue-200', order: 1 },
  Completed: { label: 'تم', className: 'border-emerald-300/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200', order: 2 },
  Cancelled: { label: 'ملغي', className: 'border-rose-300/30 bg-rose-500/10 text-rose-700 dark:text-rose-200', order: -1 },
  'no_show': { label: 'غائب', className: 'border-slate-300/30 bg-slate-500/10 text-slate-600 dark:text-slate-200', order: -1 },
}

function openWhatsApp(phone, message) {
  const n = normalizePhoneForWa(phone)
  if (n) window.open(`https://wa.me/${n}?text=${encodeURIComponent(message)}`, '_blank')
}

const DELAY_TEMPLATES = [
  { delay: 10, label: '١٠ دقائق', msg: (p, d) => `السلام عليكم ${p} 🌿 موعدك مع د. ${d} اتأخر ١٠ دقائق. نشكر تفهمك.` },
  { delay: 15, label: '١٥ دقيقة', msg: (p, d) => `أهلاً ${p} 🌿 د. ${d} اعتذر عن التأخير ١٥ دقيقة.` },
  { delay: 30, label: '٣٠ دقيقة', msg: (p, d) => `عذراً ${p} 🌿 الموعد مع د. ${d} اتأخر نصف ساعة.` },
  { delay: 45, label: '٤٥ دقيقة', msg: (p, d) => `${p} المحترم/ة 🌿 نأسف للتأخير. د. ${d} سينهي الحالة بعد ٤٥ دقيقة.` },
]

const EXPENSE_DATA = { rent: 8500, electricity: 1800, water: 400, supplies: 3200, staff: 12000, maintenance: 1500, other: 2000 }
const MONTHLY_EXPENSES_TOTAL = Object.values(EXPENSE_DATA).reduce((a, b) => a + b, 0)

const DIAGNOSIS_DATA = [
  { name: 'باطنة', value: 40, color: '#22d3ee' },
  { name: 'أنفلونزا', value: 20, color: '#10b981' },
  { name: 'ضغط الدم', value: 15, color: '#f59e0b' },
  { name: 'صداع نصفي', value: 13, color: '#8b5cf6' },
  { name: 'حساسية', value: 8, color: '#ef4444' },
  { name: 'أخرى', value: 4, color: '#64748b' },
]

const PEAK_HOURS = [
  { hour: '8ص', patients: 2 }, { hour: '9ص', patients: 5 }, { hour: '10ص', patients: 8 },
  { hour: '11ص', patients: 7 }, { hour: '12م', patients: 6 }, { hour: '1م', patients: 3 },
  { hour: '2م', patients: 4 }, { hour: '3م', patients: 6 }, { hour: '4م', patients: 9 },
  { hour: '5م', patients: 7 }, { hour: '6م', patients: 4 }, { hour: '7م', patients: 2 },
]

const MONTHLY_REVENUE = [
  { month: 'نوفمبر', revenue: 28500, target: 30000 },
  { month: 'ديسمبر', revenue: 32200, target: 30000 },
  { month: 'يناير', revenue: 25800, target: 32000 },
  { month: 'فبراير', revenue: 34100, target: 32000 },
  { month: 'مارس', revenue: 41800, target: 35000 },
  { month: 'إبريل', revenue: 39200, target: 38000 },
]

function DoctorDashboardPage({ doctor, doctorLoading, appointments, setAppointments, appointmentsLoading, appointmentsNotice, ui }) {
  const t = key => getText(ui.language, key)
  const isArabic = ui.language === 'ar'
  const navigate = useNavigate()
  const [clinicStatus, setClinicStatus] = useState('open')
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [ehrPatient, setEhrPatient] = useState(null)

  // Load initial clinic status from localStorage
  useEffect(() => {
    let saved = null
    try { saved = doctor?.id ? window.localStorage.getItem(`hihya-clinic-status-${doctor.id}`) : null } catch (e) { /* ignore */ }
    if (saved) setClinicStatus(saved)
  }, [doctor?.id])
  const [prescriptionModal, setPrescriptionModal] = useState({ open: false, appointment: null })
  const [delayModal, setDelayModal] = useState({ open: false, appointment: null, doctorName: '' })
  const [toast, setToast] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [expenses, setExpenses] = useState(null)
  const [editExpenseKey, setEditExpenseKey] = useState(null)
  const [editExpenseVal, setEditExpenseVal] = useState('')
  const [savingExpense, setSavingExpense] = useState(false)

  const reviewsQuery = useQuery({
    queryKey: ['reviews', doctor?.id, ui.language],
    enabled: Boolean(doctor?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, patient_name')
        .eq('doctor_id', doctor.id)
        .order('created_at', { ascending: false })
      if (error || !Array.isArray(data)) {
        return { reviews: getLocalReviewsForDoctor(doctor.id), notice: '' }
      }
      const localReviews = getLocalReviewsForDoctor(doctor.id)
      const merged = [...data]
      const existingIds = new Set(data.map(r => r.id))
      merged.push(...localReviews.filter(r => !existingIds.has(r.id)))
      return { reviews: merged, notice: '' }
    },
    staleTime: 120_000,
  })
  const dashboardReviews = reviewsQuery.data?.reviews || []
  const avgRating = dashboardReviews.length
    ? (dashboardReviews.reduce((s, r) => s + Number(r.rating || 0), 0) / dashboardReviews.length).toFixed(1)
    : '—'

  useEffect(() => { if (!toast) return; const t2 = setTimeout(() => setToast(''), 2800); return () => clearTimeout(t2) }, [toast])

  const price = Number(doctor?.price_value) || 300

  // Load expenses from Supabase
  useEffect(() => {
    if (!doctor?.id) { setExpenses(null); return }
    let active = true
    const loadExpenses = async () => {
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)
      const monthStr = monthStart.toISOString().slice(0, 10)
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .eq('doctor_id', doctor.id)
        .eq('month', monthStr)
        .maybeSingle()
      if (!active) return
      if (data) {
        setExpenses({ rent: Number(data.rent)||0, electricity: Number(data.electricity)||0, water: Number(data.water)||0, supplies: Number(data.supplies)||0, staff: Number(data.staff)||0, maintenance: Number(data.maintenance)||0, other: Number(data.other)||0 })
      } else {
        setExpenses(null)
      }
    }
    loadExpenses()
    return () => { active = false }
  }, [doctor?.id])

  const monthlyExpensesTotal = useMemo(() => {
    if (!expenses) return 0
    return Object.values(expenses).reduce((a, b) => a + b, 0)
  }, [expenses])

  const saveExpense = async () => {
    const key = editExpenseKey
    if (!key || !doctor?.id) return
    const val = parseFloat(editExpenseVal) || 0
    setSavingExpense(true)
    try {
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)
      const monthStr = monthStart.toISOString().slice(0, 10)
      const payload = { doctor_id: doctor.id, month: monthStr, [key]: val }
      const { error } = await supabase.from('expenses').upsert(payload, { onConflict: ['doctor_id', 'month'] })
      if (error) throw error
      setExpenses(prev => ({ ...(prev || {}), [key]: val }))
      setToast(isArabic ? '✅ تم حفظ المصروف' : '✅ Expense saved')
    } catch {
      setToast(isArabic ? '❌ فشل الحفظ' : '❌ Failed to save')
    }
    setSavingExpense(false)
    setEditExpenseKey(null)
  }

  const sortedAppointments = useMemo(() => {
    return [...(appointments || [])].sort((a, b) => {
      const orderA = STATUS_CONFIG[a.status]?.order ?? 99
      const orderB = STATUS_CONFIG[b.status]?.order ?? 99
      if (orderA !== orderB) return orderA - orderB
      return (a.appointment_date || '').localeCompare(b.appointment_date || '')
    })
  }, [appointments])

  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = now.toDateString()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    const today = appointments.filter(a => new Date(a.appointment_date).toDateString() === todayStr).length
    const waiting = appointments.filter(a => a.status === 'Pending').length
    const withDoctor = appointments.filter(a => a.status === 'In Clinic').length
    const completed = appointments.filter(a => a.status === 'Completed').length
    const completedThisMonth = appointments.filter(a => {
      const d = new Date(a.appointment_date)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear && a.status === 'Completed'
    }).length
    const completedToday = appointments.filter(a => {
      return new Date(a.appointment_date).toDateString() === todayStr && a.status === 'Completed'
    }).length

    const monthlyRevenue = completedThisMonth * price
    const todayRevenue = completedToday * price
    return { today, waiting, withDoctor, completed, monthlyRevenue, todayRevenue, total: appointments.length, completedThisMonth, completedToday }
  }, [appointments, price])

  // Dynamic revenue chart grouped by month
  const revenueChartData = useMemo(() => {
    const monthNames = ['يناير','فبراير','مارس','إبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
    const enMonthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const months = {}
    appointments.forEach(a => {
      const d = new Date(a.appointment_date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!months[key]) months[key] = { month: d.getMonth(), year: d.getFullYear(), revenue: 0, count: 0 }
      if (a.status === 'Completed') {
        const fee = Number(a.fees) || price
        months[key].revenue += fee
        months[key].count++
      }
    })
    return Object.values(months).sort((a, b) => a.year - b.year || a.month - b.month).map(m => ({
      month: isArabic ? monthNames[m.month] : enMonthNames[m.month],
      revenue: m.revenue,
      target: Math.round(m.revenue * 1.15),
    }))
  }, [appointments, price, isArabic])

  // Dynamic peak hours from appointment times
  const peakHoursData = useMemo(() => {
    const hours = {}
    appointments.forEach(a => {
      const d = new Date(a.appointment_date)
      const h = d.getHours()
      const key = `${h}`
      if (!hours[key]) hours[key] = { hour: h, patients: 0 }
      hours[key].patients++
    })
    const sorted = Object.values(hours).sort((a, b) => a.hour - b.hour)
    if (sorted.length === 0) return PEAK_HOURS // fallback
    return sorted.map(h => {
      const hour = h.hour
      let label
      if (hour === 0) label = '12ص'
      else if (hour < 12) label = `${hour}ص`
      else if (hour === 12) label = '12م'
      else label = `${hour - 12}م`
      return { hour: label, patients: h.patients }
    })
  }, [appointments])

  // Dynamic diagnosis data — uses diagnosis field from appointments
  const diagnosisChartData = useMemo(() => {
    const diagCounts = {}
    appointments.forEach(a => {
      if (a.diagnosis) {
        const d = String(a.diagnosis).trim()
        diagCounts[d] = (diagCounts[d] || 0) + 1
      }
    })
    const entries = Object.entries(diagCounts)
    if (entries.length === 0) return DIAGNOSIS_DATA // fallback
    const total = entries.reduce((sum, [, count]) => sum + count, 0)
    const colors = ['#22d3ee','#10b981','#f59e0b','#8b5cf6','#ef4444','#64748b','#f97316','#ec4899']
    return entries.slice(0, 8).map(([name, count], i) => ({
      name: name.slice(0, 12),
      value: Math.round((count / total) * 100),
      color: colors[i % colors.length],
    }))
  }, [appointments])

  const handleStatusCycle = async (appt) => {
    const currentIdx = STATUS_CYCLE.indexOf(appt.status)
    if (currentIdx < 0 || currentIdx >= STATUS_CYCLE.length - 1) return
    const nextStatus = STATUS_CYCLE[currentIdx + 1]
    setActionLoading(true)
    try {
      await supabase.from('appointments').update({ status: nextStatus }).eq('id', appt.id)
      setAppointments(prev => prev.map(item => item.id === appt.id ? { ...item, status: nextStatus } : item))
      setToast(`تم تحديث حالة ${appt.patient_name} إلى ${STATUS_CONFIG[nextStatus]?.label || nextStatus}`)
    } catch (e) {
      setToast('فشل التحديث')
    }
    setActionLoading(false)
  }

  const sendDelayAlert = (appt, delayMin) => {
    const msg = DELAY_TEMPLATES.find(t => t.delay === delayMin)?.msg(appt.patient_name, doctor?.name || 'الطبيب') || `تأخير ${delayMin} دقيقة`
    openWhatsApp(appt.phone || appt.patient_phone, msg)
    appointments.filter(a => a.status === 'Pending' || a.status === 'booked').forEach(p => {
      if (p.id !== appt.id) setTimeout(() => openWhatsApp(p.phone || p.patient_phone, msg), 300)
    })
    setToast(`تم إرسال إشعار تأخير ${delayMin} دقيقة`)
  }

  const sendConfirmMsg = (appt) => {
    const todayStr = new Date().toDateString()
    const queueNum = appointments.filter(a =>
      a.status === 'Pending' && new Date(a.appointment_date).toDateString() === todayStr
    ).findIndex(a => a.id === appt.id) + 1
    const dateStr = appt.appointment_date
      ? new Date(appt.appointment_date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : ''
    const clinicLink = doctor?.clinic_link || ''
    const doctorName = doctor?.name || 'الطبيب'
    const msg = `أهلاً أستاذ ${appt.patient_name}، تم تسجيل حجزك بنجاح في عيادة دكتور ${doctorName}.
🗓️ الموعد: ${dateStr}
🔢 رقمك في القائمة: ${queueNum}
📍 الموقع: ${clinicLink}
نتمنى لك الشفاء العاجل.`
    openWhatsApp(appt.phone || appt.patient_phone, msg)
    setToast(`تم إرسال تأكيد إلى ${appt.patient_name}`)
  }

  if (doctorLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-cyan-500" /></div>
  }

  const sevLabel = (sev) => sev === 'urgent' ? 'عاجل' : sev === 'routine' ? 'روتيني' : 'استشارة'
  const sevCls = (sev) => sev === 'urgent'
    ? 'border-rose-300/30 bg-rose-500/10 text-rose-700 dark:text-rose-200'
    : sev === 'routine'
      ? 'border-amber-300/30 bg-amber-500/10 text-amber-700 dark:text-amber-200'
      : 'border-emerald-300/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'

  return (
    <div className="rounded-[2rem] border border-white/40 bg-white/70 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 sm:p-6">
      <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-950/60 sm:p-8">
        {/* Toast */}
        {toast ? (
          <div className="mb-4 rounded-2xl border border-emerald-300/30 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100">{toast}</div>
        ) : null}
        {emergencyMode ? (
          <div className="mb-4 rounded-2xl border border-rose-300/40 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-800 animate-pulse dark:bg-rose-500/15 dark:text-rose-100">🚨 وضع الطوارئ مفعل</div>
        ) : null}

        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-700/70 dark:text-cyan-200/70">Hihya Care</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
              {doctor ? `د. ${doctor.name}` : 'لوحة التحكم'}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{doctor?.specialty || ''}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Clinic Status Toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5">
              {['open', 'break', 'closed'].map(s => (
                <button key={s} type="button" onClick={() => { setClinicStatus(s); try { if (doctor?.id) { window.localStorage.setItem(`hihya-clinic-status-${doctor.id}`, s); window.dispatchEvent(new CustomEvent('clinic-status-changed')) } } catch (e) { /* ignore */ } }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${clinicStatus === s
                    ? s === 'open' ? 'bg-emerald-500 text-white' : s === 'break' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400'}`}
                >
                  {s === 'open' ? 'مفتوح' : s === 'break' ? 'استراحة' : 'مغلق'}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setEmergencyMode(!emergencyMode)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${emergencyMode ? 'border-rose-300 bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200' : 'border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'}`}
            >
              <TriangleAlert className="inline h-3.5 w-3.5 mr-1" />{emergencyMode ? 'إلغاء الطوارئ' : 'طوارئ'}
            </button>
            <Link to="/" className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">الرئيسية</Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-400/20 dark:bg-emerald-500/10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-600/70 dark:text-emerald-200/70">الإيرادات الشهرية</p>
            <p className="mt-2 text-2xl font-bold text-emerald-800 dark:text-emerald-100">{stats.monthlyRevenue.toLocaleString()} ج.م</p>
            <p className="mt-1 text-xs text-emerald-600/60 dark:text-emerald-200/60">{stats.completedThisMonth} مكتمل بالشهر</p>
          </div>
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50/80 p-4 dark:border-cyan-400/20 dark:bg-cyan-500/10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-600/70 dark:text-cyan-200/70">رضا المرضى</p>
            <p className="mt-2 text-2xl font-bold text-cyan-800 dark:text-cyan-100">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 98}%</p>
            <p className="mt-1 text-xs text-cyan-600/60 dark:text-cyan-200/60">{stats.completed} مكتمل</p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50/80 p-4 dark:border-violet-400/20 dark:bg-violet-500/10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-violet-600/70 dark:text-violet-200/70">مواعيد اليوم</p>
            <p className="mt-2 text-2xl font-bold text-violet-800 dark:text-violet-100">{stats.today}</p>
            <p className="mt-1 text-xs text-violet-600/60 dark:text-violet-200/60">{stats.waiting} انتظار · {stats.withDoctor} مع الطبيب</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-400/20 dark:bg-amber-500/10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-600/70 dark:text-amber-200/70">وارد اليوم</p>
            <p className="mt-2 text-2xl font-bold text-amber-800 dark:text-amber-100">{stats.todayRevenue.toLocaleString()} ج.م</p>
            <p className="mt-1 text-xs text-amber-600/60 dark:text-amber-200/60">{stats.completedToday} مكتمل بـ {price} ج.م</p>
          </div>
        </div>

        {/* Main Grid: Live Pulse + Analytics Right */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">

          {/* ===== LIVE PULSE TABLE ===== */}
          <section>
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                  <HeartPulse className="h-5 w-5 text-rose-500" />النبض المباشر
                </h2>
                <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <Activity className="h-3 w-3" />Live
                </span>
              </div>

              {!doctor ? (
                <div className="flex flex-col items-center py-12 text-slate-400"><CalendarCheck className="h-12 w-12 mb-3" /><p className="text-sm">أدخل رمز الطبيب لعرض البيانات</p></div>
              ) : sortedAppointments.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-slate-400"><CalendarCheck className="h-12 w-12 mb-3" /><p className="text-sm">لا توجد مواعيد اليوم</p></div>
              ) : (
                <div className="space-y-2">
                  {sortedAppointments.map((appt) => {
                    const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.Pending
                    const isEhrOpen = ehrPatient?.id === appt.id
                    return (
                      <div key={appt.id}>
                        <div className="group flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-cyan-200 hover:shadow-sm dark:border-white/5 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-emerald-100 dark:from-cyan-500/20 dark:to-emerald-500/20">
                              <UserRound className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <button type="button" onClick={() => setEhrPatient(isEhrOpen ? null : appt)} className="text-sm font-semibold text-slate-900 hover:text-cyan-700 dark:text-white dark:hover:text-cyan-300">
                                  {appt.patient_name}
                                </button>
                                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${cfg.className}`}>{cfg.label}</span>
                                <span className="text-[10px] text-slate-400">{appt.appointment_date ? new Date(appt.appointment_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                              </div>
                              <p className="text-xs text-slate-400">{appt.phone || ''}{appt.patient_age ? ` · ${appt.patient_age} سنة` : ''}{appt.patient_gender ? ` · ${appt.patient_gender === 'male' || appt.patient_gender === 'ذكر' ? 'ذكر' : 'أنثى'}` : ''}</p>
                              {/* AI Summary Badge */}
                              {appt.symptoms && (
                                <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 border border-violet-200 dark:bg-violet-500/10 dark:text-violet-200 dark:border-violet-400/20">
                                  <Sparkles className="h-3 w-3" />{String(appt.symptoms).slice(0, 25)}
                                </span>
                              )}
                              {appt.attachments?.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {appt.attachments.map((att, i) => (
                                    att.data ? (
                                      <a key={i} href={att.data} download={att.name || 'file'} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                        className="group relative block h-10 w-10 overflow-hidden rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-400/20 dark:bg-blue-500/10">
                                        {att.data.startsWith('data:image/') ? (
                                          <img src={att.data} alt={att.name} className="h-full w-full object-cover" />
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-300">PDF</div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-[10px] text-white transition group-hover:bg-black/40">📂</div>
                                      </a>
                                    ) : (
                                      <span key={i} className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-400/20" title={att.name || ''}>
                                        📎 {att.name?.slice(0, 12) || 'ملف'}
                                      </span>
                                    )
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button type="button" onClick={() => handleStatusCycle(appt)} disabled={actionLoading || appt.status === 'Completed' || appt.status === 'Cancelled'}
                              className="rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:opacity-40 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-200">
                              {appt.status === 'Pending' ? '→ كشف' : appt.status === 'In Clinic' ? '→ تم' : '✓'}
                            </button>
                            <button type="button" onClick={() => sendConfirmMsg(appt)}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                              <MessageCircle className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => setDelayModal({ open: true, appointment: appt, doctorName: doctor?.name || 'الطبيب' })}
                              className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
                              <Clock className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => setPrescriptionModal({ open: true, appointment: appt })}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-200">
                              <FileText className="h-3 w-3 inline" /> روشتة
                            </button>
                            <button type="button" onClick={() => setEhrPatient(isEhrOpen ? null : appt)}
                              className={`rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition ${isEhrOpen ? 'border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/20 dark:text-violet-200' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'}`}>
                              ملف
                            </button>
                          </div>
                        </div>
                        {/* Mini-EHR */}
                        {isEhrOpen && (
                          <div className="mt-1 mb-2 mr-12 rounded-xl border border-violet-200 bg-violet-50/80 p-3 dark:border-violet-400/20 dark:bg-violet-500/5">
                            <p className="mb-2 text-xs font-semibold text-violet-800 dark:text-violet-200">📋 تاريخ {appt.patient_name} مع العيادة</p>
                            {appt.ehrNotes ? (
                              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                {appt.ehrNotes.map((note, i) => (
                                  <div key={i} className="rounded-lg border border-white/50 bg-white/80 p-2 dark:border-white/10 dark:bg-white/[0.04]">
                                    <p className="text-slate-400">{note.date}</p>
                                    <p className="text-slate-700 dark:text-slate-200"><span className="text-slate-500">التشخيص:</span> {note.diagnosis}</p>
                                    <p className="text-slate-700 dark:text-slate-200"><span className="text-slate-500">العلاج:</span> {note.prescription}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">لا توجد زيارات سابقة.</p>
                            )}
                            <div className="mt-2 flex gap-2">
                              <input type="text" placeholder="تشخيص..." className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none dark:border-white/10 dark:bg-white/5" />
                              <button type="button" className="rounded-lg border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-200">حفظ</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ===== RIGHT COLUMN: Analytics + Expense ===== */}
          <section className="space-y-5">
            {/* Revenue Chart */}
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center justify-between">
                <div><p className="text-[10px] uppercase tracking-[0.35em] text-cyan-600/70 dark:text-cyan-200/70">تحليلات</p><h3 className="text-base font-semibold text-slate-900 dark:text-white">الإيرادات</h3></div>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChartData.length > 0 ? revenueChartData : MONTHLY_REVENUE} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="month" stroke="rgba(148,163,184,0.4)" tick={{ fontSize: 9 }} />
                    <YAxis stroke="rgba(148,163,184,0.4)" tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '12px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name="الإيرادات" />
                    <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#f59e0b', r: 3 }} name="الهدف" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Diagnosis Pie */}
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center justify-between">
                <div><p className="text-[10px] uppercase tracking-[0.35em] text-cyan-600/70 dark:text-cyan-200/70">تحليلات</p><h3 className="text-base font-semibold text-slate-900 dark:text-white">التشخيصات</h3></div>
                <BarChart3 className="h-4 w-4 text-violet-500" />
              </div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={diagnosisChartData} cx="50%" cy="50%" innerRadius={36} outerRadius={60} paddingAngle={3} dataKey="value">
                      {diagnosisChartData.map((entry, idx) => (<Cell key={idx} fill={entry.color} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1">
                {diagnosisChartData.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name} ({item.value}%)
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Hours */}
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center justify-between">
                <div><p className="text-[10px] uppercase tracking-[0.35em] text-cyan-600/70 dark:text-cyan-200/70">تحليلات</p><h3 className="text-base font-semibold text-slate-900 dark:text-white">ساعات الذروة</h3></div>
                <Clock3 className="h-4 w-4 text-amber-500" />
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHoursData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="hour" stroke="rgba(148,163,184,0.4)" tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="patients" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={18}>
                      {peakHoursData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.patients >= 8 ? '#ef4444' : entry.patients >= 5 ? '#f59e0b' : '#22d3ee'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center justify-between">
                <div><p className="text-[10px] uppercase tracking-[0.35em] text-violet-600/70 dark:text-violet-200/70">{isArabic ? 'التقييمات' : 'Reviews'}</p><h3 className="text-base font-semibold text-slate-900 dark:text-white">{isArabic ? 'آراء المرضى' : 'Patient Feedback'}</h3></div>
                <Star className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-400/20 dark:bg-amber-500/10">
                <span className="text-2xl font-bold text-amber-800 dark:text-amber-100">{avgRating}</span>
                <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(Number(avgRating) || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />)}</div>
                <span className="text-xs text-amber-600/70 dark:text-amber-200/70">({dashboardReviews.length})</span>
              </div>
              {dashboardReviews.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dashboardReviews.slice(0, 10).map((rev, i) => (
                    <div key={rev.id || i} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{rev.patient_name || (isArabic ? 'مريض' : 'Patient')}</span>
                        <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, j) => <Star key={j} className={`h-3 w-3 ${j < Number(rev.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />)}</div>
                      </div>
                      {rev.comment ? <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{rev.comment}</p> : null}
                      <p className="mt-1 text-[10px] text-slate-400">{rev.created_at ? new Date(rev.created_at).toLocaleDateString('ar-EG') : ''}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">{isArabic ? 'لا توجد تقييمات بعد' : 'No reviews yet'}</p>
              )}
            </div>

            {/* Expense & Profit */}
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center justify-between">
                <div><p className="text-[10px] uppercase tracking-[0.35em] text-cyan-600/70 dark:text-cyan-200/70">{isArabic ? 'المالية' : 'Finance'}</p><h3 className="text-base font-semibold text-slate-900 dark:text-white">{isArabic ? 'الإيرادات والمصروفات' : 'Revenue & Expenses'}</h3></div>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 text-center dark:border-emerald-400/20 dark:bg-emerald-500/10">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600/70 dark:text-emerald-200/70">الإيرادات</p>
                  <p className="text-lg font-bold text-emerald-800 dark:text-emerald-100">{stats.monthlyRevenue.toLocaleString()} ج.م</p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-2.5 text-center dark:border-rose-400/20 dark:bg-rose-500/10">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-rose-600/70 dark:text-rose-200/70">المصروفات</p>
                  <p className="text-lg font-bold text-rose-800 dark:text-rose-100">{monthlyExpensesTotal.toLocaleString()} ج.م</p>
                </div>
              </div>
              <div className="rounded-xl border border-cyan-200 bg-cyan-50/80 p-3 text-center dark:border-cyan-400/20 dark:bg-cyan-500/10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-600/70 dark:text-cyan-200/70">صافي الربح</p>
                <p className="text-xl font-bold text-cyan-800 dark:text-cyan-100">{(stats.monthlyRevenue - monthlyExpensesTotal).toLocaleString()} ج.م</p>
                <p className="text-xs text-cyan-600/60 dark:text-cyan-200/60">{stats.monthlyRevenue > 0 ? ((stats.monthlyRevenue - monthlyExpensesTotal) / stats.monthlyRevenue * 100).toFixed(1) : 0}% هامش ربح</p>
              </div>
              <div className="mt-3 space-y-1">
                {Object.entries(EXPENSE_DATA).map(([key, defaultVal]) => {
                  const val = expenses?.[key] ?? defaultVal
                  const total = monthlyExpensesTotal || 1
                  const expenseLabels = { rent: 'إيجار', electricity: 'كهرباء', water: 'مياه', supplies: 'خامات طبية', staff: 'رواتب', maintenance: 'صيانة', other: 'أخرى' }
                  return (
                    <div key={key} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white/50 px-2.5 py-1.5 dark:border-white/5 dark:bg-white/[0.02]">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{expenseLabels[key] || key}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden dark:bg-white/5">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${(val / total) * 100}%` }} />
                        </div>
                        {editExpenseKey === key ? (
                          <div className="flex items-center gap-1">
                            <input type="number" value={editExpenseVal} onChange={e => setEditExpenseVal(e.target.value)}
                              className="w-20 rounded-lg border border-cyan-200 bg-white px-1.5 py-0.5 text-xs text-slate-900 outline-none dark:border-cyan-400/20 dark:bg-white/5 dark:text-white" />
                            <button type="button" onClick={saveExpense} disabled={savingExpense}
                              className="rounded-lg bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200">{savingExpense ? '...' : 'حفظ'}</button>
                            <button type="button" onClick={() => setEditExpenseKey(null)}
                              className="rounded-lg bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400">✕</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => { setEditExpenseKey(key); setEditExpenseVal(String(val)) }}
                            className="text-xs font-medium text-slate-600 dark:text-slate-300 w-14 text-left hover:text-cyan-600 transition-colors">
                            {val.toLocaleString()} ج.م
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {!expenses ? (
                <p className="mt-2 text-[10px] text-slate-400 text-center">{isArabic ? '💡 اضغط على القيمة لتعديلها' : '💡 Click a value to edit'}</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      {/* Delay Modal */}
      {delayModal.open && delayModal.appointment ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">إشعار تأخير</h3>
            <p className="mt-2 text-sm text-slate-500">إرسال تنبيه لـ {delayModal.appointment.patient_name} ومرضى آخرين</p>
            <div className="mt-4 space-y-2">
              {DELAY_TEMPLATES.map(t => (
                <button key={t.delay} type="button" onClick={() => { sendDelayAlert(delayModal.appointment, t.delay); setDelayModal({ open: false, appointment: null, doctorName: '' }) }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-right text-sm text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {t.label}
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setDelayModal({ open: false, appointment: null, doctorName: '' })}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">إلغاء</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Prescription Modal */}
      {prescriptionModal.open && doctor && (
        <PrescriptionModal
          doctor={doctor}
          appointment={prescriptionModal.appointment}
          onClose={() => setPrescriptionModal({ open: false, appointment: null })}
        />
      )}
    </div>
  )
}

function PrescriptionPublicView() {
  const { id } = useParams()
  const [prescription, setPrescription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let active = true
    const load = async () => {
      const { data, error: err } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('qr_uuid', id)
        .maybeSingle()
      if (!active) return
      if (err || !data) {
        setError('لم يتم العثور على الروشتة')
      } else {
        setPrescription(data)
      }
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  if (error || !prescription) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-[#020617]">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-white/5">
          <XCircle className="mx-auto h-12 w-12 text-rose-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">الروشتة غير موجودة</h2>
          <p className="mt-2 text-sm text-slate-500">تأكد من رابط الروشتة أو تواصل مع العيادة.</p>
        </div>
      </div>
    )
  }

  const meds = Array.isArray(prescription.medicines) ? prescription.medicines : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 py-8 px-4 dark:from-[#020617] dark:to-[#0f1f3d]" dir="rtl">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-slate-900 dark:shadow-cyan-900/20">
        {/* Header */}
        <div className="bg-gradient-to-l from-[#0a1628] via-[#0f1f3d] to-[#1a2d52] px-8 py-10 text-center">
          <p className="text-xs font-bold tracking-[0.35em] text-amber-400/80">HIHYA CARE</p>
          <h1 className="mt-3 text-3xl font-bold text-white" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
            روشتة علاج
          </h1>
          <p className="mt-2 text-sm text-blue-200/70">روشتة إلكترونية معتمدة</p>
        </div>

        <div className="p-8 space-y-5">
          {/* Doctor Info */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 dark:border-blue-400/20 dark:from-blue-500/10 dark:to-transparent">
            <p className="text-xs font-semibold text-blue-500/70 tracking-wider">الطبيب المعالج</p>
            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
              {prescription.signature_text}
            </p>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">رقم الروشتة: <span className="font-mono font-bold text-blue-600 dark:text-blue-300" dir="ltr">{prescription.qr_uuid?.slice(0, 8) || '—'}</span></p>
          </div>

          {/* Patient + Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold text-slate-500/70">المريض</p>
              <p className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">{prescription.patient_name || '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold text-slate-500/70">التاريخ</p>
              <p className="mt-1.5 text-base font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Amiri', serif" }}>
                {prescription.created_at ? new Date(prescription.created_at).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          {/* Diagnosis */}
          {prescription.diagnosis && (
            <div className="rounded-xl border-r-4 border-amber-400 bg-amber-50 p-4 dark:bg-amber-500/10 dark:border-amber-400">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">التشخيص</p>
              <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{prescription.diagnosis}</p>
            </div>
          )}

          {/* Medicines */}
          {meds.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold text-slate-500 dark:text-slate-400">💊 الأدوية الموصوفة</p>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:border-white/10 dark:divide-white/5">
                {meds.map((med, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{med.name}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                        {med.dosage && <span>💊 الجرعة: {med.dosage}</span>}
                        {med.duration && <span>⏱ المدة: {med.duration}</span>}
                        {med.notes && <span>📝 {med.notes}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {prescription.notes && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold text-slate-500/70">ملاحظات إضافية</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{prescription.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-200 pt-5 text-center dark:border-white/10">
            <p className="text-xs text-slate-400" style={{ fontFamily: "'Amiri', serif" }}>
              روشتة إلكترونية صادرة من Hihya Care
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              للتحقق من صحة الروشتة، تواصل مع العيادة مباشرة
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

