import { redirect } from 'next/navigation';
import { signOut } from '../../app/(auth)/auth';

export function SignOut() {
	return (
		<form
			action={async () => {
				'use server';
				await signOut();
				redirect('/');
			}}
		>
			<button type="submit">Sign Out</button>
		</form>
	);
}