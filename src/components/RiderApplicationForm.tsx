import { useEffect, useState, type ReactNode } from "react";
import { useMutation } from "convex/react";
import { CheckCircle2 } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useToast } from "../lib/toast";
import { t } from "../lib/prefs";
import { Button, Card, Field, Input, Modal, Select, Textarea } from "./ui";

/*
  Rider application. Every submission is saved by riderApplications.apply and
  appears in the admin panel (Riders → applications), where it is reviewed,
  invited to interview and hired. Used in the popup on the home page and on /join.
*/

export function RiderApplicationForm({ onSubmitted }: { onSubmitted: () => void }) {
  const apply = useMutation(api.riderApplications.apply);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: "",
    phone: "",
    email: "",
    area: "",
    vehicle: "bike",
    shift: "full_time",
    hasLicense: "yes",
    note: "",
  });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const vehicleLabel = f.vehicle === "bike" ? "Motorcycle" : f.vehicle === "bicycle" ? "Bicycle" : "No vehicle";
          const shiftLabel = f.shift === "full_time" ? "Full-time" : "Part-time";
          const combinedNote = [f.note ? f.note.trim() : null, `Vehicle: ${vehicleLabel}`, `Shift: ${shiftLabel}`].filter(Boolean).join(" | ");
          await apply({
            name: f.name,
            phone: f.phone,
            email: f.email.trim() ? f.email.trim() : undefined,
            area: f.area,
            hasBike: f.vehicle === "bike" || f.vehicle === "bicycle",
            hasLicense: f.hasLicense === "yes",
            note: combinedNote.slice(0, 300),
          });
          onSubmitted();
        } catch (err) {
          toast.error(err);
        } finally {
          setBusy(false);
        }
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <Field label={t("Full name")}>{(id) => <Input id={id} value={f.name} onChange={set("name")} required maxLength={80} />}</Field>
      <Field label={t("Phone number")}>
        {(id) => <Input id={id} type="tel" placeholder="01XXXXXXXXX" value={f.phone} onChange={set("phone")} required />}
      </Field>
      <Field label={t("Email (optional)")} hint={t("Optional — notifications can also be sent via phone / WhatsApp.")}>
        {(id) => <Input id={id} type="email" value={f.email} onChange={set("email")} maxLength={120} />}
      </Field>
      <Field label={t("Preferred area")} hint={t("Dhaka (Mirpur, Uttara, Dhanmondi, etc.) or Savar")}>
        {(id) => <Input id={id} value={f.area} onChange={set("area")} required maxLength={80} placeholder={t("e.g. Dhaka or Savar")} />}
      </Field>
      <Field label={t("Vehicle type")}>
        {(id) => (
          <Select id={id} value={f.vehicle} onChange={set("vehicle")}>
            <option value="bike">{t("Motorcycle")}</option>
            <option value="bicycle">{t("Bicycle")}</option>
            <option value="none">{t("None")}</option>
          </Select>
        )}
      </Field>
      <Field label={t("Work shift")}>
        {(id) => (
          <Select id={id} value={f.shift} onChange={set("shift")}>
            <option value="full_time">{t("Full-time")}</option>
            <option value="part_time">{t("Part-time")}</option>
          </Select>
        )}
      </Field>
      <Field label={t("Driving licence?")} className="sm:col-span-2">
        {(id) => (
          <Select id={id} value={f.hasLicense} onChange={set("hasLicense")}>
            <option value="yes">{t("Yes (for motorcycle)")}</option>
            <option value="no">{t("No / Bicycle Rider")}</option>
          </Select>
        )}
      </Field>
      <Field label={t("Anything else? (optional)")} className="sm:col-span-2">
        {(id) => <Textarea id={id} value={f.note} onChange={set("note")} maxLength={200} placeholder={t("NID status, previous delivery experience, etc.")} />}
      </Field>
      <Button type="submit" size="lg" loading={busy} className="sm:col-span-2">
        {t("Send application")}
      </Button>
    </form>
  );
}

/** Shown after a successful application, in the popup and on the /join page. */
export function ApplicationSent({ action }: { action: ReactNode }) {
  return (
    <Card className="p-6">
      <CheckCircle2 className="size-10 text-emerald-500" />
      <p className="mt-4 font-semibold">{t("Our team will review your application.")}</p>
      <p className="mt-1 text-sm text-ink-2">{t("If you are selected, we will contact you for an interview by phone or WhatsApp. Your rider account is created after you are hired.")}</p>
      <div className="mt-6">{action}</div>
    </Card>
  );
}

/** "Apply now" popup on the home page. */
export function RiderApplyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (open) setDone(false);
  }, [open]);
  return (
    <Modal open={open} onClose={onClose} title={done ? t("Application sent") : t("Apply as a rider")} wide>
      {done ? (
        <ApplicationSent action={<Button onClick={onClose}>{t("Close")}</Button>} />
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-ink-2">{t("Join the GoEx team in Savar & Dhaka.")}</p>
          <RiderApplicationForm onSubmitted={() => setDone(true)} />
        </div>
      )}
    </Modal>
  );
}
