// Ports mockup boards (design/mockup/*.dc.html) to React components, 1:1.
//
//   node scripts/port-mockup.mjs Landing Main About ...
//
// For each board it writes:
//   components/sk/<Board>.tsx   the same markup as JSX, with the board's own logic class as a React class component
//   app/sk/boards/<Board>.css   the board's <style> block
// Mockup asset paths (/_blob/<id>) become /sk/<file> (copied into public/sk), links to other boards become app
// routes (lib/sk/routes.json), and the light/dark choice comes from the sk-mode cookie via props.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { FIXUPS as BASE_FIXUPS } from "./port-fixups.mjs";
import { LINK_FIXUPS } from "./port-fixups-links.mjs";
import { INBOX_FIXUPS } from "./port-fixups-inbox.mjs";
import { HOME_FIXUPS } from "./port-fixups-home.mjs";
import { MYSTERY_FIXUPS } from "./port-fixups-mystery.mjs";
import { SHARE_FIXUPS } from "./port-fixups-share.mjs";

const FIXUPS = { ...BASE_FIXUPS, ...LINK_FIXUPS, ...INBOX_FIXUPS, ...HOME_FIXUPS, ...MYSTERY_FIXUPS, ...SHARE_FIXUPS };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MOCK = path.join(ROOT, "design/mockup");
const OUT_TSX = path.join(ROOT, "components/sk");
const OUT_CSS = path.join(ROOT, "app/sk/boards");
const ROUTES = JSON.parse(fs.readFileSync(path.join(ROOT, "lib/sk/routes.json"), "utf8"));
const ASSETS = JSON.parse(fs.readFileSync(path.join(MOCK, "assets.json"), "utf8")); // blob id -> file name in public/sk

// Board-specific fixes (server/browser differences, and wiring screens to server actions) live in port-fixups.mjs.

