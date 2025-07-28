import type { RenderPageCtx } from "datocms-plugin-sdk";
import { Canvas, ContextInspector } from "datocms-react-ui";

type Props = {
  ctx: RenderPageCtx;
};

export default function MultiModelRecordViewer({ ctx }: Props) {
  const { itemTypes, currentUserAccessToken } = ctx;

  return (
    <Canvas ctx={ctx}>
      <h2>Site</h2>
      <pre>{JSON.stringify(itemTypes, null, 2)}</pre>
      <div>
        <ContextInspector />
      </div>
    </Canvas>
  );
}
