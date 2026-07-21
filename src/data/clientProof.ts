import type { ClientProofItem } from "@types";

export const CLIENT_PROOF_TITLE =
  "Trusted by leaders ";

const CLIENT_LOGO_BASE = `${import.meta.env.BASE_URL}images/proof/clients/`;

export const CLIENT_PROOF_ITEMS: ClientProofItem[] = [
  {
    slug: "vent",
    name: "VENT Finance",
    logoPath: `${CLIENT_LOGO_BASE}vent.png`,
    domain: "Digital Asset Finance",
    proof: "Protected about $4M in client assets across three years with zero security incidents.",
  },
  {
    slug: "mci",
    name: "MCI",
    logoPath: `${CLIENT_LOGO_BASE}mci.png`,
    domain: "Telecom Security",
    proof: "Automated security operations and saved analysts about three hours per day.",
  },
  {
    slug: "quiztion",
    name: "Quiztion",
    logoPath: `${CLIENT_LOGO_BASE}quiztion.png`,
    domain: "Real-Time Gaming",
    proof: "Increased backend throughput about 10× and raised crash-free sessions from 65% to 92%.",
  },
  {
    slug: "blockbyblock",
    name: "BlockByBlock",
    logoPath: `${CLIENT_LOGO_BASE}bbb.png`,
    domain: "Community Platforms",
    proof: "Turned an early idea into a working MVP in ten days and avoided about $10K in premature build costs.",
  },
  {
    slug: "vexor",
    name: "Vexor Network",
    logoPath: `${CLIENT_LOGO_BASE}vexor.png`,
    domain: "Web3 Reputation",
    proof: "Improved API response times about 40% and established a safer beta release baseline.",
  },
  {
    slug: "bugdasht",
    name: "BugDasht",
    logoPath: `${CLIENT_LOGO_BASE}bugdasht.png`,
    domain: "Cybersecurity",
    proof: "Built a secure, auditable crowdsourcing platform from concept to market-ready MVP.",
  },
  {
    slug: "eligasht",
    name: "Eligasht",
    logoPath: `${CLIENT_LOGO_BASE}eligasht.png`,
    domain: "Travel Technology",
    proof: "Developed and maintained booking APIs and third-party integrations in a high-change environment.",
  },
  {
    slug: "saman-bank",
    name: "Saman Bank",
    logoPath: `${CLIENT_LOGO_BASE}saman_bank.png`,
    domain: "Core Banking",
    proof: "Worked on enterprise APIs and multilayer financial systems in a regulated banking environment.",
  },
];

export function getClientProofAriaLabel(item: ClientProofItem): string {
  return `${item.name}. Domain: ${item.domain}. Proof: ${item.proof}`;
}
