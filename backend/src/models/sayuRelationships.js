// sayuRelationships.js

class SAYURelationships {
    constructor(typesSystem) {
        this.types = typesSystem;
        this.relationships = this._calculateAllRelationships();
    }
    
    _calculateAllRelationships() {
        const relationships = {};
        const typeCodes = Object.keys(this.types.typeFunctions);
        
        for (const type1 of typeCodes) {
            for (const type2 of typeCodes) {
                const key = `${type1}-${type2}`;
                relationships[key] = this._analyzeRelationship(type1, type2);
            }
        }
        
        return relationships;
    }
    
    _analyzeRelationship(type1, type2) {
        const t1Info = this.types.getTypeInfo(type1);
        const t2Info = this.types.getTypeInfo(type2);
        
        // 주기능과 열등기능 관계 분석
        const t1Dominant = t1Info.conscious[0];
        const t1Inferior = t1Info.conscious[3];
        const t2Dominant = t2Info.conscious[0];
        const t2Inferior = t2Info.conscious[3];
        
        // 보완 점수 계산
        let complementScore = 0;
        if (t1Inferior === t2Dominant) {
            complementScore += 0.5;  // type1이 type2로부터 배울 수 있음
        }
        if (t2Inferior === t1Dominant) {
            complementScore += 0.5;  // type2가 type1로부터 배울 수 있음
        }
        
        // 갈등 점수 계산
        let conflictScore = 0;
        // 무의식 기능과 의식 기능 충돌 체크
        t1Info.unconscious.forEach((func, i) => {
            if (func === t2Dominant) {
                conflictScore += (0.4 - i * 0.1);  // 5차 기능 충돌이 가장 강함
            }
        });
        
        return {
            compatibility: 0.5 + complementScore - conflictScore,
            growthPotential: complementScore,
            conflictPotential: conflictScore,
            synergyDescription: this._generateSynergyDescription(type1, type2)
        };
    }
    
    _generateSynergyDescription(type1, type2) {
        const t1Name = this.types.typeFunctions[type1].name;
        const t2Name = this.types.typeFunctions[type2].name;
        
        // 축별 조합 분석
        const synergies = [];
        
        // L/S 축
        if (type1[0] !== type2[0]) {
            synergies.push("개인과 집단 관점의 균형");
        }
        
        // A/R 축  
        if (type1[1] !== type2[1]) {
            synergies.push("추상과 구상의 다양성");
        }
            
        // E/M 축
        if (type1[2] !== type2[2]) {
            synergies.push("감정과 의미의 통합");
        }
            
        // F/C 축
        if (type1[3] !== type2[3]) {
            synergies.push("자유와 체계의 조화");
        }
        
        return `${t1Name}와 ${t2Name}: ${synergies.join(', ')}`;
    }
    
    getBestMatches(typeCode, topN = 5) {
        const matches = [];
        const typeCodes = Object.keys(this.types.typeFunctions);
        
        for (const otherType of typeCodes) {
            if (otherType !== typeCode) {
                const rel = this.relationships[`${typeCode}-${otherType}`];
                matches.push({
                    type: otherType,
                    name: this.types.typeFunctions[otherType].name,
                    compatibility: rel.compatibility,
                    growthPotential: rel.growthPotential
                });
            }
        }
        
        // 호환성 기준 정렬
        matches.sort((a, b) => b.compatibility - a.compatibility);
        return matches.slice(0, topN);
    }
}

module.exports = SAYURelationships;