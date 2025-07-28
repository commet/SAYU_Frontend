import {
  FileText,
  Search,
  Globe,
  Calendar,
  Bell,
} from "lucide-react";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
  {
    Icon: FileText,
    name: "Save your files",
    description: "We automatically save your files as you type.",
    href: "/",
    cta: "Learn more",
    background: (
      <img 
        src="https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=400&h=400&fit=crop" 
        alt="Files background"
        className="absolute -right-20 -top-20 opacity-60" 
      />
    ),
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: Search,
    name: "Full text search",
    description: "Search through all your files in one place.",
    href: "/",
    cta: "Learn more",
    background: (
      <img 
        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" 
        alt="Search background"
        className="absolute -right-20 -top-20 opacity-60" 
      />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: Globe,
    name: "Multilingual",
    description: "Supports 100+ languages and counting.",
    href: "/",
    cta: "Learn more",
    background: (
      <img 
        src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&h=400&fit=crop" 
        alt="Globe background"
        className="absolute -right-20 -top-20 opacity-60" 
      />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Calendar,
    name: "Calendar",
    description: "Use the calendar to filter your files by date.",
    href: "/",
    cta: "Learn more",
    background: (
      <img 
        src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=400&fit=crop" 
        alt="Calendar background"
        className="absolute -right-20 -top-20 opacity-60" 
      />
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Bell,
    name: "Notifications",
    description:
      "Get notified when someone shares a file or mentions you in a comment.",
    href: "/",
    cta: "Learn more",
    background: (
      <img 
        src="https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&h=400&fit=crop" 
        alt="Notifications background"
        className="absolute -right-20 -top-20 opacity-60" 
      />
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

function BentoDemo() {
  return (
    <BentoGrid className="lg:grid-rows-3">
      {features.map((feature) => (
        <BentoCard key={feature.name} {...feature} />
      ))}
    </BentoGrid>
  );
}

export { BentoDemo };