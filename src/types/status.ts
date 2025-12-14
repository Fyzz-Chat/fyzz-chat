import type { ProviderId } from "@/types/provider";

export interface Status {
  all: boolean;
  providers: {
    [key in ProviderId]: boolean;
  };
}
