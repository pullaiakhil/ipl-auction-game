const COMMENTARY_TEMPLATES: Record<string, string[]> = {
  four: [
    '💥 {batsmanName} drives it through the covers for FOUR!',
    '🏏 Beautifully timed shot by {batsmanName}! Racing away to the boundary!',
    '4️⃣ {batsmanName} picks the gap perfectly! Four runs!',
    '💪 Punched through mid-off by {batsmanName}! That\'s a boundary!',
    '🔥 {batsmanName} cracks it square! The ball races to the fence!',
    '⚡ Short and wide from {bowlerName}, {batsmanName} cuts it for FOUR!',
    '🎯 {batsmanName} flicks it off the pads, boundary behind square!',
    '💫 Elegant cover drive by {batsmanName}! Textbook cricket!',
    '🏆 {batsmanName} leans into the drive, gorgeous shot for four!',
    '🎪 {batsmanName} pulls it fiercely! Four more added to the total!',
    '💎 Inside-out shot over cover by {batsmanName}! Stunning boundary!',
    '🌟 {batsmanName} dances down the track and lofts it for four!',
    '⭐ Late cut by {batsmanName}! Fine enough to beat third man!',
    '🔶 {batsmanName} sweeps it fine, the ball nestles into the boundary!',
    '💥 Back foot punch by {batsmanName}! That flew to the fence!',
  ],
  six: [
    '🚀 MASSIVE SIX by {batsmanName}! That\'s gone into the stands!',
    '💣 {batsmanName} launches it into orbit! HUGE SIX!',
    '6️⃣ {batsmanName} deposits {bowlerName} into the crowd! Maximum!',
    '🌟 {batsmanName} goes DOWNTOWN! That\'s a monster hit!',
    '⚡ {batsmanName} clears the ropes with contemptuous ease! SIX!',
    '🔥 What a shot! {batsmanName} smashes it over long-on for SIX!',
    '💪 {batsmanName} muscles it over midwicket! That\'s out of the ground!',
    '🎯 Slog sweep by {batsmanName}! Maximum! The crowd goes wild!',
    '🏏 {batsmanName} steps out and launches it downtown! Giant six!',
    '🚀 {bowlerName} pitched it up and {batsmanName} made it pay! SIX!',
    '💫 {batsmanName} reverse-sweeps it for SIX! Incredible audacity!',
    '🔥 Pick up shot by {batsmanName}! Over deep midwicket for maximum!',
    '💣 {batsmanName} lofts it straight back over {bowlerName}\'s head! SIX!',
    '⭐ Switch hit by {batsmanName}! That\'s absolutely sensational for SIX!',
    '🌟 Upper cut by {batsmanName} and it sails over third man for SIX!',
  ],
  wicket: [
    '🎳 BOWLED! {bowlerName} knocks the stumps over! {batsmanName} has to go!',
    '🙌 CAUGHT! {batsmanName} edges it and the fielder takes a stunner!',
    '☝️ OUT! {bowlerName} strikes! {batsmanName} is dismissed for {runs}!',
    '💥 WICKET! {batsmanName} departs! Big moment in the match!',
    '🔴 That\'s OUT! {bowlerName} has {batsmanName} {wicketType}! Huge breakthrough!',
    '🏏 GONE! {batsmanName} falls to {bowlerName}! The fielders celebrate!',
    '⚡ Timber! {bowlerName} sends the stumps cartwheeling! {batsmanName} is bowled!',
    '👆 The umpire raises the finger! {batsmanName} is given out {wicketType}!',
    '🎯 Breakthrough for {bowlerName}! {batsmanName} walks back disappointed!',
    '💫 What a delivery from {bowlerName}! {batsmanName} had no answer!',
    '🔥 Sensational catch in the deep! {batsmanName} is caught trying to hit big!',
    '☝️ Plumb LBW! {bowlerName} traps {batsmanName} right in front!',
    '🎳 Clean bowled! {bowlerName} sneaks one through {batsmanName}\'s defenses!',
    '😱 Run out! {batsmanName} is caught short of the crease! Disaster!',
    '🙌 Stumped! {batsmanName} misses and the keeper whips the bails off!',
  ],
  dot: [
    '⚫ Dot ball. {bowlerName} keeps it tight.',
    '⚪ Good length delivery, defended by {batsmanName}.',
    '🔵 {bowlerName} hits a good line and length. No run.',
    '⚫ Pushed to the fielder. No run there.',
    '🔘 Beaten outside off! {bowlerName} is looking sharp.',
    '⚫ Back of a length, {batsmanName} defends solidly.',
    '⚪ Left alone outside off stump. Good discipline from {batsmanName}.',
    '🔵 Tight bowling from {bowlerName}. Building pressure.',
    '⚫ {batsmanName} looks to drive but misses. Dot ball.',
    '⚪ {bowlerName} cramps {batsmanName} for room. Well bowled.',
  ],
  runs: [
    '🏃 {runs} run{plural} taken. Good rotation of strike by {batsmanName}.',
    '👟 {batsmanName} works it into the gap for {runs}.',
    '🏃 Quick {runs} run{plural}. Smart cricket from {batsmanName}.',
    '👟 Pushed into the off side, {runs} run{plural} taken easily.',
    '🏃 {batsmanName} tucks it into the leg side for {runs}.',
    '👟 {runs} run{plural}. {batsmanName} keeps the scoreboard ticking.',
    '🏃 Worked off the pads for {runs} by {batsmanName}.',
    '👟 Good running between the wickets! {runs} run{plural} completed.',
  ],
  extra: [
    '⚠️ {extraType} from {bowlerName}! Free runs for the batting side.',
    '❌ {extraType}! {bowlerName} loses discipline there.',
    '⚠️ That\'s a {extraType}! Extra run added to the total.',
  ],
  milestone_50: [
    '🎉 FIFTY for {batsmanName}! What a knock! The crowd rises to applaud!',
    '⭐ Half-century! {batsmanName} reaches 50! Brilliant innings!',
    '🏅 {batsmanName} brings up a well-deserved fifty! Quality batting!',
  ],
  milestone_100: [
    '🏆 CENTURY! {batsmanName} reaches 100! Absolutely magnificent!',
    '💯 What an innings! {batsmanName} scores a HUNDRED! Standing ovation!',
    '🌟 {batsmanName} completes a sensational century! The crowd erupts!',
  ],
  end_over: [
    '📊 End of over {over}: {runs} runs, {wickets} wickets. Total: {total}/{totalWickets}',
  ],
};

export function getCommentary(
  type: string,
  context: Record<string, any>
): string {
  const templates = COMMENTARY_TEMPLATES[type];
  if (!templates || templates.length === 0) {
    return `${type} event occurred`;
  }

  const template = templates[Math.floor(Math.random() * templates.length)];

  return template.replace(/\{(\w+)\}/g, (_, key) => {
    if (key === 'plural') {
      return (context.runs || 0) !== 1 ? 's' : '';
    }
    return context[key] !== undefined ? String(context[key]) : key;
  });
}
