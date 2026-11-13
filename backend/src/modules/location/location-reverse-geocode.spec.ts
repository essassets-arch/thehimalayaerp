import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { PrismaService } from '../../database/prisma.service';

describe('LocationService — Google Reverse Geocode', () => {
  let service: LocationService;
  let controller: LocationController;

  const mockPrisma = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        LocationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    controller = module.get<LocationController>(LocationController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects invalid latitude out of [-90, 90] bounds', async () => {
    await expect(service.reverseGeocode(95.0, 77.0)).rejects.toThrow(BadRequestException);
    await expect(service.reverseGeocode(-91.5, 77.0)).rejects.toThrow(BadRequestException);
  });

  it('rejects invalid longitude out of [-180, 180] bounds', async () => {
    await expect(service.reverseGeocode(28.0, 185.0)).rejects.toThrow(BadRequestException);
    await expect(service.reverseGeocode(28.0, -181.0)).rejects.toThrow(BadRequestException);
  });

  it('rejects negative accuracy values', async () => {
    await expect(service.reverseGeocode(28.0, 77.0, -5)).rejects.toThrow(BadRequestException);
  });

  it('successfully reverse geocodes Delhi coordinates into structured address', async () => {
    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';

    const mockGoogleResponse = {
      status: 'OK',
      results: [
        {
          formatted_address: 'Connaught Place, New Delhi, Delhi 110001, India',
          place_id: 'ChIJdelhi_connaught_place',
          address_components: [
            { long_name: 'Connaught Place', types: ['sublocality', 'sublocality_level_1'] },
            { long_name: 'New Delhi', types: ['locality'] },
            { long_name: 'Delhi', types: ['administrative_area_level_1'] },
            { long_name: '110001', types: ['postal_code'] },
            { long_name: 'India', types: ['country'] },
          ],
        },
      ],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGoogleResponse,
    }) as any;

    const res = await controller.reverseGeocode('28.6139', '77.2090', '12');

    expect(res.success).toBe(true);
    expect(res.formattedAddress).toBe('Connaught Place, New Delhi, Delhi 110001, India');
    expect(res.placeId).toBe('ChIJdelhi_connaught_place');
    expect(res.line1).toBe('Connaught Place');
    expect(res.city).toBe('New Delhi');
    expect(res.state).toBe('Delhi');
    expect(res.pincode).toBe('110001');
    expect(res.country).toBe('India');
    expect(res.latitude).toBe(28.6139);
    expect(res.longitude).toBe(77.209);
    expect(res.accuracy).toBe(12);

    // Verify cache returns same result without secondary fetch
    const cached = await controller.reverseGeocode('28.6139', '77.2090', '12');
    expect(cached.placeId).toBe('ChIJdelhi_connaught_place');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('successfully reverse geocodes Bengaluru coordinates into structured address', async () => {
    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';

    const mockGoogleResponse = {
      status: 'OK',
      results: [
        {
          formatted_address: 'MG Road, Bengaluru, Karnataka 560001, India',
          place_id: 'ChIJbengaluru_mg_road',
          address_components: [
            { long_name: 'MG Road', types: ['route'] },
            { long_name: 'Bengaluru', types: ['locality'] },
            { long_name: 'Karnataka', types: ['administrative_area_level_1'] },
            { long_name: '560001', types: ['postal_code'] },
            { long_name: 'India', types: ['country'] },
          ],
        },
      ],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGoogleResponse,
    }) as any;

    const res = await controller.reverseGeocode('12.9716', '77.5946', '8');

    expect(res.success).toBe(true);
    expect(res.formattedAddress).toBe('MG Road, Bengaluru, Karnataka 560001, India');
    expect(res.placeId).toBe('ChIJbengaluru_mg_road');
    expect(res.line1).toBe('MG Road');
    expect(res.city).toBe('Bengaluru');
    expect(res.state).toBe('Karnataka');
    expect(res.pincode).toBe('560001');
  });

  it('gracefully falls back to OpenStreetMap when Google Maps billing is disabled or request is denied', async () => {
    process.env.GOOGLE_MAPS_API_KEY = 'billing-disabled-key';

    const mockGoogleDenied = {
      error_message: 'You must enable Billing on the Google Cloud Project at https://console.cloud.google.com/project/_/billing/enable',
      results: [],
      status: 'REQUEST_DENIED',
    };

    const mockOsmResponse = {
      place_id: 247833381,
      display_name: 'Ambawadi, Navrangpura, SabarmatiTaluka, Ahmedabad, Gujarat, 380006, India',
      address: {
        suburb: 'Ambawadi',
        village: 'Navrangpura',
        state_district: 'Ahmedabad',
        state: 'Gujarat',
        postcode: '380006',
        country: 'India',
      },
    };

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGoogleDenied,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOsmResponse,
      }) as any;

    const res = await controller.reverseGeocode('23.0232', '72.5567', '110');

    expect(res.success).toBe(true);
    expect(res.formattedAddress).toContain('Ahmedabad');
    expect(res.city).toBe('Ahmedabad');
    expect(res.state).toBe('Gujarat');
    expect(res.pincode).toBe('380006');
    expect(res.country).toBe('India');
  });

  it('gracefully falls back to coordinate address if all external geocode services fail without throwing 400', async () => {
    process.env.GOOGLE_MAPS_API_KEY = '';

    global.fetch = jest.fn().mockRejectedValue(new Error('Network offline')) as any;

    const res = await controller.reverseGeocode('21.1702', '72.8311', '50');

    expect(res.success).toBe(true);
    expect(res.formattedAddress).toBe('21.1702, 72.8311 (Accuracy: ±50m)');
    expect(res.latitude).toBe(21.1702);
    expect(res.longitude).toBe(72.8311);
    expect(res.accuracy).toBe(50);
  });
});
