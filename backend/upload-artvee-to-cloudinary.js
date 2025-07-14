const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const path = require('path');

// Configure Cloudinary directly
cloudinary.config({
  cloud_name: 'dkdzgpj3n',
  api_key: '257249284342124',
  api_secret: '-JUkBhI-apD5r704sg1X0Uq8lNU'
});

class CloudinaryUploader {
  constructor() {
    this.baseDir = '../artvee-crawler/images';
    this.progressFile = '../artvee-crawler/cloudinary-upload-progress.json';
    this.uploadedFile = '../artvee-crawler/data/cloudinary-urls.json';
    this.stats = {
      total: 0,
      uploaded: 0,
      failed: 0,
      skipped: 0
    };
  }

  async loadProgress() {
    try {
      const data = await fs.readFile(this.progressFile, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return { uploaded: [], failed: [] };
    }
  }

  async saveProgress(progress) {
    await fs.writeFile(this.progressFile, JSON.stringify(progress, null, 2));
  }

  async loadUploadedUrls() {
    try {
      const data = await fs.readFile(this.uploadedFile, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  }

  async saveUploadedUrls(urls) {
    await fs.writeFile(this.uploadedFile, JSON.stringify(urls, null, 2));
  }

  async uploadToCloudinary(filePath, publicId, folder) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        folder: `sayu/artvee/${folder}`,
        resource_type: 'auto',
        overwrite: false,
        transformation: folder === 'thumbnails' ? 
          { width: 400, height: 300, crop: 'fill', quality: 'auto:good' } : 
          { quality: 'auto:best' }
      });
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes
      };
    } catch (error) {
      console.error(`Error uploading ${publicId}:`, error.message);
      throw error;
    }
  }

  async uploadAll() {
    console.log('🎨 Cloudinary Uploader for SAYU\n');
    
    // Configuration is hardcoded, no need to check

    console.log(`☁️  Cloud: dkdzgpj3n\n`);

    // Load artworks data
    const artworksData = await fs.readFile('../artvee-crawler/data/famous-artists-artworks.json', 'utf8');
    const artworks = JSON.parse(artworksData);
    
    // Load progress
    const progress = await this.loadProgress();
    const uploadedSet = new Set(progress.uploaded);
    const uploadedUrls = await this.loadUploadedUrls();
    
    this.stats.total = artworks.length * 2; // full + thumbnail
    this.stats.skipped = uploadedSet.size;
    
    console.log(`📊 Total images to process: ${this.stats.total}`);
    console.log(`✓ Already uploaded: ${this.stats.skipped}\n`);
    
    for (const artwork of artworks) {
      const artveeId = artwork.artveeId;
      
      // Upload full image
      const fullPath = path.join(this.baseDir, 'full', `${artveeId}.jpg`);
      const fullId = `full_${artveeId}`;
      
      if (!uploadedSet.has(fullId)) {
        try {
          console.log(`Uploading full image: ${artwork.title}`);
          const fullResult = await this.uploadToCloudinary(fullPath, artveeId, 'full');
          
          if (!uploadedUrls[artveeId]) {
            uploadedUrls[artveeId] = {};
          }
          uploadedUrls[artveeId].full = fullResult;
          uploadedUrls[artveeId].artwork = {
            title: artwork.title,
            artist: artwork.artist,
            sayuType: artwork.sayuType
          };
          
          uploadedSet.add(fullId);
          progress.uploaded.push(fullId);
          this.stats.uploaded++;
          console.log(`  ✓ Full image uploaded (${(fullResult.bytes / 1024 / 1024).toFixed(2)} MB)`);
        } catch (error) {
          this.stats.failed++;
          progress.failed.push({ id: fullId, error: error.message });
          console.log(`  ✗ Failed to upload full image`);
        }
      } else {
        this.stats.skipped++;
      }
      
      // Upload thumbnail
      const thumbPath = path.join(this.baseDir, 'thumbnails', `${artveeId}.jpg`);
      const thumbId = `thumb_${artveeId}`;
      
      if (!uploadedSet.has(thumbId)) {
        try {
          console.log(`Uploading thumbnail: ${artwork.title}`);
          const thumbResult = await this.uploadToCloudinary(thumbPath, artveeId, 'thumbnails');
          
          if (!uploadedUrls[artveeId]) {
            uploadedUrls[artveeId] = {};
          }
          uploadedUrls[artveeId].thumbnail = thumbResult;
          
          uploadedSet.add(thumbId);
          progress.uploaded.push(thumbId);
          this.stats.uploaded++;
          console.log(`  ✓ Thumbnail uploaded\n`);
        } catch (error) {
          this.stats.failed++;
          progress.failed.push({ id: thumbId, error: error.message });
          console.log(`  ✗ Failed to upload thumbnail\n`);
        }
      } else {
        this.stats.skipped++;
      }
      
      // Save progress after each artwork
      await this.saveProgress(progress);
      await this.saveUploadedUrls(uploadedUrls);
      
      // Progress update
      const total = this.stats.uploaded + this.stats.failed + this.stats.skipped;
      if (total % 10 === 0) {
        console.log(`📊 Progress: ${total}/${this.stats.total} (${((total/this.stats.total)*100).toFixed(1)}%)\n`);
      }
      
      // Small delay to avoid rate limiting
      await this.sleep(100);
    }
    
    // Final stats
    console.log('\n' + '='.repeat(50));
    console.log('📊 Upload Complete!');
    console.log('='.repeat(50));
    console.log(`✓ Uploaded: ${this.stats.uploaded}`);
    console.log(`✗ Failed: ${this.stats.failed}`);
    console.log(`↷ Skipped: ${this.stats.skipped}`);
    console.log(`Total processed: ${this.stats.total}`);
    console.log('\nCloudinary URLs saved to: data/cloudinary-urls.json');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create .env file if it doesn't exist
async function checkEnvFile() {
  try {
    await fs.access('.env');
  } catch {
    console.log('Creating .env file...');
    await fs.writeFile('.env', `# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
`);
    console.log('\n⚠️  Please edit .env file with your Cloudinary credentials!');
    console.log('You can find them at: https://console.cloudinary.com/console\n');
    process.exit(1);
  }
}

// Run the uploader
checkEnvFile().then(() => {
  const uploader = new CloudinaryUploader();
  uploader.uploadAll().catch(console.error);
});