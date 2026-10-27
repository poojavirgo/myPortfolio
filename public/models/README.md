# Avatar models

Put your rigged avatar here as `pooja.glb`, then in `src/data/tour.ts` set:

```ts
export const AVATAR_URL = `${import.meta.env.BASE_URL}models/pooja.glb`;
```

The page looks for animation clips by name (case doesn't matter):

| Clip name contains | Used when |
| --- | --- |
| `idle` | standing still |
| `walk` | walking across the page |
| `wave` | saying hi and goodbye |
| `talk` | speaking a line |
| `sit` / `typ` | sitting at the desk, typing |

If a clip is missing, the closest match is used instead (for example `idle` instead of `talk`).

Keep the file small for fast loading: under about 5 MB, ideally compressed with `npx @gltf-transform/cli optimize pooja.glb pooja-small.glb`.
