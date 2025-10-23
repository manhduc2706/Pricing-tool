import { QuotationRepository } from '../repositories/Quotation.repository';
import ExcelJS from 'exceljs';
import { CostServerResponse, CreateQuotationData, OutPutQuotationData, QuotationItemResponse } from '../types/quotation';
import path from 'path';
import { FileModel } from '../models/File.model';
import * as fs from "fs/promises";
import { getMinIOClient } from '../configs/minio.config';
import { promises } from 'dns';
import { Types } from 'mongoose';
import { OutputQuotationModel } from '../models/QuotationOutPut.model';
import { QuotationModel } from '../models/Quotation.model';

export class QuotationService {
  private quotationRepository: QuotationRepository;

  private num(v: any) {
    return typeof v === "number" && !Number.isNaN(v) ? v : Number(v) || 0;
  }

  constructor() {
    this.quotationRepository = new QuotationRepository();
  }

  /**
   * Tạo mới một báo giá.
   * @param data - Dữ liệu từ FE bao gồm deploymentType, categoryId, userCount, pointCount.
   * @returns Báo giá đã được tạo.
   */
  private async prepareQuotationData(data: CreateQuotationData) {
    const isSecurity = data.iconKey === "securityAlert";
    if (!data.pointCount) throw new Error("Số điểm triển khai là bắt buộc");

    if (!isSecurity && (data.userCount == null || Number.isNaN(data.userCount))) {
      throw new Error("Số lượng user là bắt buộc (trừ dịch vụ securityAlert)");
    }
    const num = this.num;

    console.log("Data nhận được trong prepareQuotationData:", data);


    const itemDetails = await this.quotationRepository.findItemDetailsByDeploymentType(data.deploymentType);
    const itemDetailIds = itemDetails.map((i) => i._id.toString());

    const allDevices = await this.quotationRepository.findDevicesByCategory(data.categoryId.toString(), itemDetailIds);
    const screenDevices = allDevices.filter((d) => d.deviceType === "Màn hình");
    const switchDevices = allDevices.filter((d) => d.deviceType === "Switch PoE");
    const firstScreenDevice = screenDevices.length > 0 ? screenDevices[0] : null;
    const firstSwitchDevice = switchDevices.length > 0 ? switchDevices[0] : null;
    const otherDevices = allDevices.filter((d) => d.deviceType !== "Màn hình" && d.deviceType !== "Switch PoE");
    const devices = [
      ...(firstScreenDevice ? [firstScreenDevice] : []),
      ...(firstSwitchDevice ? [firstSwitchDevice] : []),
      ...otherDevices,
    ];
    const licenses = await this.getLicenses(data, isSecurity, itemDetailIds);
    const costServerIds = licenses.map((l: any) => l.costServerId).filter((id: any) => id);
    const costServers = await this.quotationRepository.findCostServersByIds(costServerIds);
    const costServer = costServers[0];

    return { isSecurity, allDevices, screenDevices, switchDevices, firstSwitchDevice, firstScreenDevice, otherDevices, devices, licenses, costServers, costServer, num };
  }

  async createQuotation(data: CreateQuotationData): Promise<OutPutQuotationData> {
    try {
      const num = this.num;

      // 1) Lấy dữ liệu
      const { isSecurity, allDevices, screenDevices, switchDevices, firstScreenDevice, otherDevices, devices, licenses, costServers, costServer } = await this.prepareQuotationData(data);

      // 2) Gọi tính toán
      const totals = this.calculateTotals(data, devices, licenses, costServer, isSecurity);

      // 3) Trả dữ liệu chuẩn FE
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

      const licenseResponses: QuotationItemResponse[] = licenses.map((licenses: any) => {
        const matchedFeature = data.selectedFeatures?.find((sf) =>
          licenses.selectedFeatures?.some((dsf: any) => dsf.feature === sf.feature)
        );
        const quantity = num(matchedFeature ? matchedFeature.pointCount : 1);

        return {
          itemDetailId: licenses.itemDetailId?._id ?? new Types.ObjectId(),
          name: licenses.itemDetailId?.name ?? "N/A",
          selectedFeatures: licenses.selectedFeatures ?? [],
          unitPrice: num(licenses.itemDetailId?.unitPrice),
          pointCount: matchedFeature ? matchedFeature.pointCount : 1,
          vendor: licenses.itemDetailId?.vendor ?? "",
          origin: licenses.itemDetailId?.origin ?? "",
          fileId: licenses.itemDetailId?.fileId ?? null,
          quantity,
          priceRate:
            data.deploymentType === "Cloud"
              ? num(
                (licenses.itemDetailId?.unitPrice *
                  licenses.itemDetailId?.vatRate *
                  quantity) / 100
              )
              : null,
          vatRate: num(licenses.itemDetailId?.vatRate),
          totalAmount: num(licenses.totalAmount),
          category: licenses.categoryId?.name ?? "",
          description: licenses.itemDetailId?.description ?? "",
          note: licenses.itemDetailId?.note ?? "",
        };
      });

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

      const quotation = await QuotationModel.create(data);

      const newOutPutQuotation = new OutputQuotationModel({
        quotationId: quotation._id,
        deploymentType: data.deploymentType,
        iconKey: data.iconKey,
        userCount: data.userCount ?? null,
        pointCount: data.pointCount ?? null,
        cameraCount: data.cameraCount ?? null,
        selectedFeatures: data.selectedFeatures ?? [],
        screenOptions: screenDevices,
        switchOptions: switchDevices,
        devices: deviceResponses,
        licenses: licenseResponses,
        costServers: costServerResponses,
        ...totals, // merge toàn bộ kết quả từ calculateTotals
      });

      return await newOutPutQuotation.save();
    } catch (error) {
      console.error("Lỗi trong createQuotation:", error);
      if (error instanceof Error) {
        throw new Error(error.message || "Lỗi không xác định trong createQuotation");
      } else {
        throw new Error("Lỗi không xác định trong createQuotation");
      }
    }
  }


