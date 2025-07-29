export interface Message {
  id: string;
  status: "pre-processed" | "processed" | "discarded";
  createdAt: Date;
  payload: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    region: string;
  };
  emails: string[];
}
