import type { RenderPageCtx } from "datocms-plugin-sdk";
import { Canvas, ContextInspector } from "datocms-react-ui";

type Props = {
  ctx: RenderPageCtx;
};

export default function MultiModelRecordViewer({ ctx }: Props) {
  return (
    <Canvas ctx={ctx}>
      <p>Welcome to your plugin! This is your config screen!</p>
      <div>
        <ContextInspector />
      </div>
    </Canvas>
  );
}
