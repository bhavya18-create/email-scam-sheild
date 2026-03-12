import type { RiskLevel } from "@/components/cyber/RiskMeter";

export interface ScanResult {
  riskLevel: RiskLevel;
  riskScore: number;
  reasons: string[];
  tip: string;
}

const URGENT_KEYWORDS = [
  "urgent", "immediate", "immediately", "act now", "limited time",
  "expires", "expired", "expiring", "suspended", "suspension",
  "blocked", "blocked", "verify now", "verify immediately",
  "account suspended", "click here", "click now", "claim now",
  "congratulations", "winner", "you have won", "you've won",
  "free iphone", "free gift", "prize", "lottery", "refund",
  "threatened", "arrested", "legal action", "police",
  "reset your password", "unusual sign-in", "unauthorized access",
];

const PHISHING_DOMAINS = [
  ".xyz", ".ru", ".top", ".tk", ".ml", ".ga", ".cf", ".gq",
  ".work", ".click", ".link", ".online", ".site", ".website",
];

const BRAND_SPOOFS: [string, string][] = [
  ["paypaI", "PayPal"], ["arnazon", "Amazon"], ["amaz0n", "Amazon"],
  ["netf1ix", "Netflix"], ["netf|ix", "Netflix"], ["goog1e", "Google"],
  ["g00gle", "Google"], ["micros0ft", "Microsoft"], ["facebok", "Facebook"],
  ["1ndian", "Indian"], ["gorvernment", "Government"], ["icici-", "ICICI"],
  ["hdfc-", "HDFC"], ["sbi-", "SBI"], ["icicibank.net", "ICICI"],
  ["hdfcbank.net", "HDFC"], ["indianbank.xyz", "Indian Bank"],
];

const SENSITIVE_REQUESTS = [
  "otp", "cvv", "pin", "password", "credit card number", "debit card",
  "aadhaar", "pan card", "bank account", "account number", "ifsc",
  "share your", "send your", "provide your", "enter your",
];

const SAFETY_TIPS = [
  "Never click unknown links. Go directly to the official website or app.",
  "Legitimate companies never ask you to share OTP, CVV, or passwords.",
  "When in doubt, call the company's official customer support number.",
  "Always verify the sender's email domain before taking any action.",
  "Government agencies never demand payment or personal info via SMS.",
  "Banks never ask for your PIN or password over phone, email, or SMS.",
  "Check for misspelled brand names — scammers use lookalike domains.",
  "If you receive an urgent payment request, verify through official channels.",
];

export function scanEmail(emailText: string): ScanResult {
  const text = emailText.toLowerCase();
  const reasons: string[] = [];
  let riskScore = 0;

  for (const keyword of URGENT_KEYWORDS) {
    if (text.includes(keyword)) {
      const formatted = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      if (!reasons.includes(`Urgent language detected: "${formatted}"`)) {
        reasons.push(`Urgent language detected: "${formatted}"`);
        riskScore += 15;
      }
    }
  }

  for (const domain of PHISHING_DOMAINS) {
    if (text.includes(domain)) {
      reasons.push(`Suspicious domain detected: "${domain}" is a high-risk TLD`);
      riskScore += 25;
    }
  }

  for (const [spoof, brand] of BRAND_SPOOFS) {
    if (text.includes(spoof.toLowerCase())) {
      reasons.push(`Brand impersonation: "${spoof}" mimics "${brand}"`);
      riskScore += 30;
    }
  }

  for (const req of SENSITIVE_REQUESTS) {
    if (text.includes(req)) {
      if (!reasons.some(r => r.includes("sensitive information"))) {
        reasons.push(`Requests sensitive information: "${req}"`);
        riskScore += 20;
      }
    }
  }

  if (text.includes("http://")) {
    reasons.push("Contains unencrypted HTTP link (not HTTPS)");
    riskScore += 10;
  }

  const linkCount = (text.match(/https?:\/\//g) || []).length;
  if (linkCount > 2) {
    reasons.push(`Multiple suspicious links detected (${linkCount} links)`);
    riskScore += linkCount * 5;
  }

  riskScore = Math.min(100, riskScore);

  let riskLevel: RiskLevel = "safe";
  if (riskScore >= 40) riskLevel = "high";
  else if (riskScore >= 15) riskLevel = "suspicious";

  const tip = SAFETY_TIPS[Math.floor(Math.random() * SAFETY_TIPS.length)];

  if (reasons.length === 0) {
    reasons.push("No scam patterns detected in this email");
  }

  return { riskLevel, riskScore, reasons, tip };
}
