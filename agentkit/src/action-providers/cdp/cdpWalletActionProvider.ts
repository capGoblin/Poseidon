import { Coinbase } from "@coinbase/coinbase-sdk";
import { z } from "zod";

import { CreateAction } from "../actionDecorator";
import { ActionProvider } from "../actionProvider";
import { Network } from "../../network";
import { CdpWalletProvider, CdpProviderConfig } from "../../wallet-providers";

import { SolidityVersions, POOL_ABI, ERC20_ABI } from "./constants";
import {
  DeployContractSchema,
  DeployNftSchema,
  DeployTokenSchema,
  TradeSchema,
  AddLiquiditySchema,
  ApproveTokensSchema,
} from "./schemas";

/**
 * CdpWalletActionProvider is an action provider for Cdp.
 *
 * This provider is used for any action that requires a CDP Wallet.
 */
export class CdpWalletActionProvider extends ActionProvider<CdpWalletProvider> {
  /**
   * Constructor for the CdpWalletActionProvider class.
   *
   * @param config - The configuration options for the CdpWalletActionProvider.
   */
  constructor(config: CdpProviderConfig = {}) {
    super("cdp_wallet", []);

    if (config.apiKeyName && config.apiKeyPrivateKey) {
      Coinbase.configure({ apiKeyName: config.apiKeyName, privateKey: config.apiKeyPrivateKey });
    } else {
      Coinbase.configureFromJson();
    }
  }

  /**
   * Deploys a contract.
   *
   * @param walletProvider - The wallet provider to deploy the contract from
   * @param args - The input arguments for the action
   * @returns A message containing the deployed contract address and details
   */
  @CreateAction({
    name: "deploy_contract",
    description: `
Deploys smart contract with required args: solidity version (string), solidity input json (string), contract name (string), and optional constructor args (Dict[str, Any])

Input json structure:
{"language":"Solidity","settings":{"remappings":[],"outputSelection":{"*":{"*":["abi","evm.bytecode"]}}},"sources":{}}

You must set the outputSelection to {"*":{"*":["abi","evm.bytecode"]}} in the settings. The solidity version must be >= 0.8.0 and <= 0.8.28.

Sources should contain one or more contracts with the following structure:
{"contract_name.sol":{"content":"contract code"}}

The contract code should be escaped. Contracts cannot import from external contracts but can import from one another.

Constructor args are required if the contract has a constructor. They are a key-value
map where the key is the arg name and the value is the arg value. Encode uint/int/bytes/string/address values as strings, boolean values as true/false. For arrays/tuples, encode based on contained type.`,
    schema: DeployContractSchema,
  })
  async deployContract(
    walletProvider: CdpWalletProvider,
    args: z.infer<typeof DeployContractSchema>,
  ): Promise<string> {
    try {
      const solidityVersion = SolidityVersions[args.solidityVersion];

      const contract = await walletProvider.deployContract({
        solidityVersion: solidityVersion,
        solidityInputJson: args.solidityInputJson,
        contractName: args.contractName,
        constructorArgs: args.constructorArgs ?? {},
      });

      const result = await contract.wait();

      return `Deployed contract ${
        args.contractName
      } at address ${result.getContractAddress()}. Transaction link: ${result
        .getTransaction()!
        .getTransactionLink()}`;
    } catch (error) {
      return `Error deploying contract: ${error}`;
    }
  }

