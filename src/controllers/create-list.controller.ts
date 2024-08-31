import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common';
import { ListMeasuresService } from '../services/create-list-measures.service';
import { MeasureType } from '../dto/create-measure.dto';

@Controller('/:customer_code/list')
export class ListController {
  constructor(private readonly listMeasuresService: ListMeasuresService) {}

  @Get()
  async list(
    @Param('customer_code') customer_code: string,
    @Query('measure_type') measure_type?: string,
  ) {
    if (measure_type && !MeasureType.safeParse(measure_type.toUpperCase()).success) {
      throw new BadRequestException({
        error_code: 'INVALID_TYPE',
        error_description: 'Tipo de medição não permitida',
      });
    }

    const parsedMeasureType = measure_type ? MeasureType.parse(measure_type.toUpperCase()) : undefined;
    return this.listMeasuresService.list(customer_code, parsedMeasureType);
  }
}
