/*
 * Markdown Renderer base functionality.
 * This file provides the core Markdown rendering functionality.
 * 
 * In the <script> tag, the possible values for toc's headings option are "h2", "h2,h3", and "h2,h3,h4". If the data-toc-headings attribute is not specified at all, the default value is "h2".
 * 
 * Example:
 * <script src="/js/markdown-renderer-base.js"
 *         data-markdown="???.md"
 *         data-toc-headings="h2,h3,h4"></script>
 * 
 */
let tocHeadings = "h2";
async function loadMarkdown() {
    const script = document.querySelector(
        'script[src="/js/markdown-renderer-base.js"]'
    );

    const markdownFile = script.dataset.markdown;
    tocHeadings = script.dataset.tocHeadings ?? tocHeadings;

    const response = await fetch(markdownFile);

    if (!response.ok) {
        throw new Error(`Failed to load Markdown: ${response.status}`);
    }

    return await response.text();
}

function escapeHtml(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function highlightHtml(source) {
    let text = escapeHtml(source);

    text = text.replace(
        /&lt;(\/?)([A-Za-z][A-Za-z0-9:-]*)([\s\S]*?)&gt;/g,
        (match, slash, tagName, attributes) => {

            // Attribute name / value
            const styledAttributes = attributes.replace(
                /([A-Za-z_:][A-Za-z0-9_.:-]*)(\s*=\s*)(".*?"|'.*?'|[^\s]+)/g,
                (_, name, equals, value) =>
                    `<span class="html-attribute">${name}</span>` +
                    equals +
                    `<span class="html-string">${value}</span>`
            );

            return (
                `&lt;${slash}<span class="html-tag">${tagName}</span>` +
                styledAttributes +
                `&gt;`
            );
        }
    );

    return text;
}

function highlightCSharp(source) {
    const escaped = escapeHtml(source);
    const tokens = [];

    const protect = (value, className) => {
        const index = tokens.length;
        tokens.push(`<span class="${className}">${value}</span>`);
        return `\u0000${index}\u0000`;
    };

    let text = escaped;

    // Comments
    text = text.replace(
        /\/\/[^\n]*/g,
        match => protect(match, "csharp-comment")
    );

    // Strings
    text = text.replace(
        /"(?:\\.|[^"\\])*"/g,
        match => protect(match, "csharp-string")
    );

    // Character literals
    text = text.replace(
        /'(?:\\.|[^'\\])*'/g,
        match => protect(match, "csharp-string")
    );

    // Attributes
    text = text.replace(
        /\[[A-Za-z_][A-Za-z0-9_.]*\]/g,
        match => protect(match, "csharp-attribute")
    );

    // Namespaces in using directives
    text = text.replace(
        /\busing\s+((?:[A-Za-z_][A-Za-z0-9_]*\.)*[A-Za-z_][A-Za-z0-9_]*)/g,
        (match, namespaceName) =>
            match.replace(
                namespaceName,
                protect(namespaceName, "csharp-namespace")
            )
    );

    // Class names
    text = text.replace(
        /\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\b/g,
        (match, name) =>
            `class ${protect(name, "csharp-class")}`
    );

    // Method names
    text = text.replace(
        /\b([A-Za-z_][A-Za-z0-9_]*)\s*(?=\()/g,
        (match, name) => {
            const excluded = new Set([
                "if", "for", "foreach", "while", "switch", "catch",
                "using", "typeof", "nameof"
            ]);

            if (excluded.has(name)) {
                return match;
            }

            //return protect(name, "code-method") + match.slice(name.length);
            return protect(
                name,
                name === "View" ? "csharp-call" : "csharp-method"
            ) + match.slice(name.length);
        }
    );

    // Keywords
    text = text.replace(
        /\b(?:using|namespace|public|private|protected|internal|class|sealed|static|void|return|new|if|else|for|foreach|while|async|await|var|const|readonly|this|true|false|null)\b/g,
        match => `<span class="csharp-keyword">${match}</span>`
    );

    // Common C# types
    text = text.replace(
        /\b(?:string|int|long|short|byte|bool|decimal|double|float|object|Task|ActionResult|Controller)\b/g,
        match => `<span class="csharp-type">${match}</span>`
    );

    // Restore protected tokens
    text = text.replace(
        /\u0000(\d+)\u0000/g,
        (_, index) => tokens[Number(index)]
    );

    return text;
}

