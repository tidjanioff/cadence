import { ApiError, apiRequest, apiTextRequest } from './client'

export interface EligibilityResult {
  eligible: boolean
  message: string
}

export interface CourseReview {
  sigleCours: string
  nomProfesseur: string | null
  noteDifficulte: number
  noteChargeTravail: number
  commentaire: string
  valide: boolean
}

export interface ReviewInput {
  sigleCours: string
  professeur: string
  noteDifficulte: number
  noteCharge: number
  commentaire: string
}

export async function checkEligibility(
  idCours: string,
  listeCours: string[],
  cycle: number,
  signal?: AbortSignal,
): Promise<EligibilityResult> {
  const message = await apiTextRequest('/cours/eligibilitenew', {
    method: 'POST',
    body: JSON.stringify({ idCours, listeCours, cycle }),
    signal,
  })

  return {
    eligible: message.toLocaleLowerCase('fr').startsWith('vous êtes éligible'),
    message,
  }
}

export function getCourseDifficulty(sigle: string, signal?: AbortSignal): Promise<string> {
  return apiTextRequest('/cours/difficulte', {
    method: 'POST',
    body: JSON.stringify({ sigle }),
    signal,
  })
}

export function getCoursePopularity(sigle: string, signal?: AbortSignal): Promise<string> {
  return apiTextRequest('/cours/popularite', {
    method: 'POST',
    body: JSON.stringify({ sigle }),
    signal,
  })
}

export async function getCourseReviews(sigle: string, signal?: AbortSignal): Promise<CourseReview[]> {
  try {
    return await apiRequest<CourseReview[]>(`/cours/${encodeURIComponent(sigle)}/avis`, { signal })
  } catch (error) {
    // The backend uses 400 to represent a valid course with no reviews.
    if (error instanceof ApiError && error.status === 400) return []
    throw error
  }
}

export function createReview(review: ReviewInput): Promise<string> {
  return apiTextRequest('/avis', {
    method: 'POST',
    body: JSON.stringify(review),
  })
}
