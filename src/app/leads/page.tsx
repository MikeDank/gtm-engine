import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContactBadge } from "@/components/contact-badge";
import { getLeads } from "./actions";

export default async function LeadsPage() {
  const leads = await getLeads();

  if (leads.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          No leads yet. Convert signals to create leads.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          Score and qualify leads based on collected signals.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <Link
                  href={`/leads/${lead.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {lead.name}
                </Link>
              </TableCell>
              <TableCell>{lead.role || "—"}</TableCell>
              <TableCell>{lead.company || "—"}</TableCell>
              <TableCell>
                <ContactBadge
                  hasEmail={!!lead.email}
                  hasLinkedin={!!lead.linkedinUrl}
                />
              </TableCell>
              <TableCell>{lead.createdAt.toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
