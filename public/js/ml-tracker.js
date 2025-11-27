// ML Pattern Learning System
// Temporary development tool - will be hidden in production

class MLTracker {
    constructor() {
        this.learningData = this.loadLearningData();
        this.setupTracking();
    }

    loadLearningData() {
        return JSON.parse(localStorage.getItem('ml_learning_data') || '{}');
    }

    saveLearningData() {
        localStorage.setItem('ml_learning_data', JSON.stringify(this.learningData));
    }

    setupTracking() {
        // Initialize data structure if it doesn't exist
        if (!this.learningData.promptUsage) {
            this.learningData = {
                promptUsage: {},
                characterUsage: {},
                relationshipPatterns: {},
                writingHabits: {
                    storyLengths: [],
                    writingTimes: [],
                    usedPrompts: []
                },
                userPreferences: {
                    favoriteThemes: {},
                    favoriteRelationships: {},
                    ignoredPrompts: {}
                },
                characterExtractions: {
                    totalExtractions: 0,
                    successfulExtractions: 0,
                    charactersFound: [],
                    extractionHistory: []
                }
            };
            this.saveLearningData();
        }
    }

    // Track when a prompt is used
    trackPromptUsed(promptText, promptType = 'unknown') {
        if (!this.learningData.promptUsage[promptType]) {
            this.learningData.promptUsage[promptType] = { count: 0, examples: [] };
        }
        
        this.learningData.promptUsage[promptType].count++;
        this.learningData.promptUsage[promptType].examples.push({
            text: promptText,
            timestamp: new Date().toISOString(),
            used: true
        });

        // Track in writing habits
        this.learningData.writingHabits.usedPrompts.push({
            type: promptType,
            timestamp: new Date().toISOString()
        });

        this.saveLearningData();
        console.log(`📊 ML: Tracked prompt usage - ${promptType}`);
    }

    // Track when a prompt is ignored (not used after generation)
    trackPromptIgnored(promptType) {
        if (!this.learningData.userPreferences.ignoredPrompts[promptType]) {
            this.learningData.userPreferences.ignoredPrompts[promptType] = 0;
        }
        this.learningData.userPreferences.ignoredPrompts[promptType]++;
        this.saveLearningData();
    }

    // Track character usage in stories
    trackCharacterUsage(characterName, characterRole, storyContext) {
        if (!this.learningData.characterUsage[characterName]) {
            this.learningData.characterUsage[characterName] = {
                role: characterRole,
                usageCount: 0,
                stories: [],
                lastUsed: null
            };
        }

        this.learningData.characterUsage[characterName].usageCount++;
        this.learningData.characterUsage[characterName].stories.push(storyContext);
        this.learningData.characterUsage[characterName].lastUsed = new Date().toISOString();

        this.saveLearningData();
        console.log(`📊 ML: Tracked character usage - ${characterName}`);
    }

    // Track relationship patterns
    trackRelationshipPattern(relationshipType, characters, storyContext) {
        if (!this.learningData.relationshipPatterns[relationshipType]) {
            this.learningData.relationshipPatterns[relationshipType] = {
                count: 0,
                characterPairs: [],
                stories: []
            };
        }

        this.learningData.relationshipPatterns[relationshipType].count++;
        this.learningData.relationshipPatterns[relationshipType].characterPairs.push(characters);
        this.learningData.relationshipPatterns[relationshipType].stories.push(storyContext);

        // Update user preferences
        if (!this.learningData.userPreferences.favoriteRelationships[relationshipType]) {
            this.learningData.userPreferences.favoriteRelationships[relationshipType] = 0;
        }
        this.learningData.userPreferences.favoriteRelationships[relationshipType]++;

        this.saveLearningData();
        console.log(`📊 ML: Tracked relationship pattern - ${relationshipType}`);
    }

    // Track writing habits
    trackWritingSession(storyLength, promptType = null) {
        const session = {
            timestamp: new Date().toISOString(),
            length: storyLength,
            timeOfDay: new Date().getHours(),
            promptType: promptType
        };

        this.learningData.writingHabits.storyLengths.push(storyLength);
        this.learningData.writingHabits.writingTimes.push(new Date().getHours());

        this.saveLearningData();
        console.log(`📊 ML: Tracked writing session - ${storyLength} words`);
    }

