import { getUserPortfoliosWithUserId } from '@/data/portfolio';
import PortfolioList from './portfolio-list';
import { auth } from '@/auth';

export default async function PortfolioPage() {
	const session = await auth();

	if (!session?.user?.id) {
		return <div>Please login to view your portfolios</div>;
	}

	const portfolios = await getUserPortfoliosWithUserId(session.user.id);

	if (!portfolios) {
		return <div>No portfolios found</div>;
	}

	return <PortfolioList initialPortfolios={portfolios} userId={session.user.id} />;
}
