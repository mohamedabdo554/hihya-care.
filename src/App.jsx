import { useEffect, useMemo, useRef, useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
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
import DashboardPortfolio from './components/DashboardPortfolio.jsx'
import PremiumDoctorProfile from './components/PremiumDoctorProfile.jsx'
import { supabase } from './supabaseClient.js'

const defaultLanguage = 'en'
const defaultTheme = 'light'
const queryClient = new QueryClient()

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
    homeKicker: 'Doctor Directory',
    homeTitle: 'Select the right doctor from the Hihya Care network.',
    homeDescription:
      'A cinematic booking surface for a modern clinic. Choose a doctor, review the profile, then open the booking panel.',
    loadingDoctors: 'Loading doctors...',
    loadingProfile: 'Loading doctor profile...',
    loadingAppointments: 'Loading appointments...',
    fallbackNotice: 'Supabase data is unavailable right now. Showing demo content until the tables are ready.',
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
  },
  ar: {
    navBrand: 'هيها كير',
    navSubtitle: 'شبكة عيادة بطابع سايبربانك',
    language: 'اللغة',
    theme: 'الوضع',
    light: 'فاتح',
    dark: 'داكن',
    english: 'EN',
    arabic: 'AR',
    rtlBanner: 'تم ضبط الواجهة إلى العربية مع اتجاه من اليمين إلى اليسار.',
    homeKicker: 'دليل الأطباء',
    homeTitle: 'اختر الطبيب المناسب من شبكة Hihya Care.',
    homeDescription:
      'واجهة حجز سينمائية لعيادة حديثة. اختر الطبيب، راجع الملف، ثم افتح لوحة الحجز.',
    loadingDoctors: 'جارٍ تحميل الأطباء...',
    loadingProfile: 'جارٍ تحميل ملف الطبيب...',
    loadingAppointments: 'جارٍ تحميل المواعيد...',
    fallbackNotice: 'بيانات Supabase غير متاحة الآن. يتم عرض محتوى تجريبي حتى تصبح الجداول جاهزة.',
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
    whatsappFallback: 'واجهة WhatsApp API غير مهيأة. استخدم رابط المحادثة بدلًا من ذلك.',
    dashboardLogin: 'محاكاة دخول الطبيب',
    dashboardAuthTitle: 'دخول آمن للطبيب',
    dashboardAuthIntro: 'استخدم رابطًا سحريًا أو رمز OTP لتأكيد الجلسة قبل تحميل الطابور.',
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
    doctorUnknown: 'اختصاصي غير معروف',
    doctorFallbackBio: 'ملف اختصاصي سينمائي متاح في صفحة التفاصيل.',
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
    dashboardCodeHelper: 'كل رمز يرتبط بطبيب واحد وبطابور مواعيد خاص به.',
  },
}

const fallbackDoctors = [
  {
    id: 'dr-mohamed-alafandi',
    name: 'د. محمد الافندي',
    name_en: 'Dr. Mohamed Al-Afandi',
    name_ar: 'د. محمد الافندي',
    specialty: 'جراحة عامة ومسالك بولية',
    specialty_en: 'General Surgery & Urology',
    specialty_ar: 'جراحة عامة ومسالك بولية',
    image_url: null,
    bio: 'خبرة 20 سنة في الجراحة العامة والمسالك البولية. العنوان: عند البنك الأهلي القديم، بجوار صيدلية دكتور جمعة.',
    bio_en: '20 years of experience in general surgery and urology. Address: near the old National Bank, next to Dr. Gomaa Pharmacy.',
    bio_ar: 'خبرة 20 سنة في الجراحة العامة والمسالك البولية. العنوان: عند البنك الأهلي القديم، بجوار صيدلية دكتور جمعة.',
    price: 'استشارة حسب الكشف',
    clinicLocation: 'عند البنك الأهلي القديم، بجوار صيدلية دكتور جمعة',
    clinicLocation_en: 'Near the old National Bank, next to Dr. Gomaa Pharmacy',
    clinicLocation_ar: 'عند البنك الأهلي القديم، بجوار صيدلية دكتور جمعة',
    clinic_link: 'https://maps.app.goo.gl/hCyijNgYe1inGouk9',
    phone_number: null,
    secret_code: 'HC-2026',
  },
  {
    id: 'dr-elya-nassar',
    name: 'Dr. Elya Nassar',
    specialty: 'Cardiologist',
    image_url: null,
    bio: '14 years in advanced cardiac care.',
    price: '$90 consultation',
    phone_number: '+201001112233',
    secret_code: 'HC-9017',
  },
  {
    id: 'dr-adam-fahmy',
    name: 'Dr. Adam Fahmy',
    specialty: 'Neurologist',
    image_url: null,
    bio: '11 years in neuro diagnostics.',
    price: '$110 consultation',
    phone_number: '+201002223344',
    secret_code: 'HC-1142',
  },
  {
    id: 'dr-sara-adel',
    name: 'Dr. Sara Adel',
    specialty: 'Pediatrician',
    image_url: null,
    bio: '9 years in child wellness.',
    price: '$75 consultation',
    phone_number: '+201003334455',
    secret_code: 'HC-2608',
  },
  {
    id: 'dr-omar-ibrahim',
    name: 'Dr. Omar Ibrahim',
    specialty: 'Orthopedic Surgeon',
    image_url: null,
    bio: '16 years in mobility restoration.',
    price: '$120 consultation',
    phone_number: '+201004445566',
    secret_code: 'HC-7784',
  },
]

