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

    const vimKeys = ["h", "j", "k", "l", "w", "e", "b", "0", "$", "G"];
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
      case "e":
        this.moveWordEnd();
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

  /** Get rect for a character at (nodeIndex, charIndex) in our textNodes array. */
  getCharRect(ni, ci) {
    const node = this.textNodes[ni];
    if (!node || ci >= node.textContent.length) return null;
    const range = document.createRange();
    range.setStart(node, ci);
    range.setEnd(node, ci + 1);
    return range.getBoundingClientRect();
  }

  /** Resolve a viewport position to a cursor position in our textNodes. */
  resolveCaretPosition(x, y) {
    const clampX = Math.max(1, Math.min(x, window.innerWidth - 2));
    const clampY = Math.max(1, Math.min(y, window.innerHeight - 2));

    let targetNode = null;
    let targetOffset = 0;

    if (document.caretRangeFromPoint) {
      const range = document.caretRangeFromPoint(clampX, clampY);
      if (range) {
        targetNode = range.startContainer;
        targetOffset = range.startOffset;
      }
    } else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(clampX, clampY);
      if (pos) {
        targetNode = pos.offsetNode;
        targetOffset = pos.offset;
      }
    }

    if (!targetNode) return null;

    if (targetNode.nodeType === Node.TEXT_NODE) {
      const idx = this.textNodes.indexOf(targetNode);
      if (idx >= 0) {
        const text = targetNode.textContent;
        return { nodeIndex: idx, charIndex: Math.min(targetOffset, Math.max(0, text.length - 1)) };
      }
    }

    return null;
  }

  /**
   * In text node ni, find the character closest to goalX on the
   * visual line nearest to targetY.
   */
  findXInNode(ni, goalX, targetY) {
    const node = this.textNodes[ni];
    if (!node || !node.textContent) return 0;
    const len = node.textContent.length;

    // First pass: find the best character considering both X and Y proximity.
    // If targetY is inside this node's range, prefer chars on that line.
    // If not, fall back to just finding the closest X on the nearest line.
    let bestCi = 0;
    let bestDist = Infinity;
    const step = len > 200 ? Math.ceil(len / 200) : 1;

    for (let ci = 0; ci < len; ci += step) {
      const r = this.getCharRect(ni, ci);
      if (!r || r.height === 0) continue;

      const yDist = Math.abs(r.top - targetY);
      const xDist = Math.abs(r.left + r.width / 2 - goalX);
      // Weight vertical alignment much more heavily than horizontal,
      // but don't hard-filter — we want the best available char even
      // if no char is exactly on the target Y line.
      const dist = yDist * 10 + xDist;
      if (dist < bestDist) {
        bestDist = dist;
        bestCi = ci;
      }
    }
    return bestCi;
  }

  moveDown() {
    const currentRect = this.getCursorRect();
    if (!currentRect) return;

    if (this.goalX === null) {
      this.goalX = currentRect.left + currentRect.width / 2;
    }

    const currentY = currentRect.top;
    const lineHeight = currentRect.height || 20;
    const goalX = this.goalX;

    // Strategy 1: Use caretRangeFromPoint — handles multi-line nodes correctly
    for (let dy = lineHeight; dy < lineHeight * 20; dy += lineHeight * 0.4) {
      const targetY = currentY + dy;
      if (targetY >= window.innerHeight - 2) break;

      const pos = this.resolveCaretPosition(goalX, targetY);
      if (pos && (pos.nodeIndex !== this.cursorNodeIndex || pos.charIndex !== this.cursorCharIndex)) {
        const newRect = this.getCharRect(pos.nodeIndex, pos.charIndex);
        if (newRect && newRect.top > currentY + 2) {
          this.cursorNodeIndex = pos.nodeIndex;
          this.cursorCharIndex = pos.charIndex;
          this.updateCursor();
          return;
        }
      }
    }

    // Strategy 2: walk text nodes checking each first character's Y position.
    // Start from cursorNodeIndex (not +1) so we also check if the CURRENT node
    // wraps to the next line — but skip self-match.
    const tolerance = 4;
    for (let ni = this.cursorNodeIndex; ni < this.textNodes.length; ni++) {
      const node = this.textNodes[ni];
      if (!node || !node.textContent) continue;
      const firstRect = this.getCharRect(ni, 0);
      if (!firstRect || firstRect.height === 0) continue;
      // Is this node's first char below currentY? (i.e., on a different line)
      if (firstRect.top <= currentY + tolerance) continue;

      // Don't pick a char identical to where we already are
      const ci = this.findXInNode(ni, goalX, firstRect.top);
      if (ni === this.cursorNodeIndex && ci === this.cursorCharIndex) continue;

      this.cursorNodeIndex = ni;
      this.cursorCharIndex = ci;
      this.updateCursor();
      return;
    }

    // Near bottom of page — try scrolling
    if (currentY + lineHeight >= window.innerHeight - 20) {
      window.scrollBy({ top: lineHeight * 2, behavior: 'smooth' });
    }
  }

  moveUp() {
    const currentRect = this.getCursorRect();
    if (!currentRect) return;

    if (this.goalX === null) {
      this.goalX = currentRect.left + currentRect.width / 2;
    }

    const currentY = currentRect.top;
    const lineHeight = currentRect.height || 20;
    const goalX = this.goalX;

    // If cursor is near top of viewport, scroll up first
    if (currentY - lineHeight < 0) {
      window.scrollBy({ top: -lineHeight * 2, behavior: 'smooth' });
      return;
    }

    // Strategy 1: caretRangeFromPoint
    for (let dy = lineHeight; dy < lineHeight * 20; dy += lineHeight * 0.4) {
      const targetY = currentY - dy;
      if (targetY < 1) break;

      const pos = this.resolveCaretPosition(goalX, targetY);
      if (pos && (pos.nodeIndex !== this.cursorNodeIndex || pos.charIndex !== this.cursorCharIndex)) {
        const newRect = this.getCharRect(pos.nodeIndex, pos.charIndex);
        if (newRect && newRect.top < currentY - 2) {
          this.cursorNodeIndex = pos.nodeIndex;
          this.cursorCharIndex = pos.charIndex;
          this.updateCursor();
          return;
        }
      }
    }

    // Strategy 2: walk text nodes backward.
    // Start from cursorNodeIndex (not -1) to also check if the CURRENT node
    // wraps to a previous line.
    const tolerance = 4;
    for (let ni = this.cursorNodeIndex; ni >= 0; ni--) {
      const node = this.textNodes[ni];
      if (!node || !node.textContent) continue;
      const len = node.textContent.length;
      const lastRect = this.getCharRect(ni, Math.max(0, len - 1));
      if (!lastRect || lastRect.height === 0) continue;
      // Is any part of this node above currentY?
      if (lastRect.bottom >= currentY - tolerance) continue;

      // Don't pick a char identical to where we already are
      const ci = this.findXInNode(ni, goalX, lastRect.top);
      if (ni === this.cursorNodeIndex && ci === this.cursorCharIndex) continue;

      this.cursorNodeIndex = ni;
      this.cursorCharIndex = ci;
      this.updateCursor();
      return;
    }
  }

  // --- Vim character classification ---

  /** Vim word chars: letters, digits, underscore. Everything else is non-word. */
  isWordChar(c) {
    return /\w/.test(c);
  }

  isBlankChar(c) {
    return /\s/.test(c);
  }

  /**
   * Vim character class: chars in the same class form a "word".
   * - 'word'  = word chars [a-zA-Z0-9_]
   * - 'blank' = whitespace
   * - the char itself = each punctuation char is its own class
   *   (so :: is one word, :/ is two words)
   */
  charClass(c) {
    if (!c) return null;
    if (this.isWordChar(c)) return 'word';
    if (this.isBlankChar(c)) return 'blank';
    return c; // each non-word, non-blank char is its own class
  }

  /** Get character at a position in the text node stream. */
  getCharAt(ni, ci) {
    if (ni < 0 || ni >= this.textNodes.length) return null;
    const text = this.textNodes[ni].textContent;
    if (ci < 0 || ci >= text.length) return null;
    return text[ci];
  }

  /** Next position in the text stream (across node boundaries). Returns null if past end. */
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

  /** Previous position in the text stream (across node boundaries). Returns null if past start. */
  prevCharPos(ni, ci) {
    ci--;
    while (ni >= 0) {
      const text = this.textNodes[ni]?.textContent;
      if (text && ci >= 0 && ci < text.length) return { ni, ci };
      ni--;
      if (ni >= 0 && this.textNodes[ni]?.textContent) {
        ci = this.textNodes[ni].textContent.length - 1;
      } else {
        ci = -1;
      }
    }
    return null;
  }

  // --- Vim word movements ---

  /**
   * w — Move forward to the start of the next word.
   * Vim defines a "word" as a sequence of word chars OR a sequence of
   * the same non-word non-blank char. Blank chars separate words.
   *
   * Algorithm: skip the rest of the current token, skip blanks, land
   * on the start of the next token.
   */
  moveWordForward() {
    this.goalX = null;
    let ni = this.cursorNodeIndex;
    let ci = this.cursorCharIndex;

    const startClass = this.charClass(this.getCharAt(ni, ci));

    // 1) Skip rest of current token (same class)
    let pos = { ni, ci };
    while (pos) {
      const nextPos = this.nextCharPos(pos.ni, pos.ci);
      if (!nextPos) break; // at end of document
      const nextClass = this.charClass(this.getCharAt(nextPos.ni, nextPos.ci));
      if (nextClass !== startClass) break;
      pos = nextPos;
    }

    // 2) Skip blanks (whitespace)
    while (pos) {
      const nextPos = this.nextCharPos(pos.ni, pos.ci);
      if (!nextPos) break;
      const nextClass = this.charClass(this.getCharAt(nextPos.ni, nextPos.ci));
      if (nextClass !== 'blank') break;
      pos = nextPos;
    }

    // 3) We're now past blanks — but we may need to skip to the actual next position
    //    if pos didn't advance from step 1 (e.g., we were already at the last char of
    //    the current token and the next char is a different token)
    const finalPos = this.nextCharPos(pos.ni, pos.ci);
    if (finalPos) {
      // Check if we moved at all from start
      let checkPos = { ni: this.cursorNodeIndex, ci: this.cursorCharIndex };
      let advanced = false;
      while (checkPos) {
        if (checkPos.ni === finalPos.ni && checkPos.ci === finalPos.ci) { advanced = true; break; }
        const np = this.nextCharPos(checkPos.ni, checkPos.ci);
        if (!np || (np.ni === checkPos.ni && np.ci === checkPos.ci)) break;
        checkPos = np;
        if (checkPos.ni > finalPos.ni || (checkPos.ni === finalPos.ni && checkPos.ci >= finalPos.ci)) break;
      }
      // If we're landing on blank, keep going forward until non-blank
      let landingPos = finalPos;
      while (landingPos) {
        const cls = this.charClass(this.getCharAt(landingPos.ni, landingPos.ci));
        if (cls !== 'blank') break;
        landingPos = this.nextCharPos(landingPos.ni, landingPos.ci);
      }
      if (landingPos) {
        this.cursorNodeIndex = landingPos.ni;
        this.cursorCharIndex = landingPos.ci;
      }
    }

    this.clampPosition();
    this.updateCursor();
  }

  /**
   * e — Move forward to the end of the current/next word.
   *
   * Algorithm: advance one position, skip blanks, then skip same-class chars.
   * Land on the last char of that token.
   */
  moveWordEnd() {
    this.goalX = null;
    let ni = this.cursorNodeIndex;
    let ci = this.cursorCharIndex;

    // 1) Move forward one position
    let pos = this.nextCharPos(ni, ci);
    if (!pos) {
      this.clampPosition();
      this.updateCursor();
      return;
    }

    // 2) Skip blanks
    while (pos) {
      const cls = this.charClass(this.getCharAt(pos.ni, pos.ci));
      if (cls !== 'blank') break;
      pos = this.nextCharPos(pos.ni, pos.ci);
    }
    if (!pos) {
      this.clampPosition();
      this.updateCursor();
      return;
    }

    // 3) Skip same-class chars (to the end of this token)
    const tokenClass = this.charClass(this.getCharAt(pos.ni, pos.ci));
    while (pos) {
      const nextPos = this.nextCharPos(pos.ni, pos.ci);
      if (!nextPos) break; // at end of document — we're already at end of token
      const nextClass = this.charClass(this.getCharAt(nextPos.ni, nextPos.ci));
      if (nextClass !== tokenClass) break;
      pos = nextPos;
    }

    this.cursorNodeIndex = pos.ni;
    this.cursorCharIndex = pos.ci;
    this.clampPosition();
    this.updateCursor();
  }

  /**
   * b — Move backward to the start of the current/previous word.
   *
   * Algorithm: move back one position, skip blanks backward, then
   * skip same-class chars backward. Land on the first char of that token.
   */
  moveWordBackward() {
    this.goalX = null;
    let ni = this.cursorNodeIndex;
    let ci = this.cursorCharIndex;

    // 1) Move back one position
    let pos = this.prevCharPos(ni, ci);
    if (!pos) {
      this.clampPosition();
      this.updateCursor();
      return;
    }

    // 2) Skip blanks backward
    while (pos) {
      const cls = this.charClass(this.getCharAt(pos.ni, pos.ci));
      if (cls !== 'blank') break;
      const prev = this.prevCharPos(pos.ni, pos.ci);
      if (!prev) break;
      pos = prev;
    }

    // 3) Skip same-class chars backward (to the start of this token)
    const tokenClass = this.charClass(this.getCharAt(pos.ni, pos.ci));
    while (pos) {
      const prev = this.prevCharPos(pos.ni, pos.ci);
      if (!prev) break; // at start of document
      const prevClass = this.charClass(this.getCharAt(prev.ni, prev.ci));
      if (prevClass !== tokenClass) break;
      pos = prev;
    }

    this.cursorNodeIndex = pos.ni;
    this.cursorCharIndex = pos.ci;
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