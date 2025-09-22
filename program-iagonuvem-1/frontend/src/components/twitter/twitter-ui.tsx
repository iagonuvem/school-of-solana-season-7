import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { getTweetAccounts, getTweetDetails, getUserActivity, processTransaction } from "./twitter-data-access"
import { Address } from "@solana/kit"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { TWITTER_PROGRAM_ADDRESS } from "../../../client/js/generated/programs"
import { Comment, Reaction, Tweet } from "../../../client/js/generated/accounts"
import { createSolanaClient } from "gill";
import { cn, ellipsify } from "@/lib/utils"
import { ExplorerLink } from "../cluster/cluster-ui"
import { Label } from "../ui/label"
import { getCommentRemoveInstruction, getCommentTweetInstructionAsync, getDislikeTweetInstructionAsync, getInitializeInstructionAsync, getLikeTweetInstructionAsync, getReactionRemoveInstruction } from "client/js/generated/instructions"
import { AppModal } from "../app-modal"
import { useWalletSendingSigner } from "../solana/use-wallet-ui-signer"
import { ReactionType } from "client/js/generated/types"

interface PDA<Entity> {
    address: Address;
    data: Entity
}

interface FullTweet extends PDA<Tweet> {
    reactions?: Array<PDA<Reaction>>;
    comments?: Array<PDA<Comment>>
}

export function TweetProgramExplorerLink({ program }: {program?: string}) {
    const programId = program ?? TWITTER_PROGRAM_ADDRESS;
    
    return <ExplorerLink path={`address/${programId}`} label={ellipsify(programId.toString())} />
}

export function TweetDetails({
    address,
    data
} : {
    address: Address,
    data: Tweet
}) {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const signer = useWalletSendingSigner();
    const programId = TWITTER_PROGRAM_ADDRESS;

    const [tweetComments, setTweetComments] = useState<Array<PDA<Comment>>>([]);
    const [tweetReactions, setTweetReactions] = useState<Array<PDA<Reaction>>>([]);

    // Create SolanaClient using native Solana hooks
    const client = createSolanaClient({urlOrMoniker: connection.rpcEndpoint});
    
    
    const [formData, setFormData] = useState({
      comment: ''
    })
    
    const refreshTweetData = async () => {
        const {comments, reactions} = await getTweetDetails(client, programId, address);
        setTweetComments(comments);
        setTweetReactions(reactions);
    } 

    const hasReacted: number | null = useMemo(() => {
        return tweetReactions.find((reaction) => reaction.data.reactionAuthor === publicKey?.toString())?.data.reaction ?? null;
    }, [publicKey, tweetReactions])

    const addComment = async () => {
      if (!signer || !publicKey) {
        console.error('No signer available');
        return;
      }

      const ix = await getCommentTweetInstructionAsync(
        {
          commentAuthor: signer,
          commentContent: formData.comment,
          tweet: address
        }
      )

      try {
        await processTransaction(signer, client, [ix])
      } catch (error) {
        console.log('error', error);
      }

      alert('Comment made!');
      setFormData({
        comment: ""
      })
      refreshTweetData();
    }

    const removeComment = async (commentAddres: Address, commentContent: string) => {
        console.log(commentAddres);
        if (!signer || !publicKey) {
          console.error('No signer available');
          return;
        }
    
        const ix = await getCommentRemoveInstruction(
          {
            commentAuthor: signer,
            comment: commentAddres,
            commentContent: commentContent
          }
        )
    
        try {
          await processTransaction(signer, client, [ix])
        } catch (error) {
          console.log('error', error);
        }
    
        alert('Comment Removed!');
        setFormData({
          comment: ""
        })
        refreshTweetData();
    }

    const isCommentOwner = useCallback((authorAddress: Address) => {
        return authorAddress === publicKey?.toString();
    }, [publicKey])

    const onOpen = () => {
        refreshTweetData();
    }
    return (
      <AppModal
        title="Details"
        submit={addComment}
        onOpen={onOpen}
      > 
        <h2 className="mb-2">
            <strong className="mb-2">{data.tweetAuthor}</strong>
        </h2>
        <h3>
            {data.topic} - {data.content}
        </h3>
        <div className="px-2 py-2 flex flex-row gap-4">
            <Label>
                {data.likes} Likes - {data.dislikes} Dislikes
            </Label>
            <TweetProgramExplorerLink program={address}/>
        </div>
        {hasReacted ? 
            <>
                <div className="border-t py-2">
                    <Label>
                        You have 
                        <strong>{hasReacted === ReactionType.Like ? 'Liked' : 'Disliked'}</strong>
                        this tweet!
                    </Label>
                </div>
            </> :
            null 
        }
        

        <div className="comments border-t pt-4">
          <div className="flex flex-col gap-4">
            <Label className="mb-2">Comments</Label>

            {tweetComments.map((comment) => (
                <div className="px-2 flex flex-col gap-2 border-b">
                    <div className="flex flex-row gap-2 justify-between">
                        <strong>
                            <TweetProgramExplorerLink program={comment.data.commentAuthor}/>
                        </strong>
                        {
                            isCommentOwner(comment.data.commentAuthor) ? 
                                <Button
                                    size={'sm'}
                                    variant={'destructive'}
                                    onClick={() => removeComment(comment.address, comment.data.content)}
                                >
                                    Remove
                                </Button> 
                                : null
                        }
                    </div>
                    <div className="px-2 py-4 flex flex-row gap-2">
                        <Label>
                        {comment.data.content}
                        </Label>
                    </div>
                </div>
            ))}
            

            <Input
              id='comment'
              placeholder="New comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({...prev, comment: e.target.value}))}
            />
          </div>
        </div>
        
      </AppModal>
    )
}
  

