"use client";

export type MercadoPagoPaymentBrickController = {
  unmount: () => void;
};

export type MercadoPagoPaymentBrickInstance = {
  bricks: () => {
    create: (
      type: "payment" | "cardPayment",
      containerId: string,
      settings: Record<string, unknown>,
    ) => Promise<MercadoPagoPaymentBrickController>;
  };
};

export type MercadoPagoConstructor = new (
  publicKey: string,
  options: { locale: string },
) => MercadoPagoPaymentBrickInstance;

declare global {
  interface Window {
    MercadoPago?: MercadoPagoConstructor;
    __cbcMercadoPagoSdkPromise?: Promise<MercadoPagoConstructor>;
  }
}

const MERCADO_PAGO_SDK_SRC = "https://sdk.mercadopago.com/js/v2";
const SDK_READY_TIMEOUT_MS = 20000;

const waitForMercadoPago = () =>
  new Promise<MercadoPagoConstructor>((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      if (window.MercadoPago) {
        resolve(window.MercadoPago);
        return;
      }

      if (Date.now() - startedAt > SDK_READY_TIMEOUT_MS) {
        reject(
          new Error(
            "Mercado Pago SDK loaded without exposing window.MercadoPago.",
          ),
        );
        return;
      }

      window.setTimeout(check, 100);
    };

    check();
  });

export const loadMercadoPagoSdk = () => {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Mercado Pago SDK can only load in the browser."),
    );
  }

  if (window.MercadoPago) {
    return Promise.resolve(window.MercadoPago);
  }

  if (window.__cbcMercadoPagoSdkPromise) {
    return window.__cbcMercadoPagoSdkPromise;
  }

  window.__cbcMercadoPagoSdkPromise = new Promise<MercadoPagoConstructor>(
    (resolve, reject) => {
      const fail = (error: Error) => {
        window.__cbcMercadoPagoSdkPromise = undefined;
        reject(error);
      };

      const finish = () => {
        void waitForMercadoPago().then(resolve).catch(fail);
      };

      const currentScript = document.querySelector<HTMLScriptElement>(
        `script[src^="${MERCADO_PAGO_SDK_SRC}"]`,
      );

      if (currentScript) {
        currentScript.addEventListener("load", finish, { once: true });
        currentScript.addEventListener(
          "error",
          () => fail(new Error("Mercado Pago SDK failed to load.")),
          { once: true },
        );
        finish();
        return;
      }

      const script = document.createElement("script");
      script.src = MERCADO_PAGO_SDK_SRC;
      script.async = true;
      script.dataset.cbcMercadoPagoSdk = "true";
      script.onload = finish;
      script.onerror = () =>
        fail(new Error("Mercado Pago SDK failed to load."));
      document.head.appendChild(script);
    },
  );

  return window.__cbcMercadoPagoSdkPromise;
};

export const preloadMercadoPagoSdk = () => {
  void loadMercadoPagoSdk().catch(() => undefined);
};
