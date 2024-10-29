import { redirect } from 'next/navigation';
import { signOut } from '../../auth';

export function SignOut() {
	return (
		<form
			action={async () => {
				'use server';
				await signOut({ redirect: true });
			}}
		>
			<button type="submit">Sign Out</button>
		</form>
	);
}
