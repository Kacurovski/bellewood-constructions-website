import { projectPhotos } from './photoLibrary'

/** Additive photo studies. Only photographs from the approved project folders. */
export const wilstonStory = {
  exterior: projectPhotos.wilston[9],
  chapters: [
    { label: 'Living', title: 'Space to come together.', photo: projectPhotos.wilston[7], description: 'Timber underfoot, a generous kitchen and room for the whole day to unfold.' },
    { label: 'Terrace', title: 'Open the doors. Stay a while.', photo: projectPhotos.wilston[2], description: 'A covered terrace brings the dining table, a quiet seat and the outdoors together.' },
    { label: 'Garden', title: 'A little more breathing room.', photo: projectPhotos.wilston[0], description: 'The house opens to a lawn, a pool and a timber deck at the back.' },
  ],
}

export const everydaySpaces = [
  { title: 'Gather', project: 'Camp Hill', slug: 'camp-hill', photo: projectPhotos['camp-hill'][3], position: '50% 50%', description: 'A timber ceiling, deep blue cabinetry and a generous island. A kitchen with warmth at its centre.' },
  { title: 'Retreat', project: 'Auchenflower', slug: 'auchenflower', photo: projectPhotos.auchenflower[6], position: '62% 50%', description: 'A window seat, soft light and joinery fitted into the room. Space for a slower start.' },
  { title: 'Arrive', project: 'Yeronga', slug: 'yeronga', photo: projectPhotos.yeronga[5], position: '50% 50%', description: 'Timber stairs lead to the verandah and front doors. A welcome shaped by the character of the house.' },
  { title: 'Step outside', project: 'Bardon', slug: 'bardon', photo: projectPhotos.bardon[6], position: '50% 50%', description: 'A long pool, timber decking and a backdrop of trees. An outdoor room with space to settle in.' },
]
