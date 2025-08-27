import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { columns } from "./reviews/columns";
import { DataTable } from "@/components/DataTable";
import { User } from "@/types";

const ReviewsPage = () => {
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["reviews"],
    queryFn: () => api.getReviews(),
  });

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.getUsers(),
  });

  const reviews = reviewsData?.items || [];
  const users = usersData?.items || [];

  const reviewsWithUserNames = reviews.map((review) => {
    const reviewer = users.find((user: User) => user.id === review.reviewer_id);
    const reviewee = users.find((user: User) => user.id === review.reviewee_id);
    return {
      ...review,
      reviewer_name: reviewer?.full_name || "N/A",
      reviewee_name: reviewee?.full_name || "N/A",
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Reviews</h1>
      <DataTable
        columns={columns}
        data={reviewsWithUserNames}
        isLoading={isLoadingReviews || isLoadingUsers}
      />
    </div>
  );
};

export default ReviewsPage;
