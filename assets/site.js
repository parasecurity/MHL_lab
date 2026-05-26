const dataLoaders = {
  "members": renderMembers,
  "available-theses": () => renderTheses("available-theses-list", "data/available-theses.json", false),
  "ongoing-theses": () => renderTheses("ongoing-theses-list", "data/ongoing-theses.json", true),
  "publications": renderPublications,
  "equipment": renderEquipment
};

document.addEventListener("DOMContentLoaded", () => {
  markCurrentPage();
  setupNavigation();

  const page = document.body.dataset.page;
  if (page && dataLoaders[page]) {
    dataLoaders[page]();
  }
});

function markCurrentPage() {
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a").forEach((link) => {
    if (link.getAttribute("href") === current) {
      link.setAttribute("aria-current", "page");
    }
  });
}

function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function linkOrText(label, href) {
  if (!href) return "";
  const safeHref = escapeHtml(href);
  return `<a href="${safeHref}">${escapeHtml(label)}</a>`;
}

function renderTags(items = []) {
  if (!items.length) return "";
  return `<div class="tag-list">${items.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}</div>`;
}

async function renderMembers() {
  const target = document.querySelector("#members-list");
  try {
    const data = await fetchJson("data/members.json");
    const groups = Array.isArray(data) && data[0] && data[0].members
      ? data
      : [{ category: "Lab Members", members: data }];

    target.innerHTML = groups.map((group) => `
      <section class="member-group">
        <div class="member-group-heading">
          <h2>${escapeHtml(group.category)}</h2>
          <span>${escapeHtml(group.members.length)} ${group.members.length === 1 ? "member" : "members"}</span>
        </div>
        ${group.members.length ? `
          <div class="card-grid">
            ${group.members.map(renderMemberCard).join("")}
          </div>
        ` : `<p class="notice">No members listed yet.</p>`}
      </section>
    `).join("");
  } catch (error) {
    target.innerHTML = `<p class="notice">${escapeHtml(error.message)}</p>`;
  }
}

function renderMemberCard(member) {
  return `
      <article class="card">
        <h2>${escapeHtml(member.name)}</h2>
        <p class="role">${escapeHtml(member.role)}</p>
        <div class="contact">
          ${member.email ? `<span>Email: <a href="mailto:${escapeHtml(member.email)}">${escapeHtml(member.email)}</a></span>` : ""}
          ${member.phone ? `<span>Phone: ${escapeHtml(member.phone)}</span>` : ""}
          ${member.office ? `<span>Office: ${escapeHtml(member.office)}</span>` : ""}
          ${member.website ? `<span>Website: ${linkOrText(member.website, member.website)}</span>` : ""}
        </div>
        <p>${escapeHtml(member.cv)}</p>
        ${renderTags(member.researchInterests)}
      </article>
    `;
}

async function renderTheses(targetId, path, includeStudent) {
  const target = document.querySelector(`#${targetId}`);
  try {
    const theses = await fetchJson(path);
    target.innerHTML = theses.map((thesis) => `
      <article class="thesis">
        <div class="record-header">
          <div>
            <h2>${escapeHtml(thesis.title)}</h2>
            <p class="meta">${escapeHtml(thesis.area || "Diploma thesis")}</p>
          </div>
          ${thesis.status ? `<span class="status">${escapeHtml(thesis.status)}</span>` : ""}
        </div>
        <p>${escapeHtml(thesis.description || thesis.summary)}</p>
        ${includeStudent && thesis.student ? `<p><strong>Student:</strong> ${escapeHtml(thesis.student)}</p>` : ""}
        <p><strong>Supervisor:</strong> ${escapeHtml(thesis.supervisor.name)}${thesis.supervisor.email ? `, <a href="mailto:${escapeHtml(thesis.supervisor.email)}">${escapeHtml(thesis.supervisor.email)}</a>` : ""}${thesis.supervisor.office ? `, ${escapeHtml(thesis.supervisor.office)}` : ""}</p>
        ${renderTags(thesis.keywords)}
      </article>
    `).join("");
  } catch (error) {
    target.innerHTML = `<p class="notice">${escapeHtml(error.message)}</p>`;
  }
}

