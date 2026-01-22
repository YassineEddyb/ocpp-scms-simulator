import { store } from "./store";

export interface HandlerContext {
  params: any;
  client: any;
}

// OCPP 1.6 Core Profile Handlers
export const handlers = {
  BootNotification: async ({ params, client }: HandlerContext) => {
    const chargePointId = client.identity;

    // Check for custom config
    const customResponse = store.getConfig(chargePointId, "BootNotification");

    const response = customResponse || {
      status: "Accepted",
      currentTime: new Date().toISOString(),
      interval: 300,
    };

    store.addLog({
      chargePointId,
      type: "IN",
      action: "BootNotification",
      payload: params,
      response,
    });

    return response;
  },

  Heartbeat: async ({ params, client }: HandlerContext) => {
    const chargePointId = client.identity;

    const customResponse = store.getConfig(chargePointId, "Heartbeat");
    const response = customResponse || {
      currentTime: new Date().toISOString(),
    };

    store.addLog({
      chargePointId,
      type: "IN",
      action: "Heartbeat",
      payload: params,
      response,
    });

    return response;
  },

  StatusNotification: async ({ params, client }: HandlerContext) => {
    const chargePointId = client.identity;

    const customResponse = store.getConfig(chargePointId, "StatusNotification");
    const response = customResponse || {};

    store.addLog({
      chargePointId,
      type: "IN",
      action: "StatusNotification",
      payload: params,
      response,
    });

    return response;
  },

  Authorize: async ({ params, client }: HandlerContext) => {
    const chargePointId = client.identity;

    const customResponse = store.getConfig(chargePointId, "Authorize");
    const response = customResponse || {
      idTagInfo: {
        status: "Accepted",
      },
    };

    store.addLog({
      chargePointId,
      type: "IN",
      action: "Authorize",
      payload: params,
      response,
    });

    return response;
  },

  StartTransaction: async ({ params, client }: HandlerContext) => {
    const chargePointId = client.identity;

    const customResponse = store.getConfig(chargePointId, "StartTransaction");
    const response = customResponse || {
      transactionId: Math.floor(Math.random() * 100000),
      idTagInfo: {
        status: "Accepted",
      },
    };

    store.addLog({
      chargePointId,
      type: "IN",
      action: "StartTransaction",
      payload: params,
      response,
    });

    return response;
  },

  StopTransaction: async ({ params, client }: HandlerContext) => {
    const chargePointId = client.identity;

    const customResponse = store.getConfig(chargePointId, "StopTransaction");
    const response = customResponse || {
      idTagInfo: {
        status: "Accepted",
      },
    };

    store.addLog({
      chargePointId,
      type: "IN",
      action: "StopTransaction",
      payload: params,
      response,
    });

    return response;
  },

  MeterValues: async ({ params, client }: HandlerContext) => {
    const chargePointId = client.identity;

    const customResponse = store.getConfig(chargePointId, "MeterValues");
    const response = customResponse || {};

    store.addLog({
      chargePointId,
      type: "IN",
      action: "MeterValues",
      payload: params,
      response,
    });

    return response;
  },

  DiagnosticsStatusNotification: async ({ params, client }: HandlerContext) => {
    const chargePointId = client.identity;

    const customResponse = store.getConfig(
      chargePointId,
      "DiagnosticsStatusNotification",
    );
    const response = customResponse || {};

    store.addLog({
      chargePointId,
      type: "IN",
      action: "DiagnosticsStatusNotification",
      payload: params,
      response,
    });

    return response;
  },

  DataTransfer: async ({ params, client }: HandlerContext) => {
    const chargePointId = client.identity;

    const customResponse = store.getConfig(chargePointId, "DataTransfer");
    const response = customResponse || {
      status: "Accepted",
    };

    store.addLog({
      chargePointId,
      type: "IN",
      action: "DataTransfer",
      payload: params,
      response,
    });

    return response;
  },

  FirmwareStatusNotification: async ({ params, client }: HandlerContext) => {
    const chargePointId = client.identity;

    const customResponse = store.getConfig(
      chargePointId,
      "FirmwareStatusNotification",
    );
    const response = customResponse || {};

    store.addLog({
      chargePointId,
      type: "IN",
      action: "FirmwareStatusNotification",
      payload: params,
      response,
    });

    return response;
  },
};

export type OcppAction = keyof typeof handlers;
