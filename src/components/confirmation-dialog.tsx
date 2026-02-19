import { useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/hooks/use-toast';

interface ConfirmationDialogProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly onConfirm: () => Promise<void>;
	readonly title: string;
	readonly description: string;
	readonly confirmText?: string;
	readonly cancelText?: string;
	readonly loadingText?: string;
	readonly successMessage?: string;
	readonly errorMessage?: string;
}

export function ConfirmationDialog({ isOpen, onClose, onConfirm, title, description, confirmText = 'Confirm', cancelText = 'Cancel', loadingText = 'Processing...', successMessage = 'Operation completed successfully', errorMessage = 'Operation failed' }: ConfirmationDialogProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const { toast } = useToast();

	const handleConfirm = async () => {
		setIsProcessing(true);
		try {
			await onConfirm();
			toast({
				description: successMessage
			});
			onClose();
		} catch (error) {
			toast({
				variant: 'destructive',
				description: errorMessage
			});
			console.error('Error during confirmation:', error);
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary" disabled={isProcessing}>
							{cancelText}
						</Button>
					</DialogClose>
					<Button variant="destructive" onClick={handleConfirm} disabled={isProcessing}>
						{isProcessing ? loadingText : confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
