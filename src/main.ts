import { NestFactory } from '@nestjs/core';
import { MeasureModule } from './measure.module';

async function bootstrap() {
  const app = await NestFactory.create(MeasureModule, {
    logger: false,
  });
  await app.listen(3000);
}
bootstrap();
