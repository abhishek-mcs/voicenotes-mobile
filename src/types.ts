export enum ATTACHMENT_TYPE {
    LINK = 1,
    IMAGE = 2,
  }


export interface Attachment {
  description: string;
  id: number;
  type: ATTACHMENT_TYPE;
  url: string;
  is_uploading: boolean;
}