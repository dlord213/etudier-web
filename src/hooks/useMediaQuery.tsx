import { useEffect, useState } from "react";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia(query);
      // Set the initial state
      setMatches(mediaQuery.matches);

      const handleChange = () => setMatches(mediaQuery.matches);
      mediaQuery.addEventListener("change", handleChange);

      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [query]);

  return matches;
};

export default useMediaQuery;
