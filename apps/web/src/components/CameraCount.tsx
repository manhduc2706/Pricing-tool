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
  const [internalValue, setInternalValue] = useState<number | null>(
    value ?? null
  );

  // Đồng bộ với prop value
  useEffect(() => {
    setInternalValue(value ?? null);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Nếu rỗng
    if (inputValue === "") {
      setInternalValue(null);
      onValueChange?.(null, "Giá trị không được để trống");
      return;
    }

    const numericValue = parseInt(inputValue, 10);

    // Nếu không phải số
    if (isNaN(numericValue)) {
      setInternalValue(null);
      onValueChange?.(null, "Giá trị phải là số");
      return;
    }

    // Nếu < 1
    if (numericValue < 1) {
      setInternalValue(numericValue);
      onValueChange?.(numericValue, "Giá trị phải >= 1");
      return;
    }

    // Nếu có schema thì validate
    if (schema) {
      const result = schema.safeParse(numericValue);
      if (!result.success) {
        setInternalValue(numericValue);
        onValueChange?.(numericValue, result.error.issues[0].message);
        return;
      }
    }

    // Hợp lệ
    setInternalValue(numericValue);
    onValueChange?.(numericValue, null);
  };

  const handleBlur = () => {
    if (internalValue === null || internalValue < 1) {
      setInternalValue(null);
      onValueChange?.(null, "Giá trị không được < 1");
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
        value={internalValue ?? ""}
        onChange={handleChange}
        onBlur={handleBlur}
        className="border px-2 py-1 rounded w-64 mb-4"
      />
    </div>
  );
}
