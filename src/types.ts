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
  temp_parent_id?:string |null
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
