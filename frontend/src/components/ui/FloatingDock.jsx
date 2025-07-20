/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { cn } from "../../lib/utils";
import { IconButton, Badge } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

import { useRef, useState } from "react";

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
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <button
                  onClick={item.onClick}
                  key={item.title}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-600/40 shadow-lg hover:bg-gray-700/80 transition-all duration-300"
                  style={{ color: item.color }}
                >
                  {item.badge ? (
                    <Badge badgeContent={item.badge} max={999} color="orange">
                      <div className="h-4 w-4">{item.icon}</div>
                    </Badge>
                  ) : (
                    <div className="h-4 w-4">{item.icon}</div>
                  )}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-600/40 shadow-lg"
      >
        <MenuIcon className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-4 rounded-2xl px-4 pb-3 md:flex",
        className,
      )}
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        minWidth: 'fit-content',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
      }}
      layout={false} // Prevent layout shifts
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
  color,
  badge,
}) {
  let ref = useRef(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 32, 20]);
  let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 32, 20]);

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 200,
    damping: 15,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 200,
    damping: 15,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 200,
    damping: 15,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 200,
    damping: 15,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <motion.button 
      onClick={onClick} 
      style={{ flexShrink: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        ref={ref}
        style={{ 
          width, 
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-gray-800/90 backdrop-blur-md border border-gray-600/50 shadow-xl hover:bg-gray-700/90 hover:border-gray-500/60 transition-all duration-200 ease-out"
        layout={false}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-600/40 bg-black/90 backdrop-blur-sm px-2 py-0.5 text-xs whitespace-pre text-white shadow-xl"
              style={{ zIndex: 9999 }}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        {badge ? (
          <Badge badgeContent={badge} max={999} color="error">
            <motion.div
              style={{ 
                width: widthIcon, 
                height: heightIcon, 
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="flex items-center justify-center"
              layout={false}
            >
              {icon}
            </motion.div>
          </Badge>
        ) : (
          <motion.div
            style={{ 
              width: widthIcon, 
              height: heightIcon, 
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="flex items-center justify-center"
            layout={false}
          >
            {icon}
          </motion.div>
        )}
      </motion.div>
    </motion.button>
  );
}
