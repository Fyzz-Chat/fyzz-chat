import type { Element, ElementContent, Root, Text } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const CITATION_TEST = /\[\d+\]/;
const CITATION_GROUP_REGEX = /(\[\d+\])(\s*\[\d+\])*/g;
const CITATION_INDEX_REGEX = /\[(\d+)\]/g;

const rehypeCitations: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined) return;

      const text = node.value;
      if (!CITATION_TEST.test(text)) return;

      CITATION_GROUP_REGEX.lastIndex = 0;
      const children: ElementContent[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null = CITATION_GROUP_REGEX.exec(text);

      while (match !== null) {
        if (match.index > lastIndex) {
          children.push({
            type: "text",
            value: text.slice(lastIndex, match.index),
          });
        }

        const group = match[0];
        CITATION_INDEX_REGEX.lastIndex = 0;
        const indices: string[] = [];
        let idx = CITATION_INDEX_REGEX.exec(group);
        while (idx !== null) {
          indices.push(idx[1]);
          idx = CITATION_INDEX_REGEX.exec(group);
        }

        const cite: Element = {
          type: "element",
          tagName: "cite",
          properties: { "data-indices": indices.join(",") },
          children: [{ type: "text", value: group }],
        };
        children.push(cite);
        lastIndex = CITATION_GROUP_REGEX.lastIndex;
        match = CITATION_GROUP_REGEX.exec(text);
      }

      if (lastIndex < text.length) {
        children.push({ type: "text", value: text.slice(lastIndex) });
      }

      if (children.length > 0) {
        parent.children.splice(index, 1, ...children);
      }
    });
  };
};

export default rehypeCitations;
