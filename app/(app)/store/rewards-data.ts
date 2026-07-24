/** Colocated mock data for the Store page — no server-side redemption yet. */
export interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  category: string;
}

export const mockRewardItems: RewardItem[] = [
  {
    id: "1",
    title: "Premium Badge Pack",
    description: "Unlock exclusive badges",
    cost: 500,
    icon: "\u{1F3C5}",
    category: "Badges",
  },
  {
    id: "2",
    title: "Voice Effects",
    description: "Special voice filters",
    cost: 300,
    icon: "\u{1F3B5}",
    category: "Features",
  },
  {
    id: "3",
    title: "Custom Avatar Frame",
    description: "Personalize your profile",
    cost: 250,
    icon: "\u{1F5BC}\u{FE0F}",
    category: "Customization",
  },
  {
    id: "4",
    title: "Language Certificate",
    description: "Official recognition",
    cost: 1000,
    icon: "\u{1F393}",
    category: "Certificates",
  },
];

export const comingSoonItems: string[] = [
  "\u{1F393} Language Certificates",
  "\u{1F381} Cultural Merchandise",
  "\u{1F4DA} Premium Story Templates",
  "\u{1F3C6} Exclusive NFT Badges",
  "\u{1F4B0} Cash Rewards",
];
