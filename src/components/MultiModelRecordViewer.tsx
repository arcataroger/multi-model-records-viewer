import type { RenderPageCtx } from "datocms-plugin-sdk";
import { Canvas, ContextInspector } from "datocms-react-ui";
import { buildClient } from "@datocms/cma-client-browser";
import {
  DataGrid,
  type GridColDef,
  type GridDataSource,
  type GridGetRowsParams,
  type GridGetRowsResponse,
  type GridRowModel,
} from "@mui/x-data-grid";

type Props = {
  ctx: RenderPageCtx;
};

export default function MultiModelRecordViewer({ ctx }: Props) {
  const { itemTypes, alert, currentUserAccessToken } = ctx;

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

  const cmaDataSourceForDataGrid: GridDataSource = {
    getRows: async (
      params: GridGetRowsParams,
    ): Promise<GridGetRowsResponse> => {
      const cma = buildClient({
        apiToken: currentUserAccessToken,
      });

      const records = await cma.items.list();

      const rows: GridRowModel[] = records.map((record) => {
        const {
          id,
          item_type: { id: itemTypeId },
          creator,
          meta: { status, updated_at },
        } = record;

        const creatorId = creator?.id ?? "Unknown"; // TODO Better disambiguate creator types

        return {
          id,
          itemTypeId,
          creator: creatorId,
          status,
          updated_at,
        };
      });

      return {
        rows: rows,
        rowCount: rows.length,
      };
    },
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID" },
    { field: "itemTypeId", headerName: "Item Type" },
    { field: "creator", headerName: "Author" },
    { field: "status", headerName: "Status" },
    { field: "updated_at", headerName: "Updated" },
  ];

  return (
    <Canvas ctx={ctx}>
      <h2>Records</h2>
      <DataGrid
        columns={columns}
        pagination={true}
        dataSource={cmaDataSourceForDataGrid}
      />
      <div>
        <ContextInspector />
      </div>
    </Canvas>
  );
}
