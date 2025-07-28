import InteractiveBentoGallery from "@/components/ui/interactive-bento-gallery"

const mediaItems = [
  {
    id: 1,
    type: "image",
    title: "Modern Art Gallery",
    desc: "Contemporary exhibition space",
    url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 2,
    type: "video",
    title: "Art Creation Process",
    desc: "Artist at work in studio",
    url: "https://cdn.pixabay.com/video/2023/10/22/185969-877009850_large.mp4",
    span: "md:col-span-2 md:row-span-2 col-span-1 sm:col-span-2 sm:row-span-2",
  },
  {
    id: 3,
    type: "image",
    title: "Abstract Painting",
    desc: "Vibrant color composition",
    url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
    span: "md:col-span-1 md:row-span-3 sm:col-span-2 sm:row-span-2 ",
  },
  {
    id: 4,
    type: "image",
    title: "Sculpture Garden",
    desc: "Outdoor art installation",
    url: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=600&fit=crop",
    span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 5,
    type: "video",
    title: "Digital Art Display",
    desc: "Interactive media installation",
    url: "https://cdn.pixabay.com/video/2024/02/04/199193_large.mp4",
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 6,
    type: "image",
    title: "Museum Interior",
    desc: "Classical exhibition hall",
    url: "https://images.unsplash.com/photo-1565060169194-19fabf2b5017?w=800&h=600&fit=crop",
    span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 7,
    type: "video",
    title: "Art Restoration",
    desc: "Preserving masterpieces",
    url: "https://cdn.pixabay.com/video/2023/08/06/174694-852447824_large.mp4",
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2 ",
  },
]

export function BentoGridGalleryDemo() {
  return (
    <div className="min-h-screen overflow-y-auto">
      <InteractiveBentoGallery
        mediaItems={mediaItems}
        title="SAYU Art Collection"
        description="Drag and explore our curated collection of artworks and exhibitions"
      />
    </div>
  )
}