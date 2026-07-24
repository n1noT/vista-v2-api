/**
 * Thin HTTP wrapper around football-data.org's v4 API. This is deliberately
 * the only file in the app that knows the external API's base URL/auth
 * header — per Architecture_globale.md, the Angular front never talks to
 * football-data.org directly, and neither does anything else server-side;
 * everything goes through here.
 *
 * Free-tier accounts are rate-limited to 10 req/min. FootballSyncService
 * only calls `getStandings` once per league per run (5 total), so no
 * throttling/backoff is implemented here yet — add it if more calls per run
 * are ever needed.
 */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { FootballDataStandingsResponse } from './types/football-data.types';

@Injectable()
export class FootballDataClient {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  isConfigured(): boolean {
    return !!this.config.get<string>('FOOTBALL_DATA_API_KEY');
  }

  async getStandings(
    competitionCode: string,
  ): Promise<FootballDataStandingsResponse> {
    const baseUrl = this.config.get<string>('FOOTBALL_DATA_BASE_URL');
    const apiKey = this.config.get<string>('FOOTBALL_DATA_API_KEY');

    const response = await firstValueFrom(
      this.http.get<FootballDataStandingsResponse>(
        `${baseUrl}/competitions/${competitionCode}/standings`,
        { headers: { 'X-Auth-Token': apiKey } },
      ),
    );

    return response.data;
  }
}
