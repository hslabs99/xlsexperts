import 'server-only'

import { readFile } from 'fs/promises'
import path from 'path'
import { PUBLISHED_HERO_CLIENTS } from '@/data/hero-clients.generated'
import { PUBLISHED_HERO_PROJECTS } from '@/data/hero-projects.generated'
import { getIsLocalDev } from '@/lib/market-server'
import { parseGeneratedPublishedJson } from '@/lib/write-generated-file'
import { withTimeout } from '@/lib/with-timeout'
import {
  DEFAULT_HERO_CLIENT_FADE,
  DEFAULT_HERO_CLIENT_HEADING,
  DEFAULT_HERO_PROJECTS_INTRO,
  normalizeHeroClientFade,
  normalizeHeroClientHeading,
  normalizeHeroClients,
  normalizeHeroProjects,
  normalizeHeroProjectsIntro,
  type HeroTrustContent,
} from '@/lib/hero-trust'

const HERO_CLIENTS_FILE = path.join('data', 'hero-clients.generated.ts')

async function readPublishedHeroClients(): Promise<
  Pick<HeroTrustContent, 'clients' | 'fade' | 'heading'>
> {
  try {
    const fileText = await readFile(
      path.join(process.cwd(), HERO_CLIENTS_FILE),
      'utf8'
    )
    const parsed = parseGeneratedPublishedJson(fileText)
    if (parsed) {
      return {
        clients: normalizeHeroClients(parsed),
        fade: normalizeHeroClientFade(parsed),
        heading: normalizeHeroClientHeading(parsed),
      }
    }
  } catch {
    // Fall through to the bundled module.
  }
  return {
    clients: normalizeHeroClients(PUBLISHED_HERO_CLIENTS),
    fade: normalizeHeroClientFade(PUBLISHED_HERO_CLIENTS),
    heading: normalizeHeroClientHeading(PUBLISHED_HERO_CLIENTS),
  }
}

export async function getPublishedHeroTrust(): Promise<HeroTrustContent> {
  const [{ clients, fade, heading }, projects, projectsIntro] =
    await Promise.all([
      readPublishedHeroClients(),
      Promise.resolve(normalizeHeroProjects(PUBLISHED_HERO_PROJECTS)),
      Promise.resolve(normalizeHeroProjectsIntro(PUBLISHED_HERO_PROJECTS)),
    ])
  return { clients, projects, fade, heading, projectsIntro }
}

/**
 * Public homepage hero tiles.
 * Client logos always come from the published file (shuffled on Publish).
 * Localhost may use a longer Firebase draft if Publish has not written yet.
 */
export async function getHeroTrustContent(): Promise<HeroTrustContent> {
  const published = await getPublishedHeroTrust()
  if (await getIsLocalDev()) {
    try {
      const [{ fetchHeroClientsDraft }, { fetchHeroProjectsDraft }] =
        await Promise.all([
          import('@/lib/hero-clients-db'),
          import('@/lib/hero-projects-db'),
        ])
      const [clientsDraft, projectsDraft] = await Promise.all([
        withTimeout(fetchHeroClientsDraft(), 15_000, 'fetchHeroClientsDraft'),
        withTimeout(fetchHeroProjectsDraft(), 15_000, 'fetchHeroProjectsDraft'),
      ])
      return {
        clients:
          clientsDraft.clients.length > published.clients.length
            ? clientsDraft.clients
            : published.clients,
        fade: clientsDraft.fade ?? published.fade ?? DEFAULT_HERO_CLIENT_FADE,
        heading:
          clientsDraft.heading ||
          published.heading ||
          DEFAULT_HERO_CLIENT_HEADING,
        projects:
          projectsDraft.projects.length > 0
            ? projectsDraft.projects
            : published.projects,
        projectsIntro:
          projectsDraft.intro ||
          published.projectsIntro ||
          DEFAULT_HERO_PROJECTS_INTRO,
      }
    } catch (error) {
      console.error(
        '[hero-trust] localhost CMS draft unavailable, using published copy',
        error instanceof Error ? error.message : error
      )
    }
  }
  return published
}
