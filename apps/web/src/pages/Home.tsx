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
import z from "zod";
import { WarningBox } from "../components/ui/WarningBox";
import SiteInput from "../components/SiteInput";
import SiteLocationCheckbox from "../components/SiteLocationCheckbox";
import ScrollToTopButton from "../components/ScrollToTopButton";

// Schema validate form
const schema = z.object({
  userCount: z.number().min(1, "Số lượng user phải > 0").nullable(),
  pointCount: z.number().min(1, "Số lượng vị trí phải > 0").nullable(),
  cameraCount: z.number().min(1, "Số lượng camera phải > 0").nullable(),
  selectedFeatures: z.array(z.string()).min(1, "Bạn phải chọn ít nhất một dịch vụ"),
});

export default function Home() {
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null); // Chỉ lưu một dịch vụ được chọn
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infrastructure, setInfrastructure] = useState<
    "Cloud" | "OnPremise" | null
  >(null);
  const [siteCount, setSiteCount] = useState<number | null>(null);
  const [siteOption, setSiteOption] = useState<"TP Hà Nội" | "TP Hồ Chí Minh" | "Tỉnh khác" | null>(null)
  const [userCount, setUserCount] = useState<number | null>(null);
  const [pointCount, setPointCount] = useState<number | null>(null);
  const [cameraCount, setCameraCount] = useState<number | null>(null);
  const [quotationResult, setQuotationResult] = useState<any>(null);
  const [excelResult, setExcelResult] = useState<any>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>(
    []
  );
  // Thêm state cho thông báo chung
  const [formMessage, setFormMessage] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [showErrors, setShowErrors] = useState(false); // kiểm soát hiển thị
  const [quotationCreated, setQuotationCreated] = useState(false);
  const [successChecked, setSuccessChecked] = useState(false);
  const [progress, setProgress] = useState(100); // phần trăm thanh chạy



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

  const userCountSchema = z.number().min(1, "Số lượng user phải > 0").nullable();
  const pointCountSchema = z.number().min(1, "Số lượng vị trí phải > 0").nullable();
  const cameraCountSchema = z.number().min(1, "Số lượng camera phải > 0").nullable();
  const selectedFeaturesSchema = z.array(z.string()).min(1, "Bạn phải chọn ít nhất một dịch vụ");
  const siteCountSchema = z.number().min(1, "Số site phải > 0").nullable();

  const handleSiteOptionChange = (selected: "TP Hà Nội" | "TP Hồ Chí Minh" | "Tỉnh khác") => {
    setSiteOption(selected);
  }

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

  //Bảng thông báo tạo báo giá thành công
  const showToast = () => {
    setSuccessChecked(true);
    setProgress(100);
  };

  useEffect(() => {
    if (successChecked) {
      // giảm dần progress trong 3s
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            setSuccessChecked(false); // ẩn khi hết
            return 0;
          }
          return prev - 2; // tốc độ giảm (100/50 = 2, mỗi 60ms => ~3s)
        });
      }, 60);

      return () => clearInterval(interval);
    }
  }, [successChecked]);

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
        alert("Vui lòng điền số vị trí lắp đặt.");
        return;
      }
    }

    try {
      const quotationData = {
        deploymentType: infrastructure,
        _id: selectedService,
        siteCount: siteCount,
        siteLocation: siteOption,
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
      setExcelResult(quotationData);
      setQuotationResult(result);
      // Ẩn lỗi sau khi submit
      setQuotationCreated(true);
      setShowErrors(false);
      showToast();
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

  // Gom state values
  const values = { siteCount, siteOption, userCount, pointCount, cameraCount, selectedFeatures };

  const fieldLabels: Record<keyof typeof values, string> = {
    siteCount: "Số lượng site",
    siteOption: "Địa điểm triển khai",
    userCount: "Số lượng user",
    pointCount: "Số lượng vị trí",
    cameraCount: "Số lượng camera",
    selectedFeatures: "Giá trị trong tính năng",
  };

  const handleValueChange = (
    name: keyof typeof values,
    newValue: any,
    error: string | null
  ) => {
    if (name === "userCount") setUserCount(newValue);
    if (name === "pointCount") setPointCount(newValue);
    if (name === "cameraCount") setCameraCount(newValue);
    if (name === "selectedFeatures") setSelectedFeatures(newValue);
    if (name === "siteCount") setSiteCount(newValue);
    if (name === "siteOption") setSiteOption(newValue);

    // Nếu có error, hiển thị ưu tiên
    if (error) {
      setFormMessage(error);
      return;
    }

    setFormMessage(`${fieldLabels[name]} đã thay đổi. Vui lòng tạo mới báo giá.`);

    // Validate tổng thể form (chỉ áp dụng cho các field numeric)
    if (name !== "selectedFeatures") {
      const result = schema.safeParse({ ...values, [name]: newValue });
      if (!result.success) {
        setFormMessage(`Lỗi: ${result.error.issues[0].message}`);
      }
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    setShowErrors(true);
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

            <>
              {/* Số site triển khai */}
              <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2 mb-4">
                1. Số điểm triển khai
              </h2>
              <SiteInput
                schema={siteCountSchema}
                onValueChange={(val, error) => handleValueChange("siteCount", val, error)} />
            </>

            <>
              {/* Địa điểm triển khai */}
              <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2 mt-6 mb-4">
                2. Địa điểm triển khai
              </h2>
              <SiteLocationCheckbox
                selectedSiteLocation={siteOption}
                onChange={handleSiteOptionChange} />
            </>

            <>
              {/* Hạ tầng triển khai */}
              <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2 mt-6 mb-4">
                3. Hạ tầng triển khai
              </h2>
              <InfrastructureSelector
                selectedInfrastructure={infrastructure}
                onChange={handleInfrastructureChange}
              />
            </>

            {/* Dịch vụ */}
            {infrastructure && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2 mt-6 mb-4">
                  4. Chọn nhu cầu dịch vụ
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
                      5. Số lượng người dùng
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
                          : infrastructure === "Cloud" ? [
                            300, 500, 1000, 1500, 2000, ">2000"
                          ] : null
                      }
                      schema={userCountSchema}
                      onValueChange={(val, error) => handleValueChange("userCount", val, error)}
                    />
                  </>
                )}

                {iconKey === "securityAlert" ? (
                  <>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2 mt-6 mb-4">
                        5. Chọn tính năng
                      </h2>
                      <div className="flex flex-row">
                        <FeatureInput
                          onValueChange={(val, error) => handleValueChange("selectedFeatures", val, error.length > 0 ? error[0] : null)}
                        />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2 mt-6 mb-4">
                        6. Chọn số lượng camera
                      </h2>
                      <div className="flex flex-row">
                        <CameraCountInput
                          // schema={cameraCountSchema}
                          onValueChange={(val, error) => handleValueChange("cameraCount", val, error)} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2 mt-6 mb-4">
                      6. Số vị trí lắp đặt
                    </h2>
                    <LocationInput
                      schema={pointCountSchema}
                      onValueChange={(val, error) => handleValueChange("pointCount", val, error)} />
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

        {successChecked && (
          <div className="fixed bottom-5 right-12 flex items-end px-4 py-6">
            <div className="w-120 shadow-lg rounded bg-green-500 border-l-4 border-green-700 text-white relative">
              <div className="p-3">
                <div className="flex items-start">
                  <div className="ml-2 flex-1 pt-0.5">
                    <p className="text-sm leading-5 font-medium">Tạo báo giá thành công!</p>
                  </div>
                  <div className="ml-3 flex-shrink-0 flex">
                    <button
                      className="inline-flex text-white transition ease-in-out duration-150"
                      onClick={() => setSuccessChecked(false)} // React style
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 
                     1.414L11.414 10l4.293 4.293a1 1 0 
                     01-1.414 1.414L10 11.414l-4.293 
                     4.293a1 1 0 01-1.414-1.414L8.586 
                     10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Thanh progress */}
              <div className="h-1 bg-green-500">
                <div
                  className="h-1 bg-green-700 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}


        {quotationCreated && showErrors && formMessage && (
          <WarningBox>
            <span>{formMessage}</span>
          </WarningBox>
        )}


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
            </div>
          </div>
        )}

        <ScrollToTopButton />
      </div>
    </div>
  );
}