    // Track character extraction events
    trackCharacterExtraction(successfulCount, totalFound) {
        if (!this.learningData.characterExtractions) {
            this.learningData.characterExtractions = {
                totalExtractions: 0,
                successfulExtractions: 0,
                charactersFound: [],
                extractionHistory: []
            };
        }

        this.learningData.characterExtractions.totalExtractions++;
        this.learningData.characterExtractions.successfulExtractions += successfulCount;
        
        this.learningData.characterExtractions.extractionHistory.push({
            timestamp: new Date().toISOString(),
            successfulCount: successfulCount,
            totalFound: totalFound,
            successRate: totalFound > 0 ? (successfulCount / totalFound) : 0
        });

        // Keep only last 50 extraction records
        if (this.learningData.characterExtractions.extractionHistory.length > 50) {
            this.learningData.characterExtractions.extractionHistory = 
                this.learningData.characterExtractions.extractionHistory.slice(-50);
        }

        this.saveLearningData();
        console.log(`📊 ML: Tracked character extraction - ${successfulCount} successful out of ${totalFound} found`);
    }

    // Track discovered characters
    trackDiscoveredCharacter(characterName, sourceStory, confidence) {
        if (!this.learningData.characterExtractions.charactersFound) {
            this.learningData.characterExtractions.charactersFound = [];
        }

        this.learningData.characterExtractions.charactersFound.push({
            name: characterName,
            sourceStory: sourceStory,
            confidence: confidence,
            discoveredAt: new Date().toISOString()
        });

        // Keep only last 100 discovered characters
        if (this.learningData.characterExtractions.charactersFound.length > 100) {
            this.learningData.characterExtractions.charactersFound = 
                this.learningData.characterExtractions.charactersFound.slice(-100);
        }

        this.saveLearningData();
        console.log(`📊 ML: Tracked discovered character - ${characterName}`);
    }

    // Analyze patterns and get insights
    getPatternInsights() {
        const insights = {
            mostUsedPromptTypes: this.getMostUsedPromptTypes(),
            favoriteCharacters: this.getFavoriteCharacters(),
            commonRelationshipPatterns: this.getCommonRelationshipPatterns(),
            writingHabits: this.getWritingHabits(),
            themePreferences: this.getThemePreferences(),
            extractionStats: this.getExtractionStats()
        };

        return insights;
    }

