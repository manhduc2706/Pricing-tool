import { useState } from "react";
import LocationInput from "./LocationInput";
import { SelectedFeature } from "../types";

interface FeatureInputProps {
  features: string[];
  onValueChange?: (selectedFeatures: SelectedFeature[]) => void;
}

export default function FeatureInput({
  features,
  onValueChange,
}: FeatureInputProps) {
  const [featureData, setFeatureData] = useState<
    { feature: string; pointCount: number }[]
  >(
    features.map((feature) => ({
      feature,
      pointCount: 0,
    }))
  );

  const handleFeatureChange = (feature: string, pointCount: number) => {
    const updatedFeatureData = featureData.map((item) =>
      item.feature === feature ? { ...item, pointCount } : item
    );
    setFeatureData(updatedFeatureData);
    onValueChange?.(updatedFeatureData.filter((item) => item.pointCount > 0));
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {featureData.map((item, index) => {
          const isChecked = item.pointCount > 0;

          return (
            <div
              key={index}
              className={`flex flex-row justify-between items-center border rounded-md p-4 transition
    ${isChecked ? "border-[#0F4FAF] bg-blue-50" : "border-gray-300"}
  `}
            >
              {/* Ô tính năng (trái) */}
              <div className="flex items-center">
                <label className="font-medium text-gray-900 flex items-center space-x-3 cursor-pointer">
                  {/* Checkbox custom */}
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) =>
                      handleFeatureChange(
                        item.feature,
                        e.target.checked ? 1 : 0
                      )
                    }
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 flex items-center justify-center rounded-sm border-2 transition-colors duration-200 ${
                      isChecked
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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span>{item.feature}</span>
                </label>
              </div>

              {/* Ô vị trí (phải) */}
              <div className="flex items-center">
                <LocationInput
                  value={item.pointCount === 0 ? null : item.pointCount}
                  onValueChange={(value) => {
                    handleFeatureChange(item.feature, value ?? 0);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
