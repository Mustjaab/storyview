// ML Story Analyzer and Prompt Generator
// Enhanced with Advanced Character Extraction

class MLAnalyzer {
    constructor() {
        console.log('🔬 ML Analyzer initialized');
        this.characterStoryConnections = new Map();
    }

    // MAIN CHARACTER EXTRACTION - Enhanced version
    extractCharactersFromText(text, sourceStory = 'Unknown Story') {
        console.log('🔬 ML: Extracting characters with enhanced NLP...');
        console.log('🔬 ML: Text length:', text.length, 'Source story:', sourceStory);
        
        const characters = this.enhancedCharacterExtraction(text, sourceStory);
        
        // Final filtering and sorting
        const finalCharacters = characters
            .filter(char => char.confidence > 0.2 && char.mentionCount >= 1)
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 10); // Increased limit
        
        console.log('🔬 ML: Final extracted characters:', finalCharacters);
        return finalCharacters;
    }

    // ENHANCED CHARACTER EXTRACTION with multiple strategies
    enhancedCharacterExtraction(text, sourceStory) {
        const characters = new Map();
        
        // Strategy 1: Capitalized word sequences (most reliable)
        this.extractCapitalizedSequences(text, characters, sourceStory);
        
        // Strategy 2: Dialogue attribution patterns
        this.extractFromDialogue(text, characters, sourceStory);
        
        // Strategy 3: Subject position detection
        this.extractFromSentenceStructure(text, characters, sourceStory);
        
        // Strategy 4: Repeated proper nouns
        this.extractRepeatedProperNouns(text, characters, sourceStory);
        
        return Array.from(characters.values());
    }

    // Strategy 1: Extract capitalized word sequences (names are often multi-word)
    extractCapitalizedSequences(text, characters, sourceStory) {
        const sentences = text.split(/[.!?]+/);
        
        sentences.forEach(sentence => {
            const words = sentence.trim().split(/\s+/);
            
            for (let i = 0; i < words.length; i++) {
                const currentWord = this.cleanWord(words[i]);
                
                if (this.isPotentialName(currentWord)) {
                    // Check for multi-word names (like "Mary Jane", "Dr. Smith")
                    let fullName = currentWord;
                    let nameLength = 1;
                    
                    // Look ahead for more capitalized words
                    for (let j = i + 1; j < words.length; j++) {
                        const nextWord = this.cleanWord(words[j]);
                        if (this.isNameContinuation(nextWord)) {
                            fullName += ' ' + nextWord;
                            nameLength++;
                        } else {
                            break;
                        }
                    }
                    
                    if (this.isValidFullName(fullName)) {
                        const confidence = this.calculateNameConfidence(fullName, nameLength, text);
                        this.addOrUpdateCharacter(characters, fullName, confidence, sourceStory, text);
                    }
                    
                    // Skip ahead since we've processed a multi-word name
                    i += nameLength - 1;
                }
            }
        });
    }

    // Strategy 2: Extract from dialogue patterns ("...", said Character)
    extractFromDialogue(text, characters, sourceStory) {
        const dialoguePatterns = [
            /"([^"]+)"[^.!?]*[ ]*(said|whispered|shouted|exclaimed|asked|replied|muttered|added|continued)[ ]+([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+)*)/gi,
            /([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+)*)[ ]*(said|whispered|shouted|exclaimed|asked|replied|muttered|added|continued)[^.!?]*"([^"]+)"/gi
        ];
        
        dialoguePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const name = this.cleanWord(match[3] || match[1]);
                if (this.isValidFullName(name)) {
                    const confidence = 0.8; // High confidence for dialogue attribution
                    this.addOrUpdateCharacter(characters, name, confidence, sourceStory, text);
                }
            }
        });
    }

    // Strategy 3: Extract from sentence structure (subjects at start of sentences)
    extractFromSentenceStructure(text, characters, sourceStory) {
        const sentences = text.split(/[.!?]+/);
        
        sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            if (trimmed.length < 5) return;
            
            const words = trimmed.split(/\s+/);
            if (words.length < 3) return;
            
            // First word after potential introductory phrases
            let startIndex = 0;
            const introWords = ['Suddenly', 'Meanwhile', 'However', 'Therefore', 'Nevertheless', 'Additionally'];
            
            if (introWords.includes(words[0])) {
                startIndex = 1;
            }
            
            if (startIndex < words.length) {
                const potentialName = this.cleanWord(words[startIndex]);
                const nextWord = words[startIndex + 1] ? this.cleanWord(words[startIndex + 1]) : '';
                
                // Check if this looks like a name at sentence start
                if (this.isPotentialName(potentialName) && 
                    (this.isNameContinuation(nextWord) || this.isVerb(nextWord))) {
                    const confidence = 0.7;
                    this.addOrUpdateCharacter(characters, potentialName, confidence, sourceStory, text);
                }
            }
        });
    }

    // Strategy 4: Extract repeated proper nouns
    extractRepeatedProperNouns(text, characters, sourceStory) {
        const words = text.split(/\s+/);
        const wordCounts = new Map();
        
        // Count capitalized words
        words.forEach(word => {
            const clean = this.cleanWord(word);
            if (this.isPotentialName(clean) && this.isValidFullName(clean)) {
                wordCounts.set(clean, (wordCounts.get(clean) || 0) + 1);
            }
        });
        
        // Add characters with multiple mentions
        wordCounts.forEach((count, name) => {
            if (count >= 2) {
                const confidence = Math.min(0.3 + (count * 0.1), 0.9);
                this.addOrUpdateCharacter(characters, name, confidence, sourceStory, text);
            }
        });
    }

    // Helper method to add or update character in the map
    addOrUpdateCharacter(characters, name, baseConfidence, sourceStory, text) {
        const mentionCount = this.countMentions(text, name);
        const finalConfidence = Math.min(baseConfidence + (mentionCount * 0.05), 0.95);
        
        if (characters.has(name)) {
            const existing = characters.get(name);
            existing.mentionCount = mentionCount;
            existing.confidence = Math.max(existing.confidence, finalConfidence);
        } else {
            characters.set(name, {
                name: name,
                mentionCount: mentionCount,
                role: this.inferRoleFromContext(name, text),
                sourceStory: sourceStory,
                confidence: finalConfidence,
                rawText: name,
                method: 'enhanced_extraction'
            });
        }
    }

    // Calculate confidence based on name properties
    calculateNameConfidence(name, nameLength, fullText) {
        let confidence = 0.5;
        
        // Boost for multi-word names
        if (nameLength > 1) confidence += 0.2;
        
        // Boost for common name patterns
        if (this.hasTitle(name)) confidence += 0.1;
        if (this.isCommonName(name)) confidence += 0.15;
        
        // Boost for multiple mentions
        const mentions = this.countMentions(fullText, name);
        confidence += Math.min(mentions * 0.08, 0.3);
        
        // Penalize very short single words
        if (nameLength === 1 && name.length < 3) confidence -= 0.3;
        
        return Math.max(0.1, Math.min(0.95, confidence));
    }

    // Count mentions of a name in text
    countMentions(text, name) {
        const regex = new RegExp(`\\b${this.escapeRegExp(name)}\\b`, 'gi');
        const matches = text.match(regex);
        return matches ? matches.length : 0;
    }

    // Escape regex special characters
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Clean word from punctuation
    cleanWord(word) {
        return word.replace(/^[.,!?;:"'()]+|[.,!?;:"'()]+$/g, '');
    }

    // Check if word could be part of a name
    isPotentialName(word) {
        if (!word || word.length < 2) return false;
        
        const isCapitalized = word[0] === word[0].toUpperCase();
        const isLowerCase = word[0] === word[0].toLowerCase();
        
        return isCapitalized && 
               !this.isExcludedWord(word.toLowerCase()) &&
               !this.isCommonNonName(word);
    }

    // Check if word continues a name
    isNameContinuation(word) {
        if (!word) return false;
        
        // Allow capitalized words, initials, or hyphenated parts
        return (word[0] === word[0].toUpperCase() && !this.isExcludedWord(word.toLowerCase())) ||
               /^[A-Z]\.$/.test(word) ||
               /^[a-z]+-[A-Z][a-z]+$/.test(word);
    }

    // Check if this is a valid full name
    isValidFullName(name) {
        if (!name || name.length < 2) return false;
        
        // Should not be excluded words
        const words = name.split(' ');
        for (const word of words) {
            if (this.isExcludedWord(word.toLowerCase()) || this.isCommonNonName(word)) {
                return false;
            }
        }
        
        return true;
    }

    // Check if word is a verb (for sentence structure analysis)
    isVerb(word) {
        const commonVerbs = new Set([
            'said', 'says', 'went', 'came', 'saw', 'looked', 'walked', 'ran',
            'stood', 'sat', 'spoke', 'told', 'asked', 'replied', 'thought',
            'felt', 'knew', 'wanted', 'needed', 'took', 'gave', 'made'
        ]);
        return commonVerbs.has(word.toLowerCase());
    }

    // Check if name has a title
    hasTitle(name) {
        const titles = ['dr', 'mr', 'mrs', 'ms', 'prof', 'professor', 'captain', 'doctor', 'sir', 'lord', 'lady'];
        return titles.some(title => 
            name.toLowerCase().startsWith(title + '.') || 
            name.toLowerCase().startsWith(title + ' ')
        );
    }

    // Check if name is common
    isCommonName(name) {
        const commonNames = new Set([
            'john', 'jane', 'mary', 'james', 'sarah', 'michael', 'emily', 'david',
            'lisa', 'robert', 'susan', 'william', 'karen', 'richard', 'nancy',
            'charles', 'betty', 'thomas', 'helen', 'christopher', 'sandra'
        ]);
        
        const firstPart = name.split(' ')[0].toLowerCase();
        return commonNames.has(firstPart);
    }

    // Infer role from context
    inferRoleFromContext(name, text) {
        const lowerText = text.toLowerCase();
        const lowerName = name.toLowerCase();
        
        const rolePatterns = {
            'Protagonist': ['hero', 'main character', 'protagonist'],
            'Antagonist': ['villain', 'enemy', 'antagonist', 'evil'],
            'Mentor': ['teacher', 'mentor', 'wise', 'old man', 'guide'],
            'Love Interest': ['lover', 'beloved', 'sweetheart', 'romantic'],
            'Friend': ['friend', 'buddy', 'companion', 'ally'],
            'Family': ['father', 'mother', 'brother', 'sister', 'son', 'daughter']
        };
        
        for (const [role, keywords] of Object.entries(rolePatterns)) {
            for (const keyword of keywords) {
                if (lowerText.includes(keyword) && lowerText.includes(lowerName)) {
                    return role;
                }
            }
        }
        
        return '';
    }

    // Excluded words (common non-name capitalized words)
    isExcludedWord(word) {
        const excludedWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
            'of', 'with', 'by', 'as', 'is', 'was', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
            'this', 'that', 'these', 'those', 'here', 'there', 'when', 'where', 'why', 'how',
            'what', 'which', 'who', 'whom', 'whose', 'if', 'then', 'else', 'while', 'until',
            'though', 'although', 'because', 'since', 'so', 'thus', 'therefore', 'however',
            'nevertheless', 'nonetheless', 'yes', 'no', 'not', 'very', 'just', 'only',
            'all', 'some', 'any', 'every', 'each', 'both', 'either', 'neither'
        ]);
        return excludedWords.has(word);
    }

    // Common non-name capitalized words
    isCommonNonName(word) {
        const commonNonNames = [
            'The', 'A', 'An', 'And', 'But', 'Or', 'For', 'Nor', 'So', 'Yet', 'As',
            'Suddenly', 'Meanwhile', 'However', 'Therefore', 'Nevertheless', 'Additionally',
            'Fortunately', 'Unfortunately', 'Importantly', 'Interestingly'
        ];
        return commonNonNames.includes(word);
    }

    buildCharacterStoryConnections(stories, characters) {
        this.characterStoryConnections.clear();
        
        characters.forEach(character => {
            const characterStories = [];
            const characterName = character.name.toLowerCase();
            
            stories.forEach(story => {
                const storyContent = (story.content || '').toLowerCase();
                const storyTitle = (story.title || '').toLowerCase();
                
                if (storyContent.includes(characterName) || storyTitle.includes(characterName)) {
                    characterStories.push({
                        storyId: story.id,
                        title: story.title || 'Untitled',
                        mentionCount: this.countCharacterMentions(storyContent, characterName),
                        lastUpdated: story.updatedAt
                    });
                }
            });
            
            this.characterStoryConnections.set(character.id, {
                character: character,
                stories: characterStories.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)),
                totalMentions: characterStories.reduce((sum, s) => sum + s.mentionCount, 0)
            });
        });
        
        console.log('🔬 ML: Built character-story connections:', this.characterStoryConnections);
    }

    countCharacterMentions(storyContent, characterName) {
        const regex = new RegExp(`\\b${characterName}\\b`, 'gi');
        const matches = storyContent.match(regex);
        return matches ? matches.length : 0;
    }

    hasStoriesWithCharacters(stories, characters) {
        return Array.from(this.characterStoryConnections.values())
            .some(connection => connection.stories.length > 0);
    }

    getCharactersInStories() {
        return Array.from(this.characterStoryConnections.values())
            .filter(connection => connection.stories.length > 0)
            .map(connection => connection.character);
    }

    getStoriesWithCharacters() {
        const storyMap = new Map();
        
        this.characterStoryConnections.forEach((connection, characterId) => {
            connection.stories.forEach(story => {
                if (!storyMap.has(story.storyId)) {
                    storyMap.set(story.storyId, {
                        story: this.loadStories().find(s => s.id === story.storyId),
                        characters: []
                    });
                }
                storyMap.get(story.storyId).characters.push(connection.character);
            });
        });
        
        return Array.from(storyMap.values());
    }

    generateIntegratedPrompt(stories, characters, relationships, patterns) {
        const charactersInStories = this.getCharactersInStories();
        const storiesWithCharacters = this.getStoriesWithCharacters();
        
        if (charactersInStories.length === 0 || storiesWithCharacters.length === 0) {
            return this.generateRelationshipPrompt(characters, relationships, patterns);
        }
        
        const activeCharacter = charactersInStories[0];
        const characterStories = this.characterStoryConnections.get(activeCharacter.id).stories;
        
        const promptTemplates = [
            `Continue ${activeCharacter.name}'s story from where you left off, exploring new challenges that test their ${activeCharacter.role ? activeCharacter.role.toLowerCase() : 'character'}`,
            `Write a new chapter for ${activeCharacter.name} that builds upon their established personality and relationships`,
            `Create a scene where ${activeCharacter.name} faces a situation that contrasts with their previous experiences`,
            `Explore ${activeCharacter.name}'s untapped potential by placing them in an unexpected scenario`,
            `Write about a moment of growth or change for ${activeCharacter.name}, considering their established traits`
        ];
        
        const characterRelationships = relationships.filter(rel => 
            rel.from === activeCharacter.id || rel.to === activeCharacter.id
        );
        
        if (characterRelationships.length > 0) {
            const relationship = characterRelationships[0];
            const otherCharId = relationship.from === activeCharacter.id ? relationship.to : relationship.from;
            const otherCharacter = characters.find(c => c.id === otherCharId);
            
            if (otherCharacter) {
                promptTemplates.push(
                    `Deepen the ${relationship.type} between ${activeCharacter.name} and ${otherCharacter.name} through a shared challenge`,
                    `Write about a turning point in ${activeCharacter.name} and ${otherCharacter.name}'s ${relationship.type} relationship`,
                    `Explore how ${activeCharacter.name}'s relationship with ${otherCharacter.name} influences their personal journey`
                );
            }
        }
        
        return promptTemplates[Math.floor(Math.random() * promptTemplates.length)];
    }

    generateStoryDrivenPrompt(stories, characters, patterns) {
        const storiesWithCharacters = this.getStoriesWithCharacters();
        
        if (storiesWithCharacters.length === 0) {
            return this.generateStoryContinuationPrompt(stories, patterns);
        }
        
        const recentStory = storiesWithCharacters[0];
        const storyThemes = this.extractThemesFromText(recentStory.story.content);
        const mainTheme = storyThemes.length > 0 ? storyThemes[0] : 'personal journey';
        
        const characterNames = recentStory.characters.map(c => c.name).join(' and ');
        
        const prompts = [
            `Continue the story of ${characterNames}, exploring deeper themes of ${mainTheme.toLowerCase()}`,
            `Write a new scene featuring ${characterNames} that introduces a fresh perspective on ${mainTheme.toLowerCase()}`,
            `Create a parallel storyline for ${characterNames} that complements their established narrative`,
            `Explore what happens when ${characterNames} encounter a situation that challenges their usual dynamics`
        ];
        
        return prompts[Math.floor(Math.random() * prompts.length)];
    }

    analyzeWritingPatterns() {
        const stories = this.loadStories();
        const characters = this.loadCharacters();
        
        this.buildCharacterStoryConnections(stories, characters);
        
        const patterns = {
            totalStories: stories.length,
            totalCharacters: characters.length,
            charactersInStories: this.getCharactersInStories().length,
            storiesWithCharacters: this.getStoriesWithCharacters().length,
            averageStoryLength: this.calculateAverageStoryLength(stories),
            commonThemes: this.extractCommonThemes(stories),
            characterUsage: this.analyzeCharacterUsage(stories, characters),
            relationshipDynamics: this.analyzeRelationshipDynamics(characters),
            unexploredAreas: this.identifyUnexploredAreas(stories, characters),
            characterStoryIntegration: this.analyzeCharacterStoryIntegration()
        };
        
        return patterns;
    }

    analyzeCharacterStoryIntegration() {
        const integration = {
            connectedCharacters: this.getCharactersInStories().length,
            connectedStories: this.getStoriesWithCharacters().length,
            integrationRate: 0,
            mostActiveCharacter: null,
            richestStory: null
        };
        
        const totalCharacters = this.loadCharacters().length;
        const totalStories = this.loadStories().length;
        
        if (totalCharacters > 0) {
            integration.integrationRate = Math.round((integration.connectedCharacters / totalCharacters) * 100);
        }
        
        let maxMentions = 0;
        this.characterStoryConnections.forEach((connection, characterId) => {
            if (connection.totalMentions > maxMentions) {
                maxMentions = connection.totalMentions;
                integration.mostActiveCharacter = connection.character;
            }
        });
        
        const storiesWithChars = this.getStoriesWithCharacters();
        let maxCharacters = 0;
        storiesWithChars.forEach(item => {
            if (item.characters.length > maxCharacters) {
                maxCharacters = item.characters.length;
                integration.richestStory = item.story;
            }
        });
        
        return integration;
    }

    identifyUnexploredAreas(stories, characters) {
        const areas = [];
        const integration = this.analyzeCharacterStoryIntegration();
        
        const unlinkedCharacters = characters.filter(char => 
            !Array.from(this.characterStoryConnections.keys()).includes(char.id) || 
            this.characterStoryConnections.get(char.id).stories.length === 0
        );
        
        unlinkedCharacters.slice(0, 2).forEach(character => {
            areas.push({
                type: 'unlinked_character',
                character: character.name,
                suggestion: `Write a story featuring ${character.name} to bring them into your narrative world`
            });
        });
        
        const charactersInStories = this.getCharactersInStories();
        if (charactersInStories.length >= 2) {
            const relationships = this.loadRelationships();
            const exploredPairs = new Set();
            relationships.forEach(rel => {
                exploredPairs.add(`${rel.from}-${rel.to}`);
            });
            
            for (let i = 0; i < charactersInStories.length; i++) {
                for (let j = i + 1; j < charactersInStories.length; j++) {
                    const pairKey = `${charactersInStories[i].id}-${charactersInStories[j].id}`;
                    const reverseKey = `${charactersInStories[j].id}-${charactersInStories[i].id}`;
                    
                    if (!exploredPairs.has(pairKey) && !exploredPairs.has(reverseKey)) {
                        areas.push({
                            type: 'potential_relationship',
                            characters: [charactersInStories[i].name, charactersInStories[j].name],
                            suggestion: `Define the relationship between ${charactersInStories[i].name} and ${charactersInStories[j].name} and explore it in a story`
                        });
                        break;
                    }
                }
                if (areas.length >= 3) break;
            }
        }
        
        return areas.slice(0, 3);
    }

    loadStories() {
        try {
            return JSON.parse(localStorage.getItem('stories') || '[]');
        } catch (error) {
            console.error('🔬 ML: Error loading stories:', error);
            return [];
        }
    }

    loadCharacters() {
        try {
            return JSON.parse(localStorage.getItem('characters') || '[]');
        } catch (error) {
            console.error('🔬 ML: Error loading characters:', error);
            return [];
        }
    }

    loadRelationships() {
        try {
            return JSON.parse(localStorage.getItem('relationships') || '[]');
        } catch (error) {
            console.error('🔬 ML: Error loading relationships:', error);
            return [];
        }
    }

    calculateAverageStoryLength(stories) {
        if (stories.length === 0) return 0;
        const totalWords = stories.reduce((sum, story) => sum + (story.wordCount || 0), 0);
        return Math.round(totalWords / stories.length);
    }

    extractCommonThemes(stories) {
        const themes = {};
        const themeKeywords = {
            'love': 'Romance', 'romantic': 'Romance', 'heart': 'Romance',
            'family': 'Family', 'parent': 'Family', 'sibling': 'Family',
            'friend': 'Friendship', 'loyalty': 'Friendship', 'betrayal': 'Friendship',
            'power': 'Power', 'control': 'Power', 'authority': 'Power',
            'identity': 'Identity', 'self': 'Identity', 'discovery': 'Identity',
            'redemption': 'Redemption', 'forgiveness': 'Redemption', 'second chance': 'Redemption',
            'sacrifice': 'Sacrifice', 'loss': 'Sacrifice', 'choice': 'Sacrifice'
        };

        stories.forEach(story => {
            const content = (story.content || '').toLowerCase();
            Object.entries(themeKeywords).forEach(([keyword, theme]) => {
                if (content.includes(keyword)) {
                    themes[theme] = (themes[theme] || 0) + 1;
                }
            });
        });

        return Object.entries(themes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([theme]) => theme);
    }

    extractThemesFromText(text) {
        const themes = [];
        const themeKeywords = {
            'love': 'Romance', 'romantic': 'Romance',
            'family': 'Family', 'parent': 'Family',
            'friend': 'Friendship', 'loyalty': 'Friendship',
            'power': 'Power', 'control': 'Power',
            'identity': 'Identity', 'self': 'Identity',
            'redemption': 'Redemption', 'forgiveness': 'Redemption',
            'sacrifice': 'Sacrifice', 'loss': 'Sacrifice'
        };

        const content = (text || '').toLowerCase();
        Object.entries(themeKeywords).forEach(([keyword, theme]) => {
            if (content.includes(keyword) && !themes.includes(theme)) {
                themes.push(theme);
            }
        });

        return themes;
    }

    analyzeCharacterUsage(stories, characters) {
        const usage = {};
        
        characters.forEach(character => {
            const name = character.name.toLowerCase();
            let appearanceCount = 0;
            
            stories.forEach(story => {
                const content = (story.content || '').toLowerCase();
                if (content.includes(name)) {
                    appearanceCount++;
                }
            });
            
            if (appearanceCount > 0) {
                usage[character.name] = {
                    count: appearanceCount,
                    role: character.role || 'Unknown'
                };
            }
        });
        
        return usage;
    }

    analyzeRelationshipDynamics(characters) {
        const relationships = this.loadRelationships();
        const dynamics = {};
        
        relationships.forEach(rel => {
            const char1 = characters.find(c => c.id === rel.from);
            const char2 = characters.find(c => c.id === rel.to);
            
            if (char1 && char2) {
                const key = `${char1.name} & ${char2.name}`;
                dynamics[key] = {
                    type: rel.type,
                    status: rel.status,
                    description: rel.description
                };
            }
        });
        
        return dynamics;
    }

    generateRelationshipPrompt(characters, relationships, patterns) {
        if (relationships.length === 0) {
            return this.generateCharacterIntroductionPrompt(characters);
        }
        
        const relationship = relationships[Math.floor(Math.random() * relationships.length)];
        const char1 = characters.find(c => c.id === relationship.from);
        const char2 = characters.find(c => c.id === relationship.to);
        
        if (!char1 || !char2) {
            return this.generateThematicPrompt(patterns);
        }
        
        const promptTemplates = [
            `Write about a moment that tests the ${relationship.type} between ${char1.name} and ${char2.name}`,
            `Explore how ${char1.name} and ${char2.name}'s ${relationship.type} relationship changes when faced with a difficult choice`,
            `Describe a secret that ${char1.name} has been keeping from ${char2.name} and how it affects their ${relationship.type}`,
            `Write a scene where ${char1.name} must choose between their ${relationship.type} with ${char2.name} and their personal goals`,
            `How does the ${relationship.status} ${relationship.type} between ${char1.name} and ${char2.name} evolve when outside pressures mount?`
        ];
        
        const conflictIdeas = [
            'a mysterious discovery', 'an unexpected betrayal', 'a shared danger', 
            'a moral dilemma', 'a forgotten promise', 'a hidden truth'
        ];
        
        const conflict = conflictIdeas[Math.floor(Math.random() * conflictIdeas.length)];
        const template = promptTemplates[Math.floor(Math.random() * promptTemplates.length)];
        
        return template.replace('{conflict}', conflict);
    }

    generateStoryContinuationPrompt(stories, patterns) {
        const recentStory = stories[0];
        const themes = patterns.commonThemes;
        const mainTheme = themes.length > 0 ? themes[0] : 'personal growth';
        
        const prompts = [
            `Continue your story exploring ${mainTheme.toLowerCase()} through a new challenge`,
            `Write a sequel scene that deepens the themes of ${mainTheme.toLowerCase()} from your previous work`,
            `Create a new story that builds upon the ${mainTheme.toLowerCase()} themes you've been developing`,
            `Explore a different perspective on ${mainTheme.toLowerCase()} through a new character or situation`
        ];
        
        return prompts[Math.floor(Math.random() * prompts.length)];
    }

    generateCharacterIntroductionPrompt(characters) {
        const character = characters[Math.floor(Math.random() * characters.length)];
        
        const prompts = [
            `Write a story introducing ${character.name}, ${character.role ? `a ${character.role}` : 'a compelling character'}`,
            `Explore a day in the life of ${character.name} ${character.role ? `, the ${character.role}` : ''}`,
            `Write about a pivotal moment that defines ${character.name}'s character`,
            `Create a story where ${character.name} faces a challenge that reveals their true nature`
        ];
        
        return prompts[Math.floor(Math.random() * prompts.length)];
    }

    generateThematicPrompt(patterns) {
        const themes = ['self-discovery', 'redemption', 'sacrifice', 'betrayal', 'hope', 'identity'];
        const theme = themes[Math.floor(Math.random() * themes.length)];
        
        return `Write a story exploring themes of ${theme} through character relationships and personal growth`;
    }
}

// Create global instance
const mlAnalyzer = new MLAnalyzer();