export function CreateTweet() {
    const { connection } = useConnection();
    const signer = useWalletSendingSigner();

    // Create SolanaClient using native Solana hooks
    const client = createSolanaClient({urlOrMoniker: connection.rpcEndpoint});
    
    const [formData, setFormData] = useState({
        topic: '',
        content: ''
    });

    const publish = async() => {
        if (!signer) {
            console.error('No signer available');
            return;
        }

        const ix = await getInitializeInstructionAsync(
            {
              tweetAuthority: signer,
              topic: formData.topic,
              content: formData.content
            }
          )
      
        await processTransaction(signer!, client, [ix])
      
        setFormData({
            topic: "",
            content: ""
        })
        alert(`Tweet published!`);
     }
    return (
        <div className="border-b pb-4 flex flex-col gap-2 justify-end mb-2">
        <Input 
            type="text"
            id="topic-input"
            placeholder="#your-topic"
            onChange={(e) => setFormData(prev => ({...prev, topic: e.target.value}))}
            value={formData.topic}
        />
        <textarea 
            className={cn(
                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-16 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            )}
            id="content-input"
            rows={5}
            placeholder="What's happening?"
            onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
            value={formData.content}
        />
        <Button
            onClick={publish}
        >
            Publish
        </Button>
        </div>
    )
}

