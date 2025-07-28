const { VALID_TYPE_CODES, getSAYUType } = require('@sayu/shared');

/**
 * APT 프로필 검증 미들웨어
 * 데이터베이스에 저장되기 전에 APT 프로필의 유효성을 검증
 */

class APTValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'APTValidationError';
    this.details = details;
  }
}

/**
 * APT 프로필 구조 검증
 */
function validateAPTProfile(aptProfile) {
  if (!aptProfile) {
    throw new APTValidationError('APT 프로필이 null입니다');
  }

  // primary_types 검증
  if (!aptProfile.primary_types || !Array.isArray(aptProfile.primary_types)) {
    throw new APTValidationError('primary_types 배열이 필요합니다');
  }

  if (aptProfile.primary_types.length === 0) {
    throw new APTValidationError('최소 1개의 primary_type이 필요합니다');
  }

  // 각 타입 검증
  aptProfile.primary_types.forEach((typeObj, index) => {
    if (!typeObj.type) {
      throw new APTValidationError(`primary_types[${index}]에 type이 없습니다`);
    }

    // 유효한 SAYU 타입인지 확인
    if (!VALID_TYPE_CODES.includes(typeObj.type)) {
      throw new APTValidationError(
        `유효하지 않은 APT 타입: ${typeObj.type}`,
        {
          invalidType: typeObj.type,
          validTypes: VALID_TYPE_CODES
        }
      );
    }

    // 타입 정보 가져오기
    const sayuType = getSAYUType(typeObj.type);

    // 필수 필드 검증
    const requiredFields = ['title', 'animal', 'confidence'];
    requiredFields.forEach(field => {
      if (!typeObj[field] && typeObj[field] !== 0) {
        throw new APTValidationError(
          `primary_types[${index}]에 ${field}가 없습니다`
        );
      }
    });

    // confidence 범위 검증
    if (typeObj.confidence < 0 || typeObj.confidence > 100) {
      throw new APTValidationError(
        `confidence는 0-100 사이여야 합니다: ${typeObj.confidence}`
      );
    }
  });

  // dimensions 검증
  if (!aptProfile.dimensions) {
    throw new APTValidationError('dimensions가 필요합니다');
  }

  const requiredDimensions = ['L', 'S', 'A', 'R', 'E', 'M', 'F', 'C'];
  requiredDimensions.forEach(dim => {
    if (typeof aptProfile.dimensions[dim] !== 'number') {
      throw new APTValidationError(`dimension ${dim}이 없거나 숫자가 아닙니다`);
    }
    if (aptProfile.dimensions[dim] < 0 || aptProfile.dimensions[dim] > 100) {
      throw new APTValidationError(
        `dimension ${dim}은 0-100 사이여야 합니다: ${aptProfile.dimensions[dim]}`
      );
    }
  });

  // meta 검증
  if (!aptProfile.meta) {
    throw new APTValidationError('meta 정보가 필요합니다');
  }

  if (!aptProfile.meta.analysis_method) {
    throw new APTValidationError('analysis_method가 필요합니다');
  }

  if (!aptProfile.meta.analysis_date) {
    throw new APTValidationError('analysis_date가 필요합니다');
  }

  return true;
}

/**
 * 중요도가 높은 아티스트의 APT 제거 방지
 */
function preventImportantArtistAPTDeletion(artist, newAPTProfile) {
  // 중요도 90 이상인 아티스트의 APT를 null로 설정하려는 경우
  if (artist.importance_score >= 90 && artist.apt_profile && !newAPTProfile) {
    throw new APTValidationError(
      `중요도 ${artist.importance_score}인 아티스트 ${artist.name}의 APT를 삭제할 수 없습니다`,
      {
        artistName: artist.name,
        importanceScore: artist.importance_score,
        currentAPT: artist.apt_profile.primary_types?.[0]?.type
      }
    );
  }
}

/**
 * APT 프로필 정규화 - 누락된 필드 자동 채우기
 */
function normalizeAPTProfile(aptProfile) {
  if (!aptProfile) return null;

  // 각 primary_type 정규화
  aptProfile.primary_types.forEach(typeObj => {
    const sayuType = getSAYUType(typeObj.type);

    // 누락된 한글명 채우기
    if (!typeObj.title_ko) {
      typeObj.title_ko = sayuType.name;
    }
    if (!typeObj.name_ko) {
      typeObj.name_ko = sayuType.animal;
    }

    // 영문명 정규화
    if (!typeObj.title) {
      typeObj.title = sayuType.nameEn;
    }
    if (!typeObj.animal) {
      typeObj.animal = sayuType.animalEn?.toLowerCase();
    }

    // weight 기본값
    if (!typeObj.weight) {
      typeObj.weight = 0.9;
    }
  });

  // meta 기본값
  if (!aptProfile.meta.analysis_date) {
    aptProfile.meta.analysis_date = new Date().toISOString();
  }

  return aptProfile;
}

module.exports = {
  validateAPTProfile,
  preventImportantArtistAPTDeletion,
  normalizeAPTProfile,
  APTValidationError
};
