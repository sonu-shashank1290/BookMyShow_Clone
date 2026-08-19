import { api } from "@/common/lib/api";
import type { CityList } from "@/features/city/types";

export function listCities() {
  return api<CityList>("/cities");
}
