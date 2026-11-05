import { projectPhotos } from './photoLibrary'

/** Additive photo studies. Only photographs from the approved project folders. */
export const wilstonStory = {
  exterior: projectPhotos.wilston[9],
  chapters: [
    { label: 'Living', title: 'Kitchen, dining and living.', photo: projectPhotos.wilston[7], description: 'A shared living space with timber floors, a long kitchen island and windows overlooking the garden.' },
    { label: 'Terrace', title: 'Dining outside, under cover.', photo: projectPhotos.wilston[2], description: 'Sliding doors open onto a sheltered terrace with space for a dining table and seating.' },
    { label: 'Garden', title: 'The garden and pool.', photo: projectPhotos.wilston[0], description: 'The house opens to a lawn, a pool and a timber deck at the back.' },
  ],
}

export const everydaySpaces = [
  { title: 'Gather', project: 'Camp Hill', slug: 'camp-hill', photo: projectPhotos['camp-hill'][3], position: '50% 50%', description: 'A timber ceiling and deep blue cabinetry frame the kitchen island.' },
  { title: 'Retreat', project: 'Auchenflower', slug: 'auchenflower', photo: projectPhotos.auchenflower[6], position: '62% 50%', description: 'A window seat with fitted cabinetry and natural light.' },
  { title: 'Arrive', project: 'Yeronga', slug: 'yeronga', photo: projectPhotos.yeronga[5], position: '50% 50%', description: 'Timber stairs lead to the sheltered verandah and front doors.' },
  { title: 'Step outside', project: 'Bardon', slug: 'bardon', photo: projectPhotos.bardon[6], position: '50% 50%', description: 'Timber decking beside the pool, with established trees around the house.' },
]
