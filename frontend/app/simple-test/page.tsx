export default function SimpleTestPage() {
  const lrmcUrls = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/1280px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Claude_Monet_-_Woman_with_a_Parasol_-_Madame_Monet_and_Her_Son_-_Google_Art_Project.jpg/800px-Claude_Monet_-_Woman_with_a_Parasol_-_Madame_Monet_and_Her_Son_-_Google_Art_Project.jpg'
  ];

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          LRMC 이미지 테스트 (3개 샘플)
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lrmcUrls.map((url, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative w-full h-64">
                <img
                  src={url}
                  alt={`LRMC Test ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`이미지 로드 실패: ${url}`);
                    e.currentTarget.style.border = '2px solid red';
                  }}
                  onLoad={() => {
                    console.log(`이미지 로드 성공: ${url}`);
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm">Image {index + 1}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {url.includes('Water_Lilies') ? '수련' : 
                   url.includes('Impression') ? '인상, 해돋이' : 
                   '양산을 든 여인'}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold mb-4">테스트 결과:</h2>
          <p className="text-sm text-gray-700">
            개발자 도구 콘솔을 열어서 이미지 로드 성공/실패 메시지를 확인하세요.
          </p>
          <div className="mt-4 space-y-2">
            {lrmcUrls.map((url, index) => (
              <div key={index} className="text-xs font-mono bg-white p-2 rounded break-all">
                {index + 1}. {url}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}