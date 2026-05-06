"use client";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-[100] py-10 px-10 md:px-20 flex justify-between items-center pointer-events-none">
      <div className="pointer-events-auto group">
        <a href="#" className="text-sm font-bold tracking-[0.4em] text-[#121212] uppercase group-hover:text-blue-600 transition-colors">
          Nischay
        </a>
      </div>
      
      <div className="flex gap-16 pointer-events-auto">
        {[
          { label: "Vision", id: "perspective" },
          { label: "Arsenal", id: "stack" },
          { label: "Archive", id: "records" },
          { label: "Connect", id: "connect" }
        ].map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#888] hover:text-[#121212] transition-all hover:tracking-[0.5em]"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
