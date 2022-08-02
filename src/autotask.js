// this is the file which generates js suitable for 
// OpenZeppelin Autotask which runs on Openzeppelin autotask
// it mints the NFT in the cloud, so my client side code doesnt need to import web3 shmeah

// Import dependencies available in the autotask environment
const { DefenderRelayProvider, DefenderRelaySigner } = require('defender-relay-client/lib/ethers');
const { ethers } = require('ethers');
const dotenv = require('dotenv').config();

// Import an ABI which will be embedded into the generated js
const artifact = require('../artifacts/contracts/ChatBecomesANFT.sol/ChatBecomesANFT.json');

// const contractAbi = ['function getCurrentTokenCount() view returns (uint256)'];

// Entrypoint for the Autotask
exports.handler = async function(event) {

  console.log(event.request.body);
  /**
   * Get data from POST request's body.
   * 
   * Note that this script does not implement any sort of validation on these two parameters.
   * Under the assumption that the endpoint URI is a secret only known by the app, this should be ok.
   * Worst case scenario, should the endpoint be leaked, you can easily
   * pause the autotask, change the endpoint via Defender, and include the new URI in the app.
   * Or if you feel like, you can think of ways to implement validations on these two parameters here.
   */
  const { userAddress, contractAddress, metadata } = event.request.body;
  
  console.log('Initialize defender relayer provider')
  const provider = new DefenderRelayProvider(event);
  console.log('init signer')
  const signer = new DefenderRelaySigner(event, provider, { speed: 'fast' });
  
  console.log('setting up contract')
  const nftContract = new ethers.Contract(contractAddress, artifact.abi, signer);

  console.log('getting nonce')
  const nonce = await provider.getTransactionCount(contractAddress);
  
  console.log(
    `  [*] User:${userAddress}\nToken ID (nonce):${nonce}\nContract:${contractAddress}`
  );

  nftContract.safeMint(userAddress, metadata);

  // Build, hash and sign message with relayer key
  const message = ethers.utils.defaultAbiCoder.encode(
    ['address', 'uint256', 'address'],
    [userAddress, nonce, contractAddress]
  );
  const hash = ethers.utils.keccak256(message);
  const signature = await signer.signMessage(ethers.utils.arrayify(hash));
  
  return {hash, signature};
}


// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
  const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env;
  handler({ apiKey, apiSecret })
    .then(() => { console.log("one sec i'll let u finish but beyoncey weast heafjioaefj aofjsddddd fffffffffffffffffffffffffffffffff") })
    .then(() => process.exit(0))
    .catch((error) => { console.error(error); process.exit(1); })
}
