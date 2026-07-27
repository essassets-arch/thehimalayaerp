import { useEffect, useState } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    
    const update = () => {
      setMatches(media.matches);
    };

    update();
    
    // Older Safari support
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    } else {
      media.addListener(update);
      return () => media.removeListener(update);
    }
  }, [query]);

  return matches;
}
