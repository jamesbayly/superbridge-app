import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatUnits } from "viem";
import { useFeeData } from "wagmi";

import { DeploymentFamily } from "@/codegen/model";
import { Checkbox } from "@/components/ui/checkbox";
import { isSuperbridge } from "@/config/superbridge";
import { deploymentTheme } from "@/config/theme";
import { currencySymbolMap } from "@/constants/currency-symbol-map";
import { FINALIZE_GAS, PROVE_GAS } from "@/constants/gas-limits";
import { useNativeToken } from "@/hooks/use-native-token";
import { useTokenPrice } from "@/hooks/use-prices";
import { useConfigState } from "@/state/config";
import { useSettingsState } from "@/state/settings";

import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";

function FeesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="60"
      height="60"
      fill="none"
      viewBox="0 0 60 60"
      className="w-4 min-w-4 h-4 min-h-4"
    >
      <g clipPath="url(#clip0_179_439)">
        <path
          fill="#5F5"
          d="M37.51 22.8c0-4.54 3.69-8.23 8.23-8.23 4.54 0 8.23 3.69 8.23 8.23 0 4.54-3.66 8.23-8.23 8.23s-8.23-3.66-8.23-8.23zM2.42 37.21h22.86V8.42H2.42v28.79zm31.88 0h22.92V8.42H34.3v28.79z"
        ></path>
        <path
          fill="#00BF3A"
          d="M37.51 22.8c0-4.54 3.69-8.23 8.23-8.23 4.54 0 8.23 3.69 8.23 8.23 0 4.54-3.66 8.23-8.23 8.23s-8.23-3.66-8.23-8.23zM33 51.02h25.28V38.49H33v12.53zM1.21 38.48v12.53h25.28V38.48H1.21z"
        ></path>
        <path fill="#CBCCBE" d="M31.88 39.69H27.7v11.02h4.18V39.69z"></path>
        <path
          fill="#007403"
          d="M33 51.02h25.28V38.49H33v12.53zM1.21 38.48v12.53h25.28V38.48H1.21z"
        ></path>
        <path fill="#fff" d="M31.88 8.42H27.7v28.85h4.18V8.42z"></path>
        <path
          fill="#000"
          d="M47.17 21.26c0-1.12.94-2.06 2.06-2.06s2.03.94 2.03 2.06-.91 2.06-2.03 2.06c-1.12 0-2.06-.94-2.06-2.06zm-5.03 4.24c0-.67.54-1.21 1.21-1.21.67 0 1.09.54 1.24 1 .12.36.39.67 1.18.67.79 0 1.03-.33 1.15-.67.12-.34.39-1 1.18-1 .67 0 1.21.54 1.21 1.21 0 1.6-1.57 2.88-3.6 2.88-2.03 0-3.57-1.27-3.57-2.88zm-1.97-4.24c0-1.12.94-2.06 2.06-2.06s2.03.94 2.03 2.06-.91 2.06-2.03 2.06c-1.12 0-2.06-.94-2.06-2.06zm-2.66 1.54c0-4.54 3.69-8.23 8.23-8.23 4.54 0 8.23 3.69 8.23 8.23 0 4.54-3.66 8.23-8.23 8.23s-8.23-3.66-8.23-8.23zm-2.42 0c0 5.9 4.78 10.63 10.66 10.63A10.6 10.6 0 0056.38 22.8c0-5.91-4.72-10.66-10.63-10.66A10.65 10.65 0 0035.09 22.8zm-.79 14.41V8.42h22.92v28.79H34.3zm0 4.54v-2.12h22.92v2.12H34.3zm0 4.48v-2.06h22.92v2.06H34.3zm0 4.48v-2.06h22.92v2.06H34.3zm-6.6-13.44V8.42h4.18v28.85H27.7zm0 13.44V39.69h4.18v11.02H27.7zM2.42 37.21V8.42h22.86v28.79H2.42zm0 4.54v-2.12h22.86v2.12H2.42zm0 4.48v-2.06h22.86v2.06H2.42zm0 4.48v-2.06h22.86v2.06H2.42zM0 51.92c0 .67.54 1.21 1.21 1.21h57.22c.67 0 1.21-.54 1.21-1.21V7.21c0-.7-.54-1.21-1.21-1.21H1.21C.54 6 0 6.51 0 7.21v44.71zm12.84-30.69l2.75.61c3 .67 4.81 1.91 4.81 4.9s-2.15 4.84-5 5.24v1.3c0 .91-.61 1.51-1.48 1.51s-1.48-.64-1.48-1.51v-1.24c-2.94-.3-5.81-1.91-5.81-4.45 0-.85.61-1.51 1.42-1.51.42 0 .91.18 1.36.94.73 1.24 2.27 2.12 4.57 2.12 2.06 0 3.21-.79 3.21-2.15 0-1.21-.79-1.82-2.42-2.15l-2.97-.61c-3.09-.64-4.69-2.06-4.69-4.9 0-2.84 2.03-4.75 5.33-5.12V13c0-.91.64-1.54 1.48-1.54s1.48.64 1.48 1.54v1.3c2.57.45 5.03 1.91 5.03 4.12 0 .85-.48 1.51-1.36 1.51-.54 0-1.12-.21-1.51-.85-.67-1.09-2.15-1.97-4.21-1.97-1.85 0-3 .7-3 1.97 0 1.36.88 1.79 2.48 2.15h.01z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_179_439">
          <path
            fill="#fff"
            d="M0 0H59.64V47.14H0z"
            transform="translate(0 6)"
          ></path>
        </clipPath>
      </defs>
    </svg>
  );
}

