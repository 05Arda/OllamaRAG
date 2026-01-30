export type FolderNode = {
  type: "folder";
  name: string;
  children: TreeNode[];
};

export type FileNode = {
  type: "file";
  name: string;
  file: File;
};

export type TreeNode = FolderNode | FileNode;

// CHAT TYPES
type AttachmentType = "file" | "image" | "video";

type Attachment = {
  type: AttachmentType;
  id: number | string;
  url: string;
  file?: File;
  poster?: string;
};

type TextContent = {
  type: "text";
  text: string;
};

type MessageUserContent = string | (Attachment | TextContent)[];

type MessageAssistantContent = string | TextContent[];

type Message = {
  id: number | string;
  parentId?: number | string;
  time?: number;
  rating?: "like" | "dislike";
  reasoning?: {
    title?: string;
    text?: string;
    timeSec?: number;
  };
} & (
  | {
      role: "user";
      content: MessageUserContent;
    }
  | {
      role: "assistant";
      content: MessageAssistantContent;
    }
);

export type Thread = {
  id: number | string;
  title: string;
  date?: string;
  messages?: Message[];
} & { isNew?: boolean };

// EMBEDDING
export type Vector = number[][];

export interface CodeChunk {
  text: string; // The actual snippet of code
  path: string; // Original file system path
  language: string; // File extension or identified language
  vector?: Vector;
}
