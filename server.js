const express = require("express");
const session = require("express-session");
const {
  initializeDatabase,
  listSites,
  findSiteByDomain,
  createSite,
  deleteSite,
} = require("./db");
const {
  renderAdminPage,
  renderForbiddenPage,
  renderLoginPage,
  renderSitePage,
  renderSiteNotFoundPage,
} = require("./templates");

const app = express();
const port = Number(process.env.PORT) || 3000;
const allowedDomains = ["yourdomain.com", "localhost"];
const adminUser = {
  username: "admin",
  password: "strongpassword123",
};

initializeDatabase();

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-this-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  }),
);

function normalizeDomain(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getRequestDomain(req) {
  const host = String(req.headers.host || "");
  return normalizeDomain(host.split(":")[0]);
}

function isAllowedDomain(domain) {
  return allowedDomains.includes(domain);
}

function requireAllowedDomain(req, res, next) {
  const domain = getRequestDomain(req);

  if (!isAllowedDomain(domain)) {
    res.status(403).send(renderForbiddenPage(domain));
    return;
  }

  next();
}

function requireLogin(req, res, next) {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }

  next();
}

app.use(requireAllowedDomain);

app.get("/login", (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect("/admin");
    return;
  }

  const error = req.query.error ? String(req.query.error) : "";
  res.send(renderLoginPage(error));
});

app.post("/login", (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (username === adminUser.username && password === adminUser.password) {
    req.session.isLoggedIn = true;
    res.redirect("/admin");
    return;
  }

  res.redirect("/login?error=Invalid username or password.");
});

app.post("/logout", requireLogin, (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.get("/admin", requireLogin, (req, res) => {
  const sites = listSites();
  const message = req.query.message ? String(req.query.message) : "";
  const error = req.query.error ? String(req.query.error) : "";

  res.send(renderAdminPage({ sites, message, error }));
});

app.post("/admin/sites", requireLogin, (req, res) => {
  const domain = normalizeDomain(req.body.domain);
  const title = String(req.body.title || "").trim();
  const description = String(req.body.description || "").trim();
  const primaryColor = String(req.body.primaryColor || "").trim();

  if (!domain || !title || !description || !primaryColor) {
    res.redirect("/admin?error=Please fill in every field.");
    return;
  }

  try {
    createSite({ domain, title, description, primaryColor });
    res.redirect("/admin?message=Site created successfully.");
  } catch (error) {
    const message =
      error && typeof error.message === "string" && error.message.includes("UNIQUE")
        ? "That domain already exists."
        : "Unable to create site.";

    res.redirect(`/admin?error=${encodeURIComponent(message)}`);
  }
});

app.post("/admin/sites/:id/delete", requireLogin, (req, res) => {
  deleteSite(req.params.id);
  res.redirect("/admin?message=Site deleted successfully.");
});

app.get("*", (req, res) => {
  const domain = getRequestDomain(req);
  const site = findSiteByDomain(domain);

  if (!site) {
    res.status(404).send(renderSiteNotFoundPage(domain));
    return;
  }

  res.send(renderSitePage(site));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