export function TweetList() {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const signer = useWalletSendingSigner();

    // Create SolanaClient using native Solana hooks
    const client = createSolanaClient({urlOrMoniker: connection.rpcEndpoint});

    const programId = TWITTER_PROGRAM_ADDRESS;
    const [tweets, setTweets] = useState<Array<FullTweet>>([])
    const [userActivity, setUserActivity] = useState<{
        tweets: Array<PDA<Tweet>>,
        reactions: Array<PDA<Reaction>>,
        comments: Array<PDA<Comment>>
    }>({tweets: [], reactions: [], comments: []})

    const refresh = useCallback(async () => {
        if (publicKey) {
            const tweetAccounts = await getTweetAccounts(client, programId)
            const {tweets, comments, reactions} = await getUserActivity(client, programId, publicKey?.toString());
            
            setTweets(tweetAccounts);
            setUserActivity({
                tweets: tweets,
                reactions: reactions,
                comments: comments
            })
        }
    }, [client, programId, publicKey]);

    const addReaction = async (reaction: ReactionType, tweet: PDA<Tweet>) => {
        if (!signer) {
            console.error('No signer available');
            return;
        }
        
        let ix;
        switch (reaction) {
            case ReactionType.Like:
                ix = await getLikeTweetInstructionAsync(
                    {
                        reactionAuthor: signer,
                        tweet: tweet.address
                    }
                )
                break;
            case ReactionType.Dislike:
                ix = await getDislikeTweetInstructionAsync(
                    {
                        reactionAuthor: signer,
                        tweet: tweet.address
                    }
                )
                break;
            default:
                alert('Invalid Reaction!')
                break;
        }

        if(ix){
            await processTransaction(signer!, client, [ix])
        }

        alert(`Reaction added!`);
        refresh();
    }

    const removeReaction = async (reaction: PDA<Reaction>, tweet: PDA<Tweet>) => {
        if (!signer) {
            console.error('No signer available');
            return;
        }
        
        const ix = getReactionRemoveInstruction(
            {
                reactionAuthor: signer,
                tweetReaction: reaction.address,
                tweet: tweet.address
            }
        );
        await processTransaction(signer!, client, [ix])

        alert(`Reaction removed!`);
        refresh();
    }

    useEffect(() => {
        refresh();
    }, []);

    const currentReaction = (tweet: PDA<Tweet>) => {
        return userActivity.reactions.find((reaction) => reaction.data.parentTweet === tweet.address);
    }

    return (
        <>
            <Button
                variant={"ghost"} 
                onClick={refresh}
            >
                Refresh
            </Button>
            <div className="grid grid-cols-1 grid-rows-1 gap-4 w-full">
                    {
                        tweets.map((tweet) => (
                            <div key={tweet.address.toString()} className="border rounded-sm shadow-sm w-full">
                                <div className="px-4 py-4">
                                    <h3 className="font-bold mb-2">
                                        #{tweet.data.topic} <span className="text-xs font-thin"> - {tweet.data.tweetAuthor}</span>
                                    </h3>
                                    <p className="truncate container">
                                        {tweet.data.content}
                                    </p>
                                </div>
                                <div className="px-2 py-2">
                                    {tweet.data.likes} Likes - {tweet.data.dislikes} Dislikes
                                </div>

                                <div className="border-t px-4 py-2 flex flex-row justify-end gap-2">
                                    <Button 
                                        size={'sm'} 
                                        variant={currentReaction(tweet)?.data.reaction === ReactionType.Like ? 'default': 'outline'}
                                        disabled={currentReaction(tweet)?.data.reaction === ReactionType.Dislike}
                                        onClick={() => {
                                            if(currentReaction(tweet)){
                                                removeReaction(currentReaction(tweet) as PDA<Reaction>, tweet)
                                            } else {
                                                addReaction(ReactionType.Like, tweet)
                                            }
                                        }}
                                    >
                                        {currentReaction(tweet)?.data.reaction === ReactionType.Like ? 'Liked': 'Like'}
                                    </Button>
                                    <Button 
                                        size={'sm'} 
                                        variant={currentReaction(tweet)?.data.reaction === ReactionType.Dislike ? 'default': 'outline'}
                                        disabled={currentReaction(tweet)?.data.reaction === ReactionType.Like}
                                        onClick={() => {
                                            if(currentReaction(tweet)){
                                                removeReaction(currentReaction(tweet) as PDA<Reaction>, tweet)
                                            } else {
                                                addReaction(ReactionType.Dislike, tweet)
                                            }
                                        }}
                                    >
                                        { currentReaction(tweet)?.data.reaction === ReactionType.Dislike ? 'Disliked': 'Dislike'}
                                    </Button>
                                    <TweetDetails 
                                        address={tweet.address}
                                        data={tweet.data}
                                    />
                                </div>
                            </div> 
                        ))
                    }
            </div>
        </>
    )
}