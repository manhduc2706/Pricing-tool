import { useState } from "react";
import { SelectedFeature } from "../types";
import { ZodType } from "zod";

interface FeatureInputProps {
  schema?: ZodType<any>; // Optional, dùng để validate số lượng
  onValueChange?: (selectedFeatures: SelectedFeature[], errors: string[]) => void;
}

export default function FeatureInput({ schema, onValueChange }: FeatureInputProps) {
  // Hardcode các tính năng ngay trong component
  const featureOptions = [
    "Cháy, khói",
    "Nhận diện người lạ",
    "Nhận diện hành vi",
    "Đếm người hoặc vật thể",
    "Xâm nhập vùng cấm",
    "Đọc biển số xe",
  ];

  const [featureData, setFeatureData] = useState<
    { feature: string; pointCount: number; error: string | null }[]
  >(
    featureOptions.map((feature) => ({
      feature,
      pointCount: 0,
      error: null,
    }))
  );

  // Xử lý thay đổi dữ liệu
  const handleFeatureChange = (feature: string, rawValue: string) => {
    let pointCount = 0;
    let error: string | null = null;

    // Nếu để trống thì coi như 0
    if (rawValue === "") {
      pointCount = 0;
    } else if (!/^\d+$/.test(rawValue)) {
      // Không phải số
      error = "Chỉ được nhập số";
    } else {
      const value = parseInt(rawValue, 10);
      if (isNaN(value) || value < 1) {
        error = "Giá trị phải ≥ 1";
      } else {
        pointCount = value;
        if (schema && !schema.safeParse(value).success) {
          error = "Giá trị không hợp lệ";
        }
      }
    }

    const updatedFeatureData = featureData.map((item) =>
      item.feature === feature ? { ...item, pointCount, error } : item
    );

    setFeatureData(updatedFeatureData);

    const selected = updatedFeatureData
      .filter((item) => item.pointCount > 0)
      .map((item) => ({
        feature: item.feature,
        pointCount: item.pointCount,
      }));

    const errors = updatedFeatureData
      .map((item) => item.error)
      .filter((e): e is string => e !== null);

    onValueChange?.(selected, errors);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {featureData.map((item, index) => {
        const isChecked = item.pointCount > 0;

        return (
          <div
            key={index}
            className={`flex flex-col border rounded-md p-4 transition
              ${isChecked ? "border-[#0F4FAF] bg-blue-50" : "border-gray-300"}
            `}
          >
            {/* Checkbox + tên tính năng */}
            <label className="font-medium text-gray-900 flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) =>
                  handleFeatureChange(item.feature, e.target.checked ? "1" : "")
                }
                className="hidden"
              />
              <div
                className={`w-4 h-4 flex items-center justify-center rounded-sm border-2 transition-colors duration-200 ${isChecked
                  ? "border-[#0F4FAF] bg-[#0F4FAF] text-white"
                  : "border-gray-300 bg-white"
                  }`}
              >
                {isChecked && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span>{item.feature}</span>
            </label>

            {/* Floating label input số lượng */}
            <div className="relative mt-3 w-full">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={item.pointCount > 0 ? item.pointCount : ""}
                onChange={(e) => handleFeatureChange(item.feature, e.target.value)}
                placeholder=" " 
                className={`peer block w-full rounded-md border px-3 pt-5 pb-2 appearance-none focus:outline-none focus:ring-1 ${item.error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#0F4FAF]"
                  }`}
              />

              {/* Floating label*/}
              <label
                className={`absolute left-3 bg-white px-1 text-gray-500 text-sm transition-all duration-200 pointer-events-none
      peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
      peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#0F4FAF]
      ${item.pointCount > 0 ? "-top-2 text-xs text-[#0F4FAF]" : ""}
    `}
              >
                Nhập số vị trí
              </label>

              {item.error && (
                <span className="text-red-500 text-sm mt-1 block">{item.error}</span>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