const VOID = new Set(["img", "input", "br", "hr", "meta", "link", "source", "area", "col", "wbr", "path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "stop", "use"]);
const NO_TEXT = new Set(["table", "thead", "tbody", "tfoot", "tr", "svg", "select", "colgroup", "g", "defs"]);
const ATTR = { class: "className", for: "htmlFor", maxlength: "maxLength", minlength: "minLength", autocomplete: "autoComplete", tabindex: "tabIndex", inputmode: "inputMode", readonly: "readOnly", spellcheck: "spellCheck", colspan: "colSpan", rowspan: "rowSpan", enterkeyhint: "enterKeyHint", autocapitalize: "autoCapitalize", crossorigin: "crossOrigin", playsinline: "playsInline", srcset: "srcSet", viewbox: "viewBox", "xlink:href": "xlinkHref" };
const BOOL = new Set(["disabled", "checked", "readonly", "required", "autofocus", "multiple", "selected", "open", "muted", "controls", "playsinline", "autoplay", "loop"]);

const rewrite = (s) =>
  s
    .replace(/\/_blob\/([0-9a-f]{32})/g, (m, id) => {
      if (!ASSETS[id]) throw new Error("unknown asset " + id);
      return "/sk/" + ASSETS[id];
    })
    .replace(/'Bricolage Grotesque'/g, "var(--font-display)")
    .replace(/'DM Sans'/g, "var(--font-body)");

// ---------- tiny HTML parser (the mockup's markup is regular and well formed) ----------
function parse(src) {
  const root = { tag: "#root", attrs: [], children: [] };
  const stack = [root];
  let i = 0;
  while (i < src.length) {
    if (src.startsWith("<!--", i)) {
      const end = src.indexOf("-->", i);
      stack.at(-1).children.push({ comment: src.slice(i + 4, end).trim() });
      i = end + 3;
    } else if (src.startsWith("</", i)) {
      const end = src.indexOf(">", i);
      const tag = src.slice(i + 2, end).trim();
      // "<path ...></path>": void-like tags were never opened, and a close must match an open tag
      if (!VOID.has(tag) && stack.some((n) => n.tag === tag)) {
        while (stack.length > 1 && stack.at(-1).tag !== tag) stack.pop();
        if (stack.length > 1) stack.pop();
      }
      i = end + 1;
    } else if (src[i] === "<" && /[A-Za-z]/.test(src[i + 1])) {
      let j = i + 1;
      while (/[\w-:]/.test(src[j])) j++;
      const tag = src.slice(i + 1, j);
      const attrs = [];
      for (;;) {
        while (/\s/.test(src[j])) j++;
        if (src[j] === ">" || src.startsWith("/>", j)) break;
        let k = j;
        while (!/[\s=>]/.test(src[k]) && !src.startsWith("/>", k)) k++;
        const name = src.slice(j, k);
        let value = null;
        if (src[k] === "=") {
          const q = src[k + 1];
          const end = src.indexOf(q, k + 2);
          value = src.slice(k + 2, end);
          k = end + 1;
        }
        attrs.push([name, value]);
        j = k;
      }
      const selfClose = src.startsWith("/>", j);
      const node = { tag, attrs, children: [] };
      stack.at(-1).children.push(node);
      i = j + (selfClose ? 2 : 1);
      if (!selfClose && !VOID.has(tag)) stack.push(node);
    } else {
      const next = src.indexOf("<", i);
      const end = next < 0 ? src.length : next;
      stack.at(-1).children.push({ text: src.slice(i, end) });
      i = end;
    }
  }
  return root;
}

// ---------- template expressions ----------
function expr(raw, scope) {
  const e = raw.trim();
  if (/^(true|false|null|-?\d+(\.\d+)?)$/.test(e)) return e;
  if (!/^[A-Za-z_$][\w$]*(\.[\w$]+)*$/.test(e)) throw new Error("unsupported expression {{" + raw + "}}");
  const head = e.split(".")[0];
  return scope.includes(head) ? e : "v." + e;
}
const hasExpr = (s) => /\{\{[^}]*\}\}/.test(s);
const onlyExpr = (s) => /^\s*\{\{[^}]*\}\}\s*$/.test(s);
function interp(s, scope) {
  // "a {{x}} b" -> `a ${x} b`
  return "`" + s.replace(/[`\\]/g, "\\$&").replace(/\$\{/g, "\\${").replace(/\{\{([^}]*)\}\}/g, (m, e) => "${" + expr(e, scope) + "}") + "`";
}
function attrValue(s, scope) {
  if (s == null) return "{true}";
  if (onlyExpr(s)) return "{" + expr(s.trim().slice(2, -2), scope) + "}";
  if (hasExpr(s)) return "{" + interp(s, scope) + "}";
  return JSON.stringify(decode(s));
}
function decode(s) {
  return s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
}
function styleObject(s, scope) {
  const parts = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === ";" && depth === 0) { parts.push(cur); cur = ""; } else cur += ch;
  }
  parts.push(cur);
  const props = [];
  for (const p of parts) {
    const at = p.indexOf(":");
    if (at < 0) { if (p.trim()) throw new Error("bad style part: " + p); continue; }
    let name = p.slice(0, at).trim();
    const val = p.slice(at + 1).trim();
    const key = name.startsWith("--") ? JSON.stringify(name) : name.replace(/^-(webkit|moz|ms)-/, (m, v) => v.charAt(0).toUpperCase() + v.slice(1) + "-").replace(/-([a-z])/g, (m, c) => c.toUpperCase());
    props.push(key + ": " + (hasExpr(val) ? (onlyExpr(val) ? expr(val.trim().slice(2, -2), scope) : interp(val, scope)) : JSON.stringify(decode(val))));
  }
  return "{{ " + props.join(", ") + " }}";
}
function jsxText(t) {
  return decode(t).replace(/[{}<>]/g, (c) => `{${JSON.stringify(c)}}`);
}

