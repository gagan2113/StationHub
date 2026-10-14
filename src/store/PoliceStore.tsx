import { createContext, useContext, useState, ReactNode } from "react";

// ── Existing types ──────────────────────────────────────────────────────────
export type Status = "Pending" | "In Progress" | "Closed" | "Resolved";
export type EFIRStatus = "Submitted" | "Under Review" | "Approved" | "Rejected" | "Converted";
export type FIRStatus = "Open" | "Under Investigation" | "Charge-sheeted" | "Closed";
export type ArrestStatus = "Arrested" | "On Bail" | "Absconding" | "Released";

// ── New types ───────────────────────────────────────────────────────────────
export type SentimentType = "Positive" | "Neutral" | "Negative" | "Mixed";
export type UrgencyLevel = "Low" | "Medium" | "High" | "Critical";
export type HotspotSeverity = "Low" | "Moderate" | "High" | "Critical";
export type PatrolPriority = "Low" | "Medium" | "High" | "Critical";
export type PatrolStatus = "Pending" | "Accepted" | "Dismissed" | "Under Review";
export type PatternStatus = "Active" | "Monitoring" | "Resolved";
export type ItemCategory = "Valuables" | "Electronics" | "Vehicles" | "Currency" | "Weapons" | "Documents" | "Narcotics" | "Other";
export type RecoveryStatus = "In Custody" | "Returned" | "Destroyed" | "Transferred" | "Auctioned";

// ── Existing interfaces ─────────────────────────────────────────────────────
export interface PCRCall {
  id: string;
  ddNumber: string;
  callTime: string;
  callerName: string;
  phone: string;
  callType: string;
  officer: string;
  status: Status;
  location: string;
  description: string;
  convertedToFIR?: string;
  duration?: number;
  transcript?: string;
  aiSummary?: string;
  sentiment?: SentimentType;
  urgency?: UrgencyLevel;
  keywords?: string[];
  entities?: { type: string; value: string }[];
  followUpActions?: string[];
}

export interface FIR {
  id: string;
  firNumber: string;
  station: string;
  date: string;
  crimeType: string;
  status: FIRStatus;
  io: string;
  complainant: string;
  description: string;
  accusedIds: string[];
  sourcePCR?: string;
  sourceEFIR?: string;
  severity?: "Low" | "Medium" | "High" | "Critical";
  evidence?: string[];
  recoveredItemIds?: string[];
}

export interface EFIR {
  id: string;
  efirNumber: string;
  date: string;
  incidentType: string;
  status: EFIRStatus;
  complainant: string;
  description: string;
  convertedFIR?: string;
}

export interface Accused {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  arrestStatus: ArrestStatus;
  address: string;
  linkedFIRs: string[];
  history: string[];
}

export interface Property {
  id: string;
  name: string;
  qty: number;
  value: number;
  linkedFIR: string;
  seizureType: "Stolen" | "Recovered" | "Seized" | "Found";
  date: string;
}

// ── New interfaces ──────────────────────────────────────────────────────────
export interface EmailRecord {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  bodyPreview: string;
  fullBody: string;
  receivedAt: string;
  location?: string;
  linkedFIR?: string;
  priority: UrgencyLevel;
  status: "Unread" | "Read" | "Actioned" | "Archived";
  sentiment: SentimentType;
  confidence: number;
  keywords: string[];
  entities: { type: string; value: string }[];
  aiSummary: string;
  suggestedActions: string[];
}

export interface HotspotArea {
  id: string;
  areaName: string;
  district: string;
  incidentCount: number;
  crimeCategories: { type: string; count: number }[];
  severity: HotspotSeverity;
  coordinates: { x: number; y: number };
  recentIncidents: string[];
  lastUpdated: string;
  trend: "Increasing" | "Stable" | "Decreasing";
  description: string;
  weeklyTrend: number[];
}

export interface PatrolRecommendation {
  id: string;
  area: string;
  district: string;
  priority: PatrolPriority;
  status: PatrolStatus;
  reason: string;
  recentIncidents: number;
  crimeTypes: string[];
  suggestedTimeWindow: string;
  relatedHotspot?: string;
  relatedCases: string[];
  createdAt: string;
  assignedOfficer?: string;
  scheduledTime?: string;
}

export interface CrimePattern {
  id: string;
  title: string;
  crimeCategory: string;
  area: string;
  incidentCount: number;
  timeRange: string;
  relatedFIRs: string[];
  status: PatternStatus;
  description: string;
  firstIncident: string;
  lastIncident: string;
  frequency: string;
  locations: string[];
  patternNote: string;
}

export interface RecoveredItem {
  id: string;
  itemId: string;
  name: string;
  category: ItemCategory;
  description: string;
  quantity: number;
  estimatedValue: number;
  recoveryDate: string;
  recoveryLocation: string;
  linkedFIR: string;
  linkedCase: string;
  recoveryStatus: RecoveryStatus;
  assignedOfficer: string;
  notes: string;
}

// ── Reference data ──────────────────────────────────────────────────────────
export const stations = ["Connaught Place", "Karol Bagh", "Saket", "Dwarka", "Rohini"];
export const officers = ["Insp. Rajesh Kumar", "SI Anita Sharma", "ASI Vikram Singh", "Insp. Meera Joshi", "SI Arjun Mehta"];
export const callTypes = ["Theft", "Assault", "Domestic Dispute", "Traffic Accident", "Noise Complaint", "Burglary", "Missing Person", "Suspicious Activity"];
export const crimeTypes = ["Theft (379 IPC)", "Burglary (457 IPC)", "Assault (323 IPC)", "Fraud (420 IPC)", "Kidnapping (363 IPC)", "Robbery (392 IPC)", "Cheating (415 IPC)"];
export const areas = ["Connaught Place", "Karol Bagh", "Saket", "Dwarka Sector 6", "Rohini Sector 3", "Lajpat Nagar", "Pitam Pura", "Mayur Vihar Phase 1", "Janakpuri", "Greater Kailash"];

// ── Data seeds ───────────────────────────────────────────────────────────────

