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

export type RawDoc = {
  path: string;
  text: string;
};

export type TreeNode = FolderNode | FileNode;

// EMBEDDING
export type Vector = number[];

export interface CodeChunk {
  text: string; // The actual snippet of code
  path: string; // Original file system path
  language: string; // File extension or identified language
  vector?: Vector;
  metadata?: Record<string, any>; // Additional metadata if needed
}
