function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderLayout({
  title,
  content,
  background = "#f6f1e8",
  extraHead = "",
  extraBody = "",
  bodyClass = "",
}) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: ${escapeHtml(background)};
        color: #1f2937;
      }

      .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      .card {
        background: rgba(255, 255, 255, 0.88);
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
      }

      h1, h2 {
        margin-top: 0;
      }

      .grid {
        display: grid;
        gap: 16px;
      }

      label {
        display: grid;
        gap: 8px;
        font-weight: 600;
      }

      input, textarea, button {
        font: inherit;
      }

      input, textarea {
        width: 100%;
        box-sizing: border-box;
        padding: 12px;
        border: 1px solid #d1d5db;
        border-radius: 10px;
      }

      input[type="color"] {
        padding: 4px;
        min-height: 48px;
      }

      button {
        border: 0;
        border-radius: 999px;
        padding: 12px 18px;
        cursor: pointer;
      }

      .button-primary {
        background: #111827;
        color: #ffffff;
      }

      .button-danger {
        background: #b91c1c;
        color: #ffffff;
      }

      .button-secondary {
        background: #ffffff;
        color: #111827;
        border: 1px solid #d1d5db;
      }

      .site-list {
        display: grid;
        gap: 16px;
        margin-top: 24px;
      }

      .site-row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
      }

      .small {
        color: #4b5563;
        font-size: 14px;
      }

      .message {
        margin-bottom: 20px;
        padding: 14px 16px;
        border-radius: 12px;
      }

      .message-success {
        background: #dcfce7;
        color: #166534;
      }

      .message-error {
        background: #fee2e2;
        color: #991b1b;
      }
    </style>
    ${extraHead}
  </head>
  <body class="${escapeHtml(bodyClass)}">
    <div class="container">
      ${content}
    </div>
    ${extraBody}
  </body>
