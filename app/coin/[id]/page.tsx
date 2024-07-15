type Props = {
	readonly params: {
		readonly id: string;
	};
};

export default function Coin({ params }: Props) {
	return (
		<>
			<h1>Coin {params.id}</h1>
		</>
	);
}
