const { v2: cloudinary } = require('cloudinary');

// Cloudinary 설정 (환경변수에서)
cloudinary.config({
  cloud_name: 'dkdzgpj3n',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function checkCloudinaryTotal() {
  try {
    console.log('🔍 Checking total resources in Cloudinary...\n');
    
    // sayu/artvee 폴더 전체 카운트
    const result = await cloudinary.search
      .expression('folder:sayu/artvee/*')
      .max_results(500) // 최대 500개까지 조회 (Cloudinary 제한)
      .execute();
      
    console.log(`📊 Found ${result.total_count} resources in sayu/artvee folders`);
    console.log(`📄 Retrieved ${result.resources.length} resources in this query`);
    
    // 폴더별 분석
    const folderCounts = {};
    result.resources.forEach(resource => {
      const folderPath = resource.public_id.split('/').slice(0, -1).join('/');
      folderCounts[folderPath] = (folderCounts[folderPath] || 0) + 1;
    });
    
    console.log('\n📁 Folder breakdown:');
    Object.entries(folderCounts).forEach(([folder, count]) => {
      console.log(`   ${folder}: ${count} files`);
    });
    
    // JSON 파일의 작품 수와 비교
    const fs = require('fs');
    const path = require('path');
    const urlsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../artvee-crawler/data/cloudinary-urls.json'), 'utf8')
    );
    
    console.log(`\n🆚 Comparison:`);
    console.log(`   Cloudinary total: ${result.total_count} resources`);
    console.log(`   JSON file artworks: ${Object.keys(urlsData).length} artworks`);
    
    if (result.total_count > Object.keys(urlsData).length * 2) {
      console.log(`\n⚠️  Cloudinary has significantly more files! Might be missing some in JSON.`);
    } else {
      console.log(`\n✅ JSON file seems to have most/all available artworks.`);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error checking Cloudinary:', error.message);
    
    // API 키가 없는 경우 대체 방법으로 직접 URL 테스트
    console.log('\n🔄 Trying alternative method - testing sample URLs...');
    
    const fs = require('fs');
    const path = require('path');
    const urlsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../artvee-crawler/data/cloudinary-urls.json'), 'utf8')
    );
    
    // 처음 5개 작품의 URL 테스트
    const sampleKeys = Object.keys(urlsData).slice(0, 5);
    console.log(`\n🧪 Testing ${sampleKeys.length} sample URLs:`);
    
    for (const key of sampleKeys) {
      const artwork = urlsData[key];
      let testUrl;
      
      if (artwork.full && artwork.full.url) {
        testUrl = artwork.full.url;
      } else if (artwork.url) {
        testUrl = artwork.url;
      }
      
      if (testUrl) {
        try {
          const { spawn } = require('child_process');
          const curl = spawn('curl', ['-I', testUrl]);
          
          curl.stdout.on('data', (data) => {
            const response = data.toString();
            if (response.includes('HTTP/1.1 200')) {
              console.log(`   ✅ ${key}: OK`);
            } else if (response.includes('404')) {
              console.log(`   ❌ ${key}: Not Found`);
            }
          });
          
          curl.stderr.on('data', (data) => {
            // Suppress curl errors for cleaner output
          });
          
        } catch (curlError) {
          console.log(`   ❓ ${key}: Unable to test`);
        }
      }
    }
  }
}

checkCloudinaryTotal();