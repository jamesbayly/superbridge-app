/**
 * Generated by orval v6.24.0 🍺
 * Do not edit manually.
 * API
 * API docs
 * OpenAPI spec version: 1.0
 */
import type { BridgeNftChainConfigDto } from './bridgeNftChainConfigDto';

export interface BridgeNftDto {
  image?: string;
  localConfig: BridgeNftChainConfigDto;
  name: string;
  remoteConfig: BridgeNftChainConfigDto;
  tokenId: string;
  tokenUri?: string;
}
