// api/generate.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // 1. التأكد من أن الطلب هو POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'الطريقة غير مسموحة. استخدم POST.' });
    }

    // 2. استخراج النص من الطلب
    const { idea } = req.body;
    if (!idea) {
        return res.status(400).json({ error: 'الرجاء إدخال فكرتك.' });
    }

    // 3. التأكد من وجود المفتاح
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ مفتاح GEMINI_API_KEY غير موجود في متغيرات البيئة');
        return res.status(500).json({ error: 'مفتاح API غير موجود. تأكد من إضافته في Vercel.' });
    }

    try {
        // 4. تهيئة Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 5. إرسال الطلب إلى Gemini
        const prompt = `أنت خبير في إنشاء برومبتس (Prompts) مفصلة للمصممين وصنّاع المحتوى. 
        مهمتك: حول الفكرة التالية إلى برومبت طويل ودقيق وشامل:
        "${idea}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedPrompt = response.text();

        // 6. إعادة النتيجة
        res.status(200).json({ prompt: generatedPrompt });

    } catch (error) {
        console.error('❌ خطأ في Gemini:', error);
        res.status(500).json({ 
            error: 'حدث خطأ أثناء التواصل مع الذكاء الاصطناعي.',
            details: error.message 
        });
    }
}
