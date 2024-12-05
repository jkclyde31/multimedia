// import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import { BentoGrid, BentoGridItem } from "./components/bento-grid";
import { AiOutlineAudio, AiOutlineVideoCamera, AiOutlineCamera  } from "react-icons/ai";
import Image from "next/image";





const Skeleton = ({ image }) => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100">
    {image && (
      <Image 
        src={image}
        width={500}
        height={500}
        objectFit="cover" 
        className="max-h-[200px]"
        alt=""
      />
    )}
  </div>
);


const images = [
  { type: 'audio', path: "/images/audio.jpg" },
  { type: 'video', path: "/images/video.jpg" },
  { type: 'photo', path: "/images/photo.jpg" },
];

const items = [
  {
    title: "Audio",
    description: "Record and save audio for various purposes.",
    header: <Skeleton image={images[0].path} />,
    icon: <AiOutlineAudio className="h-6 w-6 text-neutral-500" />,
    link: "/audio"
  },
  

  {
    title: "Photos",
    description: "Record and save photos for various purposes.",
    header: <Skeleton image={images[2].path} />,
    icon: <AiOutlineCamera className="h-6 w-6 text-neutral-500" />,
     link: "/photo"
  },
  {
    title: "Videos",
    description: "Record and save videos for various purposes.",
    header: <Skeleton image={images[1].path} />,
    icon: <AiOutlineVideoCamera className="h-6 w-6 text-neutral-500" />,
     link: "/photo"
  },
  //  {
  //   title: "See Record List",
  //   description: "View the list of audio, photo, and video records.",
  //   header: <Skeleton  />,
  //   icon: <AiOutlineCamera className="h-6 w-6 text-neutral-500" />,
  //    link: "/recordings"
  // },

];


const page = () => {
  return (
      <BentoGrid className="max-w-5xl mx-auto p-3 md:p-20">
            {items.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                link={item.link}  
                className={[3].includes(i) ? "md:col-span-3" : ""} />      ))}
          </BentoGrid>
   
  )
}


export default page