import { useState } from 'react'
import { CheckCircle, Clock, AlertCircle, Share2 } from 'lucide-react'

export default function EnhancedBookingFlow({ doctor, onConfirm, onCancel }) {
  const [step, setStep] = useState('details') // details -> payment -> confirm
  const [patientName, setPatientName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedDate, setSelectedDate] = useState('today')
  const [selectedTime, setSelectedTime] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [priority, setPriority] = useState('normal')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const availabilitySlots = {
    today: ['9:30 AM', '10:15 AM', '2:30 PM', '3:45 PM'],
    tomorrow: ['8:45 AM', '11:00 AM', '1:30 PM', '4:00 PM'],
    dayAfter: ['9:00 AM', '10:30 AM', '3:00 PM', '5:15 PM'],
  }

  const priorityOptions = [
    { id: 'normal', label: 'عادي', description: 'ترتيب طبيعي' },
    { id: 'urgent', label: 'عاجل', description: 'تقديم في الطابور', price: '+50 ر.س' },
    { id: 'vip', label: 'VIP', description: 'موعد محجوز خاص', price: '+100 ر.س' },
  ]

  const paymentMethods = [
    { id: 'cash', label: 'دفع في العيادة', description: 'دفع عند الزيارة' },
    { id: 'online', label: 'دفع أون لاين', description: 'دفع آمن عبر بطاقة' },
  ]

  const calculateTotal = () => {
    let total = parseInt(doctor?.price?.match(/\d+/)?.[0] || '0')
    if (priority === 'urgent') total += 50
    if (priority === 'vip') total += 100
    return total
  }

  const handleStepOne = (e) => {
    e.preventDefault()
    if (patientName.trim() && phoneNumber.trim() && selectedTime) {
      setStep('payment')
    }
  }

  const handleConfirmBooking = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const bookingData = {
        patientName,
        phoneNumber,
        doctorId: doctor.id,
        doctorName: doctor.name,
        date: selectedDate,
        time: selectedTime,
        priority,
        paymentMethod,
        notes,
        totalPrice: calculateTotal(),
        timestamp: new Date().toISOString(),
      }

      // Send WhatsApp message
      const whatsappMessage = `السلام عليكم ورحمة الله
تم تأكيد حجزك مع ${doctor.name}
📅 الموعد: ${selectedDate === 'today' ? 'اليوم' : selectedDate === 'tomorrow' ? 'غداً' : 'بعد غد'} الساعة ${selectedTime}
👤 الاسم: ${patientName}
📱 الرقم: ${phoneNumber}
💳 طريقة الدفع: ${paymentMethod === 'cash' ? 'دفع في العيادة' : 'دفع أون لاين'}
💰 الإجمالي: ${calculateTotal()} ر.س`

      const whatsappLink = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`

      onConfirm?.(bookingData, whatsappLink)
    } catch (error) {
      console.error('Booking error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4">
      {/* Header */}
      <button
        onClick={onCancel}
        className="mb-8 flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        رجوع
      </button>

      <div className="mx-auto max-w-2xl">
        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-between">
          <div
            className={`flex items-center gap-3 ${step === 'details' ? 'text-cyan-400' : 'text-slate-500'}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 bg-cyan-400/10">
              1
            </div>
            <span className="font-semibold">بيانات الحجز</span>
          </div>
          <div className={`h-1 flex-1 mx-4 rounded-full ${step === 'payment' ? 'bg-cyan-400' : 'bg-slate-700'}`} />
          <div
            className={`flex items-center gap-3 ${step === 'payment' ? 'text-cyan-400' : 'text-slate-500'}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 bg-cyan-400/10">
              2
            </div>
            <span className="font-semibold">الدفع</span>
          </div>
        </div>

        {/* Doctor Summary */}
        <div className="mb-8 rounded-2xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 flex items-center justify-center flex-shrink-0">
              👨‍⚕️
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{doctor.name}</h2>
              <p className="text-sm text-cyan-300">{doctor.specialty}</p>
              <p className="mt-2 text-sm text-slate-400">{doctor.clinicLocation}</p>
            </div>
          </div>
        </div>

        {/* Step 1: Details */}
        {step === 'details' && (
          <form onSubmit={handleStepOne} className="space-y-6">
            {/* Patient Info */}
            <div className="rounded-2xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">بيانات المريض</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">الاسم الكامل</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="أحمد محمود"
                    className="w-full rounded-lg bg-slate-950/60 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400/50 outline-none transition"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">رقم الجوال</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="966501234567"
                    className="w-full rounded-lg bg-slate-950/60 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400/50 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="rounded-2xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">اختر الموعد</h3>
              <div className="mb-4 grid grid-cols-3 gap-3">
                {['today', 'tomorrow', 'dayAfter'].map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date)
                      setSelectedTime('')
                    }}
                    className={`py-3 rounded-lg transition font-medium ${
                      selectedDate === date
                        ? 'bg-cyan-500 text-white border border-cyan-400'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {date === 'today' && 'اليوم'}
                    {date === 'tomorrow' && 'غداً'}
                    {date === 'dayAfter' && 'بعد غد'}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {availabilitySlots[selectedDate]?.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 rounded-lg text-sm transition ${
                      selectedTime === time
                        ? 'bg-emerald-500 text-white border border-emerald-400'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="rounded-2xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">مستوى الأولوية</h3>
              <div className="space-y-2">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPriority(opt.id)}
                    className={`w-full p-4 rounded-lg text-left transition ${
                      priority === opt.id
                        ? 'border-2 border-cyan-400 bg-cyan-400/10'
                        : 'border-2 border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{opt.label}</p>
                        <p className="text-xs text-slate-400">{opt.description}</p>
                      </div>
                      {opt.price && <p className="text-cyan-300 font-semibold">{opt.price}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">ملاحظات إضافية (اختياري)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات تود إخبار الدكتور بها..."
                className="w-full h-24 rounded-lg bg-slate-950/60 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400/50 outline-none transition resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition"
            >
              التالي: الدفع
            </button>
          </form>
        )}

        {/* Step 2: Payment */}
        {step === 'payment' && (
          <form onSubmit={handleConfirmBooking} className="space-y-6">
            {/* Booking Summary */}
            <div className="rounded-2xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">ملخص الحجز</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">المريض:</span>
                  <span className="text-white font-medium">{patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الموعد:</span>
                  <span className="text-white font-medium">
                    {selectedDate === 'today' ? 'اليوم' : selectedDate === 'tomorrow' ? 'غداً' : 'بعد غد'} - {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الأولوية:</span>
                  <span className="text-white font-medium">
                    {priorityOptions.find((p) => p.id === priority)?.label}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-3 mt-3 flex justify-between font-semibold">
                  <span className="text-cyan-300">الإجمالي:</span>
                  <span className="text-emerald-300">{calculateTotal()} ر.س</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="rounded-2xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">طريقة الدفع</h3>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full p-4 rounded-lg text-left transition ${
                      paymentMethod === method.id
                        ? 'border-2 border-cyan-400 bg-cyan-400/10'
                        : 'border-2 border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <p className="font-semibold text-white">{method.label}</p>
                    <p className="text-xs text-slate-400">{method.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4 flex gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-100">
                <p className="font-semibold">تأكيد الحجز</p>
                <p className="text-xs mt-1">سيتم تأكيد حجزك عند الضغط على الزر، وستتلقى رسالة WhatsApp تأكيد</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex-1 py-3 rounded-lg border border-white/10 text-white font-semibold hover:bg-white/5 transition"
              >
                السابق
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50 transition"
              >
                {isLoading ? 'جاري المعالجة...' : 'تأكيد الحجز'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
