/*
Generate 10 random music media entries using one of 5 emotional "vibes"
Each entry will include:
- Vibe
- Genre (based on selected vibe)
- Artist Name (formatted using the vibe's artist_formats and vocab)
- Title (formatted using the vibe's title_formats and vocab)

This script will print 10 generated entries to the console.
*/

const vibes = {
  Chill: {
    genres: ["Lo-fi", "Chillout", "Ambient", "Folk", "Acoustic", "Bossa Nova", "Bedroom Pop", "City Pop", "Jazz", "Classical", "Synthwave", "Vaporwave", "Techno", "Trance", "Dubstep", "Drum & Bass", "Blues", "Funk", "Disco", "Latin", "IDM", "Darkwave", "8bit"],
    adjectives: ["Smooth", "Smoky", "Hazy", "Faded", "Satin", "Silk", "Blue", "Yellow", "Purple", "Twilight", "Slow", "Glass", "Velvet", "Plush", "Sleek", "Icy", "Dusty", "Blurry", "Solar", "Golden", "Pale", "Soft", "Bitter", "Lunar", "Warm", "Fragile", "Tidal", "Worn", "Bare", "Strange", "Dim", "Handwritten", "Silver", "Topaz", "Hidden", "Cursive", "Wooden", "First", "Second"],
    nouns: ["Waves", "Lights", "Evening", "Tape", "Signal", "Clouds", "Dreams", "Lavender", "Sidewalk", "Kids","Postcard", "Satellites", "Ashes", "Skylight", "Bruises", "Matches", "Blush", "Film", "Hometown", "Daydream", "Polaroid", "Smokehalos", "Ghost", "Train", "Marble", "Locket", "Ceiling", "Fireflies", "Passenger", "Snowglobe", "Beach", "Ink", "Porchlight", "Gravel", "Fingertips", "Moonlight", "Lantern", "Sleep", "Match", "Scarf", "Silence", "Butterfly", "Window", "Ember", "Breeze", "Paper", "Letter", "Closet", "Blanket", "Bloom", "Haze", "Key", "Spark", "Branch", "Record", "Flicker", "Driftwood", "September", "October", "Orbit", "Crayon", "Pine", "Tea", "Sparrow", "Hummingbird", "Venus", "Meteor"],
    title_formats: ["[Adjective] [Noun]", "[Noun]", "[Adjective]", "[Adjective] [Noun]", "[Noun]", "[Adjective]", "[Adjective] [Noun]", "[Noun] of [Adjective]"],
    artist_formats: ["[Noun]", "[Adjective] [Noun]", "The [Adjective]", "The [Adjective] [Noun]", "[Adjective]"]
  },
  Sad: {
    genres: ["Midwest Emo", "Emo", "Slowcore", "Blues", "Soul", "R&B", "Gospel", "Post-Hardcore", "Screamo", "Experimental"],
    adjectives: ["Lonely", "Hollow", "Blue", "Desolate", "Isolated", "Lost", "Forsaken", "Hopeless", "Broken", "Bleak", "Empty", "Cold", "Dark", "Gray", "Quiet", "Somber", "Haunting", "Distant", "Dim", "Faded", "Dying", "Late", "Old", "Crying", "Last", "Crushed", "Torn", "Heavy", "Foggy", "Vacant", "Lifeless", "Misfit", "Invisible", "Waning", "Buried", "Left", "First", "Second", "Small", "Hidden", "Remote", "Modern", "Ancient", "Flat"],
    nouns: ["Ache", "Sorrow", "Chair", "Couch", "Ocean", "Regret", "Guilt", "Dread", "Shame", "Fog", "Cold", "Rain", "Shadow", "Gloom", "Haze", "Snowfall", "Dusk", "Goodbye", "Memory", "Past", "Distance", "Absence", "Yearning", "Nostalgia", "Loss", "Delay", "Remains", "Separation", "Isolation", "Window", "Scar", "Candle", "Bed", "Mirror", "Photograph", "Letter", "Frame", "Ring", "Grave", "Clock", "Train", "Suitcase", "Locket", "Ribbon", "Chain", "Coin", "Key", "Mask", "Envelope", "Compass", "Anchor", "Flame", "Lantern", "Blade", "Knife", "Umbrella", "Shell", "Stone", "Bone", "Cat", "Painting", "Crutch", "Sword", "Chainmail", "Net", "Cage", "Bridge", "Shard", "Sun", "Moon", "Ash", "Planet", "Ember", "Dust", "Ink", "Record", "Gear", "Box", "Safe", "Pluto", "Asteroid"],
    title_formats: ["[Adjective] [Noun]", "[Noun] of [Noun]", "[Adjective]", "[Adjective] [Noun]", "[Noun] of [Adjective]", "[Noun]"],
    artist_formats: ["The [Adjective] [Noun]", "The [Adjective] [Noun]", "[Noun]", "[Adjective]"]
  },
  Happy: {
    genres: ["Pop", "Disco", "Funk", "Latin", "Bossa Nova", "Reggae", "Ska", "Surf Rock", "Alternative", "Alt Rock"],
    adjectives: ["Beloved", "Bold", "Brave", "Golden", "Holy", "Peaceful", "Wild", "Radiant", "Timeless", "Silent", "Burning", "Innocent", "Gentle", "Fragile", "Sacred", "Shiny", "Warm", "Bright", "Dreamy", "Electric", "Surreal", "Neon", "Cosmic", "Lucid", "Vivid", "Luminous", "Hypnotic", "Atomic", "Vibrant", "Sonic", "Charged", "Icy", "Infinite", "Chrome", "Silver", "Sublime", "Wavy", "Strange", "Polar", "Slick", "Crystalline", "Blinding", "Amplified", "Digital", "Searing", "Laced", "Deep", "Midnight", "Glacial", "Wired", "First", "Second", "Last", "Hot"],
    nouns: ["Heart", "Love", "Days", "Sun", "Candy", "Petal", "Apple", "Honey", "Glow", "Shell", "Kids","Charm", "Lake", "Pond", "Ocean", "Gem", "Ruby", "Sapphire", "Friend", "Comet", "Cloud", "Baby", "Locket", "Train", "Drive", "Horizon", "Beach", "Eyes", "Drift", "Stone", "Fold", "Earth", "Jupiter"],
    title_formats: ["[Adjective] [Noun]", "[Adjective]", "[Adjective] [Noun]", "[Noun] of [Adjective]", "[Noun]"],
    artist_formats: ["The [Adjective] [Noun]", "[Adjective]", "[Noun]", "[Adjective] [Noun]"]
  },
  Edgy: {
    genres: ["Punk", "Metal", "Noise", "Shoegaze", "Industrial", "Hardcore", "Breakcore", "Nu-Metal", "Math Rock", "Black Metal", "Grunge", "Grungegaze", "Post-Punk", "Rock"],
    adjectives: ["Blunt", "Brutal", "Dark", "Feral", "Flaming", "Cold", "Hostile", "Jaded", "Rogue", "Toxic", "Hollow", "Cursed", "Bleeding", "First", "Second", "Last", "Small", "Hidden", "Remote", "Modern", "Ancient", "Flat"],
    nouns: ["Leather", "Switchblade", "Cigarette", "Chain", "Boots", "Skull", "Ring", "Bike", "Mirror", "Gas", "Mask", "Smoke", "Blade", "Saw", "Tag", "Denim", "Flare", "Book", "Wire", "Ashtray", "Claw", "Hammer", "Bottle", "Watch", "Bag", "Flag", "String", "Fish", "Code", "Program", "Safe", "Shortcut", "Scar", "Eye", "Spider", "Star", "Chrome", "Satellite", "Trap", "Tooth", "Dream", "Car", "Today", "Day", "Memory", "Space", "Shadow", "Ceiling", "Root", "Food", "Plastic", "Fighter", "Disease", "Plague", "Doctor", "Angel", "Multiply", "Moon", "Blur", "Moment", "Show", "Pig", "Animal", "Cow", "Bull", "Danger", "Neptune", "Mercury"],
    title_formats: ["[Adjective] [Noun]", "[Noun] of the [Noun]", "[Noun]", "[Adjective]", "[Adjective]", "[Adjective] [Noun]", "[Noun] of [Adjective]"],
    artist_formats: ["[Noun]", "The [Adjective]", "[Adjective] [Noun]", "[Noun]", "The [Adjective] [Noun]", "[Adjective] Head", "[Adjective]", "[Noun] of [Noun]"]
  },
  Angry: {
    genres: ["Hardcore", "Trap", "Boom Bap", "Metal", "Grungegaze", "Hip-Hop", "Crunk", "Cloud Rap", "Emo Rap", "Hyperpop", "Mixtape"],
    adjectives: ["Raging", "Violent", "Explosive", "Savage", "Vicious", "Blazing", "First", "Second", "Last", "Thick", "Dry", "Dirty", "Red", "Scarlet", "Bloody", "Large", "Heavy", "Local", "Rare", "Common", "Normal", "Derranged"],
    nouns: ["Fury", "War", "Punch", "Fire", "Blade", "Enemy", "Disease", "Dirt", "Glass", "Knife", "Stab", "Eclipse", "Dog", "Wolf", "Dragon", "Sun", "Gas", "Belt", "Brick", "Tile", "Pile", "Nose", "Fan", "Clown", "Brain", "Needle", "Scar", "Wound", "Control", "Virus", "Chain"],
    title_formats: ["[Adjective] [Noun]", "[Noun]", "No [Noun]", "[Adjective]", "[Adjective] [Noun]", "[Noun] of [Adjective]"],
    artist_formats: ["[Noun]", "[Adjective]", "[Noun] of [Noun]", "[Adjective] [Noun]"]
  }
};

