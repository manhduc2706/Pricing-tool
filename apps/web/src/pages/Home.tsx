import { useState, useEffect } from "react";
import ServiceCheckbox from "../components/ServiceCheckbox";
import { SelectedFeature, ServiceOption } from "../types";
import { serviceOptionsApi } from "../services/serviceOptions";
import { quotationApi } from "../services/quotationApi";
import UserInput from "../components/UserInput";
import LocationInput from "../components/LocationInput";
import InfrastructureSelector from "../components/InfrastructureSelector";
import ShowQuotation from "../components/ShowQuotation";
import FeatureInput from "../components/FeatureInput";
import IconD from "../components/ui/iconD";
import IconCalculator from "../components/ui/iconCalculator";
import CameraCountInput from "../components/CameraCount";
import { DownloadExcelButton } from "../components/DownloadExcel";

export default function Home() {
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null); // Chỉ lưu một dịch vụ được chọn
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infrastructure, setInfrastructure] = useState<
    "Cloud" | "OnPremise" | null
  >(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [pointCount, setPointCount] = useState<number | null>(null);
  const [cameraCount, setCameraCount] = useState<number | null>(null);
  const [quotationResult, setQuotationResult] = useState<any>(null);
  const [excelResult, setExcelResult] = useState<any>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>(
    []
  );

  useEffect(() => {
    const fetchServiceOptions = async () => {
      try {
        setLoading(true);
        const options = await serviceOptionsApi.getServiceOptions();
        setServiceOptions(options);
      } catch (err) {
        setError("Không thể tải danh sách dịch vụ");
        console.error("Error loading service options:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceOptions();
  }, []);

  const handleInfrastructureChange = (selected: "Cloud" | "OnPremise") => {
    setInfrastructure(selected);
    // setSelectedService(null); // Reset dịch vụ khi thay đổi hạ tầng
  };

  const handleServiceChange = (optionId: string) => {
    setSelectedService(optionId); // Chỉ lưu một dịch vụ được chọn
  };

  const selectedOption = serviceOptions.find(
    (option) => option._id === selectedService
  );
  const iconKey = selectedOption?.iconKey;

  const handleCreateQuotation = async () => {
    if (!infrastructure || !selectedService) {
      alert("Vui lòng điền đầy đủ thông tin trước khi tạo báo giá.");
      return;
    }

    const selectedOption = serviceOptions.find(
      (option) => option._id === selectedService
    );

    // Tính tổng pointCount từ selectedFeatures cho securityAlert
    let totalPointCount = pointCount;
    if (selectedOption?.iconKey === "securityAlert") {
      if (selectedFeatures.length === 0) {
        alert("Vui lòng chọn ít nhất một tính năng cho cảnh báo an ninh.");
        return;
      }

      if (cameraCount === null) {
        alert("Vui lòng nhập số lượng camera");
        return;
      }

      // Tính tổng pointCount từ tất cả features đã chọn
      totalPointCount = selectedFeatures.reduce(
        (total, feature) => total + feature.pointCount,
        0
      );

      if (totalPointCount === 0) {
        alert("Vui lòng nhập số vị trí cho các tính năng đã chọn.");
        return;
      }
    } else {
      // Kiểm tra cho các service khác
      if (userCount === null) {
        alert("Vui lòng điền số lượng người dùng.");
        return;
      }
      if (pointCount === null) {
        alert("Vui lòng điền số lượng vị trí lắp đặt.");
        return;
      }
    }

    try {
      const quotationData = {
        deploymentType: infrastructure,
        _id: selectedService,
        userCount:
          selectedOption?.iconKey === "securityAlert" ? null : userCount,
        pointCount: totalPointCount, // Sử dụng totalPointCount thay vì pointCount
        selectedFeatures:
          selectedOption?.iconKey === "securityAlert" ? selectedFeatures : [],
        cameraCount:
          selectedOption?.iconKey === "securityAlert" ? cameraCount : null,
        iconKey: selectedOption?.iconKey,
      };

      const result = await quotationApi({
        ...quotationData,
        pointCount: totalPointCount!,
      });
      // const resultExcel = await excelApi({
      //   ...quotationData,
      //   pointCount: totalPointCount!,
      // });
      setExcelResult(quotationData);
      setQuotationResult(result);
    } catch (error) {
      console.error("Error creating quotation:", error);
      alert("Lỗi khi tạo báo giá. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      </div>
    );
  }

  const renderFeatureOptions = () => {
    const featureOptions = [
      "Cháy, khói",
      "Nhận diện người lạ",
      "Nhận diện hành vi",
      "Đếm người hoặc vật thể",
      "Xâm nhập vùng cấm",
      "Đọc biển số xe",
    ]; // Fix cứng các lựa chọn tính năng

    return (
      <FeatureInput
        features={featureOptions}
        onValueChange={(features) => {
          if (features !== null) {
            setSelectedFeatures(features);
            // Không cần setPointCount ở đây vì sẽ tính tổng trong handleCreateQuotation
          }
        }}
      />
    );
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-[1050px] mx-auto space-y-6">
        {/* Ô cấu hình báo giá */}
        <div className="bg-white shadow p-6">
          <div className="mb-6">
            <div className="flex flex-row items-center">
              <IconD />
              <h1 className="text-2xl font-bold text-gray-900 ml-2">
                Cấu hình báo giá
              </h1>
            </div>

            <p className="text-sm font-medium text-gray-500">
              Vui lòng điền thông tin để tạo báo giá chi tiết
            </p>
          </div>

          {/* Các bước cấu hình */}
          <div className="mb-8">
            {/* Hạ tầng */}
            <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2 mb-4">
              1. Hạ tầng triển khai
            </h2>
            <InfrastructureSelector
              selectedInfrastructure={infrastructure}
              onChange={handleInfrastructureChange}
            />

            {/* Dịch vụ */}
            {infrastructure && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2 mt-6 mb-4">
                  2. Chọn nhu cầu dịch vụ
                </h2>
                <p className="block font-medium text-gray-700 mb-4">
                  Chọn dịch vụ cần triển khai:
                </p>
                <div className="flex flex-wrap justify-between gap-5 mb-4">
                  {serviceOptions.map((option) => (
                    <ServiceCheckbox
                      key={option._id}
                      option={option}
                      isChecked={selectedService === option._id}
                      onChange={handleServiceChange}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Người dùng / Tính năng / Vị trí */}
            {selectedService && (
              <>
                {iconKey !== "securityAlert" && (
                  <>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2 mt-6 mb-4">
                      3. Số lượng người dùng
                    </h2>
                    <UserInput
                      infrastructure={infrastructure}
                      fixedUserLimits={
                        infrastructure === "OnPremise"
                          ? [
                              100,
                              200,
                              500,
                              1000,
                              1500,
                              2000,
                              3000,
                              5000,
                              ">5000",
                            ]
                          : null
                      }
                      onValueChange={setUserCount}
                    />
                  </>
                )}

                {iconKey === "securityAlert" ? (
                  <>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2 mt-6 mb-4">
                        3. Chọn tính năng
                      </h2>
                      <div className="flex flex-row">
                        {renderFeatureOptions()}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2 mt-6 mb-4">
                        4. Chọn số lượng
                      </h2>
                      <div className="flex flex-row">
                        <CameraCountInput onValueChange={setCameraCount} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2 mt-6 mb-4">
                      4. Số lượng vị trí lắp đặt
                    </h2>
                    <LocationInput onValueChange={setPointCount} />
                  </>
                )}
              </>
            )}
          </div>

          {/* Nút tạo báo giá */}
          <div className="flex justify-center">
            <button
              onClick={handleCreateQuotation}
              className="flex items-center gap-2 px-6 py-2 bg-[#0F4FAF] text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <IconCalculator />
              Tạo báo giá
            </button>
          </div>
        </div>

        {/* Ô hiển thị báo giá */}
        {quotationResult && (
          <div className="min-h-screen max-w-[1280px] bg-gray-50 border shadow">
            <div className="flex flex-col pb-2">
              <div className="bg-[#0F4FAF] text-white p-4">
                <div className="flex flex-row items-center gap-2">
                  <IconCalculator />
                  <h2 className="text-2xl font-bold">Báo Giá Chi Tiết</h2>
                </div>
                <p className="text-sm">
                  Bảng giá chi tiết cho dịch vụ hệ thống C-CAM
                </p>
              </div>
            </div>
            <div className="bg-white">
              <ShowQuotation quotation={quotationResult} />
              <div className="flex justify-end p-4 mb-4">
                <DownloadExcelButton quotationData={excelResult} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
