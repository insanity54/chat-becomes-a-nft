
// scripts/deploy.js
async function main () {
  // We get the contract to deploy
  const ChatBecomesANFT = await ethers.getContractFactory('ChatBecomesANFT');
  console.log('Deploying ChatBecomesANFT...');
  const cban = await ChatBecomesANFT.deploy();
  await cban.deployed();
  console.log('ChatBecomesANFT deployed to:', cban.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });