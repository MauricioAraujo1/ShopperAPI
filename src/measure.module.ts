import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UploadController } from './controllers/create-upload.controller';
import { ConfirmController } from './controllers/create-confirm.controller';
import { ListController } from './controllers/create-list.controller';
import { UploadMeasureService } from './services/create-upload-measure.service';
import { ConfirmMeasureService } from './services/create-confirm-measure.service';
import { ListMeasuresService } from './services/create-list-measures.service';

@Module({
  imports: [], 
  controllers: [
    UploadController,
    ConfirmController,
    ListController
  ],
  providers: [
    PrismaService,
    UploadMeasureService,
    ConfirmMeasureService,
    ListMeasuresService
  ],
  exports: [
    PrismaService 
  ]
})
export class MeasureModule {}
