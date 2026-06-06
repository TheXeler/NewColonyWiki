const WIKI_NAV = [
  {
    title: "理解概念",
    links: [
      ["index", "总览", "index.html"],
      ["mod-guide", "MOD 是怎样加载的", "mod-guide.html"],
      ["mod-status", "当前能力边界", "mod-status.html"]
    ]
  },
  {
    title: "MOD开发基础",
    links: [
      ["mod-quickstart", "从一个 MOD 开始", "mod-quickstart.html"],
      ["mod-directory", "MOD 目录结构", "mod-directory.html"],
      ["mod-manifest", "mod.json", "mod-manifest.html"],
      ["mod-blockregistry", "方块注册", "mod-blockregistry.html"],
      ["mod-professionregistry", "职业注册", "mod-professionregistry.html"],
      ["mod-focusregistry", "焦点注册", "mod-focusregistry.html"],
      ["mod-civilizationregistry", "文明注册", "mod-civilizationregistry.html"]
    ]
  },
  {
    title: "Lua 脚本",
    links: [
      ["mod-lua-api", "Lua 怎么用", "mod-lua-api.html"],
      ["mod-lua-api-reference", "Lua API 速查", "mod-lua-api-reference.html"],
      ["mod-ui-api", "UI 框架", "mod-ui-api.html"],
      ["mod-ui-theme", "UI CSS 主题", "mod-ui-theme.html"],
      ["mod-network-sync", "网络同步与 Mod 数据", "mod-network-sync.html"]
    ]
  },
  {
    title: "调试和发布",
    links: [
      ["mod-console", "控制台命令", "mod-console.html"],
      ["mod-troubleshooting", "常见问题", "mod-troubleshooting.html"],
      ["mod-roadmap", "路线图", "mod-roadmap.html"],
      ["mod-spec", "发布约定", "mod-spec.html"]
    ]
  }
];

function createSidebar(activePage) {
  const sidebar = document.createElement("aside");
  sidebar.className = "sidebar";
  sidebar.innerHTML = `
    <a href="index.html" class="sidebar-logo">
      <div class="logo-icon">NC</div>
      <span>NewColony Wiki</span>
    </a>
  `;

  for (const group of WIKI_NAV) {
    const nav = document.createElement("nav");
    nav.className = "nav-section";
    const title = document.createElement("div");
    title.className = "nav-section-title";
    title.textContent = group.title;

    // 折叠/展开：点击标题切换 collapsed 类
    title.addEventListener("click", () => {
      nav.classList.toggle("collapsed");
    });

    nav.appendChild(title);

    let hasActive = false;
    for (const [page, label, href] of group.links) {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      if (page === activePage) {
        a.className = "active";
        a.setAttribute("aria-current", "page");
        hasActive = true;
      }
      nav.appendChild(a);
    }

    // 默认折叠非活跃分组
    if (!hasActive) {
      nav.classList.add("collapsed");
    }

    sidebar.appendChild(nav);
  }
  return sidebar;
}

function setupApiSearch() {
  const input = document.querySelector("[data-api-search]");
  const rows = Array.from(document.querySelectorAll("[data-api-row]"));
  const empty = document.querySelector("[data-api-empty]");
  if (!input || rows.length === 0) return;

  const update = () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    for (const row of rows) {
      const haystack = row.textContent.toLowerCase();
      const match = query === "" || haystack.includes(query);
      row.hidden = !match;
      if (match) visible += 1;
    }
    if (empty) empty.hidden = visible !== 0;
  };

  input.addEventListener("input", update);
  update();
}

document.addEventListener("DOMContentLoaded", () => {
  const activePage = document.body.dataset.page || "index";
  document.body.prepend(createSidebar(activePage));
  setupApiSearch();
});
