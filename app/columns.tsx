"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CoinTable } from "@/types/Coin";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<CoinTable>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "symbol",
    header: "Symbol",
  },
  {
    accessorKey: "current_price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "market_cap",
    header: "Market Cap",
  },
  {
    accessorKey: "market_cap_change_percentage_24h",
    header: "24h Change",
  },
  {
    accessorKey: "circulating_supply",
    header: "Circulating Supply",
  },
];
