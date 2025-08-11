import { motion } from "framer-motion";
import logoPath from "@assets/logo-2020_1754948553294.png";

interface SplashScreenProps {
  isVisible: boolean;
}

export function SplashScreen({ isVisible }: SplashScreenProps) {
  if (!isVisible) return null;

  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 0, -10],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <img 
          src={logoPath} 
          alt="2-1-1 Get Connected. Get Help." 
          className="w-80 h-auto max-w-[90vw] md:w-96"
        />
      </motion.div>

      {/* Loading Dots */}
      <motion.div 
        className="flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: "#005191" }}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            transition={{
              delay: 0.5 + index * 0.15,
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Optional loading text */}
      <motion.p
        className="mt-6 text-gray-600 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Loading resources...
      </motion.p>
    </motion.div>
  );
}