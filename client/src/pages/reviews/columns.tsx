"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Review } from "@/types";

export const columns: ColumnDef<Review>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "rating",
    header: "Rating",
  },
  {
    accessorKey: "comment",
    header: "Comment",
  },
  {
    accessorKey: "reviewer",
    header: "Reviewer",
    cell: ({ row }) => {
      const review = row.original;
      return <div>{review.reviewer_name}</div>;
    },
  },
  {
    accessorKey: "reviewee",
    header: "Reviewee",
    cell: ({ row }) => {
      const review = row.original;
      return <div>{review.reviewee_name}</div>;
    },
  },
  {
    accessorKey: "job",
    header: "Job",
    cell: ({ row }) => {
      const review = row.original;
      return <div>{review.job_title}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const review = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(review.id.toString())}
            >
              Copy review ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View reviewer</DropdownMenuItem>
            <DropdownMenuItem>View reviewee</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
