import { useMemo, useState } from "react";
import { CheckCircle2, Copy, MessageCircle, PhoneCall } from "lucide-react";
import { CONTACT } from "../lib/contact";
import { t } from "../lib/prefs";
import { Button, Field, Input, Modal, Select, Textarea } from "./ui";

/*
  Milk is GOEX's own product, so it is ordered directly: the order goes to the
  GOEX WhatsApp. Every other delivery is booked by merchants after logging in.
*/

const QUANTITIES = ["½ litre", "1 litre", "2 litres", "3 litres", "5 litres"];
const SCHEDULES = ["Every day", "One time only"];
const SLOTS = ["Morning", "Evening"];
const AREAS = ["Savar", "Dhaka"];
const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;

export function MilkOrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState(QUANTITIES[1]);
  const [schedule, setSchedule] = useState(SCHEDULES[0]);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [start, setStart] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [copied, setCopied] = useState(false);

  const missing = {
    name: !name.trim(),
    phone: !PHONE_RE.test(phone.replace(/[\s-]/g, "")),
    address: !address.trim(),
  };
  const invalid = Object.values(missing).some(Boolean);
  const bad = (k: keyof typeof missing) => showErrors && missing[k];
  const red = (k: keyof typeof missing) => (bad(k) ? "!border-red-500 ring-2 ring-red-500/20" : undefined);

  const message = useMemo(
    () =>
      [
        "*GOEX Order — Pure farm cow milk*",
        `Name: ${name.trim()}`,
        `Phone: ${phone.trim()}`,
        `Quantity: ${qty}`,
        `How often: ${schedule}`,
        `Delivery time: ${slot}`,
        start && `Start date: ${start}`,
        `Area: ${area}`,
        `Address: ${address.trim()}`,
        note.trim() && `Note: ${note.trim()}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [name, phone, qty, schedule, slot, start, area, address, note],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("Order pure farm cow milk")}
      wide
      footer={
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <a href={`tel:${CONTACT.phone}`} className="w-full">
            <Button type="button" variant="outline" size="lg" icon={PhoneCall} className="w-full justify-center font-bold">
              {t("Call")} {CONTACT.phoneDisplay}
            </Button>
          </a>
          <a
            href={`${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
            onClick={(e) => {
              if (invalid) {
                e.preventDefault();
                setShowErrors(true);
              }
            }}
          >
            <Button type="button" size="lg" icon={MessageCircle} className="w-full justify-center !bg-emerald-600 font-bold text-white hover:!bg-emerald-700">
              {t("Send order on WhatsApp")}
            </Button>
          </a>
        </div>
      }
    >
      <div className="space-y-5">
        <p className="rounded-xl bg-page px-4 py-3 text-sm text-ink-2 ring-1 ring-line">
          {t("Pure cow milk collected straight from trusted farms and delivered to your home every day.")}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Your name")} hint={bad("name") ? t("Required") : undefined}>
            {(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={red("name")} />}
          </Field>
          <Field label={t("Your phone")} hint={bad("phone") ? t("Enter a valid 11-digit mobile number") : undefined}>
            {(id) => (
              <Input id={id} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" autoComplete="tel" className={red("phone")} />
            )}
          </Field>
          <Field label={t("Quantity")}>
            {(id) => (
              <Select id={id} value={qty} onChange={(e) => setQty(e.target.value)}>
                {QUANTITIES.map((o) => (
                  <option key={o} value={o}>{t(o)}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t("How often")}>
            {(id) => (
              <Select id={id} value={schedule} onChange={(e) => setSchedule(e.target.value)}>
                {SCHEDULES.map((o) => (
                  <option key={o} value={o}>{t(o)}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t("Delivery time")}>
            {(id) => (
              <Select id={id} value={slot} onChange={(e) => setSlot(e.target.value)}>
                {SLOTS.map((o) => (
                  <option key={o} value={o}>{t(o)}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={`${t("Start date")} (${t("optional")})`}>
            {(id) => <Input id={id} type="date" value={start} onChange={(e) => setStart(e.target.value)} />}
          </Field>
          <Field label={t("Area")}>
            {(id) => (
              <Select id={id} value={area} onChange={(e) => setArea(e.target.value)}>
                {AREAS.map((o) => (
                  <option key={o} value={o}>{t(o)}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t("Delivery address")} hint={bad("address") ? t("Required") : undefined}>
            {(id) => (
              <Input id={id} value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("House/Road, Area, Landmark")} autoComplete="street-address" className={red("address")} />
            )}
          </Field>
          <Field label={`${t("Note")} (${t("optional")})`} className="sm:col-span-2">
            {(id) => <Textarea id={id} value={note} onChange={(e) => setNote(e.target.value)} rows={2} />}
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-ink-3">
          <span>{t("Your order goes to our WhatsApp; we confirm the price and time with you.")}</span>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(message);
                setCopied(true);
                setTimeout(() => setCopied(false), 2200);
              } catch {
                /* clipboard can be blocked */
              }
            }}
            className="inline-flex shrink-0 items-center gap-1 font-semibold text-ink-2 hover:text-brand"
          >
            {copied ? <CheckCircle2 className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            {copied ? t("Copied!") : t("Copy order")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
