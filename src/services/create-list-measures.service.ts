import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeasureType } from '../dto/create-measure.dto';

@Injectable()
export class ListMeasuresService {
  constructor(private prisma: PrismaService) {}

  async list(customer_code: string, measure_type?: MeasureType) {
    const measurements = await this.findMeasurements(customer_code, measure_type);

    if (measurements.length === 0) {
      throw new NotFoundException({
        error_code: 'MEASURES_NOT_FOUND',
        error_description: 'Nenhuma leitura encontrada',
      });
    }

    return this.formatMeasurements(measurements);
  }

  private async findMeasurements(customer_code: string, measure_type?: MeasureType) {
    return this.prisma.measurement.findMany({
      where: {
        customer_code,
        ...(measure_type && { measure_type }),
      },
      include: {
        measurementValues: true,
      },
    });
  }

  private formatMeasurements(measurements) {
    return measurements.map(measurement => ({
      measure_uuid: measurement.id,
      measure_datetime: measurement.measure_datetime,
      measure_type: measurement.measure_type,
      has_confirmed: this.hasConfirmed(measurement),
      image_url: measurement.image,
    }));
  }

  private hasConfirmed(measurement) {
    return measurement.measurementValues.length > 0 
      ? measurement.measurementValues[0].confirmed 
      : false;
  }
}