  /**
   * Deploys an NFT (ERC-721) token collection onchain from the wallet.
   *
   * @param walletProvider - The wallet provider to deploy the NFT from.
   * @param args - The input arguments for the action.
   * @returns A message containing the NFT token deployment details.
   */
  @CreateAction({
    name: "deploy_nft",
    description: `This tool will deploy an NFT (ERC-721) contract onchain from the wallet. 
  It takes the name of the NFT collection, the symbol of the NFT collection, and the base URI for the token metadata as inputs.`,
    schema: DeployNftSchema,
  })
  async deployNFT(
    walletProvider: CdpWalletProvider,
    args: z.infer<typeof DeployNftSchema>,
  ): Promise<string> {
    try {
      const nftContract = await walletProvider.deployNFT({
        name: args.name,
        symbol: args.symbol,
        baseURI: args.baseURI,
      });

      const result = await nftContract.wait();

      const transaction = result.getTransaction()!;
      const networkId = walletProvider.getNetwork().networkId;
      const contractAddress = result.getContractAddress();

      return [
        `Deployed NFT Collection ${args.name}:`,
        `- to address ${contractAddress}`,
        `- on network ${networkId}.`,
        `Transaction hash: ${transaction.getTransactionHash()}`,
        `Transaction link: ${transaction.getTransactionLink()}`,
      ].join("\n");
    } catch (error) {
      return `Error deploying NFT: ${error}`;
    }
  }

  /**
   * Deploys a token.
   *
   * @param walletProvider - The wallet provider to deploy the token.
   * @param args - The arguments for the token deployment.
   * @returns The deployed token.
   */
  @CreateAction({
    name: "deploy_token",
    description: `This tool will deploy an ERC20 token smart contract. It takes the token name, symbol, and total supply as input. 
The token will be deployed using the wallet's default address as the owner and initial token holder.`,
    schema: DeployTokenSchema,
  })
  async deployToken(walletProvider: CdpWalletProvider, args: z.infer<typeof DeployTokenSchema>) {
    try {
      const tokenContract = await walletProvider.deployToken({
        name: args.name,
        symbol: args.symbol,
        totalSupply: args.totalSupply,
      });

      const result = await tokenContract.wait();

      return `Deployed ERC20 token contract ${args.name} (${args.symbol}) with total supply of ${
        args.totalSupply
      } tokens at address ${result.getContractAddress()}. Transaction link: ${result
        .getTransaction()!
        .getTransactionLink()}`;
    } catch (error) {
      return `Error deploying token: ${error}`;
    }
  }

  /**
   * Trades a specified amount of a from asset to a to asset for the wallet.
   *
   * @param walletProvider - The wallet provider to trade the asset from.
   * @param args - The input arguments for the action.
   * @returns A message containing the trade details.
   */
  @CreateAction({
    name: "trade",
    description: `This tool will trade a specified amount of a 'from asset' to a 'to asset' for the wallet.
It takes the following inputs:
- The amount of the 'from asset' to trade
- The from asset ID to trade 
- The asset ID to receive from the trade

Important notes:
- Trades are only supported on mainnet networks (ie, 'base-mainnet', 'base', 'ethereum-mainnet', 'ethereum', etc.)
- Never allow trades on any non-mainnet network (ie, 'base-sepolia', 'ethereum-sepolia', etc.)
- When selling a native asset (e.g. 'eth' on base-mainnet), ensure there is sufficient balance to pay for the trade AND the gas cost of this trade`,
    schema: TradeSchema,
  })
  async trade(
    walletProvider: CdpWalletProvider,
    args: z.infer<typeof TradeSchema>,
  ): Promise<string> {
    try {
      const tradeResult = await walletProvider.createTrade({
        amount: args.amount,
        fromAssetId: args.fromAssetId,
        toAssetId: args.toAssetId,
      });

      const result = await tradeResult.wait();

      return `Traded ${args.amount} of ${args.fromAssetId} for ${result.getToAmount()} of ${
        args.toAssetId
      }.\nTransaction hash for the trade: ${result
        .getTransaction()
        .getTransactionHash()}\nTransaction link for the trade: ${result
        .getTransaction()
        .getTransactionLink()}`;
    } catch (error) {
      return `Error trading assets: ${error}`;
    }
  }

