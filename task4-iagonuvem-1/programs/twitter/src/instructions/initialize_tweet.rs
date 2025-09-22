//-------------------------------------------------------------------------------
///
/// TASK: Implement the initialize tweet functionality for the Twitter program
/// 
/// Requirements:
/// - Validate that topic and content don't exceed maximum lengths
/// - Initialize a new tweet account with proper PDA seeds
/// - Set tweet fields: topic, content, author, likes, dislikes, and bump
/// - Initialize counters (likes and dislikes) to zero
/// - Use topic in PDA seeds for tweet identification
/// 
///-------------------------------------------------------------------------------
use anchor_lang::prelude::*;
use crate::errors::TwitterError; // Importando os erros definidos em errors.rs
use crate::states::*; // Importando as constantes e structs de states.rs

pub fn initialize_tweet(
    mut ctx: Context<InitializeTweet>,
    topic: String,
    content: String,
) -> Result<()> {
    // Validar o comprimento do tópico
    require!(topic.len()   <= TOPIC_LENGTH,   TwitterError::TopicTooLong);
    require!(content.len() <= CONTENT_LENGTH, TwitterError::ContentTooLong);

    let bump = ctx.bumps.tweet;
    let accounts = &mut ctx.accounts;

    // Preenche a conta criada pelo init
    accounts.tweet.set_inner(Tweet {
        tweet_author: accounts.tweet_authority.key(),
        topic,
        content,
        likes: 0,
        dislikes: 0,
        bump,
    });

    // 4. Confirmar a criação com sucesso
    Ok(())
}

#[derive(Accounts)]
#[instruction(topic: String)]
pub struct InitializeTweet<'info> {
    // O autor do tweet deve assinar a transação
    #[account(mut)]
    pub tweet_authority: Signer<'info>,
    // A conta do tweet que será criada com a inicialização
    #[account(
        init,
        payer = tweet_authority,
        space = 8 + Tweet::INIT_SPACE, // Espaço suficiente para o Tweet
        seeds = [
            topic.as_bytes(),
            TWEET_SEED.as_bytes(),
            tweet_authority.key().as_ref()
        ],
        bump
    )]
    pub tweet: Account<'info, Tweet>,
    pub system_program: Program<'info, System>,
}
