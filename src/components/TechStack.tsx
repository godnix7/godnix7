const groups = [
  { title: "Languages", items: ["TypeScript", "Python", "SQL"] },
  { title: "Product", items: ["React", "Next.js", "Three.js", "Tailwind"] },
  { title: "Systems", items: ["Node.js", "FastAPI", "PostgreSQL", "Docker"] },
  { title: "Intelligence", items: ["PyTorch", "Computer vision", "LLM workflows"] },
];

export default function TechStack() {
  return (
    <section id="toolkit" className="toolkit-section section-wrap section-space">
      <div className="section-kicker"><span>01.5 / Toolkit</span><span className="kicker-rule" /></div>
      <div className="toolkit-layout">
        <div>
          <h2 className="section-heading">The right tool<br /><em>for the job.</em></h2>
          <p className="toolkit-note">A flexible toolkit, chosen around the problem rather than the trend.</p>
        </div>
        <div className="toolkit-list">
          {groups.map((group, index) => (
            <div className="toolkit-row" key={group.title}>
              <span className="toolkit-index">0{index + 1}</span>
              <span className="toolkit-category">{group.title}</span>
              <div className="toolkit-items">{group.items.map((item) => <span key={item}>{item}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
