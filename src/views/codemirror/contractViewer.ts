import { EditorView, basicSetup } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";
import { solidity } from "@replit/codemirror-lang-solidity";
import { foldService } from "@codemirror/language";
import type { Text } from "@codemirror/state";

export function mountContractViewer(parent: HTMLElement, doc = "") {
  return new EditorView({
    state: EditorState.create({
      doc,
      extensions: [
        basicSetup,
        oneDark, // 使用 One Dark 主题
        solidity, // Solidity 语法高亮
        EditorState.readOnly.of(true), // 禁止编辑命令
        EditorView.editable.of(false), // 关掉 DOM contenteditable
        EditorView.lineWrapping, // 长行折行（展示常用）
        solidityBraceFolding, // 折叠行号
      ],
    }),
    parent,
  });
}

// 找从 lineStart 开始的 { ... } 配对范围
function braceFold(state: { doc: Text }, lineStart: number) {
  const doc = state.doc;
  const text = doc.toString();

  // 从当前行起点开始找第一个 '{'
  let depth = 0;
  let started = false;
  let from = -1;

  for (let i = lineStart; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") {
      if (!started) {
        from = i + 1; // 折起来后保留 '{'
        started = true;
      }
      depth++;
    } else if (ch === "}") {
      depth--;
      if (started && depth === 0) {
        return { from, to: i }; // 折起来后保留 '}'
      }
    }
  }
  return null;
}

const solidityBraceFolding = foldService.of((state, lineStart) => {
  // 只处理当前行包含 '{' 的情况
  const line = state.doc.lineAt(lineStart);
  if (!line.text.includes("{")) return null;
  return braceFold(state, lineStart);
});
