/**
 * Vim-style cursor navigation for the web.
 * Block cursor that moves through text content, simulates hover on
 * interactive elements, and activates them with Enter/Space.
 */

const SCROLLOFF = 8;
const G_CHORD_MS = 500;

const REDUCED_MOTION = matchMedia("(prefers-reduced-motion: reduce)").matches;

function caretPosFromPoint(x, y) {
  if (document.caretPositionFromPoint) {
    const p = document.caretPositionFromPoint(x, y);
    return p && p.offsetNode ? { node: p.offsetNode, offset: p.offset } : null;
  }
  if (document.caretRangeFromPoint) {
    const r = document.caretRangeFromPoint(x, y);
    return r ? { node: r.startContainer, offset: r.startOffset } : null;
  }
  return null;
}

class VimCursor {
  constructor() {
    this.textNodes = [];
    this.nodeIndex = new Map();
    this.cursorNodeIndex = 0;
    this.cursorCharIndex = 0;
    this.goalX = null;
    this.active = false;
    this.hoveredElement = null;
    this.cursorEl = null;
    this.pendingGG = false;
    this.gTimeout = null;
    this.resizeTimeout = null;

    this.searchMode = false;
    this.searchQuery = "";
    this.searchMatches = [];
    this.searchMatchIndex = -1;
    this.searchBarEl = null;
    this.searchInputEl = null;

    this.init();
  }

  init() {
    this.createCursorElement();
    this.scanTextNodes();
    this.positionAtHeading();
    this.bindEvents();
  }

  destroy() {
    if (this.cursorEl) {
      this.cursorEl.remove();
      this.cursorEl = null;
    }
    this.clearSearchHighlights();
    this.removeSearchBar();
    this.clearHover();
    document.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("resize", this.onResize);
    clearTimeout(this.gTimeout);
    clearTimeout(this.resizeTimeout);
  }

  createCursorElement() {
    const el = document.createElement("div");
    el.id = "vim-cursor";
    el.classList.add("vim-cursor-blink");
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    this.cursorEl = el;
  }

  /** Collect visible text nodes within <main> in document order. */
  scanTextNodes() {
    this.textNodes = [];
    this.nodeIndex = new Map();
    const main = document.querySelector("main");
    if (!main) return;

    const hiddenCache = new WeakMap();
    const isHidden = (parent) => {
      if (!parent) return true;
      if (hiddenCache.has(parent)) return hiddenCache.get(parent);
      const hidden =
        parent.offsetParent === null ||
        getComputedStyle(parent).visibility === "hidden";
      hiddenCache.set(parent, hidden);
      return hidden;
    };

    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        const inPre = parent?.closest("pre, code");
        if (!inPre && !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        if (isHidden(parent)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node;
    while ((node = walker.nextNode())) {
      this.nodeIndex.set(node, this.textNodes.length);
      this.textNodes.push(node);
    }
  }

  /** Position cursor at the first character of the first heading. */
  positionAtHeading() {
    const main = document.querySelector("main");
    const heading =
      main?.querySelector("h1") ||
      main?.querySelector("h2") ||
      main?.querySelector("p");

    if (heading) {
      for (let i = 0; i < this.textNodes.length; i++) {
        if (heading.contains(this.textNodes[i])) {
          this.cursorNodeIndex = i;
          this.cursorCharIndex = 0;
          this.updatePosition();
          return;
        }
      }
    }
    this.cursorNodeIndex = 0;
    this.cursorCharIndex = 0;
    this.updatePosition();
  }

  bindEvents() {
    this.onKeyDown = this.handleKeyDown.bind(this);
    this.onResize = this.handleResize.bind(this);

    document.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("resize", this.onResize);
  }

  handleKeyDown(e) {
    const key = e.key;

    if (e.altKey || e.ctrlKey || e.metaKey) return;

    if (this.searchMode) {
      this.handleSearchKey(e);
      return;
    }

    const t = e.target;
    if (
      t.tagName === "INPUT" ||
      t.tagName === "TEXTAREA" ||
      t.tagName === "SELECT"
    )
      return;
    if (t.isContentEditable) return;

    // gg chord
    if (key === "g") {
      if (this.pendingGG) {
        clearTimeout(this.gTimeout);
        this.pendingGG = false;
        e.preventDefault();
        this.showCursor();
        this.moveToTop();
        return;
      }
      this.pendingGG = true;
      this.gTimeout = setTimeout(() => {
        this.pendingGG = false;
      }, G_CHORD_MS);
      e.preventDefault();
      return;
    }
    if (this.pendingGG) {
      clearTimeout(this.gTimeout);
      this.pendingGG = false;
    }

    if (key === "Escape") {
      if (this.active) {
        this.hideCursor();
        e.preventDefault();
      }
      return;
    }

    const navKeys = new Set([
      "h",
      "j",
      "k",
      "l",
      "w",
      "e",
      "b",
      "_",
      "$",
      "G",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ]);

    // /, n, N only when the cursor is active — don't hijack on fresh pages
    if ((key === "/" || key === "n" || key === "N") && !this.active) return;

    if (key === "/") {
      e.preventDefault();
      this.enterSearch();
      return;
    }
    if (key === "n") {
      e.preventDefault();
      this.searchNext();
      return;
    }
    if (key === "N") {
      e.preventDefault();
      this.searchPrev();
      return;
    }

    if (navKeys.has(key)) {
      e.preventDefault();
      if (!this.active) this.showCursor();
    } else if (key === " " || key === "Enter") {
      // Only intercept when we actually have something to click
      if (this.active && this.hoveredElement) {
        e.preventDefault();
        this.hoveredElement.click();
      }
      return;
    } else {
      return;
    }

    switch (key) {
      case "h":
      case "ArrowLeft":
        this.moveLeft();
        break;
      case "l":
      case "ArrowRight":
        this.moveRight();
        break;
      case "j":
      case "ArrowDown":
        this.moveDown();
        break;
      case "k":
      case "ArrowUp":
        this.moveUp();
        break;
      case "w":
        this.moveWordForward();
        break;
      case "e":
        this.moveWordEnd();
        break;
      case "b":
        this.moveWordBackward();
        break;
      case "_":
        this.moveToLineStart();
        break;
      case "$":
        this.moveToLineEnd();
        break;
      case "G":
        this.moveToBottom();
        break;
    }
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      if (this.active) this.updatePosition();
    }, 100);
  }

