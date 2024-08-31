import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeasureDto } from '../dto/create-measure.dto';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

interface GeminiData {
  image_url: string;
  measure_value: number;
  measure_uuid: string;
}

@Injectable()
export class UploadMeasureService {
  private readonly geminiApiKey: string;

  constructor(private prisma: PrismaService) {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    if (!this.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not defined in the environment variables');
    }
  }

  async create(createMeasureDto: CreateMeasureDto) {
    await this.checkForExistingMeasure(createMeasureDto);

    const geminiData = await this.fetchGeminiData(createMeasureDto.image);
    
    if (!this.isGeminiDataValid(geminiData)) {
      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description: 'Dados inválidos recebidos da API Gemini',
      });
    }

    const measurement = await this.createMeasurement(createMeasureDto, geminiData);
    await this.createMeasurementValue(measurement.id, geminiData);

    return {
      image_url: geminiData.image_url,
      measure_value: geminiData.measure_value,
      measure_uuid: measurement.id,
    };
  }

  private async checkForExistingMeasure(createMeasureDto: CreateMeasureDto) {
    const { customer_code, measure_datetime, measure_type } = createMeasureDto;
    const startOfMonth = new Date(new Date(measure_datetime).getFullYear(), new Date(measure_datetime).getMonth(), 1);
    const endOfMonth = new Date(new Date(measure_datetime).getFullYear(), new Date(measure_datetime).getMonth() + 1, 0);

    const existingMeasure = await this.prisma.measurement.findFirst({
      where: {
        customer_code,
        measure_type,
        measure_datetime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    if (existingMeasure) {
      throw new ConflictException({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada',
      });
    }
  }

  private async fetchGeminiData(imageBase64: string): Promise<GeminiData> {
    try {
      const response = await axios.post(
        'https://ai.google.dev/gemini-api/vision',
        { image_base64: imageBase64 },
        {
          headers: {
            Authorization: `Bearer ${this.geminiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data as GeminiData;
    } catch {
      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description: 'Erro na comunicação com a API Gemini',
      });
    }
  }

  private isGeminiDataValid(data: GeminiData): boolean {
    return (
      !!data && 
      typeof data.image_url === 'string' && 
      typeof data.measure_value === 'number' && 
      typeof data.measure_uuid === 'string'
    );
  }
  

  private async createMeasurement(createMeasureDto: CreateMeasureDto, geminiData: GeminiData) {
    return this.prisma.measurement.create({
      data: {
        id: uuidv4(),
        customer_code: createMeasureDto.customer_code,
        measure_datetime: new Date(createMeasureDto.measure_datetime),
        measure_type: createMeasureDto.measure_type,
        image: geminiData.image_url,
      },
    });
  }

  private async createMeasurementValue(measurementId: string, geminiData: GeminiData) {
    await this.prisma.measurementValue.create({
      data: {
        id: uuidv4(),
        measure_uuid: geminiData.measure_uuid,
        confirmed_value: geminiData.measure_value,
        measurementId: measurementId,
      },
    });
  }
}