export const ConfirmWithdrawalModal = ({
  onConfirm,
}: {
  onConfirm: () => void;
}) => {
  const { t } = useTranslation();
  const open = useConfigState.useDisplayWithdrawalModal();
  const setOpen = useConfigState.useSetDisplayWithdrawalModal();
  const currency = useSettingsState.useCurrency();

  const deployment = useConfigState.useDeployment();
  const theme = deploymentTheme(deployment);

  const l1FeeData = useFeeData({ chainId: deployment?.l1.id });
  const l2FeeData = useFeeData({ chainId: deployment?.l2.id });

  const nativeToken = useNativeToken();

  const nativeTokenPrice = useTokenPrice(nativeToken ?? null);

  const initiateCost =
    (l2FeeData.data?.gasPrice ?? BigInt(0)) * BigInt(200_000);
  const proveCost = (l1FeeData.data?.gasPrice ?? BigInt(0)) * PROVE_GAS;
  const finalizeCost = (l1FeeData.data?.gasPrice ?? BigInt(0)) * FINALIZE_GAS;

  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);

  const fee = (n: bigint, maximumFractionDigits: number) => {
    if (!nativeTokenPrice) {
      return null;
    }

    const formattedAmount = parseFloat(formatUnits(n, 18));

    const amount = (nativeTokenPrice * formattedAmount).toLocaleString("en", {
      maximumFractionDigits,
    });

    return `${currencySymbolMap[currency]}${amount}`;
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <div className="flex flex-col p-6 pt-6 md:pt-8">
          <div className="flex flex-col gap-1 mr-6">
            <h1 className="font-bold text-2xl md:text-2xl tracking-tight md:leading-7 text-pretty">
              {t("withdrawalModal.title", { rollup: deployment?.l2.name })}
            </h1>
            <p className="text-sm text-pretty">
              {t(
                deployment?.family === DeploymentFamily.arbitrum
                  ? "withdrawalModal.arbDescription"
                  : "withdrawalModal.opDescription",
                {
                  base: deployment?.l1.name,
                }
              )}{" "}
              <Link
                href="https://docs.rollbridge.app/what-is-bridging"
                className="underline font-medium"
                target="_blank"
              >
                {t("withdrawalModal.learnMore")}
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-1 pt-4">
            <div className="justify-end flex items-center px-1">
              <span className="text-zinc-400 font-medium text-[11px]">
                {t("withdrawalModal.approxFees")}
              </span>
            </div>
            <div
              className={`${theme.bgMuted} rounded-lg px-3 py-2 justify-between flex items-center`}
            >
              <div className="flex gap-2 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  fill="none"
                  viewBox="0 0 60 60"
                  className="w-5 min-w-5 h-5 min-h-5"
                >
                  <g clipPath="url(#clip0_180_472)">
                    <path
                      fill="#FF5"
                      d="M19.56 58.97c-.97 0-1.73-.79-1.73-1.76 0-.3.09-.61.24-.88l12.41-21.28H7.76c-.97 0-1.76-.79-1.76-1.76 0-.48.21-.94.58-1.3L40.03.42c.33-.3.76-.42 1.21-.42C42.33 0 43 .76 43 1.79c0 .33-.06.7-.27 1L27.74 23.92h23.79c.97 0 1.79.73 1.79 1.76 0 .45-.18.94-.54 1.27L20.87 58.49c-.33.33-.82.48-1.3.48h-.01z"
                    ></path>
                    <path
                      fill="#000"
                      d="M11.3 31.85h22.01c.88 0 1.73.67 1.73 1.73 0 .39-.09.7-.36 1.12l-8.99 14.83 22.49-22.4H24.35c-1.03 0-1.76-.64-1.76-1.73 0-.58.24-.94.58-1.36l9.05-11.96L11.3 31.85zm8.26 27.12c-.97 0-1.73-.79-1.73-1.76 0-.3.09-.61.24-.88l12.41-21.28H7.76c-.97 0-1.76-.79-1.76-1.76 0-.48.21-.94.58-1.3L40.03.42c.33-.3.76-.42 1.21-.42C42.33 0 43 .76 43 1.79c0 .33-.06.7-.27 1L27.74 23.92h23.79c.97 0 1.79.73 1.79 1.76 0 .45-.18.94-.54 1.27L20.87 58.49c-.33.33-.82.48-1.3.48h-.01z"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_180_472">
                      <path
                        fill="#fff"
                        d="M0 0H47.32V58.97H0z"
                        transform="translate(6)"
                      ></path>
                    </clipPath>
                  </defs>
                </svg>
                <p className="text-sm font-medium">
                  {t("withdrawalModal.initiate")}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-xs">{fee(initiateCost, 4)}</p>
                <FeesIcon />
              </div>
            </div>

            {deployment?.family === DeploymentFamily.optimism && (
              <>
                <div className="px-3 py-1">
                  <div className="flex gap-2 items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="60"
                      height="60"
                      fill="none"
                      viewBox="0 0 60 60"
                      className="w-5 min-w-5 h-5 min-h-5"
                    >
                      <path
                        fill="#fff"
                        d="M29.82 56.07c14.498 0 26.25-11.753 26.25-26.25 0-14.498-11.752-26.25-26.25-26.25-14.497 0-26.25 11.752-26.25 26.25 0 14.497 11.753 26.25 26.25 26.25z"
                      ></path>
                      <path
                        fill="#000"
                        d="M47.35 29.82c0 .64.51 1.18 1.18 1.18h4.87c.64 0 1.18-.54 1.18-1.18 0-.64-.54-1.18-1.18-1.18h-4.87c-.67 0-1.18.51-1.18 1.18zm-2.36-8.78c.21.39.64.61 1.03.61.21 0 .42-.06.61-.15l4.21-2.42c.58-.33.76-1.06.42-1.63-.34-.57-1.06-.76-1.6-.42l-4.21 2.42c-.58.33-.79 1.06-.45 1.6l-.01-.01zm0 17.53c-.33.58-.12 1.3.45 1.63l4.21 2.42c.18.12.39.15.58.15.42 0 .82-.21 1.03-.58.33-.58.15-1.3-.42-1.63l-4.21-2.42c-.58-.33-1.3-.15-1.63.42l-.01.01zm-6.85-25.55c-.33.58-.12 1.3.42 1.63.21.09.39.15.61.15.39 0 .82-.21 1.03-.61l2.42-4.21c.33-.58.15-1.3-.42-1.6-.58-.33-1.3-.15-1.63.42l-2.42 4.21-.01.01zm0 33.6l2.42 4.21c.21.36.64.58 1.03.58.21 0 .42-.03.61-.15.58-.33.76-1.06.42-1.63l-2.42-4.21c-.33-.54-1.06-.76-1.63-.42-.54.33-.76 1.06-.42 1.63l-.01-.01zM17.01 9.99l2.42 4.21c.21.39.61.61 1.03.61.21 0 .39-.06.61-.15.54-.33.76-1.06.42-1.63l-2.42-4.21c-.33-.58-1.06-.76-1.63-.42-.58.3-.76 1.03-.42 1.6l-.01-.01zm0 39.63c-.33.58-.15 1.3.42 1.63.18.12.39.15.61.15.39 0 .82-.21 1.03-.58l2.42-4.21c.33-.58.12-1.3-.42-1.63-.58-.33-1.3-.12-1.63.42l-2.42 4.21-.01.01zm-.54-27.64c-.48.82-.21 1.97.67 2.48l11.84 6.93c.12.09.27.15.39.18.18.06.36.09.54.09 1 0 1.82-.82 1.82-1.79V6.15c0-.97-.76-1.79-1.76-1.79s-1.82.76-1.82 1.76v20.62l-9.2-5.39c-.82-.45-2-.21-2.48.64v-.01zm-8.08-4.54c-.33.58-.15 1.3.42 1.63l4.21 2.42c.18.09.39.15.61.15.39 0 .82-.21 1.03-.61.33-.54.12-1.27-.45-1.6L10 17.01a1.16 1.16 0 00-1.6.42l-.01.01zm0 24.76c.21.36.61.58 1.03.58.18 0 .39-.03.58-.15l4.21-2.42c.58-.33.79-1.06.45-1.63-.34-.57-1.06-.76-1.63-.42l-4.21 2.42c-.58.33-.76 1.06-.42 1.63l-.01-.01zM5.06 29.82c0 .64.54 1.18 1.18 1.18h4.87c.67 0 1.18-.54 1.18-1.18 0-.64-.51-1.18-1.18-1.18H6.24c-.64 0-1.18.51-1.18 1.18zm-1.49 0c0-14.5 11.75-26.25 26.25-26.25s26.25 11.75 26.25 26.25-11.75 26.25-26.25 26.25S3.57 44.32 3.57 29.82zm-3.57 0c0 16.44 13.38 29.82 29.82 29.82 16.44 0 29.82-13.38 29.82-29.82C59.64 13.38 46.26 0 29.82 0 13.38 0 0 13.38 0 29.82zm29.82 24.76c.67 0 1.18-.54 1.18-1.21v-4.84c0-.67-.51-1.21-1.18-1.21-.67 0-1.18.54-1.18 1.21v4.84c0 .67.51 1.21 1.18 1.21z"
                      ></path>
                    </svg>
                    <p className="text-sm font-medium">
                      {t("withdrawalModal.waitProve")}
                    </p>
                  </div>
                </div>

                <div
                  className={`${theme.bgMuted} rounded-lg px-3 py-2 justify-between flex items-center`}
                >
                  <div className="flex gap-2 items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="60"
                      height="60"
                      fill="none"
                      viewBox="0 0 60 60"
                      className="w-5 min-w-5 h-5 min-h-5"
                    >
                      <g clipPath="url(#clip0_180_480)">
                        <path
                          fill="#FF5"
                          d="M32.28 56.89c-5.36 0-8.23-1.15-12.47-4.69-4.45-3.66-7.96-9.93-9.23-12.32-.88-1.57-2.57-5.06-2.57-6.69 0-2.54 2.39-3.88 4.75-3.88 1.79 0 3.66.79 5 2.27.88 1.06 1.67 2.36 2.39 3.66 1.36 2.39 2.69 4.63 4.54 4.63 1.21 0 2.88-1.06 4.66-2.94.73-.79 1.39-1.57 1.85-2.21l-5.72-4.24h-6.66c-3.12 0-5.36-1.94-5.36-4.84s2-4.27 5.06-4.36c1.88-.06 4.69-.51 6.66-.51 1.42 0 2.79.21 3.97.79l1 .48c-.85-1.21-1.79-2.54-2.48-3.3-1.97-2.27-4.03-4.24-4.03-6.69s1.6-4.12 3.94-4.81C27.76 4.73 29.15 3 31.61 3c2.18 0 3.3 1.36 4.51 2.85 1.3 1.54 6.12 7.21 7.51 9.93 1.06 2.27 2.85 7.66 4.51 10.75 1.42 2.6 3.06 6.81 3.06 9.51 0 7.48-5.78 20.86-18.89 20.86l-.03-.01z"
                        ></path>
                        <path
                          fill="#000"
                          d="M26.19 12.05c0-1.15.67-1.82 1.57-2.18.73 2.94 2.88 5.45 4.54 7.33 1.97 2.15 2.24 2.94 2.75 5.96.06.51.12.97.15 1.36l-.7-.33c-.7-1.12-3.57-5.57-5.06-7.27-1.3-1.45-3.27-3.6-3.27-4.87h.02zM10.6 33.49c0-.91.88-1.57 1.91-1.57 1.27 0 2.48.39 3.3 1.33.76.88 1.42 2.03 2.12 3.27 1.94 3.27 3.57 5.9 6.75 5.9 1.97 0 4.18-1.27 6.51-3.72 1.36-1.45 3.06-3.45 3.06-4.18 0-.39-.21-.79-.54-1.03l-7.08-5.27c-.18-.15-.45-.27-.76-.27h-7.05c-2.63 0-2.79-1.76-2.79-2.3 0-1.27.79-1.79 2.6-1.82 1.94-.06 4.84-.48 6.57-.48 1.06 0 2.03.12 2.82.48l11.72 5.72c.48.24.67.27.82.27.76 0 1.3-.58 1.3-1.24 0-.48-.27-.94-.73-1.12l-3.27-1.63c-.03-.48-.12-1.7-.27-3.03-.61-3.75-1.06-4.63-3.3-7.27-2.6-3.03-4.24-4.87-4.24-8.2 0-.94.58-1.79 1.67-1.79 1.45 0 2.57 2 4.51 4.42 1.79 2.3 4.33 5.39 5.12 6.9 1.18 2.57 2.66 7.39 4.54 10.93 1.24 2.24 2.75 6.27 2.75 8.29.03 6.45-4.63 18.22-16.35 18.22-5.03 0-6.93-.91-10.84-4.09-4.12-3.36-7.48-9.35-8.72-11.62-.73-1.3-2.12-4-2.12-5.12l-.01.02zm21.68 23.4c13.11 0 18.89-13.38 18.89-20.86 0-2.69-1.63-6.9-3.06-9.51-1.67-3.09-3.45-8.48-4.51-10.75-1.39-2.72-6.21-8.39-7.51-9.93-1.21-1.48-2.33-2.85-4.51-2.85-2.45 0-3.84 1.73-4.03 4.24-2.33.7-3.94 2.36-3.94 4.81 0 2.45 2.06 4.42 4.03 6.69.7.76 1.63 2.09 2.48 3.3l-1-.48c-1.18-.58-2.54-.79-3.97-.79-1.97 0-4.78.45-6.66.51-3.06.09-5.06 1.33-5.06 4.36 0 3.03 2.24 4.84 5.36 4.84h6.66l5.72 4.24c-.45.64-1.12 1.42-1.85 2.21-1.79 1.88-3.45 2.94-4.66 2.94-1.85 0-3.18-2.24-4.54-4.63-.73-1.3-1.51-2.6-2.39-3.66-1.33-1.48-3.21-2.27-5-2.27-2.36 0-4.75 1.33-4.75 3.88 0 1.63 1.7 5.12 2.57 6.69 1.27 2.39 4.78 8.66 9.23 12.32 4.24 3.54 7.11 4.69 12.47 4.69l.03.01z"
                        ></path>
                      </g>
                      <defs>
                        <clipPath id="clip0_180_480">
                          <path
                            fill="#fff"
                            d="M0 0H43.17V53.89H0z"
                            transform="translate(8 3)"
                          ></path>
                        </clipPath>
                      </defs>
                    </svg>
                    <p className="text-sm font-medium">
                      {t("withdrawalModal.prove", {
                        base: deployment?.l1.name,
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <p className="text-xs">{fee(proveCost, 2)}</p>
                    <FeesIcon />
                  </div>
                </div>
              </>
            )}

            <div className="px-3 py-1">
              <div className="flex gap-2 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  fill="none"
                  viewBox="0 0 60 60"
                  className="w-5 min-w-5 h-5 min-h-5"
                >
                  <path
                    fill="#fff"
                    d="M29.82 56.07c14.498 0 26.25-11.753 26.25-26.25 0-14.498-11.752-26.25-26.25-26.25-14.497 0-26.25 11.752-26.25 26.25 0 14.497 11.753 26.25 26.25 26.25z"
                  ></path>
                  <path
                    fill="#000"
                    d="M47.35 29.82c0 .64.51 1.18 1.18 1.18h4.87c.64 0 1.18-.54 1.18-1.18 0-.64-.54-1.18-1.18-1.18h-4.87c-.67 0-1.18.51-1.18 1.18zm-2.36-8.78c.21.39.64.61 1.03.61.21 0 .42-.06.61-.15l4.21-2.42c.58-.33.76-1.06.42-1.63-.34-.57-1.06-.76-1.6-.42l-4.21 2.42c-.58.33-.79 1.06-.45 1.6l-.01-.01zm0 17.53c-.33.58-.12 1.3.45 1.63l4.21 2.42c.18.12.39.15.58.15.42 0 .82-.21 1.03-.58.33-.58.15-1.3-.42-1.63l-4.21-2.42c-.58-.33-1.3-.15-1.63.42l-.01.01zm-6.85-25.55c-.33.58-.12 1.3.42 1.63.21.09.39.15.61.15.39 0 .82-.21 1.03-.61l2.42-4.21c.33-.58.15-1.3-.42-1.6-.58-.33-1.3-.15-1.63.42l-2.42 4.21-.01.01zm0 33.6l2.42 4.21c.21.36.64.58 1.03.58.21 0 .42-.03.61-.15.58-.33.76-1.06.42-1.63l-2.42-4.21c-.33-.54-1.06-.76-1.63-.42-.54.33-.76 1.06-.42 1.63l-.01-.01zM17.01 9.99l2.42 4.21c.21.39.61.61 1.03.61.21 0 .39-.06.61-.15.54-.33.76-1.06.42-1.63l-2.42-4.21c-.33-.58-1.06-.76-1.63-.42-.58.3-.76 1.03-.42 1.6l-.01-.01zm0 39.63c-.33.58-.15 1.3.42 1.63.18.12.39.15.61.15.39 0 .82-.21 1.03-.58l2.42-4.21c.33-.58.12-1.3-.42-1.63-.58-.33-1.3-.12-1.63.42l-2.42 4.21-.01.01zm-.54-27.64c-.48.82-.21 1.97.67 2.48l11.84 6.93c.12.09.27.15.39.18.18.06.36.09.54.09 1 0 1.82-.82 1.82-1.79V6.15c0-.97-.76-1.79-1.76-1.79s-1.82.76-1.82 1.76v20.62l-9.2-5.39c-.82-.45-2-.21-2.48.64v-.01zm-8.08-4.54c-.33.58-.15 1.3.42 1.63l4.21 2.42c.18.09.39.15.61.15.39 0 .82-.21 1.03-.61.33-.54.12-1.27-.45-1.6L10 17.01a1.16 1.16 0 00-1.6.42l-.01.01zm0 24.76c.21.36.61.58 1.03.58.18 0 .39-.03.58-.15l4.21-2.42c.58-.33.79-1.06.45-1.63-.34-.57-1.06-.76-1.63-.42l-4.21 2.42c-.58.33-.76 1.06-.42 1.63l-.01-.01zM5.06 29.82c0 .64.54 1.18 1.18 1.18h4.87c.67 0 1.18-.54 1.18-1.18 0-.64-.51-1.18-1.18-1.18H6.24c-.64 0-1.18.51-1.18 1.18zm-1.49 0c0-14.5 11.75-26.25 26.25-26.25s26.25 11.75 26.25 26.25-11.75 26.25-26.25 26.25S3.57 44.32 3.57 29.82zm-3.57 0c0 16.44 13.38 29.82 29.82 29.82 16.44 0 29.82-13.38 29.82-29.82C59.64 13.38 46.26 0 29.82 0 13.38 0 0 13.38 0 29.82zm29.82 24.76c.67 0 1.18-.54 1.18-1.21v-4.84c0-.67-.51-1.21-1.18-1.21-.67 0-1.18.54-1.18 1.21v4.84c0 .67.51 1.21 1.18 1.21z"
                  ></path>
                </svg>
                <p className="text-sm font-medium">
                  {t("withdrawalModal.waitFinalize")}
                </p>
              </div>
            </div>

            <div
              className={`${theme.bgMuted} rounded-lg px-3 py-2 justify-between flex items-center`}
            >
              <div className="flex gap-2 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  fill="none"
                  viewBox="0 0 60 60"
                  className="w-5 min-w-5 h-5 min-h-5"
                >
                  <path
                    fill="#FF5"
                    d="M13.77 27.64c0-1.79 1.51-3.27 3.27-3.27.88 0 1.76.36 2.39 1.06l9.08 9.93 13.11-18.25c.64-.88 1.63-1.33 2.66-1.33 1.73 0 3.27 1.33 3.27 3.24 0 .67-.18 1.36-.61 1.94L31.47 42.48c-.54.79-1.48 1.33-2.45 1.33-1.12 0-2-.3-2.63-1.03L14.61 29.85c-.58-.61-.85-1.42-.85-2.21h.01zm-9.24 2.18c0-14.5 11.75-26.25 26.25-26.25s26.25 11.75 26.25 26.25-11.75 26.25-26.25 26.25S4.53 44.32 4.53 29.82zm-3.57 0c0 16.44 13.38 29.82 29.82 29.82 16.44 0 29.82-13.38 29.82-29.82C60.6 13.38 47.22 0 30.78 0 14.34 0 .96 13.38.96 29.82zm28.25 17.41c2 0 3.84-1.12 5.03-2.75l15.47-21.52a6.658 6.658 0 001.27-3.91c0-3.72-3-6.72-6.72-6.72-2.09 0-4.18 1.09-5.39 2.79L28.18 29.98l-6.24-6.84c-1.24-1.36-3-2.18-4.87-2.18a6.69 6.69 0 00-6.72 6.72c0 1.67.61 3.27 1.73 4.48l11.81 12.9c1.42 1.54 3.15 2.18 5.33 2.18l-.01-.01z"
                  ></path>
                  <path
                    fill="#5F5"
                    d="M.96 29.82c0 16.44 13.38 29.82 29.82 29.82 16.44 0 29.82-13.38 29.82-29.82C60.6 13.38 47.22 0 30.78 0 14.34 0 .96 13.38.96 29.82zm28.06 13.99c-1.12 0-2-.3-2.63-1.03L14.61 29.85c-.58-.61-.85-1.42-.85-2.21 0-1.79 1.51-3.27 3.27-3.27.88 0 1.76.36 2.39 1.06l9.08 9.93 13.11-18.25c.64-.88 1.63-1.33 2.66-1.33 1.73 0 3.27 1.33 3.27 3.24 0 .67-.18 1.36-.61 1.94L31.46 42.48c-.54.79-1.48 1.33-2.45 1.33h.01z"
                  ></path>
                  <path
                    fill="#fff"
                    d="M29.02 43.81c-1.12 0-2-.3-2.63-1.03L14.61 29.85c-.58-.61-.85-1.42-.85-2.21 0-1.79 1.51-3.27 3.27-3.27.88 0 1.76.36 2.39 1.06l9.08 9.93 13.11-18.25c.64-.88 1.63-1.33 2.66-1.33 1.73 0 3.27 1.33 3.27 3.24 0 .67-.18 1.36-.61 1.94L31.46 42.48c-.54.79-1.48 1.33-2.45 1.33h.01z"
                  ></path>
                  <path
                    fill="#000"
                    d="M13.77 27.64c0-1.79 1.51-3.27 3.27-3.27.88 0 1.76.36 2.39 1.06l9.08 9.93 13.11-18.25c.64-.88 1.63-1.33 2.66-1.33 1.73 0 3.27 1.33 3.27 3.24 0 .67-.18 1.36-.61 1.94L31.47 42.48c-.54.79-1.48 1.33-2.45 1.33-1.12 0-2-.3-2.63-1.03L14.61 29.85c-.58-.61-.85-1.42-.85-2.21h.01zm-9.24 2.18c0-14.5 11.75-26.25 26.25-26.25s26.25 11.75 26.25 26.25-11.75 26.25-26.25 26.25S4.53 44.32 4.53 29.82zm-3.57 0c0 16.44 13.38 29.82 29.82 29.82 16.44 0 29.82-13.38 29.82-29.82C60.6 13.38 47.22 0 30.78 0 14.34 0 .96 13.38.96 29.82zm28.25 17.41c2 0 3.84-1.12 5.03-2.75l15.47-21.52a6.658 6.658 0 001.27-3.91c0-3.72-3-6.72-6.72-6.72-2.09 0-4.18 1.09-5.39 2.79L28.18 29.98l-6.24-6.84c-1.24-1.36-3-2.18-4.87-2.18a6.69 6.69 0 00-6.72 6.72c0 1.67.61 3.27 1.73 4.48l11.81 12.9c1.42 1.54 3.15 2.18 5.33 2.18l-.01-.01z"
                  ></path>
                </svg>
                <p className="text-sm font-medium">
                  {t("withdrawalModal.finalize", { base: deployment?.l1.name })}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-xs">{fee(finalizeCost, 2)}</p>
                <FeesIcon />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 py-4 md:py-6">
            <div className="pl-4 flex gap-2">
              <Checkbox
                id="timeframe"
                checked={checkbox1}
                onCheckedChange={(c) => setCheckbox1(c as boolean)}
              />
              <label
                htmlFor="timeframe"
                className="text-[11px] text-zinc-500 dark:text-zinc-400 tracking-tighter"
              >
                {t(
                  deployment?.family === DeploymentFamily.arbitrum
                    ? "withdrawalModal.arbCheckbox1"
                    : "withdrawalModal.opCheckbox1",
                  {
                    base: deployment?.l1.name,
                  }
                )}
              </label>
            </div>
            <div className="pl-4 flex gap-2">
              <Checkbox
                id="speed"
                checked={checkbox2}
                onCheckedChange={(c) => setCheckbox2(c as boolean)}
              />
              <label
                htmlFor="speed"
                className="text-[11px] text-zinc-500 dark:text-zinc-400 tracking-tighter"
              >
                {t("withdrawalModal.checkbox2")}
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className={`flex w-full justify-center rounded-full px-3 py-6 text-sm font-bold leading-6 text-white shadow-sm ${theme.accentText} ${theme.accentBg}`}
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
              disabled={!checkbox1 || !checkbox2}
            >
              {t("withdrawalModal.continue")}
            </Button>

            {/* TODO: Create guide page and add link */}
            {/* {isSuperbridge && (
              <Link
                className={`text-center text-sm font-bold tracking-tight  hover:underline ${theme.textColor}`}
                href={"#"}
              >
                {t("withdrawalModal.viewAlternateBridges")}
              </Link>
            )} */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
