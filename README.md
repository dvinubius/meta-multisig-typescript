# 🏗 Metatransaction MultiSig Manager

> Create and manage multi sig contracts which execute metatransactions.
> 
> **Users** can create and manage their multi sig smart contracts. 
> 
> **Metatransactions** allow for signatures to be given off-chain (no gas fees to pay except once, when all required signatures have been given)
> 
> MultiSigs management is based on a **smart contract factory** 🏭

<img src="https://user-images.githubusercontent.com/32189942/155862105-e21d8114-96f5-4b33-ab3d-d7bac4149637.png" width=450><img src="https://user-images.githubusercontent.com/32189942/155862098-bc047f2a-525c-4d4e-95b8-7cfe72b63150.png" width=450>


<img src="https://user-images.githubusercontent.com/32189942/155862060-99b0beb7-e8ad-43d6-93dc-1b6e9b2f9cce.png" width=450> <img src="https://user-images.githubusercontent.com/32189942/155862076-5288c75a-9c05-4ef6-95d2-3ea4c3875aaf.png" width=450>


## Live on [Rinkeby](https://meta-multisig.surge.sh/) 🤩

## Use Case

**It's for personal use / within groups of mutual trust** (not a forwarder contract) 
It covers "usual: use casess for a **regular multi sig contract**, but additionally **tx costs** are kept **minimal**.
As a user I can create a multi sig contract to hold funds for me.
I can set up several signer accounts that can trigger my contract's functions.
My contract's built-in functions include
- basic transfer of funds
- adding a trusted signer
- removing a trusted signer

**Metatransactions** enable gasless blockchain interaction (kind of). 

### The regular Multi Sig
Several signers **confirm** a multisig transaction. This happens on-chain, so each signer performs a confirmation transaction. 
### Meta Transaction Multi Sig (this app)
Let the signers merely give their signature (off-chain). With all needed signatures collected, **only 1 on-chain transaction is needed**. The multisig contract verifies that enough valid signatures were given.

In this particular project we limited the functionality to 3 basic types of transaction:
- transfer funds from multisig
- add multisig signer
- remove multisig signer
By following the design pattern you should easily be able to extend the functionality.

> If you're an absolute noob to web3, check out the [Ethereum Speed Run](https://twitter.com/austingriffith/status/1421129057500946435).

> ## @dev ⚠️ Production Bundle Issue + Workaround
> 
> We were surprised when the production bundle failed to work because of moralis throwing a `TypeError: Right-hand side of 'instanceof' is not callable`.
> The only solution we were able to find for this involves **changing code in the react-moralis dependency**.
> 1. go to `packages/vite-app-ts/node_modules/react-moralis/lib/index.esm.js`
> 2. change `import MoralisImport from 'moralis';` 
> to `import MoralisImport from 'moralis/dist/moralis.js';`
> 
> You may not encounter the issue above due to updates in the react-moralis package. 

## @dev Design Decisions
### On-Chain
Signatures are always **sorted on the frontend** before a metatransaction is executed. This enables cheaper duplicate prevention. The more expensive solution (in terms of gas costs) would have been to do a duplicate check on-chain.

