import { createContext, useContext, useState, ReactNode } from "react";

export type Status = "Pending" | "In Progress" | "Closed" | "Resolved";
export type EFIRStatus = "Submitted" | "Under Review" | "Approved" | "Rejected" | "Converted";
export type FIRStatus = "Open" | "Under Investigation" | "Charge-sheeted" | "Closed";
export type ArrestStatus = "Arrested" | "On Bail" | "Absconding" | "Released";

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

const stations = ["Connaught Place", "Karol Bagh", "Saket", "Dwarka", "Rohini"];
const officers = ["Insp. Rajesh Kumar", "SI Anita Sharma", "ASI Vikram Singh", "Insp. Meera Joshi", "SI Arjun Mehta"];
const callTypes = ["Theft", "Assault", "Domestic Dispute", "Traffic Accident", "Noise Complaint", "Burglary", "Missing Person", "Suspicious Activity"];
const crimeTypes = ["Theft (379)", "Burglary (457)", "Assault (323)", "Fraud (420)", "Kidnapping (363)", "Robbery (392)", "Cheating (415)"];

const seedPCR: PCRCall[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `pcr-${i + 1}`,
  ddNumber: `DD-${2024000 + i}`,
  callTime: `2025-04-${String(20 + (i % 5)).padStart(2, "0")} ${String(8 + (i % 12)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
  callerName: ["Amit Verma","Priya Singh","Rahul Gupta","Sunita Devi","Mohan Lal","Kavita Rao","Sandeep Yadav","Neha Kapoor","Rakesh Jain","Geeta Sharma"][i % 10],
  phone: `+91 9${String(800000000 + i * 13577).slice(0, 9)}`,
  callType: callTypes[i % callTypes.length],
  officer: officers[i % officers.length],
  status: (["Pending","In Progress","Closed"] as Status[])[i % 3],
  location: ["Block C, Sector 12","Main Market","Metro Station","Park Avenue","Old Bus Stand"][i % 5],
  description: "Caller reported suspicious activity in the vicinity. Patrol unit dispatched.",
}));

const seedFIR: FIR[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `fir-${i + 1}`,
  firNumber: `FIR/${String(100 + i).padStart(4, "0")}/2025`,
  station: stations[i % stations.length],
  date: `2025-04-${String(10 + (i % 15)).padStart(2, "0")}`,
  crimeType: crimeTypes[i % crimeTypes.length],
  status: (["Open","Under Investigation","Charge-sheeted","Closed"] as FIRStatus[])[i % 4],
  io: officers[i % officers.length],
  complainant: ["Amit Verma","Priya Singh","Rahul Gupta","Sunita Devi","Mohan Lal"][i % 5],
  description: "FIR registered after preliminary enquiry. Investigation underway.",
  accusedIds: i < 10 ? [`acc-${(i % 12) + 1}`] : [],
}));

const seedEFIR: EFIR[] = Array.from({ length: 11 }).map((_, i) => ({
  id: `efir-${i + 1}`,
  efirNumber: `EFIR-${String(5000 + i).padStart(5, "0")}`,
  date: `2025-04-${String(15 + (i % 10)).padStart(2, "0")}`,
  incidentType: callTypes[i % callTypes.length],
  status: (["Submitted","Under Review","Approved","Rejected","Converted"] as EFIRStatus[])[i % 5],
  complainant: ["Vikash Kumar","Sneha Patil","Imran Khan","Lata Iyer","Deepak Bose"][i % 5],
  description: "Online complaint submitted via citizen portal. Awaiting verification.",
}));

const seedAccused: Accused[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `acc-${i + 1}`,
  name: ["Ramesh Tiwari","Suresh Chand","Vinod Kumar","Karan Malhotra","Aslam Sheikh","Jagdish Pal","Naveen Reddy","Bhupinder Singh","Manish Joshi","Anil Mehra","Santosh Pandey","Dilip Bhatia"][i],
  age: 22 + (i * 3) % 35,
  gender: i % 4 === 0 ? "Female" : "Male",
  arrestStatus: (["Arrested","On Bail","Absconding","Released"] as ArrestStatus[])[i % 4],
  address: `${i + 12} Main Road, ${stations[i % stations.length]}`,
  linkedFIRs: [`fir-${(i % 14) + 1}`],
  history: ["Prior offence: Petty theft (2022)","Prior offence: Public nuisance (2023)"].slice(0, (i % 3)),
}));

const seedProperty: Property[] = Array.from({ length: 9 }).map((_, i) => ({
  id: `prop-${i + 1}`,
  name: ["Gold Necklace","iPhone 14 Pro","Cash (INR)","Motorcycle - Splendor","Laptop - Dell","Silver Bracelet","LED TV 43\"","Bicycle","Documents Bundle"][i],
  qty: [1, 1, 1, 1, 1, 2, 1, 1, 1][i],
  value: [85000, 110000, 45000, 65000, 55000, 12000, 28000, 8000, 0][i],
  linkedFIR: `fir-${(i % 14) + 1}`,
  seizureType: (["Stolen","Recovered","Seized","Found"] as Property["seizureType"][])[i % 4],
  date: `2025-04-${String(12 + i).padStart(2, "0")}`,
}));

interface StoreCtx {
  pcr: PCRCall[];
  fir: FIR[];
  efir: EFIR[];
  accused: Accused[];
  property: Property[];
  convertPCRtoFIR: (pcrId: string) => string;
  updatePCRStatus: (id: string, status: Status) => void;
  updateFIRStatus: (id: string, status: FIRStatus) => void;
  linkAccusedToFIR: (firId: string, accusedId: string) => void;
  updateEFIR: (id: string, status: EFIRStatus) => void;
  convertEFIRtoFIR: (efirId: string) => string;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [pcr, setPcr] = useState<PCRCall[]>(seedPCR);
  const [fir, setFir] = useState<FIR[]>(seedFIR);
  const [efir, setEfir] = useState<EFIR[]>(seedEFIR);
  const [accused, setAccused] = useState<Accused[]>(seedAccused);
  const [property] = useState<Property[]>(seedProperty);

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
    setFir((p) =>
      p.map((f) =>
        f.id === firId && !f.accusedIds.includes(accusedId)
          ? { ...f, accusedIds: [...f.accusedIds, accusedId] }
          : f,
      ),
    );
    setAccused((p) =>
      p.map((a) =>
        a.id === accusedId && !a.linkedFIRs.includes(firId)
          ? { ...a, linkedFIRs: [...a.linkedFIRs, firId] }
          : a,
      ),
    );
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
    };
    setFir((p) => [newFIR, ...p]);
    setEfir((p) => p.map((x) => (x.id === efirId ? { ...x, status: "Converted", convertedFIR: newId } : x)));
    return newId;
  };

  return (
    <Ctx.Provider
      value={{ pcr, fir, efir, accused, property, convertPCRtoFIR, updatePCRStatus, updateFIRStatus, linkAccusedToFIR, updateEFIR, convertEFIRtoFIR }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}