// ---------- JSX generation ----------
function gen(node, scope, imports, parentTag, ind) {
  const pad = "  ".repeat(ind);
  if (node.comment != null) return node.comment.includes("--") ? "" : `${pad}{/* ${node.comment.replace(/\*\//g, "* /")} */}\n`;
  if (node.text != null) {
    const raw = node.text;
    if (!raw.trim()) return NO_TEXT.has(parentTag) ? "" : `${pad}{" "}\n`;
    const collapsed = raw.replace(/\s+/g, " ");
    const out = [];
    let last = 0;
    for (const m of collapsed.matchAll(/\{\{([^}]*)\}\}/g)) {
      if (m.index > last) out.push(collapsed.slice(last, m.index));
      out.push({ e: expr(m[1], scope) });
      last = m.index + m[0].length;
    }
    if (last < collapsed.length) out.push(collapsed.slice(last));
    // keep edge spaces exactly as HTML would render them
    return pad + out.map((p) => (typeof p === "string" ? (/^ | $/.test(p) ? `{${JSON.stringify(decode(p))}}` : jsxText(p)) : `{${p.e}}`)).join("") + "\n";
  }
  const attr = (n) => (node.attrs.find((a) => a[0] === n) || [])[1];
  const kids = (sc) => node.children.map((c) => gen(c, sc, imports, node.tag === "sc-if" || node.tag === "sc-for" ? parentTag : node.tag, ind + 1)).join("");

  if (node.tag === "sc-if") {
    const cond = expr(attr("value").trim().slice(2, -2), scope);
    return `${pad}{${cond} ? (\n${pad}  <>\n${kids(scope)}${pad}  </>\n${pad}) : null}\n`;
  }
  if (node.tag === "sc-for") {
    const list = expr(attr("list").trim().slice(2, -2), scope);
    const as = attr("as");
    const idx = "i" + scope.length;
    return `${pad}{(${list} || []).map((${as}, ${idx}) => (\n${pad}  <Fragment key={${idx}}>\n${kids([...scope, as, idx])}${pad}  </Fragment>\n${pad}))}\n`;
  }
  if (node.tag === "dc-import") {
    const name = attr("name");
    imports.add(name);
    const props = node.attrs
      .filter(([n]) => n !== "name" && !n.startsWith("hint-"))
      .map(([n, v]) => `${n.replace(/-([a-z])/g, (m, c) => c.toUpperCase())}=${attrValue(v, scope)}`);
    return `${pad}<${name} ${props.join(" ")} />\n`;
  }

  let tag = node.tag;
  const out = [];
  const hasOnChange = node.attrs.some(([n]) => n === "onChange");
  for (const [n0, v] of node.attrs) {
    if (n0.startsWith("hint-")) continue;
    let n = ATTR[n0.toLowerCase()] || n0;
    if (n === "style") { out.push("style=" + styleObject(v, scope)); continue; }
    if (/^on[A-Z]/.test(n)) { out.push(`${n}={${expr(v.trim().slice(2, -2), scope)}}`); continue; }
    if (n === "href" && tag === "a") {
      tag = "SkLink";
      imports.add("#SkLink");
      if (!hasExpr(v)) {
        const m = /^([A-Za-z]+)\.dc\.html(#.*)?$/.exec(v);
        const to = m ? (ROUTES[m[1]] ?? "/not-found") + (m[2] || "") : decode(v);
        out.push(`href=${JSON.stringify(to.replace(/^\/#/, "/#"))}`);
      } else {
        out.push(`href={route(${attrValue(v, scope).slice(1, -1)})}`);
        imports.add("#route");
      }
      continue;
    }
    if (n === "value" && (tag === "input" || tag === "textarea")) {
      const val = v != null && onlyExpr(v) ? expr(v.trim().slice(2, -2), scope) + ' ?? ""' : JSON.stringify(decode(v ?? ""));
      out.push(`${hasOnChange ? "value" : "defaultValue"}={${val}}`);
      continue;
    }
    if (BOOL.has(n0.toLowerCase())) {
      if (v == null || v === "") out.push(`${n}`);
      else if (onlyExpr(v)) out.push(`${n}={!!(${expr(v.trim().slice(2, -2), scope)})}`);
      else out.push(`${n}={${JSON.stringify(v !== "false")}}`);
      if (n === "checked" && !hasOnChange) out[out.length - 1] = out.at(-1).replace(/^checked/, "defaultChecked");
      continue;
    }
    if (n.includes("-") && !/^(aria|data)-/.test(n)) n = n.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
    if (n.includes(":")) n = n.replace(/:([a-z])/g, (m, c) => c.toUpperCase());
    out.push(`${n}=${attrValue(v, scope)}`);
  }
  const open = `<${tag}${out.length ? " " + out.join(" ") : ""}`;
  if (VOID.has(node.tag) || !node.children.length) return `${pad}${open} />\n`;
  return `${pad}${open}>\n${kids(scope)}${pad}</${tag}>\n`;
}

/**
 * The mockup's menus carry sample counts (Inbox 4, Notifications 3). In the app every screen shows the real
 * unread counts from the navInbox / navNotif props, and nothing at all when there's nothing new.
 */
function liveNavCounts(src) {
  const show = (cls, key) => `<sc-if value="{{${key}}}" hint-placeholder-val="{{ false }}"><span class="${cls}">{{${key}}}</span></sc-if>`;
  return src
    .replace(/Inbox<span class="(count|badge)">(?:\d+|\{\{\w+\}\})<\/span>/g, (_, cls) => "Inbox" + show(cls, "navInbox"))
    .replace(/Notifications<span class="count">\d+<\/span>/g, "Notifications" + show("count", "navNotif"))
    .replace(/<span class="badge">\d+<\/span>/g, show("badge", "navNotif"));
}

