/** import package [start] */
import * as bip39 from "bip39";
import { hdkey } from "ethereumjs-wallet";
import Web3 from "web3";
import env from "dotenv";
env.config();

const generateMnemonic = async () => {
  const mnemonic = bip39.generateMnemonic();
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const entropy = bip39.mnemonicToEntropy(mnemonic);
  const mnemonic1 = bip39.entropyToMnemonic(entropy);
  console.log({ mnemonic, mnemonic1, seed: seed.toString("hex"), entropy });
};

const generateWallets = async (count = 1) => {
  const mnemonic = process.env.YOUR_MNEMONIC;
  const seed = (await bip39.mnemonicToSeed(mnemonic)).toString("hex");
  const masterWallet = hdkey.fromMasterSeed(Buffer.from(seed, "hex"));
  console.log(masterWallet.getWallet().getPrivateKeyString());
  console.log(masterWallet.getWallet().getPublicKeyString());

  const hdPath = `m/44'/60'/0'/0/`;

  for (let index = 0; index < count; index++) {
    const wallet = masterWallet.derivePath(hdPath + index).getWallet();
    const pri = wallet.getPrivateKeyString();
    const pub = wallet.getPublicKeyString();
    const add = wallet.getAddressString();
    console.log({ pri, pub, add });
  }
};

const createTransaction = async (
  fromAddress: string,
  toAddress: string,
  transferEtherAmount: number,
  senderPrivateKey: string
) => {
  /** please visit https://app.zeeve.io in order to get the ethereum node endpoint*/
  const web3 = new Web3(
    "https://app.zeeve.io/shared-api/eth/ee2d9526d873a341c01f06a5f2ec91f2c54b1690dcbeb130/"
  );
  /** price to commit any transaction */
  const gasPrice = await web3.eth.getGasPrice();

  /**
   * maximum price in 'wei' to commit any transaction
   * and transactions are not allowed above price
   */
  const gasLimit = 3000000;

  /** number of transaction sent from the sender address */
  const nonce = await web3.eth.getTransactionCount(fromAddress, "pending");

  /** ethereum network blockchain id */
  const chainId = await web3.eth.getChainId();

  const convertedAmount = web3.utils.toWei(transferEtherAmount, "ether");

  console.log({ gasPrice, nonce, chainId, convertedAmount });
  /**
   * creating the raw transaction hash by creating the transaction object
   * and signing it with the sender's private key
   */
  const { rawTransaction } = await web3.eth.accounts.signTransaction(
    {
      to: toAddress,
      value: convertedAmount,
      gasPrice,
      gas: gasLimit,
      nonce,
      chainId,
    },
    senderPrivateKey
  );

  console.log({ rawTransaction });
  /**
   * sending the signed raw transaction hash
   * and fetching the transaction hash & block number on success
   */
  const txnDetails = await web3.eth.sendSignedTransaction(rawTransaction);

  console.log(txnDetails);
};

const pubkey: string = process.env.PUBLIC_KEY;
const prikey: string = process.env.PRIVATE_KEY;

console.log({ pubkey });
console.log({ prikey });

//  generateMnemonic();
//   generateWallets(2);
createTransaction(
  pubkey,
  "0x0d7E9BF22359A682292B8Bb969031DdEEEc2bB4F",
  0.001,
  prikey
);
