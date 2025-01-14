/**
 * Generated by orval v6.24.0 🍺
 * Do not edit manually.
 * API
 * API docs
 * OpenAPI spec version: 1.0
 */
import type { DeploymentDto } from './deploymentDto';
import type { ConfirmationDto } from './confirmationDto';
import type { BridgeWithdrawalDtoMetadata } from './bridgeWithdrawalDtoMetadata';
import type { OptimismTransactionType } from './optimismTransactionType';

export interface BridgeWithdrawalDto {
  createdAt: string;
  deployment: DeploymentDto;
  finalise?: ConfirmationDto;
  id: string;
  l1ChainId: number;
  l2ChainId: number;
  metadata: BridgeWithdrawalDtoMetadata;
  prove?: ConfirmationDto;
  status: number;
  type: OptimismTransactionType;
  updatedAt: string;
  withdrawal: ConfirmationDto;
}
