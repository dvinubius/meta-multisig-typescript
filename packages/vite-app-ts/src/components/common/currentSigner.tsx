import { ethers } from 'ethers';

/**
 * Needed as a workaround for a bug in web3-react
 * (switching accounts leads to an inconsistency
 *  account !== connector.signer._address
 * )
 */
export const getCurrentSigner = async () => {
  const ethereum = window.ethereum;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const provider = new ethers.providers.Web3Provider(ethereum);
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
};
