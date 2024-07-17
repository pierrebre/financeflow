import type { Coin, DataPrice } from '@/types/Coin';
import { Chart } from '@/components/chart';

type Props = {
	readonly params: {
		readonly id: string;
	};
};

export default async function Coin({ params }: Props) {
	const getCoin = async () => {
		const coinData = await fetch(`https://api.coingecko.com/api/v3/coins/${params.id}`);
		const coin = await coinData.json();

		const coinFormated: Coin = {
			id: coin.id,
			name: coin.name,
			symbol: coin.symbol,
			image: coin.image.large,
			current_price: coin.market_data.current_price.usd,
			market_cap: coin.market_data.market_cap.usd,
			market_cap_rank: coin.market_cap_rank,
			price_change_percentage_24h: coin.market_data.price_change_percentage_24h
		};

		return coinFormated;
	};

	const coin = await getCoin();

	const priceData: DataPrice[] = [
		{ month: 'January', price: 18500 },
		{ month: 'February', price: 32500 }, 
		{ month: 'March', price: 40000 },
		{ month: 'April', price: 46750 },
		{ month: 'May', price: 50000 },
		{ month: 'June', price: 54500 },
	];

	return (
		<main className="flex lg:flex-row flex-col">
			<section className=' border-gray-200 w-1/4'>
				<h1 className="scroll-m-20 text-3xl bold tracking-tight lg:text-4xl first-letter:capitalize mb-2">{params.id}</h1>
				<p className="lg:text-2xl text-xl font-extrabold">
					{'$ ' + coin.current_price.toFixed(2)} <span className="text-green-800 font-medium lg:text-lg"> {coin.price_change_percentage_24h.toFixed(2)}% </span>
				</p>
			</section>
			<section className='lg:w-3/4 w-full lg:mt-0 mt-10'>
				<Chart priceData={priceData} />
			</section>
		</main>
	);
}