/* Updated to ensure &nbsp; is rendered correctly on the screen. */
function inline(s) {
  s = s.replace(/&nbsp;/g, "\u0001");
  s = escapeHtml(s);

  s = s.replace(/`([^`]+)`/g, (_, code) => {
      const styledCode = code.replace(
          /\b(?:http|https|ftp|ftps):\/\/[^\s<]+/gi,
          '$&'
      );

      return `<code>${styledCode}</code>`;
  });

  s = s.replace(/&lt;(https?:\/\/[^&\s]+)&gt;/g,'<a href="$1">$1</a>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
  s = s.replace(/__([^_]+)__/g,"<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g,"<em>$1</em>");

  s = s.replace(/\u0001/g, "&nbsp;");

  return s;
}

const copyIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<rect x="9" y="9" width="11" height="11" rx="2"></rect>' +
        '<path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"></path>' +
    '</svg>';

const copiedIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M5 12.5l4 4L19 7"></path>' +
    '</svg>';

function renderMarkdown(source) {
  const lines = source.replace(/\r\n/g,"\n").split("\n");
  const out = [];
  let i = 0, code = [], inCode = false, codeLanguage = "";
  let paragraph = [];
  let listItems = [];

  function flushParagraph() {
    if (paragraph.length) {
      out.push("<p>" + inline(paragraph.join(" ")) + "</p>");
      paragraph = [];
    }
  }

  function flushList() {
    if (listItems.length) {
      out.push("<ul>" + listItems.map(x => "<li>"+inline(x)+"</li>").join("") + "</ul>");
      listItems = [];
    }
  }

  while (i < lines.length) {
    const line = lines[i];

    const singleLineCode = line.match(/^\s*```(.+)```\s*$/);

    if (singleLineCode && !inCode) {
        flushParagraph();
        flushList();

        out.push(
            "<p><code>" +
            escapeHtml(singleLineCode[1]) +
            "</code></p>"
        );

        i++;
        continue;
    }

    const codeFence = line.match(/^\s*```(\w*)\s*$/);

    if (codeFence) {
      flushParagraph();
      flushList();

      if (!inCode) {
          inCode = true;
          code = [];
          codeLanguage = codeFence[1].toLowerCase();
      } else {
        let highlightedCode = code.join("\n");

        if (codeLanguage === "html" || codeLanguage === "cshtml") {
            highlightedCode = highlightHtml(highlightedCode);
        } else if (codeLanguage === "csharp") {
            highlightedCode = highlightCSharp(highlightedCode);
        }

        out.push(
            '<div class="md-code-block">' +
                '<button type="button" class="md-copy-button" aria-label="Copy code" title="Copy code">' +
                    copyIcon +
                '</button>' +
                `<pre><code class="language-${codeLanguage}">` +
                highlightedCode +
                "</code></pre>" +
            "</div>"
        );

        inCode = false;
        code = [];
      }

      i++;
      continue;
    }

    if (inCode) {
      code.push(line); i++; continue;
    }

    // Preserve raw HTML blocks used by the supplied KJVAMA MD.
    if (/^\s*<(div|table|thead|tbody|tr|th|td|button|section|aside|p|br|ul|ol|li|span)\b/i.test(line)) {
      flushParagraph(); flushList();
      const raw = [];
      const first = line.trim();
      raw.push(line);
      const tagMatch = first.match(/^<([a-z0-9-]+)/i);
      if (tagMatch) {
        const tag = tagMatch[1].toLowerCase();
        const isSelf = /\/>\s*$/.test(first);
        if (!isSelf && !new RegExp("</"+tag+">\\s*$","i").test(first)) {
          i++;
          while (i < lines.length) {
            raw.push(lines[i]);
            if (new RegExp("</"+tag+">\\s*$","i").test(lines[i].trim())) {
              break;
            }
            i++;
          }
        }
      }
      out.push(raw.join("\n"));
      i++; continue;
    }

    if (!line.trim()) {
      flushParagraph(); flushList(); i++; continue;
    }

    // MkDocs/Material-style admonition
    const admonition = line.match(/^\s*!!!\s+([\w-]+)(?:\s+(.+))?\s*$/);

    if (admonition) {
      flushParagraph();
      flushList();

      const type = admonition[1].toLowerCase();
      const title =
        admonition[2] ||
        type.charAt(0).toUpperCase() + type.slice(1);
      const icon = type === "tip" ? "🔥" : "✓";

      const body = [];
      i++;

      while (i < lines.length) {
        const current = lines[i];

        if (!current.trim()) {
          body.push("");
          i++;
          continue;
        }

        if (/^\s{4}/.test(current)) {
          body.push(current.replace(/^\s{4}/, ""));
          i++;
          continue;
        }

        break;
      }

      while (body.length && !body[body.length - 1].trim()) {
        body.pop();
      }

      out.push(
        `<div class="md-admonition md-admonition--${type}">` +
          `<div class="md-admonition__title">` +
            `<span class="md-admonition__icon" aria-hidden="true">${icon}</span>` +
            `<span>${inline(title)}</span>` +
          `</div>` +
          `<div class="md-admonition__body"><p>${inline(body.join(" "))}</p></div>` +
        `</div>`
      );

      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList();
      const level = heading[1].length;
      const text = inline(heading[2]);
      const id = heading[2].toLowerCase()
        .replace(/<[^>]+>/g,"")
        .replace(/[^a-z0-9]+/g,"-")
        .replace(/^-|-$/g,"");
      out.push(
        `<h${level} id="${id}">${text}` +
        `<a class="headerlink" href="#${id}" title="Permanent link">¶</a>` +
        `</h${level}>`
      );
      i++; continue;
    }

    const tableStart = line.trim().startsWith("|") &&
                       i + 1 < lines.length &&
                       /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(lines[i+1]);
    if (tableStart) {
      flushParagraph(); flushList();
      const rows = [];
      rows.push(line);
      rows.push(lines[i+1]);
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i]); i++;
      }

      const parseRow = row => row.trim().replace(/^\|/,"").replace(/\|$/,"").split("|").map(x=>x.trim());
      const header = parseRow(rows[0]);
      const body = rows.slice(2).map(parseRow);
      let table = '<table><thead><tr>' +
        header.map(c=>`<th>${inline(c)}</th>`).join("") +
        '</tr></thead><tbody>' +
        body.map(r=>"<tr>"+r.map(c=>`<td>${inline(c)}</td>`).join("")+"</tr>").join("") +
        '</tbody></table>';
      out.push(table);
      continue;
    }

    const list = line.match(/^\s*[-*]\s+(.+)$/);
    if (list) {
      flushParagraph();
      listItems.push(list[1]); i++; continue;
    }

    paragraph.push(line.trim());
    i++;
  }

  flushParagraph(); flushList();
  return out.join("\n");
}