const conditions = ["Mint", "Good", "Worn", "Damaged", "Broken"];
const rarities = ["Common", "Uncommon", "Rare", "Cult Classic", "Illegal"];

// Condition weights (percentages)
const conditionWeights = {
  "Mint": 5,      // 5%
  "Good": 25,     // 25%
  "Worn": 40,     // 40%
  "Damaged": 20,  // 20%
  "Broken": 10    // 10%
};

// Rarity weights (percentages)
const rarityWeights = {
  "Common": 50,      // 50%
  "Uncommon": 25,    // 25%
  "Rare": 15,        // 15%
  "Cult Classic": 7, // 7%
  "Illegal": 3       // 3%
};

// Base values for each condition (multiplier)
const conditionValues = {
  "Mint": 1.0,
  "Good": 0.8,
  "Worn": 0.6,
  "Damaged": 0.4,
  "Broken": 0.2
};

// Base values for each rarity (multiplier)
const rarityValues = {
  "Common": 1,
  "Uncommon": 2,
  "Rare": 4,
  "Cult Classic": 8,
  "Illegal": 16
};

function calculateValue(condition, rarity) {
  // Base value between 10 and 100
  const baseValue = Math.floor(Math.random() * 91) + 10;
  
  // Apply condition and rarity multipliers
  const value = baseValue * conditionValues[condition] * rarityValues[rarity];
  
  // Add some randomness (±20%)
  const randomFactor = 0.8 + (Math.random() * 0.4);
  const finalValue = Math.floor(value * randomFactor);
  
  return finalValue;
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function format(template, vibe) {
  let result = template;
  // Replace each placeholder instance individually
  result = result.replace(/\[Adjective\]/g, () => random(vibe.adjectives));
  result = result.replace(/\[Noun\]/g, () => random(vibe.nouns));
  result = result.replace(/\[Nouns\]/g, () => random(vibe.nouns) + "s");
  return result;
}

function weightedRandom(items, weights) {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[items[i]];
    if (random <= 0) {
      return items[i];
    }
  }
  return items[0]; // Fallback to first item
}