const fallbackAppointmentsByDoctor = {
  'dr-elya-nassar': [
    { patient_name: 'Aya Mahmoud', phone: '+201055501234', doctor_id: 'dr-elya-nassar', status: 'Pending', time: '09:10' },
    { patient_name: 'Mina Adel', phone: '+201066602345', doctor_id: 'dr-elya-nassar', status: 'In Clinic', time: '09:35' },
  ],
  'dr-adam-fahmy': [
    { patient_name: 'Tamer Hossam', phone: '+201055512345', doctor_id: 'dr-adam-fahmy', status: 'Pending', time: '10:00' },
  ],
  'dr-sara-adel': [
    { patient_name: 'Noor Khaled', phone: '+201055523456', doctor_id: 'dr-sara-adel', status: 'Completed', time: '10:40' },
  ],
  'dr-omar-ibrahim': [
    { patient_name: 'Youssef Omar', phone: '+201055534567', doctor_id: 'dr-omar-ibrahim', status: 'Pending', time: '11:15' },
  ],
}

const appointmentStatusOrder = ['Pending', 'In Clinic', 'Completed']

function cycleAppointmentStatus(status) {
  const currentIndex = appointmentStatusOrder.indexOf(status)
  return appointmentStatusOrder[(currentIndex + 1) % appointmentStatusOrder.length]
}

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

function createLocalAppointment(doctorId, patientName, phone) {
  const appointmentDate = new Date().toISOString()

  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    patient_name: patientName,
    phone,
    appointment_date: appointmentDate,
    time: appointmentDate,
    status: 'Pending',
    doctor_id: doctorId,
    source: 'local',
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

function updateLocalAppointmentStatus(appointmentId, status) {
  const nextAppointments = readLocalAppointments().map(appointment => (
    appointment.id === appointmentId ? { ...appointment, status } : appointment
  ))
  writeLocalAppointments(nextAppointments)
}

const avatarGradients = [
  'from-cyan-400/30 via-sky-500/20 to-emerald-400/25',
  'from-indigo-400/30 via-cyan-500/20 to-sky-400/25',
  'from-emerald-400/30 via-cyan-400/20 to-teal-400/25',
  'from-sky-400/30 via-indigo-500/20 to-cyan-400/25',
]

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
    'Orthopedic Surgeon': 'جرّاح عظام',
    Specialist: 'اختصاصي',
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
    Cardiologist: '١٤ سنة في رعاية القلب المتقدمة.',
    Neurologist: '١١ سنة في تشخيص أمراض الأعصاب.',
    Pediatrician: '٩ سنوات في رعاية الأطفال.',
    'Orthopedic Surgeon': '١٦ سنة في استعادة الحركة والعظام.',
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
    Cardiologist: 'جناح أمراض القلب - هيها كير',
    Neurologist: 'جناح الأعصاب - هيها كير',
    Pediatrician: 'جناح الأطفال - هيها كير',
    'Orthopedic Surgeon': 'وحدة العظام - هيها كير',
    Specialist: 'الجناح الرئيسي - هيها كير',
  },
}

function getText(language, key, ...args) {
  const dictionary = translations[language] || translations.en
  const value = dictionary[key]
  return typeof value === 'function' ? value(...args) : value
}

function normalizePhoneForWa(phoneNumber) {
  return String(phoneNumber || '').replace(/[^\d]/g, '')
}

