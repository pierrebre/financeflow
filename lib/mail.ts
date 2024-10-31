import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
	const confirmationLink = `${process.env.BASE_URL}/auth/new-verification?token=${token}`;
    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Verify your email address',
        html: `<p>Click the link below to verify your email address.</p>
        <p><a href="${confirmationLink}">${confirmationLink}</a></p>`
    });
};
