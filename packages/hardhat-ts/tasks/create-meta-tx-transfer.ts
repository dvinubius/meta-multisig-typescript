import { task } from 'hardhat/config';

const createCalldata = (hre, to, multiSigVault): string => {
  const amountStr = hre.ethers.utils.parseUnits('0.1');
  return multiSigVault.interface.encodeFunctionData('transferFunds', [to, amountStr]);
};

task('create-meta-tx-transfer', 'Creta Metatransaction with transfer call')
  .addParam('factory', 'Factory Contract')
  .addParam('idx', 'MultiSig Contract index')
  .setAction(async (taskArgs, hre) => {
    const factory = await hre.ethers.getContractAt('MSFactory', taskArgs.factory);
    const multiSigAddress = await factory.getContractById(taskArgs.idx);
    const multiSig = await hre.ethers.getContractAt('MultiSigVault', multiSigAddress);

    const signers = await hre.ethers.getSigners();

    const callData = createCalldata(hre, signers[0].address, multiSig);
    const txHash = (await multiSig.getTransactionHash(callData)) as string;

    console.log('txHash', txHash);

    const signature = await signers[0].signMessage(ethers.utils.arrayify(txHash));
    console.log('signature', signature);

    const recover = await multiSig.recover(txHash, signature);
    console.log('recover', recover);

    const isOwner = await multiSig.isOwner(recover);
    console.log('isOwner', isOwner);

    if (isOwner) {
      const tx = await multiSig.executeTransaction(callData, [signature]);
      await tx.wait();
    } else {
      console.log('Not owner');
    }
  });

/**
   * 
   * 

> let factoryAddress = '0x0E801D84Fa97b50751Dbf25036d067dCf18858bF';

> let signer = (await ethers.getSigners())[0];
> let factoryContract = await ethers.getContractAt('MSFactory', factoryAddress);
> let createMultiSigTx = await factoryContract.createMultiSigVault("First", ["0x281f0d74Fa356C17E36603995e0f50D298d4a5A9", signer.address], 1);

> let multiSigContract = await ethers.getContractAt('MultiSigVault', await factoryContract.contractById(0));

> let transferCallData = multiSigContract.interface.encodeFunctionData('transferFunds', [signer.address, ethers.utils.parseUnits("0.1")])

> let transferMetaTxHash = await multiSigContract.getTransactionHash(transferCallData)
> let transferMetaTxSignature = await signer.signMessage(ethers.utils.arrayify(transferMetaTxHash))
> let transferMetaTxSignerRecover = await multiSigContract.recover(transferMetaTxHash, transferMetaTxSignature)

> await signer.sendTransaction({to: multiSigAddress, value: ethers.utils.parseEther("0.2")})

> await multiSigContract.executeTransaction(transferCallData, [transferMetaTxSignature])

   * 
   */
