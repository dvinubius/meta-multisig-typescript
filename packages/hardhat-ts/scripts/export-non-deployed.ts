/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as fs from 'fs';

import * as chalk from 'chalk';

const contractsDir = './generated/artifacts/contracts';
const destination = '../vite-app-ts/src/generated/injectable-abis/hardhat_non_deployed_contracts.json';

const exportContracts = (contractNames: string[], destination: string): boolean => {
  try {
    const dirPath = destination.split('/').slice(0, -1).join('/');
    const destinationFile = destination.split('/').slice(-1);

    const exported: Record<string, any> = {};
    contractNames.forEach((contractName) => {
      const file = fs.readFileSync(`${contractsDir}/${contractName}.sol/${contractName}.json`);
      exported[contractName] = JSON.parse(file.toString()).abi;
    });

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = `${dirPath}/${destinationFile}`;
    fs.writeFileSync(filePath, JSON.stringify(exported, null, 2), { flag: 'w' });

    return true;
  } catch (e) {
    console.log('Failed to export non-deployed contracts ' + chalk.red(contractNames) + 'to frontend.');
    console.log(e);
    return false;
  }
};

function main(): void {
  // add any of your factory-created contracts here
  const contracts = ['MultiSigVault'];
  const success = exportContracts(contracts, destination);
  if (success) {
    console.log(`✅  Exported abi(s) for non-deployed contract(s) ${contracts} to the frontend.`);
  }
}
try {
  main();
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
