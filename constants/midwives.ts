export type ConsultationTypeOption = {
  key: "chat" | "audio" | "video";
  label: string;
  duration: string;
};

export type Midwife = {
  id: string;
  name: string;
  role: string;
  yearsExperience: number;
  consultationsCount: number;
  satisfactionRate: number;
  specialty: string;
  about: string;
  expertise: string[];
  languages: string[];
  education: string;
  consultationTypes: ConsultationTypeOption[];
  availability: {
    label: string;
    status: "today" | "tomorrow";
  };
  tags: string[];
};

export const midwives: Midwife[] = [
  {
    id: "abena-mensah",
    name: "Abena Mensah",
    role: "Certified Midwife",
    yearsExperience: 12,
    consultationsCount: 210,
    satisfactionRate: 98,
    specialty: "Prenatal Care & Birth Support",
    about:
      "Abena specializes in prenatal care and birth support, helping mothers feel confident and informed through every stage of pregnancy.",
    expertise: ["Prenatal Care", "Birth Support", "High-Risk Pregnancy"],
    languages: ["English", "Twi", "Ga"],
    education: "BSc Midwifery - University of Ghana",
    consultationTypes: [
      { key: "chat", label: "Chat Consultation", duration: "30 min" },
      { key: "audio", label: "Audio Call", duration: "45 min" },
    ],
    availability: { label: "10:00 AM Today", status: "today" },
    tags: ["Available Today", "Pregnancy"],
  },
  {
    id: "akosua-boateng",
    name: "Akosua Boateng",
    role: "Certified Midwife",
    yearsExperience: 8,
    consultationsCount: 142,
    satisfactionRate: 97,
    specialty: "Prenatal Care & Lactation",
    about:
      "Akosua specializes in postnatal care and lactation, helping mothers navigate the early weeks of parenthood with confidence and calm.",
    expertise: ["Postnatal Care", "Lactation Support", "Newborn Health"],
    languages: ["English", "Fante", "Ga"],
    education: "BSc Midwifery - University of Cape Coast",
    consultationTypes: [
      { key: "chat", label: "Chat Consultation", duration: "30 min" },
      { key: "audio", label: "Audio Call", duration: "45 min" },
    ],
    availability: { label: "9:00 AM Tomorrow", status: "tomorrow" },
    tags: ["Pregnancy"],
  },
  {
    id: "efua-asante",
    name: "Efua Asante",
    role: "Certified Midwife",
    yearsExperience: 15,
    consultationsCount: 320,
    satisfactionRate: 99,
    specialty: "Menstrual & Reproductive Health",
    about:
      "Efua specializes in menstrual and reproductive health, supporting women through cycle concerns, symptoms and long-term reproductive wellbeing.",
    expertise: ["Menstrual Health", "Reproductive Health", "Teen Health"],
    languages: ["English", "Twi"],
    education: "BSc Midwifery - KNUST",
    consultationTypes: [
      { key: "chat", label: "Chat Consultation", duration: "30 min" },
      { key: "audio", label: "Audio Call", duration: "45 min" },
    ],
    availability: { label: "2:00 PM Today", status: "today" },
    tags: ["Available Today", "Menstrual Health"],
  },
];
