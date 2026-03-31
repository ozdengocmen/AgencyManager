import { requestJson, toQueryString } from "./client";
import type {
  AgencyListResponse,
  AgencyListSort,
  AgencyProfileResponse,
  PortfolioSummaryResponse,
} from "./types";

interface ListAgenciesParams {
  sales_owner?: string;
  city?: string;
  priority_tier?: "A" | "B" | "C";
  search?: string;
  limit?: number;
  sort?: AgencyListSort;
}

interface PortfolioSummaryParams {
  sales_owner?: string;
  city?: string;
}

export function listAgencies(params: ListAgenciesParams = {}): Promise<AgencyListResponse> {
  const query = toQueryString({
    sales_owner: params.sales_owner,
    city: params.city,
    priority_tier: params.priority_tier,
    search: params.search,
    limit: params.limit,
    sort: params.sort,
  });
  return requestJson<AgencyListResponse>(`/api/tools/agencies${query}`);
}

export function getAgencyProfile(agencyId: string): Promise<AgencyProfileResponse> {
  return requestJson<AgencyProfileResponse>(`/api/tools/agencies/${agencyId}/profile`);
}

export function getPortfolioSummary(
  params: PortfolioSummaryParams = {},
): Promise<PortfolioSummaryResponse> {
  const query = toQueryString({
    sales_owner: params.sales_owner,
    city: params.city,
  });
  return requestJson<PortfolioSummaryResponse>(`/api/tools/portfolio/summary${query}`);
}