function makeDoctorFromRow(row) {
  return {
    id: String(row.id),
    name: row.name,
    name_en: row.name_en ?? null,
    name_ar: row.name_ar ?? null,
    specialty: row.specialty || 'Specialist',
    specialty_en: row.specialty_en ?? null,
    specialty_ar: row.specialty_ar ?? null,
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
  }
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

  return language === 'ar'
    ? [
        { id: `${doctorId}-1`, patient_name: 'أية محمود', phone: '+201055501234', doctor_id: doctorId, status: 'Pending', appointment_date: '2026-05-02T09:00:00.000Z', time: '09:00' },
        { id: `${doctorId}-2`, patient_name: 'مينا عادل', phone: '+201066602345', doctor_id: doctorId, status: 'In Clinic', appointment_date: '2026-05-02T09:20:00.000Z', time: '09:20' },
      ]
    : [
        { id: `${doctorId}-1`, patient_name: 'Aya Mahmoud', phone: '+201055501234', doctor_id: doctorId, status: 'Pending', appointment_date: '2026-05-02T09:00:00.000Z', time: '09:00' },
        { id: `${doctorId}-2`, patient_name: 'Mina Adel', phone: '+201066602345', doctor_id: doctorId, status: 'In Clinic', appointment_date: '2026-05-02T09:20:00.000Z', time: '09:20' },
      ]
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

      const { data, error } = await supabase
        .from('doctors')
        .select('id, name, specialty, image_url, price, bio, phone_number')
        .order('name', { ascending: true })

      if (!active) {
        return
      }

      if (error || !Array.isArray(data) || data.length === 0) {
        setDoctors(createFallbackDoctors())
        setDoctorsNotice(getText(language, 'fallbackNotice'))
      } else {
        setDoctors(data.map(makeDoctorFromRow))
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
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage doctors={doctors} loading={loadingDoctors} notice={doctorsNotice} ui={ui} />} />
          <Route path="/portfolio" element={<DashboardPortfolio />} />
          <Route path="/doctor/premium-preview" element={<PremiumDoctorProfile />} />
          <Route path="/doctor/:doctorId" element={<DoctorProfilePage loading={loadingDoctors} notice={doctorsNotice} ui={ui} />} />
          <Route path="/book/:doctorId" element={<BookingPage doctorLookup={doctorLookup} loading={loadingDoctors} notice={doctorsNotice} ui={ui} />} />
          <Route path="/dashboard" element={<DashboardAccessPage ui={ui} />} />
          <Route path="/dashboard/:doctorId" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

function AppShell({ children, ui }) {
  const { language, theme, setLanguage, setTheme, themePulse = false } = ui
  const t = key => getText(language, key)
  const isArabic = language === 'ar'
  const isDark = theme === 'dark'

  return (
    <main className={`relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#020617] dark:text-slate-100 ${themePulse ? 'theme-fade' : ''}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.08),_transparent_32%)] dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_32%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(2,6,23,1))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)] dark:bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)]" />
      <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-400/20" />
      <div className="absolute right-10 top-24 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors duration-300 dark:border-cyan-300/15 dark:bg-white/5 dark:shadow-none">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link to="/" className="flex items-center gap-3 text-slate-900 dark:text-cyan-100">
              <HihyaEmblem theme={theme} />
              <span className="flex flex-col">
                <span className="text-sm font-semibold uppercase tracking-[0.35em]">{t('navBrand')}</span>
                <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  {isArabic ? 'هوية طبية مستقبلية' : 'Futuristic medical identity'}
                </span>
              </span>
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {t('navSubtitle')}
              </div>

              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-slate-950/60">
                <span className="px-2 text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">{t('language')}</span>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
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
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    language === 'ar'
                      ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10'
                  }`}
                >
                  {t('arabic')}
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-slate-950/60">
                <span className="px-2 text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">{t('theme')}</span>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    theme === 'light'
                      ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10'
                  }`}
                >
                  {t('light')}
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    theme === 'dark'
                      ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10'
                  }`}
                >
                  {t('dark')}
                </button>
              </div>
            </div>
          </div>

          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm transition-colors duration-300 ${
              isArabic ? 'text-right' : 'text-left'
            } bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10`}
          >
            {isArabic ? t('rtlBanner') : 'The interface is currently in English with a light default layout for medical clarity.'}
          </div>
        </header>

        <div dir={isArabic ? 'rtl' : 'ltr'}>{children}</div>
      </div>
    </main>
  )
}

function DoctorCard({ doctor, index, ui }) {
  const avatarGradient = avatarGradients[index % avatarGradients.length]
  const t = key => getText(ui.language, key)
  const localizedDoctor = localizeDoctor(ui.language, doctor)

  return (
    <article className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_0_120px_rgba(34,211,238,0.16)] dark:border-cyan-300/15 dark:bg-white/5 dark:shadow-[0_0_80px_rgba(34,211,238,0.08)]">
      <div className={`flex aspect-square h-18 w-18 items-center justify-center overflow-hidden rounded-[1.5rem] border border-slate-200 bg-gradient-to-br ${avatarGradient} shadow-inner dark:border-white/10`}>
        {localizedDoctor.image_url ? (
          <img src={localizedDoctor.image_url} alt={localizedDoctor.name} className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-white/90" fill="none" aria-hidden="true">
            <path
              d="M12 12.4C14.2091 12.4 16 10.6091 16 8.4C16 6.19086 14.2091 4.4 12 4.4C9.79086 4.4 8 6.19086 8 8.4C8 10.6091 9.79086 12.4 12 12.4Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M4.8 19.2C5.9 15.9 8.6 14.2 12 14.2C15.4 14.2 18.1 15.9 19.2 19.2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.38em] text-cyan-700/70 dark:text-cyan-200/70">{t('doctorCardTitle')}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">{localizedDoctor.name}</h3>
        <p className="mt-1 text-sm text-cyan-700/80 dark:text-cyan-100/80">{localizedDoctor.specialty}</p>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-950/55 dark:text-slate-300">
        <p>{localizedDoctor.bio || t('doctorFallbackBio')}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-slate-300">
        <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-emerald-700 dark:text-emerald-100">
          {localizedDoctor.price}
        </span>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-cyan-700 dark:text-cyan-100">
          {localizedDoctor.phone_number ? t('doctorWhatsAppReady') : t('doctorNoPhone')}
        </span>
      </div>

      <Link
        to={`/doctor/${localizedDoctor.id}`}
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-cyan-300/25 bg-gradient-to-r from-cyan-400/20 via-sky-500/20 to-emerald-400/20 px-4 py-3 text-sm font-semibold text-cyan-800 transition duration-300 hover:-translate-y-0.5 hover:bg-cyan-400/25 dark:text-cyan-100"
      >
        {t('doctorViewProfile')}
      </Link>
    </article>
  )
}

function HomePage({ doctors, loading, notice, ui }) {
  const t = key => getText(ui.language, key)

  return (
    <AppShell ui={ui}>
      <section className="animate-[fadeIn_0.6s_ease-out]">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-700/70 dark:text-cyan-200/70">{t('homeKicker')}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-900 dark:text-white sm:text-5xl">
            {t('homeTitle')}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            {t('homeDescription')}
          </p>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-slate-600 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {t('loadingDoctors')}
          </div>
        ) : notice ? (
          <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-50 p-6 text-sm text-emerald-800 backdrop-blur-2xl dark:bg-emerald-500/10 dark:text-emerald-100">
            {notice}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor, index) => (
            <DoctorCard key={doctor.id} doctor={doctor} index={index} ui={ui} />
          ))}
        </div>
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

      const { data, error } = await supabase
        .from('doctors')
        .select('id, name, specialty, image_url, price, bio, phone_number, secret_code')
        .eq('id', doctorId)
        .maybeSingle()

      if (!active) {
        return
      }

      if (error || !data) {
        const fallbackDoctor = createFallbackDoctor(doctorId)
        if (fallbackDoctor) {
          setDoctor(localizeDoctor(language, fallbackDoctor))
          setNotice(getText(language, 'supplyNotice'))
        } else {
          setDoctor(null)
          setNotice(error?.message || getText(language, 'doctorNotFoundDescription'))
        }
      } else {
        setDoctor(localizeDoctor(language, makeDoctorFromRow(data)))
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
      return () => {
        active = false
      }
    }

    const loadDoctor = async () => {
      setLoading(true)
      setNotice('')

      const { data, error } = await supabase
        .from('doctors')
        .select('id, name, specialty, image_url, price, bio, phone_number, secret_code')
        .eq('secret_code', normalizedCode)
        .maybeSingle()

      if (!active) {
        return
      }

      if (error || !data) {
        const fallbackDoctor = createFallbackDoctorByCode(normalizedCode)
        if (fallbackDoctor) {
          setDoctor(localizeDoctor(language, fallbackDoctor))
          setNotice(getText(language, 'supplyNotice'))
        } else {
          setDoctor(null)
          setNotice(getText(language, 'invalidDashboardCode'))
        }
      } else {
        setDoctor(localizeDoctor(language, makeDoctorFromRow(data)))
      }

      setLoading(false)
    }

    loadDoctor()

    return () => {
      active = false
    }
  }, [secretCode, language])

  return { doctor, loading, notice }
}

function DoctorProfilePage({ loading, notice, ui }) {
  const t = key => getText(ui.language, key)
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { doctor, loading: doctorLoading, notice: doctorNotice } = useDoctorById(doctorId, ui.language)
  const clinicMapHref = doctor?.clinic_link || 'https://maps.app.goo.gl/hCyijNgYe1inGouk9'

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

  return (
    <AppShell ui={ui}>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-cyan-300/15 bg-white p-6 backdrop-blur-2xl dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-700/70 dark:text-cyan-200/70">{t('profileTitle')}</p>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">{doctor.name}</h1>
              <p className="mt-2 text-cyan-700/80 dark:text-cyan-100/80">{doctor.specialty}</p>
            </div>
            <div className="rounded-full border border-emerald-400/25 bg-emerald-100 px-4 py-2 text-sm text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-100">
              {t('acceptingAppointments')}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <InfoPanel label={t('experience')} value={doctor.experience || doctor.bio || getText(ui.language, 'doctorFallbackBio')} />
            <InfoPanel label={t('clinicLocation')} value={doctor.clinicLocation || (ui.language === 'ar' ? 'الجناح الرئيسي - هيها كير' : 'Hihya Care main wing')} />
            <InfoPanel label={t('price')} value={doctor.price} />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={clinicMapHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-400/15 dark:text-cyan-100"
            >
              {t('clinicMapLink')}
            </a>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:border-white/10 dark:bg-slate-950/60">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {ui.language === 'ar'
                ? 'هذه صفحة ملف طبي احترافية بنفس اللغة البصرية لتدفق الحجز.'
                : 'This is a premium intake profile with the same visual language as the booking flow.'}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/book/${doctor.id}`)}
              className="rounded-2xl border border-cyan-300/25 bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
            >
              {t('bookNow')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-2xl border border-emerald-300/20 bg-emerald-100 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-100 dark:hover:bg-emerald-400/15"
            >
              {t('dashboard')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            >
              {t('backToDoctors')}
            </button>
          </div>
        </section>

        <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.45em] text-slate-500 dark:text-slate-400">{t('profileSignal')}</p>
          <div className="mt-4 rounded-[1.5rem] border border-cyan-300/15 bg-slate-50 p-5 dark:bg-slate-950/60">
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('specialty')}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{doctor.specialty}</p>
            <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">{t('clinicLocation')}</p>
            <p className="mt-1 text-lg text-cyan-800 dark:text-cyan-100">{doctor.clinicLocation || (ui.language === 'ar' ? 'الجناح الرئيسي - هيها كير' : 'Hihya Care main wing')}</p>
            <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">{t('consultationFee')}</p>
            <p className="mt-1 text-lg text-emerald-700 dark:text-emerald-100">{doctor.price}</p>
            <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">{t('whatsapp')}</p>
            <p className="mt-1 text-lg text-cyan-800 dark:text-cyan-100">
              {doctor.phone_number ? `wa.me/${normalizePhoneForWa(doctor.phone_number)}` : (ui.language === 'ar' ? 'غير مكوّن' : 'Not configured')}
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  )
}

