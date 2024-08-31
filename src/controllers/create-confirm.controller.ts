import { Controller, Patch, Body, BadRequestException } from '@nestjs/common';
import { ConfirmMeasureService } from '../services/create-confirm-measure.service';
import { ConfirmMeasureDto } from '../dto/confirm-measure.dto';

@Controller('/confirm')
export class ConfirmController {
  constructor(private readonly confirmMeasureService: ConfirmMeasureService) {}

  @Patch()
  async handle(@Body() body: unknown) {
    const parsedBody = ConfirmMeasureDto.safeParse(body);

    if (!parsedBody.success) {
      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description: parsedBody.error.errors.map(err => err.message).join(', '),
      });
    }

    return this.confirmMeasureService.confirm(parsedBody.data);
  }
}
