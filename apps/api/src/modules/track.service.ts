import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { EntityNotFoundException } from '../common/exceptions/not-found.exception';
import { UpdateTrackDto } from '../dto/update-track.dto';

@Injectable()
export class TrackService {
  private readonly logger = new Logger(TrackService.name);

  constructor(private readonly prisma: PrismaService) {}

  async updateTrack(id: bigint, data: UpdateTrackDto) {
    const track = await this.prisma.client.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new EntityNotFoundException('Track', id.toString());
    }

    const updateData: {
      bpm?: number | null;
      keyText?: string | null;
    } = {};

    if (data.bpm !== undefined) {
      updateData.bpm = data.bpm;
    }

    if (data.keyText !== undefined) {
      updateData.keyText = data.keyText;
    }

    const updated = await this.prisma.client.track.update({
      where: { id },
      data: updateData,
      include: {
        release: {
          include: {
            artist: true,
          },
        },
        links: {
          include: {
            source: true,
          },
        },
      },
    });

    this.logger.log(`Track ${id} updated: bpm=${data.bpm}, keyText=${data.keyText}`);

    return updated;
  }
}
