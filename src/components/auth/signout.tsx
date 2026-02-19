import { signOut } from '@/auth';

export function SignOut() {
	return (
		<form
			action={async () => {
				'use server';
				await signOut({ redirect: true, redirectTo: '/auth/login' });
			}}
		>
			<button type="submit">Sign Out</button>
		</form>
	);
}
