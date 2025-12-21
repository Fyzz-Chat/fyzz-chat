export type CodeInterpreterOutput = {
  outputs?: Array<
    | {
        type: "logs";
        logs: string;
      }
    | {
        type: "image";
        url: string;
      }
  > | null;
};
