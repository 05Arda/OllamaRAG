import { useState } from "react";
import type { FolderNode, TreeNode } from "../types/types";

type FolderTreeProps = {
  directory: FolderNode;
};

export default function FolderTree({ directory }: FolderTreeProps) {
  const [openFolders, setOpenFolders] = useState<Set<string>>(
    () => new Set(["root"]),
  );

  const [isRootOpen, setRootState] = useState<boolean>(true);

  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => {
      let next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderNode = (
    node: TreeNode,
    path: string,
    depth = 0,
    isLast = false,
  ) => {
    let paddingLeft = depth * 16;
    const id = path;
    const isOpen = openFolders.has(id);

    if (node.type == "file") {
      return (
        <div
          key={node.name}
          style={{
            paddingLeft,
            display: "flex",
            alignItems: "center",
            gap: 6,
            lineHeight: "20px",
          }}
        >
          <span>{isLast ? "└─" : "├─"}</span>
          <span>
            {node.name.length >= 25
              ? (() => {
                  const i = node.name.lastIndexOf(".");
                  return node.name.slice(0, 25) + "-." + node.name.slice(i + 1);
                })()
              : node.name}
          </span>
        </div>
      );
    }

    return (
      <div key={node.name}>
        <div
          onClick={() => toggleFolder(id)}
          style={{
            paddingLeft,
            display: "flex",
            alignItems: "center",
            gap: 6,
            lineHeight: "20px",
            fontWeight: 800,
          }}
        >
          <span>{isLast ? "└─" : "├─"}</span>
          <span>{node.name.slice(0, 25)}</span>
          <span>{isOpen ? "-" : "+"}</span>
        </div>

        {isOpen &&
          node.children.map((child, index) =>
            renderNode(
              child,
              `${id}/${child.name}`,
              depth + 1,
              index === node.children.length - 1,
            ),
          )}
      </div>
    );
  };

  return (
    <div key={"root"}>
      <div
        onClick={() => {
          toggleFolder("root");
          setRootState(!isRootOpen);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          lineHeight: "20px",
          fontWeight: 800,
        }}
      >
        <span>{"root"}</span>
        <span>{isRootOpen ? "-" : "+"}</span>
      </div>

      {isRootOpen &&
        directory.children.map((child, index) =>
          renderNode(
            child,
            child.name,
            0,
            index === directory.children.length - 1,
          ),
        )}
    </div>
  );
}
