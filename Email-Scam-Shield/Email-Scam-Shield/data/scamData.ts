export interface ScamAlert {
  id: string;
  state: string;
  title: string;
  message: string;
  tip: string;
  date: string;
  category: string;
}

export const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir",
];

export const SCAM_DATA: ScamAlert[] = [
  {
    id: "1", state: "Andhra Pradesh",
    title: "Courier Delivery Scam",
    message: "Your parcel is waiting. Pay ₹50 delivery fee to release shipment from customs.",
    tip: "Delivery companies never request payment through unknown links. Call the official number.",
    date: "March 5, 2026", category: "Delivery"
  },
  {
    id: "2", state: "Andhra Pradesh",
    title: "KYC Update Fraud",
    message: "Your bank account will be suspended. Update KYC immediately at this link to avoid blocking.",
    tip: "Banks never ask for KYC updates via SMS links. Visit your branch directly.",
    date: "February 28, 2026", category: "Banking"
  },
  {
    id: "3", state: "Maharashtra",
    title: "Lottery Prize Scam",
    message: "Congratulations! You have won ₹25 lakh lottery. Pay processing fee of ₹500 to claim prize.",
    tip: "Legitimate lotteries never require upfront payment. Ignore such messages.",
    date: "March 7, 2026", category: "Lottery"
  },
  {
    id: "4", state: "Maharashtra",
    title: "OTP Fraud",
    message: "Your SBI account requires verification. Share the OTP received to complete the process.",
    tip: "Never share OTP with anyone. Banks will never ask for your OTP.",
    date: "March 1, 2026", category: "Banking"
  },
  {
    id: "5", state: "Delhi",
    title: "Job Offer Scam",
    message: "Work from home opportunity. Earn ₹50,000/month. Pay ₹2,000 registration fee to apply.",
    tip: "Legitimate jobs never charge registration fees. Research the company before applying.",
    date: "March 8, 2026", category: "Employment"
  },
  {
    id: "6", state: "Delhi",
    title: "Electricity Bill Threat",
    message: "Your electricity connection will be disconnected tonight. Pay overdue amount at this link immediately.",
    tip: "Check your official electricity board portal. Never pay through WhatsApp links.",
    date: "February 25, 2026", category: "Utility"
  },
  {
    id: "7", state: "Karnataka",
    title: "Tech Support Scam",
    message: "Your computer is infected with virus. Call our toll-free number immediately for free removal.",
    tip: "Microsoft and Apple never call you to warn about viruses. Hang up immediately.",
    date: "March 6, 2026", category: "Tech"
  },
  {
    id: "8", state: "Karnataka",
    title: "Investment Fraud",
    message: "Guaranteed 50% returns in 30 days. Invest ₹10,000 in our crypto scheme. Limited slots available!",
    tip: "No investment guarantees fixed high returns. Verify with SEBI before investing.",
    date: "March 3, 2026", category: "Investment"
  },
  {
    id: "9", state: "Tamil Nadu",
    title: "UPI QR Code Scam",
    message: "Scan this QR code to receive your refund of ₹4,500 from your recent purchase.",
    tip: "Scanning a QR code to RECEIVE money is always a scam. QR codes only send payments.",
    date: "March 4, 2026", category: "UPI"
  },
  {
    id: "10", state: "Tamil Nadu",
    title: "Insurance Policy Fraud",
    message: "Your insurance policy is expiring. Pay premium online through our secure portal to renew.",
    tip: "Always use official insurer website or call their official helpline for renewals.",
    date: "March 2, 2026", category: "Insurance"
  },
  {
    id: "11", state: "Uttar Pradesh",
    title: "Government Scheme Fraud",
    message: "PM Awas Yojana beneficiary list. Your name is included. Pay ₹1,500 processing fee to claim.",
    tip: "Government schemes never charge processing fees. Verify at official government portals.",
    date: "March 9, 2026", category: "Government"
  },
  {
    id: "12", state: "Uttar Pradesh",
    title: "Aadhaar Update Scam",
    message: "Your Aadhaar card will be deactivated. Update biometrics urgently by clicking this link.",
    tip: "UIDAI never sends such messages. Visit official Aadhaar centers only.",
    date: "February 20, 2026", category: "Identity"
  },
  {
    id: "13", state: "Gujarat",
    title: "GST Refund Fraud",
    message: "Your GST refund of ₹12,000 is approved. Submit bank details to receive the amount.",
    tip: "GST refunds are processed through official GSTN portal only. Never share bank details via SMS.",
    date: "March 5, 2026", category: "Tax"
  },
  {
    id: "14", state: "Gujarat",
    title: "Matrimonial Scam",
    message: "I am interested in your profile. Please share your details to proceed with the match.",
    tip: "Never share personal or financial details with unknown contacts online.",
    date: "March 1, 2026", category: "Social"
  },
  {
    id: "15", state: "Rajasthan",
    title: "Fake Police Call",
    message: "CBI officer speaking. Your number is involved in illegal activity. Pay ₹5,000 or get arrested.",
    tip: "Police never demand money over phone. Hang up and call 100 to verify.",
    date: "March 7, 2026", category: "Impersonation"
  },
  {
    id: "16", state: "West Bengal",
    title: "Scholarship Fraud",
    message: "You have been selected for national scholarship. Pay ₹800 registration to receive ₹15,000 award.",
    tip: "Genuine scholarships never require payment. Check official education ministry portals.",
    date: "March 6, 2026", category: "Education"
  },
  {
    id: "17", state: "Kerala",
    title: "Tourism Package Scam",
    message: "Exclusive Kerala tour package at 80% off. Pay advance of ₹3,000 to book immediately.",
    tip: "Always book through ATOL/IATA registered agents. Research before paying advance.",
    date: "February 28, 2026", category: "Tourism"
  },
  {
    id: "18", state: "Punjab",
    title: "Fake Bank Executive",
    message: "Bank executive calling. Your credit card is misused. Share CVV to block fraudulent transaction.",
    tip: "Banks never ask for CVV or PIN over phone. Hang up and call official bank number.",
    date: "March 4, 2026", category: "Banking"
  },
  {
    id: "19", state: "Telangana",
    title: "Netflix Subscription Scam",
    message: "Your Netflix account is suspended due to payment failure. Update payment details to continue.",
    tip: "Always go directly to Netflix.com to update payment. Never follow email links.",
    date: "March 8, 2026", category: "Streaming"
  },
  {
    id: "20", state: "Odisha",
    title: "Fake Amazon Delivery",
    message: "Your Amazon order #98745 could not be delivered. Pay ₹29 redelivery fee to reschedule.",
    tip: "Amazon never charges redelivery via external links. Check your Amazon app directly.",
    date: "March 3, 2026", category: "Delivery"
  },
];

export function getScamsByState(state: string): ScamAlert[] {
  const data = SCAM_DATA.filter(s => s.state === state);
  if (data.length > 0) return data;
  return [
    {
      id: "default1",
      state,
      title: "Phishing Email Alert",
      message: "Urgent: Your account needs verification. Click here to verify your identity immediately.",
      tip: "Always check the sender's email domain. Legitimate companies use official domains.",
      date: "March 2026",
      category: "Phishing",
    },
    {
      id: "default2",
      state,
      title: "UPI Payment Fraud",
      message: "You have received a payment request. Approve to receive ₹5,000 in your account.",
      tip: "You never need to approve a request to receive money. Incoming money requires no action.",
      date: "March 2026",
      category: "UPI",
    }
  ];
}
