import { AppHero } from '@/components/app-hero';
import { TweetProgramExplorerLink } from '../twitter/twitter-ui';

// const links: { label: string; href: string }[] = [
//   { label: 'Solana Docs', href: 'https://docs.solana.com/' },
//   { label: 'Solana Faucet', href: 'https://faucet.solana.com/' },
//   { label: 'Solana Cookbook', href: 'https://solana.com/developers/cookbook/' },
//   { label: 'Solana Stack Overflow', href: 'https://solana.stackexchange.com/' },
//   { label: 'Solana Developers GitHub', href: 'https://github.com/solana-developers/' },
// ]

export default function DashboardFeature() {
  return (
    <div>
      <AppHero title="Twitter" subtitle="Welcome back" />
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <div className="">
          <h3 className="mb-2">Program Address:</h3>
          <TweetProgramExplorerLink />
        </div>
        {/* <div className="space-y-2">
          <p>Here are some helpful links to get you started.</p>
          {links.map((link, index) => (
            <div key={index}>
              <a
                href={link.href}
                className="hover:text-gray-500 dark:hover:text-gray-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  )
}