  showCursor() {
    this.active = true;
    if (this.cursorEl) {
      this.cursorEl.style.display = "block";
      this.resetBlink();
    }
  }

  hideCursor() {
    this.active = false;
    if (this.cursorEl) this.cursorEl.style.display = "none";
    this.clearHover();
  }

  /** Restart the blink animation so the cursor is visible right after movement. */
  resetBlink() {
    if (!this.cursorEl || REDUCED_MOTION) return;
    this.cursorEl.classList.remove("vim-cursor-blink");
    // force reflow so the animation restarts from frame 0 on re-add
    void this.cursorEl.offsetWidth;
    this.cursorEl.classList.add("vim-cursor-blink");
  }

  /** True line-box height from the nearest block ancestor's computed CSS. */
  measureLineHeight(node) {
    let el = node?.parentElement;
    while (el && el !== document.body) {
      const cs = getComputedStyle(el);
      if (!cs.display.startsWith("inline")) {
        const lh = parseFloat(cs.lineHeight);
        if (!isNaN(lh) && lh > 0) return lh;
        // "normal" — approximate at 1.2× font-size
        const fs = parseFloat(cs.fontSize);
        if (!isNaN(fs) && fs > 0) return fs * 1.2;
        return 0;
      }
      el = el.parentElement;
    }
    return 0;
  }

  getCursorRect() {
    const node = this.textNodes[this.cursorNodeIndex];
    if (!node) return null;
    const text = node.textContent;
    if (this.cursorCharIndex >= text.length) return null;
    const range = document.createRange();
    range.setStart(node, this.cursorCharIndex);
    range.setEnd(node, this.cursorCharIndex + 1);
    return range.getBoundingClientRect();
  }

  /** Get rect for char (ni, ci). */
  getCharRect(ni, ci) {
    const node = this.textNodes[ni];
    if (!node || ci < 0 || ci >= node.textContent.length) return null;
    const range = document.createRange();
    range.setStart(node, ci);
    range.setEnd(node, ci + 1);
    return range.getBoundingClientRect();
  }

