import { Code, Film, Laptop, Youtube, Play, Layers, Database, Monitor, Figma, Globe } from "lucide-react";

const tools = [
  { name: "Python", icon: Code }, { name: "Linux", icon: Monitor },
  { name: "Scapy", icon: Layers }, { name: "Suricata", icon: Database },
  { name: "Wazuh", icon: Laptop }, { name: "Networking", icon: Globe },
  { name: "HTML / CSS", icon: Code }, { name: "Video editing", icon: Film },
];

export const Marquee = () => (
  <div className="group py-3 border-y border-border overflow-hidden">
    <div className="flex">
      <div className="animate-marquee whitespace-nowrap flex gap-8 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[...tools, ...tools].map((tool, i) => (
          <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 font-jetbrains text-sm text-muted-foreground transition-colors hover:text-primary">
            <tool.icon className="w-4 h-4" />
            {tool.name}
            <span className="ml-6 text-primary">✦</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
