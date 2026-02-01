import type { ChangeEvent } from "react";
import { useRef } from "react";
import type { FolderNode } from "../types/types";

import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

import { IGNORED_DIRECTORIES, SUPPORTED_LANGUAGES } from "../utils/fileTypes";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(" ") + "\n";
  }
  return fullText;
}

type FolderPickerProps = {
  onDirectoryChange: (directory: FolderNode) => void;
};

export default function FolderPicker({ onDirectoryChange }: FolderPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async (formData: FormData) => {
    const response = await fetch("http://localhost:3001/api/analyze", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    alert(data.message);
  };

  const handleFolderSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const formData = new FormData();
    const fileTree: string[] = [];

    const root: FolderNode = {
      type: "folder",
      name: "root",
      children: [],
    };

    for (const file of files) {
      if (IGNORED_DIRECTORIES.includes(file.name)) continue;
      const ext = file.name.split(".").pop() || "";
      if (!SUPPORTED_LANGUAGES.includes(ext)) continue;

      fileTree.push("-" + file.webkitRelativePath.toString());

      if (ext === "pdf") {
        try {
          const pdfText = await extractTextFromPDF(file);
          const textFile = new File(
            [pdfText],
            file.name.replace(".pdf", ".txt"),
            {
              type: "text/plain",
            },
          );

          console.log("PDF metni çıkarıldı:", pdfText);

          formData.append("files", textFile);
        } catch (err) {
          console.error("PDF parselleme hatası:", file.name, err);
          continue;
        }
      } else {
        formData.append("files", file);
      }

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

    formData.append(
      "fileTree",
      JSON.stringify(fileTree.join(" \n ") + "### FILE_TREE_END"),
    );

    onDirectoryChange(root);
    handleAnalyze(formData);
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
