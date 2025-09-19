// import { Router, Request, Response } from 'express';
// import { SeedService } from '../services/seed.service';

// const router = Router();
// const seedService = new SeedService();

// /**
//  * POST /api/seed/run
//  * Run database seeding
//  */
// router.post('/run', async (req: Request, res: Response) => {
//   try {
//     console.log('🌱 Manual seeding requested via API');
//     await seedService.seedAll();
    
//     res.status(200).json({
//       success: true,
//       message: 'Database seeding completed successfully'
//     });
//   } catch (error) {
//     console.error('❌ Manual seeding failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Database seeding failed',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// });

// /**
//  * POST /api/seed/clear
//  * Clear all data from database
//  */
// router.post('/clear', async (req: Request, res: Response) => {
//   try {
//     console.log('🗑️  Manual data clearing requested via API');
//     await seedService.clearAllData();
    
//     res.status(200).json({
//       success: true,
//       message: 'All data cleared successfully'
//     });
//   } catch (error) {
//     console.error('❌ Data clearing failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Data clearing failed',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// });

// /**
//  * GET /api/seed/status
//  * Check if seeding is needed
//  */
// router.get('/status', async (req: Request, res: Response) => {
//   try {
//     const needsSeeding = await seedService.needsSeeding();
    
//     res.status(200).json({
//       success: true,
//       needsSeeding,
//       message: needsSeeding ? 'Database needs seeding' : 'Database is already seeded'
//     });
//   } catch (error) {
//     console.error('❌ Status check failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Status check failed',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// });

// export default router;
