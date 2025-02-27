import { Coin } from '@/schemas';
import { Card, CardContent } from '../ui/card';

export const PriceHighLow = ({ coin }: { readonly coin: Coin }) => (
	<Card className="mt-4">
		<CardContent className="pt-6">
			<div className="flex flex-col space-y-2">
				<div className="flex justify-between">
					<span className="text-muted-foreground">24h High</span>
					<span className="font-medium">${coin?.high_24h.toLocaleString()}</span>
				</div>
				<div className="w-full h-2 bg-gray-100 rounded-full">
					<div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full">
						<div
							className="h-4 w-1 bg-black rounded-full relative -top-1"
							style={{
								marginLeft: `${((coin?.current_price - coin?.low_24h) / (coin?.high_24h - coin?.low_24h)) * 100}%`
							}}
						/>
					</div>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">24h Low</span>
					<span className="font-medium">${coin?.low_24h.toLocaleString()}</span>
				</div>
			</div>
		</CardContent>
	</Card>
);
