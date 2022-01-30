/**
 * Incoming URL is like this: https://HOST/self.html#!/xxx
 * And we want to get the hash respectively the parts after it (in this example the xxx)
 * Hence we use this very basic oldschool JS
 */
function rewriteAngularJsUrl(baseRoute) {
  var hash = window.location.hash;
  if (hash.length <= 2) {
    console.log(`Invalid hash: ${hash}`);
    window.location.replace("/"); // Redirect to start page
    return;
  }

  hash = hash.substring(2);
  var newUrl = `${baseRoute}${hash}`;
  console.log(`Redirecting to ${newUrl}`);
  window.location.replace(newUrl);
}