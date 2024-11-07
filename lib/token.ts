import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

import { getVerificationTokenByEmail } from '@/data/verification-token';
import prisma from './prisma';
import { getPasswordResetTokenByEmail } from '@/data/password-reset-token';
import { getTwoFactorTokenbyEmail } from '@/data/two-factor-token';

export const generateTwoFactorToken = async (email: string) => {
	const token = crypto.randomInt(10000, 99999).toString();
	const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

	const existingToken = await getTwoFactorTokenbyEmail(email);

	if (existingToken) {
		await prisma.twoFactorToken.delete({
			where: {
				id: existingToken.id
			}
		});
	}

	const twoFactorToken = await prisma.twoFactorToken.create({
		data: {
			email,
			token,
			expires
		}
	});

	return twoFactorToken;
};

export const generatePasswordResetToken = async (email: string) => {
	const token = uuidv4();
	const expires = new Date(new Date().getTime() + 3600 * 1000);

	const existingToken = await getPasswordResetTokenByEmail(email);

	if (existingToken) {
		await prisma.passwordResetToken.delete({
			where: {
				id: existingToken.id
			}
		});
	}

	const passwordResetToken = await prisma.passwordResetToken.create({
		data: {
			email,
			token,
			expires
		}
	});

	return passwordResetToken;
};

export const generateVerificationToken = async (email: string) => {
	const token = uuidv4();
	const expires = new Date(new Date().getTime() + 3600 * 1000);

	const existingToken = await getVerificationTokenByEmail(email);

	if (existingToken) {
		await prisma.verificationToken.delete({
			where: {
				id: existingToken.id
			}
		});
	}

	const verificationToken = await prisma.verificationToken.create({
		data: {
			email,
			token,
			expires
		}
	});

	return verificationToken;
};
