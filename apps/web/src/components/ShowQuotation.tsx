import { useEffect, useState } from "react";
import { SelectedFeature, ShowQuotationProps } from "../types";
import axios from "axios";
import { DownloadExcelButton } from "./DownloadExcel";

export default function ShowQuotation({ quotation }: ShowQuotationProps) {
  const [selectedScreenId, setSelectedScreenId] = useState(
    quotation.devices.find(d => d.deviceType === "Màn hình")?.itemDetailId ?? ""
  );

  const [selectedSwitchId, setSelectedSwitchId] = useState(
    quotation.devices.find(d => d.deviceType === "Switch PoE")?.itemDetailId ?? ""
  );

  const [updatedQuotation, setUpdatedQuotation] = useState(quotation);
  const [loading, setLoading] = useState(false);
  const [excelResult, setExcelResult] = useState<any>(null);


  useEffect(() => {
    setUpdatedQuotation(quotation);

    const currentScreen = quotation.devices.find(d => d.deviceType === "Màn hình");
    if (currentScreen) setSelectedScreenId(currentScreen.itemDetailId);
    console.log("Quotation prop changed:", quotation);
  }, [quotation]);

  useEffect(() => {
    setUpdatedQuotation(quotation);

    const currentSwitch = quotation.devices.find(d => d.deviceType === "Switch PoE");
    if (currentSwitch) setSelectedSwitchId(currentSwitch.itemDetailId);
    console.log("Quotation prop changed:", quotation);
  }, [quotation]);

  useEffect(() => {
    console.log("updatedQuotation changed:", updatedQuotation);
  }, [updatedQuotation]);


  //Hàm xử lý chọn màn hình và gọi API
  const handleScreenChange = async (screenId: string) => {
    setSelectedScreenId(screenId);
    setLoading(true);

    try {
      const res = await axios.patch(`/api/quotations/${quotation._id}/update`, {
        type: "device",
        updatedItemId: screenId,
      });

      if (res.data.data) {
        setUpdatedQuotation(res.data.data);
      }
      setExcelResult(quotation)
    } catch (error) {
      console.error("Lỗi khi cập nhật màn hình:", error);
      alert("Không thể cập nhật màn hình. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  //Hàm xử lý chọn switch
  const handleSwitchChange = async (switchId: string) => {
    setSelectedSwitchId(switchId);
    setLoading(true);

    try {
      const res = await axios.patch(`/api/quotations/${quotation._id}/update`, {
        type: "device",
        updatedItemId: switchId,
      });

      if (res.data.data) {
        setUpdatedQuotation(res.data.data);
      }
      setExcelResult(quotation)
    } catch (error) {
      console.error("Lỗi khi cập nhật switch:", error);
      alert("Không thể cập nhật switch. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const totalLicenseAmount = updatedQuotation.licenses.reduce((sum, l) => {
    const qty = Number(l.quantity) || 0;
    const price = Number(l.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  type MergedItem = {
    _id?: string;
    name: string;
    itemType?: string;
    deviceType?: string;
    vatRate?: number;
    selectedFeatures?: SelectedFeature[];
    quantity: number;
    description: string;
    unitPrice: number | string;
    totalAmount: number | string;
    itemDetailId?: string;
    sourceType:
    | "device"
    | "license"
    | "costServer"
    | "custom-1"
    | "custom-2"
    | "custom-3"
    | "custom-cloud"
    | "custom-onprem";
  };


  const mergedItems: MergedItem[] = [
    ...updatedQuotation.devices.map((item) => ({
      ...item,
      sourceType: "device" as const,
    })),
    ...updatedQuotation.licenses.map((item) => ({
      ...item,
      sourceType: "license" as const,
    })),
    ...updatedQuotation.costServers
      .filter((item) => item.unitPrice > 0)
      .map((item) => ({
        ...item,
        sourceType: "costServer" as const,
      })),

    // Thêm dòng hardcode theo điều kiện
    ...([
      {
        name: "Chi phí cài đặt phần mềm",
        description: `- Cài đặt và cấu hình hệ thống phần mềm.\n- Thiết lập máy chủ hoặc môi trường triển khai.\n- Kiểm tra kết nối và phân quyền người dùng.\n- Đảm bảo hệ thống hoạt động ổn định trước khi bàn giao.`,
        quantity: 1,
        unitPrice: updatedQuotation.softwareInstallationCost,
        totalAmount: updatedQuotation.softwareInstallationCost,
        sourceType: "custom-1" as const,
      },
      {
        name: "Chi phí đào tạo",
        description: `- Hướng dẫn vận hành và sử dụng hệ thống.\n- Đào tạo nhập liệu, tra cứu và xuất báo cáo.\n- Tổ chức đào tạo trực tuyến hoặc trực tiếp theo yêu cầu khách hàng.`,
        quantity: 1,
        unitPrice: updatedQuotation.trainingCost,
        totalAmount: updatedQuotation.trainingCost,
        sourceType: "custom-2" as const,
      },
      {
        name: "Chi phí vật tư phụ và nhân công thi công lắp đặt",
        description: `- Bao gồm dây cáp, đầu nối, ống luồn, phụ kiện cố định thiết bị.\n- Nhân công thực hiện lắp đặt thiết bị tại hiện trường.\n- Chi phí phụ thuộc vào địa điểm và khối lượng công việc cụ thể.`,
        quantity: 1,
        unitPrice: updatedQuotation.materialCosts,
        totalAmount: updatedQuotation.materialCosts,
        sourceType: "custom-3" as const,
      }
    ]),


    ...(updatedQuotation.deploymentType === "Cloud"
      ? [
        {
          name: "(Miễn phí) Phí bảo trì và nâng cấp hàng năm",
          description: `- Bảo trì hệ thống phần mềm: cập nhật các bản vá lỗi, nâng cấp các phiên bản về firmware mới nếu có để đảm bảo hệ thống hoạt động ổn định.\n- Hỗ trợ kỹ thuật từ xa trong các trường hợp xảy ra các vấn đề về vận hành hoặc kỹ thuật của hệ thống.\n- Hỗ trợ đào tạo, hướng dẫn lại việc sử dụng phần mềm cho nhân sự mới tiếp nhận hệ thống của phía khách hàng.\n- Hỗ trợ backup hoặc khôi phục dữ liệu nếu có yêu cầu.`,
          quantity: 1,
          unitPrice: "",
          totalAmount: "",
          sourceType: "custom-cloud" as const,
        },
      ]
      : updatedQuotation.deploymentType === "OnPremise"
        ? [
          {
            name: "(Tùy chọn) Phí bảo trì và nâng cấp hằng năm (tính từ năm thứ 2)",
            description: `- Bảo trì hệ thống phần mềm: cập nhật các bản vá lỗi, nâng cấp các phiên bản về firmware mới nếu có để đảm bảo hệ thống hoạt động ổn định.\n- Hỗ trợ kỹ thuật từ xa trong các trường hợp xảy ra các vấn đề về vận hành hoặc kỹ thuật của hệ thống.\n- Hỗ trợ đào tạo, hướng dẫn lại việc sử dụng phần mềm cho nhân sự mới tiếp nhận hệ thống của phía khách hàng.\n- Hỗ trợ backup hoặc khôi phục dữ liệu nếu có yêu cầu.`,
            quantity: 1,
            unitPrice: (totalLicenseAmount * 20) / 100,
            totalAmount: (totalLicenseAmount * 20) / 100,
            sourceType: "custom-onprem" as const,
          },
        ]
        : []),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-2">
      <table className="min-w-full divide-y divide-gray-300 rounded-md  mb-6 font-medium text-gray-700">
        <thead>
          <tr className="bg-gray-100 text-black text-center">
            <th className="px-3 py-3 divide-y divide-gray-300">STT</th>
            <th className="px-3 py-3 divide-y divide-gray-300">Hạng mục</th>
            <th className="px-3 py-3 divide-y divide-gray-300">Số lượng</th>
            <th className="px-3 py-3 divide-y divide-gray-300">
              Đơn giá (VND)
            </th>
            <th className="px-3 py-3 divide-y divide-gray-300">
              Thành tiền (VND)
            </th>
            <th className="px-3 py-3 divide-y divide-gray-300">
              Thông số kỹ thuật
            </th>
          </tr>
        </thead>
        <tbody className="text-center">
          {mergedItems.map((item, index) => {
            const isLastRow = index === mergedItems.length - 1;
            const borderClass = isLastRow ? "" : "border-b border-gray-300";

            return (
              <tr key={index} className="bg-gray-50 hover:bg-gray-100">
                <td className={`px-3 py-6 ${borderClass}`}>{index + 1}</td>
                <td className={`px-3 py-6 text-left ${borderClass}`}>
                  {item.sourceType === "device" && item.deviceType === "Màn hình" ? (
                    <select
                      value={selectedScreenId}
                      onChange={(e) => handleScreenChange(e.target.value)}
                      className="border rounded px-2 py-1"
                      disabled={loading}
                    >
                      {updatedQuotation.screenOptions.map((screen) => (
                        <option key={screen._id} value={screen._id}>
                          {screen.itemDetailId?.name ?? ""}
                        </option>
                      ))}
                    </select>
                  ) : item.sourceType === "device" && item.deviceType === "Switch PoE" ? (
                    <select
                      value={selectedSwitchId}
                      onChange={(e) => handleSwitchChange(e.target.value)}
                      className="border rounded px-2 py-1"
                      disabled={loading}
                    >
                      {updatedQuotation.switchOptions.map((sw) => (
                        <option key={sw._id} value={sw._id}>
                          {sw.itemDetailId?.name ?? ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ whiteSpace: "pre-line" }}>{item.name}</div>
                  )}

                </td>
                <td className={`px-3 py-6 ${borderClass}`}>
                  {item.quantity.toLocaleString("vi-VN")}
                </td>
                <td className={`px-3 py-6 ${borderClass}`}>
                  {typeof item.unitPrice === "number" ? item.unitPrice.toLocaleString("vi-VN") : item.unitPrice}
                </td>
                <td className={`px-3 py-6 ${borderClass}`}>
                  {item.unitPrice !== "" && typeof item.unitPrice === "number"
                    ? (
                      Number(item.unitPrice) * Number(item.quantity)
                    ).toLocaleString("vi-VN")
                    : item.unitPrice}{" "}
                </td>
                <td className={`px-3 py-6 text-left ${borderClass}`}>
                  <div style={{ whiteSpace: "pre-line" }}>
                    {item.description}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <hr className="my-6 border-gray-300" />

      {/* Tổng kết */}

      <table className="w-full divide-y divide-gray-300 rounded-md mb-4">
        <tbody>
          <tr>
            <td className="px-3 py-2 text-lg font-semibold text-gray-900 divide-y divide-gray-300">
              Chi phí triển khai:
            </td>
            <td className="px-3 py-2 divide-y divide-gray-300 text-right text-lg font-semibold text-gray-900">
              {updatedQuotation.summary.deploymentCost.toLocaleString("vi-VN")} VND
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 text-lg font-semibold text-gray-900 divide-y divide-gray-300">
              Tạm tính:
            </td>
            <td className="px-3 py-2 divide-y divide-gray-300 text-right text-lg font-semibold text-gray-900">
              {updatedQuotation.summary.temporaryTotal.toLocaleString("vi-VN")}{" "}
              VND
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 text-lg font-semibold text-gray-900 divide-y divide-gray-300">
              VAT (8%):
            </td>
            <td className="px-3 py-2 divide-y divide-gray-300 text-right text-lg font-semibold text-gray-900">
              {updatedQuotation.summary.vatPrices.toLocaleString("vi-VN")}{" "}
              VND
            </td>
          </tr>

          <tr>
            <td colSpan={2}>
              <hr className="border-t border-gray-300 my-2" />
            </td>
          </tr>

          <tr className="bg-blue-100 font-bold">
            <td className="px-3 py-2 divide-y divide-gray-300 text-[#0F4FAF] text-lg font-semibold">
              Tổng cộng:
            </td>
            <td className="px-3 py-2 divide-y divide-gray-300 text-right text-[#0F4FAF] text-lg font-semibold">
              {updatedQuotation.summary.grandTotal.toLocaleString("vi-VN")} VND
            </td>
          </tr>

        </tbody>
      </table>
      <div className="flex justify-end">
        <DownloadExcelButton _id={quotation._id.toString()} />
      </div>
    </div>
  );
}