async function renderEquipment() {
  const target = document.querySelector("#equipment-list");
  try {
    const data = await fetchJson("data/equipment.json");
    const groups = Array.isArray(data) && data[0] && data[0].items
      ? data
      : [{ category: "Available Equipment", items: data }];

    target.innerHTML = groups.map((group) => `
      <section class="content-group equipment-group">
        <div class="content-group-heading">
          <h2>${escapeHtml(group.category)}</h2>
          <span>${escapeHtml(group.items.length)} ${group.items.length === 1 ? "item" : "items"}</span>
        </div>
        ${group.items.length ? `
          <div class="card-grid">
            ${group.items.map(renderEquipmentCard).join("")}
          </div>
        ` : `<p class="notice">No equipment listed yet.</p>`}
      </section>
    `).join("");
  } catch (error) {
    target.innerHTML = `<p class="notice">${escapeHtml(error.message)}</p>`;
  }
}

function renderEquipmentCard(item) {
  const features = item.features || item.capabilities || [];
  return `
      <article class="card">
        <h2>${escapeHtml(item.name)}</h2>
        <p class="role">${escapeHtml(item.type || item.category)}</p>
        <p>${escapeHtml(item.description)}</p>
        ${item.location ? `<p class="meta"><strong>Location:</strong> ${escapeHtml(item.location)}</p>` : ""}
        ${renderFeatures(features)}
      </article>
    `;
}

function renderFeatures(features = []) {
  if (!features.length) return "";
  return `
    <ul class="feature-list">
      ${features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
    </ul>
  `;
}

async function renderPublications() {
  const target = document.querySelector("#publications-list");
  try {
    const [bibResponse, extra] = await Promise.all([
      fetch("data/publications.bib"),
      fetchJson("data/publications-extra.json")
    ]);
    if (!bibResponse.ok) throw new Error("Could not load data/publications.bib");
    const publications = parseBibtex(await bibResponse.text());

    target.innerHTML = renderPublicationCategory("Journal Papers", publications, extra, isJournalPublication)
      + renderPublicationCategory("Conference Papers", publications, extra, isConferencePublication);
  } catch (error) {
    target.innerHTML = `<p class="notice">${escapeHtml(error.message)}</p>`;
  }
}

function renderPublicationCategory(title, publications, extra, predicate) {
  const categoryPublications = publications.filter(predicate);
  const yearGroups = groupPublicationsByYear(categoryPublications);

  return `
    <section class="content-group publication-group">
      <div class="content-group-heading">
        <h2>${escapeHtml(title)}</h2>
        <span>${escapeHtml(categoryPublications.length)} ${categoryPublications.length === 1 ? "paper" : "papers"}</span>
      </div>
      ${yearGroups.length ? yearGroups.map(([year, yearPublications]) => `
        <section class="publication-year-group">
          <h3>${escapeHtml(year)}</h3>
          <div class="stack">
            ${yearPublications.map((publication) => renderPublicationCard(publication, extra[publication.key] || {})).join("")}
          </div>
        </section>
      `).join("") : `<p class="notice">No papers listed yet.</p>`}
    </section>
  `;
}

function renderPublicationCard(publication, details) {
  const authors = formatAuthors(publication.fields.author);
  const venue = publication.fields.journal || publication.fields.booktitle || publication.fields.publisher || "";
  const year = publication.fields.year || "";
  const abstract = details.abstract || publication.fields.abstract || "";

  return `
    <article class="publication">
      <h2>${escapeHtml(publication.fields.title || publication.key)}</h2>
      ${authors ? `<p class="publication-authors">${escapeHtml(authors)}</p>` : ""}
      ${venue || year ? `<p class="publication-details"><em>${escapeHtml([venue, year].filter(Boolean).join(", "))}</em></p>` : ""}
      ${abstract ? `<p>${escapeHtml(abstract)}</p>` : ""}
      <div class="link-row">
        ${details.pdf ? `<a href="${escapeHtml(details.pdf)}">Download PDF</a>` : ""}
        ${details.publisher ? `<a href="${escapeHtml(details.publisher)}">Publisher</a>` : ""}
        ${publication.fields.doi ? `<a href="https://doi.org/${escapeHtml(publication.fields.doi)}">DOI</a>` : ""}
      </div>
    </article>
  `;
}

