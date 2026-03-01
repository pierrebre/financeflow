import FormProfil from '@/src/components/dashboard/formProfil';

export const metadata = { title: 'Settings' };

export default function SettingsPage() {
	return (
		<div className="max-w-2xl mx-auto py-6">
			<h1 className="text-2xl font-bold mb-6">Account Settings</h1>
			<FormProfil />
		</div>
	);
}
