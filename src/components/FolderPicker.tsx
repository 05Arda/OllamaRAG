import type { ChangeEvent } from "react";
import { useRef } from "react";
import type { FolderNode } from "../types/types";

import { IGNORED_DIRECTORIES, SUPPORTED_LANGUAGES } from "../utils/fileTypes";

type FolderPickerProps = {
  onDirectoryChange: (directory: FolderNode) => void;
};

export default function FolderPicker({ onDirectoryChange }: FolderPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // todo: when added files, trigger analysis automatically
  const handleAnalyze = async () => {
    const response = await fetch("http://localhost:3001/api/analyze", {
      method: "POST",
    });
    const data = await response.json();
    alert(data.message);
  };

  const handleFolderSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const root: FolderNode = {
      type: "folder",
      name: "root",
      children: [],
    };

    for (const file of files) {
      if (IGNORED_DIRECTORIES.includes(file.name)) continue;
      const ext = file.name.split(".").pop() || "";
      if (!SUPPORTED_LANGUAGES.includes(ext)) continue;

      const parts = file.webkitRelativePath.split("/");

      let current = root;

      for (let i = 0; i < parts.length - 1; i++) {
        const folderName = parts[i];

        let folder = current.children.find(
          (child): child is FolderNode =>
            child.type === "folder" && child.name === folderName,
        );

        if (!folder) {
          folder = {
            type: "folder",
            name: folderName,
            children: [],
          };
          current.children.push(folder);
        }

        current = folder;
      }

      current.children.push({
        type: "file",
        name: parts[parts.length - 1],
        file,
      });
    }

    onDirectoryChange(root);
    handleAnalyze();
  };

  return (
    <input
      ref={inputRef}
      type="file"
      multiple
      onChange={handleFolderSelect}
      onClick={() => {
        inputRef.current?.setAttribute("webkitdirectory", "");
        inputRef.current?.setAttribute("directory", "");
      }}
    />
  );
}
