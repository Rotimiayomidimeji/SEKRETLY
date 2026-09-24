export type InteractionTheme = {
  accent: string;
  accentSoft: string;
  surface: string;
  emoji: string;
};

export type InteractionConfig = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  defaultPrompt: string;
  icon: string;
  theme: InteractionTheme;
  anonymousResponses: boolean;
  publicResponses: boolean;
};
