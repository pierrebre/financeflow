import CoinSearch from '@/components/coin-search';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface AssetDialogProps {
	readonly portfolioId: string | undefined;
}

export default function AssetDialog({ portfolioId }: AssetDialogProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className="ml-auto" disabled={!portfolioId}>
					<Plus size={16} /> Add Coin
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Asset</DialogTitle>
					<CoinSearch portfolioId={portfolioId} />
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
