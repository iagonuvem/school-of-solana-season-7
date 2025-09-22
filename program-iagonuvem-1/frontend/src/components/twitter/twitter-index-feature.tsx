import { WalletButton } from "../solana/solana-provider";
import { useWallet } from "@solana/wallet-adapter-react";
import { CreateTweet, TweetList } from "./twitter-ui";

export default function TwitterIndexFeature() {
    const { publicKey } = useWallet()
    if (!publicKey) {
        return (
          <div className="max-w-4xl mx-auto">
            <div className="hero py-[64px]">
              <div className="hero-content text-center">
                <WalletButton />
              </div>
            </div>
          </div>
        )
    }

    return (
      <div>
        <div className="flex flex-col max-w-xl mx-auto gap-4">
            <CreateTweet />

            <TweetList />
        </div>
      </div>
    )
}