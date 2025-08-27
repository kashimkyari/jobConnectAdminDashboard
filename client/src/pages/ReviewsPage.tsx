import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { columns } from "./reviews/columns";
import { DataTable } from "@/components/DataTable";
import { User, Review } from "@/types";

const ReviewsPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["reviews", page, limit],
    queryFn: () => api.getReviews(page, limit),
  });

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.getUsers(),
  });

  const reviews = reviewsData?.items || [];
  const users = usersData?.items || [];

  const reviewsWithUserNames = reviews.map((review: Review) => {
    const reviewer = users.find((user: User) => user.id === review.reviewer_id);
    const reviewee = users.find((user: User) => user.id === review.reviewee_id);
    return {
      ...review,
      reviewer_name: reviewer?.full_name || "N/A",
      reviewee_name: reviewee?.full_name || "N/A",
    };
  });

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl font-bold p-4">Reviews</h1>
      <div className="flex-grow overflow-auto">
        <DataTable
          columns={columns}
          data={reviewsWithUserNames}
          isLoading={isLoadingReviews || isLoadingUsers}
          page={page}
          limit={limit}
          total={reviewsData?.total || 0}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default ReviewsPage;
