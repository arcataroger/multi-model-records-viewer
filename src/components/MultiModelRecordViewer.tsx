import type { RenderPageCtx } from "datocms-plugin-sdk";
import { Canvas, ContextInspector } from "datocms-react-ui";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { useDatoDataSource } from "../utils/useDatoDataSource.tsx";

type Props = {
  ctx: RenderPageCtx;
};

export default function MultiModelRecordViewer({ ctx }: Props) {
  const { alert, currentUserAccessToken } = ctx;

  // Abort early if no access token
  // TODO add better check for proper permissions
  if (!currentUserAccessToken?.length) {
    alert("No access token");
    return (
      <Canvas ctx={ctx}>
        <h2>No access token</h2>;
      </Canvas>
    );
  }

  const { dataSource, initialState, columns } = useDatoDataSource({
    apiToken: currentUserAccessToken,
  });

  const dataGridRef = useGridApiRef();

  return (
    <Canvas ctx={ctx}>
      <h2>Records</h2>
      <DataGrid
        apiRef={dataGridRef}
        columns={columns}
        pagination={true}
        dataSource={dataSource}
        initialState={initialState}
        pageSizeOptions={[50, 100, 500]}
        dataSourceCache={null}
        onStateChange={() => {
          dataGridRef.current?.autosizeColumns({
            includeHeaders: true,
            includeOutliers: false,
          });
        }}
      />
      <div>
        <ContextInspector />
      </div>
    </Canvas>
  );
}
