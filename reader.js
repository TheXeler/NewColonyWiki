// NewColony Wiki 阅读器。
// 单一 reader.html 承载全部正文；正文来自 content/<route>.js，按需用 <script> 注入加载。
// 不使用 fetch / XHR，双击 file:// 打开即可运行。
// 路由：#/basics/registry/block 对应契约中的 basics/registry/block.html。

(function () {
  "use strict";

  var MANIFEST = window.__WIKI_MANIFEST || { chapters: [] };
  var SITE = MANIFEST.site || {};
  var HOME_ROUTE = "index";
  var FOOTER_TEXT = SITE.footer || "NewColony Wiki · UTF-8";
  var loaded = Object.create(null);
  var currentEntry = null;

  function chapterList() {
    return Array.isArray(MANIFEST.chapters) ? MANIFEST.chapters : [];
  }

  function flatten() {
    var out = [];
    chapterList().forEach(function (chapter) {
      (chapter.pages || []).forEach(function (page) {
        out.push({ page: page, chapter: chapter, group: null });
      });
      (chapter.groups || []).forEach(function (group) {
        (group.pages || []).forEach(function (page) {
          out.push({ page: page, chapter: chapter, group: group });
        });
      });
    });
    return out;
  }

  function routeOf(page) {
    return String(page.path || "").replace(/\.html$/, "");
  }

  function contentPathOf(route) {
    return "content/" + route + ".js";
  }

  function findByRoute(route) {
    var all = flatten();
    for (var i = 0; i < all.length; i++) {
      if (routeOf(all[i].page) === route) return all[i];
    }
    return null;
  }

  function currentRoute() {
    var hash = String(window.location.hash || "");
    if (hash.indexOf("#/") === 0) return decodeURIComponent(hash.slice(2));
    return "";
  }

  /* ---------- 侧边栏 ---------- */

  function renderSidebar(activeId) {
    var aside = document.createElement("aside");
    aside.className = "sidebar";

    var logo = document.createElement("a");
    logo.className = "sidebar-logo";
    logo.href = "#/" + HOME_ROUTE;
    logo.innerHTML = '<div class="logo-icon">NC</div>';
    var logoText = document.createElement("span");
    logoText.textContent = SITE.title || "NewColony Wiki";
    logo.appendChild(logoText);
    aside.appendChild(logo);

    function addLink(container, page, state) {
      var a = document.createElement("a");
      a.href = "#/" + routeOf(page);
      a.textContent = page.title;
      if (page.id === activeId) {
        a.className = "active";
        a.setAttribute("aria-current", "page");
        state.value = true;
      }
      container.appendChild(a);
    }

    chapterList().forEach(function (chapter) {
      var nav = document.createElement("nav");
      nav.className = "nav-section";

      var title = document.createElement("div");
      title.className = "nav-section-title";
      title.textContent = chapter.title;
      title.addEventListener("click", function () { nav.classList.toggle("collapsed"); });
      nav.appendChild(title);

      var chapterState = { value: false };
      (chapter.pages || []).forEach(function (page) { addLink(nav, page, chapterState); });

      (chapter.groups || []).forEach(function (group) {
        var sub = document.createElement("div");
        sub.className = "nav-sub-group";

        var subTitle = document.createElement("div");
        subTitle.className = "nav-sub-title";
        subTitle.textContent = group.title;
        subTitle.addEventListener("click", function () { sub.classList.toggle("collapsed"); });
        sub.appendChild(subTitle);

        var groupState = { value: false };
        (group.pages || []).forEach(function (page) { addLink(sub, page, groupState); });
        if (!groupState.value) sub.classList.add("collapsed");
        if (groupState.value) chapterState.value = true;

        nav.appendChild(sub);
      });

      if (!chapterState.value) nav.classList.add("collapsed");
      aside.appendChild(nav);
    });

    var old = document.querySelector(".sidebar");
    if (old) old.remove();
    document.body.insertBefore(aside, document.body.firstChild);
    return aside;
  }

  /* ---------- 主题滑块 ---------- */

  function createThemeSwitch() {
    var OPTIONS = [
      { mode: "light", icon: "\u2600", label: "日间" },
      { mode: "auto", icon: "\u25D0", label: "跟随系统" },
      { mode: "dark", icon: "\u263E", label: "夜间" }
    ];
    var THEME = window.__WIKI_THEME;
    var OPTION_W = 30;

    var group = document.createElement("div");
    group.className = "theme-switch";
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", "主题");

    var thumb = document.createElement("span");
    thumb.className = "theme-switch-thumb";
    group.appendChild(thumb);

    var buttons = [];
    function sync(mode) {
      var index = 0;
      OPTIONS.forEach(function (option, i) { if (option.mode === mode) index = i; });
      thumb.style.transform = "translateX(" + index * OPTION_W + "px)";
      buttons.forEach(function (button, i) {
        button.setAttribute("aria-checked", i === index ? "true" : "false");
        button.tabIndex = i === index ? 0 : -1;
      });
    }

    OPTIONS.forEach(function (option) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "theme-switch-option";
      button.setAttribute("role", "radio");
      button.title = option.label;
      button.setAttribute("aria-label", option.label);
      button.textContent = option.icon;
      button.addEventListener("click", function () {
        if (THEME && typeof THEME.set === "function") THEME.set(option.mode);
        sync(option.mode);
      });
      buttons.push(button);
      group.appendChild(button);
    });

    sync(THEME && typeof THEME.get === "function" ? THEME.get() : "auto");
    window.addEventListener("wiki-theme-change", function (event) {
      if (event && event.detail) sync(event.detail.mode);
    });
    return group;
  }

  /* ---------- 章节搜索 ---------- */

  function createSearch() {
    var box = document.createElement("div");
    box.className = "section-search";

    var input = document.createElement("input");
    input.type = "search";
    input.placeholder = "搜索章节...";
    input.setAttribute("aria-label", "搜索章节");
    input.autocomplete = "off";

    var results = document.createElement("div");
    results.className = "section-search-results";
    results.hidden = true;

    box.appendChild(input);
    box.appendChild(results);

    var entries = flatten();
    var activeIndex = -1;

    function close() { results.hidden = true; activeIndex = -1; results.innerHTML = ""; }

    function render(matches) {
      results.innerHTML = "";
      matches.forEach(function (entry) {
        var item = document.createElement("a");
        item.className = "section-search-result";
        item.href = "#/" + routeOf(entry.page);
        item.setAttribute("role", "option");
        var label = document.createElement("span");
        label.className = "section-search-result-label";
        label.textContent = entry.page.title;
        var context = document.createElement("span");
        context.className = "section-search-result-context";
        context.textContent = entry.group ? entry.group.title + " / " + entry.chapter.title : entry.chapter.title;
        item.appendChild(label);
        item.appendChild(context);
        item.addEventListener("click", close);
        results.appendChild(item);
      });
      results.hidden = matches.length === 0;
      activeIndex = -1;
    }

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      if (query === "") { close(); return; }
      render(entries.filter(function (entry) {
        return String(entry.page.title).toLowerCase().indexOf(query) >= 0;
      }));
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { input.value = ""; close(); input.blur(); return; }
      var items = Array.prototype.slice.call(results.querySelectorAll(".section-search-result"));
      if (items.length === 0) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        activeIndex = event.key === "ArrowDown"
          ? (activeIndex + 1) % items.length
          : (activeIndex - 1 + items.length) % items.length;
        items.forEach(function (item, i) { item.classList.toggle("active", i === activeIndex); });
      } else if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        window.location.hash = items[activeIndex].getAttribute("href");
        input.value = "";
        close();
      }
    });
    box.addEventListener("focusout", function (event) {
      if (!box.contains(event.relatedTarget)) close();
    });
    return box;
  }

  /* ---------- 顶栏 ---------- */

  function renderTopbar(entry) {
    var main = document.querySelector(".main");
    var content = document.querySelector(".content");
    var topbar = main.querySelector(":scope > .topbar");
    if (!topbar) {
      topbar = document.createElement("div");
      topbar.className = "topbar";
      var inner = document.createElement("div");
      inner.className = "topbar-inner";
      topbar.appendChild(inner);
      main.insertBefore(topbar, content);
    }
    var bar = topbar.querySelector(".topbar-inner");
    bar.textContent = "";

    var crumb = document.createElement("div");
    crumb.className = "breadcrumb";
    var home = document.createElement("a");
    home.href = "#/" + HOME_ROUTE;
    home.textContent = "Wiki";
    crumb.appendChild(home);

    if (entry) {
      [entry.chapter.title, entry.group ? entry.group.title : null, entry.page.title]
        .filter(Boolean)
        .forEach(function (text) {
          var sep = document.createElement("span");
          sep.className = "sep";
          sep.textContent = "/";
          crumb.appendChild(sep);
          crumb.appendChild(document.createTextNode(text));
        });
    }

    bar.appendChild(crumb);
    bar.appendChild(createThemeSwitch());
    bar.appendChild(createSearch());
    return bar;
  }

  function renderFooter(content) {
    Array.prototype.slice.call(content.querySelectorAll(".footer")).forEach(function (node) { node.remove(); });
    var footer = document.createElement("div");
    footer.className = "footer";
    footer.textContent = FOOTER_TEXT;
    content.appendChild(footer);
  }

  /* ---------- 正文 ---------- */

  function placeholder(entry) {
    var legacy = entry ? entry.page.path : "";
    return [
      '<h2>本页尚未迁移</h2>',
      '<p>阅读器已就绪，但这一页的正文还在旧的 HTML 文件里。</p>',
      '<p><a href="' + legacy + '">打开旧页面 ' + legacy + '</a></p>'
    ].join("\n");
  }

  function renderPage(entry) {
    var content = document.querySelector(".content");
    if (!entry) {
      content.innerHTML = '<h1>页面不存在</h1><p class="subtitle">这个地址没有对应的文档。</p>' +
        '<p><a href="#/' + HOME_ROUTE + '">回到总览</a></p>';
      renderFooter(content);
      return;
    }

    var id = entry.page.id;
    var route = routeOf(entry.page);
    document.title = entry.page.title + " · NewColony Wiki";

    function paint(lines) {
      var meta = {};
      var body = lines.slice();
      while (body.length > 0) {
        var directive = /^@([a-z]+):\s*(.*)$/.exec(body[0]);
        if (!directive) break;
        meta[directive[1]] = directive[2];
        body = body.slice(1);
      }
      var escape = window.__WIKI_MD ? window.__WIKI_MD.escapeHtml : function (s) { return s; };
      var html = "<h1>" + escape(entry.page.title) + "</h1>";
      if (meta.path) html += '<p class="reg-path"><code>' + escape(meta.path) + "</code></p>";
      if (meta.subtitle) {
        html += '<p class="subtitle">' +
          window.__WIKI_MD.render([meta.subtitle]).replace(/^<p>|<\/p>$/g, "") + "</p>";
      }
      html += window.__WIKI_MD.render(body);
      content.innerHTML = html;
      renderFooter(content);
      window.scrollTo(0, 0);
    }

    if (window.__WIKI_PAGES && window.__WIKI_PAGES[id]) { paint(window.__WIKI_PAGES[id]); return; }
    if (loaded[route]) { content.innerHTML = placeholder(entry); renderFooter(content); return; }

    var script = document.createElement("script");
    script.src = contentPathOf(route);
    script.onload = function () {
      loaded[route] = true;
      if (window.__WIKI_PAGES && window.__WIKI_PAGES[id]) paint(window.__WIKI_PAGES[id]);
      else { content.innerHTML = placeholder(entry); renderFooter(content); }
    };
    script.onerror = function () {
      loaded[route] = true;
      content.innerHTML = placeholder(entry);
      renderFooter(content);
    };
    document.head.appendChild(script);
  }

  /* ---------- 路由 ---------- */

  function navigate() {
    var route = currentRoute() || HOME_ROUTE;
    var entry = findByRoute(route);
    currentEntry = entry;
    renderSidebar(entry ? entry.page.id : null);
    renderTopbar(entry);
    renderPage(entry);
  }

  window.addEventListener("hashchange", navigate);
  window.addEventListener("DOMContentLoaded", navigate);
})();