function useAppointmentsByDoctorId(doctorId, language) {
  const appointmentsQuery = useQuery({
    queryKey: ['appointments', doctorId, language],
    enabled: Boolean(doctorId),
    queryFn: async () => {
      if (!doctorId) {
        return { appointments: [], notice: '' }
      }

      const { data, error } = await supabase
        .from('appointments')
        .select('id, patient_name, phone, appointment_date, time, status, doctor_id')
        .eq('doctor_id', doctorId)
        .order('appointment_date', { ascending: true })

      if (error || !Array.isArray(data)) {
        return {
          appointments: createFallbackAppointments(doctorId, language),
          notice: getText(language, 'appointmentsFallbackNotice'),
        }
      }

      const remoteAppointments = data.map((appointment, index) => ({
        ...appointment,
        id: appointment.id ?? `${appointment.doctor_id}-${index}`,
        status: appointment.status || 'Pending',
        appointment_date: appointment.appointment_date || appointment.time || new Date().toISOString(),
        time: appointment.time || '09:00',
      }))

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

      return {
        appointments: mergedAppointments,
        notice: '',
      }
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
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

  return {
    appointments: appointmentsQuery.data?.appointments || [],
    setAppointments,
    loading: appointmentsQuery.isLoading,
    notice: appointmentsQuery.data?.notice || '',
  }
}

function BookingPage({ doctorLookup, loading, notice, ui }) {
  const t = key => getText(ui.language, key)
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const queryCache = useQueryClient()
  const [patientName, setPatientName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [appointmentDate, setAppointmentDate] = useState(() => toDatetimeLocalValue(new Date()))
  const [status, setStatus] = useState('idle')
  const [feedback, setFeedback] = useState('')
  const [toast, setToast] = useState(null)

  const doctor = doctorId ? doctorLookup.get(doctorId) : null
  const selectedDoctor = doctor ? localizeDoctor(ui.language, doctor) : (doctorId ? localizeDoctor(ui.language, createFallbackDoctor(doctorId)) : null)

  const whatsappLink = selectedDoctor?.phone_number
    ? `https://wa.me/${normalizePhoneForWa(selectedDoctor.phone_number)}?text=${encodeURIComponent(
        `Hello Hihya Care, I just booked an appointment with ${selectedDoctor.name} via the platform.`,
      )}`
    : ''

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => setToast(null), 4200)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  const handleSubmit = async event => {
    event.preventDefault()

    if (!doctorId || !selectedDoctor) {
      setStatus('error')
      setFeedback(ui.language === 'ar' ? 'بيانات الطبيب ما زالت تُحمّل. حاول مرة أخرى بعد لحظات.' : 'Doctor data is still loading. Please try again in a moment.')
      return
    }

    const trimmedName = patientName.trim()
    const trimmedPhone = phoneNumber.trim()
    const trimmedAppointmentDate = appointmentDate.trim()

    if (!trimmedName || !trimmedPhone || !trimmedAppointmentDate) {
      setStatus('error')
      setFeedback(
        ui.language === 'ar'
          ? 'يرجى إدخال اسم المريض ورقم الهاتف وتاريخ الموعد.'
          : 'Please enter the patient name, phone number, and appointment date.',
      )
      return
    }

    try {
      setStatus('loading')
      setFeedback(ui.language === 'ar' ? 'جارٍ تأكيد الموعد...' : 'Securing appointment...')

      const { error } = await supabase.from('appointments').insert([
        {
          patient_name: trimmedName,
          phone: trimmedPhone,
          doctor_id: doctorId,
          appointment_date: new Date(trimmedAppointmentDate).toISOString(),
          status: 'Pending',
        },
      ])

      if (error) {
        throw error
      }

      if (selectedDoctor.phone_number) {
        const whatsappApiUrl = String(import.meta.env.VITE_WHATSAPP_API_URL || '').trim()

        if (whatsappApiUrl) {
          try {
            await fetch(whatsappApiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                doctor_id: selectedDoctor.id,
                doctor_name: selectedDoctor.name,
                doctor_phone: selectedDoctor.phone_number,
                patient_name: trimmedName,
                patient_phone: trimmedPhone,
                appointment_date: new Date(trimmedAppointmentDate).toISOString(),
                message: `New booking from ${trimmedName} for ${selectedDoctor.name}`,
              }),
            })
            setToast({
              tone: 'success',
              title: t('bookingToastTitle'),
              message: t('whatsappQueued'),
            })
          } catch {
            setToast({
              tone: 'warning',
              title: t('bookingToastTitle'),
              message: t('whatsappFallback'),
            })
          }
        } else {
          setToast({
            tone: 'warning',
            title: t('bookingToastTitle'),
            message: t('whatsappFallback'),
          })
        }
      } else {
        setToast({
          tone: 'warning',
          title: t('bookingToastTitle'),
          message: t('whatsappMissing'),
        })
      }

      await queryCache.invalidateQueries({ queryKey: ['appointments', doctorId] })

      setPatientName('')
      setPhoneNumber('')
      setAppointmentDate(toDatetimeLocalValue(new Date()))
      setStatus('success')
      setFeedback(t('successMessage'))
    } catch (error) {
      const localAppointment = saveLocalAppointment(createLocalAppointment(doctorId, trimmedName, trimmedPhone))
      queryCache.invalidateQueries({ queryKey: ['appointments', doctorId] })
      setPatientName('')
      setPhoneNumber('')
      setAppointmentDate(toDatetimeLocalValue(new Date()))
      setStatus('success')
      setFeedback(
        ui.language === 'ar'
          ? `تم تأكيد الموعد وحفظه محليًا مؤقتًا بسبب مشكلة في Supabase. ${localAppointment.patient_name}`
          : `Appointment confirmed and saved locally because Supabase rejected the insert. ${localAppointment.patient_name}`,
      )
      setToast({
        tone: 'warning',
        title: t('bookingToastTitle'),
        message: t('whatsappFallback'),
      })
    }
  }

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'

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
              {[
                { label: 'Latency', value: '< 1s', tone: 'text-cyan-700 dark:text-cyan-200' },
                { label: 'Mode', value: 'Encrypted', tone: 'text-emerald-700 dark:text-emerald-200' },
                { label: 'Storage', value: 'Supabase', tone: 'text-sky-700 dark:text-sky-200' },
              ].map(item => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className={`mt-2 text-lg font-semibold ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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

              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-cyan-300/25 bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 px-5 py-4 text-sm font-semibold text-slate-950 shadow-[0_10px_40px_rgba(34,211,238,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_60px_rgba(34,211,238,0.36)] focus:outline-none focus:ring-2 focus:ring-cyan-200/70 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 dark:focus:ring-offset-slate-950"
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
                      : status === 'error'
                        ? 'border-rose-300/30 bg-rose-500/15 text-rose-200'
                        : 'border-cyan-300/20 bg-cyan-400/10 text-cyan-100'
                  }`}
                >
                  {isSuccess ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path d="M20 7L10.5 16.5L4 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
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
                    {isSuccess ? t('successTitle') : status === 'error' ? t('errorTitle') : t('readyStatus')}
                  </p>
                  {isSuccess ? (
                    <div className="mt-2 space-y-3">
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{feedback || t('successMessage')}</p>
                      {selectedDoctor?.phone_number ? (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-400/20 dark:text-emerald-100 dark:hover:bg-emerald-400/20"
                        >
                          {t('whatsappCta')}
                        </a>
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

function DashboardAccessPage({ ui }) {
  const t = key => getText(ui.language, key)
  const navigate = useNavigate()
  const [secretCode, setSecretCode] = useState('')
  const [submittedCode, setSubmittedCode] = useState('')
  const [actionNotice, setActionNotice] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [session, setSession] = useState(null)
  const { doctor, loading: doctorLoading, notice: doctorNotice } = useDoctorByCode(submittedCode, ui.language)
  const { appointments, setAppointments, loading: appointmentsLoading, notice: appointmentsNotice } = useAppointmentsByDoctorId(doctor?.id, ui.language)

  const resolvedAppointments = appointments || []

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

      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined
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

  const handleSubmit = event => {
    event.preventDefault()
    setSubmittedCode(secretCode.trim())
    setActionNotice('')
  }

  const handleToggleStatus = async appointment => {
    if (!doctor?.id) {
      return
    }

    const nextStatus = cycleAppointmentStatus(appointment.status)
    const previousStatus = appointment.status
    const isLocalAppointment = String(appointment.id || '').startsWith('local-') || appointment.source === 'local'

    if (isLocalAppointment) {
      setAppointments(previous => previous.map(item => (item.id === appointment.id ? { ...item, status: nextStatus } : item)))
      updateLocalAppointmentStatus(appointment.id, nextStatus)
      setActionNotice(`${t('statusUpdated')}: ${appointment.patient_name}`)
      return
    }

    setAppointments(previous => previous.map(item => (item.id === appointment.id ? { ...item, status: nextStatus } : item)))
    setActionNotice('')

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: nextStatus })
        .eq('id', appointment.id)

      if (error) {
        throw error
      }

      setActionNotice(`${t('statusUpdated')}: ${appointment.patient_name}`)
    } catch (error) {
      setAppointments(previous => previous.map(item => (item.id === appointment.id ? { ...item, status: previousStatus } : item)))
      setActionNotice(error instanceof Error ? error.message : t('errorTitle'))
    }
  }

  return (
    <AppShell ui={ui}>
      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6 rounded-[2rem] border border-white/40 bg-white/70 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-800/60">
          <div className="rounded-[1.6rem] border border-white/40 bg-white/70 p-5 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.02)] dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-700/70 dark:text-cyan-200/70">{t('dashboardLogin')}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">{t('dashboardAuthTitle')}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('dashboardAuthIntro')}</p>

            <form className="mt-5 space-y-3" onSubmit={handleLogin}>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200/60 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                value={loginEmail}
                onChange={event => setLoginEmail(event.target.value)}
                placeholder={t('dashboardEmailPlaceholder')}
                autoComplete="email"
                inputMode="email"
              />
              <button
                type="submit"
                disabled={loginLoading}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loginLoading ? t('finalizingBooking') : t('sendMagicLink')}
              </button>
            </form>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-500 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300">
              {session ? t('dashboardSessionActive') : ui.language === 'ar' ? 'لم يتم العثور على جلسة بعد. يمكن متابعة رمز الطبيب أثناء انتظار البريد الإلكتروني.' : 'No active session yet. You can continue with the doctor code while the magic link is delivered.'}
            </div>

            {authNotice ? (
              <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100">
                {authNotice}
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.6rem] border border-white/40 bg-white/70 p-5 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.02)] dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-700/70 dark:text-cyan-200/70">{t('dashboardCodeGateTitle')}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">{t('privateDoctorCode')}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('dashboardCodeGateIntro')}</p>
            <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">{t('dashboardCodeHelper')}</p>

            <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200/60 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                value={secretCode}
                onChange={event => setSecretCode(event.target.value)}
                placeholder={t('dashboardCodePlaceholder')}
                autoComplete="off"
              />
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.24)] transition hover:-translate-y-0.5"
              >
                {t('unlockDashboard')}
              </button>
            </form>

            <div className="mt-5 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">{t('language')}</span>
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-slate-900/60">
                  <button
                    type="button"
                    onClick={() => ui.setLanguage('en')}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${ui.language === 'en' ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950' : 'text-slate-500 dark:text-slate-300'}`}
                  >
                    {t('english')}
                  </button>
                  <button
                    type="button"
                    onClick={() => ui.setLanguage('ar')}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${ui.language === 'ar' ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950' : 'text-slate-500 dark:text-slate-300'}`}
                  >
                    {t('arabic')}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">{t('theme')}</span>
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-slate-900/60">
                  <button
                    type="button"
                    onClick={() => ui.setTheme('light')}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${ui.theme === 'light' ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950' : 'text-slate-500 dark:text-slate-300'}`}
                  >
                    {t('light')}
                  </button>
                  <button
                    type="button"
                    onClick={() => ui.setTheme('dark')}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${ui.theme === 'dark' ? 'bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950' : 'text-slate-500 dark:text-slate-300'}`}
                  >
                    {t('dark')}
                  </button>
                </div>
              </div>
            </div>

            {doctorNotice || actionNotice ? (
              <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100">
                {doctorNotice || actionNotice}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
          >
            {t('backToDoctors')}
          </button>
        </aside>

        <DoctorDashboardPage
          doctor={doctor}
          doctorLoading={doctorLoading}
          appointments={resolvedAppointments}
          setAppointments={setAppointments}
          appointmentsLoading={appointmentsLoading}
          appointmentsNotice={appointmentsNotice}
          ui={ui}
          onToggleStatus={handleToggleStatus}
        />
      </section>
    </AppShell>
  )
}

function DoctorDashboardPage({ doctor, doctorLoading, appointments, appointmentsLoading, appointmentsNotice, ui, onToggleStatus }) {
  const t = key => getText(ui.language, key)
  const isArabic = ui.language === 'ar'
  const analytics = useMemo(() => buildAnalyticsSummary(appointments, doctor, ui.language), [appointments, doctor, ui.language])

  const totals = appointmentStatusOrder.reduce(
    (accumulator, status) => ({
      ...accumulator,
      [status]: appointments.filter(appointment => appointment.status === status).length,
    }),
    {},
  )

  const handleExport = () => {
    const rows = buildAppointmentCsvRows(appointments, doctor, ui.language)
    downloadCsv(`hihya-care-${doctor?.id || 'dashboard'}-appointments.csv`, rows)
  }

  return (
    <div className="rounded-[2rem] border border-white/40 bg-white/70 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 sm:p-6">
      <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:border-white/10 dark:bg-slate-950/60 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-700/70 dark:text-cyan-200/70">{t('dashboardAppointments')}</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
              {doctor ? t('dashboardUnlocked') : doctorLoading ? t('loadingDoctorData') : t('enterDashboardCode')}
            </h2>
            <p className={`mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 ${isArabic ? 'text-right' : 'text-left'}`}>
              {t('dashboardIntro')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
            <MetricCard label={t('todayPatients')} value={String(analytics.todayPatients)} tone="text-cyan-700 dark:text-cyan-100" />
            <MetricCard label={t('monthPatients')} value={String(analytics.currentMonthPatients)} tone="text-emerald-700 dark:text-emerald-100" />
            <MetricCard label={t('revenueEstimate')} value={`$${analytics.revenueEstimate.toLocaleString()}`} tone="text-sky-700 dark:text-sky-100" />
            <MetricCard label={t('dashboardTotalWaiting')} value={String(totals.Pending || 0)} tone="text-emerald-700 dark:text-emerald-100" />
            <MetricCard label={t('dashboardState')} value={String(totals['In Clinic'] || 0)} tone="text-cyan-700 dark:text-cyan-100" />
            <MetricCard label={t('completedStatus')} value={String(totals.Completed || 0)} tone="text-sky-700 dark:text-sky-100" />
            <MetricCard label={t('dashboardDoctorId')} value={doctor?.id || 'N/A'} tone="text-slate-700 dark:text-slate-100" />
          </div>
        </div>

        {doctor ? (
          <div className="mt-6 rounded-[1.5rem] border border-cyan-300/15 bg-white/70 p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] dark:bg-slate-950/60">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboardIdentity')}</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{doctor.name}</h3>
                <p className="mt-1 text-cyan-700/80 dark:text-cyan-100/80">{doctor.specialty}</p>
              </div>
              <div className="rounded-full border border-emerald-400/25 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-100">
                {doctor.secret_code || 'Code linked'}
              </div>
            </div>
          </div>
        ) : null}

        {appointmentsLoading ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {t('loadingAppointmentsData')}
          </div>
        ) : appointmentsNotice ? (
          <div className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100">
            {appointmentsNotice}
          </div>
        ) : null}

        <div className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.6rem] border border-slate-200 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-700/70 dark:text-cyan-200/70">{t('analyticsTitle')}</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{t('statusBreakdown')}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('analyticsIntro')}</p>
              </div>
              <button
                type="button"
                onClick={handleExport}
                className="rounded-2xl border border-cyan-300/25 bg-cyan-400/15 px-4 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-400/20 dark:text-cyan-100"
              >
                {t('exportReport')}
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/60">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('statusBreakdown')}</p>
                <div className="mt-3 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.statusBreakdown}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={64}
                        outerRadius={94}
                        paddingAngle={3}
                      >
                        {analytics.statusBreakdown.map((entry, index) => (
                          <Cell
                            key={entry.label}
                            fill={['#06b6d4', '#10b981', '#0ea5e9'][index % 3]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/60">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('peakDay')}</p>
                <div className="mt-3 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.weekdayCounts}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#06b6d4" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-700/70 dark:text-cyan-200/70">{t('monthlyReport')}</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{t('monthlyTrends')}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('currentMonth')}</p>

            <div className="mt-5 h-56 rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthSeries}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="appointments" stroke="#10b981" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="completed" stroke="#06b6d4" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/60">
              <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-white/10">
                <thead className="bg-slate-50 text-left text-slate-500 dark:bg-white/5 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t('currentMonth')}</th>
                    <th className="px-4 py-3 font-medium">{t('appointmentsTitle')}</th>
                    <th className="px-4 py-3 font-medium">{t('completedStatus')}</th>
                    <th className="px-4 py-3 font-medium">{t('revenueEstimate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {analytics.monthSeries.map(row => (
                    <tr key={row.key} className="text-slate-700 dark:text-slate-200">
                      <td className="px-4 py-3">{row.label}</td>
                      <td className="px-4 py-3">{row.appointments}</td>
                      <td className="px-4 py-3">{row.completed}</td>
                      <td className="px-4 py-3">${row.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {appointments.length ? (
            appointments.map(appointment => {
              const localizedStatus = localizeAppointmentStatus(ui.language, appointment.status)
              const nextStatus = cycleAppointmentStatus(appointment.status)

              return (
                <div
                  key={appointment.id}
                  className="rounded-[1.5rem] border border-white/40 bg-white/75 p-4 shadow-[0_16px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition hover:shadow-[0_18px_36px_rgba(34,211,238,0.16)] dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{appointment.patient_name}</p>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${statusBadgeClass(appointment.status)}`}>
                          {localizedStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{appointment.phone}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatAppointmentDate(appointment, ui.language)}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleStatus(appointment)}
                      className="rounded-2xl border border-cyan-300/25 bg-gradient-to-r from-cyan-400/20 via-sky-500/20 to-emerald-400/20 px-4 py-3 text-sm font-semibold text-cyan-800 transition hover:-translate-y-0.5 hover:bg-cyan-400/25 dark:text-cyan-100"
                    >
                      {t('toggleStatus')} → {localizeAppointmentStatus(ui.language, nextStatus)}
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {t('noAppointments')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function statusBadgeClass(status) {
  switch (status) {
    case 'In Clinic':
      return 'border-cyan-300/30 bg-cyan-400/15 text-cyan-700 dark:text-cyan-100'
    case 'Completed':
      return 'border-emerald-300/30 bg-emerald-400/15 text-emerald-700 dark:text-emerald-100'
    default:
      return 'border-slate-300/50 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
  }
}

function MetricCard({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${tone}`}>{value}</p>
    </div>
  )
}

function InfoPanel({ label, value, ui }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-100">{value}</p>
    </div>
  )
}

export default App