function groupPublicationsByYear(publications) {
  const grouped = publications.reduce((groups, publication) => {
    const year = publication.fields.year || "Without year";
    if (!groups[year]) groups[year] = [];
    groups[year].push(publication);
    return groups;
  }, {});

  return Object.entries(grouped).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA));
}

function isJournalPublication(publication) {
  return publication.type === "article" || Boolean(publication.fields.journal);
}

function isConferencePublication(publication) {
  return ["inproceedings", "conference", "proceedings"].includes(publication.type) || Boolean(publication.fields.booktitle);
}

function parseBibtex(source) {
  const entries = [];
  let index = 0;

  while (index < source.length) {
    const at = source.indexOf("@", index);
    if (at === -1) break;
    const brace = source.indexOf("{", at);
    if (brace === -1) break;

    const type = source.slice(at + 1, brace).trim().toLowerCase().replace(/^@+/, "");
    let depth = 1;
    let cursor = brace + 1;
    while (cursor < source.length && depth > 0) {
      if (source[cursor] === "{") depth += 1;
      if (source[cursor] === "}") depth -= 1;
      cursor += 1;
    }

    const body = source.slice(brace + 1, cursor - 1);
    const comma = body.indexOf(",");
    if (comma > -1) {
      const key = body.slice(0, comma).trim();
      const fields = parseBibtexFields(body.slice(comma + 1));
      entries.push({ type, key, fields });
    }
    index = cursor;
  }

  return entries.sort((a, b) => Number(b.fields.year || 0) - Number(a.fields.year || 0));
}

function parseBibtexFields(body) {
  const fields = {};
  let index = 0;

  while (index < body.length) {
    while (body[index] && /[\s,]/.test(body[index])) index += 1;
    const equals = body.indexOf("=", index);
    if (equals === -1) break;

    const name = body.slice(index, equals).trim().toLowerCase();
    index = equals + 1;
    while (body[index] && /\s/.test(body[index])) index += 1;

    let value = "";
    if (body[index] === "{") {
      const result = readBalanced(body, index, "{", "}");
      value = result.value;
      index = result.next;
    } else if (body[index] === '"') {
      const result = readBalanced(body, index, '"', '"');
      value = result.value;
      index = result.next;
    } else {
      const comma = body.indexOf(",", index);
      value = body.slice(index, comma === -1 ? body.length : comma).trim();
      index = comma === -1 ? body.length : comma + 1;
    }
    fields[name] = cleanBibtexValue(value);
  }

  return fields;
}

function readBalanced(source, start, open, close) {
  let depth = 0;
  let value = "";
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === open) {
      if (depth > 0 || open === close) value += char;
      depth += 1;
      if (open === close && depth === 2) return { value: value.slice(0, -1), next: index + 1 };
      continue;
    }
    if (char === close) {
      depth -= 1;
      if (depth === 0) return { value, next: index + 1 };
    }
    value += char;
  }
  return { value, next: source.length };
}

function cleanBibtexValue(value) {
  return value
    .replace(/[{}]/g, "")
    .replaceAll("\\&", "&")
    .replaceAll("---", "-")
    .replaceAll("--", "-")
    .trim();
}

function formatAuthors(authorField = "") {
  return authorField
    .split(/\s+and\s+/i)
    .map((name) => {
      const parts = name.split(",").map((part) => part.trim());
      return parts.length === 2 ? `${parts[1]} ${parts[0]}` : name.trim();
    })
    .join(", ");
}
