const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Remove BrandAnalysis model and BrandAnalysisStatus enum
schema = schema.replace(/enum BrandAnalysisStatus \{[\s\S]*?\}/, '');
schema = schema.replace(/model BrandAnalysis \{[\s\S]*?@@index\(\[createdAt\]\)[\s\S]*?\}/, '');

// Remove relations from User
schema = schema.replace(/  createdBrandAnalyses    BrandAnalysis\[\]   @relation\("BrandAnalysisCreator"\)\r?\n/, '');
schema = schema.replace(/  reviewedBrandAnalyses   BrandAnalysis\[\]   @relation\("BrandAnalysisReviewer"\)\r?\n/, '');
schema = schema.replace(/  completedBrandAnalyses         BrandAnalysis\[\]          @relation\("BrandAnalysisCompleter"\)\r?\n/, '');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Legacy BrandAnalysis model removed successfully');