function port(board) {
  const file = path.join(MOCK, board + ".dc.html");
  let src = rewrite(fs.readFileSync(file, "utf8"));
  // fixups may touch the template as well as the logic, so they run on the whole board
  for (const fix of FIXUPS[board] || []) {
    if (typeof fix === "function") {
      src = fix(src);
      continue;
    }
    const [a, b] = fix;
    if (!src.includes(a)) throw new Error(board + " fixup not found: " + a.slice(0, 60));
    src = src.replace(a, b);
  }
  src = liveNavCounts(src);
  const xdc = src.slice(src.indexOf("<x-dc>") + 6, src.indexOf("</x-dc>"));
  const helmet = /<helmet>([\s\S]*?)<\/helmet>/.exec(xdc);
  const css = helmet ? [...helmet[1].matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1].trim()).join("\n") : "";
  const tpl = xdc.replace(/<helmet>[\s\S]*?<\/helmet>/, "");
  const script = /<script type="text\/x-dc" data-dc-script data-props='([^']*)'>([\s\S]*?)<\/script>/.exec(src);
  if (!script) throw new Error(board + ": no logic script");
  const propsDef = JSON.parse(script[1]);
  const defaults = Object.fromEntries(Object.entries(propsDef).filter(([k, d]) => !k.startsWith("$") && d && "default" in d).map(([k, d]) => [k, d.default]));
  let logic = script[2].trim();
  logic = logic
    .replace(/var m = null;\s*try \{ m = window\.localStorage\.getItem\('sk-mode'\); \} catch \(e\) \{\}/, "var m = null; // light/dark arrives as props.mode from the sk-mode cookie")
    .replace(/try \{ window\.localStorage\.setItem\('sk-mode', (\w+)\); \} catch \(e\) \{\}/g, "saveMode($1);");
  if (logic.includes("window.localStorage.setItem('sk-mode'")) throw new Error(board + ": unhandled sk-mode write");
  const head = "class Component extends DCLogic {";
  if (!logic.startsWith(head)) throw new Error(board + ": unexpected logic header");
  const imports = new Set();
  const root = parse(tpl);
  const body = root.children.map((c) => gen(c, [], imports, "#root", 3)).join("");
  const comps = [...imports].filter((x) => !x.startsWith("#"));
  const helpers = ["saveMode", imports.has("#SkLink") && "SkLink", imports.has("#route") && "route"].filter(Boolean);
  const cls = logic.slice(head.length, logic.lastIndexOf("}"));
  const tsx = `// @ts-nocheck -- ported 1:1 from design/mockup/${board}.dc.html by scripts/port-mockup.mjs; typed as it gets wired to real data
"use client";

import React, { Fragment } from "react";
import { ${helpers.join(", ")} } from "@/lib/sk/runtime";
${comps.map((c) => `import ${c} from "./${c}";`).join("\n")}

export default class ${board} extends React.Component<Record<string, any>, any> {
  static defaultProps = ${JSON.stringify(defaults)};
${cls.replace(/\n+$/, "")}

  render() {
    // like the mockup runtime: the template sees the props merged with renderVals()
    const v = { ...this.props, ...(this.renderVals() || {}) };
    return (
      <>
${body}      </>
    );
  }
}
`;
  fs.mkdirSync(OUT_TSX, { recursive: true });
  fs.mkdirSync(OUT_CSS, { recursive: true });
  fs.writeFileSync(path.join(OUT_TSX, board + ".tsx"), tsx);
  fs.writeFileSync(path.join(OUT_CSS, board + ".css"), `/* ${board}: from design/mockup/${board}.dc.html */\n` + css + "\n");
  const storage = [...cls.matchAll(/constructor\(props\) \{([\s\S]*?)\n  \}/g)].map((m) => m[1]).join("").replace(/\/\/[^\n]*/g, "").match(/(local|session)Storage[^;]*/g) || [];
  console.log(`ported ${board}  (${tsx.split("\n").length} lines, ${css.length} bytes css)${storage.length ? "  ⚠ constructor reads " + storage.join(" | ") : ""}`);
}

const boards = process.argv.slice(2);
if (!boards.length) { console.error("usage: node scripts/port-mockup.mjs <Board> ..."); process.exit(1); }
for (const b of boards) port(b);
