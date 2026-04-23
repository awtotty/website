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

  /** Get the line height at the cursor position. */
  getLineHeight() {
    const node = this.textNodes[this.cursorNodeIndex];
    if (!node || !node.parentElement) return 20;
    return parseFloat(getComputedStyle(node.parentElement).lineHeight) || 20;
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

    const charWidth = this.getCharWidth();
    const lineHeight = this.getLineHeight();
    const targetY = rect.top + lineHeight;

    // Store goal X
    if (this.goalX === null) {
      this.goalX = rect.left + charWidth / 2;
    }

    this.moveToPosition(this.goalX, targetY);
  }

  moveUp() {
    const rect = this.getCursorRect();
    if (!rect) return;

    const charWidth = this.getCharWidth();
    const lineHeight = this.getLineHeight();
    const targetY = rect.top - lineHeight;

    if (this.goalX === null) {
      this.goalX = rect.left + charWidth / 2;
    }

    this.moveToPosition(this.goalX, targetY);
  }

  /** Move cursor to the closest text position at screen coordinates (x, y). */
  moveToPosition(x, y) {
    // Add window scroll offset since getBoundingClientRect is viewport-relative
    const scrollTop = window.scrollY;
    const targetYAbsolute = y + scrollTop;

    // Strategy: find the text node whose vertical center is closest to targetY
    // and whose character position is closest to targetX
    let bestNodeIndex = -1;
    let bestCharIndex = -1;
    let bestDistance = Infinity;

    for (let ni = 0; ni < this.textNodes.length; ni++) {
      const node = this.textNodes[ni];
      if (!node || !node.textContent) continue;

      // Quick bounding box check
      const parentEl = node.parentElement;
      if (!parentEl) continue;
      const parentRect = parentEl.getBoundingClientRect();
      if (parentRect.height === 0 || parentRect.width === 0) continue;

      // Check if this node's vertical range is close to targetY
      const text = node.textContent;
      const nodeRange = document.createRange();
      nodeRange.setStart(node, 0);
      nodeRange.setEnd(node, Math.max(0, text.length - 1));
      const nodeRect = nodeRange.getBoundingClientRect();

      if (nodeRect.height === 0) continue;

      // Skip if too far vertically (more than 2 line heights away)
      if (Math.abs(nodeRect.top - y) > 100) continue;

      // Find closest character in this node to the target x,y
      for (let ci = 0; ci < text.length; ci++) {
        const charRange = document.createRange();
        charRange.setStart(node, ci);
        charRange.setEnd(node, ci + 1);
        const charRect = charRange.getBoundingClientRect();

        if (charRect.height === 0) continue;

        // Check if this character is on the right line (within half a line height)
        if (Math.abs(charRect.top - y) > charRect.height) continue;

        const distY = Math.abs(charRect.top - y);
        const distX = Math.abs(charRect.left + charRect.width / 2 - x);
        // Weight vertical distance much more than horizontal
        const dist = distY * 10 + distX;

        if (distY < bestDistance * 0.5 || dist < bestDistance) {
          bestDistance = dist;
          bestNodeIndex = ni;
          bestCharIndex = ci;
        }
      }
    }

    if (bestNodeIndex >= 0) {
      this.cursorNodeIndex = bestNodeIndex;
      this.cursorCharIndex = bestCharIndex;
      this.updateCursor();
    }
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