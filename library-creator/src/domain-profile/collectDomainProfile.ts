import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import type { DomainArchetypeId, DomainProfile } from "../types/domainProfile.js";
import {
  listDomainArchetypes,
  loadDomainProfile,
  suggestDomainArchetype,
} from "../profiles/loadProfile.js";

export async function collectDomainProfile(
  domain: string,
  suggestedId?: DomainArchetypeId
): Promise<DomainProfile> {
  const rl = createInterface({ input, output });
  const suggestion = suggestedId ?? suggestDomainArchetype(domain);
  const archetypes = listDomainArchetypes();

  try {
    console.log(`\nDomain profile for "${domain}"`);
    console.log(`Suggested archetype: ${suggestion}\n`);

    archetypes.forEach((id, index) => {
      const marker = id === suggestion ? " (suggested)" : "";
      console.log(`  ${index + 1}. ${id}${marker}`);
    });

    while (true) {
      const answer = (
        await rl.question(`Choose 1–${archetypes.length} [default ${suggestion}]: `)
      ).trim();

      if (!answer) {
        return loadDomainProfile(suggestion);
      }

      const index = Number.parseInt(answer, 10);
      if (index >= 1 && index <= archetypes.length) {
        return loadDomainProfile(archetypes[index - 1]);
      }

      if (archetypes.includes(answer as DomainArchetypeId)) {
        return loadDomainProfile(answer as DomainArchetypeId);
      }

      console.log("Invalid choice — try again.");
    }
  } finally {
    rl.close();
  }
}
