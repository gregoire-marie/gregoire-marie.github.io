const GITHUB_USERNAME = "gregoire-marie";
const PROJECTS_VISIBLE_COUNT = 6;
const EXCLUDED_PROJECT_REPOS = new Set([
  "gregoire-marie.github.io",
  "wage-plotter",
  "Merlion",
  "n2d",
  "timeseries-clustering-vrae"
]);

let currentProjects = [];
let projectsExpanded = false;

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

async function loadGitHubProfile() {
  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
  if (!response.ok) {
    throw new Error("Failed to load GitHub profile");
  }
  return response.json();
}

async function loadGitHubRepos() {
  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
  if (!response.ok) {
    throw new Error("Failed to load GitHub repositories");
  }
  return response.json();
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMonthYear(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
}

function formatProjectTitle(repoName = "") {
  return repoName
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((segment) => {
      if (segment.length <= 3) {
        return segment.toUpperCase();
      }
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join(" ");
}

function renderAbout(data) {
  document.getElementById("about-title").textContent = data.title;
  document.getElementById("about-text").innerHTML = data.paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function renderTimeline(containerId, items, companyKey) {
  const container = document.getElementById(containerId);
  container.innerHTML = items.map((item) => `
    <div class="experience-item">
      <div class="experience-date">${escapeHtml(item.date)}</div>
      <h3 class="experience-title">${escapeHtml(item.title)}</h3>
      <div class="experience-company">${escapeHtml(item[companyKey])}</div>
      <p>${escapeHtml(item.description)}</p>
    </div>
  `).join("");
}

function inferRepoTags(repo) {
  const tags = [];
  if (repo.language) {
    tags.push(repo.language);
  }
  if (Array.isArray(repo.topics)) {
    repo.topics.forEach((topic) => tags.push(topic.replace(/-/g, " ")));
  }
  return [...new Set(tags)].slice(0, 6);
}

function sortProjects(projects) {
  return [...projects].sort((left, right) => {
    const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : -1;
    const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : -1;
    return rightTime - leftTime;
  });
}

function buildProjectFromRepo(repo, override = {}) {
  return {
    ...override,
    repo: repo.name,
    title: override.title || formatProjectTitle(repo.name),
    link: repo.html_url,
    description: override.description || repo.description || "Open source project.",
    tags: override.tags?.length ? override.tags : inferRepoTags(repo),
    updatedAt: repo.updated_at,
    sourcePath: repo.full_name
  };
}

function buildProjects(fallbackProjects, repos) {
  const overrides = new Map(
    fallbackProjects
      .filter((project) => project.repo)
      .map((project) => [project.repo, project])
  );

  const liveProjects = repos
    .filter((repo) => !EXCLUDED_PROJECT_REPOS.has(repo.name))
    .map((repo) => buildProjectFromRepo(repo, overrides.get(repo.name)));

  const knownRepos = new Set(liveProjects.map((project) => project.repo));
  const remainingProjects = fallbackProjects.filter(
    (project) => !project.repo || (!EXCLUDED_PROJECT_REPOS.has(project.repo) && !knownRepos.has(project.repo))
  );

  return sortProjects([...liveProjects, ...remainingProjects]);
}

function updateProjectsToggle() {
  const toggleButton = document.getElementById("projects-toggle");
  if (!toggleButton) {
    return;
  }

  const hasOverflow = currentProjects.length > PROJECTS_VISIBLE_COUNT;
  toggleButton.hidden = !hasOverflow;
  toggleButton.textContent = projectsExpanded ? "Less" : "More";
}

function renderProjects(data) {
  currentProjects = [...data];
  const container = document.getElementById("projects-list");
  const visibleProjects = projectsExpanded
    ? currentProjects
    : currentProjects.slice(0, PROJECTS_VISIBLE_COUNT);

  container.innerHTML = visibleProjects.map((item) => {
    const updatedLabel = item.updatedAt ? `Updated ${formatMonthYear(item.updatedAt)}` : "";
    const sourceLabel = item.sourcePath || item.link.replace(/^https?:\/\//, "");

    return `
      <a href="${escapeHtml(item.link)}" class="project-card" target="_blank" rel="noopener noreferrer">
        <div class="project-link-icon">↗</div>
        <div class="project-meta">
          <span class="project-source">${escapeHtml(sourceLabel)}</span>
          ${updatedLabel ? `<span class="project-updated">${escapeHtml(updatedLabel)}</span>` : ""}
        </div>
        <h3 class="project-title">${escapeHtml(item.title)}</h3>
        <p class="project-description">${escapeHtml(item.description)}</p>
        <div class="tech-tags">
          ${(item.tags || []).map((tag) => `<span class="tech-tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </a>
    `;
  }).join("");

  updateProjectsToggle();
}

function renderPublications(data) {
  const container = document.getElementById("publications-list");
  container.innerHTML = data.map((item) => `
    <div class="publication-item">
      <h3 class="publication-title">${escapeHtml(item.title)}</h3>
      <p class="publication-authors">${escapeHtml(item.authors)}</p>
      <p class="publication-venue">${escapeHtml(item.venue)}</p>
    </div>
  `).join("");
}

function applyGitHubProfile(profile) {
  const aboutImage = document.querySelector(".about-image");
  if (aboutImage && profile.avatar_url) {
    aboutImage.style.backgroundImage =
      `linear-gradient(rgba(13, 17, 23, 0.16), rgba(13, 17, 23, 0.16)), url('${profile.avatar_url}')`;
    aboutImage.classList.add("has-avatar");
  }
}

(async function init() {
  const footerYear = document.getElementById("footer-year");
  if (footerYear) {
    footerYear.textContent = String(new Date().getFullYear());
  }

  const [about, experience, education, projectsFallback, publications] = await Promise.all([
    loadJSON("data/about.json"),
    loadJSON("data/experience.json"),
    loadJSON("data/education.json"),
    loadJSON("data/projects.json"),
    loadJSON("data/publications.json")
  ]);

  const projectsToggle = document.getElementById("projects-toggle");
  if (projectsToggle) {
    projectsToggle.addEventListener("click", () => {
      projectsExpanded = !projectsExpanded;
      renderProjects(currentProjects);
    });
  }

  renderAbout(about);
  renderTimeline("experience-list", experience, "company");
  renderTimeline("education-list", education, "institution");
  renderProjects(sortProjects(projectsFallback));
  renderPublications(publications);

  try {
    const [profile, repos] = await Promise.all([loadGitHubProfile(), loadGitHubRepos()]);
    applyGitHubProfile(profile);
    renderProjects(buildProjects(projectsFallback, repos));
  } catch (error) {
    console.warn("Using bundled website data because GitHub could not be reached.", error);
  }
})();
