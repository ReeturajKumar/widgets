// Strips scripts and event handlers from an uploaded SVG before it's
// rendered with dangerouslySetInnerHTML.
export function sanitizeSvg(raw: string): string {
  const doc = new DOMParser().parseFromString(raw, "image/svg+xml");

  if (doc.querySelector("parsererror")) {
    throw new Error("That file isn't valid SVG");
  }

  const svg = doc.documentElement;
  if (svg.nodeName.toLowerCase() !== "svg") {
    throw new Error("That file isn't an SVG");
  }

  const scripts = svg.querySelectorAll("script");
  scripts.forEach((el) => el.remove());

  const walker = doc.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
  let current: Element | null = svg;
  while (current) {
    Array.from(current.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on") || value.startsWith("javascript:")) {
        current!.removeAttribute(attr.name);
      }
    });
    current = walker.nextNode() as Element | null;
  }

  if (
    !svg.getAttribute("viewBox") &&
    svg.getAttribute("width") &&
    svg.getAttribute("height")
  ) {
    svg.setAttribute(
      "viewBox",
      `0 0 ${svg.getAttribute("width")} ${svg.getAttribute("height")}`
    );
  }

  return new XMLSerializer().serializeToString(svg);
}
