/ NewColony Wiki 的导航清单，也是页面清单的唯一真相。
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
        { id: "mod-status", title: "当前能力边界", path: "overview/status.html" },
        { id: "project-completion", title: "系统现状", path: "overview/boundary.html" }
      ]
    },
    {
      id: "basics",
      title: "MOD 开发基础",
      pages: [
        { id: "mod-guide", title: "MOD 是怎样加载的", path: "basics/guide.html" },
        { id: "mod-quickstart", title: "从头开始", path: "basics/quickstart.html" },
        { id: "mod-manual", title: "开发手册", path: "basics/manual.html" },
        { id: "mod-examples", title: "MOD 示例", path: "basics/examples.html" },
        { id: "mod-directory", title: "MOD 目录结构", path: "basics/directory.html" },
        { id: "mod-manifest", title: "mod.json", path: "basics/manifest.html" },
        { id: "mod-configfiles", title: "配置文件", path: "basics/configfiles.html" },
        { id: "mod-localization", title: "本地化与翻译", path: "basics/localization.html" }
      ],
      groups: [
        {
          id: "data-registry",
          title: "数据文件注册表",
          pages: [
            { id: "mod-data", title: "数据注册总览", path: "basics/data.html" },
            { id: "mod-blockregistry", title: "方块注册", path: "basics/registry/block.html" },
            { id: "mod-tagregistry", title: "Tag 注册", path: "basics/registry/tag.html" },
            { id: "mod-entityregistry", title: "实体注册", path: "basics/registry/entity.html" },
            { id: "mod-reciperegistry", title: "配方注册", path: "basics/registry/recipe.html" },
            { id: "mod-jobregistry", title: "职业注册", path: "basics/registry/job.html" },
            { id: "mod-civilizationregistry", title: "文明注册", path: "basics/registry/civilization.html" },
            { id: "mod-focusregistry", title: "焦点注册", path: "basics/registry/focus.html" },
            { id: "mod-techregistry", title: "科技注册", path: "basics/registry/tech.html" },
            { id: "mod-factionregistry", title: "NPC 阵营注册", path: "basics/registry/faction.html" },
            { id: "mod-namepoolregistry", title: "名称池注册", path: "basics/registry/namepool.html" },
            { id: "mod-featureregistry", title: "地物注册", path: "basics/registry/feature.html" },
            { id: "mod-cropregistry", title: "作物注册", path: "basics/registry/crop.html" },
            { id: "mod-buildingregistry", title: "建筑蓝图注册", path: "basics/registry/building.html" },
            { id: "mod-terrainregistry", title: "地形配置注册", path: "basics/registry/terrain.html" },
            { id: "mod-biomeregistry", title: "群系注册", path: "basics/registry/biome.html" },
            { id: "mod-zoneregistry", title: "区域注册", path: "basics/registry/zone.html" },
            { id: "mod-raidregistry", title: "袭击注册", path: "basics/registry/raid.html" },
            { id: "mod-audioregistry", title: "音频注册", path: "basics/registry/audio.html" }
          ]
        },
        {
          id: "assets",
          title: "MOD 素材",
          pages: [
            { id: "mod-assets-texture", title: "纹理格式", path: "basics/assets/texture.html" },
            { id: "mod-assets-ui", title: "UI 图片资源", path: "basics/assets/ui.html" },
            { id: "mod-assets-shader", title: "着色器格式", path: "basics/assets/shader.html" },
            { id: "mod-assets-model", title: "模型格式", path: "basics/assets/model.html" },
            { id: "mod-assets-audio", title: "音乐格式", path: "basics/assets/audio.html" }
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
            { id: "mod-lua-api", title: "Lua 怎么用", path: "advanced/lua/guide.html" },
            { id: "mod-events", title: "Lua 事件系统", path: "advanced/lua/events.html" },
            { id: "mod-coderegistry", title: "代码注册总览", path: "advanced/lua/coderegistry.html" }
          ]
        },
        {
          id: "ui",
          title: "界面",
          pages: [
            { id: "mod-ui-api", title: "UI 框架", path: "advanced/ui/api.html" },
            { id: "mod-ui-theme", title: "UI CSS 主题", path: "advanced/ui/theme.html" },
            { id: "ui-rmlui", title: "游戏内 RmlUI", path: "advanced/ui/rmlui.html" }
          ]
        },
        {
          id: "network",
          title: "网络与状态",
          pages: [
            { id: "mod-network-sync", title: "网络同步与 Mod 数据", path: "advanced/network/sync.html" },
            { id: "mod-state-evolution", title: "状态自动演进与别名", path: "advanced/network/state-evolution.html" }
          ]
        },
        {
          id: "systems",
          title: "专项系统",
          pages: [
            { id: "diplomacy-system", title: "外交提议与指标", path: "advanced/systems/diplomacy.html" }
          ]
        },
        {
          id: "dev",
          title: "调试与发布",
          pages: [
            { id: "mod-console", title: "控制台命令", path: "advanced/dev/console.html" },
            { id: "mod-troubleshooting", title: "常见问题", path: "advanced/dev/troubleshooting.html" },
            { id: "mod-roadmap", title: "路线图", path: "advanced/dev/roadmap.html" },
            { id: "mod-spec", title: "发布约定", path: "advanced/dev/release.html" }
          ]
        }
      ]
    },
    {
      id: "coremod",
      title: "核心实现",
      pages: [
        { id: "city-simulation", title: "城邦模拟现状", path: "coremod/city.html" }
      ]
    },
    {
      id: "appendix",
      title: "附录",
      pages: [
        { id: "mod-lua-api-reference", title: "Lua API 速查", path: "appendix/api-reference.html" },
        { id: "mod-lua-events-reference", title: "Lua 事件 速查", path: "appendix/events-reference.html" },
        { id: "mod-console-reference", title: "控制台命令速查", path: "appendix/console-reference.html" }
      ],
      groups: [
        {
          id: "engine",
          title: "引擎参考",
          pages: [
            { id: "engine-terraingeneration", title: "地形生成流程", path: "appendix/engine/terrain-generation.html" },
            { id: "engine-combat", title: "战斗系统现状", path: "appendix/engine/combat.html" },
            { id: "engine-lighting", title: "引擎光照", path: "appendix/engine/lighting.html" },
            { id: "engine-save-system", title: "存档系统现状", path: "appendix/engine/save-system.html" },
            { id: "engine-resource-io", title: "资源 IO / UTF-8 路径", path: "appendix/engine/resource-io.html" },
            { id: "engine-service-layer", title: "引擎服务层", path: "appendix/engine/service-layer.html" },
            { id: "engine-renderer-lod", title: "地形 LOD 渲染", path: "appendix/engine/renderer-lod.html" },
            { id: "building-design-system", title: "建筑设计系统", path: "appendix/engine/building-design.html" },
            { id: "item-storage-visuals", title: "物品存储与搬运表现", path: "appendix/engine/item-storage.html" }
          ]
        }
      ]
    }
  ]
};
