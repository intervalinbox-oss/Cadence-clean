"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/app/lib/firebase";

export function useDecisionWizard() {
  const [step, setStep] = useState<number>(0);
  const totalSteps = 5;

  function next() {
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit(data: any) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const summary = data.title || (data.options && data.options[0] && (data.options[0].title || data.options[0].text)) || "";

    const docRef = await addDoc(collection(db, "decisions"), {
      uid: user.uid,
      createdAt: serverTimestamp(),
      data,
      summary,
      recommendation: data.recommendation || null,
    });

    return docRef.id;
  }

  return { step, totalSteps, next, back, submit } as const;
}