  updatePosition() {
    if (!this.cursorEl) return;
    const rect = this.getCursorRect();
    if (!rect) return;

    let width = rect.width;
    if (!width) {
      const m = document.createElement("span");
      m.textContent = "M";
      m.style.cssText = "position:absolute;visibility:hidden;font:inherit;";
      document.body.appendChild(m);
      width = m.getBoundingClientRect().width || 8;
      m.remove();
    }

    this.cursorEl.style.left = rect.left + window.scrollX + "px";
    this.cursorEl.style.top = rect.top + window.scrollY + "px";
    this.cursorEl.style.width = width + "px";
    this.cursorEl.style.height = rect.height + "px";

    // Keep SCROLLOFF lines of context above/below. Read line-height from the
    // parent's computed CSS — that's the true line-box height. `rect.height`
    // from Range is often just font metrics (~60-75% of the line box) and
    // underestimates pad noticeably.
    const node = this.textNodes[this.cursorNodeIndex];
    const lineHeight = this.measureLineHeight(node) || rect.height || 20;
    const pad = lineHeight * SCROLLOFF;
    const absTop = rect.top + window.scrollY;
    const absBottom = rect.bottom + window.scrollY;
    if (rect.top < pad) {
      window.scrollTo({ top: absTop - pad });
    } else if (rect.bottom > window.innerHeight - pad) {
      window.scrollTo({ top: absBottom - window.innerHeight + pad });
    }

    this.resetBlink();
    this.updateHover();
  }

  // --- Hover simulation ---

  updateHover() {
    this.clearHover();
    const node = this.textNodes[this.cursorNodeIndex];
    if (!node) return;

    let el = node.parentElement;
    while (el && el !== document.body) {
      if (this.isInteractive(el)) {
        el.classList.add("vim-hover");
        this.hoveredElement = el;
        return;
      }
      el = el.parentElement;
    }
  }

  isInteractive(el) {
    if (el.tagName === "A" || el.tagName === "BUTTON") return true;
    if (
      el.tagName === "INPUT" ||
      el.tagName === "SELECT" ||
      el.tagName === "TEXTAREA"
    )
      return true;
    const tabindex = el.getAttribute("tabindex");
    return tabindex !== null && tabindex !== "-1";
  }

  clearHover() {
    if (this.hoveredElement) {
      this.hoveredElement.classList.remove("vim-hover");
      this.hoveredElement = null;
    }
  }

  // --- Horizontal movement (h/l) ---

  moveLeft() {
    this.goalX = null;
    if (this.cursorCharIndex > 0) {
      this.cursorCharIndex--;
    } else if (this.cursorNodeIndex > 0) {
      this.cursorNodeIndex--;
      this.cursorCharIndex = Math.max(
        0,
        this.textNodes[this.cursorNodeIndex].textContent.length - 1,
      );
    }
    this.updatePosition();
  }

  moveRight() {
    this.goalX = null;
    const node = this.textNodes[this.cursorNodeIndex];
    if (!node) return;
    if (this.cursorCharIndex < node.textContent.length - 1) {
      this.cursorCharIndex++;
    } else if (this.cursorNodeIndex < this.textNodes.length - 1) {
      this.cursorNodeIndex++;
      this.cursorCharIndex = 0;
    }
    this.updatePosition();
  }

  // --- Vertical movement (j/k) ---

  /**
   * Find the next visual line above/below the current cursor by walking all
   * text nodes and collecting per-line rects via Range.getClientRects() — that
   * returns one rect per visual line in a wrapped range, so we don't have to
   * scan character-by-character.
   */
  findAdjacentLineRect(direction) {
    const currentRect = this.getCursorRect();
    if (!currentRect) return null;
    const currentTop = currentRect.top;
    const currentBottom = currentRect.bottom;

    let best = null; // { rect, dist }
    const down = direction === "down";

    for (const node of this.textNodes) {
      if (!node.textContent) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const lineRects = range.getClientRects();
      for (const r of lineRects) {
        if (!r.height) continue;
        let dist;
        if (down) {
          if (r.top <= currentTop + 1) continue;
          dist = r.top - currentBottom;
        } else {
          if (r.bottom >= currentBottom - 1) continue;
          dist = currentTop - r.bottom;
        }
        if (!best || dist < best.dist) best = { rect: r, dist };
      }
    }
    return best ? best.rect : null;
  }

  moveDown() {
    this.moveVertical("down");
  }
  moveUp() {
    this.moveVertical("up");
  }

