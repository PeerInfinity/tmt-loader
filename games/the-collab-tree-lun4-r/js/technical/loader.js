for (const file of modInfo.modFiles) {
  let script = document.createElement("script");
  script.src = `js/${file}`;
  document.head.appendChild(script);
}
