import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTwoFactorEmail = async (email: string, token: string) => {
	await resend.emails.send({
		from: 'FinanceFlow@pierrebarbe.fr',
		to: email,
		subject: 'FinanceFlow - 2FA Code',
		html: `<p>Your 2FA code is: ${token}</p>`
	});
};

export const sendVerificationEmail = async (email: string, token: string) => {
	const confirmationLink = `${process.env.BASE_URL}/auth/new-verification?token=${token}`;
	await resend.emails.send({
		from: 'FinanceFlow@pierrebarbe.fr',
		to: email,
		subject: 'FinanceFlow - Verify your email address',
		html: `<p>Click the link below to verify your email address.</p>
        <p><a href="${confirmationLink}">Link</a></p>`
	});
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
	const confirmationLink = `${process.env.BASE_URL}/auth/new-password?token=${token}`;
	await resend.emails.send({
		from: 'FinanceFlow@pierrebarbe.fr',
		to: email,
		subject: 'FinanceFlow - Reset your password',
		html: `<p>Click the link below to reset your password.</p>
        <p><a href="${confirmationLink}">Link</a></p>`
	});
};
