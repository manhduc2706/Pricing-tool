import {
  CostServerRepository,
  CreateCostServer,
} from "../repositories/CostServer.repository";
import { ICostServer } from "../models/CostServer.model";

export class CostServerService {
  private repository: CostServerRepository;

  constructor() {
    this.repository = new CostServerRepository();
  }

  // Lấy tất cả các CostServer
  async getAll(): Promise<ICostServer[]> {
    return await this.repository.getAll();
  }

  // Lấy một CostServer theo ID
  async getById(id: string): Promise<ICostServer | null> {
    return await this.repository.getById(id);
  }

  // Tạo mới một CostServer
  async create(data: CreateCostServer): Promise<ICostServer> {
    if (
      data.name === undefined ||
      data.unitPrice === undefined ||
      data.vatRate === undefined
    ) {
      throw new Error("Name, unitPrice, and vatRate are required.");
    }
    return await this.repository.create(data);
  }

  // Cập nhật một CostServer theo ID
  async update(
    id: string,
    data: Partial<ICostServer>
  ): Promise<ICostServer | null> {
    if (!data.name && !data.unitPrice && !data.vatRate) {
      throw new Error(
        "At least one field (name, unitPrice, vatRate) must be provided."
      );
    }
    return await this.repository.update(id, data);
  }

  // Xóa một CostServer theo ID
  async delete(id: string): Promise<ICostServer | null> {
    return await this.repository.delete(id);
  }
}
