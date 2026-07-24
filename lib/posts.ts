export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  category: string;
  cover: string;
  coverAlt: string;
  body: PostBlock[];
};

export const posts: Post[] = [
  {
    slug: "why-your-voice-matters",
    title: "Why your voice matters more than you think",
    excerpt:
      "Thousands of African languages have almost no voice recordings online. Yours can change that.",
    date: "2026-06-22",
    readMinutes: 4,
    category: "Our mission",
    cover: "/images/blog-audio.jpg",
    coverAlt: "A studio microphone in warm light",
    body: [
      {
        type: "p",
        text: "Open your phone and ask your voice assistant a question in English. It answers right away. Now try the same thing in Yoruba, Igbo or Hausa. Most of the time, nothing happens.",
      },
      {
        type: "p",
        text: "This is not because those languages are small. Hausa alone has over 50 million speakers. It happens because the technology never heard enough of these languages to learn them.",
      },
      { type: "h2", text: "Machines learn languages from voice clips" },
      {
        type: "p",
        text: "Speech technology learns the way a child does: by listening. It needs thousands of real people saying real phrases, in different accents, ages and settings. English has millions of hours of this. Most African languages have almost none.",
      },
      {
        type: "p",
        text: "That gap has real costs. Health hotlines, banking apps and learning tools all speak English first. People who are more comfortable in their mother tongue get left out.",
      },
      { type: "h2", text: "Ten seconds at a time" },
      {
        type: "p",
        text: "LinguaLink closes the gap one short clip at a time. You see a phrase, you say it in your language, and you are done in about ten seconds. Other speakers check the clip so the final collection is clean and correct.",
      },
      {
        type: "quote",
        text: "Every clip you record is a brick in a road that leads somewhere new: apps, tools and services that speak your language.",
      },
      {
        type: "p",
        text: "And because this work has value, you get paid for it. Your points turn into real money you can withdraw. Good for you today, good for your language for generations.",
      },
    ],
  },
  {
    slug: "how-lingualink-pays-you",
    title: "How LinguaLink pays you: a simple guide",
    excerpt:
      "Points, streaks, validation and withdrawals. Here is exactly how money works in the app.",
    date: "2026-06-08",
    readMinutes: 5,
    category: "Guides",
    cover: "/images/blog-earn.jpg",
    coverAlt: "Banknotes from different countries laid out on an orange surface",
    body: [
      {
        type: "p",
        text: "LinguaLink pays you for work that helps languages survive. The rules are simple, and this guide walks through all of them.",
      },
      { type: "h2", text: "1. Recording pays" },
      {
        type: "p",
        text: "Every approved recording earns you points. A phrase takes about ten seconds to record, so a short bus ride is enough time to finish a good batch.",
      },
      { type: "h2", text: "2. Checking clips pays too" },
      {
        type: "p",
        text: "After you record, other speakers listen and confirm your clip sounds right. You can do this checking work too. It is called validation, and it earns points on every clip you review.",
      },
      { type: "h2", text: "3. Streaks multiply your points" },
      {
        type: "p",
        text: "Come back every day and your streak grows. A longer streak means a bigger multiplier on everything you earn. Daily bonus tasks add more on top.",
      },
      { type: "h2", text: "4. Withdraw when you are ready" },
      {
        type: "p",
        text: "Your balance is shown in the app at all times. When you want your money, request a withdrawal to your bank account or mobile wallet. No hidden fees, no surprises.",
      },
      {
        type: "ul",
        items: [
          "Record clear audio in a quiet place, so more of your clips get approved.",
          "Validate a few clips while you wait in line. Small moments add up.",
          "Keep your streak alive. The multiplier is the fastest way to grow earnings.",
        ],
      },
      {
        type: "p",
        text: "That is the whole system. No tricks. You do useful work, and you get paid for it.",
      },
    ],
  },
  {
    slug: "ten-yoruba-phrases-we-love",
    title: "Ten Yoruba phrases we love",
    excerpt:
      "Proverbs and greetings carry a whole way of seeing the world. Here are ten favorites from our community.",
    date: "2026-05-19",
    readMinutes: 3,
    category: "Culture",
    cover: "/images/blog-culture.jpg",
    coverAlt: "Colorful African textiles stacked together",
    body: [
      {
        type: "p",
        text: "Yoruba is spoken by over 40 million people, and it is packed with proverbs, praise names and greetings for every moment of life. Our community records thousands of phrases like these every week. Here are ten we keep coming back to.",
      },
      {
        type: "ul",
        items: [
          "Ẹ kú àárọ̀. Good morning. The day's first gift to a neighbor.",
          "Ẹ kú iṣẹ́. Well done with your work. Said to anyone doing their job.",
          "Ọmọ tí a kò kọ́ ni yóò gbé ilé tí a kọ́ tà. The child we fail to teach will sell the house we build.",
          "Ìbí kì í ṣe bí ẹní. Being born is not the same as being raised well.",
          "A kì í fi ọwọ́ kan pa iná. You cannot put out a fire with one hand. Big work needs many hands.",
          "Odò kì í ṣàn kó gbàgbé ìsun rẹ̀. A river never flows and forgets its source.",
          "Ẹ ṣé gan an. Thank you very much.",
          "Kò sí wàhálà. No trouble at all.",
          "Ilé la ti ń kó ẹ̀ṣọ́ r'òde. Charity, and style, begin at home.",
          "Àgbà kì í wà lọ́jà kórí ọmọ tuntun wọ́. An elder does not stand by while things go wrong.",
        ],
      },
      { type: "h2", text: "Why proverbs matter to us" },
      {
        type: "p",
        text: "A proverb is a compressed lesson. When a language fades, the lessons fade with it. Recording elders saying these phrases keeps both the sound and the wisdom safe.",
      },
      {
        type: "p",
        text: "Do you know a proverb we should feature? Record it in the app and tag it as a proverb. We highlight new favorites every month.",
      },
    ],
  },
  {
    slug: "what-happens-to-your-recordings",
    title: "What happens to your recordings?",
    excerpt:
      "You record a phrase and tap submit. Here is the honest, step-by-step story of where it goes.",
    date: "2026-05-02",
    readMinutes: 4,
    category: "Transparency",
    cover: "/images/blog-learning.jpg",
    coverAlt: "A teacher standing in front of a classroom of students",
    body: [
      {
        type: "p",
        text: "You should never have to guess what an app does with your voice. This post explains our whole pipeline in plain words.",
      },
      { type: "h2", text: "Step one: quality checks" },
      {
        type: "p",
        text: "When you submit a clip, software first checks the basics. Is the audio clear? Is it the right length? Is the background quiet enough? Clips that fail get sent back so you can try again.",
      },
      { type: "h2", text: "Step two: human validation" },
      {
        type: "p",
        text: "Next, other speakers of your language listen to the clip. They confirm the phrase was said correctly and sounds natural. This is the same validation work you can get paid for.",
      },
      { type: "h2", text: "Step three: the dataset" },
      {
        type: "p",
        text: "Approved clips join a growing collection of validated speech for your language. This collection is what researchers and builders use to teach technology to understand and speak African languages.",
      },
      { type: "h2", text: "What we will not do" },
      {
        type: "ul",
        items: [
          "We will not sell your personal details. Voice clips are separated from your name and contact information.",
          "We will not use your voice to impersonate you. Clips are short phrases, and cloning anyone's voice is against our rules.",
          "We will not hide changes. If how we use data ever changes, we tell you in the app first.",
        ],
      },
      {
        type: "p",
        text: "Questions about any of this? Read our privacy policy, or write to us. A real person answers.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
