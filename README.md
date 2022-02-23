# 🏗 Metatransaction MultiSig Safes

> Create and manage MultiSig safes that work based on metatransactions.
> **Users** can create and manage their multisig smart contracts. 
> Based on a **smart contract factory** 🏭

## Use Case

**Personal use**: Any use case for a **regular multisig safe**, but additionally **tx costs** should be kept **minimal**.

**Metatransactions** enable gasless blockchain interaction (kind of). 

### Regular Multisig
Several signers **confirm** a multisig transaction. This happens on-chain, so each signer performs a confirmation transaction. 
### Metatransaction Multisig (this app)
Let the signers merely give their signature (off-chain). With all needed signatures collected, only one on-chain transaction is needed. The multisig contract verifies that enough valid signatures were given.

## @dev Design Decisions

TODO write out

## Smart Contracts
Sorting the signatures on frontend for cheaper duplicate prevention. More expensive would have been to do it in solidity.

Refer to older meta multi sig implementation -> contract code suboptimal. took out the nonces here because they are not needed.
Nonces are needed in a 3rd party forwarder setup. Elaborate on that

## Moralis 
Used as a backend to store transactions.
Optimize to scale: retrieving safes for owner X should do the whole query on the backend
Frontend consistency requires contract interaction via this frontend only. (should be fine for our use cases)
Moralis doesnt reliably perform subscription updates
Moralis doesnt sync events with indexed address arrays


Tx Fees kept to a minimum, but with owners management that allows for enumerating all the owners on-chain (better UX, safe as well (not rely on moralis server))

## Frontend UX
UX can be improved. No pagination yet. Responsive: Not comfortable below 450px width.
Stuck to 3 elementary types of inner transaction, but extendable.







> If you're an absolute noob to web3, check out the [Ethereum Speed Run](https://twitter.com/austingriffith/status/1421129057500946435).

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

# 🏗 Scaffold-Eth Typescript

## Typescript

This is the typescript repo of scaffold.eth. The directories that you'll use are:

```bash
packages/vite-app-ts/
packages/hardhat-ts/
```

## Quick Start

Running the app

1. install your dependencies

   ```bash
   yarn install
   ```

2. start a hardhat node

   ```bash
   yarn chain
   ```

3. run the app, `open a new command prompt`

   ```bash
   # build hardhat & external contracts types
   yarn contracts:build 
   # deploy your hardhat contracts
   yarn deploy
   # start vite 
   yarn start 
   ```
   
## Guides

- Check out [eth-hooks docs](https://scaffold-eth.github.io/eth-hooks/docs/overview) for example of how to use hooks
- you can look at [speedrun ethereum](https://speedrunethereum.com/) to get started with scaffold-eth-typescript and web3.  
  - 🏁 Make sure to click on the typescript tab!


## Overview

Everything you need to build on Ethereum! 🚀 Quickly experiment with Solidity using a frontend that adapts to your smart contract:

![image](https://user-images.githubusercontent.com/2653167/124158108-c14ca380-da56-11eb-967e-69cde37ca8eb.png)

- 🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat-ts/contracts`
- 📝 Edit your frontend `MainPage.jsx` in `packages/vite-app-ts/src`
- 💼 Edit your deployment scripts in `packages/hardhat-ts/deploy`
- 📱 Open http://localhost:3000 to see the app

## More Information!
### 📚 Documentation

Documentation, tutorials, challenges, and many more resources, visit: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)

Eth-hooks documentation is [here](https://scaffold-eth.github.io/eth-hooks/).  Learn how to use the contexts here.


### 🔭 Learning Solidity

Read the docs: https://docs.soliditylang.org

Go through each topic from [solidity by example](https://solidity-by-example.org) editing `YourContract.sol` in **🏗 scaffold-eth**


### 🏃💨 Speedrun Ethereum
Register as a builder [here](https://speedrunethereum.com) and start on some of the challenges and build a portfolio.

### 🛠 Buidl

Check out all the [active branches](https://github.com/austintgriffith/scaffold-eth/branches/active), [open issues](https://github.com/austintgriffith/scaffold-eth/issues), and join/fund the 🏰 [BuidlGuidl](https://BuidlGuidl.com)!

[Follow the full Ethereum Speed Run](https://medium.com/@austin_48503/%EF%B8%8Fethereum-dev-speed-run-bd72bcba6a4c)


### 💌 P.S.

You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

### 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

### 🙏🏽 Support us!

Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!

