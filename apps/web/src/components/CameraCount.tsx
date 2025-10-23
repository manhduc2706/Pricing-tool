import { useState, useEffect } from "react";
import IconLocation from "./ui/iconLocation";
import { ZodType } from "zod";

interface CameraCountInputProps {
  schema?: ZodType<any>;
  value?: number | null;
  onValueChange?: (value: number | null, error: string | null) => void;
}

export default function CameraCountInput({
  schema,
  value,
  onValueChange,
}: CameraCountInputProps) {
  const [inputValue, setInputValue] = useState(value?.toString() ?? "");

  useEffect(() => {
    setInputValue(value?.toString() ?? "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Cho phép xóa rỗng
    if (raw === "") {
      setInputValue("");
      onValueChange?.(null, "Giá trị không hợp lệ");
      return;
    }

    // Chỉ cho phép nhập số nguyên >= 1
    if (/^[1-9]\d*$/.test(raw)) {
      setInputValue(raw);

      const num = Number(raw);

      if (num < 1) {
        onValueChange?.(null, "Giá trị phải ≥ 1");
        return;
      }

      // Nếu có schema thì validate
      if (schema) {
        const result = schema.safeParse(num);
        if (!result.success) {
          onValueChange?.(num, result.error.issues[0].message);
          return;
        }
      }
      // Giá trị hợp lệ
      onValueChange?.(num, null);
    }
  };

  const handleBlur = () => {
    if (inputValue === "" || Number(inputValue) < 1) {
      setInputValue("");
      onValueChange?.(null, "Giá trị không hợp lệ");
    }
  };


  return (
    <div>
      <label
        htmlFor="install-cameraCount"
        className="flex items-center gap-2 font-medium text-gray-700 mb-4"
      >
        <IconLocation />
        Số lượng camera:
      </label>
      <input
        id="install-cameraCount"
        type="number"
        min={1}
        placeholder="Nhập số lượng"
        value={inputValue ?? ""}
        onChange={handleChange}
        onBlur={handleBlur}
        className="border px-2 py-1 rounded w-64 mb-4"
      />
    </div>
  );
}
