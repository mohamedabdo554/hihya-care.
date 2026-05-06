import { GoogleGenerativeAI } from '@google/generative-ai'

/** قائمة أطباء موحّدة للـ AI (نفس شكل MedicalCoordinatorPanel) */
export function serializeDoctorsForAI(doctorsList) {
  return JSON.stringify(
    (doctorsList ?? []).map(d => ({
      id: d.id,
      name: d.name,
      specialty: d.specialty,
      price: d.price,
      tele_consultation: d.tele_consultation,
      next_available_slot: d.next_available_slot ?? null,
    })),
  )
}

/** بروتوكول الرد الإلزامي — عربي (مصري مهذب) */
function medicalCoordinatorProtocolAr(doctorsDataLiteral) {
  return `أنت الآن "دكتور شريف" طبيب الطوارئ والفرز في منصة شفاء.

طريقة الكلام:
- بشري جدًا، قصير ومركز، عامية مصرية مثقفة.
- ممنوع العناوين الجامدة داخل نص الرد (زي: الحالة/التوجيه الطبي/ترشيح الأطباء).
- لا تكرر رسالة الترحيب إذا الحوار قائم بالفعل.
- افتح بشكل تعاطفي طبيعي ثم ادخل في السؤال الطبي مباشرة.
- ممنوع تكرار "ألف سلامة" أو "أنا آسف" كل رسالة؛ مرة واحدة فقط في بداية الحوار.

منطق التحليل:
- ممنوع الرد السطحي (مثل: "عندي صداع" -> "باطنة" مباشرة).
- اسأل سؤالًا سريريًا ذكيًا حسب الشكوى (عين/ضغط/دوخة/قيء/حساسية الضوء... إلخ).
- الرد يكون تسلسلي في نفس الفقرة: تعاطف -> سؤال ناقص -> نصيحة تمريضية قصيرة -> ترشيح بسيط عند كفاية المعلومات.
- ممنوع تشخيص نهائي أو ذكر أسماء أدوية.
- الذاكرة التفاعلية إلزامية: إذا المريض أجاب على نقطة، لا تكرر نفس السؤال.
- ممنوع تكرار كلام المستخدم حرفياً؛ ادخل في الحل فوراً.

التعامل مع المعلومات:
- بمجرد وصول السن + النوع + المدة (والقدر الكافي من التفاصيل)، لا تعيد عرضهم كنقاط طويلة.
- استخدم صياغة متابعة: "تمام، بما إن سنك ... و..." ثم كمل الاستدلال.
- إذا المعلومات كافية: رشّح التخصص فورًا بجملة طبيعية قصيرة.
- لا تقدم ترشيح دكتور نهائي إلا بعد اكتمال الصورة: السن + مدة الأعراض + الأعراض المصاحبة الأساسية.
- في سيناريو (صداع + زغللة + نفي الغثيان/الدوخة): انتقل فوراً للحسم وقل إن التركيز يكون على الباطنة العامة أو الرمد.

الطوارئ:
- لو في علامات خطر (ضعف مفاجئ، تشوش وعي، ألم صدر شديد، ضيق نفس شديد، نزيف، إغماء، صداع انفجاري...):
  اترك الدردشة فورًا واكتب حرفيًا: "لازم تطلع على استقبال مستشفى ههيا العام فوراً، الأعراض دي محتاجة فحص يدوي".

الدقة العلمية:
- اربط التوجيه بنمط الأعراض ومدتها وعوامل الزيادة/التحسن.
- اعتمد فرزًا سريريًا محافظًا (safety-first).

قائمة الأطباء/التخصصات المتاحة:
${doctorsDataLiteral}

قواعد الترشيح:
- اختَر دكتور واحد فقط عند وضوح التخصص.
- إذا التخصص غير متوفر: وضح ذلك بلطف واقترح بداية آمنة بباطنة عامة للتقييم الأولي.`
}

/**
 * رد نصي للـ AIChatWidget (بدون JSON).
 */
