import type { Agency } from "../../data/mockData";

export interface MapCluster {
  id: number;
  agencies: Agency[];
  center: [number, number];
}

export const CLUSTER_COLORS_HEX = ["#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed"];
export const CLUSTER_COLORS_CLASS = ["bg-blue-600", "bg-red-600", "bg-emerald-600", "bg-amber-600", "bg-violet-600"];

function getTierWeight(tier: Agency["priority_tier"]): number {
  if (tier === "A") {
    return 3;
  }
  if (tier === "B") {
    return 2;
  }
  return 1;
}

export function createAgencyClusters(
  agencies: Agency[],
  clusterCount: number,
  weightByPriority: boolean,
): MapCluster[] {
  if (agencies.length === 0) {
    return [];
  }

  const boundedClusterCount = Math.max(1, Math.min(clusterCount, agencies.length));
  const sortedAgencies = [...agencies];

  if (weightByPriority) {
    sortedAgencies.sort((left, right) => getTierWeight(right.priority_tier) - getTierWeight(left.priority_tier));
  }

  const chunkSize = Math.ceil(sortedAgencies.length / boundedClusterCount);
  const clusters: MapCluster[] = [];

  for (let index = 0; index < boundedClusterCount; index += 1) {
    const clusterAgencies = sortedAgencies.slice(index * chunkSize, (index + 1) * chunkSize);
    if (clusterAgencies.length === 0) {
      continue;
    }

    const avgLatitude =
      clusterAgencies.reduce((sum, agency) => sum + agency.latitude, 0) / clusterAgencies.length;
    const avgLongitude =
      clusterAgencies.reduce((sum, agency) => sum + agency.longitude, 0) / clusterAgencies.length;

    clusters.push({
      id: index + 1,
      agencies: clusterAgencies,
      center: [avgLatitude, avgLongitude],
    });
  }

  return clusters;
}

export function formatCompactCurrency(value: number, language: "en" | "tr"): string {
  return new Intl.NumberFormat(language === "tr" ? "tr-TR" : "en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
