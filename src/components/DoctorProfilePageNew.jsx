import { useState } from 'react'
import { Star, MapPin, Phone, Clock, User, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function DoctorProfilePageNew({ doctor, onBooking, onGoBack }) {
  const [selectedDate, setSelectedDate] = useState('today')
  const [selectedTime, setSelectedTime] = useState(null)
  const [reviewText, setReviewText] = useState('')
  const [userRating, setUserRating] = useState(5)
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'أحمد محمود',
      rating: 5,
      text: 'دكتور ممتاز جداً، علاج احترافي وفحص دقيق',
      date: '2024-01-15',
      avatar: '👨‍⚕️',
    },
    {
      id: 2,
      name: 'فاطمة علي',
      rating: 4.5,
      text: 'خدمة رائعة وانتظار قليل جداً',
      date: '2024-01-14',
      avatar: '👩‍⚕️',
    },
  ])

  // Mock availability slots
  const availabilitySlots = {
    today: ['9:30 AM', '10:15 AM', '2:30 PM', '3:45 PM'],
    tomorrow: ['8:45 AM', '11:00 AM', '1:30 PM', '4:00 PM'],
    dayAfter: ['9:00 AM', '10:30 AM', '3:00 PM', '5:15 PM'],
  }

  // Mock clinic images
  const clinicImages = [
    { id: 1, url: 'https://images.unsplash.com/photo-1576091160550-112173e7f891?w=400&h=300&fit=crop', alt: 'عيادة 1' },
    { id: 2, url: 'https://images.unsplash.com/photo-1579154204601-01d430e5b75c?w=400&h=300&fit=crop', alt: 'عيادة 2' },
    { id: 3, url: 'https://images.unsplash.com/photo-1631217314830-4b42a88a70cd?w=400&h=300&fit=crop', alt: 'عيادة 3' },
  ]

  const handleAddReview = () => {
    if (reviewText.trim()) {
      const newReview = {
        id: reviews.length + 1,
        name: 'أنت',
        rating: userRating,
        text: reviewText,
        date: new Date().toISOString().split('T')[0],
        avatar: '👤',
      }
      setReviews([newReview, ...reviews])
      setReviewText('')
      setUserRating(5)
    }
  }

  const handleBooking = () => {
    if (selectedTime && doctor) {
      onBooking?.(doctor.id, selectedDate, selectedTime)
    }
  }

  const avgRating = 4.75

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Back button */}
      <button
        onClick={onGoBack}
        className="sticky top-4 left-4 z-40 rounded-full bg-white/10 backdrop-blur-xl p-2 hover:bg-white/20 transition"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Hero Section with Doctor Info */}
      <div className="relative mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Doctor Image & Quick Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Doctor Image */}
              <div className="rounded-3xl overflow-hidden border-2 border-cyan-400/30 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
                <div className="w-36 h-36 bg-gradient-to-br from-cyan-400/20 via-sky-500/20 to-emerald-400/20 flex items-center justify-center">
                  {doctor?.image_url ? (
                    <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl">👨‍⚕️</div>
                  )}
                </div>
              </div>

              {/* Rating Section */}
              <div className="rounded-2xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <div className="text-sm text-slate-300">
                  <p className="font-semibold text-white">{avgRating} / 5</p>
                  <p className="text-xs text-slate-400 mt-1">
                    بناءً على {reviews.length} تقييم
                  </p>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="space-y-2">
                {doctor?.phone_number && (
                  <a
                    href={`tel:${doctor.phone_number}`}
                    className="flex items-center gap-3 rounded-xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-3 hover:bg-white/10 transition text-sm text-cyan-100"
                  >
                    <Phone className="w-4 h-4" />
                    {doctor.phone_number}
                  </a>
                )}
                <a
                  href={`https://wa.me/${doctor?.phone_number?.replace(/[^0-9]/g, '')}`}
                  className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-white/5 backdrop-blur-xl p-3 hover:bg-white/10 transition text-sm text-emerald-100"
                >
                  <MessageSquare className="w-4 h-4" />
                  واتس آب
                </a>
              </div>
            </div>
          </div>

          {/* Middle & Right: Details & Availability */}
          <div className="lg:col-span-2 space-y-8">
            {/* Doctor Info Header */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {doctor?.name}
              </h1>
              <p className="text-xl text-cyan-300 mb-4">
                {doctor?.specialty}
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-sm text-cyan-200">
                  <Clock className="w-4 h-4" />
                  وقت الانتظار: {doctor?.wait_minutes || '20'} دقيقة
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-sm text-emerald-200">
                  ✓ متاح للحجز الآن
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="rounded-2xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="text-sm font-semibold text-cyan-300 mb-3">نبذة عن الدكتور</h3>
              <p className="text-slate-300 leading-relaxed">
                {doctor?.bio || 'متخصص طبي ذو خبرة عميقة وكفاءة عالية في مجال التخصص'}
              </p>
            </div>

            {/* Booking Info Alert */}
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-200">احجز أونلاين، ادفع في العيادة!</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-cyan-400" />
                <span className="text-sm text-cyan-200">الدكتور يشترط الحجز المسبق!</span>
              </div>
            </div>

            {/* Booking Priority Info */}
            <div className="rounded-xl border border-cyan-400/20 bg-slate-950/60 p-4">
              <h3 className="text-sm font-semibold text-cyan-300 mb-3">نظام الحجز</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>الحجز المسبق: الحصول على أسبقية الحضور</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <span>الدفع: في العيادة عند الحضور</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>الإلغاء: مجاني قبل 24 ساعة</span>
                </li>
              </ul>
            </div>

            {/* Availability Selection */}
            <div className="rounded-2xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">حدد موعدك</h3>
              
              {/* Date Selection */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {['today', 'tomorrow', 'dayAfter'].map((date) => (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date)
                      setSelectedTime(null)
                    }}
                    className={`py-2 px-3 rounded-lg transition ${
                      selectedDate === date
                        ? 'bg-cyan-500 text-white border border-cyan-400'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xs font-medium">
                      {date === 'today' && 'اليوم'}
                      {date === 'tomorrow' && 'غداً'}
                      {date === 'dayAfter' && 'بعد غد'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availabilitySlots[selectedDate]?.map((time) => (
                  <button
                    key={time}
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

            {/* Price & Booking */}
            <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">سعر الاستشارة</p>
                  <p className="text-3xl font-bold text-white">{doctor?.price || '200 ر.س'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400 mb-1">طريقة الدفع</p>
                  <p className="text-lg font-semibold text-emerald-300">
                    {doctor?.payment_method || 'كاش'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleBooking}
                disabled={!selectedTime}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                احجز الآن
              </button>
            </div>

            {/* Clinic Gallery */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">صور العيادة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {clinicImages.map((img) => (
                  <div key={img.id} className="rounded-xl overflow-hidden border border-cyan-400/20">
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-48 object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 border-t border-white/10">
        <h2 className="text-3xl font-bold text-white mb-8">تعليقات وتقييمات</h2>

        {/* Add Review */}
        <div className="rounded-2xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">أضف تقييمك</h3>
          <div className="space-y-4">
            {/* Rating Stars */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">التقييم:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className="transition hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= userRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-amber-400 font-medium">{userRating}/5</span>
            </div>

            {/* Comment Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="شارك تجربتك مع الدكتور..."
                className="flex-1 rounded-lg bg-slate-950/60 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400/50 outline-none transition"
              />
              <button
                onClick={handleAddReview}
                disabled={!reviewText.trim()}
                className="px-6 py-3 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 disabled:opacity-50 transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-cyan-400/30 transition"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{review.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{review.name}</h4>
                    <span className="text-xs text-slate-400">{review.date}</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(review.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-300">{review.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
