// NewColony Wiki 主题引导脚本。
// 必须在 <head> 中、样式表之前同步执行，避免刷新时先绘制旧主题。
// 三档模式：light（日间）/ dark（夜间）/ auto（跟随系统）。
// 选择记在 localStorage；不可用时降级为本次会话内生效，不抛出错误。
// 本文件不使用 fetch / XHR，站点可以直接以本地文件方式打开。

(function () {
  "use strict";

  var STORAGE_KEY = "nc-wiki-theme";
  var MODES = ["light", "dark", "auto"];
  var root = document.documentElement;
  var media = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;
  var memoryMode = "auto";

  function normalize(mode) {
    return MODES.indexOf(mode) >= 0 ? mode : "auto";
  }

  function readMode() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null && stored !== undefined) {
        return normalize(stored);
      }
    } catch (error) {
      // localStorage 在部分本地文件环境会被禁用，使用内存值。
    }
    return memoryMode;
  }

  function resolve(mode) {
    if (mode === "light" || mode === "dark") return mode;
    return media && media.matches ? "dark" : "light";
  }

  function apply(mode) {
    var normalized = normalize(mode);
    root.setAttribute("data-theme", resolve(normalized));
    root.setAttribute("data-theme-mode", normalized);
  }

  window.__WIKI_THEME = {
    modes: MODES.slice(),
    get: readMode,
    resolved: function () {
      return resolve(readMode());
    },
    set: function (mode) {
      var normalized = normalize(mode);
      memoryMode = normalized;
      try {
        window.localStorage.setItem(STORAGE_KEY, normalized);
      } catch (error) {
        // 写入失败时仍然立即生效，只是下次打开不保留。
      }
      apply(normalized);
      window.dispatchEvent(new CustomEvent("wiki-theme-change", {
        detail: { mode: normalized, theme: resolve(normalized) }
      }));
    }
  };

  apply(readMode());

  if (media) {
    var onSystemChange = function () {
      if (readMode() === "auto") apply("auto");
    };
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onSystemChange);
    } else if (typeof media.addListener === "function") {
      media.addListener(onSystemChange);
    }
  }
})();
