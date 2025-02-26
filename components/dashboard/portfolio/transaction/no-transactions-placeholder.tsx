'use client';

import { ArrowDown, Plus } from 'lucide-react';
import { TransactionDialog } from './transaction-dialog';
import { motion } from 'framer-motion';

interface NoTransactionsPlaceholderProps {
  portfolioId: string;
  coinId?: string;
}

export function NoTransactionsPlaceholder({ portfolioId, coinId }: NoTransactionsPlaceholderProps) {
  if (!coinId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-md bg-gray-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white p-4 rounded-full shadow-md mb-4">
            <ArrowDown className="h-8 w-8 text-indigo-500" />
          </div>
        </motion.div>
        <h3 className="text-lg font-medium mb-2">Aucune transaction</h3>
        <p className="text-gray-500 text-center mb-6">
          Ajoutez une crypto-monnaie à votre portfolio pour commencer à enregistrer des transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-md bg-gray-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white p-4 rounded-full shadow-md mb-4">
          <Plus className="h-8 w-8 text-indigo-500" />
        </div>
      </motion.div>
      <h3 className="text-lg font-medium mb-2">Aucune transaction</h3>
      <p className="text-gray-500 text-center mb-6">
        Ajoutez votre première transaction pour cette crypto-monnaie
      </p>
      <TransactionDialog
        portfolioId={portfolioId}
        coinId={coinId}
        triggerIcon={null}
        triggerLabel="Ajouter une transaction"
      />
    </div>
  );
}