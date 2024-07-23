import { signIn } from '../../app/auth';
import { CircleUserIcon } from 'lucide-react';

export function SignIn() {
	return (
		<form
			action={async () => {
				'use server';
				await signIn();
			}}
		>
			<button type="submit">
				<CircleUserIcon className="h-10 w-10" strokeWidth={1.5} />
			</button>
		</form>
	);
}
