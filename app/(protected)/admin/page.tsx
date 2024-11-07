import { RoleGate } from '@/components/auth/role-gate';
import { UserRole } from '@prisma/client';

const AdminPage = async () => {
	return (
		<div className="flex min-h-screen w-full flex-col">
			<div className="w-full">
				<RoleGate roles={UserRole.ADMIN}>
					<h1 className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-2xl text-center pb-4">Admin Page</h1>
				</RoleGate>
			</div>
		</div>
	);
};

export default AdminPage;
