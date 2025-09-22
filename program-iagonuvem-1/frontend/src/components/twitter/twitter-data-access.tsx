
import { COMMENT_DISCRIMINATOR, getCommentDecoder, getReactionDecoder, getTweetDecoder, REACTION_DISCRIMINATOR, TWEET_DISCRIMINATOR } from '../../../client/js/generated/accounts';
import { TransactionSigner, SolanaClient, Instruction, createTransaction, signAndSendTransactionMessageWithSigners, getBase58Decoder, Address } from 'gill'


export async function processTransaction(
    signer: TransactionSigner,
    client: SolanaClient,
    instructions: Instruction[]
) {
    const { value: latestBlockhash } = await client.rpc.getLatestBlockhash().send()
  
    console.log('Creating transaction...')
    const transaction = createTransaction({
      feePayer: signer,
      version: 'legacy',
      latestBlockhash,
      instructions: instructions,
    })
  
    const signature = await signAndSendTransactionMessageWithSigners(transaction)
    const decoder = getBase58Decoder()
    const sig58 = decoder.decode(signature)
    return sig58
}
  
export async function getTweetAccounts(client: SolanaClient, programId: Address) {
    const allAccounts = await client.rpc.getProgramAccounts(programId, {
      encoding: 'base64'
    }).send()
  
    const filteredAccounts = allAccounts.filter((account) => {
      // console.log(account);
      const data = Buffer.from(account.account.data[0], 'base64');
      const discriminator = data.subarray(0, 8)
      return discriminator.equals(Buffer.from(TWEET_DISCRIMINATOR))
    })
    
    const decoder = getTweetDecoder();
    const decodedAccounts = filteredAccounts.map((account) => ({
      address: account.pubkey,
      data: decoder.decode(Buffer.from(account.account.data[0], "base64"))
    }))
  
    return decodedAccounts
}

export async function getUserActivity(client: SolanaClient, programId: Address, publicKey: string) {
  const allAccounts = await client.rpc.getProgramAccounts(programId, {
    encoding: 'base64'
  }).send()

  const tweetAccounts = allAccounts.filter((account) => {
    const data = Buffer.from(account.account.data[0], 'base64');
    const discriminator = data.subarray(0, 8)
    return discriminator.equals(Buffer.from(TWEET_DISCRIMINATOR))
  })

  const commentAccounts = allAccounts.filter((account) => {
    const data = Buffer.from(account.account.data[0], 'base64');
    const discriminator = data.subarray(0, 8)
    return discriminator.equals(Buffer.from(COMMENT_DISCRIMINATOR))
  })

  const reactionAccounts = allAccounts.filter((account) => {
    const data = Buffer.from(account.account.data[0], 'base64');
    const discriminator = data.subarray(0, 8)
    return discriminator.equals(Buffer.from(REACTION_DISCRIMINATOR))
  })
  
  const commentDecoder = getCommentDecoder();
  const decodedCommentAccounts = commentAccounts.map((account) => ({
    address: account.pubkey,
    data: commentDecoder.decode(Buffer.from(account.account.data[0], "base64"))
  })).filter((account) => account.data.commentAuthor === publicKey);

  const reactionDecoder = getReactionDecoder();
  const decodedReactionAccounts = reactionAccounts.map((account) => ({
    address: account.pubkey,
    data: reactionDecoder.decode(Buffer.from(account.account.data[0], "base64"))
  })).filter((account) => account.data.reactionAuthor === publicKey);

  const decoder = getTweetDecoder();
  const decodedTweetAccounts = tweetAccounts.map((account) => ({
    address: account.pubkey,
    data: decoder.decode(Buffer.from(account.account.data[0], "base64"))
  }))

  return {tweets: decodedTweetAccounts, comments: decodedCommentAccounts, reactions: decodedReactionAccounts}
}

export async function getTweetDetails(client: SolanaClient, programId: Address, tweetAddress: Address) {
  const allAccounts = await client.rpc.getProgramAccounts(programId, {
    encoding: 'base64'
  }).send()

  const commentAccounts = allAccounts.filter((account) => {
    const data = Buffer.from(account.account.data[0], 'base64');
    const discriminator = data.subarray(0, 8)
    return discriminator.equals(Buffer.from(COMMENT_DISCRIMINATOR))
  })

  const reactionAccounts = allAccounts.filter((account) => {
    const data = Buffer.from(account.account.data[0], 'base64');
    const discriminator = data.subarray(0, 8)
    return discriminator.equals(Buffer.from(REACTION_DISCRIMINATOR))
  })
  
  const commentDecoder = getCommentDecoder();
  const decodedCommentAccounts = commentAccounts.map((account) => ({
    address: account.pubkey,
    data: commentDecoder.decode(Buffer.from(account.account.data[0], "base64"))
  })).filter((account) => account.data.parentTweet === tweetAddress);

  const reactionDecoder = getReactionDecoder();
  const decodedReactionAccounts = reactionAccounts.map((account) => ({
    address: account.pubkey,
    data: reactionDecoder.decode(Buffer.from(account.account.data[0], "base64"))
  })).filter((account) => account.data.parentTweet === tweetAddress);

  return {comments: decodedCommentAccounts, reactions: decodedReactionAccounts}
}

export async function getTweetComments(client: SolanaClient, programId: Address) {
  const allAccounts = await client.rpc.getProgramAccounts(programId, {
    encoding: 'base64'
  }).send()

  const filteredAccounts = allAccounts.filter((account) => {
    const data = Buffer.from(account.account.data[0], 'base64');
    const discriminator = data.subarray(0, 8)
    return discriminator.equals(Buffer.from(COMMENT_DISCRIMINATOR))
  })
  
  const decoder = getCommentDecoder();
  const decodedComments = filteredAccounts.map((account) => ({
    address: account.pubkey,
    data: decoder.decode(Buffer.from(account.account.data[0], "base64"))
  }))

  return decodedComments
}

export async function getTweetReactions(client: SolanaClient, programId: Address) {
  const allAccounts = await client.rpc.getProgramAccounts(programId, {
    encoding: 'base64'
  }).send()

  const filteredAccounts = allAccounts.filter((account) => {
    // console.log(account);
    const data = Buffer.from(account.account.data[0], 'base64');
    const discriminator = data.subarray(0, 8)
    return discriminator.equals(Buffer.from(REACTION_DISCRIMINATOR))
  })
  
  const decoder = getReactionDecoder();
  const decodedReactions = filteredAccounts.map((account) => ({
    address: account.pubkey,
    data: decoder.decode(Buffer.from(account.account.data[0], "base64"))
  }))

  return decodedReactions
}