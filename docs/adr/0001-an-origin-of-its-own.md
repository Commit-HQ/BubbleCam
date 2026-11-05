# An origin of its own

BubbleCam's app is served from bubblecam.bubbleboard.fyi, and its landing page moves to Commit's site, at bubbleboard.fyi/apps/bubblecam, so a copy of this repository carries the app alone, as a copy of BubbleBoard does. The app never shares an origin with BubbleBoard or another of Commit's apps. A browser gives each origin one quota and, when it needs room, clears an origin's storage whole. Cartoons fill it, so on a shared origin they could leave a BubbleBoard device no room to save, or take its keys with them; an installed app whose scope covers the other's would open its links; and a flaw in one would reach the other's keys and cartoons.

## Considered options

- **bubbleboard.fyi/apps/bubblecam for the app too**, on the site's origin. Every later sister app there would share it, so the reasons above would return between them, and the site could never take on anything that mustn't reach the app's cartoons.
- **One origin for every sister app, apps.bubbleboard.fyi**, which only moves the same problems between the sister apps.

## Consequences

- The address is for good. Cartoons live in their origin's storage, so an app that moved would leave every device's cartoons behind.
