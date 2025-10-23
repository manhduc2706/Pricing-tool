import { ZodType } from "zod";
import { useState, useEffect } from "react";
import IconUser from "./ui/iconUser";
import { WarningBox } from "./ui/WarningBox";

interface UserInputProps {
  schema: ZodType<any>;
  infrastructure: "Cloud" | "OnPremise" | null;
  fixedUserLimits?: (number | string)[] | null;
  onValueChange?: (value: number | null, error: string | null) => void;
}

export default function UserInput({
  infrastructure,
  fixedUserLimits = null,
  schema,
  onValueChange,
}: UserInputProps) {
  const [selected, setSelected] = useState<string>(""); // string bound to select
  const [showWarningOnPremise, setShowWarningOnPremise] = useState(false);
  const [showWarningOnCloud, setShowWarningOnCloud] = useState(false);

  // keep local states in sync if parent provides value differently later
  useEffect(() => {
    // nothing to sync from parent in this version; left for future use
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const raw = e.target.value;
    setSelected(raw);

    // special OnPremise >5000
    if (raw === ">5000") {
      setShowWarningOnPremise(true);
      setShowWarningOnCloud(false);
      return;
    } else {
      setShowWarningOnPremise(false);
    }

    // special Cloud >2000
    if (raw === ">2000") {
      setShowWarningOnCloud(true);
      setShowWarningOnPremise(false);
      return;
    } else {
      setShowWarningOnCloud(false);
    }

    // parse numeric option
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {

      // validate numeric with zod
      const result = schema.safeParse(parsed);
      const error = result.success ? null : result.error.issues[0].message;

      onValueChange?.(parsed, error ?? null);
      return;
    }

    // fallback: invalid selection (shouldn't happen)
    onValueChange?.(null, "Giá trị không hợp lệ");
  };

  return (
    <div>
      <label
        htmlFor="user-input"
        className="flex items-center gap-2 font-medium text-gray-700 mb-4"
      >
        <IconUser />
        Số lượng user sử dụng hệ thống:
      </label>

      {fixedUserLimits && (infrastructure === "Cloud" || infrastructure === "OnPremise") ? (
        <select
          id="user-input"
          value={selected}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-64 mb-4"
        >
          <option value="" disabled>
            -- Chọn số lượng user --
          </option>
          {fixedUserLimits.map((limit) => (
            <option key={String(limit)} value={String(limit)}>
              {String(limit) === ">5000" ? ">5000 users" : String(limit) === ">2000" ? ">2000 users" : `${limit} users`}
            </option>
          ))}
        </select>
      ) : null}

      {showWarningOnPremise && (
        <WarningBox>
          Nếu số lượng user vượt quá <span className="font-semibold">5000</span> — Vui lòng liên hệ quản trị viên.
        </WarningBox>
      )}


      {showWarningOnCloud && (
        <WarningBox>
          Nếu số lượng user vượt quá <span className="font-semibold">2000</span> — Vui lòng liên hệ quản trị viên.
        </WarningBox>
      )}
    </div>
  );
}