  moveVertical(direction) {
    const currentRect = this.getCursorRect();
    if (!currentRect) return;

    if (this.goalX === null) {
      this.goalX = currentRect.left + currentRect.width / 2;
    }

    const lineRect = this.findAdjacentLineRect(direction);
    if (!lineRect) return; // At top/bottom of document

    const pos = this.findCharAtPoint(
      this.goalX,
      lineRect.top + lineRect.height / 2,
    );
    if (pos) {
      this.cursorNodeIndex = pos.ni;
      this.cursorCharIndex = pos.ci;
      this.updatePosition();
    }
  }

  /** Ask the browser which character is at a given viewport point. */
  findCharAtPoint(x, y) {
    const pos = caretPosFromPoint(x, y);
    if (!pos) return null;
    let { node, offset } = pos;

    // caretPositionFromPoint may return an element when between text nodes.
    if (node.nodeType !== Node.TEXT_NODE) {
      const fallback = this.firstTextNodeAt(x, y);
      if (!fallback) return null;
      node = fallback.node;
      offset = fallback.offset;
    }

    const ni = this.nodeIndex.get(node);
    if (ni === undefined) return null;
    const len = node.textContent.length;
    return { ni, ci: Math.min(offset, Math.max(0, len - 1)) };
  }

  /** Fallback: find a known text node overlapping (x, y). */
  firstTextNodeAt(x, y) {
    for (const node of this.textNodes) {
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          return { node, offset: 0 };
        }
      }
    }
    return null;
  }

  // --- Line start / end (_ and $) ---

  /**
   * Find the character on the current visual line closest to the given x.
   * Walks all text nodes whose per-line rects overlap the current line.
   */
  moveToLineStart() {
    this.goalX = null;
    const rect = this.getCursorRect();
    if (!rect) return;
    const edge = this.findEdgeOfCurrentLine("start");
    if (edge) {
      this.cursorNodeIndex = edge.ni;
      this.cursorCharIndex = edge.ci;
      this.updatePosition();
    }
  }

  moveToLineEnd() {
    this.goalX = null;
    const rect = this.getCursorRect();
    if (!rect) return;
    const edge = this.findEdgeOfCurrentLine("end");
    if (edge) {
      this.cursorNodeIndex = edge.ni;
      this.cursorCharIndex = edge.ci;
      this.updatePosition();
    }
  }

  findEdgeOfCurrentLine(edge) {
    const cursorRect = this.getCursorRect();
    if (!cursorRect) return null;
    const lineY = cursorRect.top + cursorRect.height / 2;
    const tolerance = Math.max(cursorRect.height * 0.5, 4);

    let minLeft = Infinity,
      maxRight = -Infinity;
    for (const node of this.textNodes) {
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        if (!r.height) continue;
        if (Math.abs(r.top + r.height / 2 - lineY) > tolerance) continue;
        if (r.left < minLeft) minLeft = r.left;
        if (r.right > maxRight) maxRight = r.right;
      }
    }
    if (!isFinite(minLeft)) return null;

    const x = edge === "start" ? minLeft + 1 : maxRight - 1;
    return this.findCharAtPoint(x, lineY);
  }

  // --- Word movement (w/e/b) ---

  isWordChar(c) {
    return /\w/.test(c);
  }
  isBlankChar(c) {
    return /\s/.test(c);
  }

  charClass(c) {
    if (!c) return null;
    if (this.isWordChar(c)) return "word";
    if (this.isBlankChar(c)) return "blank";
    return c;
  }

  getCharAt(ni, ci) {
    const node = this.textNodes[ni];
    if (!node) return null;
    const text = node.textContent;
    if (ci < 0 || ci >= text.length) return null;
    return text[ci];
  }

  nextCharPos(ni, ci) {
    ci++;
    while (ni < this.textNodes.length) {
      const text = this.textNodes[ni]?.textContent;
      if (text && ci < text.length) return { ni, ci };
      ni++;
      ci = 0;
    }
    return null;
  }

  prevCharPos(ni, ci) {
    ci--;
    while (ni >= 0) {
      const text = this.textNodes[ni]?.textContent;
      if (text && ci >= 0 && ci < text.length) return { ni, ci };
      ni--;
      if (ni >= 0) {
        const t = this.textNodes[ni]?.textContent;
        ci = t ? t.length - 1 : -1;
      }
    }
    return null;
  }

  moveWordForward() {
    this.goalX = null;
    let pos = { ni: this.cursorNodeIndex, ci: this.cursorCharIndex };
    const startClass = this.charClass(this.getCharAt(pos.ni, pos.ci));

    while (pos) {
      const next = this.nextCharPos(pos.ni, pos.ci);
      if (!next) break;
      if (this.charClass(this.getCharAt(next.ni, next.ci)) !== startClass) {
        pos = next;
        break;
      }
      pos = next;
    }
    while (pos && this.charClass(this.getCharAt(pos.ni, pos.ci)) === "blank") {
      const next = this.nextCharPos(pos.ni, pos.ci);
      if (!next) break;
      pos = next;
    }

    this.cursorNodeIndex = pos.ni;
    this.cursorCharIndex = pos.ci;
    this.updatePosition();
  }

  moveWordEnd() {
    this.goalX = null;
    let pos = this.nextCharPos(this.cursorNodeIndex, this.cursorCharIndex);
    if (!pos) return;

    while (pos && this.charClass(this.getCharAt(pos.ni, pos.ci)) === "blank") {
      const next = this.nextCharPos(pos.ni, pos.ci);
      if (!next) break;
      pos = next;
    }
    if (!pos) return;

    const tokenClass = this.charClass(this.getCharAt(pos.ni, pos.ci));
    while (pos) {
      const next = this.nextCharPos(pos.ni, pos.ci);
      if (!next) break;
      if (this.charClass(this.getCharAt(next.ni, next.ci)) !== tokenClass)
        break;
      pos = next;
    }

    this.cursorNodeIndex = pos.ni;
    this.cursorCharIndex = pos.ci;
    this.updatePosition();
  }

  moveWordBackward() {
    this.goalX = null;
    let pos = this.prevCharPos(this.cursorNodeIndex, this.cursorCharIndex);
    if (!pos) return;

    while (pos && this.charClass(this.getCharAt(pos.ni, pos.ci)) === "blank") {
      const prev = this.prevCharPos(pos.ni, pos.ci);
      if (!prev) break;
      pos = prev;
    }

    const tokenClass = this.charClass(this.getCharAt(pos.ni, pos.ci));
    while (pos) {
      const prev = this.prevCharPos(pos.ni, pos.ci);
      if (!prev) break;
      if (this.charClass(this.getCharAt(prev.ni, prev.ci)) !== tokenClass)
        break;
      pos = prev;
    }

    this.cursorNodeIndex = pos.ni;
    this.cursorCharIndex = pos.ci;
    this.updatePosition();
  }

  // --- File motions (gg/G) ---

  moveToTop() {
    this.goalX = null;
    for (let i = 0; i < this.textNodes.length; i++) {
      if (this.textNodes[i].textContent.trim()) {
        this.cursorNodeIndex = i;
        this.cursorCharIndex = 0;
        this.updatePosition();
        return;
      }
    }
  }

  moveToBottom() {
    this.goalX = null;
    for (let i = this.textNodes.length - 1; i >= 0; i--) {
      if (this.textNodes[i].textContent.trim()) {
        this.cursorNodeIndex = i;
        this.cursorCharIndex = Math.max(
          0,
          this.textNodes[i].textContent.length - 1,
        );
        this.updatePosition();
        return;
      }
    }
  }

  // --- Search ---

  enterSearch() {
    this.searchMode = true;
    this.searchQuery = "";
    this.searchMatches = [];
    this.searchMatchIndex = -1;
    this.clearSearchHighlights();
    this.showCursor();
    this.showSearchBar();
  }

  exitSearch() {
    this.searchMode = false;
    this.removeSearchBar();
  }

  showSearchBar() {
    this.removeSearchBar();
    const bar = document.createElement("div");
    bar.id = "vim-search-bar";
    bar.innerHTML =
      '<span class="vim-search-prompt">/</span><span id="vim-search-input"></span>';
    document.body.appendChild(bar);
    this.searchBarEl = bar;
    this.searchInputEl = bar.querySelector("#vim-search-input");
    this.updateSearchBar();
  }

  updateSearchBar() {
    if (!this.searchInputEl) return;
    const q = this.searchQuery
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    let count = "";
    if (this.searchQuery) {
      const idx = this.searchMatchIndex >= 0 ? this.searchMatchIndex + 1 : 0;
      count = ` <span class="vim-search-count">[${idx}/${this.searchMatches.length}]</span>`;
    }
    this.searchInputEl.innerHTML =
      q + '<span class="vim-search-caret"> </span>' + count;
  }

  removeSearchBar() {
    if (this.searchBarEl) {
      this.searchBarEl.remove();
      this.searchBarEl = null;
      this.searchInputEl = null;
    }
  }

  handleSearchKey(e) {
    e.preventDefault();
    e.stopPropagation();
    const key = e.key;

    if (key === "Escape") {
      this.exitSearch();
      return;
    }
    if (key === "Enter") {
      this.exitSearch();
      return;
    }

    if (key === "Backspace") {
      if (this.searchQuery.length === 0) {
        this.exitSearch();
        return;
      }
      this.searchQuery = this.searchQuery.slice(0, -1);
      this.updateSearchAndJump();
      return;
    }

    if (key.length === 1) {
      this.searchQuery += key;
      this.updateSearchAndJump();
    }
  }

  updateSearchAndJump() {
    this.findSearchMatches();
    if (this.searchMatches.length > 0) {
      this.searchMatchIndex = this.findNearestMatch("forward");
      this.jumpToSearchMatch();
    } else {
      this.searchMatchIndex = -1;
    }
    this.highlightSearchMatches();
    this.updateSearchBar();
  }

  findSearchMatches() {
    this.searchMatches = [];
    const query = this.searchQuery.toLowerCase();
    if (!query) return;

    for (let i = 0; i < this.textNodes.length; i++) {
      const text = this.textNodes[i].textContent.toLowerCase();
      let start = 0;
      while (true) {
        const idx = text.indexOf(query, start);
        if (idx === -1) break;
        this.searchMatches.push({
          nodeIndex: i,
          charIndex: idx,
          length: query.length,
        });
        start = idx + query.length;
      }
    }
  }

  findNearestMatch(direction) {
    if (this.searchMatches.length === 0) return -1;
    const ni = this.cursorNodeIndex;
    const ci = this.cursorCharIndex;

    if (direction === "forward") {
      for (let i = 0; i < this.searchMatches.length; i++) {
        const m = this.searchMatches[i];
        if (m.nodeIndex > ni || (m.nodeIndex === ni && m.charIndex >= ci))
          return i;
      }
      return 0;
    }
    for (let i = this.searchMatches.length - 1; i >= 0; i--) {
      const m = this.searchMatches[i];
      if (m.nodeIndex < ni || (m.nodeIndex === ni && m.charIndex <= ci))
        return i;
    }
    return this.searchMatches.length - 1;
  }

  /** Paint matches using the CSS Custom Highlight API. */
  highlightSearchMatches() {
    if (!window.CSS || !CSS.highlights || typeof Highlight === "undefined")
      return;
    const all = [],
      current = [];

    for (let i = 0; i < this.searchMatches.length; i++) {
      const m = this.searchMatches[i];
      const node = this.textNodes[m.nodeIndex];
      if (!node) continue;
      try {
        const range = new Range();
        range.setStart(node, m.charIndex);
        range.setEnd(node, m.charIndex + m.length);
        if (i === this.searchMatchIndex) current.push(range);
        else all.push(range);
      } catch {
        // Node may have been removed; skip.
      }
    }

    CSS.highlights.set("vim-search", new Highlight(...all));
    CSS.highlights.set("vim-search-current", new Highlight(...current));
  }

  clearSearchHighlights() {
    if (!window.CSS || !CSS.highlights) return;
    CSS.highlights.delete("vim-search");
    CSS.highlights.delete("vim-search-current");
  }

  jumpToSearchMatch() {
    if (this.searchMatchIndex < 0) return;
    const m = this.searchMatches[this.searchMatchIndex];
    this.cursorNodeIndex = m.nodeIndex;
    this.cursorCharIndex = m.charIndex;
    this.showCursor();
    this.updatePosition();
  }

  searchNext() {
    if (this.searchMatches.length === 0) return;
    this.searchMatchIndex =
      (this.searchMatchIndex + 1) % this.searchMatches.length;
    this.highlightSearchMatches();
    this.jumpToSearchMatch();
  }

  searchPrev() {
    if (this.searchMatches.length === 0) return;
    this.searchMatchIndex =
      (this.searchMatchIndex - 1 + this.searchMatches.length) %
      this.searchMatches.length;
    this.highlightSearchMatches();
    this.jumpToSearchMatch();
  }
}

let vimCursor = null;

function initVimCursor() {
  // Touch/mobile: no keyboard, skip setup entirely.
  if (matchMedia("(pointer: coarse)").matches) return;
  if (vimCursor) vimCursor.destroy();
  vimCursor = new VimCursor();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVimCursor);
} else {
  initVimCursor();
}
document.addEventListener("astro:after-swap", initVimCursor);
