// ==========================================================
// EDIT THIS SECTION: your projects and skills
// ==========================================================
const projects = [
  {
    title: "Project one",
    description: "One or two sentences: what it does and who it is for.",
    tags: ["HTML", "CSS", "JavaScript"],
    repo: "https://github.com/ayomideisiaka1/project-one",
    demo: ""                       // leave empty if there is no live demo
  },
  {
    title: "Project two",
    description: "Describe the problem you solved and what you learned.",
    tags: ["Python"],
    repo: "https://github.com/ayomideisiaka1/project-two",
    demo: ""
  },
  {
    title: "Project three",
    description: "Add as many projects as you like. Copy one block and edit it.",
    tags: ["Teamwork", "Design"],
    repo: "",
    demo: "https://example.com"
  }
];

const skills = ["HTML", "CSS", "JavaScript", "Git and GitHub", "Communication", "Problem solving"];

// ==========================================================
// Rendering code (you do not need to change anything below)
// ==========================================================
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  children.forEach(child => node.append(child));
  return node;
}

function renderProjects() {
  const list = document.getElementById("project-list");
  projects.forEach(p => {
    const tags = el("ul", { className: "tags" }, p.tags.map(t => el("li", { textContent: t })));

    const links = el("div", { className: "project-links" });
    if (p.repo) links.append(el("a", { href: p.repo, textContent: "View code" }));
    if (p.demo) links.append(el("a", { href: p.demo, textContent: "Live demo" }));

    list.append(
      el("li", { className: "project" }, [
        el("h3", { textContent: p.title }),
        el("p", { textContent: p.description }),
        tags,
        links
      ])
    );
  });
}

function renderSkills() {
  const list = document.getElementById("skill-list");
  skills.forEach(s => list.append(el("li", { textContent: s })));
}

function setupThemeToggle() {
  const root = document.documentElement;
  const button = document.getElementById("theme-toggle");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) { /* storage unavailable */ }

  const apply = theme => {
    root.dataset.theme = theme;
    button.setAttribute("aria-pressed", String(theme === "dark"));
    button.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  };

  apply(saved || (prefersDark ? "dark" : "light"));

  button.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    apply(next);
    try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
  });
}

renderProjects();
renderSkills();
setupThemeToggle();
document.getElementById("year").textContent = new Date().getFullYear();
