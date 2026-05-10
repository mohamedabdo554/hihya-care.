import { GoogleGenerativeAI } from '@google/generative-ai'

/** قائمة أطباء موحّدة للـ AI (نفس شكل MedicalCoordinatorPanel) */
export function serializeDoctorsForAI(doctorsList) {
  return JSON.stringify(
    (doctorsList ?? []).map(d => ({
      id: d.id,
      name: d.name,
      specialty: d.specialty,
      secret_code: d.secret_code ?? null,
      price: d.price,
      tele_consultation: d.tele_consultation,
      next_available_slot: d.next_available_slot ?? null,
    })),
  )
}

/** بروتوكول الرد — ممرض فرز طبيعي، ذكي، مختصر */
function medicalCoordinatorProtocolAr(doctorsDataLiteral) {
  return `أنت ممرض فرز في عيادة مصرية. كلم المريض بالعامية المصرية الطبيعية. اسأله حاجة واحدة كل مرة، متعيدش كلامه، ومتسألش حاجة قالها قبل كده.

المعلومات اللي محتاج تجمعها: المكان + المدة + العمر + الشدة. لو أول رد فيه كل حاجة → رشح فوراً.

ردك الطبي (medical_answer) يكون جملة طبيعية واحدة أو اتنين. ممنوع Emojis وتقارير وتحاليل.

الأعراض = المكان يحدد التخصص (specialty_hint):
- بطن/جنب/سرة/ترجيع/غثيان/إسهال/حمى → specialty_hint: "باطنة"
- صدر/قلب/نهجان/ضيق نفس → specialty_hint: "قلب وأوعية دموية"
- صداع/زغللة/دوخة/تنميل → specialty_hint: "مخ وأعصاب"
- طفح/حكة/قشرة/شعر → specialty_hint: "جلدية"
- ظهر/رقبة/كتف/ركبة/قدم/يد/مفصل/عظم → specialty_hint: "عظام"
- بول/مثانة/كلى → specialty_hint: "مسالك بولية"

لما تخلص معلومات → triage_complete: true، اختار specialty_hint من فوق، وrecommended_doctor_id يكون id دكتور من القائمة specialty بتاعته تطابق specialty_hint.

قائمة الأطباء:
${doctorsDataLiteral}`
}

export function buildCoordinatorSystemPrompt(doctorsList = []) {
  return medicalCoordinatorProtocolAr(serializeDoctorsForAI(doctorsList))
}

export function buildCoordinatorJsonRules() {
  return `رد بـ JSON فقط:
{"medical_answer":"","specialty_hint":"","recommended_doctor_id":null,"recommended_doctor_name":"","missing_specialty_only":"","recommendation_reason":"","triage_complete":false,"emergency_alert":false}

قواعد:
- medical_answer: جملة طبيعية بالعامية. مثال: "سنك كام؟" أو "من امتى الكلام دا؟" أو "أرشحلك د. أحمد (باطنة)". ممنوع emoji ممنوع عناوين ممنوع تحليل.
- triage_complete = true لو عرفت المكان + المدة + العمر + الشدة من المحادثة. غير كده false.
- specialty_hint: من الخريطة فوق حسب الأعراض.
- recommended_doctor_id: لو triage_complete = true، خليها id دكتور من القائمة تخصصه مطابق.
- missing_specialty_only: لو التخصص مش موجود في القائمة.`
}

/**
 * رد نصي للـ AIChatWidget (بدون JSON).
 */
function widgetInquiryProtocolAr(doctorsDataLiteral) {
  return `أنت "د. شريف" — ممرض استقبال مصري ذكي ومهني.

## أسلوبك:
- عامية مصرية مهذبة، مختصرة، مباشرة.
- أول رد "ربنا معاك"، وبعد كده خلاص — ادخل في الموضوع.
- ممنوع إعادة صياغة شكوى المريض. هو قالها، خلاص.

## ممنوع:
- "أهلاً" بعد أول رد، "أسباب كتير"، "دا بيدل على"
- تكرار نفس السؤال بعد ما جاوب
- ترشيح دكتور غير لما تجمع المعلومات

## اجمع بسرعة (حد أقصى 3-4 أسئلة):
المكان → العمر → المدة → الشدة
بعد كده رشح.

## للحالات البسيطة (قشرة، حكة، الخ):
اختصر — التخصص المناسب + الدكتور + كوده.

## الترشيح (فقط بعد المعلومات):
التشخيص: [وصف]
التخصص: [التخصص]
الطبيب: د. [الاسم] — كود [HC-XXXX]

قائمة الأطباء:
${doctorsDataLiteral}`
}

/**
 * رد نصي للـ AIChatWidget (Inquiry ثم Structured Response).
 */
export function buildCoordinatorPrompt(userMessage, doctorsList = [], conversation = []) {
  const doctorsData = serializeDoctorsForAI(doctorsList)
  const history = formatConversation(conversation)
  const hasDoctors = doctorsList && doctorsList.length > 0
  return `${widgetInquiryProtocolAr(doctorsData)}

سجل المحادثة:
${history || '(بدون سجل)'}

الرسالة الحالية من المريض:
${String(userMessage || '').trim()}

قواعد صارمة:
- ممنوع إعادة صياغة شكوى المريض
- لو سألت سؤال ومريض جاوب، متسألش تاني
- اجمع العمر + المدة + الشدة الأول، وبعدين رشح دكتور
${hasDoctors ? `- الترشيح: د. [الاسم] — كود [HC-XXXX]` : ''}`
}

/**
 * برومبت المنسّق الطبي مع JSON لـ MedicalCoordinatorPanel في App.jsx
 */
export function buildMedicalCoordinatorJsonPrompt(userQuestion, doctorsList = []) {
  const system = buildCoordinatorSystemPrompt(doctorsList)
  const rules = buildCoordinatorJsonRules()
  return { system, user: `${rules}\n\nالمحادثة:\n${String(userQuestion || '').trim()}` }
}

async function askWithGroq(prompt) {
  const apiKey = String(import.meta.env.VITE_GROQ_API_KEY || '').trim()
  if (!apiKey) {
    return null
  }
  const model = String(import.meta.env.VITE_GROQ_MODEL || '').trim() || 'llama-3.3-70b-versatile'
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1400,
    }),
  })
  if (!response.ok) {
    throw new Error(`Groq: ${response.status}`)
  }
  const data = await response.json()
  return data?.choices?.[0]?.message?.content?.trim() || null
}

/**
 * Medical coordinator reply for AIChatWidget.
 * Uses Gemini if VITE_GEMINI_API_KEY is set, otherwise Groq if VITE_GROQ_API_KEY is set.
 */
export async function askHihyaAI(userMessage, doctorsList = [], conversationHistory = []) {
  const prompt = buildCoordinatorPrompt(userMessage, doctorsList, conversationHistory)

  const geminiKey = String(import.meta.env.VITE_GEMINI_API_KEY || '').trim()
  if (geminiKey) {
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0.2, maxOutputTokens: 1536 },
    })
    const result = await model.generateContent(prompt)
    const text = result.response?.text?.()
    return text || 'تعذر توليد رد حالياً.'
  }

  const groqText = await askWithGroq(prompt)
  if (groqText) {
    return groqText
  }

  throw new Error('أضف VITE_GEMINI_API_KEY أو VITE_GROQ_API_KEY في ملف البيئة وأعد تشغيل السيرفر.')
}
