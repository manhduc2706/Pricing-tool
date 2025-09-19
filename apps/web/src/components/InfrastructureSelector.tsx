import IconCloud from "./ui/iconCloud";
import IconOnPremise from "./ui/iconOnPremise";

interface InfrastructureSelectorProps {
  selectedInfrastructure: "Cloud" | "OnPremise" | null;
  onChange: (selected: "Cloud" | "OnPremise") => void;
}

export default function InfrastructureSelector({
  selectedInfrastructure,
  onChange,
}: InfrastructureSelectorProps) {
  const options = [
    {
      id: "Cloud",
      label: "Cloud",
      description: "Triển khai trên Cloud",
      icon: <IconCloud />,
    },
    {
      id: "OnPremise",
      label: "On-Premise",
      description: "Triển khai tại chỗ (Server riêng)",
      icon: <IconOnPremise />,
    },
  ];

  return (
    <div>
      <h3 className="block font-medium text-gray-700 mb-4">
        Chọn loại hạ tầng:
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {options.map((option) => (
          <label
            key={option.id}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition
              ${
                selectedInfrastructure === option.id
                  ? "border-[#0F4FAF] bg-blue-50"
                  : "border-gray-300"
              }
            `}
            onClick={() => onChange(option.id as "Cloud" | "OnPremise")}
          >
            <input
              type="radio"
              name="infrastructure"
              value={option.id}
              checked={selectedInfrastructure === option.id}
              onChange={() => onChange(option.id as "Cloud" | "OnPremise")}
              className="hidden"
            />
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center">
                <div
                  className={`w-4 h-4 flex items-center justify-center rounded-full border-2 ${
                    selectedInfrastructure === option.id
                      ? "border-[#0F4FAF]"
                      : "border-gray-300"
                  }`}
                >
                  {selectedInfrastructure === option.id && (
                    <div className="w-2 h-2 rounded-full bg-[#0F4FAF]"></div>
                  )}
                </div>
              </div>
              {option.icon}
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-500">
                  {option.description}
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
