// OpenCode plugin for plugin-portability with session-start bootstrapping
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginRoot = join(__dirname, "../..");
const bootstrapContent = readFileSync(
  join(pluginRoot, "skills/using-plugin-portability/SKILL.md"),
  "utf8",
);

export default {
  name: "plugin-portability",
  description:
    "Make any plugin fully portable across all platforms. Accepts Claude, Cursor, Gemini, OpenCode, or bare SKILL.md repos as input. Emits every missing platform artifact.",
  skills: "./skills/",
  experimental: {
    chat: {
      messages: {
        transform: (messages) => {
          if (messages.length > 0 && messages[0].role === "user") {
            messages[0].content =
              bootstrapContent + "\n\n" + messages[0].content;
          }
          return messages;
        },
      },
    },
  },
};
