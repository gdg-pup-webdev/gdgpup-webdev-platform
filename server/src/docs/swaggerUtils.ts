export const makeSwaggerPath = ({
  method,
  summary,
  description,
  tag,
  pathParams = [],
  responses,
  requiresAuth = true,
}: {
  method: "get" | "post" | "put" | "delete";
  summary: string;
  description: string;
  tag: string;
  pathParams?: any[];
  responses: any;
  requiresAuth?: boolean;
}) => {
  return {
    [method]: {
      summary,
      description,
      tags: [tag],
      ...(requiresAuth ? { security: [{ bearerAuth: [] }] } : {}),
      parameters: pathParams,
      responses,
    },
  };
};

export const makeBasicResponses = ({
  successExample,
  notFoundMessage = "Not found",
  forbiddenMessage = "Access denied",
}: {
  successExample: any;
  notFoundMessage?: string;
  forbiddenMessage?: string;
}) => ({
  "200": {
    description: "Request successful",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Success" },
            data: { type: "object", example: successExample },
          },
        },
      },
    },
  },
  "404": {
    description: notFoundMessage,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: notFoundMessage },
          },
        },
      },
    },
  },
  "403": {
    description: forbiddenMessage,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: forbiddenMessage },
          },
        },
      },
    },
  },
});

export const makeParam = (
  name: string,
  type: "path" | "query",
  required: boolean,
  description: string
) => {
  return {
    name: name,
    in: type,
    required: required,
    schema: { type: "string" },
    description: description,
  };
};

export const makeResponse = (
  status: number,
  description: string,
  success: boolean,
  message: string,
  dataSchema: ObjectSchema
) => {
  return {
    [status]: {
      description: description,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: success,
              },
              message: {
                type: "string",
                example: message,
              },
              data: {
                type: "object",
                example: dataSchema,
              },
            },
          },
        },
      },
    },
  };
};

export type ObjectSchema = {
  type: "object";
  example: Record<string, unknown>;
};

export const makeObjectSchema = (
  example: Record<string, unknown>
): ObjectSchema => {
  return {
    type: "object",
    example: example,
  };
};
