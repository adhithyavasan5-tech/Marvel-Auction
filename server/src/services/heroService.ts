
import { Hero } from '../types/index.js';
import { FALLBACK_HEROES } from '../data/fallbackHeroes.js';

class HeroService {
  private cachedHeroes: Hero[] = [...FALLBACK_HEROES];
  private source: 'api' | 'fallback' = 'fallback';

  public async initialize(): Promise<void> {
    // Use only the manually maintained local Marvel catalogue.
    this.cachedHeroes = [...FALLBACK_HEROES];
    this.source = 'fallback';
    console.log(
      `[HeroService] Loaded ${this.cachedHeroes.length} local heroes. Live API disabled.`
    );
  }

  public getCatalogueSource(): 'api' | 'fallback' {
    return this.source;
  }

  public async fetchAndNormalize(): Promise<Hero[]> {
    // Do not fetch external character data or images.
    this.cachedHeroes = [...FALLBACK_HEROES];
    this.source = 'fallback';
    return this.cachedHeroes;
  }

  public getHeroes(options?: {
    publisher?: string;
    mode?: 'marvel' | 'all';
    limit?: number;
  }): Hero[] {
    let list = [...this.cachedHeroes];

    if (options?.mode === 'marvel') {
      list = list.filter(
        (hero) =>
          hero.publisher?.toLowerCase().includes('marvel')
      );
    } else if (
      options?.publisher &&
      options.publisher !== 'All'
    ) {
      list = list.filter((hero) =>
        hero.publisher
          ?.toLowerCase()
          .includes(options.publisher!.toLowerCase())
      );
    }

    if (options?.limit && options.limit > 0) {
      const sorted = [...list].sort(
        (a, b) =>
          (Number(a.externalId) % 17) -
          (Number(b.externalId) % 17)
      );

      return sorted.slice(0, options.limit);
    }

    return list;
  }
}

export const heroService = new HeroService();
