import { signIn } from '../../app/(auth)/auth';

export function SignIn() {
	return (
		<form
			action={async () => {
				'use server';
				await signIn('github', { redirectTo: '/dashboard' });
			}}
		>
			<button type="submit">Sign In</button>
		</form>
	);
}
