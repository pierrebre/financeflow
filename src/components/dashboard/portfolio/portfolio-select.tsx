import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface Portfolio {
	id: string;
	name: string;
	description: string | null;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
}

export default function PortfolioSelect({ optimisticPortfolios, selectedPortfolio, onSelect }: { readonly optimisticPortfolios: readonly Portfolio[]; readonly selectedPortfolio: Portfolio | null; readonly onSelect: (id: string) => void }) {
	return (
		<Select value={selectedPortfolio?.id ?? ''} onValueChange={onSelect}>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Select a portfolio" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{optimisticPortfolios.length > 0 ? (
						optimisticPortfolios.map((portfolio) => (
							<SelectItem key={portfolio.id} value={portfolio.id}>
								{portfolio.name}
							</SelectItem>
						))
					) : (
						<SelectItem disabled value="No portfolios">
							No portfolios
						</SelectItem>
					)}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
