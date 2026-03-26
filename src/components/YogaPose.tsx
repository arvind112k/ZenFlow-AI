import { motion } from 'motion/react';

interface YogaPoseProps {
  pose: string;
  isPlaying: boolean;
}

export default function YogaPose({ pose, isPlaying }: YogaPoseProps) {
  // We'll use a simplified SVG figure that animates between poses
  // In a real app, this could be Lottie or Three.js
  
  const getPoseVariants = (poseName: string) => {
    switch (poseName) {
      case 'mountain':
        return { head: { y: 0 }, arms: { rotate: 0, y: 0 }, body: { scaleY: 1 }, legs: { rotate: 0 } };
      case 'tree':
        return { head: { y: 0 }, arms: { rotate: -160, y: -20 }, body: { scaleY: 1 }, legs: { rotate: 15 } };
      case 'warrior1':
        return { head: { y: 0 }, arms: { rotate: -90, y: -40 }, body: { scaleY: 0.9 }, legs: { rotate: 45 } };
      case 'warrior2':
        return { head: { y: 0 }, arms: { rotate: 0, scaleX: 1.5 }, body: { scaleY: 0.9 }, legs: { rotate: 45 } };
      case 'cobra':
        return { head: { y: -20, rotate: -30 }, arms: { rotate: 45, y: 20 }, body: { rotate: 45, y: 40 }, legs: { rotate: 90, y: 60 } };
      case 'childs_pose':
        return { head: { y: 60 }, arms: { y: 60, rotate: 180 }, body: { scaleY: 0.5, y: 40 }, legs: { rotate: 180, y: 60 } };
      case 'savasana':
        return { head: { rotate: 90, y: 80 }, arms: { rotate: 90, y: 80 }, body: { rotate: 90, y: 80 }, legs: { rotate: 90, y: 80 } };
      case 'breathing':
      default:
        return { head: { y: 0 }, arms: { rotate: 0 }, body: { scaleY: 1 }, legs: { rotate: 0 } };
    }
  };

  const variants = getPoseVariants(pose);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Breathing Halo */}
      <motion.div 
        animate={{ 
          scale: isPlaying ? [1, 1.2, 1] : 1,
          opacity: isPlaying ? [0.1, 0.3, 0.1] : 0.1
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-64 h-64 bg-indigo-400 rounded-full blur-3xl"
      />

      <svg width="200" height="300" viewBox="0 0 200 300" className="relative z-10">
        {/* Head */}
        <motion.circle 
          cx="100" cy="60" r="15" 
          fill="#1E293B"
          animate={variants.head}
          transition={{ type: "spring", stiffness: 50 }}
        />
        
        {/* Body */}
        <motion.rect 
          x="90" y="75" width="20" height="80" rx="10"
          fill="#1E293B"
          animate={variants.body}
          transition={{ type: "spring", stiffness: 50 }}
        />

        {/* Arms */}
        <motion.g animate={variants.arms} transition={{ type: "spring", stiffness: 50 }}>
          <rect x="60" y="85" width="30" height="10" rx="5" fill="#1E293B" />
          <rect x="110" y="85" width="30" height="10" rx="5" fill="#1E293B" />
        </motion.g>

        {/* Legs */}
        <motion.g animate={variants.legs} transition={{ type: "spring", stiffness: 50 }}>
          <rect x="85" y="155" width="10" height="80" rx="5" fill="#1E293B" />
          <rect x="105" y="155" width="10" height="80" rx="5" fill="#1E293B" />
        </motion.g>

        {/* Ground Shadow */}
        <ellipse cx="100" cy="250" rx="40" ry="5" fill="#E2E8F0" />
      </svg>
    </div>
  );
}
