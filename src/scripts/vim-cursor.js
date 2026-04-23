/**
 * Vim-style cursor navigation for the web.
 * Provides a block cursor that moves through text content character-by-character,
 * simulates hover states on interactive elements, and clicks them with Space/Enter.
 */

class VimCursor {
  constructor() {
    this.textNodes = [];
    this.cursorNodeIndex = 0;
    this.cursorCharIndex = 0;
    this.goalX = null;
    this.active = false;
    this.hoveredElement = null;
    this.cursorEl = null;
    this.pendingGG = false;
    this.gTimeout = null;
    this.rafId = null;
    this.resizeTimeout = null;

    this.init();
  }

  init() {
    this.createCursorElement();
    this.scanTextNodes();
    this.positionAtH1();
    this.bindEvents();
  }

  destroy() {
    if (this.cursorEl) {
      this.cursorEl.remove();
      this.cursorEl = null;
    }
    this.clearHover();
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("astro:after-swap", this.onPageSwap);
    window.removeEventListener("resize", this.onResize);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
  }

  createCursorElement() {
    if (this.cursorEl) this.cursorEl.remove();

    const el = document.createElement("div");
    el.id = "vim-cursor";
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      display: none;
      background: var(--fg);
      color: var(--bg);
      mix-blend-mode: difference;
    `;
    document.body.appendChild(el);
    this.cursorEl = el;
  }

  /** Collect all visible text nodes within <main> in document order. */
  scanTextNodes() {
    this.textNodes = [];
    const main = document.querySelector("main");
    if (!main) return;

    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!node.textContent) return NodeFilter.FILTER_REJECT;
        if (node.textContent.trim() === "" && !node.parentElement?.matches("pre, code")) {
          return NodeFilter.FILTER_REJECT;
        }
        const parent = node.parentElement;
        if (
          parent &&
          ((parent.offsetWidth === 0 && parent.offsetHeight === 0) ||
            getComputedStyle(parent).visibility === "hidden" ||
            getComputedStyle(parent).display === "none")
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node;
    while ((node = walker.nextNode())) {
      this.textNodes.push(node);
    }
  }

  /** Position cursor at the end of the first <h1>'s text content. */
  positionAtH1() {
    const h1 = document.querySelector("main h1");
    if (h1) {
      // Find the last text node that belongs to h1
      for (let i = this.textNodes.length - 1; i >= 0; i--) {
        if (h1.contains(this.textNodes[i])) {
          this.cursorNodeIndex = i;
          // Position at end of h1 text
          this.cursorCharIndex = Math.max(0, this.textNodes[i].textContent.length - 1);
          this.showCursor();
          this.updateCursor();
          return;
        }
      }
    }
    // Fallback: start of document
    this.cursorNodeIndex = 0;
    this.cursorCharIndex = 0;
    this.showCursor();
    this.updateCursor();
  }

  bindEvents() {
    this.onKeyDown = this.handleKeyDown.bind(this);
    this.onPageSwap = this.handlePageSwap.bind(this);
    this.onResize = this.handleResize.bind(this);

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("astro:after-swap", this.onPageSwap);
    window.addEventListener("resize", this.onResize);
  }

  handleKeyDown(e) {
    const key = e.key;

    // Don't intercept when user is typing in an input
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") {
      return;
    }
    if (e.target.isContentEditable) return;

    // Handle 'g' prefix (gg command)
    if (key === "g" && !this.pendingGG) {
      this.pendingGG = true;
      this.gTimeout = setTimeout(() => {
        this.pendingGG = false;
      }, 500);
      e.preventDefault();
      return;
    }

    if (this.pendingGG && key === "g") {
      clearTimeout(this.gTimeout);
      this.pendingGG = false;
      if (!this.active) this.showCursor();
      this.moveToTop();
      e.preventDefault();
      return;
    } else if (this.pendingGG) {
      clearTimeout(this.gTimeout);
      this.pendingGG = false;
      // Fall through to handle 'g' as normal key if needed
    }

    const vimKeys = ["h", "j", "k", "l", "w", "b", "0", "$", "G"];
    const navKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

    if (vimKeys.includes(key) || navKeys.includes(key) || key === " " || key === "Enter") {
      e.preventDefault();
    } else {
      return; // Not a vim key we handle
    }

    // Activate cursor on first vim key
    if (!this.active && (vimKeys.includes(key) || navKeys.includes(key) || key === "G")) {
      this.showCursor();
    }

    if (!this.active) return;

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
      case "b":
        this.moveWordBackward();
        break;
      case "0":
        this.moveToLineStart();
        break;
      case "$":
        this.moveToLineEnd();
        break;
      case "G":
        this.moveToBottom();
        break;
      case " ":
      case "Enter":
        this.clickCurrentElement();
        break;
    }
  }

  handlePageSwap() {
    this.scanTextNodes();
    this.positionAtH1();
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      if (this.active) this.updateCursor();
    }, 100);
  }

  showCursor() {
    this.active = true;
    if (this.cursorEl) {
      this.cursorEl.style.display = "block";
      this.startBlink();
    }
  }

  hideCursor() {
    this.active = false;
    if (this.cursorEl) {
      this.cursorEl.style.display = "none";
    }
    this.clearHover();
  }

  // --- Blink animation ---
  startBlink() {
    this.cursorEl.style.opacity = "1";
    this._blinkVisible = true;
    clearInterval(this._blinkInterval);
    this._blinkInterval = setInterval(() => {
      this._blinkVisible = !this._blinkVisible;
      if (this.cursorEl) {
        this.cursorEl.style.opacity = this._blinkVisible ? "1" : "0";
      }
    }, 530);
  }

  resetBlink() {
    this._blinkVisible = true;
    if (this.cursorEl) this.cursorEl.style.opacity = "1";
    clearInterval(this._blinkInterval);
    this._blinkInterval = setInterval(() => {
      this._blinkVisible = !this._blinkVisible;
      if (this.cursorEl) {
        this.cursorEl.style.opacity = this._blinkVisible ? "1" : "0";
      }
    }, 530);
  }

  // --- Cursor position computation ---

  /** Get the pixel rect for the character at the current cursor position. */
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

  /** Compute a representative character width for the current context. */
  getCharWidth() {
    const rect = this.getCursorRect();
    if (rect && rect.width > 0) return rect.width;
    // Fallback: measure 'M' in the body font
    const span = document.createElement("span");
    span.textContent = "M";
    span.style.cssText = "position:absolute;visibility:hidden;font:inherit;";
    document.body.appendChild(span);
    const w = span.getBoundingClientRect().width;
    span.remove();
    return w || 8;
  }

  updateCursor() {
    if (!this.cursorEl || !this.active) return;

    const rect = this.getCursorRect();
    const charWidth = this.getCharWidth();

    if (rect) {
      this.cursorEl.style.left = rect.left + "px";
      this.cursorEl.style.top = rect.top + "px";
      this.cursorEl.style.width = Math.max(charWidth, rect.width) + "px";
      this.cursorEl.style.height = rect.height + "px";
    }

    this.resetBlink();
    this.updateHover();
    this.scrollIntoView();
  }

  scrollIntoView() {
    const rect = this.getCursorRect();
    if (!rect) return;

    // If cursor is off-screen, scroll to it
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      window.scrollBy({
        top: rect.top - window.innerHeight / 3,
        behavior: "smooth",
      });
    }
  }

  // --- Hover state simulation ---

  updateHover() {
    this.clearHover();

    const node = this.textNodes[this.cursorNodeIndex];
    if (!node) return;

    // Walk up from the text node to find interactive element
    let el = node.parentElement;
    let interactiveEl = null;

    while (el && el !== document.body) {
      if (
        el.tagName === "A" ||
        el.tagName === "BUTTON" ||
        el.tagName === "INPUT" ||
        el.tagName === "SELECT" ||
        el.tagName === "TEXTAREA" ||
        el.hasAttribute("tabindex")
      ) {
        interactiveEl = el;
        break;
      }
      el = el.parentElement;
    }

    if (interactiveEl) {
      interactiveEl.classList.add("vim-hover");
      this.hoveredElement = interactiveEl;
    }
  }

  clearHover() {
    if (this.hoveredElement) {
      this.hoveredElement.classList.remove("vim-hover");
      this.hoveredElement = null;
    }
  }

  // --- Click ---

  clickCurrentElement() {
    if (this.hoveredElement) {
      this.hoveredElement.click();
    }
  }

  // --- Movement primitives ---

  /** Clamp cursor position to valid range, skipping to next/prev node if needed. */
  clampPosition() {
    if (this.textNodes.length === 0) return;

    // Clamp nodeIndex
    if (this.cursorNodeIndex >= this.textNodes.length) {
      this.cursorNodeIndex = this.textNodes.length - 1;
    }
    if (this.cursorNodeIndex < 0) {
      this.cursorNodeIndex = 0;
    }

    const node = this.textNodes[this.cursorNodeIndex];
    if (!node || !node.textContent) {
      // Skip empty/bad nodes
      if (this.cursorNodeIndex < this.textNodes.length - 1) {
        this.cursorNodeIndex++;
        this.cursorCharIndex = 0;
      }
      return;
    }

    const len = node.textContent.length;

    // If past end of node, move to next node
    if (this.cursorCharIndex >= len) {
      if (this.cursorNodeIndex < this.textNodes.length - 1) {
        this.cursorNodeIndex++;
        this.cursorCharIndex = 0;
      } else {
        // At last node, clamp to last char
        this.cursorCharIndex = Math.max(0, len - 1);
      }
    }

    // If before start of node, move to prev node
    if (this.cursorCharIndex < 0) {
      if (this.cursorNodeIndex > 0) {
        this.cursorNodeIndex--;
        const prevNode = this.textNodes[this.cursorNodeIndex];
        this.cursorCharIndex = Math.max(0, (prevNode?.textContent?.length || 1) - 1);
      } else {
        this.cursorCharIndex = 0;
      }
    }
  }

  moveLeft() {
    this.goalX = null;
    const node = this.textNodes[this.cursorNodeIndex];
    if (!node) return;

    const text = node.textContent;
    // Skip leading whitespace if we're at the start after whitespace
    if (this.cursorCharIndex > 0) {
      this.cursorCharIndex--;
      // Skip past whitespace-only positions at beginning of text nodes
      while (this.cursorCharIndex > 0 && text[this.cursorCharIndex] === " " && this.cursorCharIndex === 0) {
        this.cursorCharIndex--;
      }
    } else if (this.cursorNodeIndex > 0) {
      // Move to end of previous node
      this.cursorNodeIndex--;
      const prevText = this.textNodes[this.cursorNodeIndex]?.textContent || "";
      this.cursorCharIndex = Math.max(0, prevText.length - 1);
    }
    this.clampPosition();
    this.updateCursor();
  }

  moveRight() {
    this.goalX = null;
    const node = this.textNodes[this.cursorNodeIndex];
    if (!node) return;

    const text = node.textContent;
    if (this.cursorCharIndex < text.length - 1) {
      this.cursorCharIndex++;
    } else if (this.cursorNodeIndex < this.textNodes.length - 1) {
      // Move to start of next node
      this.cursorNodeIndex++;
      this.cursorCharIndex = 0;
      // Skip leading whitespace in the new node
      const newNode = this.textNodes[this.cursorNodeIndex];
      if (newNode) {
        while (
          this.cursorCharIndex < newNode.textContent.length - 1 &&
          newNode.textContent[this.cursorCharIndex] === " "
        ) {
          this.cursorCharIndex++;
        }
      }
    }
    this.clampPosition();
    this.updateCursor();
  }

  moveDown() {
    const rect = this.getCursorRect();
    if (!rect) return;

    // Establish goal X on first vertical move, preserve across consecutive j/k
    if (this.goalX === null) {
      this.goalX = rect.left + rect.width / 2;
    }

    // Try successive Y positions below the current line until we find a hit
    const step = rect.height || 20;
    for (let offset = step; offset < step * 20; offset += step * 0.5) {
      const targetY = rect.top + offset;
      if (this.moveToPoint(this.goalX, targetY)) return;
    }
  }

  moveUp() {
    const rect = this.getCursorRect();
    if (!rect) return;

    if (this.goalX === null) {
      this.goalX = rect.left + rect.width / 2;
    }

    const step = rect.height || 20;
    for (let offset = step; offset < step * 20; offset += step * 0.5) {
      const targetY = rect.top - offset;
      if (this.moveToPoint(this.goalX, targetY)) return;
    }
  }

  /**
   * Move cursor to the text position at viewport coordinates (x, y).
   * Uses caretRangeFromPoint (native browser API) when available,
   * then maps back to our textNodes array. Returns true on success.
   */
  moveToPoint(x, y) {
    // Clamp x/y to viewport bounds
    const clampedX = Math.max(0, Math.min(x, window.innerWidth - 1));
    const clampedY = Math.max(0, Math.min(y, document.documentElement.scrollHeight - 1));

    // Use native caret-position APIs
    let targetNode = null;
    let targetOffset = 0;

    if (document.caretRangeFromPoint) {
      const range = document.caretRangeFromPoint(clampedX, clampedY);
      if (range) {
        targetNode = range.startContainer;
        targetOffset = range.startOffset;
      }
    } else if (document.caretPositionFromPoint) {
      // Firefox
      const pos = document.caretPositionFromPoint(clampedX, clampedY);
      if (pos) {
        targetNode = pos.offsetNode;
        targetOffset = pos.offset;
      }
    }

    if (!targetNode) return false;

    // If we got a text node, find it (or its ancestor) in our textNodes array
    if (targetNode.nodeType === Node.TEXT_NODE) {
      const idx = this.textNodes.indexOf(targetNode);
      if (idx >= 0) {
        // Clamp offset to valid range (use last char if offset is at end)
        const text = targetNode.textContent;
        this.cursorNodeIndex = idx;
        this.cursorCharIndex = Math.min(targetOffset, Math.max(0, text.length - 1));
        this.updateCursor();
        return true;
      }

      // Text node not in our array (e.g., inside <footer>) — fall through
    }

    // Element node: try to find the nearest text node in our array
    // by looking for the closest text node by screen position
    return this.moveToPointFallback(clampedX, clampedY, targetNode);
  }

  /**
   * Fallback: find the closest text node to (x, y) by checking bounding rects.
   * Used when caretRangeFromPoint returns an element outside our text node list.
   */
  moveToPointFallback(x, y, hintEl) {
    // If hintEl is an element, check if any of our text nodes are inside it
    if (hintEl && hintEl.nodeType === Node.ELEMENT_NODE) {
      let bestNi = -1;
      let bestDist = Infinity;
      for (let ni = 0; ni < this.textNodes.length; ni++) {
        const tn = this.textNodes[ni];
        if (!tn.parentElement) continue;
        if (!hintEl.contains(tn)) continue;

        const range = document.createRange();
        range.setStart(tn, 0);
        range.setEnd(tn, Math.max(1, tn.textContent.length));
        const r = range.getBoundingClientRect();
        if (r.height === 0) continue;

        const dy = Math.abs(r.top + r.height / 2 - y);
        const dx = Math.abs(r.left + r.width / 2 - x);
        const dist = dy * 5 + dx;
        if (dist < bestDist) {
          bestDist = dist;
          bestNi = ni;
        }
      }

      if (bestNi >= 0) {
        this.cursorNodeIndex = bestNi;
        // Position at the character closest to x
        const tn = this.textNodes[bestNi];
        this.cursorCharIndex = this.findClosestChar(tn, x);
        this.updateCursor();
        return true;
      }
    }

    // Last resort: find the text node whose bounding rect center is
    // vertically closest to y and horizontally closest to x
    let bestNi = -1;
    let bestCi = 0;
    let bestDist = Infinity;

    for (let ni = 0; ni < this.textNodes.length; ni++) {
      const tn = this.textNodes[ni];
      if (!tn.parentElement) continue;
      const r = tn.parentElement.getBoundingClientRect();
      if (r.height === 0) continue;

      // Quick vertical filter
      if (Math.abs(r.top + r.height / 2 - y) > 200) continue;

      const ci = this.findClosestChar(tn, x);
      const cr = this.getCharRect(ni, ci);
      if (!cr) continue;

      const dy = Math.abs(cr.top + cr.height / 2 - y);
      const dx = Math.abs(cr.left + cr.width / 2 - x);
      const dist = dy * 10 + dx;
      if (dist < bestDist) {
        bestDist = dist;
        bestNi = ni;
        bestCi = ci;
      }
    }

    if (bestNi >= 0) {
      this.cursorNodeIndex = bestNi;
      this.cursorCharIndex = bestCi;
      this.updateCursor();
      return true;
    }
    return false;
  }

  /** Find the character offset within a text node closest to a given X coordinate. */
  findClosestChar(textNode, x) {
    const text = textNode.textContent;
    if (text.length === 0) return 0;

    let bestCi = 0;
    let bestDist = Infinity;

    // Sample every character (but cap at 500 for long nodes)
    const step = text.length > 500 ? Math.ceil(text.length / 500) : 1;
    for (let ci = 0; ci < text.length; ci += step) {
      const r = this.getCharRectByNode(textNode, ci);
      if (!r || r.width === 0) continue;
      const dist = Math.abs(r.left + r.width / 2 - x);
      if (dist < bestDist) {
        bestDist = dist;
        bestCi = ci;
      }
    }
    return bestCi;
  }

  /** Get rect for a character at (nodeIndex, charIndex) in our textNodes array. */
  getCharRect(ni, ci) {
    const node = this.textNodes[ni];
    if (!node || ci >= node.textContent.length) return null;
    const range = document.createRange();
    range.setStart(node, ci);
    range.setEnd(node, ci + 1);
    return range.getBoundingClientRect();
  }

  /** Get rect for a character at (textNode, offset) directly. */
  getCharRectByNode(textNode, offset) {
    if (offset >= textNode.textContent.length) return null;
    const range = document.createRange();
    range.setStart(textNode, offset);
    range.setEnd(textNode, offset + 1);
    return range.getBoundingClientRect();
  }

  moveWordForward() {
    this.goalX = null;
    const node = this.textNodes[this.cursorNodeIndex];
    if (!node) return;

    let ni = this.cursorNodeIndex;
    let ci = this.cursorCharIndex;
    let text = node.textContent;

    // Skip current non-whitespace
    while (ci < text.length && text[ci] !== " " && text[ci] !== "\n") {
      ci++;
      if (ci >= text.length) {
        ni++;
        if (ni >= this.textNodes.length) {
          ni = this.textNodes.length - 1;
          ci = Math.max(0, (this.textNodes[ni]?.textContent?.length || 1) - 1);
          break;
        }
        text = this.textNodes[ni].textContent || "";
        ci = 0;
      }
    }

    // Skip whitespace
    while (ni < this.textNodes.length) {
      text = this.textNodes[ni]?.textContent || "";
      while (ci < text.length && (text[ci] === " " || text[ci] === "\n")) {
        ci++;
      }
      if (ci < text.length) break;
      ni++;
      ci = 0;
    }

    if (ni < this.textNodes.length) {
      this.cursorNodeIndex = ni;
      this.cursorCharIndex = ci;
    }
    this.clampPosition();
    this.updateCursor();
  }

  moveWordBackward() {
    this.goalX = null;
    let ni = this.cursorNodeIndex;
    let ci = this.cursorCharIndex;
    let text = this.textNodes[ni]?.textContent || "";

    // If at start of node, go to previous node
    if (ci === 0 && ni > 0) {
      ni--;
      text = this.textNodes[ni]?.textContent || "";
      ci = text.length - 1;
    } else if (ci > 0) {
      ci--;
    }

    // Skip whitespace backwards
    while (ni >= 0) {
      text = this.textNodes[ni]?.textContent || "";
      while (ci >= 0 && (text[ci] === " " || text[ci] === "\n")) {
        ci--;
      }
      if (ci >= 0) break;
      ni--;
      if (ni >= 0) {
        text = this.textNodes[ni]?.textContent || "";
        ci = text.length - 1;
      }
    }

    // Skip word backwards
    while (ni >= 0) {
      text = this.textNodes[ni]?.textContent || "";
      while (ci >= 0 && text[ci] !== " " && text[ci] !== "\n") {
        ci--;
      }
      if (ci < 0) {
        ni--;
        if (ni >= 0) {
          text = this.textNodes[ni]?.textContent || "";
          ci = text.length - 1;
          continue;
        }
      } else {
        ci++; // Move to start of word (one past the space)
      }
      break;
    }

    if (ni < 0) ni = 0;
    if (ci < 0) ci = 0;

    this.cursorNodeIndex = Math.min(ni, this.textNodes.length - 1);
    this.cursorCharIndex = ci;
    this.clampPosition();
    this.updateCursor();
  }

  /** Find the first text node on the same visual line as the cursor, then move to offset 0. */
  moveToLineStart() {
    this.goalX = null;
    // Simple approach: find first text node in same visual line (same parent or same block)
    const node = this.textNodes[this.cursorNodeIndex];
    if (!node || !node.parentElement) return;

    // Find the leftmost position on this line
    // Walk backwards through text nodes in the same block context
    let ni = this.cursorNodeIndex;
    const rect = this.getCursorRect();

    // Go backwards until we find a different vertical position (different line)
    while (ni > 0) {
      const prevNode = this.textNodes[ni - 1];
      if (!prevNode) break;
      const pr = document.createRange();
      pr.setStart(prevNode, 0);
      pr.setEnd(prevNode, Math.max(1, prevNode.textContent.length));
      const prevRect = pr.getBoundingClientRect();

      if (Math.abs(prevRect.top - (rect?.top || 0)) > 5) break;
      ni--;
    }

    this.cursorNodeIndex = ni;
    this.cursorCharIndex = 0;
    this.updateCursor();
  }

  /** Move to the last character on the current visual line. */
  moveToLineEnd() {
    this.goalX = null;
    const rect = this.getCursorRect();
    if (!rect) return;

    let ni = this.cursorNodeIndex;
    // Go forward until we find a different vertical position
    while (ni < this.textNodes.length - 1) {
      const nextNode = this.textNodes[ni + 1];
      if (!nextNode) break;
      const nr = document.createRange();
      nr.setStart(nextNode, 0);
      nr.setEnd(nextNode, Math.max(1, nextNode.textContent.length));
      const nextRect = nr.getBoundingClientRect();

      if (Math.abs(nextRect.top - rect.top) > 5) break;
      ni++;
    }

    this.cursorNodeIndex = ni;
    this.cursorCharIndex = Math.max(0, (this.textNodes[ni]?.textContent?.length || 1) - 1);
    this.updateCursor();
  }

  moveToTop() {
    this.goalX = null;
    // Find first non-empty text node
    for (let i = 0; i < this.textNodes.length; i++) {
      if (this.textNodes[i].textContent.trim()) {
        this.cursorNodeIndex = i;
        this.cursorCharIndex = 0;
        this.updateCursor();
        return;
      }
    }
  }

  moveToBottom() {
    this.goalX = null;
    for (let i = this.textNodes.length - 1; i >= 0; i--) {
      if (this.textNodes[i].textContent.trim()) {
        this.cursorNodeIndex = i;
        this.cursorCharIndex = Math.max(0, this.textNodes[i].textContent.length - 1);
        this.updateCursor();
        return;
      }
    }
  }
}

// Initialize
let vimCursor = null;

function initVimCursor() {
  if (vimCursor) vimCursor.destroy();
  vimCursor = new VimCursor();
}

// Initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVimCursor);
} else {
  initVimCursor();
}

// Re-initialize on Astro page transitions
document.addEventListener("astro:after-swap", initVimCursor);