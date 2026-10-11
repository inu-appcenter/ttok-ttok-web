import { handleRecommendationRequest } from "@/features/request-ai-recommendation/api";
export async function POST(request: Request) {
  return handleRecommendationRequest(request, true);
}
