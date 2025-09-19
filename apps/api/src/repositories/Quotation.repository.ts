import { Types } from "mongoose";
import { QuotationModel, IQuotation } from "../models/Quotation.model";
import {
  AdminSelectedFeature,
  DeviceModel,
  IDevice,
} from "../models/Device.model";
import {
  CloudUserLimit,
  ILicense,
  LicenseModel,
} from "../models/License.model";
import { IItemDetail, ItemDetail } from "../models/ItemDetail";
import { CostServerModel } from "../models/CostServer.model";
import { ExcelForm } from "../models/ExcelForm.model";
import {
  CostServerResponse,
  CreateQuotationData,
  OutPutQuotationData,
  QuotationItemResponse,
} from "../types/quotation";

export class QuotationRepository {
  private getUserTier(
    userCount: number,
    deploymentType: "Cloud" | "OnPremise"
  ): { userLimit: number | CloudUserLimit } {
    if (deploymentType === "OnPremise") {
      // OnPremise: trả về số user cố định
      return { userLimit: userCount };
    } else {
      // Cloud: trả về khoảng user
      if (userCount <= 300) return { userLimit: { min: 1, max: 300 } };
      if (userCount <= 500) return { userLimit: { min: 301, max: 500 } };
      if (userCount <= 1000) return { userLimit: { min: 501, max: 1000 } };
      if (userCount <= 1500) return { userLimit: { min: 1001, max: 1500 } };
      if (userCount <= 2000) return { userLimit: { min: 1501, max: 2000 } };
      return { userLimit: { min: 2001, max: 999999 } };
    }
  }
  async create(data: CreateQuotationData): Promise<OutPutQuotationData> {
    // 1) Validate cơ bản
    if (!data.pointCount) {
      throw new Error("Số điểm triển khai là bắt buộc");
    }

    // Chỉ yêu cầu userCount nếu KHÔNG phải securityAlert
    const isSecurity = data.iconKey === "securityAlert";
    if (
      !isSecurity &&
      (data.userCount == null || Number.isNaN(data.userCount))
    ) {
      throw new Error("Số lượng user là bắt buộc (trừ dịch vụ securityAlert)");
    }

    // 2) Tính userTier (chỉ khi không phải securityAlert)
    const userTierInfo =
      !isSecurity && data.userCount != null
        ? this.getUserTier(data.userCount, data.deploymentType)
        : null;

    //Lọc deploymentType
    const itemDetails = await ItemDetail.find({
      developmentType: data.deploymentType,
    });
    const itemDetailIds = itemDetails.map((item) => item._id);

    // 3) Lấy devices theo category
    const devices: IDevice[] = await DeviceModel.find({
      categoryId: data.categoryId,
      itemDetailId: { $in: itemDetailIds },
    })
      .populate("itemDetailId")
      .populate("categoryId");

    // Helper đảm bảo số:
    const num = (v: any) =>
      typeof v === "number" && !Number.isNaN(v) ? v : Number(v) || 0;

    // 4) Tìm licenses: Ưu tiên deploymentType trước, securityAlert xử lý bên trong
    let licenses: ILicense[] = [];

    if (data.deploymentType === "Cloud") {
      if (
        isSecurity &&
        data.selectedFeatures &&
        data.selectedFeatures.length > 0
      ) {
        // Cloud + securityAlert: lọc theo selectedFeatures
        const featureNames = data.selectedFeatures.map((sf) => sf.feature);
        licenses = await LicenseModel.find({
          categoryId: data.categoryId,
          itemDetailId: { $in: itemDetailIds },
          "selectedFeatures.feature": { $in: featureNames }, // Query theo feature name trong object
        })
          .populate("itemDetailId")
          .populate("categoryId");
      } else {
        // Cloud thường: theo khoảng userLimit
        licenses = await LicenseModel.find({
          categoryId: data.categoryId,
          itemDetailId: { $in: itemDetailIds },
          "userLimit.min": { $lte: data.userCount },
          "userLimit.max": { $gte: data.userCount },
        })
          .populate("itemDetailId")
          .populate("categoryId");
      }
    } else {
      // OnPremise
      if (
        isSecurity &&
        data.selectedFeatures &&
        data.selectedFeatures.length > 0
      ) {
        // OnPremise + securityAlert: lọc theo selectedFeatures
        const featureNames = data.selectedFeatures.map((sf) => sf.feature);
        licenses = await LicenseModel.find({
          categoryId: data.categoryId.toString(),
          itemDetailId: { $in: itemDetailIds },
          "selectedFeatures.feature": { $in: featureNames }, // Query theo feature name trong object
        })
          .populate("itemDetailId")
          .populate("categoryId");
      } else {
        // OnPremise thường: userLimit exact
        licenses = await LicenseModel.find({
          categoryId: data.categoryId,
          itemDetailId: { $in: itemDetailIds },
          userLimit: data.userCount,
        })
          .populate("itemDetailId")
          .populate("categoryId");
      }
    }

    const costServerIds = licenses
      .map((license) => license.costServerId)
      .filter((id) => id); // loại bỏ undefined/null nếu có

    const costServers = await CostServerModel.find({
      _id: { $in: costServerIds },
    });

    const costServer = costServers[0];

    // 5) Tính tổng
    let licenseTotal = 0;
    let deviceTotal = 0;
    if (data.deploymentType === "Cloud") {
      if (isSecurity && data.selectedFeatures) {
        // Cloud + securityAlert: KHÔNG nhân userCount
        const cameraCount = data.cameraCount;
        if (cameraCount == null) {
          throw new Error("cameraCount không được để trống khi chọn Cloud");
        }

        deviceTotal = devices.reduce((acc: number, device: any) => {
          const quantity =
            data.iconKey === "securityAlert"
              ? device.deviceType === "AI Box"
                ? Math.floor(num(data.cameraCount) / 2) +
                (num(data.cameraCount) % 2 !== 0 ? 1 : 0)
                : num(data.cameraCount) // Nếu không, dùng cameraCount
              : num(data.pointCount); // Nếu không phải securityAlert, dùng pointCount
          return acc + num(device.totalAmount) * num(quantity);
        }, 0);

        data.selectedFeatures.forEach((sf) => {
          const matchingLicenses = licenses.filter(
            (l: any) =>
              l.selectedFeatures &&
              l.selectedFeatures.some((lsf: any) => lsf.feature === sf.feature)
          );

          matchingLicenses.forEach((license: any) => {
            const id = license.itemDetailId || {};
            const base =
              num(id.unitPrice) +
              num(costServer.unitPrice) * (1 + num(id.vatRate / 100));
            licenseTotal += base * sf.pointCount;
          });
        });
      } else {
        // Cloud thường: nhân theo userCount
        if (data.userCount == null) {
          throw new Error("userCount không được để trống khi chọn Cloud");
        }
        const pointCount = data.pointCount;
        if (pointCount == null) {
          throw new Error("pointCount không được để trống khi chọn Cloud");
        }

        deviceTotal = devices.reduce(
          (acc: number, d: any) => acc + num(d.totalAmount) * num(pointCount),
          0
        );

        licenseTotal = licenses.reduce((acc: number, l: any) => {
          const id = l.itemDetailId || {};
          const perUser =
            num(id.unitPrice) +
            num(costServer.unitPrice) * (1 + num(id.vatRate / 100));
          return acc + perUser * num(data.userCount);
        }, 0);
      }
    } else {
      //Nếu là OnPremise và chọn securityAlert
      if (isSecurity && data.selectedFeatures) {
        // Tìm kiếm device và license theo features
        const cameraCount = data.cameraCount;
        if (cameraCount == null) {
          throw new Error("cameraCount không được để trống khi chọn OnPremise");
        }

        deviceTotal = devices.reduce((acc: number, device: any) => {
          const quantity =
            data.iconKey === "securityAlert"
              ? device.deviceType === "AI Box"
                ? Math.floor(num(data.cameraCount) / 2) +
                (num(data.cameraCount) % 2 !== 0 ? 1 : 0)
                : num(data.cameraCount) // Nếu không, dùng cameraCount
              : num(data.pointCount); // Nếu không phải securityAlert, dùng pointCount
          return acc + num(device.totalAmount) * num(quantity);
        }, 0);

        data.selectedFeatures.forEach((sf) => {
          const matchingLicenses = licenses.filter(
            (l: any) =>
              l.selectedFeatures &&
              l.selectedFeatures.some((lsf: any) => lsf.feature === sf.feature)
          );

          matchingLicenses.forEach((license: any) => {
            const id = license.itemDetailId || {};
            const base =
              num(id.unitPrice) +
              num(costServer.unitPrice) * (1 + num(id.vatRate / 100));
            licenseTotal += base * sf.pointCount;
          });
        });
      } else {
        // Onpremise và không chọn securityAlert
        if (data.userCount == null) {
          throw new Error("userCount không được để trống khi chọn OnPremise");
        }
        const pointCount = data.pointCount;
        if (pointCount == null) {
          throw new Error("pointCount không được để trống khi chọn OnPremise");
        }

        deviceTotal = devices.reduce(
          (acc: number, d: any) => acc + num(d.totalAmount) * num(pointCount),
          0
        );

        licenseTotal = licenses.reduce((acc: number, l: any) => {
          const id = l.itemDetailId || {};
          const perUser =
            num(id.unitPrice) +
            num(costServer.unitPrice) * (1 + num(costServer.vatRate / 100));
          return acc + perUser;
        }, 0);
      }
    }

    const deploymentCost =
      data.iconKey === "securityAlert"
        ? num((data.cameraCount || 0) * 1000000)
        : num((data.pointCount || 0) * 5000000);

    const costServerTotal =
      costServer.unitPrice * (1 + costServer.vatRate / 100);

    const grandTotal = deviceTotal + licenseTotal + deploymentCost;

    // 6) Format response

    const licenseResponses: QuotationItemResponse[] = licenses.map(
      (license: any) => {
        const matchedFeature = data.selectedFeatures?.find((sf) =>
          license.selectedFeatures?.some(
            (dsf: any) => dsf.feature === sf.feature
          )
        );
        const quantity = num(matchedFeature ? matchedFeature.pointCount : 1);
        return {
          itemDetailId: license.itemDetailId._id,
          name: license.itemDetailId?.name,
          selectedFeatures: license.selectedFeatures ?? [],
          unitPrice: num(license.itemDetailId?.unitPrice),
          pointCount: matchedFeature ? matchedFeature.pointCount : 1,
          vendor: license.itemDetailId.vendor,
          origin: license.itemDetailId.origin,
          fileId: license.itemDetailId.fileId,
          quantity,
          priceRate:
            data.deploymentType === "Cloud"
              ? num(
                (license.itemDetailId?.unitPrice *
                  license.itemDetailId?.vatRate *
                  quantity) /
                100
              )
              : null,
          vatRate: num(license.itemDetailId?.vatRate),
          totalAmount: num(license.totalAmount),
          category: license.categoryId?.name,
          description: license.itemDetailId?.description,
          note: license.itemDetailId?.note,
        };
      }
    );

    const deviceResponses: QuotationItemResponse[] = devices.map(
      (device: any) => {
        const quantity =
          data.iconKey === "securityAlert"
            ? device.deviceType === "AI Box"
              ? Math.floor(num(data.cameraCount) / 2) +
              (num(data.cameraCount) % 2 !== 0 ? 1 : 0)
              : num(data.cameraCount) // Nếu không, dùng cameraCount
            : num(data.pointCount); // Nếu không phải securityAlert, dùng pointCount

        return {
          itemDetailId: device.itemDetailId._id,
          fileId: device.itemDetailId.fileId,
          name: device.itemDetailId?.name,
          deviceType: device.deviceType,
          selectedFeatures: device.selectedFeatures ?? [],
          vendor: device.itemDetailId.vendor,
          origin: device.itemDetailId.origin,
          unitPrice: num(device.itemDetailId?.unitPrice),
          quantity,
          priceRate: num(
            (device.itemDetailId?.unitPrice *
              device.itemDetailId?.vatRate *
              quantity) /
            100
          ),
          vatRate: num(device.itemDetailId?.vatRate),
          cameraCount: data.cameraCount,
          totalAmount: num(device.totalAmount),
          category: device.categoryId?.name,
          description: device.itemDetailId?.description,
          note: device.itemDetailId?.note,
        };
      }
    );

    const costServerResponses: CostServerResponse[] = costServers.map(
      (costServer: any) => {
        // Lấy tổng quantity từ licenseResponses
        const totalLicenseQuantity = licenseResponses.reduce(
          (acc, license) => acc + num(license.quantity),
          0
        );
        const quantity =
          data.iconKey === "securityAlert" ? 1 : totalLicenseQuantity;

        return {
          fileId: costServer.fileId,
          name: costServer.name,
          unitPrice: num(costServer.unitPrice),
          quantity,
          priceRate:
            data.deploymentType === "OnPremise"
              ? num(
                (costServer.unitPrice * costServer.vatRate * quantity) / 100
              )
              : null,
          vatRate: num(costServer.vatRate),
          // Nếu iconKey là "securityAlert", quantity = 1, ngược lại dùng totalLicenseQuantity
          totalAmount: num(costServer.totalAmount) * quantity,
          description: costServer.description,
          note: costServer.itemDetailId?.note,
        };
      }
    );

    // 7) Lưu Quotation
    const newQuotation = new QuotationModel({
      deploymentType: data.deploymentType,
      categoryId: data.categoryId,
      userCount: data.userCount,
      iconKey: data.iconKey,
      pointCount: data.pointCount,
      cameraCount: data.cameraCount,
      items: [
        {
          categoryId: data.categoryId,
          devices: devices.map((device: any) => {
            const quantity =
              data.iconKey === "securityAlert"
                ? device.deviceType === "AI Box"
                  ? Math.floor(num(data.cameraCount) / 2) +
                  (num(data.cameraCount) % 2 !== 0 ? 1 : 0)
                  : num(data.cameraCount) // Nếu không, dùng cameraCount
                : num(data.pointCount); // Nếu không phải securityAlert, dùng pointCount

            return {
              itemDetailId: device.itemDetailId._id,
              fileId: device.itemDetailId.fileId,
              name: device.itemDetailId?.name,
              deviceType: device.deviceType,
              selectedFeatures: device.selectedFeatures ?? [],
              vendor: device.itemDetailId.vendor,
              origin: device.itemDetailId.origin,
              unitPrice: num(device.itemDetailId?.unitPrice),
              quantity,
              priceRate: num(
                (device.itemDetailId?.unitPrice *
                  device.itemDetailId?.vatRate *
                  quantity) /
                100
              ),
              vatRate: num(device.itemDetailId?.vatRate),
              cameraCount: data.cameraCount,
              totalAmount: num(device.totalAmount),
              category: device.categoryId?.name,
              description: device.itemDetailId?.description,
              note: device.itemDetailId?.note,
            };
          }),
          licenses: licenses.map((license: any) => {
            const matchedFeature = data.selectedFeatures?.find((sf) =>
              license.selectedFeatures?.some(
                (dsf: any) => dsf.feature === sf.feature
              )
            );
            const quantity = num(
              matchedFeature ? matchedFeature.pointCount : 1
            );
            return {
              itemDetailId: license.itemDetailId._id,
              fileId: license.itemDetailId.fileId,
              name: license.itemDetailId?.name,
              selectedFeatures: license.selectedFeatures ?? [],
              unitPrice: num(license.itemDetailId?.unitPrice),
              pointCount: matchedFeature ? matchedFeature.pointCount : 1,
              vendor: license.itemDetailId.vendor,
              origin: license.itemDetailId.origin,
              quantity,
              priceRate:
                data.deploymentType === "Cloud"
                  ? num(
                    (license.itemDetailId?.unitPrice *
                      license.itemDetailId?.vatRate *
                      quantity) /
                    100
                  )
                  : null,
              vatRate: num(license.itemDetailId?.vatRate),
              totalAmount: num(license.totalAmount),
              category: license.categoryId?.name,
              description: license.itemDetailId?.description,
              note: license.itemDetailId?.note,
            };
          }),
          costServers: costServers.map((costServer: any) => {
            // Lấy tổng quantity từ licenseResponses
            const totalLicenseQuantity = licenseResponses.reduce(
              (acc, license) => acc + num(license.quantity),
              0
            );

            const quantity =
              data.iconKey === "securityAlert" ? 1 : totalLicenseQuantity;

            return {
              fileId: costServer.fileId,
              name: costServer.name,
              unitPrice: num(costServer.unitPrice),
              priceRate:
                data.deploymentType === "OnPremise"
                  ? num(
                    (costServer.unitPrice * costServer.vatRate * quantity) /
                    100
                  )
                  : null,
              vatRate: num(costServer.vatRate),
              // Nếu iconKey là "securityAlert", quantity = 1, ngược lại dùng totalLicenseQuantity
              quantity,
              totalAmount: num(costServer.totalAmount) * quantity,
              description: costServer.description,
              note: costServer.itemDetailId?.note,
            };
          }),
          categoryTotal: grandTotal,
        },
      ],
      totalAmount: grandTotal,
    });

    const savedQuotation = await newQuotation.save();

    return {
      quotationId: savedQuotation._id,
      deploymentType: data.deploymentType,
      iconKey: data.iconKey,
      userCount: data.userCount as number,
      pointCount: data.pointCount as number,
      cameraCount: data.cameraCount as number,
      devices: deviceResponses,
      licenses: licenseResponses,
      costServers: costServerResponses,
      selectedFeatures: data.selectedFeatures ?? [],
      summary: {
        deviceTotal,
        licenseTotal,
        costServerTotal,
        deploymentCost,
        grandTotal,
      },
    };
  }
}
