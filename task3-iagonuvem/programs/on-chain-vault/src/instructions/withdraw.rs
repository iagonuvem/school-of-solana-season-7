//-------------------------------------------------------------------------------
///
/// TASK: Implement the withdraw functionality for the on-chain vault
/// 
/// Requirements:
/// - Verify that the vault is not locked
/// - Verify that the vault has enough balance to withdraw
/// - Transfer lamports from vault to vault authority
/// - Emit a withdraw event after successful transfer
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use crate::state::Vault;
use crate::errors::VaultError;
use crate::events::WithdrawEvent;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

pub fn _withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let vault = &mut ctx.accounts.vault;

    if vault.locked {
        return Err(error!(VaultError::VaultLocked));
    }

    // check if vault authority is the same as owner
    if vault.vault_authority != ctx.accounts.vault_authority.key() {
        return Err(error!(VaultError::Unauthorized));
    }

    // check if there's available balance
    let vault_balance = **vault.to_account_info().lamports.borrow();
    if vault_balance < amount {
        return Err(error!(VaultError::InsufficientBalance));
    }

    // Transfer lamports from vault to authority
    let vault_info = vault.to_account_info();
    let authority_info = ctx.accounts.vault_authority.to_account_info();
    let rent_exempt = Rent::get()?.minimum_balance(vault_info.data_len());

    // check if after withdraw it will have enough sol to pay rent
    if vault_balance - amount < rent_exempt {
        return Err(error!(VaultError::Overflow));
    }

    **vault_info.try_borrow_mut_lamports()? -= amount;
    **authority_info.try_borrow_mut_lamports()? += amount;

    emit!(WithdrawEvent {
        vault: vault.key(),
        vault_authority: vault.vault_authority,
        amount,
    });

    Ok(())
}