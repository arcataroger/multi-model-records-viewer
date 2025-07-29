import * as React from "react";
import {
  buildClient,
  type Client,
  LogLevel,
} from "@datocms/cma-client-browser";
import type { ItemInstancesHrefSchema } from "@datocms/cma-client/dist/types/generated/SimpleSchemaTypes";
import type {
  GridColDef,
  GridDataSource,
  GridGetRowsParams,
  GridRowModel,
} from "@mui/x-data-grid";

interface UseDatoDataSourceOptions {
  apiToken: string;
  modelIds?: string;
  initialPageSize?: number;
  environment?: string;
  logLevel?: keyof typeof LogLevel;
}

export const useDatoDataSource = ({
  apiToken,
  modelIds,
  initialPageSize = 50,
  environment,
  logLevel = "NONE",
}: UseDatoDataSourceOptions) => {
  const client = React.useMemo<Client>(
    () =>
      buildClient({
        apiToken,
        environment,
        logLevel: LogLevel[logLevel],
      }),
    [apiToken, environment, logLevel],
  );

  const getRows = React.useCallback<GridDataSource["getRows"]>(
    async (params: GridGetRowsParams) => {
      const {
        paginationModel = { page: 0, pageSize: initialPageSize },
        sortModel = [],
        filterModel = { items: [] },
      } = params;

      // now safe to destructure
      const { page, pageSize } = paginationModel;
      const offset = page * pageSize;
      const limit = pageSize;

      const fields: Record<string, unknown> = {};
      filterModel.items.forEach((item) => {
        fields[item.field] = {
          [mapOperator(item.operator)]: item.value,
        };
      });

      const hrefParams: ItemInstancesHrefSchema = {
        filter: {
          ...(modelIds ? { type: modelIds } : {}),
          fields: Object.keys(fields).length ? fields : undefined,
        },
        page: { offset, limit },
        version: "current",
      };

      if (sortModel.length) {
        hrefParams.order_by = sortModel
          .map(({ field, sort }) => `${field}_${sort?.toUpperCase()}`)
          .join(",");
      }

      const records = await client.items.rawList(hrefParams);

      const rows: GridRowModel[] = records.data.map((record) => {
        const {
          id,
          relationships: {
            creator,
            item_type: {
              data: { id: itemTypeId },
            },
          },
          meta: { status, updated_at },
        } = record;

        const creatorId = creator?.data?.id ?? "Unknown"; // TODO Better disambiguate creator types

        return {
          id,
          itemTypeId,
          creator: creatorId,
          _status: status,
          _updated_at: updated_at,
        };
      });

      return {
        rows: rows,
        rowCount: records.meta.total_count,
      };
    },
    [client, modelIds, initialPageSize],
  );

  const initialState = React.useMemo(
    () => ({
      pagination: {
        paginationModel: { page: 0, pageSize: initialPageSize },
        rowCount: 0,
      },
    }),
    [initialPageSize],
  );

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", type: "string" },
    { field: "itemTypeId", headerName: "Item Type", type: "string" },
    { field: "creator", headerName: "Author" },
    { field: "_status", headerName: "Status" },
    {
      field: "_updated_at",
      headerName: "Updated",
      type: "dateTime",
      valueGetter: (dateTimeIso) => new Date(dateTimeIso),
      valueParser: (jsDate: Date) => jsDate.toISOString(),
    },
  ];

  return { dataSource: { getRows }, initialState, columns };
};

const operatorMap: Record<string, string> = {
  contains: "contains",
  equals: "eq",
  is: "eq",
  startsWith: "starts_with",
  endsWith: "ends_with",
  not: "ne",
  in: "in",
  notIn: "not_in",
  greaterThan: "gt",
  greaterThanOrEqual: "gte",
  lessThan: "lt",
  lessThanOrEqual: "lte",
};

function mapOperator(op: string): string {
  return operatorMap[op] ?? operatorMap["contains"];
}
