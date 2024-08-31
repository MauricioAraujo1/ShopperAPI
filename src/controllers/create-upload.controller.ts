import { Controller, Post, Body, BadRequestException, ConflictException } from '@nestjs/common';
import { UploadMeasureService } from '../services/create-upload-measure.service';
import { CreateMeasureDto } from '../dto/create-measure.dto';

@Controller('/upload')
export class UploadController {
  constructor(private readonly uploadMeasureService: UploadMeasureService) {}

  @Post()
  async upload(@Body() body: unknown) {
    const parsedBody = this.parseBody(body);

    try {
      const createdMeasure = await this.uploadMeasureService.create(parsedBody);

      return {
        message: 'Operação realizada com sucesso',
        image_url: createdMeasure.image_url,
        measure_value: createdMeasure.measure_value,
        measure_uuid: createdMeasure.measure_uuid,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException({
          error_code: 'DOUBLE_REPORT',
          error_description: 'Leitura do mês já realizada',
        });
      }

      if (error instanceof BadRequestException) {
        throw new BadRequestException({
          error_code: 'INVALID_DATA',
          error_description: error.message,
        });
      }

      throw error; 
    }
  }

  private parseBody(body: unknown): CreateMeasureDto {
    const parsedBody = CreateMeasureDto.safeParse(body);

    if (!parsedBody.success) {
      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description: this.formatValidationErrors(parsedBody.error),
      });
    }

    return parsedBody.data;
  }

  private formatValidationErrors(errors: any): string {
    return errors.errors.map(err => err.message).join(', ');
  }
}
