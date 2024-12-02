'use client'

import { AuroraBackground } from "./aurora-background"
import { motion } from "framer-motion"


const BgProvider = ({children}) => {
  return (
    <AuroraBackground>
         <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="z-0"
        >
          {children}

          </motion.div>
    </AuroraBackground>
    
  )
}

export default BgProvider