  //Lọc license theo điều kiện
  private async getLicenses(data: CreateQuotationData, isSecurity: boolean, itemDetailIds: string[]) {
    const query: any = {
      categoryId: data.categoryId,
      itemDetailId: { $in: itemDetailIds },
    };

    if (data.deploymentType === "Cloud") {
      if (isSecurity && data.selectedFeatures) {
        query["selectedFeatures.feature"] = { $in: data.selectedFeatures.map((sf) => sf.feature) };
      } else {
        query.userLimit = data.userCount;
      }
    } else {
      if (isSecurity && data.selectedFeatures) {
        query["selectedFeatures.feature"] = { $in: data.selectedFeatures.map((sf) => sf.feature) };
      } else {
        query.userLimit = data.userCount;
      }
    }

    return this.quotationRepository.findLicensesByQuery(query);
  }

  private calculateTotals(
    data: CreateQuotationData,
    devices: any[],
    licenses: any[],
    costServer: any,
    isSecurity: boolean
  ) {
    const num = this.num;

    // --- Chi phí cố định ---
    const materialCosts =
      data.siteCount > 1
        ? "AM tính chi phí"
        : 5000000;
    const softwareInstallationCost = 5000000;
    const trainingCost = 5000000;

    // --- Bắt đầu tính tổng ---
    let licenseTotal = 0;
    let licenseTotalNoVat = 0;
    let deviceTotal = 0;
    let deviceTotalNoVat = 0;

    if (data.deploymentType === "Cloud") {
      // --- Cloud ---
      if (isSecurity && data.selectedFeatures) {
        // Cloud + securityAlert
        const cameraCount = data.cameraCount;
        if (cameraCount == null) {
          throw new Error("cameraCount không được để trống khi chọn Cloud");
        }

        //Tổng giá thiết bị bao gồm vat
        deviceTotal = devices.reduce((acc: number, device: any) => {
          const quantity =
            data.iconKey === "securityAlert"
              ? device.deviceType === "AI Box"
                ? Math.floor(num(data.cameraCount) / 2) +
                (num(data.cameraCount) % 2 !== 0 ? 1 : 0)
                : num(data.cameraCount)
              : num(data.pointCount);
          return acc + num(device.totalAmount) * num(quantity);
        }, 0);

        //Tổng giá thiết bị chưa bao gồm vat
        deviceTotalNoVat = devices.reduce((acc: number, device: any) => {
          const quantity =
            data.iconKey === "securityAlert"
              ? device.deviceType === "AI Box"
                ? Math.floor(num(data.cameraCount) / 2) +
                (num(data.cameraCount) % 2 !== 0 ? 1 : 0)
                : num(data.cameraCount)
              : num(data.pointCount);
          return acc + num(device.itemDetailId.unitPrice) * num(quantity);
        }, 0);

        //Tổng giá license + server bao gồm vat
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
              num(costServer?.unitPrice ?? 0) * (1 + num(id.vatRate / 100));
            licenseTotal += base * sf.pointCount;
          });
        });

        //Tổng giá license + server chưa bao gồm vat
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
              num(costServer?.unitPrice ?? 0);
            licenseTotalNoVat += base * sf.pointCount;
          });
        });

      } else {
        // Cloud thường
        if (data.userCount == null) {
          throw new Error("userCount không được để trống khi chọn Cloud");
        }
        const pointCount = data.pointCount;
        if (pointCount == null) {
          throw new Error("pointCount không được để trống khi chọn Cloud");
        }

        //Tổng thiết bị bao gồm vat
        deviceTotal = devices.reduce(
          (acc: number, d: any) => acc + num(d.totalAmount) * num(pointCount),
          0
        );

        //Tổng thiết bị chưa bao gồm vat
        deviceTotalNoVat = devices.reduce(
          (acc: number, d: any) => acc + num(d.itemDetailId.unitPrice) * num(pointCount),
          0
        );

        //Tổng license + server bao gồm vat
        licenseTotal = licenses.reduce((acc: number, l: any) => {
          const id = l.itemDetailId || {};
          const perUser =
            num(id.unitPrice) +
            num(costServer?.unitPrice ?? 0) * (1 + num(id.vatRate / 100));
          return acc + perUser;
        }, 0);

        //Tổng license + server chưa bao gồm vat
        licenseTotalNoVat = licenses.reduce((acc: number, l: any) => {
          const id = l.itemDetailId || {};
          const perUser =
            num(id.unitPrice) +
            num(costServer?.unitPrice ?? 0);
          return acc + perUser;
        }, 0);
      }
    } else {
      // --- OnPremise ---
      if (isSecurity && data.selectedFeatures) {
        const cameraCount = data.cameraCount;
        if (cameraCount == null) {
          throw new Error("cameraCount không được để trống khi chọn OnPremise");
        }

        //Tổng thiết bị bao gồm vat
        deviceTotal = devices.reduce((acc: number, device: any) => {
          const quantity =
            data.iconKey === "securityAlert"
              ? device.deviceType === "AI Box"
                ? Math.floor(num(data.cameraCount) / 2) +
                (num(data.cameraCount) % 2 !== 0 ? 1 : 0)
                : num(data.cameraCount)
              : num(data.pointCount);
          return acc + num(device.totalAmount) * num(quantity);
        }, 0);

        //Tổng thiết bị chưa bao gồm vat
        deviceTotalNoVat = devices.reduce((acc: number, device: any) => {
          const quantity =
            data.iconKey === "securityAlert"
              ? device.deviceType === "AI Box"
                ? Math.floor(num(data.cameraCount) / 2) +
                (num(data.cameraCount) % 2 !== 0 ? 1 : 0)
                : num(data.cameraCount)
              : num(data.pointCount);
          return acc + num(device.itemDetailId.unitPrice) * num(quantity);
        }, 0);

        //Tổng license + server bao gồm vat
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
              num(costServer?.unitPrice ?? 0) * (1 + num(id.vatRate / 100));
            licenseTotal += base * sf.pointCount;
          });
        });

        //Tổng license + server chưa bao gồm vat
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
              num(costServer?.unitPrice ?? 0);
            licenseTotalNoVat += base * sf.pointCount;
          });
        });

      } else {
        // OnPremise thường
        if (data.userCount == null) {
          throw new Error("userCount không được để trống khi chọn OnPremise");
        }
        const pointCount = data.pointCount;
        if (pointCount == null) {
          throw new Error("pointCount không được để trống khi chọn OnPremise");
        }

        //Tổng thiết bị bao gồm vat
        deviceTotal = devices.reduce(
          (acc: number, d: any) => acc + num(d.totalAmount) * num(pointCount),
          0
        );

        //Tổng thiết bị chưa bao gồm vat
        deviceTotalNoVat = devices.reduce(
          (acc: number, d: any) => acc + num(d.itemDetailId.unitPrice) * num(pointCount),
          0
        );

        //Tổng license + server bao gồm vat
        licenseTotal = licenses.reduce((acc: number, l: any) => {
          const id = l.itemDetailId || {};
          const perUser =
            num(id.unitPrice) +
            num(costServer?.unitPrice ?? 0) * (1 + num(costServer?.vatRate ?? 0) / 100);
          return acc + perUser;
        }, 0);

        //Tổng license + server chưa bao gồm vat
        licenseTotalNoVat = licenses.reduce((acc: number, l: any) => {
          const id = l.itemDetailId || {};
          const perUser =
            num(id.unitPrice) +
            num(costServer?.unitPrice ?? 0);
          return acc + perUser;
        }, 0);

      }
    }

    // --- Chi phí triển khai ---
    const deploymentCost =
      typeof materialCosts === "number"
        ? num(softwareInstallationCost) + num(trainingCost) + num(materialCosts)
        : num(softwareInstallationCost) + num(trainingCost);

    // --- Tổng chi phí server có vat ---
    const costServerTotal = Math.round(costServer
      ? num(costServer.unitPrice) * (1 + num(costServer.vatRate) / 100)
      : 0);

    // --- Tổng chi phí server chưa vat ---
    const costServerTotalNoVat = Math.round(costServer
      ? num(costServer.unitPrice)
      : 0);

    //---Tổng chi phí chưa có vat---
    const temporaryTotal = num(deviceTotalNoVat) + num(licenseTotalNoVat) + num(deploymentCost)

    // ---Tổng chi phí vat---
    const vatPrices = num(deviceTotal - deviceTotalNoVat) + num(costServerTotal - costServerTotalNoVat)

    // --- Tổng cuối cùng có vat---
    const grandTotal = num(temporaryTotal) + num(vatPrices)

    // --- Kết quả ---
    return {
      materialCosts,
      softwareInstallationCost,
      trainingCost,
      deploymentCost,
      summary: {
        deviceTotal,
        licenseTotal,
        costServerTotal,
        costServerTotalNoVat,
        deploymentCost,
        temporaryTotal,
        grandTotal,
        vatPrices,
      },
    };
  }

  async updateQuotationItem(
    id: string,
    type: "device" | "license" | "server",
    updatedItemId: string
  ) {
    // Lấy output quotation từ DB
    let outputQuotation = await this.quotationRepository.findByIdOutPut(id);
    if (!outputQuotation) throw new Error("Không tìm thấy dữ liệu output quotation");

    // Lấy quotation gốc thông qua id tham chiếu
    const quotation = await this.quotationRepository.findById(outputQuotation.quotationId.toString());
    if (!quotation) throw new Error("Không tìm thấy báo giá gốc");
    const num = this.num;

    const data = {
      deploymentType: quotation.deploymentType,
      userCount: quotation.userCount,
      pointCount: quotation.pointCount,
      cameraCount: quotation.cameraCount,
      selectedFeatures: quotation.selectedFeatures,
      iconKey: quotation.iconKey,
      siteLocation: quotation.siteLocation,
      siteCount: quotation.siteCount,
      categoryId: quotation.categoryId,
    } as CreateQuotationData;
    let { isSecurity, allDevices, screenDevices, switchDevices, otherDevices, devices, licenses, costServers, costServer } = await this.prepareQuotationData(data);


    // --- Cập nhật item tương ứng ---
    if (type === "device") {
      const newDevice = await this.quotationRepository.findDeviceById(updatedItemId);
      if (!newDevice) throw new Error("Không tìm thấy thiết bị cần cập nhật");

      // Lấy danh sách thiết bị hiện có trong outputQuotation
      const currentOutputDevices = outputQuotation.devices || [];

      // Nếu thiết bị thay thế là màn hình
      if (newDevice.deviceType === "Màn hình") {
        let firstScreenDevice = newDevice;

        const switchDeviceId = currentOutputDevices.find(
          (d: any) => d.deviceType === "Switch PoE"
        )?.itemDetailId;

        let firstSwitchDeviceResult = switchDeviceId
          ? await this.quotationRepository.findDevicesByItemDetail(switchDeviceId.toString())
          : null;

        let firstSwitchDevice = firstSwitchDeviceResult && firstSwitchDeviceResult.length > 0
          ? firstSwitchDeviceResult[0]
          : null;

        devices = [
          ...(firstScreenDevice ? [firstScreenDevice] : []),
          ...(firstSwitchDevice ? [firstSwitchDevice] : []),
          ...otherDevices,
        ];
      }
      // Nếu thiết bị thay thế là Switch PoE
      else if (newDevice.deviceType === "Switch PoE") {
        let firstSwitchDevice = newDevice;

        const screenDeviceId = currentOutputDevices.find(
          (d: any) => d.deviceType === "Màn hình"
        )?.itemDetailId;

        console.log(screenDeviceId)

        let firstScreenDeviceResult = screenDeviceId
          ? await this.quotationRepository.findDevicesByItemDetail(screenDeviceId.toString())
          : null;

        let firstScreenDevice = firstScreenDeviceResult && firstScreenDeviceResult.length > 0
          ? firstScreenDeviceResult[0]
          : null;

        devices = [
          ...(firstScreenDevice ? [firstScreenDevice] : []),
          ...(firstSwitchDevice ? [firstSwitchDevice] : []),
          ...otherDevices,
        ];
      }
      // Nếu là thiết bị khác
      else {
        const sameTypeIndex = otherDevices.findIndex(
          (d) => d.deviceType === newDevice.deviceType
        );

        if (sameTypeIndex !== -1) {
          otherDevices[sameTypeIndex] = newDevice;
        } else {
          otherDevices.push(newDevice);
        }
      }
    }

    // --- Tính lại tổng ---
    const totals = this.calculateTotals(data, devices, licenses, costServer, isSecurity);

    // 3) Trả dữ liệu chuẩn FE
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

    // --- Lưu & trả kết quả ---
    const newOutPutQuotation = await this.quotationRepository.update(id, {
      devices: deviceResponses,
      summary: totals.summary,
    });
    return newOutPutQuotation;
  }


  async downloadExcel(id: string): Promise<Buffer> {
    const quotation = await this.quotationRepository.findByIdOutPut(id);
    if (!quotation) {
      throw new Error("Không tìm thấy báo giá output");
    }
    console.log(quotation)
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Quotation');

    // ============================
    // Bảng nhỏ phía trên (Thông tin chung)
    // ============================

    // Lấy đường dẫn tuyệt đối đến ảnh

    const logoPath = process.env.NODE_ENV === "production" ? path.join(process.cwd(), "dist", "images", "LogoCMC.png") // Docker
      : path.join(process.cwd(), "src", "images", "LogoCMC.png"); // Local dev
    console.log(logoPath)
    // Đọc file ảnh và thêm vào workbook
    const logoImage = workbook.addImage({
      filename: logoPath,
      extension: 'png', // jpg, jpeg cũng được
    });

    // Thêm ảnh vào sheet (vị trí C1:D5 chẳng hạn)
    // Chèn ảnh vào vùng từ C2 đến D5
    sheet.addImage(logoImage, {
      tl: { col: 2, row: 1 }, // top-left tại ô C2
      ext: { width: 250, height: 70 }, // chiều rộng & cao ảnh (px)
    });

    // Merge từ E2 đến O2
    sheet.mergeCells('E2:O2');
    sheet.mergeCells('E3:O3');
    const cell = sheet.getCell('E2');
    const cellss = sheet.getCell('E3');
    cell.value = 'CMC TECHNOLOGY & SOLUTION';
    cellss.value =
      'Trụ sở: Tầng 16, CMC Tower, phố Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Thành phố Hà Nội.';

    // Style chữ
    cell.font = { bold: true, size: 14, color: { argb: '0070C0' } }; // xanh, in đậm
    cell.alignment = { horizontal: 'center', vertical: 'middle' };

    cellss.font = {
      bold: true,
      size: 11,
      color: { argb: '0070C0' },
      underline: true,
    }; // xanh, in đậm
    cellss.alignment = { horizontal: 'center', vertical: 'middle' };

    // Merge từ B5 đến O5
    sheet.mergeCells('B5:O5');
    const b5Cell = sheet.getCell('B5');
    b5Cell.value = 'BÁO GIÁ DỊCH VỤ';

    // Style chữ
    b5Cell.font = { bold: true, size: 40, color: { argb: '0070C0' } }; // xanh, in đậm
    b5Cell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Merge từ J5 đến N5
    sheet.mergeCells('J6:N6');
    const j6Cell = sheet.getCell('J6');
    // const location = await getLocation(); // lấy từ API hoặc geoip-lite

    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    j6Cell.value = `Hà Nội, ngày ${day}, tháng ${month}, năm ${year}`;

    // Style chữ
    j6Cell.font = {
      bold: true,
      size: 11,
      color: { argb: 'FF000000' },
      italic: true,
    }; // xanh, in đậm
    j6Cell.alignment = { horizontal: 'right', vertical: 'middle' };

    //Merge B8 - D8
    sheet.mergeCells('B8:D8');
    const b8Cell = sheet.getCell('B8');
    b8Cell.value = 'DỰ ÁN: Triển khai C-Cam cho khách hàng';

    // Style chữ
    b8Cell.font = { bold: true, size: 11, color: { argb: 'FF000000' } }; // xanh, in đậm
    b8Cell.alignment = { horizontal: 'left', vertical: 'middle' };

    //Thông tin liên hệ 1
    const labels1 = [
      { left: 'Kính gửi:', right: '', mergeRows: 2, underline: true },
      { left: 'Địa chỉ:', right: '' },
      { left: 'Mobile:', right: '' },
      { left: 'Email:', right: '' },
    ];

    let startRow1 = 10; // bắt đầu từ hàng 10

    labels1.forEach((item) => {
      if (item.mergeRows === 2) {
        // Merge 2 dòng liền nhau
        sheet.mergeCells(`B${startRow1}:F${startRow1 + 1}`);
        const cell = sheet.getCell(`B${startRow1}`);
        cell.value = {
          richText: [
            {
              text: item.left,
              font: {
                bold: true,
                size: 11,
                underline: item.underline || false,
              },
            },
            {
              text: ` ${item.right}`,
              font: { bold: false, size: 11 },
            },
          ],
        };
        cell.alignment = {
          horizontal: 'left',
          vertical: 'middle',
          wrapText: true,
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };

        sheet.getRow(startRow1).height = 20;
        startRow1 += 2; // nhảy qua 2 hàng vì merge
      } else {
        // Merge 1 dòng
        sheet.mergeCells(`B${startRow1}:F${startRow1}`);
        const cell = sheet.getCell(`B${startRow1}`);
        cell.value = {
          richText: [
            {
              text: item.left,
              font: { bold: true, size: 11 },
            },
            {
              text: ` ${item.right}`,
              font: { bold: false, size: 11 },
            },
          ],
        };
        cell.alignment = {
          horizontal: 'left',
          vertical: 'middle',
          wrapText: true,
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };

        sheet.getRow(startRow1).height = 20;
        startRow1 += 1; // nhảy xuống 1 hàng
      }
    });

    // Thông tin liên hệ 2
    const labels = [
      { left: 'Bên báo giá:', right: ` C-CAM ${quotation.deploymentType}` },
      {
        left: 'Tên công ty:',
        right: ' TỔNG CÔNG TY CÔNG NGHỆ & GIẢI PHÁP CMC',
      },
      {
        left: 'Địa chỉ:',
        right:
          ' Tòa CMC Tower, số 11, Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
      },
      { left: 'Tài khoản:', right: '' },
      {
        richText: [
          { text: 'Liên hệ:', font: { bold: true, size: 11 } },
          { text: ' ', font: { size: 11 } }, // khoảng trắng
          {
            text: '                         Mobile:',
            font: { bold: true, size: 11 },
          },
          { text: ' ', font: { size: 11 } }, // sau này chèn nội dung Mobile
        ],
      },
      { left: 'Email:', right: '' },
    ];

    labels.forEach((item, i) => {
      const rowIndex = 9 + i;
      sheet.mergeCells(`G${rowIndex}:O${rowIndex}`);
      const cell = sheet.getCell(`G${rowIndex}`);

      if (item.richText) {
        // Nếu có richText -> gán trực tiếp
        cell.value = { richText: item.richText };
      } else if (i < 2) {
        // Hai dòng đầu -> in đậm toàn bộ
        cell.value = {
          richText: [
            {
              text: `${item.left}${item.right}`,
              font: { bold: true, size: 11, color: { argb: 'FF000000' } },
            },
          ],
        };
      } else {
        // Các dòng sau -> phần trước in đậm, phần sau thường
        cell.value = {
          richText: [
            {
              text: item.left,
              font: { bold: true, size: 11, color: { argb: 'FF000000' } },
            },
            {
              text: item.right,
              font: { bold: false, size: 11, color: { argb: 'FF000000' } },
            },
          ],
        };
      }

      cell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      sheet.getRow(rowIndex).height = 20;
    });

    sheet.addRow([]);

    // ============================
    // Chèn 12 dòng trống trước
    // ============================
    for (let i = 1; i < 2; i++) {
      sheet.addRow([]);
    }

    // ============================
    // Đơn vị tính
    // ============================
    let vndRow = sheet.addRow([]);

    let vndCell = vndRow.getCell(14);
    vndCell.value = 'Đơn vị tính: VNĐ';
    vndCell.font = {
      size: 11,
      bold: true,
      color: { argb: 'FF000000' },
      italic: true,
    };
    vndCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Border chỉ quanh đúng ô này
    vndCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // ============================
    // Định nghĩa header ở dòng 18
    // ============================
    const headerRow = sheet.addRow([
      '',
      'STT',
      'Mô tả',
      'Thông số kỹ thuật',
      'Số lượng',
      'NCC',
      'Hình ảnh minh họa',
      'Hãng',
      'Xuất xứ',
      'Đơn giá trước VAT',
      'Khuyến mại',
      'Thành tiền trước VAT',
      'VAT',
      'Thành tiền VAT',
      'Ghi chú',
    ]);

    sheet.getRow(18).height = 30;

    // Set width cho từng cột (theo config cũ)
    sheet.getColumn(1).width = 2; // cột A trống
    sheet.getColumn(2).width = 6; // STT
    sheet.getColumn(3).width = 30; // Mô tả
    sheet.getColumn(4).width = 40; // Thông số kỹ thuật
    sheet.getColumn(5).width = 10; // Số lượng
    sheet.getColumn(6).width = 10; // NCC
    sheet.getColumn(7).width = 30; // Hình ảnh minh họa
    sheet.getColumn(8).width = 10; // Hãng
    sheet.getColumn(9).width = 10; // Xuất xứ
    sheet.getColumn(10).width = 20; // Đơn giá trước VAT
    sheet.getColumn(11).width = 15; // Khuyến mại
    sheet.getColumn(12).width = 25; // Thành tiền trước VAT
    sheet.getColumn(13).width = 20; // VAT
    sheet.getColumn(14).width = 20; // Thành tiền VAT
    sheet.getColumn(15).width = 30; // Ghi chú

    // Style cho header
    headerRow.font = { bold: true, size: 12 };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    for (let col = 2; col <= headerRow.cellCount; col++) {
      const cell = headerRow.getCell(col);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }, // xanh đậm
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }

    // ============================
    // Tải ảnh từ URL về buffer
    // ============================

    async function getFileBuffer(fileKey: string): Promise<Buffer> {
      const filePath = process.env.NODE_ENV === "production" ? path.join(process.cwd(), "dist", "images", fileKey) // Docker
        : path.join(process.cwd(), "src", "images", fileKey); // Local dev
      try {
        const buffer = await fs.readFile(filePath);
        return buffer;
      } catch (err) {
        throw new Error(`Không tìm thấy ảnh: ${filePath}`);
      }
    }

    // ============================
    // Mục A - License
    // ============================
    const firstHeader = sheet.addRow([]);
    const licenseHeader = sheet.addRow(['', 'A', 'Chi Phí License Phần Mềm']);
    licenseHeader.font = { bold: true, size: 11 };
    licenseHeader.alignment = { horizontal: 'left' };
    sheet.mergeCells(`C${licenseHeader.number}:D${licenseHeader.number}`);

    let totalLicenseAmount = 0;
    let licenseStt = 1;
    for (const l of quotation.licenses) {
      const rowTotal = l.unitPrice * l.quantity;
      totalLicenseAmount += rowTotal;

      const row = sheet.addRow([
        '',
        licenseStt++,
        l.name,
        l.description,
        l.quantity,
        l.vendor,
        '',
        l.vendor,
        l.origin,
        l.unitPrice,
        '',
        rowTotal,
        '',
        l.unitPrice * l.quantity,
        l.note,
      ]);

      row.getCell(10).numFmt = '#,##0';
      row.getCell(12).numFmt = '#,##0';
      row.getCell(13).numFmt = '#,##0';
      row.getCell(14).numFmt = '#,##0';

      if (l.fileId) {
        try {
          const fileLicense = await FileModel.findById(l.fileId); // 🔑 lấy theo từng d.fileId
          if (!fileLicense) {
            throw new Error('File not found');
          }
          const buffer = await getFileBuffer(fileLicense.fileKey);

          const base64 = buffer.toString('base64');

          const imageId = workbook.addImage({
            base64,
            extension: 'png',
          });

          const colIndex = 6;
          const rowIndex = sheet.lastRow!.number;

          // Điều chỉnh chiều rộng cột
          const col = sheet.getColumn(colIndex);
          const desiredColWidth = 150 / 7; // khoảng 7px ~ 1 unit ExcelJS
          if (!col.width || col.width < desiredColWidth) {
            col.width = desiredColWidth;
          }

          // Điều chỉnh chiều cao dòng
          const row = sheet.getRow(rowIndex);
          const desiredRowHeight = 250 * 0.75; // khoảng 0.75px ~ 1 unit height ExcelJS
          if (!row.height || row.height < desiredRowHeight) {
            row.height = desiredRowHeight;
          }

          const colR = Number(colIndex + 0.95);
          const rowR = Number(rowIndex - 1 + 0.14);

          // Chèn ảnh giữ kích thước cố định
          sheet.addImage(imageId, {
            tl: { col: colR, row: rowR },
            ext: { width: 150, height: 150 },
            editAs: 'absolute',
          });
        } catch (err) {
          console.error(`Không tải được ảnh từ ${l.fileId}:`, err);
        }
      }
    }

    // Hardcode điều kiện deploymentType
    if (quotation.deploymentType === 'Cloud') {
      const row = sheet.addRow([
        '',
        licenseStt,
        '(Miễn phí) Phí bảo trì và nâng cấp hàng năm',
        `- Bảo trì hệ thống phần mềm: cập nhật các bản vá lỗi, nâng cấp các phiên bản về firmware mới nếu có để đảm bảo hệ thống hoạt động ổn định.
- Hỗ trợ kỹ thuật từ xa trong các trường hợp xảy ra các vấn đề về vận hành hoặc kỹ thuật của hệ thống.
- Hỗ trợ đào tạo, hướng dẫn lại việc sử dụng phần mềm cho nhân sự mới tiếp nhận hệ thống của phía khách hàng.
- Hỗ trợ backup hoặc khôi phục dữ liệu nếu có yêu cầu.`,
        1,
        'CMC TS',
        '',
        'CMC TS',
        'Việt Nam',
        '',
        '',
        '',
        '',
        '',
        '',
      ]);

      row.getCell(10).numFmt = '#,##0';
      row.getCell(12).numFmt = '#,##0';
      row.getCell(13).numFmt = '#,##0';
      row.getCell(14).numFmt = '#,##0';
    } else if (quotation.deploymentType === 'OnPremise') {
      const maintainFee = (totalLicenseAmount * 20) / 100;
      const row = sheet.addRow([
        '',
        licenseStt,
        '(Tùy chọn) Phí bảo trì và nâng cấp hằng năm (tính từ năm thứ 2)',
        `- Bảo trì hệ thống phần mềm: cập nhật các bản vá lỗi, nâng cấp các phiên bản về firmware mới nếu có để đảm bảo hệ thống hoạt động ổn định.
- Hỗ trợ kỹ thuật từ xa trong các trường hợp xảy ra các vấn đề về vận hành hoặc kỹ thuật của hệ thống.
- Hỗ trợ đào tạo, hướng dẫn lại việc sử dụng phần mềm cho nhân sự mới tiếp nhận hệ thống của phía khách hàng.
- Hỗ trợ backup hoặc khôi phục dữ liệu nếu có yêu cầu.`,
        1,
        'CMC TS',
        '',
        'CMC TS',
        'Việt Nam',
        maintainFee,
        '',
        maintainFee,
        '',
        maintainFee,
        '',
      ]);

      row.getCell(10).numFmt = '#,##0';
      row.getCell(12).numFmt = '#,##0';
      row.getCell(13).numFmt = '#,##0';
      row.getCell(14).numFmt = '#,##0';
    }

    // Lấy index của hàng header này
    const headerRowIndex = licenseHeader.number;
    const firstRowIndex = firstHeader.number;

    // Giả sử bảng từ cột B -> O (2 -> 15)
    for (let col = 2; col <= 15; col++) {
      const cell = sheet.getRow(headerRowIndex).getCell(col);
      const cellFirst = sheet.getRow(firstRowIndex).getCell(col);

      cellFirst.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'B4C6E7' }, // xanh trung bình
      };

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '8EA9DB' }, // xanh trung bình
      };
      cell.font = { bold: true, size: 11, color: { argb: 'FF000000' } };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
    }

    // ============================
    // Mục B - Device
    // ============================
    sheet.addRow([]);
    const deviceHeader = sheet.addRow(['', 'B', 'Chi Phí Thiết Bị']);
    deviceHeader.font = { bold: true, size: 11 };
    deviceHeader.alignment = { horizontal: 'left' };
    sheet.mergeCells(`C${deviceHeader.number}:D${deviceHeader.number}`);

    let deviceStt = 1;
    for (const d of quotation.devices) {
      const row = sheet.addRow([
        '',
        deviceStt++,
        d.name,
        d.description,
        d.quantity,
        d.vendor,
        '',
        d.vendor,
        d.origin,
        d.unitPrice,
        '',
        d.unitPrice * d.quantity,
        d.priceRate,
        d.totalAmount * d.quantity,
        '',
      ]);

      row.getCell(10).numFmt = '#,##0';
      row.getCell(12).numFmt = '#,##0';
      row.getCell(13).numFmt = '#,##0';
      row.getCell(14).numFmt = '#,##0';

      // Nếu có imageUrl thì chèn ảnh
      if (d.fileId) {
        try {
          const fileDevice = await FileModel.findById(d.fileId); // 🔑 lấy theo từng d.fileId
          if (!fileDevice) {
            throw new Error('File not found');
          }
          const buffer = await getFileBuffer(fileDevice.fileKey);


          const base64 = buffer.toString('base64');

          const imageId = workbook.addImage({
            base64,
            extension: 'png',
          });

          const colIndex = 6;
          const rowIndex = sheet.lastRow!.number;

          // Điều chỉnh chiều rộng cột
          const col = sheet.getColumn(colIndex);
          const desiredColWidth = 150 / 7; // khoảng 7px ~ 1 unit ExcelJS
          if (!col.width || col.width < desiredColWidth) {
            col.width = desiredColWidth;
          }

          // Điều chỉnh chiều cao dòng
          const row = sheet.getRow(rowIndex);
          const desiredRowHeight = 250 * 0.75; // khoảng 0.75px ~ 1 unit height ExcelJS
          if (!row.height || row.height < desiredRowHeight) {
            row.height = desiredRowHeight;
          }

          const colR = Number(colIndex + 0.95);
          const rowR = Number(rowIndex - 1 + 0.14);

          // Chèn ảnh giữ kích thước cố định
          sheet.addImage(imageId, {
            tl: { col: colR, row: rowR },
            ext: { width: 150, height: 150 },
            editAs: 'absolute',
          });
        } catch (err) {
          console.error(`Không tải được ảnh từ ${d.fileId}:`, err);
        }
      }
    }

    //Chỉnh màu phần tiêu đề

    const deviceHeaderIndex = deviceHeader.number;

    // Giả sử bảng từ cột B -> O (2 -> 15)
    for (let col = 2; col <= 15; col++) {
      const cell = sheet.getRow(deviceHeaderIndex).getCell(col);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '8EA9DB' }, // xanh trung bình
      };
      cell.font = { bold: true, size: 11, color: { argb: 'FF000000' } };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
    }

    // ============================
    // Mục C - Server
    // ============================
    sheet.addRow([]);
    const serverHeader = sheet.addRow(['', 'C', 'Chi Phí Máy Chủ Và Máy Trạm']);
    serverHeader.font = { bold: true, size: 11 };
    serverHeader.alignment = { horizontal: 'left' };
    sheet.mergeCells(`C${serverHeader.number}:D${serverHeader.number}`);

    let serverStt = 1;
    for (const c of quotation.costServers) {
      if (c.unitPrice === 0 || c.totalAmount === 0) {
        sheet.addRow(['', serverStt++, c.name]);
      } else {
        const row = sheet.addRow([
          '',
          serverStt++,
          c.name,
          '',
          c.quantity,
          '',
          '',
          '',
          '',
          c.unitPrice,
          '',
          c.unitPrice * c.quantity,
          c.priceRate,
          c.totalAmount,
          '',
        ]);

        row.getCell(10).numFmt = '#,##0';
        row.getCell(12).numFmt = '#,##0';
        row.getCell(13).numFmt = '#,##0';
        row.getCell(14).numFmt = '#,##0';
      }

      // Nếu có imageUrl thì chèn ảnh
      if (c.fileId) {
        try {
          const fileServer = await FileModel.findById(c.fileId); // 🔑 lấy theo từng d.fileId
          if (!fileServer) {
            throw new Error('File not found');
          }
          const buffer = await getFileBuffer(fileServer.fileKey);


          const base64 = buffer.toString('base64');

          const imageId = workbook.addImage({
            base64,
            extension: 'png',
          });

          const colIndex = 6;
          const rowIndex = sheet.lastRow!.number;

          // Điều chỉnh chiều rộng cột
          const col = sheet.getColumn(colIndex);
          const desiredColWidth = 150 / 7; // khoảng 7px ~ 1 unit ExcelJS
          if (!col.width || col.width < desiredColWidth) {
            col.width = desiredColWidth;
          }

          // Điều chỉnh chiều cao dòng
          const row = sheet.getRow(rowIndex);
          const desiredRowHeight = 250 * 0.75; // khoảng 0.75px ~ 1 unit height ExcelJS
          if (!row.height || row.height < desiredRowHeight) {
            row.height = desiredRowHeight;
          }

          const colR = Number(colIndex + 0.95);
          const rowR = Number(rowIndex - 1 + 0.14);

          // Chèn ảnh giữ kích thước cố định
          sheet.addImage(imageId, {
            tl: { col: colR, row: rowR },
            ext: { width: 150, height: 150 },
            editAs: 'absolute',
          });
        } catch (err) {
          console.error(`Không tải được ảnh từ ${c.fileId}:`, err);
        }
      }
    }

    const serverHeaderIndex = serverHeader.number;

    // Giả sử bảng từ cột B -> O (2 -> 15)
    for (let col = 2; col <= 15; col++) {
      const cell = sheet.getRow(serverHeaderIndex).getCell(col);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '8EA9DB' }, // xanh trung bình
      };
      cell.font = { bold: true, size: 11, color: { argb: 'FF000000' } };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
    }

    // ============================
    // Mục D - Chi phí triển khai
    // ============================
    sheet.addRow([]);

    const deploymentHeader = sheet.addRow(['', 'D', 'Chi Phí Triển Khai']);
    deploymentHeader.font = { bold: true, size: 11 };
    deploymentHeader.alignment = { horizontal: 'left' };
    sheet.mergeCells(`C${deploymentHeader.number}:D${deploymentHeader.number}`);

    // Header tô màu
    for (let col = 2; col <= 15; col++) {
      const cell = sheet.getRow(deploymentHeader.number).getCell(col);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '8EA9DB' },
      };
      cell.font = { bold: true, size: 11, color: { argb: 'FF000000' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    }

    // ============================
    // Hardcode 3 hàng dữ liệu
    // ============================
    let stt = 1;

    // Hàng 1
    sheet.addRow([
      '',
      stt++,
      'Chi phí cài đặt phần mềm',
      "- Cài đặt và cấu hình hệ thống phần mềm.\n- Thiết lập máy chủ hoặc môi trường triển khai.\n- Kiểm tra kết nối và phân quyền người dùng.\n- Đảm bảo hệ thống hoạt động ổn định trước khi bàn giao.",
      1, // quantity
      '',
      '',
      '',
      '',
      5000000, // unit price
      '',
      5000000, // subtotal
      '', // price rate (%)
      5000000, // total amount (sau VAT)
      '',
    ]);

    // Hàng 2
    sheet.addRow([
      '',
      stt++,
      'Chi phí đào tạo',
      "- Hướng dẫn vận hành và sử dụng hệ thống.\n- Đào tạo nhập liệu, tra cứu và xuất báo cáo.\n- Tổ chức đào tạo trực tuyến hoặc trực tiếp theo yêu cầu khách hàng.",
      2,
      '',
      '',
      '',
      '',
      5000000,
      '',
      5000000,
      '',
      5000000,
      '',
    ]);

    // Hàng 3
    sheet.addRow([
      '',
      stt++,
      'Chi phí vật tư phụ và nhân công thi công lắp đặt',
      "- Bao gồm dây cáp, đầu nối, ống luồn, phụ kiện cố định thiết bị.\n- Nhân công thực hiện lắp đặt thiết bị tại hiện trường.\n- Chi phí phụ thuộc vào địa điểm và khối lượng công việc cụ thể.",
      1,
      '',
      '',
      '',
      '',
      quotation.materialCosts,
      '',
      quotation.materialCosts,
      '',
      quotation.materialCosts,
      '',
    ]);

    // Định dạng số cho 3 hàng
    const lastRowNum = sheet.lastRow!.number;
    for (let i = deploymentHeader.number + 1; i <= lastRowNum; i++) {
      const row = sheet.getRow(i);
      row.getCell(10).numFmt = '#,##0';
      row.getCell(12).numFmt = '#,##0';
      row.getCell(13).numFmt = '#,##0';
      row.getCell(14).numFmt = '#,##0';
    }

    // ============================
    // Border & style cho toàn bảng
    // ============================
    const totalRows = sheet.rowCount;
    const totalCols = sheet.columnCount;

    for (let rowIndex = 18; rowIndex <= totalRows; rowIndex++) {
      const r = sheet.getRow(rowIndex);
      for (let colIndex = 1; colIndex <= totalCols; colIndex++) {
        const cell = r.getCell(colIndex);
        if (colIndex === 1 && (!cell.value || cell.value === '')) continue;

        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal:
            rowIndex === 18 // hàng header
              ? 'center'
              : colIndex === 3 || colIndex === 4 || colIndex === 15
                ? 'left'
                : 'center',
          wrapText: true,
        };
      }
    }

    // ============================
    // Tổng hợp cuối
    // ============================
    sheet.addRow([]);

    const summaryRows = [
      {
        label: 'CHI PHÍ TRIỂN KHAI',
        valueCol: [12, 14],
        value: quotation.summary.deploymentCost,
        merge: (rowNumber: number) => `B${rowNumber}:K${rowNumber}`,
        height: 30,
        note: 'Chi phí tạm tính, có thể phát sinh thay đổi trong quá trình triển khai',
      },
      {
        label: 'TỔNG GIÁ TRỊ THÀNH TIỀN CHƯA BAO GỒM VAT',
        valueCol: 12,
        value: quotation.summary.temporaryTotal,
        merge: (rowNumber: number) => `B${rowNumber}:K${rowNumber}`,
        height: 30,
      },
      {
        label: 'THUẾ VAT 8%',
        valueCol: 13,
        value: quotation.summary.vatPrices,
        merge: (rowNumber: number) => `B${rowNumber}:L${rowNumber}`,
        height: 30,
      },
      {
        label: 'TỔNG GIÁ TRỊ ĐÃ BAO GỒM THUẾ',
        valueCol: 14,
        value: quotation.summary.grandTotal,
        merge: (rowNumber: number) => `B${rowNumber}:M${rowNumber}`,
        height: 40,
        note: 'Chi phí ước tính, thực tế chênh lệch 10%-20%',
      },
    ];

    summaryRows.forEach((item) => {
      const row = sheet.addRow([]);

      // Label
      row.getCell(2).value = item.label;
      row.getCell(2).font = { bold: true, size: 11 };
      row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };

      // Value (hỗ trợ nhiều cột)
      const cols = Array.isArray(item.valueCol)
        ? item.valueCol
        : [item.valueCol];
      cols.forEach((col) => {
        row.getCell(col).value = item.value;
        row.getCell(col).font = { bold: true, size: 11 };
        row.getCell(col).alignment = {
          horizontal:
            col === 12 || col === 13 || col === 14 ? 'center' : 'left',
          vertical: 'middle',
        };
      });

      if (item.label === 'CHI PHÍ TRIỂN KHAI' && item.note !== undefined) {
        row.getCell(15).value = item.note;
        row.getCell(15).font = { italic: true, size: 11 };
        row.getCell(15).alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };
      }

      if (
        item.label === 'TỔNG GIÁ TRỊ ĐÃ BAO GỒM THUẾ' &&
        item.note !== undefined
      ) {
        row.getCell(15).value = item.note;
        row.getCell(15).font = { italic: true, size: 11 };
        row.getCell(15).alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };
      }

      if (typeof item.value === 'number') {
        row.getCell(12).numFmt = '#,##0';
        row.getCell(13).numFmt = '#,##0';
        row.getCell(14).numFmt = '#,##0';
      }

      // Merge vùng label
      sheet.mergeCells(item.merge(row.number));

      // Border cho toàn bộ hàng
      const totalCols = sheet.columnCount;
      for (let colIndex = 2; colIndex <= totalCols; colIndex++) {
        const cell = row.getCell(colIndex);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }

      //Nếu có height thì ưu tiên theo quy ước
      if (item.height) {
        row.height = item.height;
      }
    });

    // ============================
    // Ghi chú
    // ============================
    sheet.addRow([]);

    // Hàng tiêu đề "Ghi chú"
    let rows = sheet.addRow([]);
    let cells = rows.getCell(3);
    cells.value = 'Ghi chú';
    sheet.mergeCells(`C${rows.number}:N${rows.number}`);

    // Style cho tiêu đề
    cells.font = {
      bold: true,
      size: 12,
      color: { argb: 'FFFFFFFF' },
    };
    cells.alignment = { horizontal: 'center', vertical: 'middle' };
    cells.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' }, // xanh header
    };
    cells.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // Hàng nội dung
    rows = sheet.addRow([]);
    let noteCell = rows.getCell(3);
    noteCell.value =
      '- Giá vật tư tạm tính, có thể thay đổi lên xuống theo Giá thực tế khi nhập hàng\n' +
      '- Giá trên đã bao gồm thuế VAT 8%\n' +
      '- Báo giá có giá trị trong vòng 30 ngày';

    sheet.mergeCells(`C${rows.number}:N${rows.number}`);
    rows.height = 60; // tăng chiều cao cho đủ 3 dòng

    // Style cho nội dung
    noteCell.font = { size: 11, color: { argb: 'FF000000' } };
    noteCell.alignment = {
      horizontal: 'center',
      vertical: 'top',
      wrapText: true,
    };
    noteCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // ============================
    // Thông tin liên hệ
    // ============================
    sheet.addRow([]);

    //Liên hệ
    let startRow = sheet.rowCount + 1;

    // Tạo 4 hàng trống liên tiếp
    for (let i = 0; i < 4; i++) {
      sheet.addRow([]);
    }

    // Merge từ C đến N, gộp 4 hàng liên tiếp
    sheet.mergeCells(`C${startRow}:N${startRow + 3}`);

    let mergedCell = sheet.getCell(`C${startRow}`);
    mergedCell.value = {
      richText: [
        {
          text: 'Nếu Quý khách có bất kỳ câu hỏi nào liên quan đến báo giá này vui lòng liên hệ thông tin bên dưới:\n',
          font: { bold: true, size: 11 },
        },
        { text: 'Liên hệ:\n', font: { size: 11 } },
        { text: 'SĐT:\n', font: { size: 11 } },
        { text: 'Email:', font: { size: 11 } },
      ],
    };

    // Style chung cho alignment và border
    mergedCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    mergedCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    //Lời cảm ơn
    sheet.addRow([]);
    let thankRow = sheet.addRow([]);
    thankRow.getCell(3).value =
      'CHÂN THÀNH CẢM ƠN SỰ TIN TƯỞNG HỢP TÁC CỦA QUÝ KHÁCH DÀNH CHO CHÚNG TÔI';
    sheet.mergeCells(`C${thankRow.number}:N${thankRow.number}`);

    // Style
    thankRow.getCell(3).alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    thankRow.getCell(3).font = { size: 11, bold: true };

    thankRow.getCell(3).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    workbook.eachSheet((sheet) => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          // Giữ nguyên các thuộc tính khác, chỉ đổi font name
          const oldFont = cell.font || {};
          cell.font = { ...oldFont, name: 'Times New Roman' };
        });
      });
    });

    // Trả về buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
