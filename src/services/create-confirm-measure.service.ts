import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmMeasureDto } from '../dto/confirm-measure.dto';

@Injectable()
export class ConfirmMeasureService {
  constructor(private prisma: PrismaService) {}

  async confirm(confirmMeasureDto: ConfirmMeasureDto) {
    const { measure_uuid, confirmed_value } = confirmMeasureDto;

    const measureValue = await this.findMeasureValue(measure_uuid);

    this.validateMeasureValue(measureValue);

    await this.updateMeasureValue(measure_uuid, confirmed_value);

    return { success: true };
  }

  private async findMeasureValue(measure_uuid: string) {
    const measureValue = await this.prisma.measurementValue.findUnique({
      where: { measure_uuid },
    });

    if (!measureValue) {
      throw new NotFoundException({
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'Leitura não encontrada',
      });
    }

    return measureValue;
  }

  private validateMeasureValue(measureValue) {
    if (measureValue.confirmed) {
      throw new ConflictException({
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'Leitura já confirmada',
      });
    }
  }

  private async updateMeasureValue(measure_uuid: string, confirmed_value: number) {
    await this.prisma.measurementValue.update({
      where: { measure_uuid },
      data: {
        confirmed_value,
        confirmed: true,
      },
    });
  }
}