const transcripts: Record<string, string> = {
  Theft: `[09:15:02] OPERATOR: Delhi Police Emergency Services, DD-2024001 assigned. How may I assist you?
[09:15:08] CALLER: Hello — my motorcycle was stolen from outside Karol Bagh Main Market. I was inside for barely 30 minutes!
[09:15:14] OPERATOR: Understood sir. Your full name and contact number please?
[09:15:18] CALLER: Amit Verma. 9876543210. My bike is a red Hero Splendor Plus, 2022 model. Registration DL-5S-1234.
[09:15:27] OPERATOR: Are you currently at the location, Mr. Verma?
[09:15:30] CALLER: Yes, I'm standing right here at the market gate. There are CCTV cameras on both sides of the road.
[09:15:36] OPERATOR: Very good. Do not leave. Patrol unit from Karol Bagh PS is being dispatched — ETA 10-12 minutes. Do NOT request the CCTV footage yourself; the IO will handle that.
[09:15:46] CALLER: Okay. Actually — now that I think about it — there was a young man on a motorcycle watching the parked vehicles for about 10 minutes before I went in.
[09:15:55] OPERATOR: That is a critical observation. Please retain this detail. Can you describe the person?
[09:15:59] CALLER: Maybe 22-24 years old, slim build, dark green jacket, helmeted. He was sitting on a black Pulsar.
[09:16:08] OPERATOR: Noted in call record. I am flagging this for the patrol unit. Was the Pulsar registration visible?
[09:16:13] CALLER: Only partially — it started with DL-7. I didn't think much of it at the time.
[09:16:19] OPERATOR: That partial plate is still very useful. Please share all of this with the arriving officer. Your DD number is DD-2024001 — you will receive an SMS confirmation.
[09:16:28] CALLER: How quickly can an FIR be registered? This bike is my only transport for work.
[09:16:33] OPERATOR: The patrol officer will do initial documentation on-scene. FIR registration at Karol Bagh PS takes about 20 minutes thereafter. Please remain calm and cooperative with the officer.
[09:16:41] CALLER: Thank you. Please hurry.
[09:16:43] OPERATOR: Unit is on the way, Mr. Verma. Thank you for calling Delhi Police.`,

  Assault: `[10:30:05] OPERATOR: Delhi Police Emergency, DD-2024002. What is your emergency?
[10:30:10] CALLER: There's a serious fight near Old Bus Stand, Rohini! Three men are beating one person badly — he's on the ground!
[10:30:16] OPERATOR: Calm down. Are you witnessing this right now?
[10:30:19] CALLER: Yes, I'm about 20 metres away. They're kicking him. Please send someone now!
[10:30:24] OPERATOR: Unit is being dispatched immediately. Your name please?
[10:30:27] CALLER: Priya Singh. I'm near the juice shop at the bus stand entrance.
[10:30:32] OPERATOR: Ms. Singh, do any of the attackers have weapons — knives, rods?
[10:30:36] CALLER: No weapons I can see. But the victim looks like he might be unconscious now. There's blood on his face.
[10:30:43] OPERATOR: An ambulance is also being dispatched. Please do NOT intervene physically. Can you describe the attackers?
[10:30:49] CALLER: Three men, young, 20-25 years. One in a red t-shirt, one in a blue jacket, third in a white shirt. They look like they know each other.
[10:30:57] OPERATOR: Are they still at the scene?
[10:31:01] CALLER: The attackers are starting to run — heading towards the market lane on the left, towards Sector 8 side!
[10:31:07] OPERATOR: Noted. Relaying description to all area units now. The man in the red t-shirt — does he have a bag or any identifying item?
[10:31:13] CALLER: Red t-shirt man has a brown satchel bag. The one in the blue jacket was on a motorbike — I think he's getting on it now.
[10:31:20] OPERATOR: Note the registration if you can. Is the victim being helped by anyone?
[10:31:25] CALLER: Yes, people are gathering around him now. He's conscious and trying to sit up. Oh thank God.
[10:31:30] OPERATOR: That's good. Police ETA is under 5 minutes. Please stay at the scene to assist with witness statement. Well done for calling promptly, Ms. Singh.`,

  Burglary: `[11:45:08] OPERATOR: Delhi Police Emergency, DD-2024003. How may I help?
[11:45:14] CALLER: My house has been broken into! I just came home and the front door lock is completely broken.
[11:45:20] OPERATOR: What is your address, sir?
[11:45:23] CALLER: E-45, Sector 12, Dwarka. Second floor. Rahul Gupta, 7654321098.
[11:45:30] OPERATOR: Mr. Gupta — are you inside the house right now?
[11:45:33] CALLER: I'm at the doorway. I haven't stepped inside. I was scared someone might still be in there.
[11:45:39] OPERATOR: Extremely wise. Do NOT enter. Move back to the landing. Can you hear anything from inside?
[11:45:44] CALLER: No, it's quiet. But I can see from here that drawers are pulled out and things are scattered on the floor.
[11:45:51] OPERATOR: A unit and forensics team are being dispatched from Dwarka PS now. Do you live alone?
[11:45:55] CALLER: Yes. I left for work at 9 AM — everything was normal then.
[11:46:01] OPERATOR: Please go to your neighbour's flat and wait there. Do NOT touch the door, handle, or any surface. Is there a building security guard?
[11:46:09] CALLER: Yes, a guard named Rajesh is at the main gate.
[11:46:13] OPERATOR: Please call down to Rajesh and ask him to ensure no one enters the building or tampers with the area near your flat.
[11:46:20] CALLER: Okay. I had gold jewellery and about 40,000 rupees cash in my bedroom.
[11:46:27] OPERATOR: I am noting the estimated valuables for the record. Please do not check the bedroom until the officer clears the scene — scene preservation is critical for forensic evidence.
[11:46:35] CALLER: How long will the unit take?
[11:46:38] OPERATOR: Approximately 12-15 minutes. Your DD number is DD-2024003 — SMS confirmation being sent now. Stay with your neighbour.
[11:46:45] CALLER: Alright. Thank you.
[11:46:47] OPERATOR: You're safe, Mr. Gupta. The team is on their way.`,

  "Missing Person": `[14:00:12] OPERATOR: Delhi Police Emergency, DD-2024004. Please state your emergency.
[14:00:17] CALLER: My son is missing! Please help me — my 8-year-old hasn't come home and it's been four hours!
[14:00:22] OPERATOR: Stay with me, ma'am. I'm here. Your name and location?
[14:00:26] CALLER: Sunita Devi. 6543210987. Parliament Street colony, Connaught Place. He went to the nearby park at 4 PM — it is now 8 PM!
[14:00:35] OPERATOR: This is being registered as Priority One right now. What is your son's name and age?
[14:00:39] CALLER: Arjun. Eight years old. He always comes home by 6 PM. He has never done this before.
[14:00:47] OPERATOR: Can you describe what he was wearing?
[14:00:51] CALLER: Blue school t-shirt, brown shorts, blue Bata shoes. He's about four feet tall, fair skin, short hair. He had a red water bottle with him.
[14:01:02] OPERATOR: Any birthmarks or distinct features?
[14:01:06] CALLER: Small scar on his left knee from a fall last year. Please — I've already gone to the park and his friends said he was playing till 5:30 and then just disappeared.
[14:01:16] OPERATOR: Units are being deployed to the park area RIGHT NOW. Do you have a recent photograph of Arjun?
[14:01:21] CALLER: Yes, his school photo is on my phone. How do I send it?
[14:01:25] OPERATOR: Our officer will take it when they arrive. Please have it ready. Is your husband or any family member with you?
[14:01:30] CALLER: My husband is coming from Gurgaon. My mother is here with me.
[14:01:35] OPERATOR: Good. Have you checked with all relatives — is it possible anyone picked him up without informing you?
[14:01:41] CALLER: I've called everyone. No one has him. He would never go with a stranger. He knows the rules.
[14:01:48] OPERATOR: Understood. Officers will be at the park in under 8 minutes. A female officer team is also being dispatched to support you. Please stay home so the officer can take your statement and the photograph immediately.
[14:01:59] CALLER: Please find him. He's everything to me.
[14:02:04] OPERATOR: Ma'am — Delhi Police is fully engaged on this. Every unit in the area is being alerted. We will find Arjun.`,

  "Noise Complaint": `[08:20:05] OPERATOR: Delhi Police, DD-2024005. How can I help you?
[08:20:09] CALLER: I want to file a complaint against my neighbour. Loud music and party sounds since midnight. I have to go to work in an hour and I haven't slept at all.
[08:20:19] OPERATOR: Location and your name please, sir?
[08:20:23] CALLER: Mohan Lal, Flat 304, Block C, Saket. 5432109876. The noise is from Flat 404, directly above me.
[08:20:31] OPERATOR: Have you spoken to the neighbour about this, sir?
[08:20:35] CALLER: Twice! I knocked at 1 AM and they apologized, reduced the music for 10 minutes and then started again full volume. This is the third time this month.
[08:20:45] OPERATOR: Is the music still ongoing right now?
[08:20:48] CALLER: Yes, I can barely hear you over it. It sounds like a DJ system.
[08:20:53] OPERATOR: Understood. This is a Noise Pollution complaint under Delhi Municipal regulations. A constable will be dispatched within 20-30 minutes to issue a formal warning.
[08:21:02] CALLER: 20-30 minutes? It's already 8 AM! I need to leave for work!
[08:21:07] OPERATOR: I fully understand your frustration, Mr. Lal. Please note your complaint is officially logged with DD number DD-2024005. You will receive an SMS. The officer can issue a challan if the resident does not comply.
[08:21:18] CALLER: Good. And what if they start again tomorrow night?
[08:21:22] OPERATOR: Each call creates a record. Repeated offences result in escalating action including court summons. I'd also suggest submitting a written complaint at Saket PS to create a paper trail.
[08:21:31] CALLER: I'll do that. Thank you.
[08:21:34] OPERATOR: Officer will arrive shortly. Thank you for your patience, Mr. Lal.`,

  "Suspicious Activity": `[09:45:03] OPERATOR: Delhi Police, DD-2024006. Please describe your concern.
[09:45:09] CALLER: I'm at Rohini metro station, Gate 2. There are two men who have been standing here for over 40 minutes watching people's bags and phones.
[09:45:19] OPERATOR: Are they interfering with anyone right now?
[09:45:23] CALLER: One of them just deliberately bumped into a woman — he definitely tried to reach into her bag. She grabbed it and stepped away, looked shaken.
[09:45:32] OPERATOR: Did he succeed in taking anything?
[09:45:35] CALLER: I don't think so — she walked away quickly. But they haven't left, they've just moved position slightly.
[09:45:42] OPERATOR: Your name and contact please?
[09:45:45] CALLER: Kavita Rao. I'm on the station exit ramp. 4321098765.
[09:45:50] OPERATOR: Ms. Rao, please do not attract their attention. Can you describe them?
[09:45:55] CALLER: One is about 5 feet 8, dark complexion, grey hoodie. The other shorter, yellow shirt, carrying a blue backpack over one shoulder.
[09:46:03] OPERATOR: This description matches a pattern we have been actively tracking in this area. This is very helpful. An undercover unit is being deployed — ETA under 10 minutes.
[09:46:12] CALLER: Should I tell metro security in the meantime?
[09:46:16] OPERATOR: Yes — please inform the metro security staff. Ask them to monitor but not to confront. Do you think they have seen you watching them?
[09:46:24] CALLER: I don't think so. I've been pretending to look at my phone.
[09:46:29] OPERATOR: Very smart. Keep doing that. If they move to leave, track which exit direction but do not follow them. Our unit will be in plain clothes. Thank you Ms. Rao — this call may prevent several thefts today.`,

  "Domestic Dispute": `[11:15:07] OPERATOR: Delhi Police Emergency, DD-2024007. Please state your emergency.
[11:15:13] CALLER: I'm calling about my neighbour. There's been shouting and banging from the flat next door for nearly 30 minutes. I think the husband is hitting his wife.
[11:15:23] OPERATOR: Your name and location?
[11:15:26] CALLER: Sandeep Yadav. Park Avenue, Janakpuri, B-Wing, Flat 201. 3210987654.
[11:15:33] OPERATOR: Is the disturbance still ongoing?
[11:15:37] CALLER: Yes, I can hear a woman crying and things being thrown. There's a child in that flat too — I can hear a baby.
[11:15:45] OPERATOR: Have you tried to intervene?
[11:15:49] CALLER: I knocked and asked if everything was okay. The man opened the door, said it was a family matter and slammed it. The woman looked frightened but didn't say anything. She had a bruise on her face.
[11:15:59] OPERATOR: You did the right thing not to push further. Units are being dispatched now, including a female officer. Do you know anything about the family?
[11:16:06] CALLER: They moved in about three months ago. They fight frequently but never this bad. I think her name is Seema. He works night shifts, comes home around 10 AM.
[11:16:15] OPERATOR: Is there only one entrance to their flat — through the main building staircase?
[11:16:19] CALLER: Yes. The watchman Raju is at the main gate.
[11:16:24] OPERATOR: Please go now and quietly tell Raju the male resident should not be allowed to leave. Don't tell him why — just say police are coming.
[11:16:32] CALLER: What if he hurts her before your unit arrives?
[11:16:36] OPERATOR: If you hear sounds of acute injury or serious danger — screaming for help, a crash, silence — call us again immediately. Officers are 8 minutes away.
[11:16:44] CALLER: Okay. I'm going to the gate now.
[11:16:47] OPERATOR: Well done for calling, Mr. Yadav. You may have helped save someone tonight.`,

  "Traffic Accident": `[13:30:09] OPERATOR: Delhi Police, DD-2024008. What is your emergency?
[13:30:14] CALLER: Major accident on Ring Road near Greater Kailash. Three vehicles. People are badly injured!
[13:30:20] OPERATOR: Exact location — nearest landmark?
[13:30:23] CALLER: Before the GK flyover, near the petrol pump. An SUV ran a red light and hit two cars. One car has hit the divider hard.
[13:30:32] OPERATOR: Your name?
[13:30:34] CALLER: Neha Kapoor. I witnessed it from my car. I'm pulled over with hazard lights on.
[13:30:39] OPERATOR: How many injured people can you see?
[13:30:43] CALLER: At least three or four. One woman is clutching her head — there's blood. A man is trapped inside the car that hit the divider. The SUV driver seems fine but is trying to reverse.
[13:30:53] OPERATOR: Two police units and two ambulances are being dispatched right now. Please note the SUV registration if you can — do NOT physically stop the driver.
[13:31:00] CALLER: UP-16-CA... I can't see the last digits from here. White coloured Fortuner.
[13:31:07] OPERATOR: UP-16-CA, white Fortuner — that's enough to run a check. Is there fire or smoke from any vehicle?
[13:31:13] CALLER: No fire. But I can smell something — maybe petrol. The trapped man is conscious — I can see him moving.
[13:31:20] OPERATOR: Do not approach the vehicle that smells of fuel. If a fire starts, move everyone back. Please tell bystanders — do NOT move the injured unless there is immediate fire danger.
[13:31:30] CALLER: Okay I'm calling out to people. Some men are trying to pull open the stuck door.
[13:31:36] OPERATOR: Ask them to stop — improper extraction with a spinal injury can be fatal. The ambulance paramedics will handle extraction. ETA 6 minutes.
[13:31:44] CALLER: Understood. I'll tell them.
[13:31:47] OPERATOR: You are handling this very well, Ms. Kapoor. Stay on the line if you can.`,

  Fraud: `[10:00:06] OPERATOR: Delhi Police, DD-2024010. What is your emergency?
[10:00:12] CALLER: I've been cheated. I got a call from someone claiming to be from HDFC Bank. They said my account was hacked and I needed to transfer money to a "safe account." I transferred 85,000 rupees and now I think it was fraud.
[10:00:26] OPERATOR: Stay calm, ma'am. When did this happen?
[10:00:29] CALLER: About one hour ago. 9 AM this morning. Geeta Sharma, Mayur Vihar Phase 1. 9987654321.
[10:00:37] OPERATOR: Ms. Sharma, the first thing I need you to do right now — while we talk — is call HDFC Bank toll-free 18001600 and report the unauthorized transfer. Demand an immediate freeze attempt.
[10:00:48] CALLER: I already called them. They said the money has left the account. But I have the UPI transaction ID and the account it went to.
[10:00:56] OPERATOR: That information is very important evidence. Do not delete anything — no messages, no call logs, nothing. Did the caller know personal details about your account?
[10:01:04] CALLER: He knew my full name, account balance to the rupee, and last four digits of my debit card. He sounded exactly like a real bank officer.
[10:01:13] OPERATOR: This is a sophisticated vishing operation — voice phishing. They obtain data from either data breaches or purchased lists. What number did the call come from?
[10:01:22] CALLER: It showed as the official HDFC number. 18001600. But it was fake — the bank said they never called me.
[10:01:29] OPERATOR: That is number spoofing — a serious cyber offence. Call the bank again and specifically ask them to file RBI Ombudsman fraud complaint and attempt a reversal under Section 75 of the Payment and Settlement Systems Act.
[10:01:41] CALLER: I'm writing all of this down.
[10:01:44] OPERATOR: Our Cyber Crime Unit from Saket PS will visit you today. Please have ready: the UPI transaction ID, the destination account details, every SMS received, and the call log. Do you have all of that?
[10:01:55] CALLER: Yes, I've saved everything. There were also two OTPs I gave them — they asked for the OTP that came to my phone.
[10:02:03] OPERATOR: That is how they completed the transfer. Never share OTPs — even bank staff are prohibited from asking for them. Your case is registered as DD-2024010. Officer will contact you within 3 hours.`,
};

