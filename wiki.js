// NewColony Wiki 渲染器。
// 页面清单与导航的唯一真相在 nav.js（window.__WIKI_MANIFEST）。
// 本文件不使用 fetch / XHR，站点可以直接以本地文件方式打开。
// 职责：渲染侧边栏、面包屑、页脚、章节搜索，以及 data-* 驱动的速查表。

(function () {
  "use strict";

  const MANIFEST = window.__WIKI_MANIFEST || { chapters: [] };
  const SITE = MANIFEST.site || {};
  const HOME = SITE.home || "index.html";
  const FOOTER_TEXT = SITE.footer || "NewColony Wiki · UTF-8";

  function chapterList() {
    return Array.isArray(MANIFEST.chapters) ? MANIFEST.chapters : [];
  }

  // 展开成扁平条目并保留所属章节与分组，供查找和章节搜索使用。
  function flattenManifest() {
    const out = [];
    for (const chapter of chapterList()) {
      for (const page of chapter.pages || []) {
        out.push({ page, chapter, group: null });
      }
      for (const group of chapter.groups || []) {
        for (const page of group.pages || []) {
          out.push({ page, chapter, group });
        }
      }
    }
    return out;
  }

  function findEntry(pageId) {
    for (const entry of flattenManifest()) {
      if (entry.page.id === pageId) return entry;
    }
    return null;
  }

  // 页面位于自己的目录，导航链接要按当前页深度补前缀。
  function prefixForPath(path) {
    const depth = String(path || "").split("/").length - 1;
    return "../".repeat(Math.max(0, depth));
  }

  // Normalizes legacy or incomplete pages so every document ends up with the
  // canonical `.main > .content` shell and therefore gets a sidebar.
  function ensureShell() {
    let content = document.querySelector(".content");
    if (!content) {
      content = document.createElement("div");
      content.className = "content";
      const movable = Array.from(document.body.childNodes).filter((node) => {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim() !== "";
        if (node.nodeType !== Node.ELEMENT_NODE) return false;
        const tag = node.tagName.toLowerCase();
        return tag !== "script" && tag !== "link" && tag !== "style";
      });
      for (const node of movable) content.appendChild(node);
    }

    let main = content.closest(".main");
    if (!main) {
      main = document.querySelector(".main");
      if (!main) {
        main = document.createElement("div");
        main.className = "main";
        document.body.appendChild(main);
      }
      main.appendChild(content);
    }
    return { main, content };
  }

  function renderTopbar(main, content, entry, prefix) {
    let topbar = main.querySelector(":scope > .topbar");
    if (!topbar) {
      topbar = document.createElement("div");
      topbar.className = "topbar";
      main.insertBefore(topbar, content);
    }
    topbar.textContent = "";

    const crumb = document.createElement("div");
    crumb.className = "breadcrumb";

    const home = document.createElement("a");
    home.href = prefix + HOME;
    home.textContent = "Wiki";
    crumb.appendChild(home);

    if (entry && entry.page.id !== "index") {
      const addPart = (text) => {
        const sep = document.createElement("span");
        sep.className = "sep";
        sep.textContent = "/";
        crumb.appendChild(sep);
        crumb.appendChild(document.createTextNode(text));
      };
      addPart(entry.chapter.title);
      if (entry.group) addPart(entry.group.title);
      addPart(entry.page.title);
    }

    topbar.appendChild(crumb);
    return topbar;
  }

  function renderFooter(content) {
    for (const old of Array.from(content.querySelectorAll(".footer"))) {
      old.remove();
    }
    const footer = document.createElement("div");
    footer.className = "footer";
    footer.textContent = FOOTER_TEXT;
    content.appendChild(footer);
  }

  function createSidebar(activeId, prefix) {
    const sidebar = document.createElement("aside");
    sidebar.className = "sidebar";

    const logo = document.createElement("a");
    logo.href = prefix + HOME;
    logo.className = "sidebar-logo";
    logo.innerHTML = '<div class="logo-icon">NC</div>';
    const logoText = document.createElement("span");
    logoText.textContent = SITE.title || "NewColony Wiki";
    logo.appendChild(logoText);
    sidebar.appendChild(logo);

    const addLink = (container, page, state) => {
      const a = document.createElement("a");
      a.href = prefix + page.path;
      a.textContent = page.title;
      if (page.id === activeId) {
        a.className = "active";
        a.setAttribute("aria-current", "page");
        state.value = true;
      }
      container.appendChild(a);
    };

    const renderPages = (container, pages, state) => {
      for (const page of pages || []) addLink(container, page, state);
    };

    for (const chapter of chapterList()) {
      const nav = document.createElement("nav");
      nav.className = "nav-section";

      const title = document.createElement("div");
      title.className = "nav-section-title";
      title.textContent = chapter.title;
      title.addEventListener("click", () => {
        nav.classList.toggle("collapsed");
      });
      nav.appendChild(title);

      const chapterState = { value: false };
      renderPages(nav, chapter.pages, chapterState);

      for (const group of chapter.groups || []) {
        const sub = document.createElement("div");
        sub.className = "nav-sub-group";

        const subTitle = document.createElement("div");
        subTitle.className = "nav-sub-title";
        subTitle.textContent = group.title;
        subTitle.addEventListener("click", () => {
          sub.classList.toggle("collapsed");
        });
        sub.appendChild(subTitle);

        const groupState = { value: false };
        renderPages(sub, group.pages, groupState);
        if (!groupState.value) sub.classList.add("collapsed");
        if (groupState.value) chapterState.value = true;

        nav.appendChild(sub);
      }

      if (!chapterState.value) nav.classList.add("collapsed");
      sidebar.appendChild(nav);
    }

    return sidebar;
  }

  // 三档主题滑块：日间 / 跟随系统 / 夜间。选择由 theme.js 持久化。
  function createThemeSwitch() {
    const OPTIONS = [
      { mode: "light", icon: "\u2600", label: "日间" },
      { mode: "auto", icon: "\u25D0", label: "跟随系统" },
      { mode: "dark", icon: "\u263E", label: "夜间" }
    ];
    const THEME = window.__WIKI_THEME;
    const OPTION_W = 30;

    const group = document.createElement("div");
    group.className = "theme-switch";
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", "主题");

    const thumb = document.createElement("span");
    thumb.className = "theme-switch-thumb";
    group.appendChild(thumb);

    const buttons = [];
    const sync = (mode) => {
      let index = 0;
      for (let i = 0; i < OPTIONS.length; i += 1) {
        if (OPTIONS[i].mode === mode) index = i;
      }
      thumb.style.transform = "translateX(" + index * OPTION_W + "px)";
      buttons.forEach((button, i) => {
        button.setAttribute("aria-checked", i === index ? "true" : "false");
        button.tabIndex = i === index ? 0 : -1;
      });
    };

    for (const option of OPTIONS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "theme-switch-option";
      button.setAttribute("role", "radio");
      button.title = option.label;
      button.setAttribute("aria-label", option.label);
      button.textContent = option.icon;
      button.addEventListener("click", () => {
        if (THEME && typeof THEME.set === "function") {
          THEME.set(option.mode);
        } else {
          const dark = option.mode === "dark" ||
            (option.mode === "auto" && window.matchMedia &&
             window.matchMedia("(prefers-color-scheme: dark)").matches);
          document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
        }
        sync(option.mode);
      });
      buttons.push(button);
      group.appendChild(button);
    }

    sync(THEME && typeof THEME.get === "function" ? THEME.get() : "auto");
    window.addEventListener("wiki-theme-change", (event) => {
      if (event && event.detail) sync(event.detail.mode);
    });
    return group;
  }

  // Top-right search over the manifest's page list.
  function setupChapterSearch(topbar, prefix) {
    if (!topbar) return;

    const chapters = flattenManifest()
      .filter((entry) => !entry.page.hidden)
      .map((entry) => ({
        label: entry.page.title,
        href: prefix + entry.page.path,
        group: entry.chapter.title,
        subgroup: entry.group ? entry.group.title : null
      }));
    if (chapters.length === 0) return;

    const box = document.createElement("div");
    box.className = "section-search";

    const input = document.createElement("input");
    input.type = "search";
    input.placeholder = "搜索章节...";
    input.setAttribute("aria-label", "搜索章节");
    input.autocomplete = "off";
    input.spellcheck = false;

    const count = document.createElement("span");
    count.className = "section-search-count";
    count.setAttribute("role", "status");
    count.setAttribute("aria-live", "polite");

    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "section-search-clear";
    clear.textContent = "清除";
    clear.hidden = true;

    // Dropdown listing every page in the wiki that matches the query.
    const results = document.createElement("div");
    results.className = "section-search-results";
    results.id = "section-search-results";
    results.hidden = true;
    results.setAttribute("role", "listbox");
    results.setAttribute("aria-label", "匹配的章节");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", "section-search-results");
    input.setAttribute("aria-autocomplete", "list");

    box.appendChild(input);
    box.appendChild(count);
    box.appendChild(clear);
    box.appendChild(results);
    topbar.appendChild(box);

    let matches = [];
    let activeIndex = -1;

    const showResults = () => {
      results.hidden = false;
      input.setAttribute("aria-expanded", "true");
    };
    const hideResults = () => {
      results.hidden = true;
      input.setAttribute("aria-expanded", "false");
      activeIndex = -1;
    };
    const resultItems = () => Array.from(results.querySelectorAll(".section-search-result"));
    const setActive = (index) => {
      const items = resultItems();
      if (items.length === 0) {
        activeIndex = -1;
        return;
      }
      activeIndex = ((index % items.length) + items.length) % items.length;
      items.forEach((item, i) => {
        const on = i === activeIndex;
        item.classList.toggle("active", on);
        item.setAttribute("aria-selected", on ? "true" : "false");
      });
      const active = items[activeIndex];
      if (active && typeof active.scrollIntoView === "function") {
        active.scrollIntoView({ block: "nearest" });
      }
    };
    const goToChapter = (index) => {
      const chapter = matches[index];
      if (!chapter) return;
      hideResults();
      window.location.href = chapter.href;
    };
    const renderResults = (found) => {
      results.innerHTML = "";
      matches = found;
      activeIndex = -1;
      for (const chapter of found) {
        const item = document.createElement("a");
        item.className = "section-search-result";
        item.href = chapter.href;
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", "false");

        const label = document.createElement("span");
        label.className = "section-search-result-label";
        label.textContent = chapter.label;
        item.appendChild(label);

        const context = document.createElement("span");
        context.className = "section-search-result-context";
        context.textContent = chapter.subgroup ? chapter.subgroup + " / " + chapter.group : chapter.group;
        item.appendChild(context);

        results.appendChild(item);
      }

      if (found.length === 0) {
        const empty = document.createElement("div");
        empty.className = "section-search-empty";
        empty.textContent = "没有匹配的章节";
        results.appendChild(empty);
      }
      showResults();
    };

    const apply = () => {
      const query = input.value.trim().toLowerCase();
      box.classList.toggle("has-query", query !== "");
      clear.hidden = query === "";

      if (query === "") {
        count.textContent = "";
        matches = [];
        activeIndex = -1;
        hideResults();
        return;
      }

      const found = chapters.filter((chapter) => chapter.label.toLowerCase().includes(query));
      renderResults(found);
      count.textContent = found.length === 0 ? "无匹配章节" : found.length + " 个章节";
    };

    input.addEventListener("input", apply);
    clear.addEventListener("click", () => {
      input.value = "";
      apply();
      input.focus();
    });
    input.addEventListener("focus", () => {
      if (input.value.trim() !== "") apply();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (!results.hidden) {
          hideResults();
          return;
        }
        input.value = "";
        apply();
        input.blur();
        return;
      }
      if (results.hidden) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive(activeIndex + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive(activeIndex - 1);
      } else if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        goToChapter(activeIndex);
      }
    });
    box.addEventListener("focusout", (event) => {
      if (!box.contains(event.relatedTarget)) hideResults();
    });
    document.addEventListener("click", (event) => {
      if (!box.contains(event.target)) hideResults();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
      const active = document.activeElement;
      const tag = active && active.tagName ? active.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || (active && active.isContentEditable)) return;
      event.preventDefault();
      input.focus();
    });
  }

  function setupApiSearch() {
    const input = document.querySelector("[data-api-search]");
    const tables = Array.from(document.querySelectorAll("[data-lua-api-container] table"));
    const empty = document.querySelector("[data-api-empty]");
    if (!input || tables.length === 0) return;

    const update = () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;
      for (const table of tables) {
        const heading = table.previousElementSibling;
        const isGroupHeading = heading && heading.classList.contains("api-group-title");
        const headingMatch = isGroupHeading && heading.textContent.toLowerCase().includes(query);
        let groupVisible = 0;
        for (const row of table.querySelectorAll("[data-api-row]")) {
          const haystack = row.textContent.toLowerCase();
          const match = query === "" || headingMatch || haystack.includes(query);
          row.hidden = !match;
          if (match) {
            visible += 1;
            groupVisible += 1;
          }
        }
        table.hidden = groupVisible === 0;
        if (isGroupHeading) heading.hidden = groupVisible === 0;
      }
      if (empty) empty.hidden = visible !== 0;
    };

    input.addEventListener("input", update);
    update();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  // Shared quick-reference tables. The Lua API and Lua event pages use the
  // default field/column set; other reference pages can override them on the
  // container with data-api-fields, data-api-columns and data-api-code-fields.
  const API_TABLE_DEFAULT_FIELDS = ["api", "params", "returns", "note"];
  const API_TABLE_DEFAULT_COLUMNS = ["API", "参数", "返回", "备注"];

  function parseListAttribute(value) {
    if (!value) return [];
    return value.split(",").map((part) => part.trim()).filter((part) => part !== "");
  }

  function renderLuaApiTable() {
    const container = document.querySelector("[data-lua-api-container]");
    if (!container) return;
    const source = container.getAttribute("data-lua-api-source") || "__LUA_API_DATA";
    const data = window[source];
    if (!data) {
      container.innerHTML = '<div class="callout warn">数据 ' + escapeHtml(source) +
        ' 未加载，请确认 HTML 中包含对应的 &lt;script&gt; 标签。</div>';
      return;
    }

    const customFields = parseListAttribute(container.getAttribute("data-api-fields"));
    const fields = customFields.length > 0 ? customFields : API_TABLE_DEFAULT_FIELDS;
    const customColumns = parseListAttribute(container.getAttribute("data-api-columns"));
    const columns = customColumns.length === fields.length ? customColumns : API_TABLE_DEFAULT_COLUMNS;
    const codeFields = parseListAttribute(container.getAttribute("data-api-code-fields"));
    const codeSet = new Set(codeFields.length > 0 ? codeFields : [fields[0]]);

    const fragment = document.createDocumentFragment();
    for (const group of data.groups || []) {
      const h = document.createElement("h3");
      h.className = "api-group-title";
      h.textContent = group.name;
      fragment.appendChild(h);

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");
      for (const column of columns) {
        const th = document.createElement("th");
        th.textContent = column;
        headRow.appendChild(th);
      }
      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      for (const item of group.items || []) {
        const tr = document.createElement("tr");
        tr.className = "api-row";
        tr.setAttribute("data-api-row", "");
        for (const field of fields) {
          const value = item[field] === undefined || item[field] === null ? "" : String(item[field]);
          const td = document.createElement("td");
          if (codeSet.has(field)) td.innerHTML = "<code>" + escapeHtml(value) + "</code>";
          else td.textContent = value;
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      fragment.appendChild(table);
    }

    container.innerHTML = "";
    container.appendChild(fragment);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const activeId = document.body.dataset.page || "index";
    const entry = findEntry(activeId);
    const prefix = prefixForPath(entry ? entry.page.path : "");
    const shell = ensureShell();
    if (chapterList().length === 0) {
      if (window.console && window.console.error) {
        window.console.error("nav.js 未加载或解析失败：window.__WIKI_MANIFEST 为空，侧边栏与章节搜索不可用。");
      }
      const warn = document.createElement("div");
      warn.className = "callout warn";
      warn.textContent = "导航清单 nav.js 未加载或解析失败：侧边栏、面包屑与章节搜索不可用。" +
        "请确认本页在 wiki.js 之前引入了路径正确的 nav.js。";
      shell.content.prepend(warn);
    }
    const topbar = renderTopbar(shell.main, shell.content, entry, prefix);
    document.body.prepend(createSidebar(activeId, prefix));
    renderFooter(shell.content);
    topbar.appendChild(createThemeSwitch());
    setupChapterSearch(topbar, prefix);
    renderLuaApiTable();
    setupApiSearch();
  });
})();
