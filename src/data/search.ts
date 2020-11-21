import { SearchResponse } from "../pages/api/search/[query]";

export async function search(query: string): Promise<SearchResponse> {
  const response = await fetch(`${process.env.VERCEL_URL}/api/search/${encodeURIComponent(query)}`);
  const xml: SearchResponse = await response.json();
  return xml;
}