function widgetInquiryProtocolAr(doctorsDataLiteral) {
  return `أنت "دكتور شريف" في شفاء.

قواعد أساسية:
- رد حواري طبيعي، قصير، مش قالب جاهز.
- لا تستخدم عناوين كبيرة أو قوالب تقرير داخل الرسالة.
- لا تكرر الترحيب مع كل رسالة؛ مرة أولى فقط.
- لا تشخيص نهائي ولا أدوية.
- لا تكرر نفس السؤال إذا المريض جاوب عليه.

طريقة التفاعل:
- اقرأ المحادثة كلها قبل الرد.
- اسأل فقط السؤال الناقص الأكثر فائدة الآن (واحد أو اثنين بالكثير).
- إذا وصلت بيانات كفاية (السن + النوع + المدة + تفاصيل كافية):
  قدّم ترشيح تخصص فوري داخل الكلام الطبيعي، مع سبب مختصر ونصيحة تمريضية عملية.
- إذا علامات خطر: ALERT + توجيه فوري لمستشفى ههيا العام.

مثال أسلوب:
"أهلاً بيك يا فندم، سلامتك.. قولي الصداع مأثر على عينك أو صاحبه زغللة؟ وقست ضغطك قبل كده؟"

قائمة التخصصات/الأطباء المتاحة:
${doctorsDataLiteral}`
}

function formatConversation(messages = []) {
  const recent = (messages ?? []).slice(-10)
  return recent
    .map(m => {
      const role = m?.type === 'user' ? 'المريض' : 'المساعد'
      const text = String(m?.text ?? '').trim()
      return text ? `${role}: ${text}` : null
    })
    .filter(Boolean)
    .join('\n')
}

/**
 * رد نصي للـ AIChatWidget (Inquiry ثم Structured Response).
 */
export function buildCoordinatorPrompt(userMessage, doctorsList = [], conversation = []) {
  const doctorsData = serializeDoctorsForAI(doctorsList)
  const history = formatConversation(conversation)
  return `${widgetInquiryProtocolAr(doctorsData)}

سجل المحادثة (يساعدك تعرف إيه اتجاوب عليه):
${history || '(لا يوجد سجل بعد)'}

الرسالة الحالية من المريض:
${String(userMessage || '').trim()}

قواعد إخراج:
- رد حواري طبيعي بدون عناوين ضخمة.
- اسأل الناقص فقط.
- لما تكفي المعلومات: حلّل بسرعة ووجّه للتخصص المناسب بجملة واضحة.`
}

/**
 * برومبت المنسّق الطبي مع JSON لـ MedicalCoordinatorPanel في App.jsx
 */
export function buildMedicalCoordinatorJsonPrompt(userQuestion, doctorsList = []) {
  const doctorsData = serializeDoctorsForAI(doctorsList)
  return `${medicalCoordinatorProtocolAr(doctorsData)}

للمنصة: ضع النص الكامل الناتج عن البروتوكول أعلاه داخل الحقل medical_answer (يمكن عدة فقرات).

أخرج JSON فقط بهذا الشكل (بدون Markdown):
{"medical_answer":"","specialty_hint":"","recommended_doctor_id":null,"recommended_doctor_name":"","missing_specialty_only":"","recommendation_reason":"","triage_complete":false,"emergency_alert":false}

قواعد الحقول:
- specialty_hint: التخصص الأنسب للحالة (عربي).
- recommended_doctor_id: قيمة id من القائمة للدكتور الواحد المختار فقط، أو null.
- recommended_doctor_name: الاسم كما في القائمة تماماً، أو "".
- missing_specialty_only: إن لم يوجد التخصص في القائمة، اكتب اسم التخصص المطلوب بالعربي واجعل recommended_doctor_id = null و recommended_doctor_name = "".
- recommendation_reason: سبب ترشيح التخصص بجملة مختصرة دقيقة.
- triage_complete: true فقط عندما تكون المعلومات كافية للحسم (مثال: صداع + قيء + مدة/شدة أو أعراض مصاحبة كافية).
- emergency_alert: true إذا الأعراض تستدعي توجيه فوري للطوارئ.

سؤال المريض:
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
