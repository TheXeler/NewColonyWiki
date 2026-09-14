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
      ["mod-manual", "开发手册", "mod-manual.html"],
      ["mod-examples", "MOD 示例", "mod-examples.html"],
      ["mod-directory", "MOD 目录结构", "mod-directory.html"],
      ["mod-manifest", "mod.json", "mod-manifest.html"],
      ["mod-data", "注册物品、方块和规则", "mod-data.html"],
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
          ["mod-tagregistry", "Tag 注册", "mod-tagregistry.html"],
          ["mod-entityregistry", "实体注册", "mod-entityregistry.html"],
          ["mod-reciperegistry", "配方注册", "mod-reciperegistry.html"],
          ["mod-jobregistry", "职业注册", "mod-jobregistry.html"],
          ["mod-civilizationregistry", "文明注册", "mod-civilizationregistry.html"],
          ["mod-focusregistry", "焦点注册", "mod-focusregistry.html"],
          ["mod-factionregistry", "NPC 阵营注册", "mod-factionregistry.html"],
          ["mod-namepoolregistry", "名称池注册", "mod-namepoolregistry.html"],
          ["mod-featureregistry", "地物注册", "mod-featureregistry.html"],
          ["mod-cropregistry", "作物注册", "mod-cropregistry.html"],
          ["mod-buildingregistry", "建筑蓝图注册", "mod-buildingregistry.html"],
          ["mod-terrainregistry", "地形配置注册", "mod-terrainregistry.html"],
          ["mod-biomeregistry", "群系注册", "mod-biomeregistry.html"],
          ["mod-zoneregistry", "区域注册", "mod-zoneregistry.html"],
          ["mod-audioregistry", "音频注册", "mod-audioregistry.html"]
        ]
      },
      {
        title: "引擎参考",
        children: [
          ["engine-terraingeneration", "地形生成流程", "engine-terraingeneration.html"],
          ["engine-combat", "战斗规则与法力", "engine-combat.html"],
          ["engine-lighting", "引擎光照", "engine-lighting.html"],
          ["engine-save-system", "存档系统状态", "engine-save-system.html"],
          ["engine-resource-io", "资源 IO / UTF-8 路径", "engine-resource-io.html"],
          ["engine-service-layer", "引擎服务层", "engine-service-layer.html"]
        ]
      }
    ]
  },
  {
    title: "Lua 脚本",
    links: [
      ["mod-lua-api-reference", "Lua API 速查", "mod-lua-api-reference.html"],
      ["mod-lua-api", "Lua 怎么用", "mod-lua-api.html"],
      ["mod-events", "Lua 事件系统", "mod-events.html"],
      ["mod-lua-data-components", "数据组件 API", "mod-lua-data-components.html"],
      ["mod-ui-api", "UI 框架", "mod-ui-api.html"],
      ["ui-rmlui", "游戏内 RmlUI", "ui-rmlui.html"],
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

function renderLuaApiTable() {
  const container = document.querySelector("[data-lua-api-container]");
  if (!container) return;
  const data = window.__LUA_API_DATA;
  if (!data) {
    container.innerHTML = '<div class="callout warn">lua-api-data.js 未加载，请确认 HTML 中包含对应的 &lt;script&gt; 标签。</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const group of data.groups || []) {
    const h = document.createElement("h3");
    h.className = "api-group-title";
    h.textContent = group.name;
    fragment.appendChild(h);

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML = "<tr><th>API</th><th>参数</th><th>返回</th><th>备注</th></tr>";
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (const item of group.items || []) {
      const tr = document.createElement("tr");
      tr.className = "api-row";
      tr.setAttribute("data-api-row", "");
      const tdApi = document.createElement("td");
      tdApi.innerHTML = "<code>" + escapeHtml(item.api) + "</code>";
      const tdParams = document.createElement("td");
      tdParams.textContent = item.params;
      const tdReturns = document.createElement("td");
      tdReturns.textContent = item.returns;
      const tdNote = document.createElement("td");
      tdNote.innerHTML = escapeHtml(item.note);
      tr.appendChild(tdApi);
      tr.appendChild(tdParams);
      tr.appendChild(tdReturns);
      tr.appendChild(tdNote);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    fragment.appendChild(table);
  }

  container.innerHTML = "";
  container.appendChild(fragment);
}

document.addEventListener("DOMContentLoaded", () => {
  const activePage = document.body.dataset.page || "index";
  document.body.prepend(createSidebar(activePage));
  renderLuaApiTable();
  setupApiSearch();
});

