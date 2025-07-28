// sayuTypes.js
// 중앙 정의 파일 import
const { SAYU_TYPES, SAYU_FUNCTIONS, getSAYUType, getSAYUFunction } = require('@sayu/shared');

class SAYUTypes {
    constructor() {
        // 중앙 정의에서 가져온 8가지 기능 정의
        this.functions = {};
        Object.entries(SAYU_FUNCTIONS).forEach(([code, func]) => {
            this.functions[code] = func.name;
        });
        
        // 중앙 정의에서 가져온 16가지 유형별 기능 서열 (1-4차: 의식, 5-8차: 무의식)
        this.typeFunctions = {};
        
        // 중앙 정의에서 모든 타입 정보를 가져와서 설정
        Object.entries(SAYU_TYPES).forEach(([typeCode, typeData]) => {
            this.typeFunctions[typeCode] = {
                name: typeData.name,
                conscious: typeData.consciousFunctions,
                unconscious: typeData.unconsciousFunctions,
                description: typeData.description
            };
        });
    }
    
    getTypeInfo(typeCode) {
        return this.typeFunctions[typeCode] || null;
    }
    
    getDominantFunction(typeCode) {
        const typeInfo = this.getTypeInfo(typeCode);
        return typeInfo ? typeInfo.conscious[0] : null;
    }
    
    getInferiorFunction(typeCode) {
        const typeInfo = this.getTypeInfo(typeCode);
        return typeInfo ? typeInfo.conscious[3] : null;
    }
    
    getGrowthAreas(typeCode) {
        const typeInfo = this.getTypeInfo(typeCode);
        if (!typeInfo) return null;
            
        return {
            tertiary: typeInfo.conscious[2],  // 3차 기능
            inferior: typeInfo.conscious[3],  // 열등 기능
            description: `${this.functions[typeInfo.conscious[2]]}와 ${this.functions[typeInfo.conscious[3]]} 능력 개발 필요`
        };
    }
}

module.exports = SAYUTypes;