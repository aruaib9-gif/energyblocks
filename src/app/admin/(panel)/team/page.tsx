import { AddAdminForm, ChangePasswordForm } from "@/components/admin/team-forms";
import { PageHeader, Panel } from "@/components/admin/ui";
import { formatDate } from "@/components/shop/status-timeline";
import { adminListAdmins } from "@/lib/shop/admin";

export const metadata = { title: "Team & security" };

export default async function TeamPage() {
  const team = await adminListAdmins();
  return (
    <>
      <PageHeader title="Team & security" sub="Everyone listed here can manage products, orders and payments." />
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_360px]">
        <Panel title={`Admins (${team.length})`}>
          <ul className="divide-y divide-line text-sm">
            {team.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <span>
                  <span className="block font-medium">{a.name}</span>
                  <span className="text-muted">{a.email}</span>
                </span>
                <span className="text-xs text-muted">Added {formatDate(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <div className="space-y-6">
          <Panel title="Add an admin">
            <AddAdminForm />
          </Panel>
          <Panel title="Change your password">
            <ChangePasswordForm />
          </Panel>
        </div>
      </div>
    </>
  );
}
