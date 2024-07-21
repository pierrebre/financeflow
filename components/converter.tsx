'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Coin } from '@/types/Coin';

type Props = {
	readonly Coin: Coin;
};

export default function Converter({ Coin }: Props) {
	const [quantity, setQuantity] = useState<string>('1');
	const [price, setPrice] = useState<string>(Coin.current_price.toFixed(2));

	useEffect(() => {
		const numericQuantity = parseFloat(quantity) || 0;
		setPrice((Coin.current_price * numericQuantity).toFixed(2));
	}, [Coin.current_price, quantity]);

	const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuantity(event.target.value);
	};

	const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newPrice = event.target.value;
		setPrice(newPrice);
		const numericPrice = parseFloat(newPrice) || 0;
		setQuantity((numericPrice / Coin.current_price).toString());
	};

	return (
		<div className="flex flex-col gap-2 mt-2">
			<p className="text-lg font-bold">Converter</p>
			<Input className="w-2/3 my-3" value={quantity} onChange={handleQuantityChange} type="text" />
			<Input className="w-2/3" value={price} onChange={handlePriceChange} type="text" />
		</div>
	);
}
