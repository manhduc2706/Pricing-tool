import { ShowQuotationProps } from "../types";

export default function ShowQuotation({ quotation }: ShowQuotationProps) {
  const totalLicenseAmount = quotation.licenses.reduce((sum, l) => {
    const qty = Number(l.quantity) || 0;
    const price = Number(l.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const mergedItems = [
    ...quotation.devices.map((item) => ({
      ...item,
      sourceType: "device",
    })),
    ...quotation.licenses.map((item) => ({
      ...item,
      sourceType: "license",
    })),
    ...quotation.costServers
      .filter((item) => item.unitPrice > 0)
      .map((item) => ({
        ...item,
        sourceType: "costServer",
      })),
    // Thêm dòng hardcode theo điều kiện
    ...(quotation.deploymentType === "Cloud"
      ? [
          {
            name: "(Miễn phí) Phí bảo trì và nâng cấp hàng năm",
            description: `- Bảo trì hệ thống phần mềm: cập nhật các bản vá lỗi, nâng cấp các phiên bản về firmware mới nếu có để đảm bảo hệ thống hoạt động ổn định.\n 
            - Hỗ trợ kỹ thuật từ xa trong các trường hợp xảy ra các vấn đề về vận hành hoặc kỹ thuật của hệ thống.\n
            - Hỗ trợ đào tạo, hướng dẫn lại việc sử dụng phần mềm cho nhân sự mới tiếp nhận hệ thống của phía khách hàng.\n
            - Hỗ trợ backup hoặc khôi phục dữ liệu nếu có yêu cầu.`,
            quantity: 1,
            unitPrice: "",
            totalAmount: "",
            sourceType: "custom-cloud",
          },
        ]
      : quotation.deploymentType === "OnPremise"
      ? [
          {
            name: "(Tùy chọn) Phí bảo trì và nâng cấp hằng năm (tính từ năm thứ 2)",
            description: `- Bảo trì hệ thống phần mềm: cập nhật các bản vá lỗi, nâng cấp các phiên bản về firmware mới nếu có để đảm bảo hệ thống hoạt động ổn định.\n 
            - Hỗ trợ kỹ thuật từ xa trong các trường hợp xảy ra các vấn đề về vận hành hoặc kỹ thuật của hệ thống.\n
            - Hỗ trợ đào tạo, hướng dẫn lại việc sử dụng phần mềm cho nhân sự mới tiếp nhận hệ thống của phía khách hàng.\n
            - Hỗ trợ backup hoặc khôi phục dữ liệu nếu có yêu cầu.`,
            quantity: 1,
            unitPrice: (totalLicenseAmount * 20) / 100,
            totalAmount: (totalLicenseAmount * 20) / 100,
            sourceType: "custom-onprem",
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
                <td
                  className={`px-3 py-6 text-left font-medium ${borderClass}`}
                >
                  {item.name}
                </td>
                <td className={`px-3 py-6 ${borderClass}`}>
                  {item.quantity.toLocaleString("vi-VN")}
                </td>
                <td className={`px-3 py-6 ${borderClass}`}>
                  {item.unitPrice.toLocaleString("vi-VN")}
                </td>
                <td className={`px-3 py-6 ${borderClass}`}>
                  {item.unitPrice !== ""
                    ? (
                        Number(item.unitPrice) * Number(item.quantity)
                      ).toLocaleString("vi-VN")
                    : ""}{" "}
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
              {quotation.summary.deploymentCost.toLocaleString("vi-VN")} VND
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 text-lg font-semibold text-gray-900 divide-y divide-gray-300">
              Tạm tính:
            </td>
            <td className="px-3 py-2 divide-y divide-gray-300 text-right text-lg font-semibold text-gray-900">
              {(
                quotation.summary.deviceTotal / 1.08 +
                quotation.summary.licenseTotal -
                ((quotation.summary.costServerTotal / 1.08) * 8) / 100 +
                quotation.summary.deploymentCost
              ).toLocaleString("vi-VN")}{" "}
              VND
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 text-lg font-semibold text-gray-900 divide-y divide-gray-300">
              VAT (8%):
            </td>
            <td className="px-3 py-2 divide-y divide-gray-300 text-right text-lg font-semibold text-gray-900">
              {(
                ((quotation.summary.deviceTotal / 1.08 +
                  quotation.summary.costServerTotal / 1.08) *
                  8) /
                100
              ).toLocaleString("vi-VN")}{" "}
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
              {quotation.summary.grandTotal.toLocaleString("vi-VN")} VND
            </td>
          </tr>
        </tbody>
      </table>
      {/* <div className="flex justify-end">
          <DownloadExcelButton quotationData={quotation}/>
        </div> */}
    </div>
  );
}