    getMostUsedPromptTypes() {
        const types = Object.entries(this.learningData.promptUsage)
            .map(([type, data]) => ({
                type,
                count: data.count,
                lastUsed: data.examples[data.examples.length - 1]?.timestamp
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return types;
    }

    getFavoriteCharacters() {
        const characters = Object.entries(this.learningData.characterUsage)
            .map(([name, data]) => ({
                name,
                role: data.role,
                usageCount: data.usageCount,
                lastUsed: data.lastUsed
            }))
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 5);

        return characters;
    }

    getCommonRelationshipPatterns() {
        const patterns = Object.entries(this.learningData.relationshipPatterns)
            .map(([type, data]) => ({
                type,
                frequency: data.count,
                uniquePairs: new Set(data.characterPairs.map(pair => pair.join(' & '))).size
            }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 5);

        return patterns;
    }

    getWritingHabits() {
        const lengths = this.learningData.writingHabits.storyLengths;
        const times = this.learningData.writingHabits.writingTimes;

        return {
            averageStoryLength: lengths.length ? Math.round(lengths.reduce((a, b) => a + b) / lengths.length) : 0,
            totalStories: lengths.length,
            preferredWritingTime: this.calculatePreferredTime(times),
            promptsUsed: this.learningData.writingHabits.usedPrompts.length
        };
    }

    getExtractionStats() {
        if (!this.learningData.characterExtractions) {
            return {
                totalExtractions: 0,
                successfulExtractions: 0,
                averageSuccessRate: 0,
                recentExtractions: []
            };
        }

        const extractions = this.learningData.characterExtractions;
        const recentHistory = extractions.extractionHistory.slice(-10);
        const averageSuccessRate = recentHistory.length > 0 
            ? recentHistory.reduce((sum, ext) => sum + ext.successRate, 0) / recentHistory.length 
            : 0;

        return {
            totalExtractions: extractions.totalExtractions,
            successfulExtractions: extractions.successfulExtractions,
            averageSuccessRate: Math.round(averageSuccessRate * 100),
            recentExtractions: recentHistory,
            totalCharactersDiscovered: extractions.charactersFound ? extractions.charactersFound.length : 0
        };
    }

    getThemePreferences() {
        const themes = {};
        
        // Analyze prompt types for theme preferences
        Object.entries(this.learningData.promptUsage).forEach(([type, data]) => {
            const theme = this.extractThemeFromPromptType(type);
            if (theme) {
                themes[theme] = (themes[theme] || 0) + data.count;
            }
        });

        return Object.entries(themes)
            .map(([theme, count]) => ({ theme, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    extractThemeFromPromptType(promptType) {
        const themeMap = {
            'romantic': 'Love & Relationships',
            'family': 'Family & Heritage', 
            'friendship': 'Friendship & Loyalty',
            'rivalry': 'Conflict & Competition',
            'mentorship': 'Growth & Learning',
            'betrayal': 'Trust & Betrayal',
            'redemption': 'Redemption & Forgiveness',
            'identity': 'Identity & Self-Discovery'
        };

        for (const [key, theme] of Object.entries(themeMap)) {
            if (promptType.toLowerCase().includes(key)) {
                return theme;
            }
        }
        return null;
    }

    calculatePreferredTime(times) {
        if (times.length === 0) return 'Unknown';
        
        const timeRanges = {
            'Early Morning (4-8 AM)': times.filter(t => t >= 4 && t < 8).length,
            'Morning (8-12 PM)': times.filter(t => t >= 8 && t < 12).length,
            'Afternoon (12-5 PM)': times.filter(t => t >= 12 && t < 17).length,
            'Evening (5-9 PM)': times.filter(t => t >= 17 && t < 21).length,
            'Late Night (9 PM-4 AM)': times.filter(t => t >= 21 || t < 4).length
        };

        const mostFrequent = Object.entries(timeRanges)
            .sort((a, b) => b[1] - a[1])[0];

        return mostFrequent[1] > 0 ? mostFrequent[0] : 'Unknown';
    }

    // Get writing progress over time
    getWritingProgress() {
        const sessions = this.learningData.writingHabits.usedPrompts;
        const progress = {};
        
        sessions.forEach(session => {
            const date = new Date(session.timestamp).toLocaleDateString();
            progress[date] = (progress[date] || 0) + 1;
        });

        return Object.entries(progress)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-30); // Last 30 days
    }

    // Get character discovery timeline
    getCharacterDiscoveryTimeline() {
        if (!this.learningData.characterExtractions?.charactersFound) {
            return [];
        }

        const discoveries = {};
        
        this.learningData.characterExtractions.charactersFound.forEach(char => {
            const date = new Date(char.discoveredAt).toLocaleDateString();
            discoveries[date] = (discoveries[date] || 0) + 1;
        });

        return Object.entries(discoveries)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Clear all learning data (for testing)
    clearLearningData() {
        this.learningData = {
            promptUsage: {},
            characterUsage: {},
            relationshipPatterns: {},
            writingHabits: {
                storyLengths: [],
                writingTimes: [],
                usedPrompts: []
            },
            userPreferences: {
                favoriteThemes: {},
                favoriteRelationships: {},
                ignoredPrompts: {}
            },
            characterExtractions: {
                totalExtractions: 0,
                successfulExtractions: 0,
                charactersFound: [],
                extractionHistory: []
            }
        };
        this.saveLearningData();
        console.log('📊 ML: Cleared all learning data');
    }

    // Export learning data for backup
    exportLearningData() {
        const dataStr = JSON.stringify(this.learningData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ml_learning_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Import learning data from backup
    importLearningData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.learningData = data;
            this.saveLearningData();
            console.log('📊 ML: Successfully imported learning data');
            return true;
        } catch (error) {
            console.error('📊 ML: Error importing learning data:', error);
            return false;
        }
    }
}

// Create global instance
const mlTracker = new MLTracker();