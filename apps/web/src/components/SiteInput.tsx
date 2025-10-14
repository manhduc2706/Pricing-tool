import { useEffect, useState } from "react";
import { ZodType } from "zod";
import IconLocation from "./ui/iconLocation";

interface SiteInputProps {
    value?: number | null;
    schema?: ZodType<any>;
    className?: string;
    onValueChange?: (value: number | null, error: string | null) => void;
}

export default function SiteInput({
    value, schema, className, onValueChange
}: SiteInputProps) {
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
                htmlFor="install-location"
                className="flex items-center gap-2 font-medium text-gray-700 mb-2"
            >
                <IconLocation />
                Số site cần triển khai:
            </label>
            <input
                id="install-location"
                inputMode="numeric"
                type="text"
                // pattern="[1-9]*"
                placeholder="Nhập số điểm"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`border px-2 py-1 rounded w-64 ${className ?? ""}`}
            />
        </div>
    );
}