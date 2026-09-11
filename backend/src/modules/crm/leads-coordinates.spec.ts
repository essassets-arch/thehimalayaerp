import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { SequenceService } from '../../common/sequence/sequence.service';

describe('LeadsService — Delivery Coordinate Validation & Persistence', () => {
  let service: LeadsService;

  const mockPrisma = {
    company: { findFirst: jest.fn().mockResolvedValue({ id: 'comp-1' }) },
    lead: {
      create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'lead-123', ...args.data })),
      findFirst: jest.fn().mockResolvedValue({ id: 'lead-123' }),
      update: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'lead-123', ...args.data })),
    },
  };

  const mockWorkflow = {
    getInitialState: jest.fn().mockResolvedValue({ id: 'wf-initial' }),
  };

  const mockSequence = {
    generateLeadNumber: jest.fn().mockResolvedValue('LEAD-2026-001'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: WorkflowService, useValue: mockWorkflow },
        { provide: SequenceService, useValue: mockSequence },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects lead creation with invalid latitude (> 90)', async () => {
    await expect(
      service.createLead(
        {
          companyName: 'Test Corp',
          contactPerson: 'John',
          deliveryLatitude: 91.5,
          deliveryLongitude: 77.2,
        },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects lead creation with invalid longitude (< -180)', async () => {
    await expect(
      service.createLead(
        {
          companyName: 'Test Corp',
          contactPerson: 'John',
          deliveryLatitude: 28.6,
          deliveryLongitude: -185.0,
        },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects lead creation with negative accuracy', async () => {
    await expect(
      service.createLead(
        {
          companyName: 'Test Corp',
          contactPerson: 'John',
          deliveryLatitude: 28.6,
          deliveryLongitude: 77.2,
          deliveryAccuracy: -10,
        },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('persists clean delivery coordinates inside address JSON on createLead', async () => {
    const created = await service.createLead(
      {
        companyName: 'Delhi Construction Ltd',
        contactPerson: 'Rajesh',
        deliveryAddress: 'Connaught Place, New Delhi, Delhi 110001',
        deliveryLatitude: 28.6139,
        deliveryLongitude: 77.209,
        deliveryAccuracy: 12,
        deliveryPlaceId: 'ChIJdelhi_connaught_place',
        address: {
          line1: 'Connaught Place',
          city: 'New Delhi',
          state: 'Delhi',
          country: 'India',
          pincode: '110001',
        },
      },
      'user-1',
    );

    expect(created.address).toEqual({
      line1: 'Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110001',
      deliveryAddress: 'Connaught Place, New Delhi, Delhi 110001',
      deliveryLatitude: 28.6139,
      deliveryLongitude: 77.209,
      deliveryAccuracy: 12,
      deliveryPlaceId: 'ChIJdelhi_connaught_place',
    });
  });
});
