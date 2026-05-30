import { Cat, HomeTask } from '@/types/models';

const now = '2026-05-30T00:00:00.000Z';

export const mockCats: Cat[] = [
  {
    id: 'cat-rio',
    name: 'りお',
    photoUrl: null,
    sex: 'male',
    birthDate: '2019-04-12',
    birthDateType: 'estimated',
    adoptionDate: '2020-06-01',
    adoptionDateType: 'exact',
    breed: null,
    breedType: 'mixed',
    coatColorPattern: 'キジ白',
    createdAt: now,
    updatedAt: now,
  },
];

export const mockTasks: HomeTask[] = [
  {
    id: 'task-rio-vaccine',
    catId: 'cat-rio',
    type: 'vaccine',
    title: 'ワクチン予定が近づいています',
    dueDate: '2026-06-05',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  },
];
