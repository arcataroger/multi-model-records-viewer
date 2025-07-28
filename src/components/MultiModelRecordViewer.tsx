import type { RenderPageCtx } from "datocms-plugin-sdk";
import { Canvas, ContextInspector } from "datocms-react-ui";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
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

  const { dataSource, initialState } = useDatoDataSource({
    apiToken: currentUserAccessToken,
    initialPageSize: 50,
  });

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID" },
    { field: "itemTypeId", headerName: "Item Type" },
    { field: "creator", headerName: "Author" },
    { field: "status", headerName: "Status" },
    { field: "updated_at", headerName: "Updated", type: "dateTime" },
  ];

  return (
    <Canvas ctx={ctx}>
      <h2>Records</h2>
      <DataGrid
        columns={columns}
        pagination={true}
        dataSource={dataSource}
        initialState={initialState}
        pageSizeOptions={[50, 100, 500, 1000]}
      />
      <div>
        <ContextInspector />
      </div>
    </Canvas>
  );
}
