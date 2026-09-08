(() => {
  const zoomKey = "codex-markdown-preview.zoom";
  let zoom = 100;
  try 
  {
    const savedZoom = Number(localStorage.getItem(zoomKey));
    if (savedZoom >= 50 && savedZoom <= 200) 
    {
      zoom = savedZoom;
    }
  } 
  catch 
  {
    // Storage may be unavailable in restricted previews
  }

  function setZoom(value) 
  {
    zoom = Math.max(50, Math.min(200, value));
    document.body.style.zoom = String(zoom / 100);
    const toolbar = document.getElementById("codex-preview-zoom");
    toolbar.style.zoom = String(100 / zoom);
    toolbar.querySelector("[data-reset]").textContent = zoom + "%";
    toolbar.querySelector("[data-out]").disabled = zoom === 50;
    toolbar.querySelector("[data-in]").disabled = zoom === 200;
    try 
    {
      localStorage.setItem(zoomKey, String(zoom));
    } 
    catch 
    {
      // Zoom still works without persistent storage
    }
  }

  function addZoomControls() 
  {
    if (!document.body || document.getElementById("codex-preview-zoom")) 
    {
      return;
    }

    const toolbar = document.createElement("div");
    toolbar.id = "codex-preview-zoom";
    toolbar.setAttribute("role", "group");
    toolbar.setAttribute("aria-label", "Markdown zoom");

    for (const [action, label, title, change] of [
      ["out", "\u2212", "Zoom out", () => setZoom(zoom - 10)],
      ["reset", "", "Reset zoom to 100%", () => setZoom(100)],
      ["in", "+", "Zoom in", () => setZoom(zoom + 10)],
    ])
    {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset[action] = "";
      button.textContent = label;
      button.title = title;
      button.setAttribute("aria-label", title);
      button.addEventListener("click", change);
      toolbar.append(button);
    }

    document.body.append(toolbar);
    setZoom(zoom);
  }

  window.addEventListener(
    "wheel",
    (event) => {
      if (!event.ctrlKey || event.deltaY === 0) {
        return;
      }
      event.preventDefault();
      setZoom(zoom + (event.deltaY < 0 ? 10 : -10));
    },
    { passive: false },
  );

  function decorateCodeBlocks() 
  {
    addZoomControls();
    for (const code of document.querySelectorAll("pre > code")) 
    {
      const pre = code.parentElement;
      if (pre.querySelector(".codex-preview-header")) 
        continue;

      const language = Array.from(code.classList).find((name) => name.startsWith("language-"),);
      const header = document.createElement("div");
      header.className = "codex-preview-header";
      const label = document.createElement("span");
      label.textContent = "</>   " + (language ? language.slice(9) : "text");
      header.append(label);
      pre.prepend(header);
    }
  }

  if (document.readyState === "loading") 
  {
    document.addEventListener("DOMContentLoaded", decorateCodeBlocks);
  } 
  else 
  {
    decorateCodeBlocks();
  }

  new MutationObserver(decorateCodeBlocks).observe(document.documentElement, { childList: true, subtree: true, });
  window.addEventListener("vscode.markdown.updateContent", decorateCodeBlocks);

})();
