const fformat = document.getElementsByName("fformat")[0];
const ff_gformat = document.getElementsByName("ff_gformat")[0];
const videoFormats = ["mp4", "m4v", "avi", "flv", "webm"];
const audioFormats = ["mp3", "wav", "m4a", "flac", "aac"];

fformat.addEventListener("change", function () {
  ff_gformat.innerHTML = "";

  const selectedFormat = fformat.value;

  const formats = selectedFormat === "audioonly" ? audioFormats : videoFormats;
  formats.forEach((format) => {
    const option = document.createElement("option");
    option.value = format;
    option.textContent = format;
    ff_gformat.appendChild(option);
  });
});
