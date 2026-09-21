import {
  createContext,
  useContext,
  useState,
} from "react";
import { flushSync } from "react-dom";

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const [loading, setLoading] = useState(false);


async function zoomEffect() {
  const html = document.documentElement;
  const body = document.body;

  const oldHtmlOverflow = html.style.overflow;
  const oldBodyOverflow = body.style.overflow;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";

  try {
    await html.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.5)" },
        { transform: "scale(1)" }
      ],
      {
        duration: 1000,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    ).finished;
  } finally {
    html.style.overflow = oldHtmlOverflow;
    body.style.overflow = oldBodyOverflow;
    html.style.transform = "";
  }
}


  const startNavigation = async (navigate, path) => {
    // 1. Ép React render loading NGAY LẬP TỨC, không đợi batch
    flushSync(() => {
      setLoading(true);
    });

    zoomEffect()

    // 2. Đợi browser THỰC SỰ paint xong (double rAF)
    await new Promise((resolve) => setTimeout(resolve, 250));

    // 3. Giờ mới điều hướng
    navigate(path);



    await new Promise((resolve) => setTimeout(resolve, 300));
    setLoading(false);
  };

  return (
    <NavigationContext.Provider value={{ loading, startNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}