import JSZip from "jszip";

/**
 * Reads a PPTX file and extracts text slide by slide
 * @param file - Uploaded PPTX file
 * @returns string with formatted slide text
 */
export async function readPptx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  let pptxText = "";
  const slideFiles = Object.keys(zip.files)
    .filter((f) => f.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || "0", 10);
      const numB = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || "0", 10);
      return numA - numB;
    });

  for (let i = 0; i < slideFiles.length; i++) {
    const fileName = slideFiles[i];
    const xmlContent = await zip.files[fileName].async("text");

    // extract text between <a:t>...</a:t> tags (PPTX text runs)
    const texts = [...xmlContent.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g)].map(
      (m) => m[1]
    );

    pptxText += `\n--- Slide ${i + 1} ---\n`;
    pptxText += texts.join(" ") + "\n";
  }

  return pptxText.trim();
}
