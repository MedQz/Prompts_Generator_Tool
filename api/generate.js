export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ prompt: 'الطريقة غير مسموحة، يرجى استخدام POST' });
    }

    const { idea } = req.body;

    if (!idea) {
        return res.status(400).json({ prompt: 'يرجى كتابة الفكرة أولاً!' });
    }

    try {
        // يجلب مفتاح Gemini بأمان تام من إعدادات Vercel (Environment Variables)
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ prompt: 'مفتاح GEMINI_API_KEY غير موجود في إعدادات المنصة!' });
        }

        // إرسال الطلب إلى نموذج Gemini 2.5 Flash المجاني
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `أنت خبير محترف في هندسة الأوامر (Prompt Engineering) لمولدات الصور والفنون الرقمية. مهمتك تحويل الأفكار البسيطة إلى برومبت مفصل للغاية باللغة الإنجليزية يصف العناصر بدقة (الإضاءة، الألوان، زاوية الكاميرا، التفاصيل، والأسلوب الفني). الفكرة هي: "${idea}"`
                    }]
                }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            const resultText = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ prompt: resultText });
        } else {
            return res.status(500).json({ prompt: 'تعذر الحصول على رد من نموذج الذكاء الاصطناعي.' });
        }

    } catch (error) {
        return res.status(500).json({ prompt: 'حدث خطأ في الاتصال الخارجي: ' + error.message });
    }
}
