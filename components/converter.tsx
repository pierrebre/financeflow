'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Coin } from '@/schemas';

type Props = {
	readonly Coin: Coin;
};

export default function Converter({ Coin }: Props) {
	const [quantity, setQuantity] = useState<string>('1');
	const [price, setPrice] = useState<string>('0');

	// Make sure we're using the numeric price value, not an object
	const currentPrice = typeof Coin.current_price === 'number' ? Coin.current_price : Coin.current_price || 0;

	useEffect(() => {
		const numericQuantity = parseFloat(quantity) || 0;
		setPrice((currentPrice * numericQuantity).toFixed(2));
	}, [currentPrice, quantity]);

	const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuantity(event.target.value);
	};

	const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newPrice = event.target.value;
		setPrice(newPrice);
		const numericPrice = parseFloat(newPrice) || 0;
		setQuantity((numericPrice / currentPrice).toString());
	};

	return (
		<div className="flex flex-col gap-2 mt-2">
			<p className="text-lg font-bold">Converter</p>
			<div className="flex items-center gap-2">
				<Input className="w-2/3 my-3" value={quantity} onChange={handleQuantityChange} type="text" />
				<span className="text-sm text-muted-foreground uppercase">{Coin.symbol}</span>
			</div>
			<div className="flex items-center gap-2">
				<Input className="w-2/3" value={price} onChange={handlePriceChange} type="text" />
				<span className="text-sm text-muted-foreground">USD</span>
			</div>
		</div>
	);
}
