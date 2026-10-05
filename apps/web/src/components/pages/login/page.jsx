import { useState } from "react";
import AuthShell from "../shared/AuthShell";
import LoginForm from "./components/LoginForm";

const CAPTIONS = [
  "اكتب بريدك وشغّل أول مدار",
  "أول مدار اشتغل! كمّل كلمة المرور",
  "جاهز للإقلاع، اضغط انطلق",
  "وصلت! جاري فتح مسارك 🎉",
];

export default function Page() {
  const [stage, setStage] = useState(0);
  return (
    <AuthShell
      stage={stage} captions={CAPTIONS} gauge="جاهزيتك" badge="مرحبًا بعودتك"
      title={["كمّل رحلتك", "نحو معدّلك"]} subtitle="كل ما تعبّي خانة، بتقرب خطوة من هدفك."
    >
      <LoginForm onStage={setStage} />
    </AuthShell>
  );
}