"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/shared/Button";
import { updateContactSettings } from "@/lib/actions/contact-settings";
import type { ActionState } from "@/lib/actions/admin";
import type { ContactSettings } from "@/lib/validations/contact-settings";

const initial: ActionState = { ok: false, message: "" };
const field =
  "w-full rounded-md border border-gold/30 bg-parchment px-4 py-2.5 text-base text-ink outline-none focus:border-maroon sm:text-sm";

export function ContactSettingsForm({ settings }: { settings: ContactSettings }) {
  const [state, action, pending] = useActionState(updateContactSettings, initial);
  const [email, setEmail] = useState(settings.email);
  const [location, setLocation] = useState(settings.location);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(settings.youtubeUrl ?? "");

  return (
    <form action={action} className="max-w-2xl space-y-6">
      <div className="rounded-xl2 border border-gold/20 bg-parchment p-4">
        <h2 className="mb-3 font-display text-lg text-ink">Contact Details</h2>

        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />

        <label htmlFor="location" className="mb-1 mt-4 block text-sm font-medium text-ink">
          Location
        </label>
        <input
          id="location"
          name="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={field}
        />
      </div>

      <div className="rounded-xl2 border border-gold/20 bg-parchment p-4">
        <h2 className="mb-3 font-display text-lg text-ink">Social Links</h2>

        <label htmlFor="instagramUrl" className="mb-1 block text-sm font-medium text-ink">
          Instagram URL
        </label>
        <input
          id="instagramUrl"
          name="instagramUrl"
          type="url"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://instagram.com/..."
          className={field}
        />

        <label htmlFor="youtubeUrl" className="mb-1 mt-4 block text-sm font-medium text-ink">
          YouTube URL
        </label>
        <input
          id="youtubeUrl"
          name="youtubeUrl"
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://youtube.com/..."
          className={field}
        />
      </div>

      {state.message && (
        <p role="status" className={state.ok ? "text-sm text-emerald" : "text-sm text-clay"}>
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Contact Settings"}
      </Button>
    </form>
  );
}