The older scaffold-eth meta multi sig [implementation](https://github.com/scaffold-eth/scaffold-eth-examples/tree/meta-multi-sig) is not optimal in terms of the contract code. 

In the **present repo** 
- we took out the streaming functionality for simplicity
- we took out the nonces because there is no need for them (see below)
- we execute metatransactions without any value attached; metatransactions with `transferFunds(address, uint256)` as calldata have everything encoded in the calldata and they require the multisig to have sufficient balance beforehand
- metatransaction execution always makes the multisig contract perform a call to itself with the pertaining "inner" calldata
  

**⛽️ Gas costs** are reduced to a minimum.
However, we keep an array of the owners on-chain (`address[] public owners` and all the updates that go with it).
This storage allows for enumerating the owners of a multisig. It helps to provide better UX on the frontend. In some rare cases you may want to interact with a multisig contract directly, not via the web frontend and not relying on the Moralis backend. 
The owners array in EVM storage seems like a small price to pay, but in the end you could eliminate it, retrieve owners via Moralis and have an even more gas-efficient smart contract.

The **hardhat console** contract is wired up for dev purposes, you may want to remove it in production, especially if you deploy to Ethereum and you care about deployment costs.

> #### 📝 Nonces
> As a sidenote, nonces do make sense for metatransactions, but rather in a scenario where several non-trusting parties are involved.
> 
> More specifically, when there is a (supposedly) trusted 3rd party **forwarder**/**executor** that takes signed messages from users and executes them on their behalf, thereby paying the gas costs. Nonces prevent the forwarder from executing the same transaction multiple times. 
> 
> Attempts have been made to standardize solutions for this kind of scenario via [EIP-2771](https://eips.ethereum.org/EIPS/eip-2771). See the work from OpenZeppelin [here](https://docs.openzeppelin.com/contracts/4.x/api/metatx).

### Moralis Backend
We use it to 
- store metaTransactions
- index on-chain events (creating multisigs, changing owners of multisigs)

Storing metatransactions was the primary reason to use a backend, but since Moralis can easily index contract events, it's convenient to use for queries and it reduces the number of RPC requests.
  
The Moralis integration is **optimized to scale**:
When user logs in with account X, the query for "My Vaults" runs on the backend via cloud code, returning the vaults where X is currently a co-owner. 
- This includes vaults that initially did not have X as a co-owner, but added X later.
- This excludes vaults where X initially was a co-owner, but then was excluded.


**⚠️ Frontend consistency**. The frontend displays on-chain data correctly only as long as contract interactions go through this frontend. This should be fine for our use case.

#### Suboptimal solutions
At the time of dev Moralis wasn't reliably performing query subscription updates, therefore we had to also perform some vanilla web3 event listening.
Also, Moralis wasn't reliably syncing events with indexed address array arguments (`event Foo(address[] indexed bar)`), so we had to avoid indexing address array event args.

If you want to develop on top of this repo, learn from the [docs](https://docs.moralis.io/introduction/readme) how to use Moralis. You need to: 
- setup a server
- sync events from your MSFactory contract (when vaults are created and when owners changes happen)
- configure access to Moralis DB tables (by default each table has public read/write/create_field access)

### Frontend UX
The should be improved for production.
- No pagination yet (necessary for executed transactions, they add up over time)
- Suboptimal responsiveness: Not very comfortable below 450px width. But still mobile friendly to a large extent

### eth-components
Instead of using the dependency `eth-components` (v3) we replicated those components locally in order to tweak some of them. 
We kept them in the dependencies though. 

In order to **use the eth-components package**, change all imports like
`... from '~~/eth-components/...'`
to
`... from 'eth-components/...'`;

## Features of the Scaffold Eth Contract Factory Setup

🧪 Quickly experiment with Solidity using a frontend that adapts to your smart contract:

![image](https://user-images.githubusercontent.com/2653167/124158108-c14ca380-da56-11eb-967e-69cde37ca8eb.png)

🚀 Start with a basic **master-detail UI**, customize it for your needs

<img src="https://user-images.githubusercontent.com/32189942/147391738-36904823-7dbc-4e61-b9e8-ccea1f7abaf6.png" width="680">

𝌋 **Debug your contracts** with a simil master-detail UI

<img src="https://user-images.githubusercontent.com/32189942/147391972-3166a735-f5c8-4a04-8b50-778e13c5f020.png" width="650">

# 🏗 Scaffold-Eth Typescript

This is based on the typescript repo of scaffold.eth. The directories that you'll use are:

```bash
packages/vite-app-ts/
packages/hardhat-ts/
```

# 🏄‍♂️ Building on scaffold-eth-typescript

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)


> install your dependencies:

```bash
yarn install
```

> in a second terminal window, start a hardhat node:

```bash
yarn chain
```

> in a third terminal window, 🛰 deploy your contract and start the app:

```bash
# build hardhat & external contracts types
yarn contracts:build 
# deploy your hardhat contracts
yarn deploy
# start vite 
yarn start 
```

🌍 You need an RPC key for production deployments/Apps, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js`

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `MainPage.tsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app


## Guides

- Check out [eth-hooks docs](https://scaffold-eth.github.io/eth-hooks/docs/overview) for example of how to use hooks
- you can look at [speedrun ethereum](https://speedrunethereum.com/) to get started with scaffold-eth-typescript and web3.  
  - 🏁 Make sure to click on the typescript tab!

### 🛠 Buidl

Check out all the [active branches](https://github.com/austintgriffith/scaffold-eth/branches/active), [open issues](https://github.com/austintgriffith/scaffold-eth/issues), and join/fund the 🏰 [BuidlGuidl](https://BuidlGuidl.com)!

[Follow the full Ethereum Speed Run](https://medium.com/@austin_48503/%EF%B8%8Fethereum-dev-speed-run-bd72bcba6a4c)


### 💌 P.S.

You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

### 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

### 🙏🏽 Support us!

Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!

