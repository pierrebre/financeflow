const authLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-4 sm:p-6 lg:p-8">
			{children}
		</div>
	);
};

export default authLayout;