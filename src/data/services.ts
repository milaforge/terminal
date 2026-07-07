import type { ServiceItem } from "@types";
import rawServices from "./services.json";

export const SERVICES_INTRO: string = rawServices.intro;
export const SERVICES: ServiceItem[] = rawServices.services;

export function findService(input: string): ServiceItem | undefined {
  const token = input.toLowerCase().trim();
  if (!token) return undefined;
  return (
    SERVICES.find((service) => service.id === token) ||
    SERVICES.find((service) => service.title.toLowerCase() === token) ||
    SERVICES.find((service) => service.title.toLowerCase().includes(token))
  );
}
