import { currentRole } from '@/src/lib/utils';
import { UserRole } from '@prisma/client';
import { FormError } from '../form-error';

interface RoleGateProps {
	children: React.ReactNode;
	roles: UserRole;
}

export const RoleGate = async ({ children, roles }: RoleGateProps) => {
	const role = await currentRole();

	if (!roles.includes(role as UserRole)) {
		return <FormError message="You are not authorized to access this page." />;
	}

	return <>{children}</>;
};
