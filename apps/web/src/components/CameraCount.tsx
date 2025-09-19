import { useState, useEffect } from "react";
import IconLocation from "./ui/iconLocation";

interface CameraCountInputProps {
  value?: number | null; // Thêm prop value
  onValueChange?: (value: number | null) => void; // Callback để truyền giá trị ra ngoài
}

export default function CameraCountInput({
  value,
  onValueChange,
}: CameraCountInputProps) {
  const [internalValue, setInternalValue] = useState<number | null>(
    value ?? null
  );

  // Sync với prop value khi thay đổi từ bên ngoài
  useEffect(() => {
    setInternalValue(value ?? null);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === "") {
      setInternalValue(null);
      onValueChange?.(null);
      return;
    }

    const numericValue = parseInt(inputValue, 10);
    if (!isNaN(numericValue) && numericValue >= 1) {
      setInternalValue(numericValue);
      onValueChange?.(numericValue);
    }
  };

  const handleBlur = () => {
    if (internalValue === null || internalValue < 1) {
      setInternalValue(null);
      onValueChange?.(null);
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
