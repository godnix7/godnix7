import ClientExperience from "@/components/ClientExperience";

export default function Home() {
  // Extracting environment variables to pass to the client component
  const envVars = {
    PROJECT_MEDILOCKER_REPO: process.env.PROJECT_MEDILOCKER_REPO || "",
    PROJECT_MEDILOCKER_LIVE: process.env.PROJECT_MEDILOCKER_LIVE || "",
    PROJECT_EVENTBYTE_REPO: process.env.PROJECT_EVENTBYTE_REPO || "",
    PROJECT_EVENTBYTE_LIVE: process.env.PROJECT_EVENTBYTE_LIVE || "",
    PROJECT_LYNXIS_REPO: process.env.PROJECT_LYNXIS_REPO || "",
    PROJECT_LYNXIS_LIVE: process.env.PROJECT_LYNXIS_LIVE || "",
    PROJECT_ALTHEA_REPO: process.env.PROJECT_ALTHEA_REPO || "",
    PROJECT_ALTHEA_LIVE: process.env.PROJECT_ALTHEA_LIVE || "",
    PROJECT_LOCALMUSIC_REPO: process.env.PROJECT_LOCALMUSIC_REPO || "",
    PROJECT_LOCALMUSIC_LIVE: process.env.PROJECT_LOCALMUSIC_LIVE || ""
  };

  return <ClientExperience envVars={envVars} />;
}
