import { task } from 'hardhat/config';

task('create-meta-tx-transfer', 'Creta Metatransaction with transfer call')
  .addParam('address', 'Receiver')
  .addParam('amount', 'Amount')
  .setAction(async (taskArgs, hre) => {
    const tx = {
      to: taskArgs.address,
      amount: taskArgs.amount,
    };
    const signer = (await hre.ethers.getSigners())[0];
    const payTx = await signer.sendTransaction(tx);
    console.log(payTx);
    const res = await payTx.wait();
    console.log(res);
  });
