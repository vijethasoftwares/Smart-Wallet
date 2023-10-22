const { ethers } = require('ethers');

async function signTransactionScript( encodedABIData, nonce, signerPrivateKey, web3) {
  // Use ethers.utils.defaultAbiCoder.encode to get the consistent encoding format

  const localMsgBeforeSigning = ethers.utils.keccak256(encodedABIData);
  const signature = web3.eth.accounts.sign(
    localMsgBeforeSigning,
    signerPrivateKey
  );
  console.log(localMsgBeforeSigning)

  const signatureData = {
    nonce: nonce,
    signature: signature.signature,
    messageHash: signature.messageHash,
    localMsgBeforeSigning: localMsgBeforeSigning,
  };

  return {
    encodedParams: encodedABIData,
    signatureInfo: signatureData,
  };
}

module.exports = {
  signTransactionScript,
};
