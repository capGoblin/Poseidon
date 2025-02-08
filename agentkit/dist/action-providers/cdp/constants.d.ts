export declare const SolidityVersions: {
    readonly "0.8.28": "0.8.28+commit.7893614a";
    readonly "0.8.27": "0.8.27+commit.40a35a09";
    readonly "0.8.26": "0.8.26+commit.8a97fa7a";
    readonly "0.8.25": "0.8.25+commit.b61c2a91";
    readonly "0.8.24": "0.8.24+commit.e11b9ed9";
    readonly "0.8.23": "0.8.23+commit.f704f362";
    readonly "0.8.22": "0.8.22+commit.4fc1097e";
    readonly "0.8.21": "0.8.21+commit.d9974bed";
    readonly "0.8.20": "0.8.20+commit.a1b79de6";
    readonly "0.8.19": "0.8.19+commit.7dd6d404";
    readonly "0.8.18": "0.8.18+commit.87f61d96";
    readonly "0.8.17": "0.8.17+commit.8df45f5f";
    readonly "0.8.16": "0.8.16+commit.07a7930e";
    readonly "0.8.15": "0.8.15+commit.e14f2714";
    readonly "0.8.14": "0.8.14+commit.80d49f37";
    readonly "0.8.13": "0.8.13+commit.abaa5c0e";
    readonly "0.8.12": "0.8.12+commit.f00d7308";
    readonly "0.8.11": "0.8.11+commit.d7f03943";
    readonly "0.8.10": "0.8.10+commit.fc410830";
    readonly "0.8.9": "0.8.9+commit.e5eed63a";
    readonly "0.8.8": "0.8.8+commit.dddeac2f";
    readonly "0.8.7": "0.8.7+commit.e28d00a7";
    readonly "0.8.6": "0.8.6+commit.11564f7e";
    readonly "0.8.5": "0.8.5+commit.a4f2e591";
    readonly "0.8.4": "0.8.4+commit.c7e474f2";
    readonly "0.8.3": "0.8.3+commit.8d00100c";
    readonly "0.8.2": "0.8.2+commit.661d1103";
    readonly "0.8.1": "0.8.1+commit.df193b15";
    readonly "0.8.0": "0.8.0+commit.c7dfd78e";
};
/**
 * The ABI for the Pool contract.
 */
export declare const POOL_ABI: readonly [{
    readonly inputs: readonly [];
    readonly name: "token0";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "token1";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}];
/**
 * The ABI for the ERC20 contract.
 */
export declare const ERC20_ABI: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "approve";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
