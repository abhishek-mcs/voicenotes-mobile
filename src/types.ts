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

// this is the attachment object returned by the API
interface AttachmentAPI {
  description: string | null;
  id: number;
  type: ATTACHMENT_TYPE;
  url: string | null;
  recording_id?: string;
  public_url?: string;
  created_at: string;
  updated_at?: string;
}

type Tag = {
  id: number,
  user_id: number,
  name: string,
  keywords: string[],
  is_pinned: 0 | 1,
  display_order?: null | number,
  emoji: string | null,
  created_at: string,
  updated_at: string,
  workspace_id: string | null,
  pivot?: {
      recording_id: number,
      tag_id: number
  }
}

export type VoiceNote = {
  id: string,
  recording_id: string,
  created_at: string,
  recorded_at?: string | null,
  updated_at: string,
  deleted_at: string | null,
  title: string | null,
  transcript: string | null,
  duration: number,
  attachments: AttachmentAPI[],
  tags: Tag[],
  latest_attachment_updated_at: string | null
}

type BaseNote = {
  id: any;
  audio: any;
  isUploading?: boolean;
  title?: string;
  transcript?: null;
  recorded_at?: number;
  status: string;
  parent_id?: string | null
  internalUrl?:string
  isSubnote?:boolean
  temp_id?:string
  temp_parent_id?:string |null,
  recording_type?:number|null,
};

export type NewNote = BaseNote;

export type Note = BaseNote & {
  related_notes: BaseNote[];
  subnotes: Note[];
  creations: any[];
  created_at: number;
};

export type Subnote = Note
export type Language = 
  | "" | "af" | "ar" | "hy" | "az" | "be" | "bs" | "bg" | "ca" | "zh-Hans" | "zh-Hant"
  | "hr" | "cs" | "da" | "nl" | "en" | "et" | "fi" | "fr" | "gl" | "de" | "el" | "he"
  | "hi" | "hu" | "is" | "id" | "it" | "ja" | "kn" | "kk" | "ko" | "lv" | "lt" | "mk"
  | "ms" | "ml" | "mr" | "mi" | "ne" | "no" | "fa" | "pl" | "pt" | "ro" | "ru" | "sr"
  | "sk" | "sl" | "es" | "sw" | "sv" | "tl" | "ta" | "th" | "tr" | "uk" | "ur" | "vi" | "cy" | string;

export interface SettingsPayload {
  name: string;
  fix_punctuation: boolean;
  remember_words: string[];
  language: Language;
  about: string;
}
