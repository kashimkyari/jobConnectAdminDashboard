import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { columns } from "./badges/columns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BadgeForm } from "./badges/BadgeForm";

export default function BadgesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["badges", page, limit],
    queryFn: () => api.getBadges(page, limit),
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">Badges</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Badge</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Badge</DialogTitle>
            </DialogHeader>
            <BadgeForm />
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex-grow overflow-auto">
        <DataTable
          columns={columns}
          data={data?.badges || []}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={data?.total || 0}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
