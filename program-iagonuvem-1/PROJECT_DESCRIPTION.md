# Project Description

**Deployed Frontend URL:** https://solana-twitter-dapp-13a4nktpj-iago-nuvems-projects.vercel.app/

**Solana Program ID:** yuSXtGfd255QhTFq2HMRwwm6QEvJuz7LnHKqN5aTWZ2

## Project Overview

### Description
This is a small twitter-like dApp, based on the lessons learned through the course. It allows users to create tweets and interact between tweets from other users.

### Key Features
[TODO: List the main features of your dApp. Be specific about what users can do.]

- Fetch Tweets: User must be able to see all tweets in the dApp
- Initialize Tweet: User must be able to initialize a new tweet with some content
- Add Comment to a Tweet: Users must be able to comment (max 500 characters) into some tweet
- Remove Comment from a Tweet: Users must be able to remove THEIR OWN comments in some tweet, and should not be able to remove comments of other person.
- Add Reaction to a Tweet: Users must be able to add some reaction to a tweet
- Remove Reaction from a Tweet: Users must be able to remove reactions made in some tweeet.

### How to Use the dApp
[TODO: Provide step-by-step instructions for users to interact with your dApp]

1. **Connect Wallet**
2. **Go to Tweet tabs:** Go to Tweets tab
3. **Init Tweet:** Fill Tweet Data and submit
4. **Check Tweet Details:** Click details and check tweet

## Program Architecture
The program is structured into a monorepo, where `frontend` contains the frontend of the dApp, and `anchor_program` contains the backend

### PDA Usage
The program uses Program Derived Addresses to create deterministic accounts for each tweet, comment and reaction.

**PDAs Used:**
- **Tweet PDA**: Derived from seeds `[topic_as_bytes , "TWEET_SEED", user_wallet_pubkey]` - ensures each tweet has a unique signer and can only be modified by them
- **Comment PDA**: Derived from seeds `["COMMENT_SEED", author_wallet_pubkey, content, tweet_pubkey]` - ensures each comment belong to a author and is inside an specific tweet
- **Reaction PDA**: ensures each reaction belongs to a author, and tweet.

### Program Instructions
[TODO: List and describe all the instructions in your Solana program]

**Instructions Implemented:**
- Instruction 1: [Description of what it does]
- Instruction 2: [Description of what it does]
- ...

### Account Structure
```rust
#[account]
#[derive(InitSpace)]
pub struct Tweet {
    pub tweet_author: Pubkey,
    #[max_len(TOPIC_LENGTH)]
    pub topic: String,
    #[max_len(CONTENT_LENGTH)]
    pub content: String,
    pub likes: u64,
    pub dislikes: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Reaction {
    pub reaction_author: Pubkey,
    pub parent_tweet: Pubkey,
    pub reaction: ReactionType,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Comment {
    pub comment_author: Pubkey,
    pub parent_tweet: Pubkey,
    #[max_len(COMMENT_LENGTH)]
    pub content: String,
    pub bump: u8,
}
```

## Testing

### Test Coverage
Tests were implemented based on the requirements of lesson 4, and added the extra `fetch` tests.

**Happy Path Tests:**
- Should Create a tweet: User should be able to create a tweet
- Should Comment in a tweet: User should be able to comment in a tweet
- Should React to a tweet: User should be able to react in a tweet


**Unhappy Path Tests:**
- Should not be able to remove comments that is not owned: Users should not remove comments that he doesn't own.

### Running Tests
```bash
# Commands to run your tests
anchor test
```

### Additional Notes for Evaluators
This dApp was based on lesson 4. 