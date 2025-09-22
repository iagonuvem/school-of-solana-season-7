//-------------------------------------------------------------------------------
///
/// TASK: Implement the remove reaction functionality for the Twitter program
/// 
/// Requirements:
/// - Verify that the tweet reaction exists and belongs to the reaction author
/// - Decrement the appropriate counter (likes or dislikes) on the tweet
/// - Close the tweet reaction account and return rent to reaction author
/// 
///-------------------------------------------------------------------------------
use anchor_lang::prelude::*;
use crate::errors::TwitterError;
use crate::states::*;

pub fn remove_reaction(ctx: Context<RemoveReactionContext>) -> Result<()> {
    // 1. Verificar se a reação existe e pertence ao autor da reação
    let reaction = &ctx.accounts.tweet_reaction;
    if reaction.reaction_author != ctx.accounts.reaction_author.key() {
        return Err(TwitterError::MinLikesReached.into());
    }

    // 2. Decrementar o contador de likes ou dislikes no tweet, dependendo da reação
    let tweet = &mut ctx.accounts.tweet;
    match reaction.reaction {
        ReactionType::Like => {
            if tweet.likes > 0 {
                tweet.likes -= 1;  // Decrementa o like
            } else {
                return Err(TwitterError::MinLikesReached.into());
            }
        }
        ReactionType::Dislike => {
            if tweet.dislikes > 0 {
                tweet.dislikes -= 1;  // Decrementa o dislike
            } else {
                return Err(TwitterError::MinDislikesReached.into());
            }
        }
    }

    // 3. Fechar a conta de reação e devolver o aluguel (rent) ao autor
    // Fechar a conta de reação
    ctx.accounts.tweet_reaction.close(ctx.accounts.reaction_author.to_account_info())?;

    // 4. Confirmar que a operação foi bem-sucedida
    Ok(())
}

#[derive(Accounts)]
pub struct RemoveReactionContext<'info> {
    // O autor da reação deve assinar a transação
    #[account(mut)]
    pub reaction_author: Signer<'info>,
    // A conta de reação que será removida
    #[account(
        mut, 
        has_one = reaction_author, // garante que o autor do Comment seja o signer fornecido
        close = reaction_author
    )] // A conta será fechada e o aluguel devolvido ao autor
    pub tweet_reaction: Account<'info, Reaction>,
    // O tweet ao qual a reação pertence
    #[account(mut)]
    pub tweet: Account<'info, Tweet>,
    // O sistema do programa
    pub system_program: Program<'info, System>,
}
