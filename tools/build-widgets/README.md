# Widget build pipeline

Turns a raster widget in `public/icons` into a React component under
`components/icons`.

The source files are SVG wrappers around a base64 PNG: megabytes each, sitting
on a pale blue page, with wide empty margins that make the art render small
inside its node. This pipeline extracts the bitmap, floods the background away
from the corners, clears the anti-aliased halo that flood leaves behind, trims
to the artwork, caps the long edge and re-encodes to WebP — then writes a
component with the image embedded as a data URI.

## Running it

```bash
python tools/build-widgets/build.py 4:GearPump:"Gear Pump" 5:BlowerFan:"Blower Fan"
```

Each argument is `<file stem>:<ComponentName>:<Label>`. The script prints the
lines to add to `lib/convertedWidgets.ts`; register the component in
`components/icons/registry.ts` and it appears in the sidebar.

Requires `pillow` and `numpy`.

## Why the art is a bitmap, not paths

These widgets are shaded illustrations — metallic gradients, soft highlights —
not flat icons. Tracing them to vector paths was tried and rejected: flat shapes
cannot represent a gradient, so smooth surfaces came out banded, thin linework
broke into dashes, and pushing the trace toward fidelity produced files larger
than the original bitmaps (2.9 MB for one widget, versus 79 KB here).

Storing the source pixels keeps the widget identical to the artwork. The cost is
that it is resolution-bound: `MAX_EDGE` is 1100px, far beyond the 70–300px a
board node renders at, but a widget blown up past that will soften.

## Tuning

- `MAX_EDGE` — long edge of the stored art. Raise for more zoom headroom, at
  roughly linear cost in file size.
- `QUALITY` — WebP quality. 90 is visually lossless on this artwork; below about
  80 the gradients start to posterise.
- `flood_tol` / `halo_tol` in `strip_background` — raise if a pale fringe
  survives around the art, lower if the background eats into the drawing.
