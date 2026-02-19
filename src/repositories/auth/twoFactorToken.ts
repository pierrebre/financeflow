import prisma from '@/src/lib/prisma';

export const getTwoFactorTokenByToken = async (token: string) => {
  return await prisma.twoFactorToken.findUnique({ where: { token } });
};

export const getTwoFactorTokenByEmail = async (email: string) => {
  return await prisma.twoFactorToken.findFirst({ where: { email } });
};