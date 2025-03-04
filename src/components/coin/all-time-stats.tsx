import { Coin } from '@/src/schemas/';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const AllTimeStats = ({ coin }: { readonly coin: Coin }) => {
	const getNumericValue = (value: any) => {
		if (typeof value === 'number') return value;
		if (typeof value === 'object' && value && value.usd) return value.usd;
		return 0;
	};

	const getDateString = (dateValue: any) => {
		if (!dateValue) return 'N/A';
		try {
			return new Date(dateValue).toLocaleDateString();
		} catch (e) {
			return 'Invalid Date';
		}
	};
	const ath = getNumericValue(coin?.ath);
	const athChangePercentage = getNumericValue(coin?.ath_change_percentage);
	const athDate = getDateString(((coin?.ath_date as unknown) as { [key: string]: any })['usd']);

	const atl = getNumericValue(coin?.atl);
	const atlChangePercentage = getNumericValue(coin?.atl_change_percentage);
	const atlDate = getDateString(((coin?.atl_date as unknown) as { [key: string]: any })['usd']);

	return (
		<Card className="mt-4">
			<CardHeader>
				<CardTitle className="text-lg">All-Time Statistics</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-muted-foreground text-sm">All-Time High</p>
						<p className="font-semibold">${ath.toLocaleString()}</p>
						<p className={`text-xs ${athChangePercentage >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{athChangePercentage.toFixed(2)}%</p>
						<p className="text-xs text-muted-foreground">{athDate}</p>
					</div>
					<div>
						<p className="text-muted-foreground text-sm">All-Time Low</p>
						<p className="font-semibold">${atl.toLocaleString()}</p>
						<p className={`text-xs ${atlChangePercentage >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{atlChangePercentage.toFixed(2)}%</p>
						<p className="text-xs text-muted-foreground">{atlDate}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
