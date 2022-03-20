const hasLocalStorage = typeof localStorage !== "undefined";

export function getBrowserId() {
  return hasLocalStorage ? (localStorage.getItem("browserId") as string) : "";
}

export function getContainerId() {
  return hasLocalStorage ? (localStorage.getItem("containerId") as string) : "";
}

export function getContainerIP() {
  return hasLocalStorage ? (localStorage.getItem("containerIP") as string) : "";
}
