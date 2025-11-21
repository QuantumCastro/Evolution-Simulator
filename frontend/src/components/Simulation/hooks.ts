export const scrollToSimulation = () => {
  if (typeof window === "undefined") return Promise.resolve();

  const target = document.getElementById("simulation-section");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    return new Promise<void>((resolve) => {
      setTimeout(resolve, 480);
    });
  }

  return Promise.resolve();
};

export const resyncScrollToSimulation = (delayMs = 160) => {
  if (typeof window === "undefined") return;
  const target = document.getElementById("simulation-section");
  if (!target) return;
  window.setTimeout(() => {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }, delayMs);
};
