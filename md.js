// NewColony Wiki 正文解析器。
// 输入是一页正文的行数组（Markdown + 允许内嵌 HTML），输出 HTML 字符串。
// 设计约束：不使用 fetch / XHR，不依赖构建步骤；纯函数，便于在 file:// 下运行。
// 支持：标题、段落、无序/有序列表（单层嵌套）、表格、围栏代码块、行内代码、
// 粗体、斜体、链接、引用块；任何以 < 开头的行按原文透传（HTML 片段）。

(function () {
  "use strict";

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // 站内 .html 链接改写成阅读器的 hash 路由；外链与锚点保持原样。
  function rewriteHref(href) {
    var value = String(href).trim();
    if (/^(https?:|mailto:|tel:|#|\/\/)/.test(value)) return value;
    var match = /^([^#?]+)\.html(#.*)?$/.exec(value);
    if (match) return "#/" + match[1] + (match[2] || "");
    return value;
  }

  function renderInline(text) {
    var codes = [];
    var out = String(text).replace(/`([^`]+)`/g, function (m, body) {
      codes.push(body);
      return "\u0000" + (codes.length - 1) + "\u0000";
    });
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, href) {
      return '<a href="' + escapeHtml(rewriteHref(href)) + '">' + label + "</a>";
    });
    out = out.replace(/\u0000(\d+)\u0000/g, function (m, index) {
      return "<code>" + escapeHtml(codes[Number(index)]) + "</code>";
    });
    return out;
  }

  function isBlockStart(line) {
    return /^\s*</.test(line) ||
      /^(#{1,6})\s/.test(line) ||
      /^(```|~~~)/.test(line) ||
      /^\s*[-*]\s+/.test(line) ||
      /^\s*\d+\.\s+/.test(line) ||
      /^\s*>/.test(line) ||
      /^\s*\|/.test(line);
  }

  function splitRow(line) {
    var body = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    return body.split("|").map(function (cell) { return cell.trim(); });
  }

  function isAlignRow(line) {
    return /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.indexOf("-") >= 0;
  }

  function renderTable(lines, start) {
    var header = splitRow(lines[start]);
    var bodyRows = [];
    var index = start + 2;
    while (index < lines.length && /^\s*\|/.test(lines[index])) {
      bodyRows.push(splitRow(lines[index]));
      index++;
    }
    var html = ["<table>", "<thead><tr>"];
    for (var h = 0; h < header.length; h++) html.push("<th>" + renderInline(header[h]) + "</th>");
    html.push("</tr></thead>", "<tbody>");
    for (var r = 0; r < bodyRows.length; r++) {
      html.push("<tr>");
      for (var c = 0; c < bodyRows[r].length; c++) html.push("<td>" + renderInline(bodyRows[r][c]) + "</td>");
      html.push("</tr>");
    }
    html.push("</tbody>", "</table>");
    return { html: html.join(""), next: index };
  }

  function renderList(lines, start, ordered) {
    var pattern = ordered ? /^(\s*)\d+\.\s+(.*)$/ : /^(\s*)[-*]\s+(.*)$/;
    var items = [];
    var index = start;
    var baseIndent = (pattern.exec(lines[start]) || ["", ""])[1].length;
    while (index < lines.length) {
      var match = pattern.exec(lines[index]);
      if (!match || match[1].length < baseIndent) break;
      if (match[1].length > baseIndent) {
        var nested = renderList(lines, index, false);
        items[items.length - 1] += nested.html;
        index = nested.next;
        continue;
      }
      items.push("<li>" + renderInline(match[2]) + "</li>");
      index++;
    }
    var tag = ordered ? "ol" : "ul";
    return { html: "<" + tag + ">" + items.join("") + "</" + tag + ">", next: index };
  }

  function render(lines) {
    var out = [];
    var i = 0;
    while (i < lines.length) {
      var line = lines[i];
      if (String(line).trim() === "") { i++; continue; }

      // HTML 片段：以 < 开头的连续非空行原样输出
      if (/^\s*</.test(line)) {
        var raw = [];
        while (i < lines.length && String(lines[i]).trim() !== "") { raw.push(lines[i]); i++; }
        out.push(raw.join("\n"));
        continue;
      }

      // 围栏代码块
      var fence = /^(```|~~~)/.exec(line);
      if (fence) {
        var marker = fence[1];
        i++;
        var code = [];
        while (i < lines.length && String(lines[i]).trim().indexOf(marker) !== 0) { code.push(lines[i]); i++; }
        i++;
        out.push("<pre><code>" + escapeHtml(code.join("\n")) + "</code></pre>");
        continue;
      }

      // 标题
      var heading = /^(#{1,6})\s+(.*)$/.exec(line);
      if (heading) {
        var level = heading[1].length;
        var idMatch = /\s*\{#([A-Za-z0-9_-]+)\}\s*$/.exec(heading[2]);
        var text = idMatch ? heading[2].replace(idMatch[0], "") : heading[2];
        var idAttr = idMatch ? ' id="' + idMatch[1] + '"' : "";
        out.push("<h" + level + idAttr + ">" + renderInline(text.trim()) + "</h" + level + ">");
        i++;
        continue;
      }

      // 表格
      if (/^\s*\|/.test(line) && i + 1 < lines.length && isAlignRow(lines[i + 1])) {
        var table = renderTable(lines, i);
        out.push(table.html);
        i = table.next;
        continue;
      }

      // 列表
      if (/^\s*[-*]\s+/.test(line)) {
        var ul = renderList(lines, i, false);
        out.push(ul.html);
        i = ul.next;
        continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        var ol = renderList(lines, i, true);
        out.push(ol.html);
        i = ol.next;
        continue;
      }

      // 引用块
      if (/^\s*>/.test(line)) {
        var quote = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) {
          quote.push(String(lines[i]).replace(/^\s*>\s?/, ""));
          i++;
        }
        out.push('<blockquote class="callout info">' + renderInline(quote.join(" ")) + "</blockquote>");
        continue;
      }

      // 段落
      var paragraph = [];
      while (i < lines.length && String(lines[i]).trim() !== "" && !isBlockStart(lines[i])) {
        paragraph.push(String(lines[i]).trim());
        i++;
      }
      out.push("<p>" + renderInline(paragraph.join(" ")) + "</p>");
    }
    return out.join("\n");
  }

  window.__WIKI_MD = { render: render, escapeHtml: escapeHtml };
})();