  /**
   * Adds liquidity to a pool.
   *
   * @param walletProvider - The wallet provider to use
   * @param args - The arguments for adding liquidity
   * @returns A message with the transaction details
   */
  @CreateAction({
    name: "add_liquidity",
    description: `This tool will add liquidity to a pool using ETH and tokens.
It takes the following inputs:
- token: The token address to add liquidity for
- ethAmount: The amount of ETH to add as liquidity (in wei)
- minTokens: The minimum amount of tokens to receive
- contractAddress: The router contract address

Note: Make sure you have enough ETH and tokens before adding liquidity.`,
    schema: AddLiquiditySchema,
  })
  async addLiquidity(
    walletProvider: CdpWalletProvider,
    args: z.infer<typeof AddLiquiditySchema>,
  ): Promise<string> {
    try {
      const abiCopy = ERC20_ABI.map(item => ({
        ...item,
        inputs: [...item.inputs],
        outputs: [...(item.outputs || [])],
      }));

      const result = await walletProvider.invokeContract({
        contractAddress: args.contractAddress,
        method: "swapETHToToken",
        args: {
          _token: args.token,
          _ethAmount: args.ethAmount,
          _minTokens: args.minTokens,
        },
        abi: abiCopy,
      });

      return `Successfully added liquidity. Transaction hash: ${result}`;
    } catch (error) {
      return `Error adding liquidity: ${error}`;
    }
  }

  /**
   * Approves tokens for a pool.
   *
   * @param walletProvider - The wallet provider to use
   * @param args - The input arguments for the action
   * @returns A message with the transaction details
   */
  @CreateAction({
    name: "approve_tokens",
    description: `This tool will read token addresses from a pool and approve them for a spender.
It takes the following inputs:
- poolAddress: The address of the pool to read token addresses from
- spenderAddress: The address to approve tokens for (router address)`,
    schema: ApproveTokensSchema,
  })
  async approveTokens(
    walletProvider: CdpWalletProvider,
    args: z.infer<typeof ApproveTokensSchema>,
  ): Promise<string> {
    try {
      console.log("Starting approveTokens with args:", args);

      // Read token addresses
      console.log("Reading token0...");
      const token0 = (await walletProvider.readContract({
        address: args.poolAddress as `0x${string}`,
        abi: POOL_ABI,
        functionName: "token0",
      })) as `0x${string}`;
      console.log("Token0 address:", token0);

      console.log("Reading token1...");
      const token1 = (await walletProvider.readContract({
        address: args.poolAddress as `0x${string}`,
        abi: POOL_ABI,
        functionName: "token1",
      })) as `0x${string}`;
      console.log("Token1 address:", token1);

      // Approve both tokens
      const maxApproval = BigInt(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      );
      console.log("Max approval amount:", maxApproval.toString());

      const abiCopy = ERC20_ABI.map(item => ({
        ...item,
        inputs: [...item.inputs],
        outputs: [...(item.outputs || [])],
      }));
      console.log("Approving token0...");
      const approve0 = await walletProvider.invokeContract({
        contractAddress: token0,
        method: "approve",
        args: {
          spender: args.spenderAddress,
          amount: maxApproval.toString(),
        },
        abi: abiCopy,
      });
      console.log("Token0 approval result:", approve0);

      await walletProvider.waitForTransactionReceipt(approve0);

      console.log("Approving token1...");
      const approve1 = await walletProvider.invokeContract({
        contractAddress: token1,
        method: "approve",
        args: {
          spender: args.spenderAddress,
          amount: maxApproval.toString(),
        },
        abi: abiCopy,
      });
      console.log("Token1 approval result:", approve1);

      await walletProvider.waitForTransactionReceipt(approve1);

      return `Successfully approved tokens:
Token0 (${token0}): ${approve0}
Token1 (${token1}): ${approve1}`;
    } catch (error) {
      console.error("Detailed error in approveTokens:", error);
      return `Error approving tokens: ${error}`;
    }
  }

  /**
   * Checks if the Cdp action provider supports the given network.
   *
   * @param _ - The network to check.
   * @returns True if the Cdp action provider supports the network, false otherwise.
   */
  supportsNetwork = (_: Network) => true;
}

export const cdpWalletActionProvider = (config: CdpProviderConfig = {}) =>
  new CdpWalletActionProvider(config);
