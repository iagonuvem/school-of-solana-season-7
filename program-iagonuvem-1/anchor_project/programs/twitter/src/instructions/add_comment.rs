//-------------------------------------------------------------------------------
///
/// TASK: Implement the add comment functionality for the Twitter program
/// 
/// Requirements:
/// - Validate that comment content doesn't exceed maximum length
/// - Initialize a new comment account with proper PDA seeds
/// - Set comment fields: content, author, parent tweet, and bump
/// - Use content hash in PDA seeds for unique comment identification
/// 
///-------------------------------------------------------------------------------
use anchor_lang::{prelude::*, solana_program};
use anchor_lang::solana_program::hash::{hash}; 

use crate::errors::TwitterError;
use crate::states::*;

// Função para adicionar um comentário a um tweet
pub fn add_comment(ctx: Context<AddCommentContext>, comment_content: String) -> Result<()> {
    // 1. Validar o comprimento do conteúdo do comentário
    require!(comment_content.len() <= COMMENT_LENGTH, TwitterError::CommentTooLong);

    // 2. Gerar a hash do conteúdo para garantir a unicidade na PDA
    let content_hash = solana_program::hash::hash(comment_content.as_bytes());

    // 3. Usar a hash do conteúdo e o tweet para gerar a conta do comentário (PDA)
    let (comment_pda, bump) = Pubkey::find_program_address(
        &[
            COMMENT_SEED.as_bytes(),
            &ctx.accounts.comment_author.key().to_bytes(),
            &content_hash.to_bytes(),
            &ctx.accounts.tweet.key().to_bytes(), // Usando a chave do tweet corretamente
        ],
        &ctx.program_id,
    );

    // 4. Verificar se a conta de comentário já existe, ou seja, se já foi criada
    if ctx.accounts.comment.key() != comment_pda {
        return Err(TwitterError::CommentTooLong.into()); // Se a conta não for a esperada, lançar erro
    }

    // 5. Inicializar o comentário
    let comment = &mut ctx.accounts.comment;
    comment.comment_author = ctx.accounts.comment_author.key();
    comment.content = comment_content;
    comment.parent_tweet = ctx.accounts.tweet.key(); // Usando a chave do tweet corretamente
    comment.bump = bump;

    // 6. Confirmar que a conta de comentário foi criada com sucesso
    Ok(())
}

#[derive(Accounts)]
#[instruction(comment_content: String)]
pub struct AddCommentContext<'info> {
    // O autor do comentário deve assinar a transação
    #[account(mut)]
    pub comment_author: Signer<'info>,
    // A conta do comentário que será criada ou modificada
    #[account(
        init,
        payer = comment_author,
        space = 8 + Comment::INIT_SPACE,
        seeds = [
            COMMENT_SEED.as_bytes(),
            comment_author.key().as_ref(),
            {hash(comment_content.as_bytes()).to_bytes().as_ref()}, 
            tweet.key().as_ref(),
        ],
        bump
    )]
    pub comment: Account<'info, Comment>,
    // O tweet ao qual o comentário pertence
    #[account(mut)]
    pub tweet: Account<'info, Tweet>,
    // O sistema do programa
    pub system_program: Program<'info, System>,
}