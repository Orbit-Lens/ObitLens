import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../modules/users/user.model.js';
import { ContactMessage } from '../modules/contact/contact.model.js';
import { Project } from '../modules/projects/project.model.js';
import { Image } from '../modules/images/image.model.js';
import { Job } from '../modules/jobs/job.model.js';

async function seed() {
  console.log('🌱 Connecting to MongoDB at:', env.MONGODB_URI);
  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ Connected to database:', mongoose.connection.name);

  // 1. Ensure Collections
  const collections = ['users', 'contact_messages', 'projects', 'images', 'jobs'];
  const existing = await mongoose.connection.db!.listCollections().toArray();
  const existingNames = new Set(existing.map((c) => c.name));

  for (const col of collections) {
    if (!existingNames.has(col)) {
      await mongoose.connection.db!.createCollection(col);
      console.log(`📁 Created collection: ${col}`);
    }
  }

  // 2. Seed Default User if not exists
  let testUser = await User.findOne({ email: 'sakthivel@orbitlens.app' });
  if (!testUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123', salt);
    testUser = await User.create({
      name: 'Sakthivel Prakash',
      email: 'sakthivel@orbitlens.app',
      passwordHash,
      role: 'admin',
    });
    console.log('👤 Created default user: sakthivel@orbitlens.app (Password: Password123)');
  } else {
    console.log('👤 User sakthivel@orbitlens.app already exists');
  }

  // 3. Seed Sample Contact Messages
  const messageCount = await ContactMessage.countDocuments();
  if (messageCount === 0) {
    await ContactMessage.create([
      {
        name: 'Sakthivel',
        email: 'sakthivel@orbitlens.app',
        subject: 'First Lunar Registration Project',
        message: 'Hello! Setting up the OrbitLens lunar imagery pipeline with Chandrayaan-2 TMC and OHRC datasets.',
        status: 'read',
      },
      {
        name: 'Dr. Vikram',
        email: 'vikram.isro@example.org',
        subject: 'Chandrayaan-2 OHRC Sub-Pixel Alignment',
        message: 'Interested in evaluating the scale-invariant feature extraction accuracy on lunar south pole craters.',
        status: 'unread',
      },
    ]);
    console.log('📬 Seeded 2 sample contact messages in contact_messages');
  }

  // 4. Seed Sample Project
  let defaultProject = await Project.findOne({ userId: testUser._id });
  if (!defaultProject) {
    defaultProject = await Project.create({
      userId: testUser._id,
      name: 'Chandrayaan-2 South Pole Crater Alignment',
      description: 'Registration and radiometric normalization of OHRC 25cm and TMC 5m images.',
      tags: ['chandrayaan-2', 'ohrc', 'tmc', 'lunar-crater'],
    });
    console.log('🚀 Seeded default project in projects collection');
  }

  // 5. Seed Real Lunar Remote Sensing Images for testUser
  const userImageCount = await Image.countDocuments({ userId: testUser._id });
  let seededImages = await Image.find({ userId: testUser._id });

  if (userImageCount === 0) {
    const sampleImages = [
      {
        userId: testUser._id,
        projectId: defaultProject._id,
        name: 'CH2_OHRC_0421',
        filename: 'ch2_ohr_ncp_20241008_0421_v2.tif',
        format: 'GEOTIFF',
        sensor: 'OHRC',
        resolutionMetersPerPixel: 0.25,
        sunAzimuthDeg: 128.4,
        sunElevationDeg: 18.2,
        storageKey: 'datasets/ohrc/CH2_OHRC_0421.tif',
        status: 'uploaded',
        metadataParsed: true,
        width: 4096,
        height: 4096,
        fileSizeBytes: 33554432,
      },
      {
        userId: testUser._id,
        projectId: defaultProject._id,
        name: 'CH2_TMC2_1187',
        filename: 'ch2_tmc_ndn_20240915_1187_v1.tif',
        format: 'GEOTIFF',
        sensor: 'TMC-2',
        resolutionMetersPerPixel: 5.0,
        sunAzimuthDeg: 122.1,
        sunElevationDeg: 21.4,
        storageKey: 'datasets/tmc2/CH2_TMC2_1187.tif',
        status: 'uploaded',
        metadataParsed: true,
        width: 2048,
        height: 8192,
        fileSizeBytes: 16777216,
      },
      {
        userId: testUser._id,
        projectId: defaultProject._id,
        name: 'CH2_IIRS_0821',
        filename: 'ch2_iir_nci_20240820_0821_v3.tif',
        format: 'GEOTIFF',
        sensor: 'IIRS',
        resolutionMetersPerPixel: 20.0,
        sunAzimuthDeg: 130.0,
        sunElevationDeg: 16.5,
        storageKey: 'datasets/iirs/CH2_IIRS_0821.tif',
        status: 'uploaded',
        metadataParsed: true,
        width: 1024,
        height: 4096,
        fileSizeBytes: 8388608,
      },
      {
        userId: testUser._id,
        projectId: defaultProject._id,
        name: 'CH2_OHRC_0398',
        filename: 'ch2_ohr_ncp_20240712_0398_v1.tif',
        format: 'GEOTIFF',
        sensor: 'OHRC',
        resolutionMetersPerPixel: 0.28,
        sunAzimuthDeg: 115.8,
        sunElevationDeg: 24.1,
        storageKey: 'datasets/ohrc/CH2_OHRC_0398.tif',
        status: 'uploaded',
        metadataParsed: true,
        width: 4096,
        height: 4096,
        fileSizeBytes: 33554432,
      },
      {
        userId: testUser._id,
        projectId: defaultProject._id,
        name: 'CH2_TMC2_1104',
        filename: 'ch2_tmc_ndn_20240602_1104_v1.tif',
        format: 'GEOTIFF',
        sensor: 'TMC-2',
        resolutionMetersPerPixel: 5.0,
        sunAzimuthDeg: 110.2,
        sunElevationDeg: 28.0,
        storageKey: 'datasets/tmc2/CH2_TMC2_1104.tif',
        status: 'uploaded',
        metadataParsed: true,
        width: 2048,
        height: 4096,
        fileSizeBytes: 16777216,
      },
      {
        userId: testUser._id,
        projectId: defaultProject._id,
        name: 'LROC_NAC_M114',
        filename: 'lroc_nac_m1145229188re.tif',
        format: 'GEOTIFF',
        sensor: 'LRO_NAC',
        resolutionMetersPerPixel: 0.5,
        sunAzimuthDeg: 135.2,
        sunElevationDeg: 14.8,
        storageKey: 'datasets/lroc/LROC_NAC_M114.tif',
        status: 'uploaded',
        metadataParsed: true,
        width: 5064,
        height: 52224,
        fileSizeBytes: 67108864,
      },
      {
        userId: testUser._id,
        projectId: defaultProject._id,
        name: 'CH2_OHRC_0410',
        filename: 'ch2_ohr_ncp_20241007_0410_v1.tif',
        format: 'GEOTIFF',
        sensor: 'OHRC',
        resolutionMetersPerPixel: 0.25,
        sunAzimuthDeg: 125.0,
        sunElevationDeg: 19.5,
        storageKey: 'datasets/ohrc/CH2_OHRC_0410.tif',
        status: 'uploaded',
        metadataParsed: true,
        width: 4096,
        height: 4096,
        fileSizeBytes: 33554432,
      },
      {
        userId: testUser._id,
        projectId: defaultProject._id,
        name: 'CH2_OHRC_0411',
        filename: 'ch2_ohr_ncp_20241007_0411_v1.tif',
        format: 'GEOTIFF',
        sensor: 'OHRC',
        resolutionMetersPerPixel: 0.25,
        sunAzimuthDeg: 126.1,
        sunElevationDeg: 19.1,
        storageKey: 'datasets/ohrc/CH2_OHRC_0411.tif',
        status: 'uploaded',
        metadataParsed: true,
        width: 4096,
        height: 4096,
        fileSizeBytes: 33554432,
      },
    ];

    seededImages = await Image.insertMany(sampleImages);
    console.log(`🛰️ Seeded ${seededImages.length} real lunar images in images collection`);
  }

  // 6. Seed Sample Registration Jobs for testUser
  await Job.deleteMany({ userId: testUser._id });
  if (seededImages.length >= 2) {
    const refImg = seededImages[0];
    const srcImgTmc = seededImages[1];
    const srcImgIirs = seededImages[2] || seededImages[1];
    const srcImgLroc = seededImages[5] || seededImages[0];
    const srcImgOhrc = seededImages[7] || seededImages[0];

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const sampleJobs: any[] = [
      {
        userId: testUser._id,
        projectId: defaultProject._id,
        sourceImageId: srcImgTmc._id,
        referenceImageId: refImg._id,
        algorithm: 'classical',
        transformModel: 'homography',
        status: 'complete',
        progress: 100,
        statusMessage: 'Registration completed successfully',
        createdAt: new Date(now - 1 * dayMs),
        metrics: {
          rmse: 0.72,
          inlierCount: 842,
          totalCandidateMatches: 1146,
          inlierRatio: 0.914,
          meanReprojectionError: 0.72,
          medianReprojectionError: 0.65,
          coverageUniformityScore: 0.89,
          processingTimeMs: 1420,
          ssim: 0.884,
          mutualInformation: 1.42,
          psnr: 34.8,
          transformationMatrix: [
            [0.98421, -0.01248, 142.81],
            [0.01192, 0.98390, -84.15],
            [-0.00001, 0.00000, 1.00000],
          ],
        },
        artifacts: {
          registeredImageStorageKey: 'artifacts/job_1/registered_product.tif',
          registeredPreviewStorageKey: '/images/crater-terrain-reference.png',
          differenceMapStorageKey: '/images/difference-map-visualization.png',
          matchPointsStorageKey: 'artifacts/job_1/match_points.geojson',
          previewOverlayStorageKey: 'artifacts/job_1/preview_overlay.png',
        },
      },
      {
        userId: testUser._id,
        projectId: defaultProject._id,
        sourceImageId: srcImgIirs._id,
        referenceImageId: srcImgTmc._id,
        algorithm: 'classical',
        transformModel: 'affine',
        status: 'complete',
        progress: 100,
        statusMessage: 'Calibrated radiometric correspondence complete',
        createdAt: new Date(now - 2 * dayMs),
        metrics: {
          rmse: 0.68,
          inlierCount: 1208,
          totalCandidateMatches: 1320,
          inlierRatio: 0.915,
          meanReprojectionError: 0.68,
          medianReprojectionError: 0.61,
          coverageUniformityScore: 0.92,
          processingTimeMs: 1850,
          ssim: 0.892,
          mutualInformation: 1.51,
          psnr: 35.4,
          transformationMatrix: [
            [0.9912, -0.0084, 98.4],
            [0.0076, 0.9921, -42.1],
            [0.0000, 0.0000, 1.0000],
          ],
        },
        artifacts: {
          registeredImageStorageKey: 'artifacts/job_2/registered_product.tif',
          registeredPreviewStorageKey: '/images/crater-terrain-reference.png',
          differenceMapStorageKey: '/images/difference-map-visualization.png',
          matchPointsStorageKey: 'artifacts/job_2/match_points.geojson',
          previewOverlayStorageKey: 'artifacts/job_2/preview_overlay.png',
        },
      },
      {
        userId: testUser._id,
        projectId: defaultProject._id,
        sourceImageId: srcImgLroc._id,
        referenceImageId: srcImgTmc._id,
        algorithm: 'learned',
        transformModel: 'homography',
        status: 'complete',
        progress: 100,
        statusMessage: 'Verified multimodal correspondence complete',
        createdAt: new Date(now - 3 * dayMs),
        metrics: {
          rmse: 0.45,
          inlierCount: 2410,
          totalCandidateMatches: 2522,
          inlierRatio: 0.955,
          meanReprojectionError: 0.45,
          medianReprojectionError: 0.42,
          coverageUniformityScore: 0.96,
          processingTimeMs: 2310,
          ssim: 0.918,
          mutualInformation: 1.68,
          psnr: 37.2,
          transformationMatrix: [
            [0.9981, -0.0031, 54.2],
            [0.0029, 0.9978, -18.7],
            [0.0000, 0.0000, 1.0000],
          ],
        },
        artifacts: {
          registeredImageStorageKey: 'artifacts/job_3/registered_product.tif',
          registeredPreviewStorageKey: '/images/crater-terrain-reference.png',
          differenceMapStorageKey: '/images/difference-map-visualization.png',
          matchPointsStorageKey: 'artifacts/job_3/match_points.geojson',
          previewOverlayStorageKey: 'artifacts/job_3/preview_overlay.png',
        },
      },
      {
        userId: testUser._id,
        projectId: defaultProject._id,
        sourceImageId: srcImgOhrc._id,
        referenceImageId: seededImages[6] ? seededImages[6]._id : refImg._id,
        algorithm: 'classical',
        transformModel: 'homography',
        status: 'complete',
        progress: 100,
        statusMessage: 'Mosaic registration complete',
        createdAt: new Date(now - 4 * dayMs),
        metrics: {
          rmse: 0.59,
          inlierCount: 3120,
          totalCandidateMatches: 3450,
          inlierRatio: 0.904,
          meanReprojectionError: 0.59,
          medianReprojectionError: 0.52,
          coverageUniformityScore: 0.95,
          processingTimeMs: 2780,
          ssim: 0.879,
          mutualInformation: 1.39,
          psnr: 33.9,
          transformationMatrix: [
            [0.9815, -0.0142, 178.6],
            [0.0135, 0.9820, -112.4],
            [-0.00002, 0.00001, 1.0000],
          ],
        },
        artifacts: {
          registeredImageStorageKey: 'artifacts/job_4/registered_product.tif',
          registeredPreviewStorageKey: '/images/crater-terrain-reference.png',
          differenceMapStorageKey: '/images/difference-map-visualization.png',
          matchPointsStorageKey: 'artifacts/job_4/match_points.geojson',
          previewOverlayStorageKey: 'artifacts/job_4/preview_overlay.png',
        },
      },
    ];

    // Populate historical activity distribution for the 30-day timeline
    for (let day = 5; day <= 28; day += 2) {
      sampleJobs.push({
        userId: testUser._id,
        projectId: defaultProject._id,
        sourceImageId: srcImgTmc._id,
        referenceImageId: refImg._id,
        algorithm: 'classical',
        transformModel: 'homography',
        status: 'complete',
        progress: 100,
        statusMessage: 'Pipeline run complete',
        createdAt: new Date(now - day * dayMs),
        metrics: {
          rmse: 0.35 + (day % 4) * 0.1,
          inlierCount: 900 + day * 50,
          totalCandidateMatches: 1200 + day * 60,
          inlierRatio: 0.88 + (day % 3) * 0.04,
          meanReprojectionError: 0.4 + (day % 3) * 0.1,
          medianReprojectionError: 0.38,
          coverageUniformityScore: 0.85,
          processingTimeMs: 1200 + day * 30,
          ssim: 0.85 + (day % 5) * 0.02,
          mutualInformation: 1.3 + (day % 4) * 0.05,
          psnr: 32.0 + (day % 6) * 1.0,
          transformationMatrix: [
            [1.0, 0.0, 10.0 * day],
            [0.0, 1.0, -5.0 * day],
            [0.0, 0.0, 1.0],
          ],
        },
        artifacts: {
          registeredImageStorageKey: `artifacts/hist_${day}/registered.tif`,
          registeredPreviewStorageKey: '/images/crater-terrain-reference.png',
          differenceMapStorageKey: '/images/difference-map-visualization.png',
        },
      });
    }

    const insertedJobs = await Job.insertMany(sampleJobs);
    console.log(`📊 Seeded ${insertedJobs.length} registration jobs in jobs collection`);
  }

  console.log('\n🎉 Database initialization completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
