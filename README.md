# Manic Award Token

`ManicAwardToken` 스마트컨트랙트 프로젝트입니다. 현재 개발/테스트/배포 도구는 Hardhat + TypeScript 기준입니다.

## Token Status

- 추가 민팅 없음
- 총 발행량 100억 MAT
- 소수점 8자리
- 초기 팀별 배분
- 누구나 자기 토큰만 소각 가능
- 관리자 강제 소각 없음
- Pause / Blacklist / Tax 없음
- 외부 ERC20 회수용 `recoverERC20` 함수는 owner 전용

## Current Testnet Deployment

- Network: BNB Smart Chain Testnet
- Chain ID: `97`
- Compiler: Solidity `0.8.28`, EVM `cancun`, optimizer runs `200`
- Contract: `0xE6d4CE9027833752698E501e4A2a733eAC460E9e`
- BscScan: `https://testnet.bscscan.com/address/0xE6d4CE9027833752698E501e4A2a733eAC460E9e`
- Status: deployed and verified

현재 testnet 배포본은 이미 배포 및 검증이 완료된 기존 컨트랙트입니다. 현재 소스는 총 발행량과 초기 배분량을 100억 MAT 기준으로 변경했으므로, 이 변경을 testnet 또는 mainnet에 반영하려면 새 배포가 필요합니다.

## Project Structure

```text
mat/
├── hardhat.config.ts
├── package.json
├── scripts/
│   ├── constructor-args.ts
│   ├── deploy.ts
│   └── verify.ts
├── contracts/
│   ├── MAT.sol
│   └── Lock.sol
└── test/
    └── MAT.test.ts
```

## Environment

`.env` 예시:

```shell
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
PRIVATE_KEY=<deployer_private_key>
ADMIN_WALLET=<admin_wallet>
TEAM_WALLET=<team_wallet>
REWARD_WALLET=<reward_wallet>
MARKETING_WALLET=<marketing_wallet>
LIQUIDITY_WALLET=<liquidity_wallet>
RESERVE_WALLET=<reserve_wallet>
ETHERSCAN_API_KEY=<etherscan_v2_api_key>
```

`.env`와 private key는 Git에 커밋하지 않습니다.

## Commands

```shell
npm install
```

```shell
npm run build
```

```shell
npm test
```

```shell
npm run deploy:bsc-testnet
```

```shell
npm run verify:bsc-testnet
```

`verify:bsc-testnet`은 현재 소스 기준으로 새로 배포한 주소만 검증합니다.

```shell
export MAT_CONTRACT_ADDRESS=<newly_deployed_mat_contract_address>
export ETHERSCAN_API_KEY=<etherscan_v2_api_key>
npm run verify:bsc-testnet
```

## Generated Files

아래 Hardhat 산출물은 프로젝트 내부에 생성하지 않고 Git에도 포함하지 않습니다.

```text
artifacts/
cache/
typechain-types/
```

현재 설정은 산출물을 임시 경로로 보냅니다.

```text
/tmp/ethers-mat-hardhat/artifacts
/tmp/ethers-mat-hardhat/cache
```
