//-------------------------------------------------------------------------------
///
/// TASK: Implement the add reaction functionality for the Twitter program
/// 
/// Requirements:
/// - Initialize a new reaction account with proper PDA seeds
/// - Increment the appropriate counter (likes or dislikes) on the tweet
/// - Set reaction fields: type, author, parent tweet, and bump
/// - Handle both Like and Dislike reaction types
/// 
///-------------------------------------------------------------------------------
use anchor_lang::prelude::*;
use crate::errors::TwitterError;
use crate::states::*;

// Adiciona reação (like/dislike) a um tweet
pub fn add_reaction(ctx: Context<AddReactionContext>, reaction: ReactionType) -> Result<()> {
    let tweet_reaction = &mut ctx.accounts.tweet_reaction;
    let tweet = &mut ctx.accounts.tweet;

    // PDA esperado (mesmas seeds do atributo da conta)
    let (expected_pda, _bump_check) = Pubkey::find_program_address(
        &[
            TWEET_REACTION_SEED.as_bytes(),
            &ctx.accounts.reaction_author.key().to_bytes(),
            &tweet.key().to_bytes(),
        ],
        &ctx.program_id,
    );

    // Se a conta passada não for o PDA esperado, erro (ajustado por tipo)
    let seed_err = match reaction {
        ReactionType::Like => TwitterError::MaxLikesReached,
        ReactionType::Dislike => TwitterError::MaxDislikesReached,
    };
    require_keys_eq!(tweet_reaction.key(), expected_pda, seed_err);

    // Contadores
    match reaction {
        ReactionType::Like => tweet.likes = tweet.likes.saturating_add(1),
        ReactionType::Dislike => tweet.dislikes = tweet.dislikes.saturating_add(1),
    }

    // Preenche a conta de reação
    tweet_reaction.reaction_author = ctx.accounts.reaction_author.key();
    tweet_reaction.parent_tweet = ctx.accounts.tweet.key();
    tweet_reaction.reaction = reaction;
    tweet_reaction.bump = ctx.bumps.tweet_reaction;

    Ok(())
}

#[derive(Accounts)]
// REMOVIDO: #[instruction(reaction: ReactionType)]
pub struct AddReactionContext<'info> {
    #[account(mut)]
    pub reaction_author: Signer<'info>,

    #[account(
        init,
        payer = reaction_author,
        space = 8 + Reaction::INIT_SPACE,
        seeds = [
            TWEET_REACTION_SEED.as_bytes(),
            reaction_author.key().as_ref(),
            tweet.key().as_ref(),
        ],
        bump
    )]
    pub tweet_reaction: Account<'info, Reaction>,

    // O tweet precisa existir; se não existir, Anchor retornará
    // AccountNotInitialized/does not exist (como o teste espera)
    #[account(mut)]
    pub tweet: Account<'info, Tweet>,

    pub system_program: Program<'info, System>,
}