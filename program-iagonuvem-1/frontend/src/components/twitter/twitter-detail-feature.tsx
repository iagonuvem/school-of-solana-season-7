import { AppHero } from "../app-hero";

export default function TwitterDetailFeature() {
    return (
      <div>
        <AppHero title="Tweet Details" subtitle="Here's the latest tweets" />
        <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
          <div className="">
            <h3>Latest news from De-Fi</h3>
          </div>
        </div>
      </div>
    )
}