function getVicComment(condition, rarity, genre, vibeName, artist, title) {
  const comments = {
    "Mint": {
      "Common": [
        "Still sealed. Huh. Probably worth more than me.",
        "Looks fresh out the bin. Some poor soul never got to play it.",
        "Not a scratch. Either you got lucky or you're better at digging than most.",
        "Factory-new? In this dustpile? I'm shocked."
      ],
      "Uncommon": [
        "Mint condition. Makes my circuits purr.",
        "Pristine like a priest's lie. Rare find, this.",
        "Like it was born yesterday. I almost feel bad taking it from you.",
        "No dust, no scars... no soul. But pretty, I'll give it that."
      ],
      "Rare": [
        "Mint. You know what you've got, right?", 
        "Perfect shape. Almost makes me forget we're buried in ash.",
        "Not a nick. This one lived a better life than I did.",
        "Pristine. Like someone preserved it for the second coming."
      ],
      "Cult Classic": [
        "Mint. If I had a heart, it'd skip a beat.",
        "Flawless. This was someone's religion once.",
        "So clean it hurts. Hurts like memory.",
        "Like it was waiting for the right hands. Yours, apparently."
      ],
      "Illegal": [
        "Mint and forbidden. Dangerous combo.",
        "Pristine sin. Hope you've got somewhere to hide it.",
        "Flawless and flagged. Even I wouldn't risk playing this one.",
        "You know what this is. And now I know you know."
      ]
    },
    "Good": {
      "Common": [
        "Good shape. Plays fine, if you ignore the ghosts.",
        "Minor scuffs. Adds character.",
        "Solid condition. Could survive another apocalypse.",
        "Not bad. Probably passed through a dozen hands and kept its dignity."
      ],
      "Uncommon": [
        "Decent find. Might even be authentic.",
        "Little worn, still proud. Like an old soldier.",
        "Better than most of what people bring me.",
        "You've got a nose for quality, I'll give you that."
      ],
      "Rare": [
        "Still breathin'. That's more than I can say for most things.",
        "A little scratched, a lot precious.",
        "Rarity like this doesn't care about blemishes.",
        "This one's seen things. It remembers."
      ],
      "Cult Classic": [
        "Magic's still in there. You can smell it.",
        "A bit worn, but it hums. Listen close.",
        "This disc meant something. Still does.",
        "You don't find these—you're called to them."
      ],
      "Illegal": [
        "Good shape. Bad karma.",
        "You touch this, you risk waking up somewhere you don't recognize.",
        "The less we say about this, the better. Nod if you understand.",
        "Still dangerous. Maybe more so now that it's wounded."
      ]
    },
    "Worn": {
      "Common": [
        "Worn down like the rest of us.",
        "Seen better days. Haven't we all?",
        "Still standing. That's what counts.",
        "Rough around the edges. Like most survivors."
      ],
      "Uncommon": [
        "Not much to look at, but there's a heartbeat in there.",
        "Weathered. That's history in your hands.",
        "Keeps spinning. That's more than I expected.",
        "Scarred, but not silent."
      ],
      "Rare": [
        "This one crawled through the mud to find you.",
        "Hurt, but honest. I respect that.",
        "Bruised treasure. Let's not waste it.",
        "Fell far to get here. Don't drop it again."
      ],
      "Cult Classic": [
        "It's bled for meaning. Still bleeding.",
        "Ragged edge. Holy core.",
        "Legend never needed polish.",
        "It's ugly. And it's perfect."
      ],
      "Illegal": [
        "Worn outlaw tech. They'd gut you for this.",
        "If you value silence, don't let anyone else see it.",
        "Torn from the void. Left a scar.",
        "Dangerous even in pieces. Treat with respect—or fear."
      ]
    },
    "Damaged": {
      "Common": [
        "Cracked, but talkative.",
        "Might squeal when played. Don't blame me.",
        "Falling apart, but desperate to be remembered.",
        "Not pretty, but it wants to be seen."
      ],
      "Uncommon": [
        "Bit rough. Still sings.",
        "Looks worse than it sounds. Maybe.",
        "Not worthless, just misunderstood.",
        "Hurt, but holding."
      ],
      "Rare": [
        "Barely breathing. Still sacred.",
        "Scraped up survivor. You're in good company.",
        "Damage makes it real."
      ],
      "Cult Classic": [
        "Wounded worship. Handle with reverence.",
        "Still holy. Even bruised.",
        "Scars like these tell tales.",
        "It's lived. That's what makes it matter."
      ],
      "Illegal": [
        "Bad news in a cracked shell.",
        "One glance and the wrong eyes would hunt you.",
        "Still pulsing with secrets.",
        "Don't keep it near your heart."
      ]
    },
    "Broken": {
      "Common": [
        "Dead tech. Nice paperweight, though.",
        "Doesn't play. Still makes noise if you listen hard enough.",
        "Totally busted. But someone once cared about it.",
        "Worthless... or is it? Nah. Probably worthless."
      ],
      "Uncommon": [
        "Broken, but full of ghosts.",
        "You could try to fix it. Or mourn it.",
        "Ruined, but not forgotten.",
        "It cracked open. Something escaped."
      ],
      "Rare": [
        "Even shattered, this one demands attention.",
        "Broken relic. Dangerous beauty.",
        "Dust and splinters. And memory.",
        "Destroyed. But you can still feel the heat."
      ],
      "Cult Classic": [
        "Legends don't die. They fracture.",
        "Shattered, but it hums in another frequency.",
        "If you dream hard enough, you'll hear it again.",
        "Broken altar to a forgotten god."
      ],
      "Illegal": [
        "Even dead, it's outlawed.",
        "You're braver than you look, holding this.",
        "This shouldn't exist. And yet...",
        "Throw it in the fire. Or keep it. Your call."
      ]
    }
  };

  const specialComments = {
    "Illegal": {
      "Broken": [
        "Dead as a ghost, but still illegal. The signal never really dies.",
        "Doesn't function. Still dangerous. That's power.",
        "Shattered, but the kind that echoes in forbidden channels.",
        "Non-functional? Tell that to the black vans parked outside."
      ],
      "Damaged": [
        "It limps. It leaks. It shouldn't be here.",
        "Still pings hidden frequencies. I heard them last night.",
        "Wounded and wrong. But priceless in the underworld.",
        "You didn't find this. It found you."
      ]
    },
    "Cult Classic": {
      "Broken": [
        "Broken, but this was gospel once.",
        "Doesn't spin, but it still chants.",
        "It's more shrine than disc now.",
        "A relic shattered, not erased."
      ],
      "Damaged": [
        "Scuffed, but every mark tells a myth.",
        "Worn edges, timeless core.",
        "Flickering magic. Still alive in there.",
        "This one's legacy outweighs its wounds."
      ]
    }
  };

  // Check for special comments first
  if (specialComments[rarity] && specialComments[rarity][condition]) {
    return random(specialComments[rarity][condition]);
  }

  // Otherwise use the standard comments
  return random(comments[condition][rarity]);
}

