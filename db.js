const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const dataDirectory = path.join(__dirname, "data");
const databasePath = path.join(dataDirectory, "sites.db");

fs.mkdirSync(dataDirectory, { recursive: true });

const db = new Database(databasePath);

function initializeDatabase() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      primaryColor TEXT NOT NULL
    )
  `).run();
}

function listSites() {
  return db.prepare("SELECT * FROM sites ORDER BY id DESC").all();
}

function findSiteByDomain(domain) {
  return db.prepare("SELECT * FROM sites WHERE domain = ?").get(domain);
}

function createSite({ domain, title, description, primaryColor }) {
  return db
    .prepare(
      "INSERT INTO sites (domain, title, description, primaryColor) VALUES (?, ?, ?, ?)",
    )
    .run(domain, title, description, primaryColor);
}

function deleteSite(id) {
  return db.prepare("DELETE FROM sites WHERE id = ?").run(id);
}

module.exports = {
  initializeDatabase,
  listSites,
  findSiteByDomain,
  createSite,
  deleteSite,
};
