import { Test, TestingModule } from '@nestjs/testing';
import { SubjectController } from './subject.controller';
import { SubjectService } from './subject.service';
import { Role } from '@prisma/client';

const mockSubjectService = {
  getByBranch: jest.fn(),
  getByUserBranch: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockSubjects = [
  { id: 'sub-1', name: 'Mathematics', branchId: 'branch-1' },
  { id: 'sub-2', name: 'Physics', branchId: 'branch-1' },
];

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  role: Role.STUDENT,
  branchId: 'branch-1',
};

describe('SubjectController', () => {
  let controller: SubjectController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectController],
      providers: [{ provide: SubjectService, useValue: mockSubjectService }],
    }).compile();

    controller = module.get<SubjectController>(SubjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMySubjects', () => {
    it('should return subjects for user branch', async () => {
      mockSubjectService.getByUserBranch.mockResolvedValue(mockSubjects);

      const result = await controller.getMySubjects(mockUser as any);

      expect(result).toEqual(mockSubjects);
      expect(mockSubjectService.getByUserBranch).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findAll', () => {
    it('should return all subjects with query', async () => {
      mockSubjectService.findAll.mockResolvedValue(mockSubjects);

      const query = { branchId: 'branch-1', search: 'Math' };
      const result = await controller.findAll(query);

      expect(result).toEqual(mockSubjects);
      expect(mockSubjectService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getByBranch', () => {
    it('should return subjects for a branch', async () => {
      mockSubjectService.getByBranch.mockResolvedValue(mockSubjects);

      const result = await controller.getByBranch('branch-1');

      expect(result).toEqual(mockSubjects);
      expect(mockSubjectService.getByBranch).toHaveBeenCalledWith('branch-1');
    });
  });

  describe('findOne', () => {
    it('should return a single subject by id', async () => {
      mockSubjectService.findOne.mockResolvedValue(mockSubjects[0]);

      const result = await controller.findOne('sub-1');

      expect(result).toEqual(mockSubjects[0]);
      expect(mockSubjectService.findOne).toHaveBeenCalledWith('sub-1');
    });
  });

  describe('create', () => {
    it('should create a subject', async () => {
      const dto = { name: 'Mathematics', branchId: 'branch-1' };
      mockSubjectService.create.mockResolvedValue(mockSubjects[0]);

      const result = await controller.create(dto);

      expect(result).toEqual(mockSubjects[0]);
      expect(mockSubjectService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a subject', async () => {
      const dto = { name: 'Math Updated' };
      const updated = { ...mockSubjects[0], name: 'Math Updated' };
      mockSubjectService.update.mockResolvedValue(updated);

      const result = await controller.update('sub-1', dto);

      expect(result).toEqual(updated);
      expect(mockSubjectService.update).toHaveBeenCalledWith('sub-1', dto);
    });
  });

  describe('remove', () => {
    it('should remove a subject', async () => {
      const response = { message: 'Subject deleted successfully' };
      mockSubjectService.remove.mockResolvedValue(response);

      const result = await controller.remove('sub-1');

      expect(result).toEqual(response);
      expect(mockSubjectService.remove).toHaveBeenCalledWith('sub-1');
    });
  });
});
