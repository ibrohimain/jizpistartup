export interface TeamMember {
  fullName: string;
  phone: string;
  occupation: string;
}

export interface StartupApplication {
  id?: string;
  applicantName: string;
  residenceRegion: string;
  residenceCityDistrict: string;
  applicantOccupation: string;
  teamName: string;
  teamSize: number;
  members: TeamMember[];
  projectSummary: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string; // ISO string
}
