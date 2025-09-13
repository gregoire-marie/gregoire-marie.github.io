async function loadJSON(path) {
  const response = await fetch(path);
  return response.json();
}

function renderAbout(data) {
  document.getElementById("about-title").textContent = data.title;
  document.getElementById("about-text").innerHTML = data.paragraphs
    .map(p => `<p>${p}</p>`)
    .join("");
}

function renderExperience(data) {
  const container = document.getElementById("experience-list");
  container.innerHTML = data.map(item => `
    <div class="experience-item">
      <div class="experience-date">${item.date}</div>
      <h3 class="experience-title">${item.title}</h3>
      <div class="experience-company">${item.company}</div>
      <p>${item.description}</p>
    </div>
  `).join("");
}

function renderEducation(data) {
  const container = document.getElementById("education-list");
  container.innerHTML = data.map(item => `
    <div class="experience-item">
      <div class="experience-date">${item.date}</div>
      <h3 class="experience-title">${item.title}</h3>
      <div class="experience-company">${item.institution}</div>
      <p>${item.description}</p>
    </div>
  `).join("");
}

function renderProjects(data) {
  const container = document.getElementById("projects-list");
  container.innerHTML = data.map(item => `
    <a href="${item.link}" class="project-card" target="_blank" rel="noopener noreferrer">
      <div class="project-link-icon">🔗</div>
      <h3 class="project-title">${item.title}</h3>
      <p class="project-description">${item.description}</p>
      <div class="tech-tags">
        ${item.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join("")}
      </div>
    </a>
  `).join("");
}

function renderPublications(data) {
  const container = document.getElementById("publications-list");
  container.innerHTML = data.map(item => `
    <div class="publication-item">
      <h3 class="publication-title">${item.title}</h3>
      <p class="publication-authors">${item.authors}</p>
      <p class="publication-venue">${item.venue}</p>
    </div>
  `).join("");
}

(async function init() {
  renderAbout(await loadJSON("data/about.json"));
  renderExperience(await loadJSON("data/experience.json"));
  renderEducation(await loadJSON("data/education.json"));
  renderProjects(await loadJSON("data/projects.json"));
  renderPublications(await loadJSON("data/publications.json"));
})();
