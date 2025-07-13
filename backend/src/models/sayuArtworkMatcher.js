// sayuArtworkMatcher.js

class SAYUArtworkMatcher {
    constructor(typesSystem) {
        this.types = typesSystem;
    }
    
    analyzeArtworkForTypes(artworkFeatures) {
        const typeScores = {};
        
        for (const typeCode in this.types.typeFunctions) {
            // 각 축별 점수 계산
            const lsScore = this._calculateLSScore(typeCode, artworkFeatures);
            const arScore = this._calculateARScore(typeCode, artworkFeatures);
            const emScore = this._calculateEMScore(typeCode, artworkFeatures);
            const fcScore = this._calculateFCScore(typeCode, artworkFeatures);
            
            // 종합 점수 (평균)
            const totalScore = (lsScore + arScore + emScore + fcScore) / 4;
            
            typeScores[typeCode] = {
                total: totalScore,
                breakdown: {
                    socialFit: lsScore,
                    styleFit: arScore,
                    responseFit: emScore,
                    viewingFit: fcScore
                }
            };
        }
        
        return typeScores;
    }
    
    _calculateLSScore(typeCode, features) {
        if (typeCode[0] === 'L') {  // 혼자 감상
            const contemplation = features.requiresContemplation || 0.5;
            const interactive = features.interactiveElements || 0;
            return contemplation * (1 - interactive);
        } else {  // 함께 감상
            const discussion = features.discussionPotential || 0.5;
            const shareability = features.shareability || 0.5;
            return discussion * shareability;
        }
    }
    
    _calculateARScore(typeCode, features) {
        const abstractionLevel = features.abstractionLevel || 0;
        if (typeCode[1] === 'A') {  // 추상 선호
            return abstractionLevel;
        } else {  // 구상 선호
            return 1 - abstractionLevel;
        }
    }
    
    _calculateEMScore(typeCode, features) {
        if (typeCode[2] === 'E') {  // 감정 중심
            return features.emotionalIntensity || 0.5;
        } else {  // 의미 중심
            return features.conceptualDepth || 0.5;
        }
    }
    
    _calculateFCScore(typeCode, features) {
        if (typeCode[3] === 'F') {  // 자유로운 관람
            return features.explorationFriendly || 0.5;
        } else {  // 체계적 관람
            return features.structuredNarrative || 0.5;
        }
    }
    
    recommendArtworksForGrowth(userType, artworksDb) {
        const growthAreas = this.types.getGrowthAreas(userType);
        if (!growthAreas) return [];
        
        const inferiorFunction = growthAreas.inferior;
        const recommendations = [];
        
        for (const artwork of artworksDb) {
            // 열등기능 활성화 점수 계산
            const activationScore = this._calculateFunctionActivation(
                inferiorFunction, 
                artwork
            );
            
            if (activationScore > 0.6) {  // 적당한 도전 수준
                recommendations.push({
                    artwork: artwork,
                    growthScore: activationScore,
                    challengeLevel: this._assessChallengeLevel(activationScore)
                });
            }
        }
        
        // 성장 점수 기준 정렬
        recommendations.sort((a, b) => b.growthScore - a.growthScore);
        return recommendations.slice(0, 10);
    }
    
    _calculateFunctionActivation(func, artwork) {
        const activationMap = {
            'Le': (a) => (a.visualComplexity || 0) * 0.7,
            'Li': (a) => (a.introspectiveQuality || 0) * 0.8,
            'Se': (a) => (a.socialEngagement || 0) * 0.9,
            'Si': (a) => (a.emotionalResonance || 0) * 0.85,
            'Ae': (a) => (a.abstractExpression || 0) * 0.75,
            'Ai': (a) => (a.interpretiveOpenness || 0) * 0.8,
            'Re': (a) => (a.realisticDetail || 0) * 0.9,
            'Ri': (a) => (a.analyticalRichness || 0) * 0.85,
            'Ee': (a) => (a.emotionalExpressivity || 0) * 0.9,
            'Ei': (a) => (a.emotionalDepth || 0) * 0.8,
            'Me': (a) => (a.didacticContent || 0) * 0.75,
            'Mi': (a) => (a.philosophicalDepth || 0) * 0.85,
            'Fe': (a) => (a.nonlinearExperience || 0) * 0.8,
            'Fi': (a) => (a.intuitiveFlow || 0) * 0.75,
            'Ce': (a) => (a.systematicOrganization || 0) * 0.9,
            'Ci': (a) => (a.sequentialClarity || 0) * 0.85
        };
        
        const activationFunc = activationMap[func];
        return activationFunc ? activationFunc(artwork) : 0.5;
    }
    
    _assessChallengeLevel(activationScore) {
        if (activationScore < 0.4) {
            return "too_easy";
        } else if (activationScore < 0.7) {
            return "optimal_challenge";
        } else {
            return "potentially_overwhelming";
        }
    }
}

module.exports = SAYUArtworkMatcher;