export function isLocalDevEnv() {
  const currentUrl = window.location.href;
  return currentUrl.indexOf("localhost:3000") >= 0 || currentUrl.indexOf("http://localhost") >= 0;
}