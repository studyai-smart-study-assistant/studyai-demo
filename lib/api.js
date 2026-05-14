/**
 * Fetch plain text from Pollinations Text API
 */
export async function fetchText(prompt) {
  const res = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      model: "openai",       // or "openai-large"
      maxTokens: 1024,
    }),
  });
  if (!res.ok) throw new Error("Text generation failed");
  const data = await res.json();
  return data.text;
}

/**
 * Return a direct image URL for a given prompt.
 * You can adjust width, height, seed, model etc.
 */
export function getImageUrl(prompt) {
  const encoded = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 100000);
  return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true`;
}

/**
 * Fetch video as a blob and return an object URL.
 * Uses Pollinations Video endpoint (works without API key).
 */
export async function getVideoBlobUrl(prompt) {
  const encoded = encodeURIComponent(prompt);
  const url = `https://video.pollinations.ai/prompt/${encoded}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Video generation failed");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/**
 * Utility to download a media blob with a given filename.
 */
export function downloadBlob(blobUrl, filename) {
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
