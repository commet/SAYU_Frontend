import { Github, Twitter, Youtube, Flower } from 'lucide-react'
import { AnimatedDock } from "@/components/ui/animated-dock"

const Demo = () => {
    return (
        <>
            <AnimatedDock
                items={[
                    {
                        link: "https://github.com/preetsuthar17",
                        target: "_blank",
                        Icon: <Github size={22} />,
                    },
                    {
                        link: "https://x.com/preetsuthar17",
                        target: "_blank",
                        Icon: <Twitter size={22} />,
                    },
                    {
                        link: "https://www.youtube.com/@preetsuthar17",
                        target: "_blank",
                        Icon: <Youtube size={22} />,
                    },
                    {
                        link: "https://github.com/preetsuthar17/hextaui",
                        target: "_blank",
                        Icon: <Flower size={22} />,
                    },
                ]}
            />
        </>
    )
}

export {Demo}