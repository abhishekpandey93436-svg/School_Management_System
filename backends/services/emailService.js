const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async ({ email, subject, html }) => {
    const mailOptions = {
        from: `"Student Help Desk" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html
    };
    await transporter.sendMail(mailOptions);
};

const sendOTPEmail = async (email, otp) => {
    const html = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 1.8rem;">Student Help Desk</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Email Verification</p>
            </div>
            <div style="padding: 32px; background: #ffffff;">
                <p style="font-size: 1rem; color: #334155;">Hello,</p>
                <p style="color: #64748b;">Use the OTP below to verify your email address. It will expire in <strong>10 minutes</strong>.</p>
                <div style="text-align: center; margin: 32px 0;">
                    <span style="display: inline-block; background: #f1f5f9; letter-spacing: 8px; padding: 16px 32px; border-radius: 10px; font-size: 2rem; font-weight: 700; color: #4f46e5;">${otp}</span>
                </div>
                <p style="color: #94a3b8; font-size: 0.85rem;">If you didn't request this, please ignore this email.</p>
            </div>
        </div>`;
    await sendEmail({ email, subject: 'Verify Your Email — Student Help Desk', html });
};

const sendWelcomeEmail = async (email, name) => {
    const html = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0;">Welcome aboard, ${name}! 🎉</h1>
            </div>
            <div style="padding: 32px;">
                <p style="color: #334155;">Your account has been successfully verified and created on the <strong>Student Help Desk</strong>.</p>
                <p style="color: #334155;">You can now log in and raise queries. Our admin team will respond as soon as possible.</p>
                <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 10px; text-align: center;">
                    <p style="color: #64748b; font-size: 0.9rem; margin: 0;">Have a great academic year! 🚀</p>
                </div>
            </div>
        </div>`;
    await sendEmail({ email, subject: 'Welcome to Student Help Desk!', html });
};

const sendQueryAnsweredEmail = async (email, name, queryTitle, answer) => {
    const html = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #10b981, #06b6d4); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0;">Query Resolved ✅</h1>
            </div>
            <div style="padding: 32px;">
                <p style="color: #334155;">Hi <strong>${name}</strong>,</p>
                <p style="color: #64748b;">Your query <strong>"${queryTitle}"</strong> has been answered by our admin team.</p>
                <div style="margin: 24px 0; padding: 20px; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px;">
                    <p style="color: #166534; font-weight: 600; margin: 0 0 8px;">Admin Response:</p>
                    <p style="color: #334155; margin: 0;">${answer}</p>
                </div>
                <p style="color: #94a3b8; font-size: 0.85rem;">Log in to the portal to view your full query history.</p>
            </div>
        </div>`;
    await sendEmail({ email, subject: `Your Query Has Been Answered — "${queryTitle}"`, html });
};

module.exports = { sendOTPEmail, sendWelcomeEmail, sendQueryAnsweredEmail };