const content = document.querySelector("#markdown-content");

async function initializeMarkdown() {
    try {
        const markdown = await loadMarkdown();

        content.innerHTML = renderMarkdown(markdown);

        // modal
        document.querySelectorAll("[data-modal-close]").forEach(el => {
          el.addEventListener("click", () => {
            const modal = document.querySelector("#fullTableModal");
            if (!modal) return;
            modal.hidden = true;
            document.body.classList.remove("modal-open");
          });
        });

        // toc
        document.addEventListener("keydown", event => {
          if (event.key === "Escape") {
            const modal = document.querySelector("#fullTableModal");
            if (modal && !modal.hidden) {
              modal.hidden = true;
              document.body.classList.remove("modal-open");
            }
          }
        });

        const headings = [...content.querySelectorAll(tocHeadings)];
        const toc = document.querySelector("#toc");

        toc.innerHTML = headings.map(h => {
          const label = h.cloneNode(true);
          const headerlink = label.querySelector(".headerlink");

          if (headerlink) {
            headerlink.remove();
          }

          return `<a href="#${h.id}" class="toc-level-${h.tagName.substring(1)}"
              data-target="${h.id}">${label.textContent.trim()}</a>`;
        }).join("");

        const tocLinks = [...toc.querySelectorAll("a")];

        function setActiveHeading(id) {
          tocLinks.forEach(link => {
            link.classList.toggle("is-active", link.dataset.target === id);
          });
        }

        // IntersectionObserver
        const headingObserver = new IntersectionObserver(
          entries => {
            const visibleHeadings = entries
              .filter(entry => entry.isIntersecting)
              .sort(
                (a, b) =>
                  a.boundingClientRect.top - b.boundingClientRect.top
              );

            if (visibleHeadings.length) {
              setActiveHeading(visibleHeadings[0].target.id);
            }
          },
          {
            root: null,
            rootMargin: "-80px 0px -65% 0px",
            threshold: 0
          }
        );

        headings.forEach(heading => {
          headingObserver.observe(heading);
        });

        tocLinks.forEach(link => {
          link.addEventListener("click", event => {
            event.preventDefault();

            setActiveHeading(link.dataset.target);

            const target = document.getElementById(link.dataset.target);
            if (!target) return;

            target.scrollIntoView({
              behavior: "auto",
              block: "start"
            });

            history.replaceState(null, "", `#${target.id}`);
          });
        });
    } catch (error) {
        console.error(error);
    }
}

initializeMarkdown();

function initializeCopyButtons() {
    document.addEventListener("click", async (event) => {
        const button = event.target.closest(".md-copy-button");

        if (!button) {
            return;
        }

        const codeBlock = button.closest(".md-code-block");
        const code = codeBlock?.querySelector("pre > code");

        if (!code) {
            return;
        }

        try {
            await navigator.clipboard.writeText(code.textContent);

            // Copied
            button.innerHTML = copiedIcon;
            button.setAttribute("aria-label", "Copied");
            button.setAttribute("title", "Copied");

            setTimeout(() => {
                button.innerHTML = copyIcon;
                button.setAttribute("aria-label", "Copy code");
                button.setAttribute("title", "Copy code");
            }, 1500);
        } catch {
            // Copy failed
            button.setAttribute("aria-label", "Copy failed");
            button.setAttribute("title", "Copy failed");

            setTimeout(() => {
                button.innerHTML = copyIcon;
                button.setAttribute("aria-label", "Copy code");
                button.setAttribute("title", "Copy code");
            }, 1500);

            setTimeout(() => {
                button.textContent = "Copy";
            }, 1500);
        }
    });
}

initializeCopyButtons();