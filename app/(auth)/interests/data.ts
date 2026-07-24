/** Interest catalog — ported 1:1 from mobile InterestSelectionScreen.tsx. */
export interface Interest {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const INTERESTS: Interest[] = [
  { id: "entertainment", name: "Entertainment", icon: "🎭", color: "#FF8A00" },
  { id: "sports", name: "Sports", icon: "⚽", color: "#10B981" },
  { id: "music", name: "Music", icon: "🎵", color: "#EF4444" },
  { id: "culture", name: "Culture", icon: "🏛️", color: "#8B5CF6" },
  { id: "travel", name: "Travel", icon: "✈️", color: "#3B82F6" },
  { id: "business", name: "Business", icon: "💼", color: "#059669" },
  { id: "food", name: "Food & Cooking", icon: "🍳", color: "#F59E0B" },
  { id: "technology", name: "Technology", icon: "💻", color: "#6B7280" },
  { id: "art", name: "Art & Design", icon: "🎨", color: "#8B5CF6" },
  { id: "gaming", name: "Gaming", icon: "🎮", color: "#9333EA" },
  { id: "science", name: "Science", icon: "🧬", color: "#0EA5E9" },
  { id: "history", name: "History", icon: "📜", color: "#D97706" },
  { id: "fitness", name: "Fitness", icon: "💪", color: "#EF4444" },
  { id: "fashion", name: "Fashion", icon: "👗", color: "#EC4899" },
  { id: "movies", name: "Movies", icon: "🎬", color: "#6366F1" },
  { id: "books", name: "Literature", icon: "📚", color: "#8B5CF6" },
  { id: "nature", name: "Nature", icon: "🌿", color: "#22C55E" },
  { id: "photography", name: "Photography", icon: "📸", color: "#06B6D4" },
];
