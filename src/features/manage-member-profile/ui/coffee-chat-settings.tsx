"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MemberResearchProfile } from "@/entities/member";
import { Button, Dialog, Toggle } from "@/shared/ui";

export type CoffeeContact = { contactType: "EMAIL" | "KAKAO_TALK"; contactValue: string };
export type CoffeeChatSettingsProps = { research: MemberResearchProfile; onSaveContact?: (contact: CoffeeContact | null) => Promise<void>; mockContacts?: CoffeeContact[]; };

export function CoffeeChatSettings({ research, onSaveContact, mockContacts }: CoffeeChatSettingsProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState<CoffeeContact[]>(mockContacts ?? (research.coffeeChat ? [research.coffeeChat] : [{ contactType: "KAKAO_TALK", contactValue: "" }]));
  const [published, setPublished] = useState(research.coffeeChatPublic);
  const [dirty, setDirty] = useState(false), [pending, setPending] = useState(false), [error, setError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const busy = useRef(false);
  async function save(remove = false) {
    if (busy.current) return;
    const contact = contacts[0];
    if (!remove && (!contact?.contactValue.trim() || (contact.contactType === "EMAIL" ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.contactValue) : !/^https:\/\/open\.kakao\.com\/[^\s]+$/.test(contact.contactValue)))) { setError("이메일 또는 카카오 오픈채팅 주소를 확인해주세요."); return; }
    busy.current = true; setPending(true); setError("");
    try {
      if (onSaveContact) await onSaveContact(remove ? null : contact);
      else {
        const response = await fetch("/api/member/coffee-chat", { method: remove ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, ...(!remove ? { body: JSON.stringify(contact) } : {}) });
        const body = await response.json();
        if (response.status === 401) router.push("/login");
        if (!response.ok) throw new Error(body.message || "연락처를 저장하지 못했어요.");
        router.refresh();
      }
      setPublished(!remove); setDirty(false); setConfirmRemove(false);
      if (remove) setContacts([{ contactType: "KAKAO_TALK", contactValue: "" }]);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "연락처를 저장하지 못했어요."); }
    finally { busy.current = false; setPending(false); }
  }
  return <section className="min-w-0 flex-1 rounded-xl bg-bg-default px-5 py-3 shadow-[0_2px_4px_var(--color-opacity-black-10)]">
    <div className="flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-text-subtle">커피챗 공개</h2><Toggle aria-label="커피챗 공개" checked={published} disabled={pending} onChange={(event) => { if (!event.target.checked) setConfirmRemove(true); else void save(); }}>{null}</Toggle></div>
    <form className="mt-[30px] flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); void save(); }}>
      {contacts.map((contact, index) => <div key={index} className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-border-primary px-3">
        <input aria-label={`커피챗 연락처 ${index + 1}`} type="text" value={contact.contactValue} placeholder="이메일 또는 오픈채팅 URL" disabled={pending} className="min-w-0 flex-1 text-sm text-text-primary outline-none" onChange={(event) => {
          const value = event.target.value; setContacts((items) => items.map((item, i) => i === index ? { contactValue: value, contactType: value.startsWith("http") ? "KAKAO_TALK" : "EMAIL" } : item)); setDirty(true);
        }} />
        {(published || mockContacts) ? <button type="button" aria-label={`연락처 ${index + 1} 삭제`} disabled={pending} className="shrink-0 text-text-primary" onClick={() => { if (mockContacts && index > 0) setContacts((items) => items.filter((_, i) => i !== index)); else if (published) setConfirmRemove(true); else setContacts([{ contactType: "KAKAO_TALK", contactValue: "" }]); }}>×</button> : null}
      </div>)}
      {mockContacts ? <button type="button" aria-label="연락처 추가" className="h-[42px] cursor-pointer rounded-lg bg-button-tertiary text-xl text-text-inverse" onClick={() => setContacts((items) => [...items, { contactType: "EMAIL", contactValue: "" }])}>+</button> : null}
      {dirty ? <Button type="submit" size="sm" isLoading={pending}>저장</Button> : null}
      {error ? <p role="alert" className="text-xs text-text-error">{error}</p> : null}
    </form>
    <Dialog isOpen={confirmRemove} onClose={() => { if (!pending) setConfirmRemove(false); }} title="커피챗 공개를 중단할까요?" variant="confirmation">
      <p className="my-3 text-center text-sm text-text-subtle">공개된 연락처가 삭제돼요.<br />다시 공개하려면 연락처를 입력해주세요.</p>
      <div className="flex gap-3"><Button autoFocus className="flex-1" variant="tertiary" size="sm" disabled={pending} onClick={() => setConfirmRemove(false)}>취소</Button><Button className="flex-1" size="sm" isLoading={pending} onClick={() => void save(true)}>공개 중단</Button></div>
    </Dialog>
  </section>;
}
