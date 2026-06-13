const WIKI_NAV = [
  {
    title: "理解概念",
    links: [
      ["index", "总览", "index.html"],
      ["project-completion", "项目完成度审计", "project-completion.html"],
      ["mod-guide", "MOD 是怎样加载的", "mod-guide.html"],
      ["mod-status", "当前能力边界", "mod-status.html"]
    ]
  },
  {
    title: "Mod 开发基础",
    links: [
      ["mod-quickstart", "从头开始", "mod-quickstart.html"],
      ["mod-directory", "MOD 目录结构", "mod-directory.html"],
      ["mod-manifest", "mod.json", "mod-manifest.html"],
      ["mod-configfiles", "配置文件", "mod-configfiles.html"],
      ["mod-localization", "本地化与翻译", "mod-localization.html"],
      {
        title: "MOD素材",
        children: [
          ["mod-assets-texture", "纹理格式", "mod-assets-texture.html"],
          ["mod-assets-ui", "UI 图片资源", "mod-assets-ui.html"],
          ["mod-assets-shader", "着色器格式", "mod-assets-shader.html"],
          ["mod-assets-model", "模型格式", "mod-assets-model.html"],
          ["mod-assets-audio", "音乐格式", "mod-assets-audio.html"]
        ]
      },
      {
        title: "注册表",
        children: [
          ["mod-blockregistry", "方块注册", "mod-blockregistry.html"],
          ["mod-biomeregistry", "群系注册", "mod-biomeregistry.html"],
          ["mod-featureregistry", "地物注册", "mod-featureregistry.html"],
          ["mod-entityregistry", "实体注册", "mod-entityregistry.html"],
          ["mod-actionregistry", "动作注册", "mod-actionregistry.html"],
          ["mod-namepoolregistry", "名称池注册", "mod-namepoolregistry.html"],
          ["mod-reciperegistry", "配方注册", "mod-reciperegistry.html"],
          ["mod-cropregistry", "作物注册", "mod-cropregistry.html"],
          ["mod-buildingregistry", "建筑蓝图注册", "mod-buildingregistry.html"],
          ["mod-zoneregistry", "区域注册", "mod-zoneregistry.html"],
          ["mod-professionregistry", "职业注册", "mod-professionregistry.html"],
          ["mod-focusregistry", "焦点注册", "mod-focusregistry.html"],
          ["mod-civilizationregistry", "文明注册", "mod-civilizationregistry.html"]
        ]
      },
      {
        title: "引擎参考",
        children: [
          ["engine-terraingeneration", "地形生成流程", "engine-terraingeneration.html"],
          ["engine-save-system", "存档系统状态", "engine-save-system.html"]
        ]
      }
    ]
  },
  {
    title: "Lua 脚本",
    links: [
      ["mod-lua-api-reference", "Lua API 速查", "mod-lua-api-reference.html"],
      ["mod-lua-api", "Lua 怎么用", "mod-lua-api.html"],
      ["mod-lua-data-components", "数据组件 API", "mod-lua-data-components.html"],
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

  function renderLinks(container, links, hasActiveRef) {
    for (const item of links) {
      if (Array.isArray(item)) {
        const [page, label, href] = item;
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        if (page === activePage) {
          a.className = "active";
          a.setAttribute("aria-current", "page");
          hasActiveRef.value = true;
        }
        container.appendChild(a);
      } else {
        // Nested sub-group
        const sub = document.createElement("div");
        sub.className = "nav-sub-group";
        const subTitle = document.createElement("div");
        subTitle.className = "nav-sub-title";
        subTitle.textContent = item.title;
        subTitle.addEventListener("click", () => {
          sub.classList.toggle("collapsed");
        });
        sub.appendChild(subTitle);

        const subActive = { value: false };
        renderLinks(sub, item.children, subActive);
        if (!subActive.value) {
          sub.classList.add("collapsed");
        }
        if (subActive.value) hasActiveRef.value = true;
        container.appendChild(sub);
      }
    }
  }

  for (const group of WIKI_NAV) {
    const nav = document.createElement("nav");
    nav.className = "nav-section";
    const title = document.createElement("div");
    title.className = "nav-section-title";
    title.textContent = group.title;

    title.addEventListener("click", () => {
      nav.classList.toggle("collapsed");
    });

    nav.appendChild(title);

    const hasActiveRef = { value: false };
    renderLinks(nav, group.links, hasActiveRef);

    if (!hasActiveRef.value) {
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
