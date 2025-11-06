import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Threadlify",
  version: packageJson.version,
  copyright: `© ${currentYear}, Threadlify.`,
  meta: {
    title: "Threadlify",
    description:
      "Built for Early Stage Founders. Track relevant discussions, spot competitor activity, and join conversations that drive growth.",
  },
};
