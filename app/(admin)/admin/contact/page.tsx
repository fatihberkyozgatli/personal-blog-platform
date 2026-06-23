import { ContactSettingsForm } from "@/components/admin/ContactSettingsForm";
import { PageHeader } from "@/components/admin/ui";
import { getContactSettings } from "@/lib/data/contact";

export default async function AdminContactPage() {
  const settings = await getContactSettings();

  return (
    <>
      <PageHeader
        title="Contact"
        description="Manage the public contact details and social links."
      />
      <ContactSettingsForm settings={settings} />
    </>
  );
}
