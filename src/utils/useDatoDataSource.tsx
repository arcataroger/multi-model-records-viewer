import * as React from "react";
import {
  buildClient,
  type Client,
  LogLevel,
} from "@datocms/cma-client-browser";
import type { ItemInstancesHrefSchema } from "@datocms/cma-client/dist/types/generated/SimpleSchemaTypes";
import type {
  GridDataSource,
  GridGetRowsParams,
  GridRowModel,
} from "@mui/x-data-grid";

interface UseDatoDataSourceOptions {
  apiToken: string;
  modelId?: string;
  initialPageSize?: number;
  environment?: string;
  logLevel?: keyof typeof LogLevel;
}

export const useDatoDataSource = ({
  apiToken,
  modelId,
  initialPageSize = 10,
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
          ...(modelId ? { type: modelId } : {}),
          fields: Object.keys(fields).length ? fields : undefined,
        },
        page: { offset, limit },
      };

      if (sortModel.length) {
        hrefParams.order_by = sortModel
          .map(({ field, sort }) => `${field}_${sort?.toUpperCase()}`)
          .join(",");
      }

      const records = await client.items.list(hrefParams);

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

      // fetch just the total count
      const raw = await client.items.rawList({
        ...hrefParams,
        page: { limit: 0 },
      });

      return {
        rows: rows,
        rowCount: raw.meta.total_count,
      };
    },
    [client, modelId, initialPageSize],
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

  return { dataSource: { getRows }, initialState };
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
