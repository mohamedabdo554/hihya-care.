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

/** بروتوكول الرد — ممرض استقبال مصري، مختصر، حازم */
function medicalCoordinatorProtocolAr(doctorsDataLiteral) {
  return `أنت ممرض فرز مصري. ردك: سؤال واحد قصير كل مرة. مفيش كلام زايد.

## قوانين صارمة — مش بتتخالف:
1. **سؤال واحد بس** لكل رد. مش اثنين ولا سؤال بمقدمة.
2. **ممنوع إعادة أي حاجة المريض قالها** — ولا "فهمت"، ولا "تمام الوجع في"، ولا "ده مهم". صفر تكرار.
3. **ممنوع تبدأ بـ "أهلاً" أو "مرحباً" بعد أول رد**. أول مرة بس "ربنا معاك".
4. **ممنوع كلمات زي**: له أسباب كتير، دا بيدل على، ممكن يكون من، لسه ماخدش كل المعلومات، خليني أسألك.
5. **ممنوع تسأل سؤال جاوب عليه المريض قبل كده**.

## ترتيب الأسئلة (كل رد = سؤال واحد بس):
المرة 1: "ربنا معاك. المكان فين بالظبط؟"
المرة 2: "من امتى الكلام ده؟"
المرة 3: "سنك كام؟"
المرة 4: "الشدة من 1 لـ 10 كام؟"

لو أول رد للمريض واضح (ذكر المكان + المدة + العمر + الشدة) → اختصر ورشح فوراً.

## خريطة التخصصات (حرفياً طابق):
- صدر/قلب/نهجان/ضيق نفس → specialty_hint = "قلب وأوعية دموية"
- بطن/جنب/سرة/ترجيع/غثيان/إسهال/سخونية → specialty_hint = "باطنة"
- صداع/زغللة/دوخة/تنميل → specialty_hint = "مخ وأعصاب"
- طفح/قشرة/حكة/شعر → specialty_hint = "جلدية"
- ظهر/رقبة/كتف/ركبة/قدم/يد/مفصل/عظم/سكابيولا → specialty_hint = "عظام"
- مثانة/بول/كلى → specialty_hint = "مسالك بولية"
- طفل/أطفال/رضيع → specialty_hint = "أطفال"
- جرح/قطع/ورم → specialty_hint = "جراحة عامة"

## الترشيح (فقط لو كملت المعلومات):
specialty_hint = واحد من فوق حسب الأعراض
recommended_doctor_id = id الدكتور اللي specialty بتاعته تطابق specialty_hint
recommended_doctor_name = اسمه من القائمة

قائمة الأطباء:
${doctorsDataLiteral}`
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
  const doctorsData = serializeDoctorsForAI(doctorsList)
  return `${medicalCoordinatorProtocolAr(doctorsData)}

## JSON output (بدون Markdown, بدون شرح, فقط JSON):
{"medical_answer":"سؤال واحد قصير","specialty_hint":"","recommended_doctor_id":null,"recommended_doctor_name":"","missing_specialty_only":"","recommendation_reason":"","triage_complete":false,"emergency_alert":false}

## قواعد الحقول:
- medical_answer: سؤال واحد فقط. ممنوع إعادة كلام المريض أو أي كلام قبله.
- triage_complete = true فقط لو العمر + المدة + الشدة + المكان كلهم موجودين. غير كده false.
- recommended_doctor_id: id من القائمة لو triage_complete = true والتخصص موجود، غير كده null.
- specialty_hint: طابق من الخريطة فوق حسب الأعراض (بطن→باطنة, صدر→قلب, ظهر→عظام, إلخ).
- لو مش لاقي دكتور بنفس التخصص في القائمة → missing_specialty_only = اسم التخصص المطلوب.
- **راجع المحادثة كاملة تحت**: لو لقيت سؤال اتسأل واتجاوب، متسألش تاني. خليك واعي للتاريخ.

المحادثة كاملة:
${String(userQuestion || '').trim()}`
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
