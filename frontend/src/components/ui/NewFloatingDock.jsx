/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { cn } from "../../utils/lib/utils";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              position: 'absolute',
              bottom: '100%',
              marginBottom: '8px'
            }}
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.03,
                    duration: 0.2,
                    ease: "easeOut"
                  },
                }}
                transition={{ 
                  delay: (items.length - 1 - idx) * 0.03,
                  duration: 0.3,
                  ease: "easeOut"
                }}
              >
                <motion.button
                  onClick={item.onClick}
                  key={item.title}
                  whileHover={{ 
                    scale: 1.1, 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    transition: { duration: 0.1, ease: "easeOut" }
                  }}
                  style={{
                    display: 'flex',
                    height: '40px',
                    width: '40px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: item.color || '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ height: '20px', width: '20px' }}>{item.icon}</div>
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ 
          scale: 1.1,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          transition: { duration: 0.2, ease: "easeOut" }
        }}
        whileTap={{ 
          scale: 0.95,
          transition: { duration: 0.1, ease: "easeOut" }
        }}
        style={{
          display: 'flex',
          height: '40px',
          width: '40px',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          color: '#ffffff',
          cursor: 'pointer'
        }}
      >
        <MenuIcon style={{ height: '20px', width: '20px' }} />
      </motion.button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}) => {
  let mouseX = useMotionValue(Infinity);
  
  // Calculate a more stable fixed width to prevent any shifting
  const baseItemWidth = 64; // Reduced width per item
  const itemGap = 8; // Reduced gap between items
  const containerPadding = 16; // Reduced left + right padding
  const fixedWidth = items.length * baseItemWidth + (items.length - 1) * itemGap + containerPadding;
  
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-4 rounded-2xl px-4 pb-3 md:flex",
        className,
      )}
      style={{
        display: 'flex',
        height: '64px',
        alignItems: 'flex-end',
        gap: '8px', // Reduced gap
        borderRadius: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        padding: '0 8px 12px 8px', // Reduced padding
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        width: `${fixedWidth}px`, // Fixed width prevents any shifting
        justifyContent: 'center',
        minWidth: `${fixedWidth}px`, // Ensure minimum width
        maxWidth: `${fixedWidth}px`, // Ensure maximum width
      }}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  onClick,
  color = '#ffffff'
}) {
  let ref = useRef(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-120, 0, 120], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-120, 0, 120], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-120, 0, 120], [20, 40, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-120, 0, 120],
    [20, 40, 20],
  );

  let width = useSpring(widthTransform, {
    mass: 0.03,
    stiffness: 300,
    damping: 20,
  });
  let height = useSpring(heightTransform, {
    mass: 0.03,
    stiffness: 300,
    damping: 20,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.03,
    stiffness: 300,
    damping: 20,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.03,
    stiffness: 300,
    damping: 20,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <button onClick={onClick}>
      <motion.div
        ref={ref}
        style={{ 
          width, 
          height,
          position: 'relative',
          display: 'flex',
          aspectRatio: '1',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          scale: 1.02,
          transition: { duration: 0.2, ease: "easeOut" }
        }}
        whileTap={{ 
          scale: 0.98,
          transition: { duration: 0.1, ease: "easeOut" }
        }}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%", scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                x: "-50%", 
                scale: 1,
                transition: { 
                  duration: 0.2, 
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }
              }}
              exit={{ 
                opacity: 0, 
                y: 5, 
                x: "-50%", 
                scale: 0.8,
                transition: { 
                  duration: 0.15, 
                  ease: "easeIn" 
                }
              }}
              style={{
                position: 'absolute',
                top: '-32px',
                left: '50%',
                width: 'fit-content',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                padding: '4px 8px',
                fontSize: '12px',
                whiteSpace: 'pre',
                color: '#ffffff',
                backdropFilter: 'blur(10px)',
                zIndex: 1000
              }}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ 
            width: widthIcon, 
            height: heightIcon,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}
        >
          {icon}
        </motion.div>
      </motion.div>
    </button>
  );
}
