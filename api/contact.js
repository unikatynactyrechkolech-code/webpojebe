import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    // CORS headers - must be set before any response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, phone, service, tariff, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Vyplňte prosím všechna povinná pole.' });
        }

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: 'WebPojede <noreply@mail.webpojede.cz>',
            to: ['bayer@webpojede.cz'],
            replyTo: email,
            subject: `Nová zpráva z webu od ${name}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0071e3 0%, #5856d6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">🌐 Nová zpráva z webu</h1>
                    </div>
                    <div style="background: #f5f5f7; padding: 30px; border-radius: 0 0 12px 12px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #1d1d1f;">Jméno:</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; color: #1d1d1f;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #1d1d1f;">E-mail:</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; color: #1d1d1f;"><a href="mailto:${email}" style="color: #0071e3;">${email}</a></td>
                            </tr>
                            ${phone ? `
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #1d1d1f;">Telefon:</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; color: #1d1d1f;"><a href="tel:${phone}" style="color: #0071e3;">${phone}</a></td>
                            </tr>
                            ` : ''}
                            ${service ? `
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #1d1d1f;">Služba:</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; color: #1d1d1f;">${service}</td>
                            </tr>
                            ` : ''}
                            ${tariff ? `
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #1d1d1f;">Tarif:</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; color: #1d1d1f;">${tariff}</td>
                            </tr>
                            ` : ''}
                        </table>
                        <div style="margin-top: 24px; padding: 20px; background: white; border-radius: 8px;">
                            <h3 style="margin: 0 0 12px 0; color: #1d1d1f; font-size: 16px;">Zpráva:</h3>
                            <p style="margin: 0; color: #1d1d1f; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                        </div>
                        <p style="margin-top: 24px; font-size: 12px; color: #86868b;">
                            Odesláno z webového formuláře na webpojede.cz
                        </p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({ error: 'Nepodařilo se odeslat zprávu. Zkuste to prosím znovu.' });
        }

        return res.status(200).json({ success: true, message: 'Zpráva byla úspěšně odeslána!' });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Došlo k chybě serveru. Zkuste to prosím později.' });
    }
}
