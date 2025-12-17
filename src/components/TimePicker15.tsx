// src/components/TimePicker15.tsx
import React from "react";

const QUARTERS = ["00", "15", "30", "45"] as const;
type QuarterMinute = (typeof QUARTERS)[number];

type Props = {
  value: string;            // format "HH:MM"
  onChange: (value: string) => void;
  label?: string;
  id?: string;
};

export default function TimePicker15({ value, onChange, label, id }: Props) {
  // On découpe la valeur entrante
  const [rawHour = "", rawMinute = ""] = value.split(":");

  // Normalisation de l'heure : 00–23, 2 chiffres
  let hourNum = parseInt(rawHour, 10);
  if (Number.isNaN(hourNum) || hourNum < 0 || hourNum > 23) {
    hourNum = 8; // valeur par défaut raisonnable
  }
  const hour = hourNum.toString().padStart(2, "0");

  // Normalisation des minutes : forcer sur un des quarts
  let minute: QuarterMinute =
    QUARTERS.includes(rawMinute as QuarterMinute)
      ? (rawMinute as QuarterMinute)
      : "00";

  function handleHourChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newHour = e.target.value; // déjà "HH"
    onChange(`${newHour}:${minute}`);
  }

  function handleMinuteChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newMinute = e.target.value as QuarterMinute;
    minute = newMinute;
    onChange(`${hour}:${newMinute}`);
  }

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1">
          {label}
        </label>
      )}

      <div className="flex gap-2">
        {/* Heures */}
        <select
          id={id}
          value={hour}
          onChange={handleHourChange}
          className="border border-gray-300 rounded-md p-2"
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const h = i.toString().padStart(2, "0");
            return (
              <option key={h} value={h}>
                {h}
              </option>
            );
          })}
        </select>

        {/* Minutes limitées */}
        <select
          value={minute}
          onChange={handleMinuteChange}
          className="border border-gray-300 rounded-md p-2"
        >
          {QUARTERS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
