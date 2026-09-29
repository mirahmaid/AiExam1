import { useRef } from "react";

export default function OtpInput({ length, value, onChange, disabled, hasError }) {
  const inputsRef = useRef([]);

  function handleChange(index, digit) {
    // الارقام نسخ
    const cleanDigit = digit.replace(/[^0-9]/g, "");
    if (!cleanDigit) return;
    const newValue = [...value];
    newValue[index] = cleanDigit.slice(-1);
    onChange(newValue);
    // انتقل تلقائياً للخانة التالية
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace") {
      if (value[index]) {
        // امسح الخانة الحالية
        const newValue = [...value];
        newValue[index] = "";
        onChange(newValue);
      } else if (index > 0) {
        // ارجع للخانة يلي قبلها وامسحها
        const newValue = [...value];
        newValue[index - 1] = "";
        onChange(newValue);
        inputsRef.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!pasted) return;
    const newValue = [...value];
    for (let i = 0; i < length; i++) {
      newValue[i] = pasted[i] || "";
    }
    onChange(newValue);
    const nextEmptyIndex = newValue.findIndex((d) => !d);
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputsRef.current[focusIndex]?.focus();
  }

  return (
    <div className="flex justify-center gap-7" dir="ltr">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`h-14 w-14 rounded-2xl border text-center text-xl font-bold outline-none transition-colors ${
            hasError
              ? "border-red-400 text-red-600"
              : "border-slate-200 text-[#002C5A] focus:border-[#002C5A]"
          } disabled:opacity-50`}
        />
      ))}
    </div>
  );
}
