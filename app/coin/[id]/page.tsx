import type { Coin } from '@/types/Coin';

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

	return (
		<main className="">
			<h1 className="scroll-m-20 text-3xl bold tracking-tight lg:text-4xl first-letter:capitalize mb-2">{params.id}</h1>
			<p className="lg:text-2xl text-xl font-extrabold">
				{'$ ' + coin.current_price.toFixed(2)} <span className="text-green-800 font-medium lg:text-lg"> {coin.price_change_percentage_24h.toFixed(2)}% </span>
			</p>
			<section></section>
		</main>
	);
}
