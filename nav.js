// NewColony Wiki 的导航清单，也是页面清单的唯一真相。
// 渲染器 wiki.js 读取本文件生成侧边栏、面包屑、页脚与章节搜索。
// 本文件不使用 fetch，站点可以直接以本地文件方式打开；页面内不再写 topbar 或 footer。
window.__WIKI_MANIFEST = {
  version: 1,
  site: {
    title: "NewColony Wiki",
    home: "index.html",
    footer: "NewColony Wiki · UTF-8"
  },
  chapters: [
    {
      id: "overview",
      title: "概览",
      pages: [
        { id: "index", title: "总览", path: "index.html" },
        { id: "mod-status", title: "当前能力边界", path: "mod-status.html" },
        { id: "project-completion", title: "系统现状", path: "project-completion.html" }
      ]
    },
    {
      id: "basics",
      title: "MOD 开发基础",
      pages: [
        { id: "mod-guide", title: "MOD 是怎样加载的", path: "mod-guide.html" },
        { id: "mod-quickstart", title: "从头开始", path: "mod-quickstart.html" },
        { id: "mod-manual", title: "开发手册", path: "mod-manual.html" },
        { id: "mod-examples", title: "MOD 示例", path: "mod-examples.html" },
        { id: "mod-directory", title: "MOD 目录结构", path: "mod-directory.html" },
        { id: "mod-manifest", title: "mod.json", path: "mod-manifest.html" },
        { id: "mod-configfiles", title: "配置文件", path: "mod-configfiles.html" },
        { id: "mod-localization", title: "本地化与翻译", path: "mod-localization.html" }
      ],
      groups: [
        {
          id: "data-registry",
          title: "数据文件注册表",
          pages: [
            { id: "mod-data", title: "数据注册总览", path: "mod-data.html" },
            { id: "mod-blockregistry", title: "方块注册", path: "mod-blockregistry.html" },
            { id: "mod-tagregistry", title: "Tag 注册", path: "mod-tagregistry.html" },
            { id: "mod-entityregistry", title: "实体注册", path: "mod-entityregistry.html" },
            { id: "mod-reciperegistry", title: "配方注册", path: "mod-reciperegistry.html" },
            { id: "mod-jobregistry", title: "职业注册", path: "mod-jobregistry.html" },
            { id: "mod-civilizationregistry", title: "文明注册", path: "mod-civilizationregistry.html" },
            { id: "mod-focusregistry", title: "焦点注册", path: "mod-focusregistry.html" },
            { id: "mod-techregistry", title: "科技注册", path: "mod-techregistry.html" },
            { id: "mod-factionregistry", title: "NPC 阵营注册", path: "mod-factionregistry.html" },
            { id: "mod-namepoolregistry", title: "名称池注册", path: "mod-namepoolregistry.html" },
            { id: "mod-featureregistry", title: "地物注册", path: "mod-featureregistry.html" },
            { id: "mod-cropregistry", title: "作物注册", path: "mod-cropregistry.html" },
            { id: "mod-buildingregistry", title: "建筑蓝图注册", path: "mod-buildingregistry.html" },
            { id: "mod-terrainregistry", title: "地形配置注册", path: "mod-terrainregistry.html" },
            { id: "mod-biomeregistry", title: "群系注册", path: "mod-biomeregistry.html" },
            { id: "mod-zoneregistry", title: "区域注册", path: "mod-zoneregistry.html" },
            { id: "mod-raidregistry", title: "袭击注册", path: "mod-raidregistry.html" },
            { id: "mod-audioregistry", title: "音频注册", path: "mod-audioregistry.html" }
          ]
        },
        {
          id: "assets",
          title: "MOD 素材",
          pages: [
            { id: "mod-assets-texture", title: "纹理格式", path: "mod-assets-texture.html" },
            { id: "mod-assets-ui", title: "UI 图片资源", path: "mod-assets-ui.html" },
            { id: "mod-assets-shader", title: "着色器格式", path: "mod-assets-shader.html" },
            { id: "mod-assets-model", title: "模型格式", path: "mod-assets-model.html" },
            { id: "mod-assets-audio", title: "音乐格式", path: "mod-assets-audio.html" }
          ]
        }
      ]
    },
    {
      id: "advanced",
      title: "MOD 开发高级",
      pages: [],
      groups: [
        {
          id: "lua",
          title: "Lua 与注册",
          pages: [
            { id: "mod-lua-api", title: "Lua 怎么用", path: "mod-lua-api.html" },
            { id: "mod-events", title: "Lua 事件系统", path: "mod-events.html" },
            { id: "mod-coderegistry", title: "代码注册总览", path: "mod-coderegistry.html" }
          ]
        },
        {
          id: "ui",
          title: "界面",
          pages: [
            { id: "mod-ui-api", title: "UI 框架", path: "mod-ui-api.html" },
            { id: "mod-ui-theme", title: "UI CSS 主题", path: "mod-ui-theme.html" },
            { id: "ui-rmlui", title: "游戏内 RmlUI", path: "ui-rmlui.html" }
          ]
        },
        {
          id: "network",
          title: "网络与状态",
          pages: [
            { id: "mod-network-sync", title: "网络同步与 Mod 数据", path: "mod-network-sync.html" },
            { id: "mod-state-evolution", title: "状态自动演进与别名", path: "mod-state-evolution.html" }
          ]
        },
        {
          id: "systems",
          title: "专项系统",
          pages: [
            { id: "diplomacy-system", title: "外交提议与指标", path: "diplomacy-system.html" }
          ]
        },
        {
          id: "dev",
          title: "调试与发布",
          pages: [
            { id: "mod-console", title: "控制台命令", path: "mod-console.html" },
            { id: "mod-troubleshooting", title: "常见问题", path: "mod-troubleshooting.html" },
            { id: "mod-roadmap", title: "路线图", path: "mod-roadmap.html" },
            { id: "mod-spec", title: "发布约定", path: "mod-spec.html" }
          ]
        }
      ]
    },
    {
      id: "coremod",
      title: "核心实现",
      pages: [
        { id: "city-simulation", title: "城邦模拟现状", path: "city-simulation.html" }
      ]
    },
    {
      id: "appendix",
      title: "附录",
      pages: [
        { id: "mod-lua-api-reference", title: "Lua API 速查", path: "mod-lua-api-reference.html" },
        { id: "mod-lua-events-reference", title: "Lua 事件 速查", path: "mod-lua-events-reference.html" },
        { id: "mod-console-reference", title: "控制台命令速查", path: "mod-console-reference.html" }
      ],
      groups: [
        {
          id: "engine",
          title: "引擎参考",
          pages: [
            { id: "engine-terraingeneration", title: "地形生成流程", path: "engine-terraingeneration.html" },
            { id: "engine-combat", title: "战斗系统现状", path: "engine-combat.html" },
            { id: "engine-lighting", title: "引擎光照", path: "engine-lighting.html" },
            { id: "engine-save-system", title: "存档系统现状", path: "engine-save-system.html" },
            { id: "engine-resource-io", title: "资源 IO / UTF-8 路径", path: "engine-resource-io.html" },
            { id: "engine-service-layer", title: "引擎服务层", path: "engine-service-layer.html" },
            { id: "engine-renderer-lod", title: "地形 LOD 渲染", path: "engine-renderer-lod.html" },
            { id: "building-design-system", title: "建筑设计系统", path: "building-design-system.html" },
            { id: "item-storage-visuals", title: "物品存储与搬运表现", path: "item-storage-visuals.html" }
          ]
        }
      ]
    }
  ]
};
