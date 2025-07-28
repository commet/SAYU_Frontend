import { Carousel, TestimonialCard } from "@/components/ui/retro-testimonial"
import { iTestimonial } from "@/components/ui/retro-testimonial"

const testimonials: iTestimonial[] = [
  {
    name: "Sarah Chen",
    designation: "Creative Director at Studio Muse",
    description: "This platform has completely transformed how I discover and connect with art. The personality-based recommendations are incredibly accurate, introducing me to artists I never would have found otherwise.",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Marcus Thompson",
    designation: "Gallery Owner & Curator",
    description: "As someone who's been in the art world for decades, I'm impressed by how this platform bridges the gap between traditional gallery experiences and digital discovery. It's revolutionizing how we think about art curation.",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Yuki Tanaka",
    designation: "Digital Artist & Illustrator",
    description: "The way this platform understands and matches artistic sensibilities is remarkable. It's not just about what's popular - it's about finding art that truly resonates with your inner self.",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Elena Rodriguez",
    designation: "Art Collector & Enthusiast",
    description: "I've discovered more meaningful art in the past month using this platform than in years of traditional gallery visits. The emotional connection it creates between viewer and artwork is unparalleled.",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "David Kim",
    designation: "Museum Education Director",
    description: "This platform is doing something truly innovative - making art accessible and personally meaningful to everyone, regardless of their background in art history. It's democratizing art appreciation in the best way possible.",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
  },
]

export function RetroTestimonialDemo() {
  const cards = testimonials.map((testimonial, index) => (
    <TestimonialCard
      key={index}
      testimonial={testimonial}
      index={index}
      layout={true}
    />
  ))

  return (
    <div className="w-full min-h-screen bg-[#faf9f5] py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-thin text-[rgba(31,27,29,0.8)] text-center mb-4 font-serif">
          What Our Community Says
        </h2>
        <p className="text-lg text-[rgba(31,27,29,0.6)] text-center mb-10 italic">
          Discover how art lovers are transforming their creative journey
        </p>
        <Carousel items={cards} />
      </div>
    </div>
  )
}