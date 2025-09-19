import { ServiceOption } from "../types";
import IconCheck from "./ui/icon";
import IconB from "./ui/iconB";
import IconC from "./ui/iconC";

interface ServiceCheckboxProps {
  option: ServiceOption;
  isChecked: boolean;
  onChange: (optionId: string) => void; // Chỉ cần truyền `optionId` khi chọn
}

export default function ServiceCheckbox({
  option,
  isChecked,
  onChange,
}: ServiceCheckboxProps) {
  const handleChange = () => {
    onChange(option._id); // Gọi hàm `onChange` với `optionId`
  };

  const iconMap: Record<string, JSX.Element> = {
    attendance: <IconCheck />, // Chấm công
    accessControl: <IconB />, // Kiểm soát ra vào
    securityAlert: <IconC />, // Cảnh báo an ninh
    // ... thêm các loại khác
  };

  return (
    <label
      className={`flex items-center space-x-3 cursor-pointer w-[320px] h-[50px] border rounded-md p-4 transition
        ${isChecked ? "border-[#0F4FAF] bg-blue-50" : "border-gray-300"}
      `}
    >
      <input
        type="radio" 
        name="serviceOption"
        checked={isChecked}
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center">
          <div
            className={`w-4 h-4  flex items-center justify-center rounded-full border-2 ${
              isChecked ? "border-[#0F4FAF]" : "border-gray-300"
            }`}
          >
            {isChecked && (
              <div className="w-2 h-2 rounded-full bg-[#0F4FAF]"></div>
            )}
          </div>
        </div>
        <span className="icon">
          {iconMap[option.iconKey] || iconMap["default"]}
        </span>
        <div>
          <h3 className="font-medium">{option.name}</h3>
          {/* <p className="text-sm text-gray-500">{option.description}</p> */}
        </div>
      </div>
    </label>
  );
}