// New function to generate a single music entry
export function generateMusicEntry() {
  const vibeName = random(Object.keys(vibes));
  const vibe = vibes[vibeName];
  const genre = random(vibe.genres);
  const artist = format(random(vibe.artist_formats), vibe);
  const title = format(random(vibe.title_formats), vibe);
  const condition = weightedRandom(conditions, conditionWeights);
  const rarity = weightedRandom(rarities, rarityWeights);
  const value = calculateValue(condition, rarity);

  return {
    title,
    artist,
    genre,
    value: `$${value}`,
    condition,
    rarity,
    quote: getVicComment(condition, rarity, genre, vibeName, artist, title)
  };
}

/*
for (let i = 0; i < 10; i++) {
  const vibeName = random(Object.keys(vibes));
  const vibe = vibes[vibeName];
  const genre = random(vibe.genres);
  const artist = format(random(vibe.artist_formats), vibe);
  const title = format(random(vibe.title_formats), vibe);
  const condition = weightedRandom(conditions, conditionWeights);
  const rarity = weightedRandom(rarities, rarityWeights);
  const value = calculateValue(condition, rarity);

  console.log(`\nGenre: ${genre}\nArtist: ${artist}\nTitle: ${title}\nCondition: ${condition}\nRarity: ${rarity}\nValue: $${value}`);
  console.log(`Vic: "${getVicComment(condition, rarity, genre, vibeName, artist, title)}"`);
} 
*/