</html>`;
}

function renderAdminPage({ sites, message, error }) {
  const feedback = message
    ? `<div class="message message-success">${escapeHtml(message)}</div>`
    : error
      ? `<div class="message message-error">${escapeHtml(error)}</div>`
      : "";

  const siteItems =
    sites.length === 0
      ? `<div class="card"><p>No sites yet. Create your first site below.</p></div>`
      : sites
          .map(
            (site) => `
              <div class="card">
                <div class="site-row">
                  <div>
                    <h2>${escapeHtml(site.title)}</h2>
                    <p><strong>Domain:</strong> ${escapeHtml(site.domain)}</p>
                    <p>${escapeHtml(site.description)}</p>
                    <p class="small"><strong>Color:</strong> ${escapeHtml(site.primaryColor)}</p>
                  </div>
                  <form method="POST" action="/admin/sites/${site.id}/delete">
                    <button class="button-danger" type="submit">Delete</button>
                  </form>
                </div>
              </div>
            `,
          )
          .join("");

  return renderLayout({
    title: "Admin Dashboard",
    content: `
      <div class="card">
        <div class="site-row">
          <div>
            <h1>Admin Dashboard</h1>
            <p class="small">Create and manage sites for different domains.</p>
          </div>
          <form method="POST" action="/logout">
            <button class="button-secondary" type="submit">Log Out</button>
          </form>
        </div>
        ${feedback}
        <form method="POST" action="/admin/sites" class="grid">
          <label>
            Domain
            <input name="domain" placeholder="example.com" required />
          </label>
          <label>
            Title
            <input name="title" placeholder="My Business" required />
          </label>
          <label>
            Description
            <textarea name="description" rows="4" placeholder="Describe this site" required></textarea>
          </label>
          <label>
            Primary Color
            <input type="color" name="primaryColor" value="#f59e0b" required />
          </label>
          <div>
            <button class="button-primary" type="submit">Create Site</button>
          </div>
        </form>
      </div>

      <div class="site-list">
        ${siteItems}
      </div>
    `,
  });
}

function renderSitePage(site) {
  return renderLayout({
    title: site.title,
    background: site.primaryColor,
    bodyClass: "site-theme",
    extraHead: `
      <style>
        body.site-theme {
          background: var(--page-background);
          color: var(--page-text);
          transition: background 0.2s ease, color 0.2s ease;
        }

        .site-theme .card {
          background: var(--card-background);
          color: var(--card-text);
          transition: background 0.2s ease, color 0.2s ease;
        }

        .theme-toggle-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 16px;
        }

        .theme-toggle {
          background: #ffffff;
          color: #111827;
          border: 1px solid #d1d5db;
        }

        .site-theme[data-theme="night"] .theme-toggle {
          background: #111111;
          color: #ffffff;
          border-color: #7f1d1d;
        }
      </style>
    `,
    extraBody: `
      <script>
        (function() {
          const lightTheme = {
            pageBackground: ${JSON.stringify(site.primaryColor)},
            pageText: "#0f172a",
            cardBackground: "rgba(255, 255, 255, 0.9)",
            cardText: "#0f172a"
          };

          const nightTheme = {
            pageBackground: "#000000",
            pageText: "#fca5a5",
            cardBackground: "rgba(127, 29, 29, 0.92)",
            cardText: "#fee2e2"
          };

          function applyTheme(themeName) {
            const theme = themeName === "night" ? nightTheme : lightTheme;
            document.body.dataset.theme = themeName;
            document.body.style.setProperty("--page-background", theme.pageBackground);
            document.body.style.setProperty("--page-text", theme.pageText);
            document.body.style.setProperty("--card-background", theme.cardBackground);
            document.body.style.setProperty("--card-text", theme.cardText);

            const button = document.getElementById("theme-toggle-button");
            if (button) {
              button.textContent = themeName === "night" ? "Switch to Light" : "Switch to Night";
            }
          }

          const savedTheme = localStorage.getItem("site-theme") || "light";
          applyTheme(savedTheme);

          const button = document.getElementById("theme-toggle-button");
          if (button) {
            button.addEventListener("click", function() {
              const nextTheme = document.body.dataset.theme === "night" ? "light" : "night";
              localStorage.setItem("site-theme", nextTheme);
              applyTheme(nextTheme);
            });
          }
        })();
      </script>
    `,
    content: `
      <div class="theme-toggle-row">
        <button id="theme-toggle-button" class="theme-toggle" type="button">Switch to Night</button>
      </div>
      <div class="card">
        <h1>${escapeHtml(site.title)}</h1>
        <p>${escapeHtml(site.description)}</p>
      </div>
    `,
  });
}

function renderSiteNotFoundPage(domain) {
  return renderLayout({
    title: "Site not found",
    content: `
      <div class="card">
        <h1>Site not found</h1>
        <p>No site matches the domain <strong>${escapeHtml(domain || "unknown")}</strong>.</p>
      </div>
    `,
  });
}

function renderLoginPage(error) {
  const feedback = error
    ? `<div class="message message-error">${escapeHtml(error)}</div>`
    : "";

  return renderLayout({
    title: "Login",
    content: `
      <div class="card">
        <h1>Owner Login</h1>
        <p class="small">Log in to access the private admin dashboard.</p>
        ${feedback}
        <form method="POST" action="/login" class="grid">
          <label>
            Username
            <input name="username" placeholder="admin" required />
          </label>
          <label>
            Password
            <input type="password" name="password" placeholder="Password" required />
          </label>
          <div>
            <button class="button-primary" type="submit">Log In</button>
          </div>
        </form>
      </div>
    `,
  });
}

function renderForbiddenPage(domain) {
  return renderLayout({
    title: "Forbidden",
    content: `
      <div class="card">
        <h1>403 Forbidden</h1>
        <p>This app is private. Access is blocked for <strong>${escapeHtml(domain || "unknown")}</strong>.</p>
      </div>
    `,
  });
}

module.exports = {
  renderAdminPage,
  renderForbiddenPage,
  renderLoginPage,
  renderSitePage,
  renderSiteNotFoundPage,
};
