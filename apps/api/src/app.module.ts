import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './modules/prisma.service';
import { OpenSearchService } from './modules/opensearch.service';
import { AuthService } from './modules/auth.service';
import { ArtistService } from './modules/artist.service';
import { SearchService } from './modules/search.service';
import { TrackService } from './modules/track.service';
import { ArtistController } from './routes/artist.controller';
import { SearchController } from './routes/search.controller';
import { AuthController } from './routes/auth.controller';
import { AdminController } from './routes/admin.controller';
import { AnalyticsController } from './routes/analytics.controller';
import { AdminGuard } from './security/admin.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  controllers: [
    AppController,
    ArtistController,
    SearchController,
    AuthController,
    AdminController,
    AnalyticsController,
  ],
  providers: [
    PrismaService,
    OpenSearchService,
    AuthService,
    ArtistService,
    SearchService,
    TrackService,
    AdminGuard,
    AppService,
  ],
  exports: [AuthService],
})
export class AppModule {}