const aiSummaries: Record<string, string> = {
  Theft: "Caller reports vehicle theft (motorcycle) from Main Market area during daytime. Incident classified as property crime - medium priority. Patrol unit dispatched. FIR registration recommended if vehicle not recovered within 24 hours.",
  Assault: "Reports physical altercation near public transport hub. Multiple individuals involved, possible injury. High urgency - immediate response required. Scene safety to be assessed before approach.",
  Burglary: "Residential break-in reported. Caller discovered forced entry upon returning home. No immediate safety threat confirmed. Scene preservation critical - advise caller not to enter until forensic unit clears premises.",
  "Missing Person": "Child missing report - 8-year-old male, missing since 16:00 hrs. Last seen at local park. High priority - AMBER alert protocols to be considered. Immediate area search and residential notification required.",
};

const seedPCR: PCRCall[] = [
  { id: "pcr-1", ddNumber: "DD-2024001", callTime: "2025-04-20 09:15", callerName: "Amit Verma", phone: "+91 98765 43210", callType: "Theft", officer: "Insp. Rajesh Kumar", status: "Closed", location: "Karol Bagh Main Market", description: "Motorcycle stolen from outside market.", convertedToFIR: "fir-1", duration: 4, transcript: transcripts["Theft"], aiSummary: aiSummaries["Theft"], sentiment: "Negative", urgency: "Medium", keywords: ["motorcycle", "stolen", "market", "Karol Bagh"], entities: [{ type: "Location", value: "Karol Bagh Main Market" }, { type: "Item", value: "Motorcycle" }], followUpActions: ["Register FIR", "Check CCTV footage", "Alert nearby units"] },
  { id: "pcr-2", ddNumber: "DD-2024002", callTime: "2025-04-20 10:30", callerName: "Priya Singh", phone: "+91 87654 32109", callType: "Assault", officer: "SI Anita Sharma", status: "In Progress", location: "Old Bus Stand, Rohini", description: "Physical altercation near bus stand.", duration: 3, transcript: transcripts["Assault"], aiSummary: aiSummaries["Assault"], sentiment: "Negative", urgency: "High", keywords: ["fight", "bus stand", "injury", "altercation"], entities: [{ type: "Location", value: "Old Bus Stand, Rohini" }], followUpActions: ["Mediate dispute", "Medical assistance", "Witness statements"] },
  { id: "pcr-3", ddNumber: "DD-2024003", callTime: "2025-04-20 11:45", callerName: "Rahul Gupta", phone: "+91 76543 21098", callType: "Burglary", officer: "ASI Vikram Singh", status: "Pending", location: "Sector 12, Dwarka", description: "House break-in reported.", duration: 6, transcript: transcripts["Burglary"], aiSummary: aiSummaries["Burglary"], sentiment: "Negative", urgency: "High", keywords: ["break-in", "burglary", "lock broken", "valuables"], entities: [{ type: "Location", value: "Sector 12, Dwarka" }], followUpActions: ["Preserve scene", "Forensics team", "Valuables inventory"] },
  { id: "pcr-4", ddNumber: "DD-2024004", callTime: "2025-04-20 14:00", callerName: "Sunita Devi", phone: "+91 65432 10987", callType: "Missing Person", officer: "Insp. Meera Joshi", status: "In Progress", location: "Park, Connaught Place", description: "Child missing from local park since afternoon.", duration: 8, transcript: transcripts["Missing Person"], aiSummary: aiSummaries["Missing Person"], sentiment: "Negative", urgency: "Critical", keywords: ["missing child", "park", "8 years old"], entities: [{ type: "Person", value: "8-year-old male" }, { type: "Location", value: "Park, Connaught Place" }], followUpActions: ["Initiate AMBER protocol", "Area canvass", "CCTV review"] },
  { id: "pcr-5", ddNumber: "DD-2024005", callTime: "2025-04-21 08:20", callerName: "Mohan Lal", phone: "+91 54321 09876", callType: "Noise Complaint", officer: "SI Arjun Mehta", status: "Closed", location: "Block C, Saket", description: "Loud music from neighbouring flat since midnight.", duration: 2, transcript: transcripts["Noise Complaint"], aiSummary: "Noise disturbance complaint. Low priority community issue. Unit dispatched for mediation.", sentiment: "Neutral", urgency: "Low", keywords: ["noise", "music", "flat", "neighbourhood"], entities: [{ type: "Location", value: "Block C, Saket" }], followUpActions: ["Issue warning", "Document complaint"] },
  { id: "pcr-6", ddNumber: "DD-2024006", callTime: "2025-04-21 09:45", callerName: "Kavita Rao", phone: "+91 43210 98765", callType: "Suspicious Activity", officer: "Insp. Rajesh Kumar", status: "In Progress", location: "Metro Station, Rohini", description: "Unknown individuals loitering near metro station.", duration: 3, transcript: transcripts["Suspicious Activity"], aiSummary: "Suspicious activity near metro. Individuals matching description of recent theft suspects. Medium priority. Surveillance recommended.", sentiment: "Mixed", urgency: "Medium", keywords: ["suspicious", "loitering", "metro", "unknown individuals"], entities: [{ type: "Location", value: "Metro Station, Rohini" }], followUpActions: ["Surveillance", "Cross-reference with wanted list"] },
  { id: "pcr-7", ddNumber: "DD-2024007", callTime: "2025-04-21 11:15", callerName: "Sandeep Yadav", phone: "+91 32109 87654", callType: "Domestic Dispute", officer: "SI Anita Sharma", status: "Closed", location: "Park Avenue, Janakpuri", description: "Domestic disturbance. Neighbours called on behalf of victim.", duration: 5, transcript: transcripts["Domestic Dispute"], aiSummary: "Domestic dispute responded. Mediation successful. Victim provided safety advisory. Follow-up welfare check scheduled.", sentiment: "Negative", urgency: "Medium", keywords: ["domestic", "dispute", "neighbours", "disturbance"], entities: [{ type: "Location", value: "Park Avenue, Janakpuri" }], followUpActions: ["Welfare check in 48 hrs", "Refer to support services"] },
  { id: "pcr-8", ddNumber: "DD-2024008", callTime: "2025-04-21 13:30", callerName: "Neha Kapoor", phone: "+91 21098 76543", callType: "Traffic Accident", officer: "ASI Vikram Singh", status: "Closed", location: "Ring Road, Greater Kailash", description: "Three vehicle collision. Minor injuries reported.", duration: 4, transcript: transcripts["Traffic Accident"], aiSummary: "Road accident - three vehicles. Minor injuries. Traffic management required. Insurance and FIR documentation advised.", sentiment: "Mixed", urgency: "Medium", keywords: ["accident", "collision", "ring road", "injuries"], entities: [{ type: "Location", value: "Ring Road, Greater Kailash" }, { type: "Event", value: "3-vehicle collision" }], followUpActions: ["Traffic clearance", "Medical attention", "Medico-legal case"] },
  { id: "pcr-9", ddNumber: "DD-2024009", callTime: "2025-04-22 08:45", callerName: "Rakesh Jain", phone: "+91 10987 65432", callType: "Theft", officer: "Insp. Meera Joshi", status: "Pending", location: "Pitam Pura Market", description: "Wallet stolen from inside shop by suspected shoplifter.", duration: 3, transcript: transcripts["Theft"], aiSummary: "Petty theft inside commercial premises. Possible repeat offender - third similar incident in this area this week. CCTV evidence likely available.", sentiment: "Negative", urgency: "Medium", keywords: ["wallet", "shoplifting", "market", "theft"], entities: [{ type: "Location", value: "Pitam Pura Market" }, { type: "Item", value: "Wallet" }], followUpActions: ["CCTV review", "Check repeat pattern", "Register FIR"] },
  { id: "pcr-10", ddNumber: "DD-2024010", callTime: "2025-04-22 10:00", callerName: "Geeta Sharma", phone: "+91 99876 54321", callType: "Fraud", officer: "SI Arjun Mehta", status: "In Progress", location: "Mayur Vihar Phase 1", description: "Online fraud - caller transferred money to unknown account believing bank call.", duration: 7, transcript: transcripts["Fraud"], aiSummary: "Online financial fraud (vishing). Victim transferred significant amount. Cyber cell notification required. Transaction tracing initiated. High priority due to financial loss.", sentiment: "Negative", urgency: "High", keywords: ["fraud", "online scam", "bank", "money transfer", "vishing"], entities: [{ type: "Crime", value: "Vishing/Online Fraud" }, { type: "Location", value: "Mayur Vihar Phase 1" }], followUpActions: ["Cyber cell referral", "Bank hold request", "Transaction trace"] },
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: `pcr-${i + 11}`,
    ddNumber: `DD-202${4011 + i}`,
    callTime: `2025-04-${String(22 + Math.floor(i / 3)).padStart(2, "0")} ${String(11 + (i % 10)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
    callerName: ["Vikram Bhatia", "Lakshmi Nair", "Ajay Tiwari", "Rekha Jha", "Sunil Pandey", "Mamta Singh", "Deepak Arora", "Usha Rani", "Ramesh Sharma", "Pooja Gupta"][i],
    phone: `+91 ${String(91000 + i * 1337).slice(0, 5)} ${String(10000 + i * 4567).slice(0, 5)}`,
    callType: callTypes[i % callTypes.length],
    officer: officers[i % officers.length],
    status: (["Pending", "In Progress", "Closed"] as Status[])[i % 3],
    location: areas[i % areas.length],
    description: "Caller reported incident in vicinity. Patrol unit dispatched for verification.",
    duration: 2 + (i % 8),
    sentiment: (["Negative", "Neutral", "Negative", "Mixed"] as SentimentType[])[i % 4],
    urgency: (["Low", "Medium", "High", "Medium"] as UrgencyLevel[])[i % 4],
    keywords: [callTypes[i % callTypes.length].toLowerCase(), "reported", "patrol"],
    entities: [{ type: "Location", value: areas[i % areas.length] }],
    aiSummary: `${callTypes[i % callTypes.length]} reported near ${areas[i % areas.length]}. Standard response initiated. Follow-up verification recommended.`,
    followUpActions: ["Dispatch patrol", "Document incident"],
  })),
];

const seedFIR: FIR[] = [
  { id: "fir-1", firNumber: "FIR/0100/2025", station: "Karol Bagh", date: "2025-04-20", crimeType: "Theft (379 IPC)", status: "Under Investigation", io: "Insp. Rajesh Kumar", complainant: "Amit Verma", description: "FIR registered for theft of Hero Splendor motorcycle (DL-5S-1234) from Main Market, Karol Bagh. Victim identified as Amit Verma, 34, resident of Block D, Karol Bagh. CCTV footage requested from adjacent shops.", accusedIds: ["acc-1"], sourcePCR: "pcr-1", severity: "Medium", evidence: ["CCTV footage", "Witness statement"], recoveredItemIds: [] },
  { id: "fir-2", firNumber: "FIR/0101/2025", station: "Rohini", date: "2025-04-20", crimeType: "Assault (323 IPC)", status: "Open", io: "SI Anita Sharma", complainant: "Priya Singh", description: "Complainant reports assault by unknown persons near Old Bus Stand. Medical examination conducted at RML Hospital. Victim sustained minor injuries. Two suspects described by witnesses.", accusedIds: ["acc-2"], severity: "Medium", evidence: ["Medical report", "Witness statements"], recoveredItemIds: [] },
  { id: "fir-3", firNumber: "FIR/0102/2025", station: "Dwarka", date: "2025-04-20", crimeType: "Burglary (457 IPC)", status: "Under Investigation", io: "ASI Vikram Singh", complainant: "Rahul Gupta", description: "Residential burglary at E-45, Sector 12, Dwarka. Forced entry through back window. Gold jewellery and cash stolen. Forensic team has collected fingerprint samples. No suspects identified.", accusedIds: [], sourcePCR: "pcr-3", severity: "High", evidence: ["Fingerprint samples", "Break-in marks", "CCTV partial"], recoveredItemIds: ["ri-1"] },
  { id: "fir-4", firNumber: "FIR/0103/2025", station: "Connaught Place", date: "2025-04-20", crimeType: "Kidnapping (363 IPC)", status: "Under Investigation", io: "Insp. Meera Joshi", complainant: "Sunita Devi", description: "Missing child case escalated to kidnapping FIR after 24 hours. Child identified as Arjun Devi, age 8, last seen in Sarojini Park area. All units alerted. School and neighbourhood inquiry conducted.", accusedIds: [], sourcePCR: "pcr-4", severity: "Critical", evidence: ["CCTV footage", "Witness accounts", "School records"], recoveredItemIds: [] },
  { id: "fir-5", firNumber: "FIR/0104/2025", station: "Saket", date: "2025-04-21", crimeType: "Fraud (420 IPC)", status: "Under Investigation", io: "SI Arjun Mehta", complainant: "Geeta Sharma", description: "Online financial fraud. Victim transferred Rs. 85,000 to fraudulent account posing as HDFC Bank representative. Cyber cell notified. Bank transaction records subpoenaed.", accusedIds: ["acc-5"], severity: "High", evidence: ["Bank transaction logs", "Call recordings", "IP trace"], recoveredItemIds: ["ri-7"] },
  { id: "fir-6", firNumber: "FIR/0105/2025", station: "Rohini", date: "2025-04-21", crimeType: "Theft (379 IPC)", status: "Open", io: "Insp. Rajesh Kumar", complainant: "Rakesh Jain", description: "Wallet and mobile phone stolen from inside Pitam Pura electronics market. Suspect seen on CCTV. Third similar incident in this area in 7 days.", accusedIds: ["acc-3"], severity: "Low", evidence: ["CCTV footage"], recoveredItemIds: [] },
  { id: "fir-7", firNumber: "FIR/0106/2025", station: "Dwarka", date: "2025-04-22", crimeType: "Robbery (392 IPC)", status: "Under Investigation", io: "SI Anita Sharma", complainant: "Harish Mehta", description: "Armed robbery at Gold jewelry shop, Dwarka Sector 6. Two armed suspects entered at 8:30 PM. Took gold jewellery worth Rs. 4.5 lakhs. One suspect partially identified from CCTV.", accusedIds: ["acc-6", "acc-7"], severity: "Critical", evidence: ["CCTV footage", "Weapon traces", "Eyewitness"], recoveredItemIds: ["ri-2", "ri-3"] },
  { id: "fir-8", firNumber: "FIR/0107/2025", station: "Saket", date: "2025-04-22", crimeType: "Cheating (415 IPC)", status: "Charge-sheeted", io: "ASI Vikram Singh", complainant: "Rekha Jha", description: "Property fraud. Accused sold same flat to multiple buyers using forged documents. Charge sheet filed. Case in court.", accusedIds: ["acc-8"], severity: "High", evidence: ["Forged documents", "Victim testimonies", "Bank records"], recoveredItemIds: [] },
  { id: "fir-9", firNumber: "FIR/0108/2025", station: "Karol Bagh", date: "2025-04-23", crimeType: "Burglary (457 IPC)", status: "Open", io: "Insp. Meera Joshi", complainant: "Vijay Kumar", description: "Commercial burglary at electronics shop. Overnight break-in. CCTV partially damaged by intruders. Rs. 2.2 lakhs worth electronics stolen.", accusedIds: [], severity: "High", evidence: ["CCTV partial", "Inventory loss report"], recoveredItemIds: ["ri-4", "ri-5"] },
  { id: "fir-10", firNumber: "FIR/0109/2025", station: "Rohini", date: "2025-04-23", crimeType: "Assault (323 IPC)", status: "Closed", io: "SI Arjun Mehta", complainant: "Manish Garg", description: "Bar brawl resulting in assault. Accused identified and arrested. Medical examination done. Accused released on bail.", accusedIds: ["acc-9", "acc-10"], severity: "Low", evidence: ["Medical report", "Bar surveillance", "Witness statements"], recoveredItemIds: [] },
  { id: "fir-11", firNumber: "FIR/0110/2025", station: "Connaught Place", date: "2025-04-24", crimeType: "Theft (379 IPC)", status: "Under Investigation", io: "Insp. Rajesh Kumar", complainant: "Sunita Iyer", description: "Laptop and handbag stolen from café in Connaught Place. Suspect caught on CCTV but not yet identified.", accusedIds: [], severity: "Medium", evidence: ["CCTV footage", "Café surveillance"], recoveredItemIds: [] },
  { id: "fir-12", firNumber: "FIR/0111/2025", station: "Saket", date: "2025-04-25", crimeType: "Fraud (420 IPC)", status: "Open", io: "SI Anita Sharma", complainant: "Arjun Das", description: "Job fraud. Accused collected money promising government jobs. Multiple victims identified. Accused absconding.", accusedIds: ["acc-11"], severity: "High", evidence: ["Bank transactions", "Fake appointment letters", "Victim statements"], recoveredItemIds: [] },
  { id: "fir-13", firNumber: "FIR/0112/2025", station: "Dwarka", date: "2025-04-25", crimeType: "Robbery (392 IPC)", status: "Open", io: "ASI Vikram Singh", complainant: "Neha Batra", description: "Chain snatching from woman near Dwarka Sector 9 metro station. Suspects fled on motorcycle. Partial registration noted.", accusedIds: ["acc-12"], severity: "Medium", evidence: ["Partial vehicle registration", "Eyewitness"], recoveredItemIds: ["ri-6"] },
  { id: "fir-14", firNumber: "FIR/0113/2025", station: "Rohini", date: "2025-04-26", crimeType: "Burglary (457 IPC)", status: "Under Investigation", io: "Insp. Meera Joshi", complainant: "Deepak Arora", description: "Fourth residential burglary in Rohini Sector 3 in 15 days. MO consistent with previous incidents. Possible serial offender. Forensic evidence compiled.", accusedIds: [], severity: "High", evidence: ["Forensic prints", "MO analysis", "CCTV grid"], recoveredItemIds: [] },
];

const seedEFIR: EFIR[] = Array.from({ length: 11 }).map((_, i) => ({
  id: `efir-${i + 1}`,
  efirNumber: `EFIR-${String(5000 + i).padStart(5, "0")}`,
  date: `2025-04-${String(15 + (i % 10)).padStart(2, "0")}`,
  incidentType: callTypes[i % callTypes.length],
  status: (["Submitted", "Under Review", "Approved", "Rejected", "Converted"] as EFIRStatus[])[i % 5],
  complainant: ["Vikash Kumar", "Sneha Patil", "Imran Khan", "Lata Iyer", "Deepak Bose"][i % 5],
  description: "Online complaint submitted via citizen portal. Awaiting verification.",
}));

const seedAccused: Accused[] = [
  { id: "acc-1", name: "Ramesh Tiwari", age: 28, gender: "Male", arrestStatus: "On Bail", address: "14A, Naya Bazar, Karol Bagh", linkedFIRs: ["fir-1"], history: ["Prior offence: Petty theft (2022)"] },
  { id: "acc-2", name: "Suresh Chand", age: 35, gender: "Male", arrestStatus: "Arrested", address: "B-21, Sector 14, Rohini", linkedFIRs: ["fir-2"], history: ["Prior offence: Assault (2021)", "Prior offence: Public nuisance (2023)"] },
  { id: "acc-3", name: "Vinod Kumar", age: 24, gender: "Male", arrestStatus: "Absconding", address: "Last known: Pitam Pura", linkedFIRs: ["fir-6"], history: ["Prior offence: Pickpocketing (2024)"] },
  { id: "acc-4", name: "Karan Malhotra", age: 30, gender: "Male", arrestStatus: "Released", address: "22, MG Road, Saket", linkedFIRs: [], history: [] },
  { id: "acc-5", name: "Aslam Sheikh", age: 42, gender: "Male", arrestStatus: "Arrested", address: "Cyber Cell Custody", linkedFIRs: ["fir-5"], history: ["Prior offence: Online fraud (2023)"] },
  { id: "acc-6", name: "Jagdish Pal", age: 31, gender: "Male", arrestStatus: "Arrested", address: "Under investigation", linkedFIRs: ["fir-7"], history: ["Prior offence: Robbery (2022)"] },
  { id: "acc-7", name: "Naveen Reddy", age: 27, gender: "Male", arrestStatus: "Absconding", address: "Suspected: South Delhi", linkedFIRs: ["fir-7"], history: [] },
  { id: "acc-8", name: "Bhupinder Singh", age: 48, gender: "Male", arrestStatus: "Arrested", address: "Model Town, Delhi", linkedFIRs: ["fir-8"], history: ["Prior offence: Property fraud (2019)"] },
  { id: "acc-9", name: "Manish Joshi", age: 26, gender: "Male", arrestStatus: "On Bail", address: "Sector 7, Rohini", linkedFIRs: ["fir-10"], history: [] },
  { id: "acc-10", name: "Anil Mehra", age: 29, gender: "Male", arrestStatus: "On Bail", address: "Sector 11, Rohini", linkedFIRs: ["fir-10"], history: [] },
  { id: "acc-11", name: "Santosh Pandey", age: 38, gender: "Male", arrestStatus: "Absconding", address: "Last known: Saket", linkedFIRs: ["fir-12"], history: ["Prior offence: Cheating (2021)"] },
  { id: "acc-12", name: "Dilip Bhatia", age: 22, gender: "Male", arrestStatus: "On Bail", address: "Dwarka Sector 9", linkedFIRs: ["fir-13"], history: [] },
];

const seedProperty: Property[] = Array.from({ length: 9 }).map((_, i) => ({
  id: `prop-${i + 1}`,
  name: ["Gold Necklace", "iPhone 14 Pro", "Cash (INR)", "Motorcycle - Splendor", "Laptop - Dell", "Silver Bracelet", "LED TV 43\"", "Bicycle", "Documents Bundle"][i],
  qty: [1, 1, 1, 1, 1, 2, 1, 1, 1][i],
  value: [85000, 110000, 45000, 65000, 55000, 12000, 28000, 8000, 0][i],
  linkedFIR: `fir-${(i % 14) + 1}`,
  seizureType: (["Stolen", "Recovered", "Seized", "Found"] as Property["seizureType"][])[i % 4],
  date: `2025-04-${String(12 + i).padStart(2, "0")}`,
}));

export const seedEmails: EmailRecord[] = [
  {
    id: "email-1",
    sender: "Concerned Resident",
    senderEmail: "cr.karolbagh@example.com",
    subject: "Repeated Break-ins in Our Colony",
    bodyPreview: "Dear Sir, I am writing to report that our colony in Karol Bagh has seen three break-ins in the past two weeks...",
    fullBody: "Dear Sir,\n\nI am writing to report that our colony in Karol Bagh has seen three break-ins in the past two weeks. The incidents occur at night and the thieves seem to know which houses are empty. Residents are very worried and request increased patrolling especially between 11 PM and 4 AM.\n\nThe affected houses are in Block D and E near the water tank. In each case, the back door or window was broken. Cash and jewellery have been taken.\n\nPlease take urgent action.\n\nRegards,\nA Concerned Resident",
    receivedAt: "2025-04-24 08:30",
    location: "Karol Bagh",
    linkedFIR: "fir-9",
    priority: "High",
    status: "Read",
    sentiment: "Negative",
    confidence: 0.91,
    keywords: ["break-ins", "colony", "patrolling", "night", "jewellery", "cash"],
    entities: [{ type: "Location", value: "Karol Bagh Block D & E" }, { type: "Time", value: "11 PM to 4 AM" }],
    aiSummary: "Resident reports pattern of residential burglaries in Karol Bagh colony. Three incidents in two weeks. Requests increased night patrol. Linked to active burglary FIR. Pattern matches repeat crime indicator.",
    suggestedActions: ["Link to FIR/0108/2025", "Schedule night patrol in Block D & E", "Investigate possible surveillance by suspects"],
  },
  {
    id: "email-2",
    sender: "Market Association Secretary",
    senderEmail: "mktassoc.pitampura@example.com",
    subject: "Pickpocket Gang Active in Pitam Pura Market",
    bodyPreview: "On behalf of the Pitam Pura Traders Association, I would like to draw your attention to an organized gang of pickpockets...",
    fullBody: "On behalf of the Pitam Pura Traders Association, I would like to draw your attention to an organized gang of pickpockets operating in our market area. Over the past 10 days, at least 8 shop visitors have reported theft of phones and wallets.\n\nThe suspects appear to be 3-4 young men aged 20-25 who distract customers while an accomplice steals valuables. They arrive around 11 AM and leave before 2 PM.\n\nWe request plainclothes officers to be deployed in the market during these hours.",
    receivedAt: "2025-04-24 11:15",
    location: "Pitam Pura",
    linkedFIR: "fir-6",
    priority: "Medium",
    status: "Actioned",
    sentiment: "Negative",
    confidence: 0.87,
    keywords: ["pickpocket", "gang", "market", "phones", "wallets", "organized"],
    entities: [{ type: "Location", value: "Pitam Pura Market" }, { type: "Time", value: "11 AM to 2 PM" }],
    aiSummary: "Formal complaint from traders association about organized pickpocket gang. Pattern: 3-4 suspects, targeting shoppers 11 AM-2 PM. Minimum 8 incidents reported. Suggests coordinated criminal activity.",
    suggestedActions: ["Deploy plainclothes officers", "Cross-reference with FIR-0105", "CCTV grid analysis for suspect identification"],
  },
  {
    id: "email-3",
    sender: "Anonymous Tipster",
    senderEmail: "anonymous.tip@example.com",
    subject: "Information Regarding Missing Child Case",
    bodyPreview: "I have information about the missing child case. I saw a man matching the description near Noida border...",
    fullBody: "I have information about the missing child case reported in the news. On April 21 at around 6 PM, I saw a man carrying a child matching the description near the Noida border toll. The man seemed nervous and the child appeared to be sleeping or drowsy.\n\nI noted partial vehicle number: UP-16 something. White Innova.\n\nI cannot share my identity due to safety concerns.",
    receivedAt: "2025-04-22 19:45",
    location: "Noida Border",
    linkedFIR: "fir-4",
    priority: "Critical",
    status: "Actioned",
    sentiment: "Mixed",
    confidence: 0.79,
    keywords: ["missing child", "Noida border", "vehicle", "white Innova", "tip"],
    entities: [{ type: "Location", value: "Noida Border Toll" }, { type: "Vehicle", value: "White Innova UP-16" }, { type: "Time", value: "April 21, 6 PM" }],
    aiSummary: "Anonymous tip relating to active child missing/kidnapping case. Specific vehicle and location details provided. High credibility markers. Requires immediate follow-up with border checkposts.",
    suggestedActions: ["Alert Noida police immediately", "Check border toll CCTV for April 21 6 PM", "Circulate vehicle description"],
  },
  {
    id: "email-4",
    sender: "RWA President",
    senderEmail: "rwa.dwarka@example.com",
    subject: "Request for Increased Night Patrol - Sector 6",
    bodyPreview: "Dear Inspector, This is to formally request enhanced patrolling in our residential sector...",
    fullBody: "Dear Inspector,\n\nThis is to formally request enhanced patrolling in our residential sector following the robbery at the jewelry shop last week. Residents are fearful and several families have approached me regarding safety concerns.\n\nWe request:\n1. Increased beat patrol from 8 PM to midnight\n2. A community meeting with senior officers\n3. CCTV cameras at the sector entry points\n\nWe are prepared to contribute to installation costs for CCTV through the RWA fund.\n\nRegards,\nRWA President, Dwarka Sector 6",
    receivedAt: "2025-04-23 10:00",
    location: "Dwarka Sector 6",
    linkedFIR: "fir-7",
    priority: "Medium",
    status: "Read",
    sentiment: "Neutral",
    confidence: 0.82,
    keywords: ["patrol", "night patrol", "CCTV", "residents", "fearful", "community meeting"],
    entities: [{ type: "Location", value: "Dwarka Sector 6" }, { type: "Event", value: "Community meeting request" }],
    aiSummary: "RWA raising formal concern post-robbery. Requests enhanced patrol and infrastructure. Community willing to fund CCTV. Positive engagement opportunity. Linked to active robbery investigation.",
    suggestedActions: ["Schedule community policing meeting", "Explore CCTV proposal", "Assign additional beat to Sector 6"],
  },
  {
    id: "email-5",
    sender: "Fraud Victim",
    senderEmail: "fraud.victim@example.com",
    subject: "Additional Evidence for Online Fraud Case",
    bodyPreview: "I have additional screenshots and call recordings that may help in the fraud investigation...",
    fullBody: "Dear Investigating Officer,\n\nI am writing to submit additional evidence for the online fraud case (FIR/0104/2025). I have found additional SMS messages and have screen-recorded the call which I believe came from a spoofed number.\n\nI have also identified two other victims from my apartment complex who received similar calls on the same day. They lost Rs. 40,000 and Rs. 60,000 respectively.\n\nPlease let me know how to share this material securely.",
    receivedAt: "2025-04-25 14:30",
    location: "Mayur Vihar Phase 1",
    linkedFIR: "fir-5",
    priority: "High",
    status: "Actioned",
    sentiment: "Neutral",
    confidence: 0.88,
    keywords: ["fraud", "evidence", "screenshots", "call recordings", "additional victims"],
    entities: [{ type: "Evidence", value: "SMS records, call recordings" }, { type: "Amount", value: "Rs. 1,00,000 additional losses" }],
    aiSummary: "Victim providing supplementary evidence. Identifies two additional fraud victims in same building. Evidence includes call recordings and SMS. Total case amount may be significantly higher than initially reported.",
    suggestedActions: ["Document additional evidence formally", "Contact identified additional victims", "Update FIR with new information"],
  },
  {
    id: "email-6",
    sender: "School Principal",
    senderEmail: "principal@example.com",
    subject: "Drug Activity Suspected Near School Premises",
    bodyPreview: "I am the principal of a school in Rohini. We have noticed suspicious activity near our back gate...",
    fullBody: "I am the principal of a school in Rohini. Over the past two weeks, we have noticed suspicious activity near our back gate during lunch hours and after school. Two students have reported being approached by unknown young men.\n\nWe believe substances may be being distributed. The individuals use motorcycles and leave quickly.\n\nI am reporting this confidentially and would appreciate a discrete investigation to protect the students.",
    receivedAt: "2025-04-26 09:15",
    location: "Rohini",
    priority: "High",
    status: "Unread",
    sentiment: "Negative",
    confidence: 0.85,
    keywords: ["drugs", "school", "students", "suspicious activity", "motorcycles", "confidential"],
    entities: [{ type: "Location", value: "School premises, Rohini" }, { type: "Concern", value: "Drug distribution near school" }],
    aiSummary: "School principal reports suspected narcotics distribution near educational institution. Students approached by unknown individuals. Requires immediate discrete investigation. Potential child safety concern.",
    suggestedActions: ["Assign discrete investigation team", "Survey area during lunch hours", "Coordinate with school authorities", "Check against known drug network data"],
  },
  {
    id: "email-7",
    sender: "Hospital Security Officer",
    senderEmail: "hospital.security@example.com",
    subject: "Habitual Theft of Medical Equipment",
    bodyPreview: "We have been experiencing a series of thefts of medical equipment from our hospital stores...",
    fullBody: "We have been experiencing a series of thefts of medical equipment and medicines from our hospital stores. The incidents happen overnight and suggest inside knowledge. We have reviewed CCTV but the camera coverage is limited.\n\nIn the past month, items worth Rs. 1.2 lakhs have been reported missing including syringes, medicines, and a portable monitoring device.\n\nWe formally request police assistance in investigating this matter.",
    receivedAt: "2025-04-26 11:30",
    location: "Saket",
    priority: "Medium",
    status: "Unread",
    sentiment: "Neutral",
    confidence: 0.78,
    keywords: ["theft", "hospital", "medical equipment", "overnight", "inside job"],
    entities: [{ type: "Location", value: "Hospital, Saket" }, { type: "Value", value: "Rs. 1.2 lakhs" }],
    aiSummary: "Hospital reports systematic theft of medical supplies. Possible insider involvement given repeated overnight access. CCTV limited. Pattern suggests organized internal theft ring.",
    suggestedActions: ["Register FIR", "Forensic audit of access logs", "Background check on relevant staff", "Improve CCTV coverage"],
  },
  {
    id: "email-8",
    sender: "Anonymous Resident",
    senderEmail: "anon.rohini@example.com",
    subject: "Same Burglar Multiple Houses",
    bodyPreview: "I believe the same person is responsible for multiple burglaries in our sector. The MO is identical...",
    fullBody: "I believe the same person is responsible for multiple burglaries in our sector. In every case: back window forced open, only jewellery and cash taken, no vandalism, happens between 2-5 AM when most people are in deep sleep.\n\nI am a retired police officer and the MO is clearly the same person. Please check if there is a similar pattern in neighboring sectors as well. I can provide more details if needed.",
    receivedAt: "2025-04-26 15:00",
    location: "Rohini",
    linkedFIR: "fir-14",
    priority: "High",
    status: "Unread",
    sentiment: "Neutral",
    confidence: 0.93,
    keywords: ["burglary", "same suspect", "MO", "pattern", "repeat", "retired officer"],
    entities: [{ type: "Pattern", value: "Consistent MO burglaries 2-5 AM" }, { type: "Location", value: "Rohini Sector 3" }],
    aiSummary: "Retired officer identifies repeat burglary pattern with consistent MO. High-credibility source. Confirms active investigation findings. Suggests serial burglar operating across multiple sectors.",
    suggestedActions: ["Cross-reference with FIR-0113", "Expand search to neighboring sectors", "Brief IO Insp. Meera Joshi"],
  },
];

export const seedHotspots: HotspotArea[] = [
  {
    id: "hs-1",
    areaName: "Karol Bagh Market Area",
    district: "West Delhi",
    incidentCount: 12,
    crimeCategories: [{ type: "Theft", count: 7 }, { type: "Burglary", count: 3 }, { type: "Assault", count: 2 }],
    severity: "High",
    coordinates: { x: 35, y: 38 },
    recentIncidents: ["fir-1", "fir-6", "fir-9"],
    lastUpdated: "2025-04-26",
    trend: "Increasing",
    description: "Commercial and residential area with high footfall. Multiple thefts and burglaries in past 30 days. Night-time activity of concern.",
    weeklyTrend: [3, 4, 2, 5, 4, 6, 8],
  },
  {
    id: "hs-2",
    areaName: "Dwarka Sector 6-9",
    district: "South West Delhi",
    incidentCount: 9,
    crimeCategories: [{ type: "Robbery", count: 4 }, { type: "Burglary", count: 3 }, { type: "Fraud", count: 2 }],
    severity: "High",
    coordinates: { x: 18, y: 62 },
    recentIncidents: ["fir-3", "fir-7", "fir-13"],
    lastUpdated: "2025-04-26",
    trend: "Increasing",
    description: "Residential area with recent armed robbery. Chain snatching incidents near metro. Organized crime elements suspected.",
    weeklyTrend: [2, 2, 3, 4, 3, 5, 7],
  },
  {
    id: "hs-3",
    areaName: "Rohini Sector 3-5",
    district: "North West Delhi",
    incidentCount: 11,
    crimeCategories: [{ type: "Burglary", count: 6 }, { type: "Assault", count: 3 }, { type: "Suspicious Activity", count: 2 }],
    severity: "Critical",
    coordinates: { x: 28, y: 18 },
    recentIncidents: ["fir-2", "fir-10", "fir-14"],
    lastUpdated: "2025-04-26",
    trend: "Increasing",
    description: "Serial burglary pattern detected. Four residential burglaries in 15 days with identical MO. Possible serial offender at large.",
    weeklyTrend: [4, 3, 5, 6, 5, 8, 9],
  },
  {
    id: "hs-4",
    areaName: "Pitam Pura Market",
    district: "North West Delhi",
    incidentCount: 7,
    crimeCategories: [{ type: "Pickpocket/Theft", count: 6 }, { type: "Burglary", count: 1 }],
    severity: "Moderate",
    coordinates: { x: 24, y: 24 },
    recentIncidents: ["fir-6"],
    lastUpdated: "2025-04-25",
    trend: "Stable",
    description: "Organized pickpocket gang operating during peak hours. Market traders association has formally complained. Plainclothes deployment recommended.",
    weeklyTrend: [2, 3, 2, 3, 4, 3, 4],
  },
  {
    id: "hs-5",
    areaName: "Saket Commercial District",
    district: "South Delhi",
    incidentCount: 6,
    crimeCategories: [{ type: "Fraud", count: 4 }, { type: "Cheating", count: 2 }],
    severity: "Moderate",
    coordinates: { x: 45, y: 72 },
    recentIncidents: ["fir-5", "fir-8", "fir-12"],
    lastUpdated: "2025-04-25",
    trend: "Stable",
    description: "Financial fraud and property cheating concentration. Online fraud victims clustering in this area. Cyber crime cell engagement needed.",
    weeklyTrend: [1, 2, 1, 2, 3, 2, 3],
  },
  {
    id: "hs-6",
    areaName: "Connaught Place Central",
    district: "Central Delhi",
    incidentCount: 5,
    crimeCategories: [{ type: "Theft", count: 3 }, { type: "Kidnapping", count: 1 }, { type: "Suspicious Activity", count: 1 }],
    severity: "Moderate",
    coordinates: { x: 50, y: 45 },
    recentIncidents: ["fir-4", "fir-11"],
    lastUpdated: "2025-04-24",
    trend: "Decreasing",
    description: "Central business and tourist area. Child kidnapping case of concern. Theft from cafés reported. Tourist police presence has reduced petty crime.",
    weeklyTrend: [3, 4, 3, 2, 3, 2, 2],
  },
  {
    id: "hs-7",
    areaName: "Mayur Vihar Phase 1",
    district: "East Delhi",
    incidentCount: 4,
    crimeCategories: [{ type: "Online Fraud", count: 3 }, { type: "Assault", count: 1 }],
    severity: "Low",
    coordinates: { x: 72, y: 42 },
    recentIncidents: ["fir-5"],
    lastUpdated: "2025-04-23",
    trend: "Stable",
    description: "Online fraud hotspot. Multiple vishing victims in same apartment cluster. Coordinated fraud operation targeting residents.",
    weeklyTrend: [1, 1, 2, 2, 1, 2, 2],
  },
  {
    id: "hs-8",
    areaName: "Rohini School Zone",
    district: "North West Delhi",
    incidentCount: 3,
    crimeCategories: [{ type: "Suspicious Activity", count: 2 }, { type: "Narcotics (suspected)", count: 1 }],
    severity: "Moderate",
    coordinates: { x: 30, y: 14 },
    recentIncidents: [],
    lastUpdated: "2025-04-26",
    trend: "Increasing",
    description: "School proximity area with reported suspicious activity. Drug-related concern flagged by school principal. Requires discrete investigation.",
    weeklyTrend: [0, 0, 1, 1, 1, 2, 3],
  },
];

export const seedPatrolRecommendations: PatrolRecommendation[] = [
  {
    id: "pr-1",
    area: "Rohini Sector 3-5",
    district: "North West Delhi",
    priority: "Critical",
    status: "Accepted",
    reason: "Serial burglary pattern detected — 4 incidents in 15 days with identical MO. Serial offender likely at large. Night patrol 1-5 AM strongly recommended.",
    recentIncidents: 11,
    crimeTypes: ["Burglary", "Assault"],
    suggestedTimeWindow: "01:00 – 05:00 hrs",
    relatedHotspot: "hs-3",
    relatedCases: ["fir-14", "fir-10", "fir-2"],
    createdAt: "2025-04-26",
    assignedOfficer: "ASI Vikram Singh",
    scheduledTime: "2025-04-27 01:00",
  },
  {
    id: "pr-2",
    area: "Karol Bagh Market Area",
    district: "West Delhi",
    priority: "High",
    status: "Accepted",
    reason: "12 incidents in past 30 days with increasing trend. Multiple theft and burglary cases. Commercial area needs reinforced evening patrol.",
    recentIncidents: 12,
    crimeTypes: ["Theft", "Burglary"],
    suggestedTimeWindow: "20:00 – 24:00 hrs",
    relatedHotspot: "hs-1",
    relatedCases: ["fir-1", "fir-6", "fir-9"],
    createdAt: "2025-04-25",
    assignedOfficer: "Insp. Rajesh Kumar",
    scheduledTime: "2025-04-27 20:00",
  },
  {
    id: "pr-3",
    area: "Dwarka Sector 6-9",
    district: "South West Delhi",
    priority: "High",
    status: "Pending",
    reason: "Armed robbery and chain snatching incidents. Organized crime elements. Metro station area requires visible police presence.",
    recentIncidents: 9,
    crimeTypes: ["Robbery", "Burglary"],
    suggestedTimeWindow: "18:00 – 22:00 hrs",
    relatedHotspot: "hs-2",
    relatedCases: ["fir-7", "fir-13"],
    createdAt: "2025-04-26",
  },
  {
    id: "pr-4",
    area: "Pitam Pura Market",
    district: "North West Delhi",
    priority: "Medium",
    status: "Pending",
    reason: "Organized pickpocket gang operating 11 AM – 2 PM. Market association complaint filed. Plainclothes deployment requested.",
    recentIncidents: 7,
    crimeTypes: ["Theft", "Pickpocket"],
    suggestedTimeWindow: "10:00 – 15:00 hrs",
    relatedHotspot: "hs-4",
    relatedCases: ["fir-6"],
    createdAt: "2025-04-25",
  },
  {
    id: "pr-5",
    area: "Rohini School Zone",
    district: "North West Delhi",
    priority: "High",
    status: "Under Review",
    reason: "School principal reported suspicious individuals approaching students. Possible narcotics distribution. Discrete investigation and patrol required.",
    recentIncidents: 3,
    crimeTypes: ["Suspicious Activity", "Narcotics"],
    suggestedTimeWindow: "12:30 – 15:30 hrs (school hours)",
    relatedHotspot: "hs-8",
    relatedCases: [],
    createdAt: "2025-04-26",
  },
  {
    id: "pr-6",
    area: "Saket Commercial District",
    district: "South Delhi",
    priority: "Medium",
    status: "Accepted",
    reason: "Fraud and cheating cluster. Property fraud suspects active. Increased visibility deters financial fraud targets.",
    recentIncidents: 6,
    crimeTypes: ["Fraud", "Cheating"],
    suggestedTimeWindow: "10:00 – 18:00 hrs",
    relatedHotspot: "hs-5",
    relatedCases: ["fir-8", "fir-12"],
    createdAt: "2025-04-24",
    assignedOfficer: "SI Anita Sharma",
  },
  {
    id: "pr-7",
    area: "Connaught Place Central",
    district: "Central Delhi",
    priority: "Medium",
    status: "Dismissed",
    reason: "Moderate incident count with decreasing trend. Tourist police presence adequate. Standard patrol sufficient.",
    recentIncidents: 5,
    crimeTypes: ["Theft", "Suspicious Activity"],
    suggestedTimeWindow: "09:00 – 21:00 hrs",
    relatedHotspot: "hs-6",
    relatedCases: ["fir-11"],
    createdAt: "2025-04-23",
  },
  {
    id: "pr-8",
    area: "Mayur Vihar Phase 1",
    district: "East Delhi",
    priority: "Low",
    status: "Pending",
    reason: "Online fraud cluster. Physical patrol has limited impact on cyber crime. Cyber awareness campaign recommended instead.",
    recentIncidents: 4,
    crimeTypes: ["Online Fraud"],
    suggestedTimeWindow: "N/A (Cyber crime)",
    relatedHotspot: "hs-7",
    relatedCases: ["fir-5"],
    createdAt: "2025-04-25",
  },
];

export const seedCrimePatterns: CrimePattern[] = [
  {
    id: "cp-1",
    title: "Serial Residential Burglaries – Rohini Sector 3",
    crimeCategory: "Burglary (457 IPC)",
    area: "Rohini",
    incidentCount: 4,
    timeRange: "April 12–26, 2025",
    relatedFIRs: ["fir-3", "fir-9", "fir-14"],
    status: "Active",
    description: "Four residential burglaries in 15 days with identical modus operandi. Back window forced entry, only cash and jewellery taken, no vandalism. Incidents between 2-5 AM. Forensic evidence compiled suggesting same perpetrator.",
    firstIncident: "2025-04-12",
    lastIncident: "2025-04-26",
    frequency: "Every 4-5 days",
    locations: ["Rohini Sector 3 Block A", "Rohini Sector 3 Block C", "Rohini Sector 4", "Rohini Sector 5"],
    patternNote: "Consistent MO indicates experienced, possibly career criminal. Pattern escalating — frequency increasing.",
  },
  {
    id: "cp-2",
    title: "Organized Pickpocket Operation – Pitam Pura Market",
    crimeCategory: "Theft (379 IPC)",
    area: "Pitam Pura",
    incidentCount: 8,
    timeRange: "April 15–25, 2025",
    relatedFIRs: ["fir-6"],
    status: "Active",
    description: "Organized group of 3-4 individuals operating in Pitam Pura market during busy hours. Classic distraction-theft technique. 8 known victims including mobile phones, wallets. Consistent appearance and timing suggests gang operation.",
    firstIncident: "2025-04-15",
    lastIncident: "2025-04-25",
    frequency: "Daily (11 AM – 2 PM)",
    locations: ["Pitam Pura Market Main Gate", "Electronics Block", "Grocery Section"],
    patternNote: "Coordinated activity consistent with professional theft gang. Requires undercover operation.",
  },
  {
    id: "cp-3",
    title: "Online Vishing Fraud Cluster – East Delhi",
    crimeCategory: "Fraud (420 IPC)",
    area: "Mayur Vihar",
    incidentCount: 5,
    timeRange: "April 18–25, 2025",
    relatedFIRs: ["fir-5"],
    status: "Active",
    description: "Cluster of online voice phishing (vishing) fraud cases targeting residents in Mayur Vihar Phase 1. Fraudsters impersonate bank officials. 5 confirmed victims, total losses exceeding Rs. 3 lakhs. Same script and spoofed number pattern.",
    firstIncident: "2025-04-18",
    lastIncident: "2025-04-25",
    frequency: "Every 1-2 days",
    locations: ["Mayur Vihar Phase 1 Block A–C"],
    patternNote: "Coordinated fraud operation. Cyber cell investigation initiated. Same call script across victims.",
  },
  {
    id: "cp-4",
    title: "Jewellery Store Targeting – West and South West Delhi",
    crimeCategory: "Robbery (392 IPC)",
    area: "Dwarka, Karol Bagh",
    incidentCount: 3,
    timeRange: "April 20–26, 2025",
    relatedFIRs: ["fir-7", "fir-1"],
    status: "Active",
    description: "Two-man team targeting jewellery shops at closing time. High value loot. Motorcycle getaway. Third suspected incident under investigation. Professional operation with advance surveillance.",
    firstIncident: "2025-04-20",
    lastIncident: "2025-04-26",
    frequency: "Every 3 days",
    locations: ["Dwarka Sector 6 Market", "Karol Bagh Gold Market"],
    patternNote: "Suspects partially identified via CCTV. Interstate criminal network suspected. Coordinating with UP STF.",
  },
  {
    id: "cp-5",
    title: "Property Fraud – Fake Documentation Scheme",
    crimeCategory: "Cheating (415 IPC) / Fraud (420 IPC)",
    area: "Saket",
    incidentCount: 4,
    timeRange: "March 15 – April 25, 2025",
    relatedFIRs: ["fir-8", "fir-12"],
    status: "Monitoring",
    description: "Coordinated property fraud using forged documents. Multiple victims sold fake flats and non-existent government jobs. Accused Santosh Pandey absconding. One arrested. Pattern suggests organized network.",
    firstIncident: "2025-03-15",
    lastIncident: "2025-04-25",
    frequency: "Irregular (monthly)",
    locations: ["Saket District Centre", "Lajpat Nagar"],
    patternNote: "Suspect Bhupinder Singh arrested, Santosh Pandey absconding. Lookout notice issued.",
  },
  {
    id: "cp-6",
    title: "Repeated Assault Incidents – Rohini Night Economy",
    crimeCategory: "Assault (323 IPC)",
    area: "Rohini",
    incidentCount: 3,
    timeRange: "April 19–25, 2025",
    relatedFIRs: ["fir-2", "fir-10"],
    status: "Monitoring",
    description: "Three assault incidents near restaurants and bars in Rohini during late evening hours. Possible alcohol-fueled disputes. Pattern timing consistent with late-night establishment closing times.",
    firstIncident: "2025-04-19",
    lastIncident: "2025-04-25",
    frequency: "Weekends and late nights",
    locations: ["Old Bus Stand Area, Rohini", "Sector 7 Restaurant Zone"],
    patternNote: "Time pattern suggests correlation with licensed premises. SHO to coordinate with excise department.",
  },
];

export const seedRecoveredItems: RecoveredItem[] = [
  { id: "ri-1", itemId: "RI-2025-001", name: "Gold Necklace (22K)", category: "Valuables", description: "22 carat gold necklace, weight approx. 18 grams, traditional design. Partially recovered from accused premises.", quantity: 1, estimatedValue: 85000, recoveryDate: "2025-04-22", recoveryLocation: "14A, Naya Bazar, Karol Bagh", linkedFIR: "fir-3", linkedCase: "FIR/0102/2025", recoveryStatus: "In Custody", assignedOfficer: "ASI Vikram Singh", notes: "Recovered during search of accused Ramesh Tiwari's residence. Victim identification pending." },
  { id: "ri-2", itemId: "RI-2025-002", name: "Gold Bangles Set (4 pieces)", category: "Valuables", description: "Set of four gold bangles recovered from abandoned motorcycle near crime scene. Weight ~32 grams.", quantity: 4, estimatedValue: 145000, recoveryDate: "2025-04-24", recoveryLocation: "Dwarka Sector 8 Roadside", linkedFIR: "fir-7", linkedCase: "FIR/0106/2025", recoveryStatus: "In Custody", assignedOfficer: "SI Anita Sharma", notes: "Recovered from abandoned motorcycle possibly used in robbery. DNA and fingerprint analysis in progress." },
  { id: "ri-3", itemId: "RI-2025-003", name: "Diamond Ring", category: "Valuables", description: "Diamond solitaire ring, gold band. Recovered from pawn shop following tip.", quantity: 1, estimatedValue: 120000, recoveryDate: "2025-04-25", recoveryLocation: "Pawn Shop, Lajpat Nagar", linkedFIR: "fir-7", linkedCase: "FIR/0106/2025", recoveryStatus: "In Custody", assignedOfficer: "SI Anita Sharma", notes: "Pawn shop owner cooperated. Shop operator's statement recorded." },
  { id: "ri-4", itemId: "RI-2025-004", name: "Samsung Galaxy S24 Ultra", category: "Electronics", description: "Samsung Galaxy S24 Ultra 512GB, Black. IMEI: 352XXXXXXX. Stolen during burglary.", quantity: 1, estimatedValue: 134999, recoveryDate: "2025-04-25", recoveryLocation: "Second-hand market, Palika Bazar", linkedFIR: "fir-9", linkedCase: "FIR/0108/2025", recoveryStatus: "Returned", assignedOfficer: "Insp. Meera Joshi", notes: "Recovered from second-hand dealer. Victim identified device via IMEI. Returned to owner." },
  { id: "ri-5", itemId: "RI-2025-005", name: "Apple MacBook Pro 14-inch", category: "Electronics", description: "MacBook Pro M3 chip, serial: C02XXXXXXX. Shop stock theft.", quantity: 1, estimatedValue: 179000, recoveryDate: "2025-04-26", recoveryLocation: "Railway Parcel Office, Old Delhi", linkedFIR: "fir-9", linkedCase: "FIR/0108/2025", recoveryStatus: "In Custody", assignedOfficer: "Insp. Meera Joshi", notes: "Package intercepted before dispatch to buyer. Suspect identified via courier records." },
  { id: "ri-6", itemId: "RI-2025-006", name: "Gold Chain (18K)", category: "Valuables", description: "18K gold chain, approx. 12 grams, snatched from victim near metro station.", quantity: 1, estimatedValue: 45000, recoveryDate: "2025-04-26", recoveryLocation: "Suspect on bail: Dwarka Sector 9", linkedFIR: "fir-13", linkedCase: "FIR/0112/2025", recoveryStatus: "In Custody", assignedOfficer: "ASI Vikram Singh", notes: "Recovered when accused taken into custody. Chain found in suspect's room." },
  { id: "ri-7", itemId: "RI-2025-007", name: "Cash – Indian Currency", category: "Currency", description: "Rs. 25,000 in cash partially recovered from fraudster's account via court order.", quantity: 1, estimatedValue: 25000, recoveryDate: "2025-04-24", recoveryLocation: "Bank – Court Order Freeze", linkedFIR: "fir-5", linkedCase: "FIR/0104/2025", recoveryStatus: "In Custody", assignedOfficer: "SI Arjun Mehta", notes: "Partial recovery from frozen bank account. Rs. 60,000 still untraced. Cyber cell pursuing." },
  { id: "ri-8", itemId: "RI-2025-008", name: "Hero Splendor Motorcycle", category: "Vehicles", description: "Hero Splendor Plus, Red, Reg. DL-5S-1234. Reported stolen from Karol Bagh market.", quantity: 1, estimatedValue: 65000, recoveryDate: "2025-04-23", recoveryLocation: "Outer Ring Road, Near Tikri Border", linkedFIR: "fir-1", linkedCase: "FIR/0100/2025", recoveryStatus: "Returned", assignedOfficer: "Insp. Rajesh Kumar", notes: "Motorcycle found abandoned near border. Returned to complainant Amit Verma after documentation." },
  { id: "ri-9", itemId: "RI-2025-009", name: "Laptop – Dell Inspiron 15", category: "Electronics", description: "Dell Inspiron 15 laptop, Silver, serial no: 5CGXXXXXXX. Stolen from café.", quantity: 1, estimatedValue: 62000, recoveryDate: "2025-04-27", recoveryLocation: "Under investigation", linkedFIR: "fir-11", linkedCase: "FIR/0110/2025", recoveryStatus: "In Custody", assignedOfficer: "Insp. Rajesh Kumar", notes: "Suspect identified from CCTV. Device not yet recovered but search warrant applied." },
  { id: "ri-10", itemId: "RI-2025-010", name: "Fake Property Documents", category: "Documents", description: "Forged sale deeds and registration certificates for three properties.", quantity: 12, estimatedValue: 0, recoveryDate: "2025-04-22", recoveryLocation: "Accused premises, Saket", linkedFIR: "fir-8", linkedCase: "FIR/0107/2025", recoveryStatus: "In Custody", assignedOfficer: "ASI Vikram Singh", notes: "Recovered during property fraud accused arrest. Documents sent to Registrar for verification." },
  { id: "ri-11", itemId: "RI-2025-011", name: "Samsung Galaxy A54", category: "Electronics", description: "Samsung Galaxy A54 5G, Blue, IMEI: 35XXXXXXXXX. Stolen in pickpocket incident.", quantity: 1, estimatedValue: 28000, recoveryDate: "2025-04-25", recoveryLocation: "Pitam Pura, hawker area", linkedFIR: "fir-6", linkedCase: "FIR/0105/2025", recoveryStatus: "Returned", assignedOfficer: "Insp. Meera Joshi", notes: "Identified via IMEI trace. Purchased by unknowing second buyer. Phone returned to victim." },
  { id: "ri-12", itemId: "RI-2025-012", name: "Silver Jewelry Set", category: "Valuables", description: "Silver necklace, earrings and bracelet set. Recovered from burglary scene investigation.", quantity: 1, estimatedValue: 12000, recoveryDate: "2025-04-24", recoveryLocation: "Evidence locker, Rohini PS", linkedFIR: "fir-14", linkedCase: "FIR/0113/2025", recoveryStatus: "In Custody", assignedOfficer: "Insp. Meera Joshi", notes: "Found hidden in garden by forensic team. Owner details pending verification." },
];

// ── Store context ───────────────────────────────────────────────────────────

interface StoreCtx {
  pcr: PCRCall[];
  fir: FIR[];
  efir: EFIR[];
  accused: Accused[];
  property: Property[];
  emails: EmailRecord[];
  hotspots: HotspotArea[];
  patrolRecommendations: PatrolRecommendation[];
  crimePatterns: CrimePattern[];
  recoveredItems: RecoveredItem[];
  convertPCRtoFIR: (pcrId: string) => string;
  updatePCRStatus: (id: string, status: Status) => void;
  updateFIRStatus: (id: string, status: FIRStatus) => void;
  linkAccusedToFIR: (firId: string, accusedId: string) => void;
  updateEFIR: (id: string, status: EFIRStatus) => void;
  convertEFIRtoFIR: (efirId: string) => string;
  updateEmailStatus: (id: string, status: EmailRecord["status"]) => void;
  updatePatrolStatus: (id: string, status: PatrolStatus, officer?: string, time?: string) => void;
  updateRecoveryStatus: (id: string, status: RecoveryStatus) => void;
  updatePatternStatus: (id: string, status: PatternStatus) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [pcr, setPcr] = useState<PCRCall[]>(seedPCR);
  const [fir, setFir] = useState<FIR[]>(seedFIR);
  const [efir, setEfir] = useState<EFIR[]>(seedEFIR);
  const [accused, setAccused] = useState<Accused[]>(seedAccused);
  const [property] = useState<Property[]>(seedProperty);
  const [emails, setEmails] = useState<EmailRecord[]>(seedEmails);
  const [hotspots] = useState<HotspotArea[]>(seedHotspots);
  const [patrolRecommendations, setPatrolRecommendations] = useState<PatrolRecommendation[]>(seedPatrolRecommendations);
  const [crimePatterns, setCrimePatterns] = useState<CrimePattern[]>(seedCrimePatterns);
  const [recoveredItems, setRecoveredItems] = useState<RecoveredItem[]>(seedRecoveredItems);

  const convertPCRtoFIR = (pcrId: string) => {
    const call = pcr.find((p) => p.id === pcrId)!;
    const newId = `fir-${fir.length + 1}-${Date.now()}`;
    const newFIR: FIR = {
      id: newId,
      firNumber: `FIR/${String(200 + fir.length).padStart(4, "0")}/2025`,
      station: stations[Math.floor(Math.random() * stations.length)],
      date: new Date().toISOString().slice(0, 10),
      crimeType: call.callType,
      status: "Open",
      io: call.officer,
      complainant: call.callerName,
      description: `Auto-generated from PCR ${call.ddNumber}: ${call.description}`,
      accusedIds: [],
      sourcePCR: pcrId,
      severity: "Medium",
    };
    setFir((p) => [newFIR, ...p]);
    setPcr((p) => p.map((c) => (c.id === pcrId ? { ...c, status: "Closed", convertedToFIR: newId } : c)));
    return newId;
  };

  const updatePCRStatus = (id: string, status: Status) =>
    setPcr((p) => p.map((c) => (c.id === id ? { ...c, status } : c)));

  const updateFIRStatus = (id: string, status: FIRStatus) =>
    setFir((p) => p.map((c) => (c.id === id ? { ...c, status } : c)));

  const linkAccusedToFIR = (firId: string, accusedId: string) => {
    setFir((p) => p.map((f) => f.id === firId && !f.accusedIds.includes(accusedId) ? { ...f, accusedIds: [...f.accusedIds, accusedId] } : f));
    setAccused((p) => p.map((a) => a.id === accusedId && !a.linkedFIRs.includes(firId) ? { ...a, linkedFIRs: [...a.linkedFIRs, firId] } : a));
  };

  const updateEFIR = (id: string, status: EFIRStatus) =>
    setEfir((p) => p.map((e) => (e.id === id ? { ...e, status } : e)));

  const convertEFIRtoFIR = (efirId: string) => {
    const e = efir.find((x) => x.id === efirId)!;
    const newId = `fir-${fir.length + 1}-${Date.now()}`;
    const newFIR: FIR = {
      id: newId,
      firNumber: `FIR/${String(300 + fir.length).padStart(4, "0")}/2025`,
      station: stations[Math.floor(Math.random() * stations.length)],
      date: new Date().toISOString().slice(0, 10),
      crimeType: e.incidentType,
      status: "Open",
      io: officers[Math.floor(Math.random() * officers.length)],
      complainant: e.complainant,
      description: `Converted from e-FIR ${e.efirNumber}: ${e.description}`,
      accusedIds: [],
      sourceEFIR: efirId,
      severity: "Medium",
    };
    setFir((p) => [newFIR, ...p]);
    setEfir((p) => p.map((x) => (x.id === efirId ? { ...x, status: "Converted", convertedFIR: newId } : x)));
    return newId;
  };

  const updateEmailStatus = (id: string, status: EmailRecord["status"]) =>
    setEmails((p) => p.map((e) => (e.id === id ? { ...e, status } : e)));

  const updatePatrolStatus = (id: string, status: PatrolStatus, officer?: string, time?: string) =>
    setPatrolRecommendations((p) => p.map((r) => r.id === id ? { ...r, status, ...(officer ? { assignedOfficer: officer } : {}), ...(time ? { scheduledTime: time } : {}) } : r));

  const updateRecoveryStatus = (id: string, status: RecoveryStatus) =>
    setRecoveredItems((p) => p.map((i) => (i.id === id ? { ...i, recoveryStatus: status } : i)));

  const updatePatternStatus = (id: string, status: PatternStatus) =>
    setCrimePatterns((p) => p.map((c) => (c.id === id ? { ...c, status } : c)));

  return (
    <Ctx.Provider value={{ pcr, fir, efir, accused, property, emails, hotspots, patrolRecommendations, crimePatterns, recoveredItems, convertPCRtoFIR, updatePCRStatus, updateFIRStatus, linkAccusedToFIR, updateEFIR, convertEFIRtoFIR, updateEmailStatus, updatePatrolStatus, updateRecoveryStatus, updatePatternStatus }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}
