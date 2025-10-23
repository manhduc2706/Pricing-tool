import IconLocation from "./ui/iconLocation";

interface SiteLocationCheckboxProps {
    selectedSiteLocation?: "TP Hà Nội" | "TP Hồ Chí Minh" | "Tỉnh khác" | null;
    onChange: (selected: "TP Hà Nội" | "TP Hồ Chí Minh" | "Tỉnh khác") => void;
    onValueChange: (selected: "TP Hà Nội" | "TP Hồ Chí Minh" | "Tỉnh khác", errors: string[]) => void;
}

export default function SiteLocationCheckbox({
    selectedSiteLocation,
    onChange,
    onValueChange,
}: SiteLocationCheckboxProps) {
    const options = [
        {
            id: "TP Hà Nội",
            label: "TP Hà Nội",
            description: "Địa điểm triển khai tại TP Hà Nội",
            icon: <IconLocation />,
        },
        {
            id: "TP Hồ Chí Minh",
            label: "TP Hồ Chí Minh",
            description: "Địa điểm triển khai tại TP Hồ Chí Minh",
            icon: <IconLocation />,
        },
        {
            id: "Tỉnh khác",
            label: "Tỉnh khác",
            description: "Địa điểm triển khai tại tỉnh khác",
            icon: <IconLocation />,
        },
    ];

    const handleSelect = (optionId: "TP Hà Nội" | "TP Hồ Chí Minh" | "Tỉnh khác") => {
        onChange(optionId),
            onValueChange(optionId, [])
    }

    return (
        <div className="space-y-3">
            <h3 className="block font-medium text-gray-700 mb-4">
                Chọn địa điểm cần triển khai:
            </h3>
            <div className="flex space-x-3">
                {options.map((option) => {
                    const isChecked = selectedSiteLocation === option.id;
                    return (
                        <label
                            key={option.id}
                            className={`flex items-center space-x-3 cursor-pointer w-[320px] h-[50px] border rounded-md p-4 transition
              ${isChecked ? "border-[#0F4FAF] bg-blue-50" : "border-gray-300"}`}
                        >
                            <input
                                type="radio"
                                name="siteLocation"
                                checked={isChecked}
                                onChange={() => handleSelect(option.id as "TP Hà Nội" | "TP Hồ Chí Minh" | "Tỉnh khác")}
                                className="hidden"
                            />
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center">
                                    <div
                                        className={`w-4 h-4 flex items-center justify-center rounded-full border-2 ${isChecked ? "border-[#0F4FAF]" : "border-gray-300"
                                            }`}
                                    >
                                        {isChecked && (
                                            <div className="w-2 h-2 rounded-full bg-[#0F4FAF]"></div>
                                        )}
                                    </div>
                                </div>
                                <span className="icon">{option.icon}</span>
                                <div>
                                    <h3 className="font-medium">{option.label}</h3>
                                    {/* <p className="text-sm text-gray-500">{option.description}</p> */}
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
